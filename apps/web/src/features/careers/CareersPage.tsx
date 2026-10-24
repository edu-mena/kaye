import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { CareerCard } from '../../components/CareerCard'
import { DemandMeter } from '../../components/DemandMeter'
import { GROUP_ICONS } from '../../components/groupIcons'
import { Icon, type IconName } from '../../components/icons'
import { HERO_CONTROL, HeroField, ListHero } from '../../components/ListHero'
import { PhotoCredits } from '../../components/PhotoCredits'
import { QueryState } from '../../components/QueryState'
import { FilterSelect, FilterTiles } from '../../components/ui/Filters'
import { SectionHeading } from '../../components/ui/PageHeader'
import { Pagination } from '../../components/ui/Pagination'
import { Segmented } from '../../components/ui/Segmented'
import { useCareers } from '../../data/queries'
import { CAREER_GROUPS, type CareerGroup, type CareerSummary } from '../../data/types'
import { filterCareers, type CareerSort } from '../../domain/careers'
import { interestLevel } from '../../domain/fit'
import { formatKz } from '../../domain/format'
import { compatibility } from '../../domain/riasec'
import { paginate } from '../../lib/pagination'
import { useUrlFilters } from '../../lib/useUrlFilters'
import { useRiasecProfile } from '../../state/useRiasecProfile'

const isGroup = (value: string | null): value is CareerGroup => CAREER_GROUPS.some((group) => group === value)

/** Four rows of three on a wide screen. */
const PAGE_SIZE = 12

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
  const list = useRef<HTMLElement>(null)
  // A new search, area or order starts again on the first page.
  const setFilter = (key: string, value: string | null) => setParam(key, value, ['pagina'])

  const sortLabels: Record<CareerSort, string> = {
    forYou: t('careers.sortForYou'),
    demand: t('careers.sortDemand'),
    salary: t('careers.sortSalary'),
  }

  return (
    <QueryState query={query}>
      {(careers) => {
        const results = filterCareers(careers, { query: search, group, sort, profile })
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
              onSearch={(value) => setFilter('q', value || null)}
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
                <div className="flex flex-wrap items-center gap-3">
                  <FilterSelect
                    label={t('careers.groupsLabel')}
                    placeholder={t('careers.allAreas')}
                    value={group}
                    onChange={(value) => setFilter('area', value)}
                    options={groups.map((item) => ({ value: item, label: t(`groups.${item}`) }))}
                  />
                  <Segmented
                    label={t('careers.sortLabel')}
                    value={sort}
                    onChange={(value) => setFilter('ordem', value)}
                    options={sorts.map((value) => ({ value, label: sortLabels[value] }))}
                  />
                </div>
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

            <PhotoCredits photos={careers.map((career) => career.image)} />
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
            {guides.slice(0, 3).map((career, index) => (
              <img
                key={career.slug}
                src={career.image?.small}
                alt=""
                className={`size-full rounded-2xl object-cover object-[center_30%] ${index === 0 ? 'lg:row-span-2' : ''}`}
              />
            ))}
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

/** The areas as tiles with their icon and how many careers each has; pressing one filters the list. */
function Areas({ careers, selected, onSelect }: AreasProps) {
  const { t } = useTranslation()
  return (
    <section aria-labelledby="areas">
      <SectionHeading id="areas" title={t('careers.areasTitle')} icon="compass" />
      <FilterTiles
        selected={selected}
        onSelect={onSelect}
        tiles={CAREER_GROUPS.flatMap((group) => {
          const count = careers.filter((career) => career.group === group).length
          return count === 0
            ? []
            : [
                {
                  value: group,
                  icon: GROUP_ICONS[group],
                  label: t(`groups.${group}`),
                  note: t('careers.count', { count }),
                },
              ]
        })}
      />
    </section>
  )
}

/** The careers with a full page, as large photo cards: where a person should start. */
function Guides({ guides }: { guides: CareerSummary[] }) {
  const { t } = useTranslation()
  return (
    <section aria-labelledby="guides">
      <SectionHeading id="guides" title={t('careers.guidesTitle')} icon="path" />
      <p className="-mt-2 mb-6 max-w-prose text-sm font-light text-copy">{t('careers.guidesBody')}</p>
      <ul className="grid gap-4 md:grid-cols-3">
        {guides.map((career) => (
          <li key={career.slug}>
            <Link
              to={`/carreiras/${career.slug}`}
              className="group relative block h-72 overflow-hidden rounded-card bg-coal text-white shadow-card"
            >
              <img
                src={career.image?.small}
                srcSet={career.image ? `${career.image.small} 800w, ${career.image.large} 1600w` : undefined}
                sizes="(min-width: 768px) 33vw, 100vw"
                alt=""
                className="absolute inset-0 size-full object-cover object-[center_30%] transition duration-500 group-hover:scale-105"
              />
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
      </ul>
    </section>
  )
}
