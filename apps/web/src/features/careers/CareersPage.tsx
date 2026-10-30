import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { CareerCard } from '../../components/CareerCard'
import { DemandMeter } from '../../components/DemandMeter'
import { GROUP_ICONS } from '../../components/groupIcons'
import { Icon, type IconName } from '../../components/icons'
import { HERO_CONTROL, HeroField, ListHero } from '../../components/ListHero'
import { ListSkeleton } from '../../components/PageStates'
import { PhotoImg } from '../../components/PhotoImg'
import { QueryState } from '../../components/QueryState'
import { CardRow } from '../../components/ui/CardRow'
import { FilterBar, FilterTiles } from '../../components/ui/Filters'
import { SectionHeading } from '../../components/ui/PageHeader'
import { Pagination } from '../../components/ui/Pagination'
import { Segmented } from '../../components/ui/Segmented'
import { useCareers } from '../../data/queries'
import {
  CAREER_GROUPS,
  GROUP_AREAS,
  MARKET_AREAS,
  type CareerGroup,
  type CareerSummary,
  type Demand,
  type MarketArea,
} from '../../data/types'
import { SALARY_BANDS, findBand } from '../../domain/bands'
import { filterCareers, type CareerSort } from '../../domain/careers'
import { interestLevel } from '../../domain/fit'
import { formatKz } from '../../domain/format'
import { compatibility } from '../../domain/riasec'
import { paginate } from '../../lib/pagination'
import { useUrlFilters, useUrlText } from '../../lib/useUrlFilters'
import { useRiasecProfile } from '../../state/useRiasecProfile'

const isGroup = (value: string | null): value is CareerGroup => CAREER_GROUPS.some((group) => group === value)
const DEMANDS: Demand[] = ['alta', 'media', 'baixa']
const GUIDES = ['guia', 'curadoria'] as const
/** The list's filters in the URL; "Limpar filtros" removes them all (and the page). */
const FILTER_KEYS = ['area', 'procura', 'salario', 'guia']

/** Four rows of three on a wide screen. */
const PAGE_SIZE = 12

export default function CareersPage() {
  const { t } = useTranslation()
  const query = useCareers()
  const { profile } = useRiasecProfile()
  const [params, setParam] = useUrlFilters()
  const [search, setSearch] = useUrlText('q')
  const groupParam = params.get('area')
  const group = isGroup(groupParam) ? groupParam : null
  const sortParam = params.get('ordem')
  const sorts: CareerSort[] = profile ? ['forYou', 'demand', 'salary'] : ['demand', 'salary']
  const sort = sorts.find((option) => option === sortParam) ?? sorts[0] ?? 'demand'
  const demand = DEMANDS.find((value) => value === params.get('procura')) ?? null
  const salary = findBand(SALARY_BANDS, params.get('salario'))
  const guide = GUIDES.find((value) => value === params.get('guia')) ?? null
  const list = useRef<HTMLElement>(null)
  // A new search, area or order starts again on the first page.
  const setFilter = (key: string, value: string | null) => setParam(key, value, ['pagina'])

  const sortLabels: Record<CareerSort, string> = {
    forYou: t('careers.sortForYou'),
    demand: t('careers.sortDemand'),
    salary: t('careers.sortSalary'),
  }

  return (
    <QueryState query={query} loading={<ListSkeleton />}>
      {(careers) => {
        const results = filterCareers(careers, { query: search, group, sort, profile, demand, salary, guide })
        const guides = careers.filter((career) => career.detailed && career.image)
        const groups = CAREER_GROUPS.filter((item) => careers.some((career) => career.group === item))
        const { page, pages, shown } = paginate(results, Number(params.get('pagina')), PAGE_SIZE)
        const goTo = (next: number) => {
          setParam('pagina', next > 1 ? String(next) : null)
          list.current?.scrollIntoView?.({ behavior: 'smooth', block: 'start' })
        }
        return (
          <div className="space-y-12">
            <Hero
              careers={careers}
              guides={guides}
              search={search}
              onSearch={(value) => setSearch(value, ['pagina'])}
            />
            <Areas careers={careers} selected={group} onSelect={(value) => setFilter('area', value)} />
            {!search && !group && guides.length > 0 && <Guides guides={guides} />}

            <section ref={list} aria-labelledby="all-careers" className="scroll-mt-24">
              <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <h2 id="all-careers" className="text-xl font-extrabold text-night sm:text-2xl">
                    {group ? t(`groups.${group}`) : t('careers.allTitle')}
                  </h2>
                  <output className="mt-1 block text-xs font-light text-muted">
                    {t('careers.count', { count: results.length })}
                  </output>
                </div>
                <Segmented
                  label={t('careers.sortLabel')}
                  value={sort}
                  onChange={(value) => setFilter('ordem', value)}
                  options={sorts.map((value) => ({ value, label: sortLabels[value] }))}
                />
              </div>
              <div className="mb-6">
                <FilterBar
                  clearLabel={t('common.clearFilters')}
                  onChange={setFilter}
                  onClear={() => setParam('pagina', null, FILTER_KEYS)}
                  filters={[
                    {
                      key: 'area',
                      label: t('careers.groupsLabel'),
                      placeholder: t('careers.allAreas'),
                      value: group,
                      options: groups.map((item) => ({ value: item, label: t(`groups.${item}`) })),
                    },
                    {
                      key: 'procura',
                      label: t('careers.demandLabel'),
                      placeholder: t('careers.anyDemand'),
                      value: demand,
                      options: DEMANDS.map((value) => ({ value, label: t(`demand.${value}`) })),
                    },
                    {
                      key: 'salario',
                      label: t('careers.salaryLabel'),
                      placeholder: t('careers.anySalary'),
                      value: salary?.key ?? null,
                      options: SALARY_BANDS.map((band) => ({
                        value: band.key,
                        label: t(`careers.salary_${band.key}`),
                      })),
                    },
                    {
                      key: 'guia',
                      label: t('careers.guideLabel'),
                      placeholder: t('careers.anyGuide'),
                      value: guide,
                      options: [
                        { value: 'guia', label: t('careers.guideTag') },
                        { value: 'curadoria', label: t('careers.inCuration') },
                      ],
                    },
                  ]}
                />
              </div>
              {results.length === 0 ? (
                <p className="rounded-card bg-surface py-10 text-center text-sm font-light text-muted shadow-card">
                  {t('careers.empty')}
                </p>
              ) : (
                <ul className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-3 2xl:grid-cols-4">
                  {shown.map((career) => (
                    <li key={career.slug}>
                      <CareerCard
                        career={career}
                        brief
                        match={profile ? interestLevel(compatibility(profile, career.riasec)) : undefined}
                      />
                    </li>
                  ))}
                </ul>
              )}
              <Pagination page={page} pages={pages} onChange={goTo} label={t('careers.pages')} />
            </section>
          </div>
        )
      }}
    </QueryState>
  )
}

