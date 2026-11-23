import { useCallback, useDeferredValue, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { Icon } from '../../components/icons'
import { Button } from '../../components/ui/Button'
import { ProgressBar } from '../../components/ui/ProgressBar'
import { useCareers, useCvExamples, useSkills } from '../../data/queries'
import type { CvData, CvDocument } from '../../data/types'
import { applyCvSuggestions } from '../../domain/cvFill'
import { cvStrength } from '../../domain/cvStrength'
import { activeCv, userActions, useUser } from '../../state/userStore'
import { ScaledSheet } from './CvSheet'
import { CvStrengthCard } from './CvStrengthCard'
import { StepBody } from './CvWizardSteps'
import { useCareerTips } from './useCareerTips'
import { useCvSuggestions } from './useCvSuggestions'
import { STEP_OF, STEPS, type Step } from './wizardFlow'

/** A new question, a new start: the screen reader reads it and the keyboard continues from it. */
const focusOnMount = (node: HTMLElement | null) => node?.focus()

/** A CV that starts already made: one question per screen, the CV changing beside it. */
export default function CvWizardPage() {
  const document = activeCv(useUser())

  useEffect(() => {
    if (!document) userActions.ensureCv()
  }, [document])

  // The key gives each CV fresh fields, as in the editor.
  return document && <Wizard key={document.id} document={document} />
}

/** Starts the CV from what the app knows, once, as soon as that data is there. It never replaces what is written. */
function useAutofill(document: CvDocument, onFilled: (cv: CvData) => void) {
  const careers = useCareers()
  const skills = useSkills()
  const examples = useCvExamples()
  const suggestions = useCvSuggestions(document.cv, document.target)
  // Wait for the catalogue (the career's name comes from it); with no network there is nothing to wait for,
  // and the CV still starts from the profile.
  const settled = [careers, skills, examples].every((query) => !query.isPending)
  const ready = settled || !navigator.onLine

  useEffect(() => {
    if (document.autofilled || !ready) return
    const fresh = suggestions.filter((item) => !item.replaces)
    const filled = applyCvSuggestions(document.cv, fresh)
    onFilled(filled)
    userActions.autofillCv(filled)
  }, [document, ready, suggestions, onFilled])
}

function Wizard({ document }: { document: CvDocument }) {
  const { t } = useTranslation()
  const { photo } = useUser()
  const { cv } = document
  const [index, setIndex] = useState(0)
  // Points gained on the step just left; null when going back.
  const [gain, setGain] = useState<number | null>(null)
  const scoreAtStart = useRef(cvStrength(cv).score)
  const preview = useDeferredValue(document)
  const { sample } = useCareerTips(cv, document.target)
  const step = STEPS[index] as Step
  const last = index === STEPS.length - 1
  // What the guide filled in is the start, not something the person earned: the points count from there.
  useAutofill(
    document,
    useCallback((filled: CvData) => {
      scoreAtStart.current = cvStrength(filled).score
    }, []),
  )

  const go = (next: number) => {
    const score = cvStrength(cv).score
    setGain(next > index ? score - scoreAtStart.current : null)
    scoreAtStart.current = score
    setIndex(Math.min(STEPS.length - 1, Math.max(0, next)))
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 flex items-center gap-3">
        {index === 0 ? (
          <Link
            to="/cv"
            aria-label={t('cv.title')}
            className="grid size-10 place-items-center rounded-full text-night hover:bg-ash-100"
          >
            <Icon name="close" className="size-5" />
          </Link>
        ) : (
          <Button
            variant="ghost"
            aria-label={t('cv.wizBack')}
            className="!px-3"
            onClick={() => go(index - 1)}
          >
            <span aria-hidden="true" className="text-xl">
              ←
            </span>
          </Button>
        )}
        {/* The segments are for the eyes; the progress bar is what the screen reader hears. */}
        <ol aria-hidden="true" className="flex min-w-0 flex-1 gap-1.5">
          {STEPS.map((name, position) => (
            <li
              key={name}
              className={`h-2 flex-1 rounded-full ${position <= index ? 'bg-success' : 'bg-ash-200'}`}
            />
          ))}
        </ol>
        <ProgressBar
          className="sr-only"
          value={(index + 1) / STEPS.length}
          label={t('cv.wizStepOf', { current: index + 1, total: STEPS.length })}
        />
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <section aria-label={t('cv.wizTitle')} className="min-w-0 space-y-6">
          <div className="text-center">
            <h1
              key={step}
              ref={focusOnMount}
              tabIndex={-1}
              className="text-2xl font-semibold text-balance text-night outline-none sm:text-3xl"
            >
              {t(`cv.wiz_${step}`)}
            </h1>
            <p className="mt-2 text-sm font-light text-copy">{t(`cv.wizHelp_${step}`)}</p>
          </div>

          <p
            aria-live="polite"
            className="min-h-6 rounded-2xl bg-ash-100 px-4 py-2 text-center text-sm font-light text-night empty:hidden"
          >
            {index === 0 && document.autofilled
              ? t('cv.wizPrefilled')
              : gain === null
                ? ''
                : gain > 0
                  ? t('cv.wizReaction', { count: gain })
                  : t('cv.wizReactionNone')}
          </p>

          <StepBody step={step} document={document} />

          <CvStrengthCard cv={cv} onPick={(key) => go(STEPS.indexOf(STEP_OF[key]))} />

          {!last && (
            <div className="space-y-2">
              <Button size="lg" className="w-full" onClick={() => go(index + 1)}>
                {t('cv.wizNext')}
              </Button>
              {step !== 'template' && (
                <Button variant="ghost" className="w-full" onClick={() => go(index + 1)}>
                  {t('cv.wizSkip')}
                </Button>
              )}
            </div>
          )}
        </section>

        {/* On a phone the CV is under the question; on a wide screen it stays beside it. */}
        <div className="min-w-0">
          <div className="lg:sticky lg:top-6 lg:max-h-[calc(100dvh-3rem)] lg:overflow-y-auto">
            <h2 className="mb-4 text-base font-semibold text-night">{t('cv.preview')}</h2>
            <ScaledSheet
              cv={preview.cv}
              template={preview.template}
              style={preview.style}
              photo={photo}
              arrangement={preview.arrangement}
              sample={sample}
              fit="content"
              className="rounded-card shadow-card"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
