import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Navigate, useNavigate, useParams } from 'react-router'
import { Button, ButtonLink } from '../../components/ui/Button'
import { courseSteps, REVIEW, stepKey } from '../../data/kursos'
import type { ExerciseBlock } from '../../data/kursos/types'
import { courseState, itemCorrect, type Answer } from '../../domain/kursos'
import { userActions } from '../../state/userStore'
import { BlockView, ExerciseView } from './Blocks'
import { Reader } from './Reader'
import { percent, stepHref, useActiveTime, useCourse, useUnitContent } from './shared'

/** One lesson, or a unit's review, in the reader. */
export default function LessonPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { unidade, licao } = useParams()
  const { course, progress } = useCourse()
  const unit = course?.units.find((entry) => entry.id === unidade)
  const content = useUnitContent(unit)
  const steps = course ? courseSteps(course) : []
  const key = `${unidade}/${licao}`
  const index = steps.findIndex((step) => stepKey(step) === key)

  useActiveTime(course?.id)
  useEffect(() => {
    if (course && index >= 0) userActions.openKursoStep(course.id, key)
  }, [course, index, key])

  if (!course) return <Navigate to="/kursos" replace />
  if (!unit?.load || index < 0) return <Navigate to={`/kursos/${course.id}`} replace />

  const previous = steps[index - 1]
  const next = steps[index + 1]
  const isReview = licao === REVIEW
  const lesson = content?.lessons.find((entry) => entry.id === licao)
  const title = isReview
    ? `${t('kursos.unitN', { n: unit.number })} · ${t('kursos.review')}`
    : `${unit.number}.${index + 1 - steps.findIndex((step) => step.unit === unit.id)} ${lesson?.title ?? ''}`

  const finish = (score?: number) => {
    userActions.completeKursoStep(
      course.id,
      key,
      score === undefined ? undefined : { unit: unit.id, value: score },
    )
    void navigate(next ? stepHref(course, next) : `/kursos/${course.id}`)
  }

  const back = previous ? (
    <ButtonLink to={stepHref(course, previous)} variant="secondary" size="sm">
      {t('kursos.previous')}
    </ButtonLink>
  ) : (
    <span />
  )

  return (
    <Reader
      course={course}
      progress={progress}
      title={title}
      share={courseState(course, progress.done).share}
      current={key}
      footer={
        isReview ? (
          back
        ) : (
          <>
            {back}
            <Button size="sm" onClick={() => finish()} disabled={!lesson}>
              {t('kursos.completeNext')}
            </Button>
          </>
        )
      }
    >
      {!content ? (
        <p className="text-muted">…</p>
      ) : isReview ? (
        <Review
          key={key}
          blocks={content.review}
          lang={course.lang}
          saved={progress.scores[unit.id]}
          onDone={finish}
          isLast={!next}
        />
      ) : (
        lesson && (
          <>
            <p className="mb-1 text-sm font-semibold text-gold">{t('kursos.unitN', { n: unit.number })}</p>
            <h1 className="mb-2 text-2xl font-semibold text-night sm:text-3xl">{lesson.title}</h1>
            <p className="mb-6 text-sm text-muted">
              {t('kursos.minutes', { count: lesson.estimatedMinutes })}
            </p>
            {lesson.blocks.map((block) => (
              <BlockView key={JSON.stringify(block)} block={block} lang={course.lang} />
            ))}
          </>
        )
      )}
    </Reader>
  )
}

type ReviewProps = {
  blocks: ExerciseBlock[]
  lang: string
  saved?: number
  onDone: (score: number) => void
  isLast: boolean
}

/** The end of a unit: every answer counts towards the grade. */
function Review({ blocks, lang, saved, onDone, isLast }: ReviewProps) {
  const { t } = useTranslation()
  const [answers, setAnswers] = useState<Record<string, Answer[]>>(() =>
    Object.fromEntries(blocks.map((block) => [block.id, block.items.map(() => null)])),
  )
  const [checked, setChecked] = useState(false)
  const total = blocks.reduce((sum, block) => sum + block.items.length, 0)
  const right = blocks.reduce(
    (sum, block) =>
      sum +
      block.items.filter((_, index) => itemCorrect(block, index, answers[block.id]?.[index] ?? null)).length,
    0,
  )
  const score = total ? right / total : 0

  return (
    <>
      <h1 className="mb-2 text-2xl font-semibold text-night sm:text-3xl">{t('kursos.review')}</h1>
      <p className="mb-2 text-muted">{t('kursos.reviewIntro')}</p>
      {saved !== undefined && (
        <p className="mb-4 text-sm font-semibold text-night">
          {t('kursos.reviewScore', { value: percent(saved) })}
        </p>
      )}
      {blocks.map((block) => (
        <ExerciseView
          key={block.id}
          block={block}
          lang={lang}
          answers={answers[block.id] ?? []}
          onChange={(next) => {
            setAnswers({ ...answers, [block.id]: next })
            setChecked(false)
          }}
          checked={checked}
          showKey={false}
        />
      ))}
      <div className="flex flex-wrap items-center gap-3">
        {checked ? (
          <>
            <p className="text-lg font-semibold text-night">
              {t('kursos.reviewScore', { value: percent(score) })}
            </p>
            <Button onClick={() => onDone(score)}>
              {isLast ? t('kursos.finishUnit') : t('kursos.reviewSave')}
            </Button>
          </>
        ) : (
          <Button onClick={() => setChecked(true)}>{t('kursos.check')}</Button>
        )}
      </div>
    </>
  )
}
