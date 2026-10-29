import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { ExternalLink } from '../../components/DetailParts'
import { GROUP_ICONS } from '../../components/groupIcons'
import { Icon, type IconName } from '../../components/icons'
import { InstitutionLogo } from '../../components/InstitutionLogo'
import { ErrorState, Loading, RowsSkeleton } from '../../components/PageStates'
import { PathMark } from '../../components/PathMark'
import { PhotoImg } from '../../components/PhotoImg'
import { BarList } from '../../components/ui/BarList'
import { PageHeader } from '../../components/ui/PageHeader'
import { Panel } from '../../components/ui/Panel'
import { Soon } from '../../components/ui/Rows'
import { TabPanel, Tabs } from '../../components/ui/Tabs'
import { useCatalog, useEducation, useEmployment, useJobMarket } from '../../data/queries'
import {
  EDUCATION_LEVELS,
  type CareerSummary,
  type Company,
  type EducationStats,
  type EmploymentStats,
  type JobMarket,
  type MarketArea,
} from '../../data/types'
import { normalize } from '../../domain/careers'
import { formatPercent } from '../../domain/format'
import { areaShares, marketSummary, type AreaShares } from '../../domain/market'
import { stagger } from '../../lib/ui'
import { useUrlFilters } from '../../lib/useUrlFilters'
import { PostingsChart } from '../careers/PostingsChart'

/** The Entidade Recrutadora Única's competitions are announced here (as images, so they are not counted). */
const ENAPP = 'https://www.enapp.gov.ao'

/** How many careers and courses a block shows, and how many employers the wall. */
const TOP = 5
const COURSES = 8
const WALL = 6

const TABS = [
  { id: 'resumo', icon: 'home' },
  { id: 'vagas', icon: 'briefcase' },
  { id: 'estado', icon: 'landmark' },
  { id: 'formacao', icon: 'cap' },
  { id: 'areas', icon: 'chart' },
] as const satisfies readonly { id: string; icon: IconName }[]
type TabId = (typeof TABS)[number]['id']

const AREA_ICONS: Record<MarketArea | 'other', IconName> = {
  technology: 'code',
  engineering: 'building',
  oil_mining: 'pin',
  health: 'plus',
  education: 'cap',
  business: 'briefcase',
  legal: 'landmark',
  public: 'shield',
  communication: 'megaphone',
  agriculture: 'globe',
  hospitality: 'home',
  logistics: 'path',
  sciences: 'compass',
  other: 'info',
}

/** A share as a percentage, with "<1%" rather than a misleading "0%". */
const share = (value: number) => (value > 0 && value < 0.01 ? '<1%' : formatPercent(value))

const day = (iso: string, language: string) =>
  new Intl.DateTimeFormat(language, { day: 'numeric', month: 'short', year: 'numeric' }).format(
    new Date(`${iso}T12:00:00`),
  )

type Data = {
  careers: CareerSummary[]
  companies: Company[]
  jobs: JobMarket
  education: EducationStats
  employment: EmploymentStats
}

/**
 * Mercado: each area from end to end, in tabs (?secao=). The job ads of Angolan job sites in the last 12
 * months (counted, never shown), the public competitions, and the graduates of the official yearbooks:
 * facts side by side, never a verdict on an area (docs/arquitetura.md, 7).
 */
export default function MarketPage() {
  const { t } = useTranslation()
  const catalog = useCatalog()
  const jobs = useJobMarket()
  const education = useEducation()
  const employment = useEmployment()

  const retry = () => {
    catalog.retry()
    if (jobs.isError) void jobs.refetch()
    if (education.isError) void education.refetch()
    if (employment.isError) void employment.refetch()
  }

  return (
    <>
      <PageHeader compact title={t('nav.market')} />
      {catalog.isError || jobs.isError || education.isError || employment.isError ? (
        <ErrorState onRetry={retry} />
      ) : catalog.data && jobs.data && education.data && employment.data ? (
        <Market
          careers={catalog.data.careers}
          companies={catalog.data.companies}
          jobs={jobs.data}
          education={education.data}
          employment={employment.data}
        />
      ) : (
        <Loading>
          <RowsSkeleton count={6} />
        </Loading>
      )}
    </>
  )
}

