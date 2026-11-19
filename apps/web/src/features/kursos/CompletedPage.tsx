import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Navigate } from 'react-router'
import { Icon } from '../../components/icons'
import { Button, ButtonLink } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Chip } from '../../components/ui/Chip'
import { PageHeader } from '../../components/ui/PageHeader'
import { nextCourse } from '../../data/kursos'
import { formatMinutes } from '../../domain/kursos'
import { userActions, useUser } from '../../state/userStore'
import { downloadCertificate } from './certificatePdf'
import { percent, useCourse } from './shared'
import { TestBanner } from './TestBanner'

/** After the exam: the grade, time, grade per unit, the certificate and what comes next. */
export default function CompletedPage() {
  const { t } = useTranslation()
  const { course, progress } = useCourse()
  const { profile } = useUser()
  const [busy, setBusy] = useState(false)
  const [added, setAdded] = useState(false)

  if (!course) return <Navigate to="/kursos" replace />
  const attempt = progress.exam.find((entry) => entry.at === progress.completedAt)
  if (!progress.completedAt || !attempt || !progress.certificate)
    return (
      <div className="space-y-4">
        <PageHeader title={course.title} back={{ to: `/kursos/${course.id}`, label: course.title }} />
        <p className="text-ink">{t('kursos.notFinished')}</p>
      </div>
    )

  const next = nextCourse(course.id)
  const date = new Date(progress.completedAt)
  const minutes = formatMinutes(progress.seconds)
  const download = async () => {
    setBusy(true)
    try {
      await downloadCertificate({
        name: profile?.name ?? '',
        course: course.title,
        level: course.level,
        date: date.toLocaleDateString('pt-PT'),
        score: attempt.score,
        hours: progress.seconds / 3600,
        code: progress.certificate ?? '',
        file: `certificado-kaye-${course.id}.pdf`,
      })
    } finally {
      setBusy(false)
    }
  }
  const addToCv = () => {
    userActions.addCvEducation({
      title: `${course.title}, nível ${course.level} (versão de teste, sem validade)`,
      place: 'Kayé · Kursos',
      period: String(date.getFullYear()),
      description: `Formação livre, ${Math.max(1, Math.round(progress.seconds / 3600))} h de estudo. Nota do exame: ${percent(attempt.score)}%.`,
    })
    setAdded(true)
  }

  return (
    <div className="space-y-6">
      <PageHeader title={t('kursos.congrats')} back={{ to: `/kursos/${course.id}`, label: course.title }} />
      <div className="-mx-3 overflow-hidden lg:mx-0 lg:rounded-2xl">
        <TestBanner />
      </div>

      <Card tone="coal" className="space-y-5 p-6">
        <div className="flex items-center gap-3">
          <span className="grid size-12 place-items-center rounded-full bg-gold text-night">
            <Icon name="award" className="size-6" />
          </span>
          <p className="text-lg">{t('kursos.congratsBody', { course: course.title })}</p>
        </div>
        <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <div>
            <dt className="text-sm text-white/70">{t('kursos.score')}</dt>
            <dd className="text-2xl font-semibold">{percent(attempt.score)}%</dd>
          </div>
          <div>
            <dt className="text-sm text-white/70">{t('kursos.totalTime')}</dt>
            <dd className="text-2xl font-semibold">{t('kursos.minutes', { count: minutes })}</dd>
          </div>
          <div>
            <dt className="text-sm text-white/70">{t('kursos.code')}</dt>
            <dd className="font-mono text-lg">{progress.certificate}</dd>
          </div>
        </dl>
        <div className="flex flex-wrap gap-2">
          <Button variant="onDark" onClick={() => void download()} disabled={busy}>
            <Icon name="download" className="size-4" />
            {busy ? t('kursos.downloading') : t('kursos.download')}
          </Button>
          <Button variant="onDarkOutline" onClick={addToCv} disabled={added}>
            <Icon name="document" className="size-4" />
            {t('kursos.addCv')}
          </Button>
        </div>
        {added && (
          <output className="flex flex-wrap items-center gap-3 text-sm">
            {t('kursos.addedCv')}
            <ButtonLink to="/cv/editar" variant="onDarkOutline" size="xs">
              {t('kursos.openCv')}
            </ButtonLink>
          </output>
        )}
      </Card>

      <section aria-labelledby="por-unidade">
        <h2 id="por-unidade" className="mb-3 text-lg font-semibold text-night">
          {t('kursos.byUnit')}
        </h2>
        <ul className="grid gap-3 sm:grid-cols-2">
          {course.units
            .filter((unit) => unit.load)
            .map((unit) => (
              <li key={unit.id}>
                <Card className="flex items-center justify-between gap-3 p-4">
                  <span className="text-night">
                    {t('kursos.unitN', { n: unit.number })} · {unit.title}
                  </span>
                  <span className="font-semibold text-night">
                    {percent(attempt.units[unit.id] ?? progress.scores[unit.id] ?? 0)}%
                  </span>
                </Card>
              </li>
            ))}
        </ul>
      </section>

      {next && (
        <Card tone="gray" className="flex items-center gap-4 p-5">
          <Icon name={next.icon} className="size-6 shrink-0 text-muted" />
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-night">{t('kursos.nextCourse')}</p>
            <p className="text-sm text-muted">
              {next.title} · {'units' in next ? next.subtitle : next.body}
            </p>
          </div>
          {'units' in next ? (
            <ButtonLink to={`/kursos/${next.id}`} size="sm">
              {t('kursos.open')}
            </ButtonLink>
          ) : (
            <Chip>{t('kursos.soon')}</Chip>
          )}
        </Card>
      )}
    </div>
  )
}
