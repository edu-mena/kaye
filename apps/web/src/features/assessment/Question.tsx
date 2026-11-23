import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import { Icon, type IconName } from '../../components/icons'
import { Button } from '../../components/ui/Button'
import { ProgressBar } from '../../components/ui/ProgressBar'
import type { AssessmentQuestion, Likert, RiasecKey } from '../../data/types'
import { isAnswered } from '../../domain/riasec'
import { userActions, useUser } from '../../state/userStore'
import { useTestProgress } from '../../state/useTestProgress'
import { TestParts } from './TestParts'

const SCALE: Likert[] = [1, 2, 3, 4, 5]

const CHOICE =
  'flex items-center gap-3 rounded-2xl border px-4 py-4 text-left text-sm font-normal transition-colors'
const chosen = (picked: boolean) =>
  picked
    ? 'border-blue bg-blue text-white'
    : 'border-line bg-surface text-night hover:border-ash-300 hover:bg-ash-100'
const bubble = (picked: boolean) => (picked ? 'bg-white text-blue' : 'bg-ash-100 text-night')

type QuestionProps = { questions: AssessmentQuestion[]; index: number; onMove: (index: number) => void }

/** One step of part 1: the progress, the question (a statement or a situation) and the way back. */
export function Question({ questions, index, onMove }: QuestionProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { answers, choices } = useUser()
  const { strengthsDone } = useTestProgress()
  const question = questions[index]
  if (!question) return null

  const isLast = index === questions.length - 1
  const allAnswered = questions.every((item) => isAnswered(item, answers, choices))

  function next() {
    if (!isLast) onMove(index + 1)
  }

  function finish() {
    userActions.completeAssessment()
    // Part 2 next, unless it is already done (an old test redone).
    navigate(strengthsDone ? '/teste/resultado' : '/teste/valencias')
  }

  return (
    <div className="mx-auto max-w-xl">
      <TestParts current={1} />
      <div className="mb-8">
        <p className="mb-2 text-xs font-light text-muted">
          {t('assessment.progress', { current: index + 1, total: questions.length })}
        </p>
        <ProgressBar value={(index + 1) / questions.length} label={t('assessment.title')} />
      </div>

      <fieldset key={question.id} className="rise">
        {question.kind === 'statement' ? (
          <StatementQuestion
            question={question}
            current={answers[question.id]}
            onPick={(value) => {
              userActions.answer(question.id, value)
              next()
            }}
          />
        ) : (
          <SituationQuestion
            question={question}
            current={choices[question.id]}
            onPick={(dimension) => {
              userActions.choose(question.id, dimension)
              next()
            }}
          />
        )}
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

type StatementProps = {
  question: Extract<AssessmentQuestion, { kind: 'statement' }>
  current: Likert | undefined
  onPick: (value: Likert) => void
}

/** "Quanto gostas de…": a statement and the five steps from nothing to a lot. */
function StatementQuestion({ question, current, onPick }: StatementProps) {
  const { t } = useTranslation()
  return (
    <>
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
            onClick={() => onPick(value)}
            className={`${CHOICE} gap-4 ${chosen(current === value)}`}
          >
            <span
              aria-hidden="true"
              className={`grid size-8 shrink-0 place-items-center rounded-full text-sm font-semibold ${bubble(current === value)}`}
            >
              {value}
            </span>
            {t(`assessment.scale${value}`)}
          </button>
        ))}
      </div>
    </>
  )
}

type SituationProps = {
  question: Extract<AssessmentQuestion, { kind: 'situation' }>
  current: RiasecKey | undefined
  onPick: (dimension: RiasecKey) => void
}

/** A situation from daily life and one card per way of reacting: the person picks the one that is most like them. */
function SituationQuestion({ question, current, onPick }: SituationProps) {
  const { t } = useTranslation()
  return (
    <>
      <legend className="mb-6 text-2xl leading-snug font-extrabold text-night sm:text-3xl">
        <span className="mb-2 block text-sm font-light text-muted">
          {t(`assessment.context_${question.context}`)} · {t('assessment.situationPrompt')}
        </span>
        {question.text}
      </legend>
      <div className="grid gap-2 sm:grid-cols-2">
        {question.options.map((option) => {
          const picked = current === option.dimension
          return (
            <button
              key={option.dimension}
              type="button"
              aria-pressed={picked}
              onClick={() => onPick(option.dimension)}
              className={`${CHOICE} sm:flex-col sm:items-start sm:gap-4 ${chosen(picked)}`}
            >
              <span
                aria-hidden="true"
                className={`grid size-10 shrink-0 place-items-center rounded-full ${bubble(picked)}`}
              >
                <Icon name={option.icon as IconName} className="size-5" />
              </span>
              {option.text}
            </button>
          )
        })}
      </div>
    </>
  )
}
