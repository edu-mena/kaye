import { useTranslation } from 'react-i18next'
import { Icon } from '../../components/icons'
import { QueryState } from '../../components/QueryState'
import { ButtonLink } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { SelectField } from '../../components/ui/Field'
import { PageHeader, SectionHeading } from '../../components/ui/PageHeader'
import { Segmented } from '../../components/ui/Segmented'
import { useCareers, usePrograms } from '../../data/queries'
import { formatPercent } from '../../domain/format'
import { CRITERIA, rankPrograms, scorePrograms, type SortKey } from '../../domain/ranking'
import { useUrlFilters } from '../../lib/useUrlFilters'
import { useUser } from '../../state/userStore'
import { ProgramCard } from './ProgramCard'

const SORTS: SortKey[] = ['score', 'price', 'rating']

export default function TrainingPage() {
  const { t } = useTranslation()
  const programsQuery = usePrograms()
  const { data: careers = [] } = useCareers()
  const { compare } = useUser()
  const [params, setParam] = useUrlFilters()
  const career = params.get('carreira')
  const province = params.get('onde')
  const sort = SORTS.find((value) => value === params.get('ordem')) ?? 'score'

  return (
    <div>
      <PageHeader title={t('training.title')} subtitle={t('training.body')} />

      <QueryState query={programsQuery}>
        {(programs) => {
          const careerSlugs = [...new Set(programs.flatMap((program) => program.careers))]
          const provinces = [...new Set(programs.map((program) => program.institution.province))]
          const visible = scorePrograms(programs).filter(
            ({ program }) =>
              (!career || program.careers.includes(career)) &&
              (!province || program.institution.province === province),
          )
          const { ranked, unrecognized } = rankPrograms(visible, sort)

          return (
            <>
              <div className="mb-8 grid gap-4 lg:grid-cols-[18rem_minmax(0,1fr)] lg:items-end">
                <SelectField
                  label={t('training.careerLabel')}
                  placeholder={t('training.allCareers')}
                  value={career ?? ''}
                  onChange={(event) => setParam('carreira', event.target.value || null)}
                  options={careerSlugs.map((slug) => ({
                    value: slug,
                    label: careers.find((item) => item.slug === slug)?.name ?? slug,
                  }))}
                />
                <div className="space-y-3">
                  <Segmented
                    label={t('training.provinceLabel')}
                    clearable
                    value={province}
                    onChange={(value) => setParam('onde', value)}
                    options={provinces.map((value) => ({ value, label: value }))}
                  />
                  <Segmented<SortKey>
                    label={t('training.sortLabel')}
                    value={sort}
                    onChange={(value) => setParam('ordem', value)}
                    options={SORTS.map((value) => ({ value, label: t(`training.sort${value}`) }))}
                  />
                </div>
              </div>

              <Card tone="notice" className="mb-8 p-6">
                <h2 className="flex items-center gap-3 text-base font-semibold">
                  <span className="grid size-8 shrink-0 place-items-center rounded-full bg-blue text-white">
                    <Icon name="info" className="size-4" />
                  </span>
                  {t('training.howTitle')}
                </h2>
                <p className="mt-2 text-sm font-light text-copy">{t('training.howBody')}</p>
                <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-sm font-semibold">
                  {CRITERIA.map((criterion) => (
                    <li key={criterion.key}>
                      {t(`training.${criterion.key}`)} {formatPercent(criterion.weight)}
                    </li>
                  ))}
                </ul>
                <p className="mt-4 text-xs font-light text-muted">{t('training.marketSoon')}</p>
              </Card>

              {ranked.length === 0 && unrecognized.length === 0 && (
                <p className="py-10 text-center text-sm font-light text-muted">{t('training.empty')}</p>
              )}
              <ol aria-label={t('training.ranked')} className="space-y-4">
                {ranked.map((item, index) => (
                  <li key={item.program.id}>
                    <ProgramCard item={item} rank={index + 1} />
                  </li>
                ))}
              </ol>

              {unrecognized.length > 0 && (
                <section aria-labelledby="unrecognized" className="mt-10">
                  <SectionHeading id="unrecognized" title={t('training.unrecognizedTitle')} icon="info" />
                  <p className="mb-4 text-sm font-light text-copy">{t('training.unrecognizedBody')}</p>
                  <ul className="space-y-4">
                    {unrecognized.map((item) => (
                      <li key={item.program.id}>
                        <ProgramCard item={item} />
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </>
          )
        }}
      </QueryState>

      {compare.length > 0 && (
        <div className="fixed inset-x-0 bottom-20 z-10 px-4 lg:bottom-6 lg:left-64">
          <div className="mx-auto flex max-w-lg items-center justify-between gap-3 rounded-full bg-coal py-2 pr-2 pl-5 text-white shadow-lift">
            <span className="text-sm font-light">{t('training.compareTray', { count: compare.length })}</span>
            <ButtonLink to="/cursos/comparar" variant="onDark" size="sm">
              {t('training.compareCta')}
            </ButtonLink>
          </div>
        </div>
      )}
    </div>
  )
}
