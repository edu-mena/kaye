import { useTranslation } from 'react-i18next'
import { Icon } from '../../components/icons'
import { ButtonLink } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Chip } from '../../components/ui/Chip'
import { PageHeader } from '../../components/ui/PageHeader'
import { ProgressBar } from '../../components/ui/ProgressBar'
import { ANNOUNCED, KURSOS } from '../../data/kursos'
import { courseState, formatMinutes } from '../../domain/kursos'
import { EMPTY_KURSO, useUser } from '../../state/userStore'
import { percent, TONE_CLASS, totalMinutes } from './shared'
import { TestBanner } from './TestBanner'

/** The Kursos catalogue: the written courses and the ones announced. */
export default function KursosPage() {
  const { t } = useTranslation()
  const { kursos } = useUser()

  return (
    <div className="space-y-6">
      <PageHeader title={t('kursos.title')} subtitle={t('kursos.subtitle')} />
      <div className="-mx-3 overflow-hidden lg:mx-0 lg:rounded-2xl">
        <TestBanner />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {KURSOS.map((course) => {
          const progress = kursos[course.id] ?? EMPTY_KURSO
          const state = courseState(course, progress.done)
          return (
            <Card key={course.id} as="article" className="flex flex-col gap-4 p-6">
              <div className="flex items-center gap-3">
                <span
                  className={`grid size-12 shrink-0 place-items-center rounded-2xl ${TONE_CLASS[course.tone]}`}
                >
                  <Icon name={course.icon} className="size-6" />
                </span>
                <div>
                  <h2 className="text-lg font-semibold text-night">{course.title}</h2>
                  <p className="text-sm text-muted">{course.subtitle}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Chip tone="gold">{course.level}</Chip>
                <Chip>{t('kursos.unitsCount', { count: course.units.length })}</Chip>
                <Chip>{t('kursos.minutes', { count: totalMinutes(course) })}</Chip>
                {progress.seconds > 0 && (
                  <Chip>{t('kursos.studyTime', { count: formatMinutes(progress.seconds) })}</Chip>
                )}
              </div>
              <ProgressBar
                value={state.share}
                label={t('kursos.progress', { value: percent(state.share) })}
              />
              <p className="text-sm text-muted">{t('kursos.progress', { value: percent(state.share) })}</p>
              <ButtonLink to={`/kursos/${course.id}`} className="mt-auto self-start">
                {progress.completedAt
                  ? t('kursos.open')
                  : progress.done.length > 0
                    ? t('kursos.continue')
                    : t('kursos.start')}
              </ButtonLink>
            </Card>
          )
        })}
        {ANNOUNCED.map((course) => (
          <Card key={course.id} as="article" tone="gray" className="flex flex-col gap-4 p-6">
            <div className="flex items-center gap-3">
              <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-surface text-muted">
                <Icon name={course.icon} className="size-6" />
              </span>
              <div>
                <h2 className="text-lg font-semibold text-night">{course.title}</h2>
                <p className="text-sm text-muted">{course.body}</p>
              </div>
            </div>
            <Chip className="self-start">{t('kursos.soon')}</Chip>
          </Card>
        ))}
      </div>
    </div>
  )
}
