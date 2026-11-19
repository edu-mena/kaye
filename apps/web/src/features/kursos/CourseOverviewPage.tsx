import { useTranslation } from 'react-i18next'
import { Link, Navigate } from 'react-router'
import { Icon } from '../../components/icons'
import { ButtonLink } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Chip } from '../../components/ui/Chip'
import { PageHeader } from '../../components/ui/PageHeader'
import { ProgressBar } from '../../components/ui/ProgressBar'
import { REVIEW, stepKey } from '../../data/kursos'
import type { Unit } from '../../data/kursos/types'
import { courseState, EXAM_SIZE, formatMinutes, nextAttemptAt } from '../../domain/kursos'
import type { KursoProgress } from '../../state/userStore'
import { percent, resumeStep, stepHref, totalMinutes, useCourse } from './shared'
import { TestBanner } from './TestBanner'

type UnitStatus = 'done' | 'current' | 'todo' | 'soon'

function unitStatus(unit: Unit, progress: KursoProgress): UnitStatus {
  if (!unit.load) return 'soon'
  const keys = [...(unit.lessons ?? []).map((lesson) => lesson.id), REVIEW].map((lesson) =>
    stepKey({ unit: unit.id, lesson }),
  )
  const done = keys.filter((key) => progress.done.includes(key)).length
  if (done === keys.length) return 'done'
  return done > 0 || keys.includes(progress.position ?? '') ? 'current' : 'todo'
}

const STATUS_LABEL = {
  done: 'stateDone',
  current: 'stateCurrent',
  todo: 'stateTodo',
  soon: 'stateSoon',
} as const

