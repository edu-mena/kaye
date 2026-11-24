import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router'
import { CareerCard } from '../../components/CareerCard'
import { Icon, type IconName } from '../../components/icons'
import { DetailSkeleton, NotFoundState } from '../../components/PageStates'
import { PathMark } from '../../components/PathMark'
import { PhotoImg } from '../../components/PhotoImg'
import { QueryState } from '../../components/QueryState'
import { WhereToStudyRail, WhoHiresRail } from '../../components/RelatedRails'
import { ButtonLink } from '../../components/ui/Button'
import { SectionHeading } from '../../components/ui/PageHeader'
import { useAcademies, useCareers, useCompanies, useNews, usePrograms } from '../../data/queries'
import { MARKET_AREAS, type MarketArea, type NewsItem } from '../../data/types'
import { rankPrograms, scorePrograms } from '../../domain/ranking'
import { useNewsForMe } from '../../lib/useNewsForMe'
import { useDeadlines } from '../../state/useDeadlines'
import { DeadlineRow } from '../deadlines/DeadlineRow'
import { InternshipsForArea } from '../internships/InternshipLinks'
import { newsHref } from '../news/links'
import { ScholarshipLinks } from '../scholarships/ScholarshipLinks'
import { ProgramCard } from '../training/ProgramCard'
import { areaStats, type AreaStats } from './stats'

const SHOWN = 6
const DEMAND_ORDER = { alta: 0, media: 1, baixa: 2 }
const isArea = (value: string): value is MarketArea => MARKET_AREAS.some((area) => area === value)

/** One area: its news, careers, courses, where to study, who hires, grants, internships and deadlines. Only sections with content. */
export default function AreaPage() {
  const { t } = useTranslation()
  const { area = '' } = useParams()
  const query = useCareers()
  const { data: programs = [] } = usePrograms()
  const { data: academies = [] } = useAcademies()
  const { data: companies = [] } = useCompanies()

  return (
    <QueryState query={query} loading={<DetailSkeleton tabs={false} />}>
      {(careers) => {
        const stats = isArea(area) ? areaStats(area, { careers, programs, academies, companies }) : null
        return stats && stats.careers.length > 0 ? (
          <AreaView stats={stats} />
        ) : (
          <NotFoundState
            title={t('areas.notFoundTitle')}
            body={t('areas.notFound')}
            action={{ to: '/areas', label: t('areas.back') }}
          />
        )
      }}
    </QueryState>
  )
}

/** A section's "Ver todas" link. */
function SeeAll({ to }: { to: string }) {
  const { t } = useTranslation()
  return (
    <ButtonLink to={to} variant="ghost" size="sm">
      {t('common.seeAll')}
      <Icon name="arrowRight" className="size-4" />
    </ButtonLink>
  )
}

type AreaSectionProps = {
  id: string
  title: string
  icon: IconName
  seeAllTo: string
  children: React.ReactNode
}

function AreaSection({ id, title, icon, seeAllTo, children }: AreaSectionProps) {
  return (
    <section aria-labelledby={id}>
      <SectionHeading id={id} title={title} icon={icon} action={<SeeAll to={seeAllTo} />} />
      {children}
    </section>
  )
}

