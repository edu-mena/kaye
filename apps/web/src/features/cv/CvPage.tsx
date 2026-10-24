import { useTranslation } from 'react-i18next'
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
import { ModelCvGrid } from './ModelCvGrid'

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

      <Card tone="coal" className="mb-10 flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:p-8">
        <span className="grid size-12 shrink-0 place-items-center rounded-full bg-white/10 text-white">
          <Icon name="document" className="size-6" />
        </span>
        <div className="flex-1">
          <h2 className="text-2xl font-extrabold">{t('cv.mine')}</h2>
          {started ? (
            <>
              <p className="mt-2 text-sm font-light text-white/80">
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
            <p className="mt-2 text-sm font-light text-white/80">{t('cv.mineEmpty')}</p>
          )}
        </div>
        <ButtonLink to="/cv/editar" variant="onDark">
          {started ? t('cv.edit') : t('cv.start')}
        </ButtonLink>
      </Card>

      <section aria-labelledby="examples">
        <SectionHeading id="examples" title={t('cv.examples')} icon="document" />
        <p className="mb-6 text-sm font-light text-copy">{t('cv.examplesBody')}</p>
        <QueryState query={examples}>
          {(list) => (
            <ModelCvGrid
              examples={list}
              name={(example) => careers.find((career) => career.slug === example.careerSlug)?.name ?? ''}
            />
          )}
        </QueryState>
      </section>
    </div>
  )
}