/** A course: who it is for, the roadmap of units, progress, the exam and the credits. */
export default function CourseOverviewPage() {
  const { t } = useTranslation()
  const { course, progress } = useCourse()
  if (!course) return <Navigate to="/kursos" replace />

  const state = courseState(course, progress.done)
  const resume = resumeStep(course, progress)
  const retryAt = nextAttemptAt(progress.exam)
  const best = progress.exam.reduce((top, attempt) => Math.max(top, attempt.score), 0)

  return (
    <div className="space-y-6">
      <PageHeader
        title={course.title}
        subtitle={course.subtitle}
        back={{ to: '/kursos', label: t('kursos.title') }}
      />
      <div className="-mx-3 overflow-hidden lg:mx-0 lg:rounded-2xl">
        <TestBanner />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_20rem]">
        <Card className="space-y-4 p-6">
          <div className="flex flex-wrap gap-2">
            <Chip tone="gold">{course.level}</Chip>
            <Chip>{t('kursos.unitsCount', { count: course.units.length })}</Chip>
          </div>
          <div>
            <h2 className="mb-1 font-semibold text-night">{t('kursos.forWho')}</h2>
            <p className="text-ink">{course.audience}</p>
          </div>
          <div>
            <h2 className="mb-1 font-semibold text-night">{t('kursos.goals')}</h2>
            <ul className="list-disc space-y-1 pl-5 text-ink">
              {course.goals.map((goal) => (
                <li key={goal}>{goal}</li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="mb-1 font-semibold text-night">{t('kursos.time')}</h2>
            <p className="text-ink">{t('kursos.timeValue', { count: totalMinutes(course) })}</p>
          </div>
        </Card>

        <Card tone="coal" className="flex flex-col gap-4 p-6">
          <p className="text-3xl font-semibold">{percent(state.share)}%</p>
          <ProgressBar
            value={state.share}
            label={t('kursos.progress', { value: percent(state.share) })}
            tone="gold"
            track="bg-white/15"
          />
          <p className="text-sm text-white/80">
            {t('kursos.steps', { done: state.done, total: state.total })}
          </p>
          <p className="text-sm text-white/80">
            {t('kursos.studyTime', { count: formatMinutes(progress.seconds) })}
          </p>
          {resume && !state.unitsDone && (
            <ButtonLink to={stepHref(course, resume)} variant="onDark" className="mt-auto">
              {progress.done.length > 0 ? t('kursos.continue') : t('kursos.start')}
            </ButtonLink>
          )}
        </Card>
      </div>

      <section aria-labelledby="roadmap">
        <h2 id="roadmap" className="mb-4 text-lg font-semibold text-night">
          {t('kursos.roadmap')}
        </h2>
        <ol className="relative space-y-4 before:absolute before:top-4 before:bottom-4 before:left-5 before:w-0.5 before:bg-line">
          {course.units.map((unit) => {
            const status = unitStatus(unit, progress)
            return (
              <li key={unit.id} className="relative flex gap-4">
                <span
                  className={`z-10 grid size-10 shrink-0 place-items-center rounded-full text-sm font-semibold ${
                    status === 'done'
                      ? 'bg-success text-white'
                      : status === 'current'
                        ? 'bg-night text-white'
                        : status === 'soon'
                          ? 'bg-ash-100 text-muted'
                          : 'bg-surface text-night ring-2 ring-line'
                  }`}
                >
                  {status === 'done' ? <Icon name="check" className="size-5" /> : unit.number}
                </span>
                <Card className={`min-w-0 flex-1 p-5 ${status === 'soon' ? 'opacity-70' : ''}`}>
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="text-xs font-semibold text-muted">
                        {t('kursos.unitN', { n: unit.number })}
                      </p>
                      <h3 className="font-semibold text-night">{unit.title}</h3>
                      <p className="text-sm text-muted">{unit.summary}</p>
                    </div>
                    <Chip tone={status === 'done' ? 'success' : status === 'current' ? 'night' : 'neutral'}>
                      {t(`kursos.${STATUS_LABEL[status]}`)}
                    </Chip>
                  </div>
                  {unit.load && (
                    <ul className="mt-3 space-y-1">
                      {[
                        ...(unit.lessons ?? []),
                        { id: REVIEW, title: t('kursos.review'), estimatedMinutes: 0 },
                      ].map((lesson) => {
                        const step = { unit: unit.id, lesson: lesson.id }
                        const done = progress.done.includes(stepKey(step))
                        const score = lesson.id === REVIEW ? progress.scores[unit.id] : undefined
                        return (
                          <li key={lesson.id}>
                            <Link
                              to={stepHref(course, step)}
                              className="flex items-center gap-2 rounded-xl px-2 py-1.5 text-sm text-night hover:bg-ash-100"
                            >
                              <Icon
                                name={done ? 'check' : lesson.id === REVIEW ? 'award' : 'book'}
                                className={`size-4 shrink-0 ${done ? 'text-success' : 'text-muted'}`}
                              />
                              <span className="min-w-0 flex-1">{lesson.title}</span>
                              {score !== undefined && (
                                <span className="text-xs text-muted">{percent(score)}%</span>
                              )}
                              {lesson.estimatedMinutes > 0 && (
                                <span className="text-xs text-muted">
                                  {t('kursos.minutes', { count: lesson.estimatedMinutes })}
                                </span>
                              )}
                            </Link>
                          </li>
                        )
                      })}
                    </ul>
                  )}
                </Card>
              </li>
            )
          })}
          <li className="relative flex gap-4">
            <span
              className={`z-10 grid size-10 shrink-0 place-items-center rounded-full ${
                state.unitsDone ? 'bg-gold text-night' : 'bg-ash-100 text-muted'
              }`}
            >
              <Icon name={state.unitsDone ? 'award' : 'lock'} className="size-5" />
            </span>
            <Card tone={state.unitsDone ? 'notice' : 'gray'} className="min-w-0 flex-1 space-y-3 p-5">
              <h3 className="font-semibold text-night">{t('kursos.exam')}</h3>
              <p className="text-sm text-ink">{t('kursos.examBody', { count: EXAM_SIZE })}</p>
              {progress.completedAt ? (
                <>
                  <p className="text-sm font-semibold text-success">
                    {t('kursos.examPassed', { value: percent(best) })}
                  </p>
                  <ButtonLink to={`/kursos/${course.id}/concluido`} size="sm">
                    {t('kursos.seeCertificate')}
                  </ButtonLink>
                </>
              ) : !state.unitsDone ? (
                <p className="text-sm text-muted">{t('kursos.examLocked')}</p>
              ) : retryAt ? (
                <p className="text-sm text-muted">
                  {t('kursos.examRetryAt', {
                    time: new Date(retryAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  })}
                </p>
              ) : (
                <ButtonLink to={`/kursos/${course.id}/exame`} size="sm">
                  {t('kursos.examStart')}
                </ButtonLink>
              )}
            </Card>
          </li>
        </ol>
      </section>

      <section aria-labelledby="creditos">
        <h2 id="creditos" className="mb-2 text-lg font-semibold text-night">
          {t('kursos.credits')}
        </h2>
        <p className="mb-3 text-sm text-muted">{t('kursos.creditsBody')}</p>
        <ul className="space-y-2">
          {course.credits.map((credit) => (
            <li key={credit.title} className="rounded-2xl bg-ash-100 px-4 py-3 text-sm">
              <a
                href={credit.url}
                target="_blank"
                rel="noreferrer"
                className="font-semibold text-night underline"
              >
                {credit.title}
              </a>
              <span className="text-muted">
                {' '}
                · {credit.author} · {credit.license}
              </span>
              <p className="text-ink">{credit.use}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
