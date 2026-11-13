import { useState, type ComponentType } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import { Icon } from '../../components/icons'
import { Button, ButtonLink } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { STRENGTH_STEPS, type StrengthStep } from '../../domain/strengths'
import { userActions, useUser } from '../../state/userStore'
import {
  ConditionsStep,
  DigitalStep,
  ExperienceStep,
  LanguagesStep,
  SoftStep,
  TradesStep,
  WorkStep,
} from './StrengthSteps'
import { TestParts } from './TestParts'

const STEPS: Record<StrengthStep, ComponentType> = {
  languages: LanguagesStep,
  digital: DigitalStep,
  trades: TradesStep,
  soft: SoftStep,
  experience: ExperienceStep,
  work: WorkStep,
  conditions: ConditionsStep,
}

/** Part 2 of the career test (/teste/valencias): one step at a time, each optional and saved as it is answered. */
export default function StrengthsPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { strengths, assessmentCompletedAt } = useUser()
  const firstOpen = STRENGTH_STEPS.findIndex((step) => !strengths.done.includes(step))
  const [index, setIndex] = useState(firstOpen === -1 ? 0 : firstOpen)
  const step = STRENGTH_STEPS[index] ?? 'languages'
  const Step = STEPS[step]
  const isLast = index === STRENGTH_STEPS.length - 1
  // The result needs part 1; without it, the end of part 2 leads there.
  const end = assessmentCompletedAt ? '/teste/resultado' : '/teste'

  const next = () => {
    userActions.saveStrengths({}, step)
    if (isLast) navigate(end)
    else setIndex(index + 1)
    window.scrollTo({ top: 0 })
  }

  return (
    <div className="mx-auto max-w-xl">
      <TestParts current={2} />
      <p className="mb-2 text-xs font-light text-muted">
        {t('strengths.progress', { current: index + 1, total: STRENGTH_STEPS.length })}
      </p>

      <Card key={step} className="rise p-5 sm:p-6">
        <h1 className="text-2xl leading-snug font-extrabold text-night">{t(`strengths.step_${step}`)}</h1>
        <p className="mt-2 mb-4 text-sm font-light text-copy">{t(`strengths.stepHint_${step}`)}</p>
        <Step />
      </Card>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <Button variant="ghost" disabled={index === 0} onClick={() => setIndex(index - 1)}>
          <Icon name="arrowLeft" className="size-4" />
          {t('assessment.previous')}
        </Button>
        <span className="flex gap-2">
          <Button variant="ghost" onClick={next}>
            {t('strengths.skip')}
          </Button>
          <Button onClick={next}>
            {isLast ? t('strengths.finish') : t('common.next')}
            <Icon name="arrowRight" className="size-4" />
          </Button>
        </span>
      </div>
      {assessmentCompletedAt && (
        <ButtonLink to="/teste/resultado" variant="ghost" size="sm" className="mt-4">
          {t('strengths.seeResultNow')}
        </ButtonLink>
      )}
    </div>
  )
}
