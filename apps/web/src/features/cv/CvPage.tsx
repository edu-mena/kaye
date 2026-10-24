import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { Icon } from '../../components/icons'
import { QueryState } from '../../components/QueryState'
import { ButtonLink } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { PageHeader, SectionHeading } from '../../components/ui/PageHeader'
import { ProgressBar } from '../../components/ui/ProgressBar'
import { useCareers, useCvExamples } from '../../data/queries'
import { cvCompleteness } from '../../domain/cv'
import { formatPercent } from '../../domain/format'
import { useUser } from '../../state/userStore'

export default function CvPage() {
  const { t } = useTranslation()
  const { cv } = useUser()
  const examples = useCvExamples()
  const { data: careers = [] } = useCareers()
  const completeness = cvCompleteness(cv)
  const started = completeness > 0

  return (
    <div>
      <PageHeader title={t('cv.title')} subtitle={t('cv.body')} />

      <Card tone="coal" className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center">
        <Icon name="document" className="size-10 shrink-0 text-white" />
        <div className="flex-1">
          <h2 className="text-xl font-semibold">{t('cv.mine')}</h2>
          {started ? (
            <>
              <p className="mt-1 text-sm text-white/80">
                {t('cv.completeness', { value: formatPercent(completeness) })}
              </p>
              <ProgressBar
                value={completeness}
                label={t('cv.mine')}
                tone="white"
                track="bg-white/15"
                className="mt-2"
              />
            </>
          ) : (
            <p className="mt-1 text-sm text-white/80">{t('cv.mineEmpty')}</p>
          )}
        </div>
        <ButtonLink to="/cv/editar" variant="onDark">
          {started ? t('cv.edit') : t('cv.start')}
        </ButtonLink>
      </Card>

      <section aria-labelledby="examples">
        <SectionHeading id="examples" title={t('cv.examples')} />
        <p className="mb-4 text-sm text-muted">{t('cv.examplesBody')}</p>
        <QueryState query={examples}>
          {(list) => (
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {list.map((example) => (
                <li key={example.id}>
                  <Link
                    to={`/cv/modelos/${example.id}`}
                    className="flex h-full flex-col rounded-card bg-surface p-5 shadow-card transition-shadow hover:shadow-lift"
                  >
                    <span className="mb-3 space-y-1.5 rounded-xl bg-paper p-3" aria-hidden="true">
                      <span className="block h-2 w-1/2 rounded bg-navy" />
                      <span className="block h-1.5 w-1/3 rounded bg-navy-soft" />
                      <span className="block h-1.5 w-full rounded bg-navy-100" />
                      <span className="block h-1.5 w-5/6 rounded bg-navy-100" />
                    </span>
                    <span className="font-display text-lg font-semibold text-navy">
                      {example.cv.headline}
                    </span>
                    <span className="text-sm text-muted">
                      {careers.find((career) => career.slug === example.careerSlug)?.name} ·{' '}
                      {t(`cv.${example.seniority}`)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </QueryState>
      </section>
    </div>
  )
}
