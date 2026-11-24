import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { CheckboxField, TextAreaField } from '../../components/ui/Field'
import type { CvDocument } from '../../data/types'
import { extractKeywords, type CvKeyword } from '../../domain/cvKeywords'
import { isMinor } from '../../domain/education'
import { userActions, useUser } from '../../state/userStore'
import { NoTextError, readPdfText } from './cvPdfText'

type Source = 'pdf' | 'paste'
type Stage =
  | { name: 'ask' }
  | { name: 'fresh'; source: Source }
  | { name: 'input'; source: Source }
  | { name: 'review'; found: CvKeyword[] }
  | { name: 'done'; message: 'kaye' | 'none' | 'added' | 'nothing' }

const MAX_PDF_BYTES = 5 * 1024 * 1024

/**
 * "Já tens um CV?": reads a CV the person already has, on the device, and proposes only the skills it finds.
 * The text is never stored or sent (not even to Sentry); only the skills the person confirms go in the CV.
 */
export function CvKeywordsPanel({ document, onApplied }: { document: CvDocument; onApplied: () => void }) {
  const { t } = useTranslation()
  const { profile } = useUser()
  const [stage, setStage] = useState<Stage>({ name: 'ask' })
  const [text, setText] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [kept, setKept] = useState<Set<string>>(new Set())

  // A minor's CV gets only the minimum: this step is skipped (same rule as the rest of the filling).
  if (!profile || isMinor(profile.birthYear)) return null

  const find = (source: string) => {
    const found = extractKeywords(source).filter(
      ({ skill }) => !document.cv.skills.some((have) => have.trim().toLowerCase() === skill.toLowerCase()),
    )
    setText('')
    setKept(new Set(found.map(({ skill }) => skill)))
    setStage(found.length > 0 ? { name: 'review', found } : { name: 'done', message: 'nothing' })
  }

  const readFile = async (file: File | undefined) => {
    if (!file) return
    setError(null)
    if (file.size > MAX_PDF_BYTES) return setError(t('cv.kwTooBig'))
    try {
      find(await readPdfText(file))
    } catch (failure) {
      setError(failure instanceof NoTextError ? t('cv.kwNoText') : t('cv.kwFailed'))
    }
  }

  const apply = (found: CvKeyword[]) => {
    const chosen = found.filter(({ skill }) => kept.has(skill)).map(({ skill }) => skill)
    if (chosen.length > 0) {
      userActions.updateCv({ ...document.cv, skills: [...document.cv.skills, ...chosen] })
      onApplied()
    }
    setStage({ name: 'done', message: chosen.length > 0 ? 'added' : 'nothing' })
  }

  const toggle = (skill: string, on: boolean) => {
    const next = new Set(kept)
    if (on) next.add(skill)
    else next.delete(skill)
    setKept(next)
  }

  const restart = () => {
    setError(null)
    setStage({ name: 'ask' })
  }

  return (
    <Card className="space-y-4 p-6">
      <div>
        <h2 className="text-base font-semibold text-night">{t('cv.kwTitle')}</h2>
        <p className="mt-1 text-sm font-light text-copy">{t('cv.kwNote')}</p>
      </div>

      {stage.name === 'ask' && (
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="secondary" onClick={() => setStage({ name: 'done', message: 'kaye' })}>
            {t('cv.kwUseKaye')}
          </Button>
          <Button size="sm" variant="secondary" onClick={() => setStage({ name: 'fresh', source: 'pdf' })}>
            {t('cv.kwPdf')}
          </Button>
          <Button size="sm" variant="secondary" onClick={() => setStage({ name: 'fresh', source: 'paste' })}>
            {t('cv.kwPaste')}
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setStage({ name: 'done', message: 'none' })}>
            {t('cv.kwNone')}
          </Button>
        </div>
      )}

      {stage.name === 'fresh' && (
        <div className="space-y-3">
          <p className="text-sm font-medium text-night">{t('cv.kwFresh')}</p>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={() => setStage({ name: 'input', source: stage.source })}>
              {t('cv.kwFreshYes')}
            </Button>
            <Button size="sm" variant="ghost" onClick={restart}>
              {t('cv.kwFreshNo')}
            </Button>
          </div>
        </div>
      )}

      {stage.name === 'input' && stage.source === 'pdf' && (
        <label className="block space-y-2 text-sm font-light text-copy">
          <span className="font-medium text-night">{t('cv.kwPickPdf')}</span>
          <input
            type="file"
            accept="application/pdf"
            onChange={(event) => void readFile(event.target.files?.[0])}
            className="block w-full text-sm"
          />
        </label>
      )}

      {stage.name === 'input' && stage.source === 'paste' && (
        <div className="space-y-3">
          <TextAreaField
            label={t('cv.kwPasteLabel')}
            rows={6}
            value={text}
            onChange={(event) => setText(event.target.value)}
          />
          <Button size="sm" disabled={!text.trim()} onClick={() => find(text)}>
            {t('cv.kwRead')}
          </Button>
        </div>
      )}

      {error && (
        <p role="alert" className="text-sm text-coral">
          {error}
        </p>
      )}

      {stage.name === 'review' && (
        <div className="space-y-3">
          <p className="text-sm font-medium text-night">{t('cv.kwFound', { count: stage.found.length })}</p>
          <ul className="space-y-2">
            {stage.found.map(({ skill }) => (
              <li key={skill}>
                <CheckboxField
                  checked={kept.has(skill)}
                  onChange={(event) => toggle(skill, event.target.checked)}
                  label={skill}
                />
              </li>
            ))}
          </ul>
          <Button size="sm" onClick={() => apply(stage.found)}>
            {t('cv.kwApply', { count: kept.size })}
          </Button>
        </div>
      )}

      {stage.name === 'done' && (
        <div className="space-y-3">
          <p className="text-sm font-light text-copy">{t(`cv.kwDone_${stage.message}`)}</p>
          <Button size="sm" variant="ghost" onClick={restart}>
            {t('cv.kwAgain')}
          </Button>
        </div>
      )}
    </Card>
  )
}
