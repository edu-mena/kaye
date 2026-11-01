import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import heroLarge from '../../assets/heroes/empresas-1024.webp'
import heroSmall from '../../assets/heroes/empresas-800.webp'
import { CoverHero } from '../../components/CoverHero'
import { EntityCard } from '../../components/EntityCard'
import type { IconName } from '../../components/icons'
import { ListSkeleton } from '../../components/PageStates'
import { QueryState } from '../../components/QueryState'
import { FilterBar } from '../../components/ui/Filters'
import { SectionHeading } from '../../components/ui/PageHeader'
import { Pagination } from '../../components/ui/Pagination'
import { useCareers, useCompanies } from '../../data/queries'
import { COMPANY_SECTORS } from '../../data/types'
import { paginate } from '../../lib/pagination'
import { useUrlFilters } from '../../lib/useUrlFilters'

// Hero photo: "Luanda Skyline - Angola 2015", David Stanley, CC BY 2.0, Wikimedia Commons.
// No credit on screen while the photos stay local (see data/demo/images.ts).

/** Filters whose options depend on the sector: changing the sector clears them. */
const SECTOR_DEPENDENT = ['area', 'programas', 'pagina']
/** The list's filters in the URL; "Limpar filtros" removes them all. */
const FILTER_KEYS = ['setor', 'area', 'programas', 'onde', 'profissao', 'pagina']
const PAGE_SIZE = 12
const WITH_PROGRAMS = 'sim'