function Market(data: Data) {
  const { t } = useTranslation()
  const [params, setParam] = useUrlFilters()
  const tabs = TABS.map((tab) => ({ id: tab.id, icon: tab.icon, label: t(`market.tab_${tab.id}`) }))
  const active = tabs.find((tab) => tab.id === params.get('secao')) ?? tabs[0]
  const open = (id: TabId) => setParam('secao', id === 'resumo' ? null : id)
  const panels: Record<TabId, ReactNode> = {
    resumo: <Summary {...data} onOpen={open} />,
    vagas: <Jobs {...data} />,
    estado: <Public jobs={data.jobs} />,
    formacao: <Study {...data} />,
    areas: <Areas jobs={data.jobs} education={data.education} />,
  }

  return (
    // Plain sans-serif figures for every number of the Mercado (font-figures, docs/design.md).
    <div className="space-y-4 font-figures">
      <div className="sticky top-[var(--topbar-space,0px)] z-10 rounded-card bg-surface p-2 shadow-card transition-[top] duration-300">
        <Tabs label={t('market.tabsLabel')} tabs={tabs} value={active.id} onChange={open} idPrefix="market" />
      </div>
      <TabPanel key={active.id} idPrefix="market" id={active.id} variant="bare">
        {panels[active.id]}
      </TabPanel>
    </div>
  )
}

