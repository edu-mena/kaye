import { useCallback, useEffect, useMemo, useState } from 'react'
import { flushSync } from 'react-dom'
import { useTranslation } from 'react-i18next'
import { Navigate, useSearchParams } from 'react-router'
import { AppLoading } from '../../components/AppLoading'
import { Icon } from '../../components/icons'
import { Button } from '../../components/ui/Button'
import { ACCOUNTS } from '../../data/account'
import { useCareers } from '../../data/queries'
import type { EducationLevel } from '../../data/types'
import { submitSignup } from '../../data/waitlist'
import { safeNext } from '../../lib/ui'
import { useVoice } from '../../lib/useVoice'
import { VOICES } from '../../lib/voices'
import { beginSignIn, getAccount } from '../../state/accountSync'
import { userActions, useUser } from '../../state/userStore'
import {
  CURRENT_YEAR,
  EMPTY_DRAFT,
  buildSteps,
  canContinue,
  needsGuardian,
  stageOf,
  stepCopy,
  spokenText,
  stepKey,
  toDiscovery,
  type Draft,
  type Step,
} from './flow'
import { PlanScreen } from './PlanScreen'
import { StepFooter, StepScreen } from './StepScreens'

const DRAFT_KEY = 'kaye.onboarding'
const STAGES = [0, 1, 2] as const
/** These screens bring their own way forward. */
const OWN_FOOTER = new Set<Step['id']>(['areaCareer', 'building', 'signup'])

function loadDraft(): Draft {
  try {
    const saved = sessionStorage.getItem(DRAFT_KEY)
    return saved ? { ...EMPTY_DRAFT, ...(JSON.parse(saved) as Partial<Draft>) } : EMPTY_DRAFT
  } catch {
    // Blocked storage or a corrupted value: the conversation just starts over.
    return EMPTY_DRAFT
  }
}

function saveDraft(draft: Draft | null) {
  try {
    if (draft) sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft))
    else sessionStorage.removeItem(DRAFT_KEY)
  } catch {
    // Not critical: a reload would start the conversation over.
  }
}

function ProgressBars({ step, steps }: { step: Step; steps: Step[] }) {
  const { t } = useTranslation()
  const current = stageOf(step)
  const shares = STAGES.map((stage) => {
    if (stage !== current) return stage < current ? 1 : 0
    const own = steps.filter((item) => stageOf(item) === stage)
    return (own.findIndex((item) => stepKey(item) === stepKey(step)) + 1) / own.length
  })
  const overall = shares.reduce((sum, share) => sum + share, 0) / STAGES.length

  return (
    <div className="flex-1">
      <progress value={overall} className="sr-only">
        {t('onboarding.progress')}
      </progress>
      <div aria-hidden="true" className="flex gap-1.5">
        {shares.map((share, index) => (
          <span key={STAGES[index]} className="h-2 flex-1 overflow-hidden rounded-full bg-ash-200">
            <span
              className="block h-full rounded-full bg-blue transition-[width] duration-500 ease-out"
              style={{ width: `${share * 100}%` }}
            />
          </span>
        ))}
      </div>
    </div>
  )
}

/** Back from Google's login, the onboarding shows the plan it had prepared. */
const PLAN = 'plano'

function planPath(next: string | null): string {
  return `/entrar?${PLAN}=1${next ? `&next=${encodeURIComponent(next)}` : ''}`
}