function AreaView({ stats }: { stats: AreaStats }) {
  const { t } = useTranslation()
  const { area, photo } = stats
  const slugs = stats.careers.map((career) => career.slug)
  const topCareers = stats.careers
    .toSorted((a, b) => DEMAND_ORDER[a.demand] - DEMAND_ORDER[b.demand] || a.name.localeCompare(b.name))
    .slice(0, SHOWN)
  const topPrograms = rankPrograms(scorePrograms(stats.programs), 'score').ranked.slice(0, SHOWN)
  const { all: deadlines, today } = useDeadlines()
  const areaDeadlines = deadlines.filter((item) => item.areas.includes(area)).slice(0, 3)
  const counts = [
    t('areas.careers', { count: stats.careers.length }),
    t('areas.courses', { count: stats.courses }),
    t('areas.academies', { count: stats.academies }),
    t('areas.companies', { count: stats.companies }),
  ]

  return (
    <div className="space-y-12">
      <header className="relative h-64 overflow-hidden rounded-card bg-night text-white sm:h-72 lg:h-80">
        {photo ? (
          <PhotoImg
            photo={photo}
            sizes="100vw"
            priority
            className="absolute inset-0 size-full object-cover object-[center_30%]"
          />
        ) : (
          <PathMark className="absolute -right-16 bottom-6 w-[30rem] max-w-none opacity-70" />
        )}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-linear-to-t from-night via-night/60 to-night/5"
        />
        <Link
          to="/areas"
          className="absolute top-4 left-4 inline-flex items-center gap-1.5 rounded-full bg-coal/85 px-3 py-1.5 text-sm font-light backdrop-blur-sm hover:bg-coal lg:left-10"
        >
          <Icon name="arrowLeft" className="size-4" />
          {t('areas.back')}
        </Link>
        <div className="absolute inset-x-0 bottom-0 px-4 pb-6 lg:px-10 lg:pb-8">
          <h1 className="max-w-3xl text-[2rem] leading-[1.05] font-bold sm:text-5xl">
            {t(`market.area_${area}`)}
          </h1>
          <p className="mt-3 text-sm font-light text-white/85">{counts.join(' · ')}</p>
        </div>
      </header>

      <AreaNews area={area} />

      <AreaSection
        id="area-careers"
        title={t('areas.careersTitle')}
        icon="compass"
        seeAllTo={`/carreiras?campo=${area}`}
      >
        <ul className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
          {topCareers.map((career) => (
            <li key={career.slug}>
              <CareerCard career={career} brief />
            </li>
          ))}
        </ul>
      </AreaSection>

      {topPrograms.length > 0 && (
        <AreaSection id="area-courses" title={t('areas.coursesTitle')} icon="cap" seeAllTo="/cursos">
          <ul className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
            {topPrograms.map((item, index) => (
              <li key={item.program.id}>
                <ProgramCard item={item} rank={index + 1} to={`/cursos/${item.program.id}`} />
              </li>
            ))}
          </ul>
        </AreaSection>
      )}

      <WhereToStudyRail slugs={slugs} seeAllTo="/academias" />
      <WhoHiresRail slugs={slugs} seeAllTo="/empresas" />

      <div className="grid gap-10 lg:grid-cols-2">
        <div className="min-w-0">
          <ScholarshipLinks areas={[area]} />
        </div>
        <div className="min-w-0">
          <InternshipsForArea area={area} />
        </div>
      </div>

      {areaDeadlines.length > 0 && (
        <AreaSection id="area-deadlines" title={t('areas.deadlinesTitle')} icon="calendar" seeAllTo="/prazos">
          <ul className="space-y-2">
            {areaDeadlines.map((item) => (
              <li key={item.id}>
                <DeadlineRow item={item} today={today} compact />
              </li>
            ))}
          </ul>
        </AreaSection>
      )}
    </div>
  )
}

/** The area's news, the latest as a photo and the next three in rows. Nothing when there is none. */
function AreaNews({ area }: { area: MarketArea }) {
  const { t, i18n } = useTranslation()
  const { data: news = [] } = useNews()
  const { areasOf } = useNewsForMe()
  const items = news
    .filter((item) => areasOf(item).includes(area))
    .toSorted((a, b) => b.date.localeCompare(a.date))
  const [featured, ...others] = items
  if (!featured) return null
  const date = new Intl.DateTimeFormat(i18n.language, { day: 'numeric', month: 'short' })
  const when = (item: NewsItem) => date.format(new Date(`${item.date}T12:00:00`))

  return (
    <AreaSection id="area-news" title={t('areas.newsTitle')} icon="newspaper" seeAllTo="/novidades">
      <div className="grid gap-4 lg:grid-cols-2">
        <Link
          to={newsHref(featured)}
          className="group block overflow-hidden rounded-card bg-surface shadow-card"
        >
          {featured.image && (
            <span className="block h-44 overflow-hidden bg-night sm:h-56">
              <PhotoImg
                photo={featured.image}
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transition-none"
              />
            </span>
          )}
          <span className="block p-5">
            <span className="text-xs font-light text-muted">{when(featured)}</span>
            <span className="mt-1 line-clamp-2 block text-lg font-semibold text-night">{featured.title}</span>
          </span>
        </Link>
        {others.length > 0 && (
          <ul className="space-y-2">
            {others.slice(0, 3).map((item) => (
              <li key={item.id}>
                <Link
                  to={newsHref(item)}
                  className="flex items-center gap-3 rounded-2xl bg-surface p-2 shadow-card hover:bg-ash-100"
                >
                  <span className="block size-14 shrink-0 overflow-hidden rounded-xl bg-ash-200">
                    {item.image && (
                      <PhotoImg photo={item.image} sizes="56px" className="size-full object-cover" />
                    )}
                  </span>
                  <span className="min-w-0">
                    <span className="line-clamp-2 block text-sm font-normal text-night">{item.title}</span>
                    <span className="text-xs font-light text-muted">{when(item)}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </AreaSection>
  )
}
