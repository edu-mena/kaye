import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Icon } from '../../components/icons'
import { QueryState } from '../../components/QueryState'
import { Button, ButtonLink } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { useAssessment } from '../../data/queries'
import type { AssessmentQuestion } from '../../data/types'
import { isAnswered } from '../../domain/riasec'
import { hasStrengths } from '../../domain/strengths'
import { userActions, useUser } from '../../state/userStore'
import { ClearStrengths } from './ClearStrengths'
import { Question } from './Question'
import { useRiasecProfile } from '../../state/useRiasecProfile'
import { useTestProgress } from '../../state/useTestProgress'

export default function AssessmentPage() {
  const query = useAssessment()
  return <QueryState query={query}>{(questions) => <Assessment questions={questions} />}</QueryState>
}

function Assessment({ questions }: { questions: AssessmentQuestion[] }) {
  const { answers, choices } = useUser()
  const { completed } = useRiasecProfile()
  const firstOpen = questions.findIndex((question) => !isAnswered(question, answers, choices))
  const [index, setIndex] = useState<number | null>(null)

  if (index === null) {
    return (
      <Intro
        answered={questions.filter((question) => isAnswered(question, answers, choices)).length}
        completed={completed}
        onStart={() => setIndex(firstOpen === -1 ? 0 : firstOpen)}
      />
    )
  }
  return <Question questions={questions} index={index} onMove={setIndex} />
}

type IntroProps = { answered: number; completed: boolean; onStart: () => void }

function Intro({ answered, completed, onStart }: IntroProps) {
  const { t } = useTranslation()
  const { strengths } = useUser()
  const progress = useTestProgress()
  const points = [
    t('assessment.point1', { count: progress.total, minutes: progress.minutes1 }),
    t('assessment.point2', { count: progress.stepsTotal, minutes: progress.minutes2 }),
    t('assessment.point3'),
  ]

  return (
    <div className="mx-auto max-w-xl">
      <Card tone="coal" className="rise p-6 sm:p-8">
        <h1 className="text-3xl leading-tight font-extrabold">{t('assessment.title')}</h1>
        <p className="mt-4 text-sm font-light text-white/80">{t('assessment.intro')}</p>
        <ul className="mt-6 space-y-2">
          {points.map((point) => (
            <li key={point} className="flex items-start gap-2 text-sm font-light">
              <Icon name="check" className="mt-0.5 size-4 shrink-0 text-white" />
              {point}
            </li>
          ))}
        </ul>
        <div className="mt-8 flex flex-wrap gap-2">
          {completed ? (
            <>
              {progress.strengthsDone ? (
                <ButtonLink to="/teste/resultado" variant="onDark" size="lg">
                  {t('home.seeResult')}
                </ButtonLink>
              ) : (
                <>
                  <ButtonLink to="/teste/valencias" variant="onDark" size="lg">
                    {t('assessment.completeStrengths')}
                  </ButtonLink>
                  <ButtonLink to="/teste/resultado" variant="onDarkOutline" size="lg">
                    {t('home.seeResult')}
                  </ButtonLink>
                </>
              )}
              <Button
                variant="ghost"
                size="lg"
                className="text-white hover:bg-white/10"
                onClick={() => {
                  userActions.restartAssessment()
                  onStart()
                }}
              >
                {t('assessment.restart')}
              </Button>
              {hasStrengths(strengths) && <ClearStrengths onDark />}
            </>
          ) : (
            <Button variant="onDark" size="lg" onClick={onStart}>
              {answered > 0 ? t('assessment.continue') : t('assessment.start')}
            </Button>
          )}
        </div>
      </Card>
    </div>
  )
}
