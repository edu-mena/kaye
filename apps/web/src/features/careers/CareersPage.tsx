import { useTranslation } from 'react-i18next'
import { CareerCard } from '../../components/CareerCard'
import { Icon } from '../../components/icons'
import { QueryState } from '../../components/QueryState'
import { PageHeader } from '../../components/ui/PageHeader'
import { Segmented } from '../../components/ui/Segmented'
import { useCareers } from '../../data/queries'
import { CAREER_GROUPS, type CareerGroup } from '../../data/types'
import { filterCareers, type CareerSort } from '../../domain/careers'
import { interestLevel } from '../../domain/fit'
import { compatibility } from '../../domain/riasec'
import { useUrlFilters } from '../../lib/useUrlFilters'
import { useRiasecProfile } from '../../state/useRiasecProfile'

const isGroup = (value: string | null): value is CareerGroup => CAREER_GROUPS.some((group) => group === value)

export default function CareersPage() {
  const { t } = useTranslation()
  const query = useCareers()
  const { profile } = useRiasecProfile()
  const [params, setParam] = useUrlFilters()
  const search = params.get('q') ?? ''
  const groupParam = params.get('area')
  const group = isGroup(groupParam) ? groupParam : null
  const sortParam = params.get('ordem')
  const sorts: CareerSort[] = profile ? ['forYou', 'demand', 'salary'] : ['demand', 'salary']
  const sort = sorts.find((option) => option === sortParam) ?? sorts[0] ?? 'demand'

  const sortLabels: Record<CareerSort, string> = {
    forYou: t('careers.sortForYou'),
    demand: t('careers.sortDemand'),
    salary: t('careers.sortSalary'),
  }

  return (
    <div>
      <PageHeader title={t('careers.title')} subtitle={t('careers.body')} />

      <div className="mb-5 space-y-3">
        <label className="relative block">
          <span className="sr-only">{t('careers.search')}</span>
          <Icon
            name="search"
            className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted"
          />
          <input
            type="search"
            value={search}
            placeholder={t('careers.searchPlaceholder')}
            onChange={(event) => setParam('q', event.target.value || null)}
            className="h-12 w-full rounded-full border border-line bg-surface pr-4 pl-12 text-navy placeholder:text-muted/70 focus:border-navy focus:outline-none"
          />
        </label>
        <Segmented
          label={t('careers.groupsLabel')}
          clearable
          value={group}
          onChange={(value) => setParam('area', value)}
          options={CAREER_GROUPS.map((value) => ({ value, label: t(`groups.${value}`) }))}
        />
        <Segmented
          label={t('careers.sortLabel')}
          value={sort}
          onChange={(value) => setParam('ordem', value)}
          options={sorts.map((value) => ({ value, label: sortLabels[value] }))}
        />
      </div>

      <QueryState query={query}>
        {(careers) => {
          const results = filterCareers(careers, { query: search, group, sort, profile })
          if (results.length === 0)
            return <p className="py-10 text-center text-muted">{t('careers.empty')}</p>

          return (
            <>
              <p aria-live="polite" className="mb-3 text-sm font-semibold text-muted">
                {t('careers.count', { count: results.length })}
              </p>
              <ul className="grid gap-3 lg:grid-cols-2">
                {results.map((career) => (
                  <li key={career.slug}>
                    <CareerCard
                      career={career}
                      match={profile ? interestLevel(compatibility(profile, career.riasec)) : undefined}
                    />
                  </li>
                ))}
              </ul>
            </>
          )
        }}
      </QueryState>
    </div>
  )
}