/** Blocks on a 12-column grid from lg (6 from md). */
function Grid({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-1 gap-4 md:grid-cols-6 lg:grid-cols-12">{children}</div>
}

// ---------- Resumo ----------

type Fact = { id: string; icon: IconName; value: string; text: string; tab: TabId }

/** The Mercado in a few sentences, each with its number and a way to the tab behind it. */
function Summary({ careers, jobs, education, onOpen }: Data & { onOpen: (id: TabId) => void }) {
  const { t, i18n } = useTranslation()
  const number = (value: number) => value.toLocaleString(i18n.language)
  const summary = marketSummary(jobs, education)
  const tech = summary.techCareer && careers.find((career) => career.slug === summary.techCareer?.slug)
  const facts: Fact[] = [
    {
      id: 'postings',
      icon: 'megaphone',
      value: number(jobs.postings),
      text: t('market.summaryPostings', { count: jobs.sources.length }),
      tab: 'vagas',
    },
    ...(summary.noExperience !== null
      ? [
          {
            id: 'experience',
            icon: 'award',
            value: share(summary.noExperience),
            text: t('market.summaryExperience'),
            tab: 'vagas',
          } satisfies Fact,
        ]
      : []),
    ...(summary.area
      ? [
          {
            id: 'area',
            icon: AREA_ICONS[summary.area.area],
            value: share(summary.area.share),
            text: t('market.summaryArea', { area: t(`market.area_${summary.area.area}`) }),
            tab: 'areas',
          } satisfies Fact,
        ]
      : []),
    {
      id: 'public',
      icon: 'landmark',
      value: number(summary.publicCompetitions.openings),
      text: t('market.summaryPublic', { count: summary.publicCompetitions.competitions }),
      tab: 'estado',
    },
    {
      id: 'graduates',
      icon: 'cap',
      value: number(summary.graduates.total),
      text: t('market.summaryGraduates', {
        year: summary.graduates.year,
        course: summary.graduates.course?.name ?? '',
      }),
      tab: 'formacao',
    },
    ...(summary.techCareer && tech
      ? [
          {
            id: 'tech',
            icon: 'code',
            value: number(summary.techCareer.postings),
            text: t('market.summaryTech', { career: tech.name }),
            tab: 'vagas',
          } satisfies Fact,
        ]
      : []),
  ]

  // Quiet on purpose: the introduction takes the first two places of the grid, then square tiles with
  // room around each number. The tiles fill one row beside the introduction and the next one below it.
  return (
    <section aria-labelledby="summary-title" className="space-y-10 py-4 sm:py-8">
      <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
        <div className="col-span-2 flex flex-col justify-center py-4 sm:px-2 lg:pr-12">
          <h2 id="summary-title" className="text-3xl leading-tight font-extrabold text-night sm:text-4xl">
            {t('market.summaryTitle')}
          </h2>
          <p className="text-xl font-normal text-night sm:text-2xl">{t('market.summarySubtitle')}</p>
          <p className="mt-4 max-w-md text-base font-light text-copy">{t('market.summaryLead')}</p>
        </div>
        {facts.map((fact, index) => (
          <button
            key={fact.id}
            type="button"
            onClick={() => onOpen(fact.tab)}
            style={stagger(index)}
            className="group relative flex min-h-56 rise flex-col items-center bg-ash-100 px-3 pt-6 pb-5 text-center transition-colors duration-300 hover:bg-ash-200/60 sm:min-h-64 sm:px-6 sm:pt-8"
          >
            <Corners />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 top-0 h-32 [background-image:radial-gradient(var(--color-ash-300)_1px,transparent_1.5px)] [mask-image:radial-gradient(closest-side,black_35%,transparent)] [background-size:14px_14px] sm:h-36"
            />
            <span className="relative grid size-14 place-items-center rounded-full bg-paper text-night transition-colors duration-300 group-hover:bg-gold-soft sm:size-16">
              <Icon name={fact.icon} className="size-6 sm:size-7" />
            </span>
            <span className="mt-5 text-3xl leading-none font-semibold text-night tabular-nums sm:text-4xl">
              {fact.value}
            </span>
            <span className="mt-2 max-w-60 text-xs font-light text-copy sm:text-sm">{fact.text}</span>
            <span className="mt-auto inline-flex items-center gap-1 pt-4 text-xs font-normal text-muted transition-colors group-hover:text-night">
              {t(`market.tab_${fact.tab}`)}
              <Icon name="chevronRight" className="size-3.5" />
            </span>
          </button>
        ))}
      </div>
      <Sources jobs={jobs} education={education} />
    </section>
  )
}

/** Crop marks on two corners of a summary tile; darker under the pointer. */
function Corners() {
  const mark =
    'pointer-events-none absolute size-3 border-ash-500 transition-colors duration-300 group-hover:border-night'
  return (
    <>
      <span aria-hidden="true" className={`${mark} -top-1 -left-1 border-t border-l`} />
      <span aria-hidden="true" className={`${mark} -right-1 -bottom-1 border-r border-b`} />
    </>
  )
}

// ---------- Vagas ----------

function Jobs({ careers, companies, jobs, employment }: Data) {
  const { t, i18n } = useTranslation()
  const number = (value: number) => value.toLocaleString(i18n.language)
  const areas = jobs.areas.filter((entry) => entry.area !== 'other')
  const counted = areas.reduce((sum, entry) => sum + entry.postings, 0) || 1
  const ranking = jobs.careers.flatMap(({ slug, postings }) => {
    const career = careers.find((entry) => entry.slug === slug)
    return career ? [{ career, postings }] : []
  })

  return (
    <Grid>
      {ranking.length > 0 && (
        <Highlight ranking={ranking.slice(0, TOP)} className="md:col-span-6 lg:col-span-5 lg:row-span-2" />
      )}
      <Panel
        id="postings"
        level={2}
        icon="megaphone"
        title={t('market.postingsTitle')}
        className="md:col-span-6 lg:col-span-7"
      >
        <p className="-mt-1 text-3xl leading-none font-semibold text-night tabular-nums">
          {number(jobs.postings)}
        </p>
        <p className="mt-1 mb-4 text-xs font-light text-muted">
          {t('market.postingsMeta', { count: jobs.sources.length, date: day(jobs.updated, i18n.language) })}
        </p>
        <PostingsChart
          label={t('market.postingsMonths')}
          span={3}
          months={jobs.blocks.map((entry) => ({ month: entry.month, count: entry.postings }))}
        />
        <p className="mt-3 text-xs font-light text-muted">{t('market.postingsBlocksNote')}</p>
      </Panel>
      <Panel
        id="areas"
        level={2}
        icon="chart"
        title={t('market.areasTitle')}
        className="md:col-span-6 lg:col-span-7"
      >
        <BarList
          columns={2}
          label={t('market.areasLabel')}
          items={areas.slice(0, 10).map((entry, index) => ({
            label: t(`market.area_${entry.area}`),
            value: entry.postings / (areas[0]?.postings || 1),
            valueLabel: t('market.areasValue', {
              count: number(entry.postings),
              share: share(entry.postings / counted),
            }),
            emphasized: index === 0,
          }))}
        />
      </Panel>
      <Panel
        id="provinces"
        level={2}
        icon="pin"
        title={t('market.provincesTitle')}
        className="md:col-span-3 lg:col-span-5"
      >
        <BarList
          label={t('market.provincesLabel')}
          items={jobs.provinces.slice(0, 6).map((entry, index) => ({
            label: entry.province,
            value: entry.postings / (jobs.provinces[0]?.postings || 1),
            valueLabel: number(entry.postings),
            emphasized: index === 0,
          }))}
        />
      </Panel>
      <Panel
        id="recruiters"
        level={2}
        icon="building"
        title={t('market.recruitersTitle')}
        className="md:col-span-3 lg:col-span-7"
      >
        <Recruiters jobs={jobs} companies={companies} />
        {jobs.agencies.postings > 0 && (
          <p className="mt-3 text-xs font-light text-muted">
            {t('market.agenciesLine', {
              share: share(jobs.agencies.postings / jobs.postings),
              names: jobs.agencies.names.slice(0, 3).join(', '),
            })}
          </p>
        )}
      </Panel>
      <Panel
        id="asks"
        level={2}
        icon="cap"
        title={t('market.asksTitle')}
        className="md:col-span-6 lg:col-span-12"
      >
        <Asks jobs={jobs} />
      </Panel>
      <Panel
        id="unemployment"
        level={2}
        icon="user"
        title={t('market.unemploymentTitle', { year: employment.year })}
        className="md:col-span-6 lg:col-span-12"
      >
        <Unemployment employment={employment} />
      </Panel>
    </Grid>
  )
}

/** Unemployment by age (INE): how hard the first job is, and the young who neither work nor study. */
function Unemployment({ employment }: { employment: EmploymentStats }) {
  const { t } = useTranslation()
  const { youth } = employment
  const top = Math.max(...employment.ages.map((age) => age.rate))
  const facts = [
    t('market.unemploymentYouthPlaces', { urban: share(youth.urban), rural: share(youth.rural) }),
    t('market.unemploymentNeither', { share: share(youth.neitherWorkNorStudy) }),
    t('market.unemploymentAll', { share: share(employment.unemployment) }),
  ]
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <BarList
        label={t('market.unemploymentLabel')}
        items={employment.ages.map((age, index) => ({
          label: age.to
            ? t('market.ageRange', { from: age.from, to: age.to })
            : t('market.ageFrom', { from: age.from }),
          value: age.rate / top,
          valueLabel: share(age.rate),
          emphasized: index === 0,
        }))}
      />
      <div className="space-y-3 text-sm font-light text-copy">
        {facts.map((fact) => (
          <p key={fact}>{fact}</p>
        ))}
        <p className="text-xs text-muted">
          <ExternalLink href={employment.source.url}>
            {t('common.source', { label: employment.source.label })}
          </ExternalLink>
        </p>
      </div>
    </div>
  )
}

