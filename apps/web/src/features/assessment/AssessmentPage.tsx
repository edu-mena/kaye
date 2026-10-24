import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import { Icon } from '../../components/icons'
import { QueryState } from '../../components/QueryState'
import { Button, ButtonLink } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { ProgressBar } from '../../components/ui/ProgressBar'
import { useAssessment } from '../../data/queries'
import type { AssessmentQuestion, Likert } from '../../data/types'
import { userActions, useUser } from '../../state/userStore'

const SCALE: Likert[] = [1, 2, 3, 4, 5]

export default function AssessmentPage() {
  const query = useAssessment()
  return <QueryState query={query}>{(questions) => <Assessment questions={questions} />}</QueryState>
}

function Assessment({ questions }: { questions: AssessmentQuestion[] }) {
  const { answers, assessmentCompletedAt } = useUser()
  const firstOpen = questions.findIndex((question) => answers[question.id] === undefined)
  const [index, setIndex] = useState<number | null>(null)

  if (index === null) {
    return (
      <Intro
        answered={questions.filter((question) => answers[question.id] !== undefined).length}
        completed={assessmentCompletedAt !== null}
        onStart={() => setIndex(firstOpen === -1 ? 0 : firstOpen)}
      />
    )
  }
  return <Question questions={questions} index={index} onMove={setIndex} />
}

type IntroProps = { answered: number; completed: boolean; onStart: () => void }

function Intro({ answered, completed, onStart }: IntroProps) {
  const { t } = useTranslation()
  const points = [t('assessment.point1'), t('assessment.point2'), t('assessment.point3')]

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
              <ButtonLink to="/teste/resultado" variant="onDark" size="lg">
                {t('home.seeResult')}
              </ButtonLink>
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

type QuestionProps = { questions: AssessmentQuestion[]; index: number; onMove: (index: number) => void }

function Question({ questions, index, onMove }: QuestionProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { answers } = useUser()
  const question = questions[index]
  if (!question) return null

  const current = answers[question.id]
  const isLast = index === questions.length - 1
  const allAnswered = questions.every((item) => answers[item.id] !== undefined)

  function choose(value: Likert) {
    if (!question) return
    userActions.answer(question.id, value)
    if (!isLast) onMove(index + 1)
  }

  function finish() {
    userActions.completeAssessment()
    navigate('/teste/resultado')
  }

  return (
    <div className="mx-auto max-w-xl">
      <div className="mb-8">
        <p className="mb-2 text-xs font-light text-muted">
          {t('assessment.progress', { current: index + 1, total: questions.length })}
        </p>
        <ProgressBar value={(index + 1) / questions.length} label={t('assessment.title')} />
      </div>

      <fieldset key={question.id} className="rise">
        <legend className="mb-8 text-2xl leading-snug font-extrabold text-night sm:text-3xl">
          <span className="mb-2 block text-sm font-light text-muted">{t('assessment.prompt')}</span>
          {question.text}?
        </legend>
        <div className="grid gap-2">
          {SCALE.map((value) => (
            <button
              key={value}
              type="button"
              aria-pressed={current === value}
              onClick={() => choose(value)}
              className={`flex items-center gap-4 rounded-2xl border px-4 py-4 text-left text-sm font-normal transition-colors ${
                current === value
                  ? 'border-blue bg-blue text-white'
                  : 'border-line bg-surface text-night hover:border-ash-300 hover:bg-ash-100'
              }`}
            >
              <span
                aria-hidden="true"
                className={`grid size-8 shrink-0 place-items-center rounded-full text-sm font-semibold ${
                  current === value ? 'bg-white text-blue' : 'bg-ash-100 text-night'
                }`}
              >
                {value}
              </span>
              {t(`assessment.scale${value}`)}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="mt-8 flex items-center justify-between gap-4">
        <Button variant="ghost" disabled={index === 0} onClick={() => onMove(index - 1)}>
          <Icon name="arrowLeft" className="size-4" />
          {t('assessment.previous')}
        </Button>
        {isLast && allAnswered && (
          <Button onClick={finish}>
            {t('assessment.finish')}
            <Icon name="arrowRight" className="size-4" />
          </Button>
        )}
      </div>
    </div>
  )
}