/** The first visit: a short conversation that adapts to each answer and ends in the sign-in. */
export default function OnboardingPage() {
  const { t, i18n } = useTranslation()
  const [params] = useSearchParams()
  const nextPath = safeNext(params.get('next'))
  const { profile } = useUser()
  const { data: careers } = useCareers()
  const [draft, setDraft] = useState(loadDraft)
  const [finished, setFinished] = useState(false)
  const { speaking, say, stop } = useVoice()
  const voices = VOICES[i18n.language] ?? []
  const voice = voices.find((item) => item.id === draft.voice) ?? voices[0]

  const change = useCallback((patch: Partial<Draft>) => {
    setDraft((current) => {
      const updated = { ...current, ...patch }
      saveDraft(updated)
      return updated
    })
  }, [])

  const steps = useMemo(() => buildSteps(draft, careers ?? []), [draft, careers])
  const index = Math.max(
    steps.findIndex((item) => stepKey(item) === draft.step),
    0,
  )
  const step = steps[index] ?? steps[0]

  const goTo = useCallback(
    (target: Step | undefined) => {
      if (target) change({ step: stepKey(target) })
    },
    [change],
  )
  const next = useCallback(() => {
    // Read the steps again: the answer just given may have changed what comes next.
    setDraft((current) => {
      const list = buildSteps(current, careers ?? [])
      const position = list.findIndex((item) => stepKey(item) === current.step)
      const following = list[position + 1]
      if (!following) return current
      const updated = { ...current, step: stepKey(following) }
      saveDraft(updated)
      return updated
    })
  }, [careers])
  /** Leaving the contact screen sends it at once, so it is kept even if the person stops there. */
  const continueStep = () => {
    if (step?.id === 'contact') {
      void submitSignup({
        name: draft.name.trim(),
        email: draft.email.trim(),
        whatsapp: draft.whatsapp.trim(),
        consent: draft.contactConsent,
        website: '',
        source: 'onboarding',
      })
    }
    next()
  }
  // The plan is being put together only once: going back jumps over that screen.
  const previous = steps[index - 1]?.id === 'building' ? steps[index - 2] : steps[index - 1]

  const copy = step ? stepCopy(step, draft, t) : null
  const speech = step ? spokenText(step, draft, t) : ''
  const key = step ? stepKey(step) : ''

  useEffect(() => {
    // Browsers only let a page speak after the first tap, so the welcome stays silent.
    // The contact screen has no recorded sentence: the guide stays silent there.
    if (key === 'welcome' || key === 'contact' || !draft.voiceOn || !voice) {
      stop()
      return
    }
    say(speech, voice.id)
  }, [key, speech, draft.voiceOn, voice, say, stop])

  function finish() {
    const liked = Object.values(draft.answers).flatMap((area) =>
      area.reaction === 'yes' && area.career ? [area.career] : [],
    )
    stop()
    // Before the profile exists: with it and without this, the page would leave for the app.
    flushSync(() => setFinished(true))
    saveDraft(null)
    userActions.completeOnboarding(
      {
        name: draft.name.trim(),
        birthYear: Number(draft.birthYear),
        province: draft.province,
        education: draft.education as EducationLevel,
        guardianInformed: needsGuardian(draft, CURRENT_YEAR) && draft.guardian,
      },
      toDiscovery(draft),
      liked,
    )
    // With accounts, Google comes back here to show the plan, then to what the person had asked for.
    // Someone who already signed in (a new account that came through "Entrar") has no need to go again.
    if (ACCOUNTS && getAccount().status !== 'signedIn') beginSignIn(planPath(nextPath))
  }

  if (finished || (profile && params.has(PLAN))) return <PlanScreen next={nextPath} />
  if (profile) return <Navigate to={nextPath ?? '/'} replace />
  if (!careers || !step || !copy) return <AppLoading />

  return (
    <div className="flex min-h-dvh flex-col bg-surface">
      {step.id !== 'welcome' && (
        <div className="sticky top-0 z-10 bg-surface px-2 py-2">
          <div className="mx-auto flex w-full max-w-2xl items-center gap-2">
            <button
              type="button"
              aria-label={t('common.back')}
              onClick={() => goTo(previous)}
              className="grid size-11 shrink-0 place-items-center rounded-full text-night hover:bg-ash-100"
            >
              <Icon name="arrowLeft" className="size-5" />
            </button>
            <ProgressBars step={step} steps={steps} />
            <button
              type="button"
              aria-pressed={draft.voiceOn}
              aria-label={t('onboarding.voiceToggle')}
              onClick={() => change({ voiceOn: !draft.voiceOn })}
              className="grid size-11 shrink-0 place-items-center rounded-full text-night hover:bg-ash-100"
            >
              <Icon name={draft.voiceOn ? 'volume' : 'volumeOff'} className="size-5" />
            </button>
          </div>
        </div>
      )}

      <main
        key={key}
        className="mx-auto flex w-full max-w-2xl flex-1 animate-step-in flex-col justify-center-safe overflow-x-clip px-4 pt-4 pb-6"
      >
        <StepScreen
          step={step}
          draft={draft}
          change={change}
          careers={careers}
          next={next}
          heading={copy}
          speaking={speaking}
          voice={voice?.id ?? null}
          onFinish={finish}
        />
      </main>

      {!OWN_FOOTER.has(step.id) && (
        <StepFooter>
          <Button size="lg" className="w-full" disabled={!canContinue(step, draft)} onClick={continueStep}>
            {step.id === 'welcome' ? t('onboarding.letsGo') : t('common.continue')}
          </Button>
        </StepFooter>
      )}
    </div>
  )
}