type HeroProps = {
  careers: CareerSummary[]
  guides: CareerSummary[]
  search: string
  onSearch: (value: string) => void
}

/** What the section is, a large search, three numbers, and the career photos as a mosaic. */
function Hero({ careers, guides, search, onSearch }: HeroProps) {
  const { t } = useTranslation()
  const areas = new Set(careers.map((career) => career.group)).size
  const stats = [
    { icon: 'briefcase', value: careers.length, label: t('careers.statCareers') },
    { icon: 'compass', value: areas, label: t('careers.statAreas') },
    {
      icon: 'path',
      value: careers.filter((career) => career.detailed).length,
      label: t('careers.statGuides'),
    },
  ] satisfies { icon: IconName; value: number; label: string }[]

  return (
    <ListHero
      title={t('careers.title')}
      body={t('careers.body')}
      stats={stats}
      control={
        <label className="block">
          <span className="sr-only">{t('careers.search')}</span>
          <HeroField icon="search">
            <input
              type="search"
              value={search}
              placeholder={t('careers.searchPlaceholder')}
              onChange={(event) => onSearch(event.target.value)}
              className={HERO_CONTROL}
            />
          </HeroField>
        </label>
      }
      media={
        guides.length >= 3 && (
          <div
            aria-hidden="true"
            className="grid h-44 grid-cols-3 gap-2 sm:h-56 lg:h-full lg:grid-cols-2 lg:grid-rows-2"
          >
            {guides
              .slice(0, 3)
              .flatMap((career, index) =>
                career.image
                  ? [
                      <PhotoImg
                        key={career.slug}
                        photo={career.image}
                        sizes="(min-width: 1024px) 25vw, 33vw"
                        priority
                        className={`size-full rounded-2xl object-cover object-[center_30%] ${index === 0 ? 'lg:row-span-2' : ''}`}
                      />,
                    ]
                  : [],
              )}
          </div>
        )
      }
    />
  )
}

type AreasProps = {
  careers: CareerSummary[]
  selected: CareerGroup | null
  onSelect: (value: CareerGroup | null) => void
}

