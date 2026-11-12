import { useTranslation } from 'react-i18next'
import { PageHeader } from '../../components/ui/PageHeader'
import { ProgressBar } from '../../components/ui/ProgressBar'
import { ANNOUNCED, KURSOS } from '../../data/kursos'
import { courseState } from '../../domain/kursos'
import { EMPTY_KURSO, useUser } from '../../state/userStore'
import { CourseBanner } from './CourseBanner'
import { percent, totalMinutes } from './shared'
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
      <div className="grid gap-4 lg:grid-cols-2">
        {KURSOS.map((course) => {
          const progress = kursos[course.id] ?? EMPTY_KURSO
          const share = courseState(course, progress.done).share
          return (
            <CourseBanner
              key={course.id}
              to={`/kursos/${course.id}`}
              title={course.title}
              icon={course.icon}
              tone={course.tone}
              eyebrow={course.level}
            >
              <p className="mt-2 text-sm font-light text-copy">
                {t('kursos.unitsCount', { count: course.units.length })} ·{' '}
                {t('kursos.minutes', { count: totalMinutes(course) })}
              </p>
              {progress.done.length > 0 && (
                <div className="mt-4 max-w-56">
                  <ProgressBar value={share} label={t('kursos.progress', { value: percent(share) })} />
                  <p className="mt-1 text-xs text-muted">{t('kursos.progress', { value: percent(share) })}</p>
                </div>
              )}
            </CourseBanner>
          )
        })}
        {ANNOUNCED.map((course) => (
          <CourseBanner key={course.id} title={course.title} icon={course.icon} eyebrow={t('kursos.soon')} />
        ))}
      </div>
    </div>
  )
}
