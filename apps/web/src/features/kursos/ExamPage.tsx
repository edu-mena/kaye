import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Navigate } from 'react-router'
import { Icon } from '../../components/icons'
import { Button, ButtonLink } from '../../components/ui/Button'
import type { ExamQuestion } from '../../data/kursos/types'
import {
  certificateCode,
  courseState,
  drawExam,
  EXAM_PASS,
  examCorrect,
  nextAttemptAt,
  scoreByUnit,
  type Answer,
} from '../../domain/kursos'
import { userActions } from '../../state/userStore'
import { ChoiceOptions } from './Blocks'
import { Reader } from './Reader'
import { percent, useActiveTime, useCourse } from './shared'

const time = (at: number) => new Date(at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

/** The final exam: questions drawn from the bank, answers hidden until it is handed in. */
export default function ExamPage() {
  const { t } = useTranslation()
  const { course, progress } = useCourse()
  const [questions, setQuestions] = useState<ExamQuestion[] | null>(null)
  const [answers, setAnswers] = useState<Answer[]>([])
  const [result, setResult] = useState<number | null>(null)
  useActiveTime(course?.id)

  useEffect(() => {
    let alive = true
    const load = async () => {
      if (!course) return
      const bank = await course.loadExam()
      if (!alive) return
      const drawn = drawExam(course, bank)
      setQuestions(drawn)
      setAnswers(drawn.map(() => null))
    }
    void load()
    return () => {
      alive = false
    }
  }, [course])

  if (!course) return <Navigate to="/kursos" replace />
  const state = courseState(course, progress.done)
  const blockedUntil = result === null ? nextAttemptAt(progress.exam) : null

  const submit = () => {
    if (!questions) return
    const right = questions.filter((question, index) => examCorrect(question, answers[index] ?? null)).length
    const score = right / questions.length
    const attempt = { at: new Date().toISOString(), score, units: scoreByUnit(questions, answers) }
    userActions.addKursoExam(course.id, attempt, score >= EXAM_PASS ? certificateCode() : undefined)
    setResult(score)
    window.scrollTo({ top: 0 })
  }

  const set = (index: number, value: Answer) =>
    setAnswers(answers.map((answer, at) => (at === index ? value : answer)))
  const answered = answers.filter((answer) => answer !== null && answer !== '').length
  const passed = result !== null && result >= EXAM_PASS

  const footer =
    result !== null ? (
      <>
        <ButtonLink to={`/kursos/${course.id}`} variant="secondary" size="sm">
          {t('kursos.back')}
        </ButtonLink>
        {passed && (
          <ButtonLink to={`/kursos/${course.id}/concluido`} size="sm">
            {t('kursos.seeCertificate')}
          </ButtonLink>
        )}
      </>
    ) : (
      <>
        <span className="text-sm text-muted">
          {answered}/{questions?.length ?? 0}
        </span>
        <Button size="sm" onClick={submit} disabled={!questions || !state.unitsDone || blockedUntil !== null}>
          {t('kursos.submit')}
        </Button>
      </>
    )

  return (
    <Reader course={course} progress={progress} title={t('kursos.exam')} share={state.share} footer={footer}>
      <h1 className="mb-2 text-2xl font-semibold text-night sm:text-3xl">{t('kursos.exam')}</h1>
      {!state.unitsDone ? (
        <p className="text-ink">{t('kursos.examLocked')}</p>
      ) : blockedUntil !== null ? (
        <p className="text-ink">{t('kursos.examRetryAt', { time: time(blockedUntil) })}</p>
      ) : !questions ? (
        <p className="text-muted">…</p>
      ) : (
        <>
          {result === null ? (
            <p className="mb-6 text-muted">{t('kursos.examBody', { count: questions.length })}</p>
          ) : (
            <div
              className={`mb-8 rounded-card px-5 py-5 ${passed ? 'bg-coal text-white' : 'bg-ash-100 text-night'}`}
            >
              <p className="text-sm font-semibold">{t('kursos.examResult')}</p>
              <p className="mt-1 text-lg">
                {passed
                  ? t('kursos.examPass', { value: percent(result) })
                  : t('kursos.examFail', { value: percent(result) })}
              </p>
            </div>
          )}
          {result !== null && (
            <h2 className="mb-4 text-lg font-semibold text-night">{t('kursos.answersTitle')}</h2>
          )}
          <ol className="space-y-6">
            {questions.map((question, index) => (
              <li
                key={question.id}
                className="rounded-card border border-line bg-surface px-5 py-4 shadow-card"
              >
                <p className="mb-2 text-xs font-semibold text-muted">
                  {t('kursos.question', { n: index + 1, total: questions.length })}
                </p>
                <ExamItem
                  question={question}
                  answer={answers[index] ?? null}
                  onChange={(value) => set(index, value)}
                  done={result !== null}
                />
              </li>
            ))}
          </ol>
        </>
      )}
    </Reader>
  )
}

type ExamItemProps = {
  question: ExamQuestion
  answer: Answer
  onChange: (value: Answer) => void
  done: boolean
}

function ExamItem({ question, answer, onChange, done }: ExamItemProps) {
  const { t } = useTranslation()
  const right = examCorrect(question, answer)
  const key = question.kind === 'choice' ? question.options[question.answer] : question.answers.join(' / ')
  return (
    <div lang="en">
      {question.kind === 'choice' ? (
        <>
          <p className="mb-2 text-ink">{question.prompt}</p>
          <ChoiceOptions
            label={question.prompt}
            options={question.options}
            value={answer}
            onChange={onChange}
            disabled={done}
          />
        </>
      ) : (
        <label className="block leading-loose text-ink">
          {question.prompt.split('___')[0]}
          <input
            value={String(answer ?? '')}
            onChange={(event) => onChange(event.target.value || null)}
            disabled={done}
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            placeholder={t('kursos.typeHere')}
            className="mx-1 inline-block h-9 w-36 rounded-lg border border-line bg-ash-100 px-2 text-night"
          />
          {question.prompt.split('___')[1] ?? ''}
        </label>
      )}
      {done && (
        <p className="mt-2 flex flex-wrap items-center gap-2 text-sm" lang="pt">
          <span
            className={`inline-flex items-center gap-1 font-semibold ${right ? 'text-success' : 'text-coral'}`}
          >
            <Icon name={right ? 'check' : 'close'} className="size-4" />
            {right ? t('kursos.correct') : t('kursos.wrong')}
          </span>
          {!right && <span className="text-muted">{t('kursos.key', { value: key })}</span>}
        </p>
      )}
    </div>
  )
}