/** What the posts ask for: the minimum education, the years of experience and the area of the course. */
function Asks({ jobs }: { jobs: JobMarket }) {
  const { t } = useTranslation()
  const { education, experience, fields } = jobs.asks
  const columns = [
    {
      id: 'education',
      title: t('market.asksEducation'),
      // In the order of the scale, not of the counts.
      rows: EDUCATION_LEVELS.flatMap((level) => {
        const entry = education.find((item) => item.level === level)
        return entry ? [{ label: t(`education.${level}`), postings: entry.postings }] : []
      }),
    },
    {
      id: 'experience',
      title: t('market.asksExperience'),
      rows: experience.map((entry) => ({
        label: t(`market.experience_${entry.band}`),
        postings: entry.postings,
      })),
    },
    {
      id: 'fields',
      title: t('market.asksFields'),
      rows: fields
        .slice(0, 5)
        .map((entry) => ({ label: t(`market.area_${entry.area}`), postings: entry.postings })),
    },
  ].filter((column) => column.rows.some((row) => row.postings > 0))

  return (
    <>
      <div className="grid gap-6 md:grid-cols-3">
        {columns.map((column) => {
          const total = column.rows.reduce((sum, row) => sum + row.postings, 0)
          const top = Math.max(...column.rows.map((row) => row.postings))
          return (
            <div key={column.id}>
              <h3 className="mb-3 text-xs font-semibold text-night">{column.title}</h3>
              <BarList
                label={column.title}
                items={column.rows.map((row) => ({
                  label: row.label,
                  value: row.postings / top,
                  valueLabel: share(row.postings / total),
                  emphasized: row.postings === top,
                }))}
              />
            </div>
          )
        })}
      </div>
      <p className="mt-4 text-xs font-light text-muted">
        {t('market.asksNote', { count: education.reduce((sum, entry) => sum + entry.postings, 0) })}
      </p>
    </>
  )
}

type Ranked = { career: CareerSummary; postings: number }