/**
 * The areas of the catalogue (technology, health…) as a row of buttons and, below, the groups of the one chosen as
 * tiles with their icon and how many careers each has; pressing a tile filters the list. One area at a time: all of
 * them, with every group, would fill several screens.
 */
function Areas({ careers, selected, onSelect }: AreasProps) {
  const { t } = useTranslation()
  const areas = MARKET_AREAS.filter((area) => careers.some((career) => GROUP_AREAS[career.group] === area))
  const [shown, setShown] = useState<MarketArea | undefined>(selected ? GROUP_AREAS[selected] : areas[0])
  // A group chosen elsewhere (the list's filter) brings its area into view.
  const [seen, setSeen] = useState(selected)
  if (selected !== seen) {
    setSeen(selected)
    if (selected) setShown(GROUP_AREAS[selected])
  }
  const tiles = CAREER_GROUPS.flatMap((group) => {
    const count = careers.filter((career) => career.group === group).length
    return GROUP_AREAS[group] !== shown || count === 0
      ? []
      : [
          {
            value: group,
            icon: GROUP_ICONS[group],
            label: t(`groups.${group}`),
            note: t('careers.count', { count }),
          },
        ]
  })
  const options = areas.map((area) => ({ value: area, label: t(`market.area_${area}`) }))
  return (
    <section aria-labelledby="areas">
      <SectionHeading id="areas" title={t('careers.areasTitle')} icon="compass" />
      {/* On phones a select: thirteen long names do not fit a row. */}
      <label className="relative mb-4 block sm:hidden">
        <span className="sr-only">{t('careers.areasTitle')}</span>
        <select
          value={shown ?? ''}
          onChange={(event) => setShown(areas.find((area) => area === event.target.value))}
          className="h-11 w-full appearance-none rounded-full border border-line bg-surface pr-10 pl-4 text-sm text-night *:bg-surface"
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <Icon
          name="chevronRight"
          className="pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2 rotate-90 text-muted"
        />
      </label>
      <div className="mb-4 hidden sm:block">
        <Segmented
          label={t('careers.areasTitle')}
          options={options}
          value={shown ?? null}
          onChange={(area) => area && setShown(area)}
        />
      </div>
      <FilterTiles selected={selected} onSelect={onSelect} tiles={tiles} />
    </section>
  )
}

/**
 * The careers with a full page, as large photo cards in a row that slides (one and a bit on a phone, three on a
 * screen): where a person should start, however many guides there are.
 */
function Guides({ guides }: { guides: CareerSummary[] }) {
  const { t } = useTranslation()
  return (
    <section aria-labelledby="guides">
      <SectionHeading id="guides" title={t('careers.guidesTitle')} icon="path" />
      <p className="-mt-2 mb-6 max-w-prose text-sm font-light text-copy">{t('careers.guidesBody')}</p>
      <CardRow label={t('careers.guidesTitle')}>
        {guides.map((career) => (
          <li key={career.slug} className="w-[80%] shrink-0 snap-start md:w-[calc(33.333%-0.5rem)]">
            <Link
              to={`/carreiras/${career.slug}`}
              className="group relative block h-72 overflow-hidden rounded-card bg-coal text-white shadow-card"
            >
              {career.image && (
                <PhotoImg
                  photo={career.image}
                  sizes="(min-width: 768px) 33vw, 80vw"
                  className="absolute inset-0 size-full object-cover object-[center_30%] transition duration-500 group-hover:scale-105"
                />
              )}
              <span
                aria-hidden="true"
                className="absolute inset-0 bg-linear-to-t from-coal via-coal/60 to-transparent"
              />
              <span className="absolute top-4 left-4 inline-flex items-center gap-1.5 rounded-full bg-coal/80 px-3 py-1 text-xs font-light text-white">
                <Icon name="path" className="size-3.5 text-gold" />
                {t('careers.guideTag')}
              </span>
              <span className="absolute inset-x-0 bottom-0 p-5">
                <span className="block text-xs font-light text-white/75">{t(`groups.${career.group}`)}</span>
                <span className="mt-1 block text-xl leading-tight font-extrabold">{career.name}</span>
                <span className="mt-4 flex flex-wrap items-center justify-between gap-3">
                  <span className="text-sm font-semibold">
                    {career.salaryMedian !== null &&
                      t('careers.perMonth', { value: formatKz(career.salaryMedian) })}
                  </span>
                  <DemandMeter demand={career.demand} tone="dark" />
                </span>
              </span>
            </Link>
          </li>
        ))}
      </CardRow>
    </section>
  )
}