export default function CompaniesPage() {
  const { t } = useTranslation()
  const companiesQuery = useCompanies()
  const { data: careers = [] } = useCareers()
  const careerName = (slug: string) => careers.find((career) => career.slug === slug)?.name ?? slug
  const [params, setParam] = useUrlFilters()
  /** A filter from the URL, only when it is one of the options: unknown values are ignored. */
  const pick = <T extends string>(key: string, values: readonly T[]) =>
    values.find((value) => value === params.get(key)) ?? null
  const sector = pick('setor', COMPANY_SECTORS)
  const list = useRef<HTMLElement>(null)

  return (
    <div className="space-y-12">
      <QueryState query={companiesQuery} loading={<ListSkeleton tiles={3} />}>
        {(companies) => {
          const careerOptions = [...new Set(companies.flatMap((company) => company.careers))]
            .map((slug) => ({ value: slug, label: careerName(slug) }))
            .toSorted((a, b) => a.label.localeCompare(b.label))
          const sectors = COMPANY_SECTORS.filter((value) =>
            companies.some((company) => company.sector === value),
          )
          // The options come from the chosen sector's companies; a filter with nothing to offer hides.
          const ofSector = companies.filter((company) => !sector || company.sector === sector)
          const areas = [...new Set(ofSector.flatMap((company) => company.areas))]
          const programOptions = ofSector.some((company) => company.programs.length > 0)
            ? [WITH_PROGRAMS]
            : []
          const provinces = [...new Set(companies.map((company) => company.province))]

          const career = pick(
            'profissao',
            careerOptions.map((option) => option.value),
          )
          const area = pick('area', areas)
          const programs = pick('programas', programOptions)
          const province = pick('onde', provinces)
          const visible = ofSector.filter(
            (company) =>
              (!career || company.careers.includes(career)) &&
              (!area || company.areas.includes(area)) &&
              (!programs || company.programs.length > 0) &&
              (!province || company.province === province),
          )
          const { page, pages, shown: onPage } = paginate(visible, Number(params.get('pagina')), PAGE_SIZE)
          const goTo = (next: number) => {
            setParam('pagina', next > 1 ? String(next) : null)
            list.current?.scrollIntoView?.({ behavior: 'smooth', block: 'start' })
          }
          const stats: { icon: IconName; value: number; label: string }[] = [
            { icon: 'building', value: companies.length, label: t('companies.statCompanies') },
            { icon: 'chart', value: sectors.length, label: t('companies.statSectors') },
            { icon: 'briefcase', value: careerOptions.length, label: t('companies.statCareers') },
            {
              icon: 'document',
              value: new Set(companies.flatMap((company) => company.sources.map((source) => source.url)))
                .size,
              label: t('companies.statSources'),
            },
          ]

          return (
            <>
              <CoverHero
                title={t('companies.title')}
                stats={stats}
                photo={{ small: heroSmall, large: heroLarge, largeWidth: 1024 }}
              />

              <section aria-labelledby="list" ref={list} className="scroll-mt-6">
                <div className="mb-6">
                  <h2 id="list" className="text-xl font-extrabold text-night sm:text-2xl">
                    {career ? t('companies.forCareer', { career: careerName(career) }) : t('companies.all')}
                  </h2>
                  <output className="mt-1 block text-xs font-light text-muted">
                    {t('companies.count', { count: visible.length })}
                  </output>
                </div>
                <div className="mb-6">
                  <FilterBar
                    clearLabel={t('common.clearFilters')}
                    onChange={(key, value) =>
                      setParam(key, value, key === 'setor' ? SECTOR_DEPENDENT : ['pagina'])
                    }
                    onClear={() => setParam('setor', null, FILTER_KEYS)}
                    filters={[
                      {
                        key: 'profissao',
                        label: t('companies.careerLabel'),
                        placeholder: t('companies.allCareers'),
                        value: career,
                        options: careerOptions,
                      },
                      {
                        key: 'setor',
                        label: t('companies.sectorLabel'),
                        placeholder: t('companies.allSectors'),
                        value: sector,
                        options: sectors.map((value) => ({ value, label: t(`companies.sector_${value}`) })),
                      },
                      ...(areas.length > 1
                        ? [
                            {
                              key: 'area',
                              label: t('companies.areaLabel'),
                              placeholder: t('companies.allAreas'),
                              value: area,
                              options: areas
                                .map((value) => ({ value, label: t(`groups.${value}`) }))
                                .toSorted((a, b) => a.label.localeCompare(b.label)),
                            },
                          ]
                        : []),
                      ...(programOptions.length > 0
                        ? [
                            {
                              key: 'programas',
                              label: t('companies.programsLabel'),
                              placeholder: t('companies.anyPrograms'),
                              value: programs,
                              options: [{ value: WITH_PROGRAMS, label: t('companies.withPrograms') }],
                            },
                          ]
                        : []),
                      ...(provinces.length > 1
                        ? [
                            {
                              key: 'onde',
                              label: t('companies.provinceLabel'),
                              placeholder: t('companies.allProvinces'),
                              value: province,
                              options: provinces.map((value) => ({ value, label: value })),
                            },
                          ]
                        : []),
                    ]}
                  />
                </div>

                {visible.length === 0 ? (
                  <p className="rounded-card bg-surface py-10 text-center text-sm font-light text-muted shadow-card">
                    {t('companies.empty')}
                  </p>
                ) : (
                  <ul
                    aria-label={t('companies.list')}
                    className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4"
                  >
                    {onPage.map((company) => (
                      <li key={company.id}>
                        <EntityCard
                          entity={company}
                          to={`/empresas/${company.id}`}
                          meta={t(`companies.sector_${company.sector}`)}
                          place={company.place}
                          badge={company.programs.length > 0 ? t('companies.hasPrograms') : undefined}
                        />
                      </li>
                    ))}
                  </ul>
                )}
                <Pagination page={page} pages={pages} onChange={goTo} label={t('companies.pages')} />
              </section>

              <section
                aria-labelledby="method"
                className="rounded-card bg-coal p-6 text-white shadow-card sm:p-8"
              >
                <SectionHeading id="method" title={t('companies.howTitle')} icon="info" tone="dark" />
                <p className="max-w-prose text-sm font-light text-white/80">{t('companies.howBody')}</p>
              </section>
            </>
          )
        }}
      </QueryState>
    </div>
  )
}