/** The tech careers with the most job ads on near-black: the first with its photo and area, then the next. */
function Highlight({ ranking, className }: { ranking: Ranked[]; className: string }) {
  const { t } = useTranslation()
  const [first, ...rest] = ranking
  if (!first) return null
  const { career } = first

  return (
    <section
      aria-labelledby="demanded"
      className={`flex rise flex-col rounded-card bg-night p-4 text-white sm:p-5 ${className}`}
    >
      <div className="flex items-center justify-between gap-3">
        <h2 id="demanded" className="flex items-center gap-2 text-sm font-semibold">
          <span className="grid size-6 shrink-0 place-items-center rounded-full bg-white/10 text-gold">
            <Icon name="briefcase" className="size-3.5" />
          </span>
          {t('market.demandedTitle')}
        </h2>
        <Link
          to="/carreiras"
          className="flex shrink-0 items-center gap-1 text-xs font-normal text-white hover:text-gold"
        >
          {t('market.seeAll')}
          <span className="sr-only">: {t('market.demandedTitle')}</span>
          <Icon name="chevronRight" className="size-3.5" />
        </Link>
      </div>

      <Link to={`/carreiras/${career.slug}`} className="group mt-3 block">
        <span className="relative isolate block h-40 overflow-hidden rounded-2xl bg-coal sm:h-44">
          {career.image ? (
            <PhotoImg
              photo={career.image}
              sizes="(min-width: 1024px) 35vw, 100vw"
              priority
              className="absolute inset-0 -z-10 size-full object-cover"
            />
          ) : (
            <PathMark className="absolute -right-10 -bottom-6 -z-10 w-72 max-w-none opacity-60" />
          )}
          <span
            aria-hidden="true"
            className="absolute inset-0 -z-10 bg-linear-to-t from-night/80 to-transparent"
          />
          <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-night/80 px-2.5 py-1 text-xs font-normal">
            <Icon name={GROUP_ICONS[career.group]} className="size-3.5 text-gold" />
            {t(`groups.${career.group}`)}
          </span>
        </span>
        <span className="mt-3 block text-lg leading-tight font-extrabold group-hover:underline">
          {career.name}
        </span>
        <span className="mt-1 block text-sm font-semibold text-gold">
          {t('market.postingsCount', { count: first.postings })}
        </span>
      </Link>

      <ol start={2} className="mt-4 divide-y divide-white/10 border-t border-white/10">
        {rest.map(({ career: next, postings }, index) => (
          <li key={next.slug}>
            <Link
              to={`/carreiras/${next.slug}`}
              className="flex items-center gap-3 py-2.5 transition-colors hover:text-gold"
            >
              <span className="w-4 shrink-0 text-center text-sm font-bold text-gold tabular-nums">
                {index + 2}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold">{next.name}</span>
                <span className="block truncate text-xs font-light text-white/70">
                  {t(`groups.${next.group}`)}
                </span>
              </span>
              <span className="shrink-0 text-xs font-normal text-white/80 tabular-nums">
                {t('market.postingsCount', { count: postings })}
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </section>
  )
}

/** The employers with the most job ads; with their logo and page when Kayé knows them. */
function Recruiters({ jobs, companies }: { jobs: JobMarket; companies: Company[] }) {
  const { t } = useTranslation()
  const known = (name: string) => {
    const key = normalize(name)
    return companies.find((company) => {
      const own = normalize(company.name)
      return own === key || key.includes(own) || own.includes(key)
    })
  }
  const tile = 'flex h-full flex-col items-center gap-1.5 rounded-xl bg-paper px-2 py-3 text-center'
  return (
    <ul className="grid grid-cols-3 gap-2">
      {jobs.companies.slice(0, WALL).map((entry) => {
        const company = known(entry.name)
        const content = (
          <>
            <InstitutionLogo institution={company ?? { name: entry.name }} />
            <span className="line-clamp-2 text-xs font-semibold text-night">
              {company?.name ?? entry.name}
            </span>
            <span className="text-[11px] font-light text-muted">
              {t('market.postingsCount', { count: entry.postings })}
            </span>
          </>
        )
        return (
          <li key={entry.name}>
            {company ? (
              <Link to={`/empresas/${company.id}`} className={`${tile} transition-colors hover:bg-ash-100`}>
                {content}
              </Link>
            ) : (
              <div className={tile}>{content}</div>
            )}
          </li>
        )
      })}
    </ul>
  )
}

// ---------- Estado ----------

/** Public competitions: how many, how many posts they announced, who opened them and where. */
function Public({ jobs }: { jobs: JobMarket }) {
  const { t, i18n } = useTranslation()
  const number = (value: number) => value.toLocaleString(i18n.language)
  const { public: state } = jobs

  return (
    <Grid>
      <Panel
        id="public"
        level={2}
        icon="landmark"
        title={t('market.publicTitle')}
        className="md:col-span-3 lg:col-span-5"
      >
        <p className="-mt-1 text-3xl leading-none font-semibold text-night tabular-nums">
          {number(state.openings)}
        </p>
        <p className="mt-1 text-sm font-light text-copy">
          {t('market.publicMeta', { count: state.competitions })}
        </p>
        <p className="mt-3 text-xs font-light text-muted">
          {t('market.publicNote', { known: state.withOpenings, total: state.competitions })}
        </p>
        <p className="mt-2 text-xs font-normal text-night">
          {t('market.publicOfficialLine', { openings: number(state.official.openings) })}
        </p>
      </Panel>
      <Panel
        id="public-areas"
        level={2}
        icon="chart"
        title={t('market.publicAreasTitle')}
        className="md:col-span-3 lg:col-span-7"
      >
        <BarList
          columns={2}
          label={t('market.publicAreasTitle')}
          items={state.areas.map((entry, index) => ({
            label: t(`market.area_${entry.area}`),
            value: entry.openings / (state.areas[0]?.openings || 1),
            valueLabel: number(entry.openings),
            emphasized: index === 0,
          }))}
        />
      </Panel>
      <Panel
        id="bodies"
        level={2}
        icon="building"
        title={t('market.publicBodiesTitle')}
        className="md:col-span-3 lg:col-span-7"
      >
        <BarList
          label={t('market.publicBodiesTitle')}
          items={state.bodies.map((body, index) => ({
            label: body.name,
            value: body.openings / (state.bodies[0]?.openings || 1),
            valueLabel: number(body.openings),
            emphasized: index === 0,
          }))}
        />
      </Panel>
      <Panel
        id="public-provinces"
        level={2}
        icon="pin"
        title={t('market.publicProvincesTitle')}
        className="md:col-span-3 lg:col-span-5"
      >
        <BarList
          label={t('market.publicProvincesTitle')}
          items={state.provinces.slice(0, 6).map((entry, index) => ({
            label: entry.province,
            value: entry.postings / (state.provinces[0]?.postings || 1),
            valueLabel: t('market.competitionsCount', { count: entry.postings }),
            emphasized: index === 0,
          }))}
        />
      </Panel>
      <Panel
        id="public-official"
        level={2}
        icon="newspaper"
        title={t('market.publicOfficialTitle')}
        className="md:col-span-6 lg:col-span-12"
      >
        <ul className="grid gap-x-6 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
          {state.official.competitions.map((competition) => (
            <li key={competition.body} className="flex items-start gap-3">
              <span className="grid size-8 shrink-0 place-items-center rounded-full bg-coal text-gold">
                <Icon name={AREA_ICONS[competition.area]} className="size-4" />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-normal text-night">{competition.body}</span>
                <span className="block text-xs font-light text-muted">
                  {t('market.openingsCount', {
                    count: competition.openings,
                    value: number(competition.openings),
                  })}{' '}
                  ·{' '}
                  {t('market.publicOfficialDispatches', {
                    count: competition.dispatches,
                    date: day(competition.date, i18n.language),
                  })}
                </span>
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-4 space-x-3 text-xs font-light text-muted">
          <ExternalLink href={state.official.source.url}>
            {t('common.source', { label: state.official.source.name })}
          </ExternalLink>
          <ExternalLink href={ENAPP}>{t('market.publicEnapp')}</ExternalLink>
        </p>
      </Panel>
    </Grid>
  )
}

// ---------- Formação ----------

function Study({ companies, education }: Data) {
  const { t, i18n } = useTranslation()
  const number = (value: number) => value.toLocaleString(i18n.language)
  const youth = companies.flatMap((company) => company.programs.map((program) => ({ company, program })))
  const sources = [...new Map(education.series.map((entry) => [entry.source.url, entry.source])).values()]
  const { access } = education
  const figures = [
    { id: 'candidates', value: access.candidates, text: t('market.accessCandidates') },
    {
      id: 'firstTime',
      value: access.firstTime,
      text: t('market.accessFirstTime', { share: share(access.firstTime / access.candidates) }),
    },
    { id: 'enrolled', value: access.enrolled, text: t('market.accessEnrolled') },
  ]

  return (
    <Grid>
      <Panel
        id="graduates"
        level={2}
        icon="cap"
        title={t('market.graduatesTitle')}
        className="md:col-span-3 lg:col-span-7"
      >
        <p className="-mt-1 mb-3 text-xs font-light text-muted">
          {t('market.graduatesNote', { year: education.year })}
        </p>
        <CourseBars
          education={education}
          field="graduates"
          label={t('market.graduatesLabel', { year: education.year })}
        />
      </Panel>
      <Panel
        id="access"
        level={2}
        icon="compass"
        title={t('market.accessTitle', { year: education.year })}
        className="md:col-span-3 lg:col-span-5"
      >
        <ul className="space-y-3">
          {figures.map((item) => (
            <li key={item.id}>
              <span className="block text-2xl leading-none font-semibold text-night tabular-nums">
                {number(item.value)}
              </span>
              <span className="mt-1 block text-sm font-light text-copy">{item.text}</span>
            </li>
          ))}
        </ul>
      </Panel>
      <Panel
        id="studying"
        level={2}
        icon="user"
        title={t('market.studyingTitle')}
        className="md:col-span-3 lg:col-span-7"
      >
        <p className="-mt-1 mb-3 text-xs font-light text-muted">
          {t('market.studyingNote', { year: education.year })}
        </p>
        <CourseBars education={education} field="enrolled" label={t('market.studyingTitle')} />
      </Panel>
      <Panel
        id="series"
        level={2}
        icon="chart"
        title={t('market.seriesTitle')}
        className="md:col-span-3 lg:col-span-5"
      >
        <BarList
          label={t('market.seriesLabel')}
          items={education.series.map((entry, index) => ({
            label: entry.year,
            value: entry.graduates / Math.max(...education.series.map((item) => item.graduates)),
            valueLabel: number(entry.graduates),
            emphasized: index === education.series.length - 1,
          }))}
        />
        <ul className="mt-3 space-y-1 text-xs font-light text-muted">
          {sources.map((source) => (
            <li key={source.url}>
              <ExternalLink href={source.url}>{t('common.source', { label: source.label })}</ExternalLink>
            </li>
          ))}
        </ul>
      </Panel>
      <Panel
        id="programs"
        level={2}
        icon="award"
        title={t('market.programsTitle')}
        className="md:col-span-3 lg:col-span-7"
      >
        <ul className="divide-y divide-line">
          {youth.map(({ company, program }) => (
            <li key={`${company.id}-${program.name}`} className="flex gap-3 py-3 first:pt-0 last:pb-0">
              <InstitutionLogo institution={company} size="sm" />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-night">
                  <Link to={`/empresas/${company.id}`} className="hover:text-blue">
                    {company.name}
                  </Link>
                  {`: ${program.name}`}
                </p>
                <p className="mt-0.5 text-xs font-light text-copy">{program.summary}</p>
                <p className="mt-1 text-xs font-light text-muted">
                  <ExternalLink href={program.source.url}>
                    {t('common.source', { label: program.source.label })}
                  </ExternalLink>
                </p>
              </div>
            </li>
          ))}
        </ul>
      </Panel>
      <Panel
        id="abroad"
        level={2}
        icon="globe"
        title={t('market.abroadTitle')}
        action={<Soon />}
        tone="muted"
        className="md:col-span-3 lg:col-span-5"
      >
        <p className="text-xs font-light text-copy">{t('market.abroadBody')}</p>
      </Panel>
    </Grid>
  )
}

/** The biggest courses by graduates or by students now, in two columns. */
function CourseBars({
  education,
  field,
  label,
}: {
  education: EducationStats
  field: 'graduates' | 'enrolled'
  label: string
}) {
  const { i18n } = useTranslation()
  const courses = education.areas
    .flatMap((entry) => entry.courses)
    .toSorted((a, b) => b[field] - a[field])
    .slice(0, COURSES)
  return (
    <BarList
      columns={2}
      label={label}
      items={courses.map((course, index) => ({
        label: course.name,
        value: course[field] / (courses[0]?.[field] || 1),
        valueLabel: course[field].toLocaleString(i18n.language),
        emphasized: index === 0,
      }))}
    />
  )
}

// ---------- Por área ----------

/**
 * Each area from end to end: its job ads and graduates and their shares, side by side. A card per area
 * below lg (nothing scrolls sideways), the whole table above. How to read it and the sources go under it.
 */
function Areas({ jobs, education }: { jobs: JobMarket; education: EducationStats }) {
  const { t, i18n } = useTranslation()
  const number = (value: number) => value.toLocaleString(i18n.language)
  const rows = areaShares(jobs, education)
  const columns = [
    t('market.colPostings'),
    t('market.colPublic'),
    t('market.colGraduates', { year: education.year }),
    t('market.colEnrolled', { year: education.year }),
  ]
  // Each area's job ads (mostly private), posts in public competitions, graduates and students now, with their
  // shares.
  const measures = (entry: AreaShares) => [
    {
      id: 'postings',
      count: entry.postings,
      share: entry.postingsShare,
      text: t('market.postingsCount', { count: entry.postings }),
    },
    {
      id: 'public',
      count: entry.publicOpenings,
      share: entry.publicShare,
      text: t('market.openingsCount', { count: entry.publicOpenings, value: number(entry.publicOpenings) }),
    },
    {
      id: 'graduates',
      count: entry.graduates,
      share: entry.graduatesShare,
      text: t('market.graduatesCount', { count: entry.graduates, year: education.year }),
    },
    {
      id: 'enrolled',
      count: entry.enrolled,
      share: entry.enrolledShare,
      text: t('market.enrolledCount', { count: entry.enrolled, value: number(entry.enrolled) }),
    },
  ]

  return (
    <section aria-labelledby="areas-overview" className="space-y-3">
      <h2 id="areas-overview" className="sr-only">
        {t('market.tab_areas')}
      </h2>
      <p className="rounded-2xl bg-ash-100 p-4 text-sm font-light text-copy">
        {t('market.howToRead', { year: education.year })}
      </p>
      <ul className="space-y-2 lg:hidden">
        {rows.map((entry) => (
          <li key={entry.area} className="flex items-center gap-3 rounded-2xl bg-surface p-3 shadow-card">
            <AreaIcon area={entry.area} />
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold text-night">{t(`market.area_${entry.area}`)}</span>
              {measures(entry).map((measure) => (
                <span key={measure.id} className="block text-xs font-light text-muted">
                  {measure.text} ({share(measure.share)})
                </span>
              ))}
            </span>
          </li>
        ))}
      </ul>
      <div className="hidden overflow-hidden rounded-2xl bg-surface shadow-card lg:block">
        <table className="w-full text-sm">
          <caption className="sr-only">{t('market.tableCaption')}</caption>
          <thead>
            <tr className="border-b border-line text-xs text-muted">
              <th scope="col" className="px-4 py-3 text-left font-semibold">
                {t('market.colArea')}
              </th>
              {columns.map((label) => (
                <th key={label} scope="col" className="px-4 py-3 text-right font-semibold">
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.map((entry) => (
              <tr key={entry.area}>
                <th scope="row" className="px-4 py-2 text-left font-semibold text-night">
                  <span className="flex items-center gap-2">
                    <AreaIcon area={entry.area} />
                    {t(`market.area_${entry.area}`)}
                  </span>
                </th>
                {measures(entry).map((measure) => (
                  <td key={measure.id} className="px-4 py-2.5 text-right tabular-nums">
                    {number(measure.count)} <span className="text-muted">· {share(measure.share)}</span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Sources jobs={jobs} education={education} />
    </section>
  )
}

function AreaIcon({ area }: { area: AreaShares['area'] }) {
  return (
    <span className="grid size-8 shrink-0 place-items-center rounded-full bg-coal text-gold">
      <Icon name={AREA_ICONS[area]} className="size-4" />
    </span>
  )
}

/** Where every number comes from, and what the job ads leave out. */
function Sources({ jobs, education }: { jobs: JobMarket; education: EducationStats }) {
  const { t, i18n } = useTranslation()
  return (
    <div className="space-y-1 px-1 text-xs font-light text-muted">
      <p>{t('market.jobsBias')}</p>
      <p>
        {t('market.sourcesJobs', {
          from: day(jobs.from, i18n.language),
          to: day(jobs.updated, i18n.language),
        })}{' '}
        {jobs.sources.map((source, index) => (
          <span key={source.id}>
            {index > 0 && ', '}
            <ExternalLink href={source.url}>{source.name}</ExternalLink> (
            {source.postings.toLocaleString(i18n.language)})
          </span>
        ))}
      </p>
      <p>
        {t('market.sourcesEducation')}{' '}
        <ExternalLink href={education.source.url}>{education.source.label}</ExternalLink>.{' '}
        {t('market.educationLag', { year: education.year })}
      </p>
    </div>
  )
}
