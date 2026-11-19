import { useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { Icon, type IconName } from '../../components/icons'
import { PhotoImg } from '../../components/PhotoImg'
import { ScoreRing } from '../../components/ScoreRing'
import { ButtonLink } from '../../components/ui/Button'
import { ProgressBar } from '../../components/ui/ProgressBar'
import { Segmented } from '../../components/ui/Segmented'
import { KURSOS } from '../../data/kursos'
import { useCareers, useEducation, useJobMarket, useNews } from '../../data/queries'
import type { CareerSummary, Photo } from '../../data/types'
import { achievements, totalXp } from '../../domain/achievements'
import { formatPercent } from '../../domain/format'
import { byInterest, groupAreas } from '../../domain/interests'
import { courseState } from '../../domain/kursos'
import { marketSummary } from '../../domain/market'
import { overall } from '../../domain/psychotech'
import { todayIso } from '../../domain/scholarships'
import { useInterestAreas } from '../../lib/useInterestAreas'
import { useNewsForMe } from '../../lib/useNewsForMe'
import { useRecommendations } from '../../lib/useRecommendations'
import { useDeadlines } from '../../state/useDeadlines'
import { useRiasecProfile } from '../../state/useRiasecProfile'
import { activeCv, EMPTY_KURSO, useUser } from '../../state/userStore'
import { resumeStep, stepHref } from '../kursos/shared'
import { newsHref } from '../news/links'
import { STRETCHED, Tile } from './Bento'
import { strengthsDone } from '../../domain/strengths'

const LINK = 'shrink-0 text-sm font-normal text-blue underline-offset-4 hover:underline'
const LINK_ON_DARK = 'text-sm font-normal text-white underline underline-offset-4 hover:text-white/80'

const withPhoto = (careers: CareerSummary[] | undefined, slugs: (string | null | undefined)[]) =>
  slugs.map((slug) => careers?.find((career) => career.slug === slug)?.image).find(Boolean)

type TileHeadingProps = { id: string; icon: IconName; children: ReactNode; action?: ReactNode }

/** A tile's title with its icon in a blue circle, like the app's card titles. */
function TileHeading({ id, icon, children, action }: TileHeadingProps) {
  return (
    <div className="flex items-center justify-between gap-3">
      <h2 id={id} className="flex min-w-0 items-center gap-2.5 text-base font-semibold text-night">
        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-blue text-white">
          <Icon name={icon} className="size-4" />
        </span>
        <span className="truncate">{children}</span>
      </h2>
      {action}
    </div>
  )
}

/** Hero: the greeting on the photo of the person's career, and always the next thing to do. */
export function HeroTile({ aside }: { aside: ReactNode }) {
  const { t } = useTranslation()
  const user = useUser()
  const { completed } = useRiasecProfile()
  const { data: careers } = useCareers()
  const target = careers?.find((career) => career.slug === user.targetCareer)
  const photo: Photo | undefined =
    withPhoto(careers, [user.targetCareer, ...user.savedCareers]) ??
    careers?.find((career) => career.image)?.image
  const list = achievements(user)
  const earned = list.filter((achievement) => achievement.earned).length
  const xp = t('home.heroXp', { xp: totalXp(list), earned, total: list.length })

  const next = !completed
    ? { to: '/teste', label: t('home.heroNextTest') }
    : !strengthsDone(user.strengths)
      ? { to: '/teste/valencias', label: t('assessment.completeStrengths') }
      : !activeCv(user)
        ? { to: '/cv', label: t('home.heroNextCv') }
        : target
          ? {
              to: `/carreiras/${target.slug}?secao=path`,
              label: t('home.heroNextPlan', { career: target.name }),
            }
          : { to: '/carreiras', label: t('home.heroNextExplore') }

  return (
    <Tile size="hero" tone="photo" photo={photo} priority labelledBy="home-hero" index={0}>
      <div className="flex h-full flex-col gap-6 sm:grid sm:grid-cols-[minmax(0,1fr)_17rem] sm:items-end">
        <div className="flex h-full flex-col justify-end">
          <h1 id="home-hero" className="text-3xl leading-tight font-extrabold sm:text-4xl">
            {t('home.greeting', { name: user.profile?.name })}
          </h1>
          <p className="mt-4 text-xs font-light text-white/80">{t('home.heroNextLabel')}</p>
          <ButtonLink to={next.to} variant="onDark" size="lg" className="mt-2 self-start">
            {next.label}
            <Icon name="arrowRight" className="size-4" />
          </ButtonLink>
          <div className="mt-6 flex items-center gap-3">
            <ScoreRing score={(earned / Math.max(list.length, 1)) * 100} tone="dark" label={xp} />
            <p aria-hidden="true" className="text-sm font-light text-white/90">
              {xp}
            </p>
          </div>
          {photo && (
            <p className="mt-3 text-[0.6875rem] font-light text-white/70" title={photo.alt}>
              {t('home.photoCredit', { author: photo.credit.author, license: photo.credit.license })}
            </p>
          )}
        </div>
        <div className="min-w-0">{aside}</div>
      </div>
    </Tile>
  )
}

type NewsFilter = 'forMe' | 'eventos' | 'kaye'

/** Novidades: one piece in focus, three more below; a local filter (the URL stays as it is). */
export function NewsTile({ index }: { index: number }) {
  const { t, i18n } = useTranslation()
  const { data: news = [] } = useNews()
  const { forMe } = useNewsForMe()
  const [filter, setFilter] = useState<NewsFilter | null>(null)
  const date = new Intl.DateTimeFormat(i18n.language, { day: 'numeric', month: 'short' })

  const ordered = [...news.filter(forMe), ...news.filter((item) => !forMe(item))]
  const shown = ordered
    .filter((item) => (filter === 'forMe' ? forMe(item) : filter ? item.kind === filter : true))
    .slice(0, 4)
  const [featured, ...rest] = shown

  return (
    <Tile size="feed" labelledBy="home-news" index={index}>
      <TileHeading
        id="home-news"
        icon="newspaper"
        action={
          <Link to="/novidades" className={LINK}>
            {t('common.seeAll')}
          </Link>
        }
      >
        {t('nav.news')}
      </TileHeading>
      <Segmented
        label={t('home.newsFilterLabel')}
        options={[
          { value: 'forMe', label: t('home.newsForYou') },
          { value: 'eventos', label: t('home.newsEvents') },
          { value: 'kaye', label: t('home.newsKaye') },
        ]}
        value={filter}
        onChange={setFilter}
        clearable
        className="mt-3"
      />
      {!featured ? (
        <p className="mt-6 text-sm font-light text-copy">{t('home.newsEmpty')}</p>
      ) : (
        <div className="mt-4 flex min-h-0 flex-1 flex-col gap-4">
          <Link to={newsHref(featured)} className="group/news block overflow-hidden rounded-2xl bg-ash-100">
            {featured.image && (
              <span className="block h-40 overflow-hidden bg-night sm:h-48">
                <PhotoImg
                  photo={featured.image}
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="size-full object-cover transition-transform duration-500 group-hover/news:scale-[1.03] motion-reduce:transition-none"
                />
              </span>
            )}
            <span className="block p-4">
              <span className="text-xs font-light text-muted">
                {date.format(new Date(`${featured.date}T12:00:00`))}
              </span>
              <span className="mt-1 line-clamp-2 text-lg font-semibold text-night">{featured.title}</span>
            </span>
          </Link>
          <ul className="space-y-2">
            {rest.map((item) => (
              <li key={item.id}>
                <Link
                  to={newsHref(item)}
                  className="flex items-center gap-3 rounded-2xl p-1.5 hover:bg-ash-100"
                >
                  <span className="block size-12 shrink-0 overflow-hidden rounded-xl bg-ash-200">
                    {item.image && (
                      <PhotoImg photo={item.image} sizes="48px" className="size-full object-cover" />
                    )}
                  </span>
                  <span className="min-w-0">
                    <span className="line-clamp-1 text-sm font-normal text-night">{item.title}</span>
                    <span className="text-xs font-light text-muted">
                      {date.format(new Date(`${item.date}T12:00:00`))}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Tile>
  )
}

/** The next four events still to happen, by first day. */
export function EventsTile({ index }: { index: number }) {
  const { t, i18n } = useTranslation()
  const { data: news = [] } = useNews()
  const today = todayIso()
  const events = news
    .flatMap((item) =>
      item.kind === 'eventos' && item.event && (item.event.ends ?? item.event.starts) >= today
        ? [{ item, event: item.event }]
        : [],
    )
    .toSorted((a, b) => a.event.starts.localeCompare(b.event.starts))
    .slice(0, 4)
  const day = new Intl.DateTimeFormat(i18n.language, { day: 'numeric' })
  const month = new Intl.DateTimeFormat(i18n.language, { month: 'short' })

  return (
    <Tile size="tall" labelledBy="home-events" index={index}>
      <TileHeading
        id="home-events"
        icon="calendar"
        action={
          <Link to="/novidades?tipo=eventos" className={LINK}>
            {t('home.eventsAll')}
          </Link>
        }
      >
        {t('home.eventsTitle')}
      </TileHeading>
      {events.length === 0 ? (
        <p className="mt-4 text-sm font-light text-copy">{t('home.eventsEmpty')}</p>
      ) : (
        <ul className="mt-4 divide-y divide-line">
          {events.map(({ item, event }, position) => {
            const starts = new Date(`${event.starts}T12:00:00`)
            const date = (
              <span className="grid size-12 shrink-0 place-content-center rounded-xl bg-ash-100 text-center leading-none">
                <span className="font-display text-lg font-extrabold text-night">{day.format(starts)}</span>
                <span className="mt-0.5 text-[0.625rem] font-semibold text-muted uppercase">
                  {month.format(starts).replace('.', '')}
                </span>
              </span>
            )
            const meta = (
              <span className="mt-0.5 flex min-w-0 items-center gap-1.5 text-xs font-light text-muted">
                <span className="truncate">{event.venue}</span>
                <span aria-hidden="true">·</span>
                <span className={`shrink-0 font-semibold ${event.free ? 'text-success' : 'text-night'}`}>
                  {event.free ? t('home.eventFree') : t('home.eventPaid')}
                </span>
              </span>
            )
            // The next event in focus: its poster whole (never cropped), the date on top of it.
            if (position === 0 && item.image) {
              return (
                <li key={item.id} className="pb-3">
                  <Link to={newsHref(item)} className="group/event block">
                    <span className="relative block h-40 overflow-hidden rounded-2xl bg-ash-100">
                      <PhotoImg
                        photo={item.image}
                        sizes="(min-width: 1024px) 25vw, 100vw"
                        className="size-full object-contain transition-transform duration-500 group-hover/event:scale-[1.03] motion-reduce:transition-none"
                      />
                      <span className="absolute top-2 left-2 shadow-card">{date}</span>
                    </span>
                    <span className="mt-2 line-clamp-2 text-sm font-semibold text-night group-hover/event:text-blue">
                      {item.title}
                    </span>
                    {meta}
                  </Link>
                </li>
              )
            }
            return (
              <li key={item.id} className="py-2.5 last:pb-0">
                <Link to={newsHref(item)} className="group/event flex items-center gap-3">
                  {date}
                  <span className="min-w-0 flex-1">
                    <span className="line-clamp-1 text-sm font-normal text-night group-hover/event:text-blue">
                      {item.title}
                    </span>
                    {meta}
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </Tile>
  )
}

/** Carreiras para ti: a strip that scrolls sideways (snap), six careers with a photo. */
export function CareersTile({ index }: { index: number }) {
  const { t } = useTranslation()
  const ranked = useRecommendations(6)
  const interests = useInterestAreas()
  const { data: careers = [] } = useCareers()
  const { savedCareers, assessmentCompletedAt } = useUser()
  const fallback = [
    ...careers.filter((career) => savedCareers.includes(career.slug)),
    ...careers.filter((career) => career.demand === 'alta' && !savedCareers.includes(career.slug)),
  ].slice(0, 6)
  const shown = ranked
    ? byInterest(ranked, (item) => groupAreas([item.career.group]), interests).map((item) => item.career)
    : fallback

  return (
    <Tile size="wide" labelledBy="home-careers" index={index} data-tour="recommended">
      <TileHeading
        id="home-careers"
        icon="compass"
        action={
          <Link to={assessmentCompletedAt ? '/teste/resultado' : '/carreiras'} className={LINK}>
            {t('common.seeAll')}
          </Link>
        }
      >
        {t('home.careersTitle')}
      </TileHeading>
      {!ranked && (
        <p className="mt-1 text-xs font-light text-copy">
          {t('home.careersHint')}{' '}
          <Link to="/teste" className={LINK}>
            {t('home.careersTest')}
          </Link>
        </p>
      )}
      <ul className="-mx-1 mt-3 no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto px-1 pb-1">
        {shown.map((career) => (
          <li key={career.slug} className="w-40 shrink-0 snap-start">
            <Link
              to={`/carreiras/${career.slug}`}
              className="group/career block overflow-hidden rounded-2xl bg-ash-100 hover:bg-ash-200"
            >
              <span className="block h-20 overflow-hidden bg-night">
                {career.image && (
                  <PhotoImg
                    photo={career.image}
                    sizes="160px"
                    className="size-full object-cover transition-transform duration-500 group-hover/career:scale-[1.03] motion-reduce:transition-none"
                  />
                )}
              </span>
              <span className="line-clamp-2 p-2.5 text-sm font-normal text-night">{career.name}</span>
            </Link>
          </li>
        ))}
      </ul>
    </Tile>
  )
}

/** Kursos: the free course, where it stopped. */
export function KursosTile({ index }: { index: number }) {
  const { t } = useTranslation()
  const { kursos } = useUser()
  // The course in progress, else the first one not finished.
  const course =
    KURSOS.find((entry) => kursos[entry.id]?.position && !kursos[entry.id]?.completedAt) ??
    KURSOS.find((entry) => !kursos[entry.id]?.completedAt) ??
    KURSOS[0]
  if (!course) return null
  const progress = kursos[course.id] ?? EMPTY_KURSO
  const state = courseState(course, progress.done)
  const step = resumeStep(course, progress)
  const done = Boolean(progress.completedAt)
  const to = !done && step ? stepHref(course, step) : `/kursos/${course.id}`
  const label = done
    ? t('home.kursosDone', { course: course.title })
    : progress.done.length > 0
      ? t('home.kursosContinue', { course: course.title })
      : t('home.kursosStart', { course: course.title })

  return (
    <Tile size="square" tone="blue" labelledBy="home-kursos" index={index}>
      <h2 id="home-kursos" className="flex items-center gap-2 text-sm font-semibold text-white/80">
        <Icon name="cap" className="size-4" />
        {t('home.kursosTitle')}
      </h2>
      <Link to={to} className={`mt-2 text-xl font-extrabold ${STRETCHED}`}>
        {label}
      </Link>
      <div className="mt-auto pt-4">
        <ProgressBar value={state.share} label={label} tone="gold" track="bg-white/15" />
        <p className="mt-2 text-xs font-light text-white/80">
          {t('home.kursosProgress', { value: formatPercent(state.share) })}
        </p>
      </div>
    </Tile>
  )
}

/** Treino: psychotechnical tests and interviews, with the last result. */
export function TrainingTile({ index }: { index: number }) {
  const { t, i18n } = useTranslation()
  const { psychotech, interviews } = useUser()
  const { data: careers } = useCareers()
  const photo =
    withPhoto(careers, ['psicologo', 'gestor-de-recursos-humanos']) ?? careers?.find((c) => c.image)?.image
  const lastTest = psychotech[0]
  const lastInterview = interviews[0]
  const date = new Intl.DateTimeFormat(i18n.language, { day: 'numeric', month: 'short' })
  const action = 'flex items-center justify-between gap-2 rounded-2xl bg-white/10 px-3 py-2 hover:bg-white/20'

  return (
    <Tile size="square" tone="photo" photo={photo} labelledBy="home-training" index={index}>
      <h2 id="home-training" className="text-base font-semibold">
        {t('home.trainingTitle')}
      </h2>
      {!lastTest && !lastInterview && (
        <p className="mt-1 text-xs font-light text-white/80">{t('home.trainingEmpty')}</p>
      )}
      <div className="mt-auto grid gap-2 pt-3">
        <Link to="/treino" className={action}>
          <span className="text-sm font-semibold">{t('home.trainingPsychotech')}</span>
          <span className="text-xs font-light text-white/80">
            {lastTest ? (
              t('home.trainingLastScore', { value: formatPercent(overall(lastTest.scores)) })
            ) : (
              <Icon name="arrowRight" className="size-4" />
            )}
          </span>
        </Link>
        <Link to="/entrevistas" className={action}>
          <span className="text-sm font-semibold">{t('home.trainingInterviews')}</span>
          <span className="text-xs font-light text-white/80">
            {lastInterview ? (
              t('home.trainingLastInterview', { date: date.format(new Date(lastInterview.at)) })
            ) : (
              <Icon name="arrowRight" className="size-4" />
            )}
          </span>
        </Link>
      </div>
    </Tile>
  )
}

/** Mercado: two numbers from the job market. */
export function MarketTile({ index }: { index: number }) {
  const { t, i18n } = useTranslation()
  const { data: jobs } = useJobMarket()
  const { data: education } = useEducation()
  const summary = jobs && education ? marketSummary(jobs, education) : null

  return (
    <Tile size="square" tone="coal" labelledBy="home-market" index={index}>
      <h2 id="home-market" className="text-base font-semibold">
        {t('home.marketTitle')}
      </h2>
      <dl className="mt-3 grid grid-cols-2 gap-3">
        <div>
          <dt className="sr-only">{t('home.marketPostings')}</dt>
          <dd className="font-display text-2xl font-extrabold text-gold">
            {jobs ? jobs.postings.toLocaleString(i18n.language) : '—'}
          </dd>
          <dd aria-hidden="true" className="text-xs font-light text-white/80">
            {t('home.marketPostings')}
          </dd>
        </div>
        <div>
          <dt className="sr-only">{t('home.marketNoExperience')}</dt>
          <dd className="font-display text-2xl font-extrabold text-gold">
            {typeof summary?.noExperience === 'number' ? formatPercent(summary.noExperience) : '—'}
          </dd>
          <dd aria-hidden="true" className="text-xs font-light text-white/80">
            {t('home.marketNoExperience')}
          </dd>
        </div>
      </dl>
      <Link to="/mercado" className={`mt-auto pt-3 ${LINK_ON_DARK} ${STRETCHED}`}>
        {t('home.marketCta')}
      </Link>
    </Tile>
  )
}

/** Oportunidades abertas: scholarships and internships whose deadline has not passed. */
export function OpportunitiesTile({ index }: { index: number }) {
  const { t } = useTranslation()
  const { all } = useDeadlines()
  const count = (kind: 'bolsa' | 'estagio') =>
    new Set(all.filter((item) => item.kind === kind).map((item) => item.to)).size
  const row = 'flex items-center justify-between gap-2 rounded-2xl bg-ash-100 px-3 py-2 hover:bg-ash-200'

  return (
    <Tile size="square" labelledBy="home-opportunities" index={index}>
      <TileHeading id="home-opportunities" icon="award">
        {t('home.opportunitiesTitle')}
      </TileHeading>
      <div className="mt-auto grid gap-2 pt-3">
        <Link to="/oportunidades?tab=bolsas" className={row}>
          <span className="text-sm font-normal text-night">
            {t('home.opportunitiesScholarships', { count: count('bolsa') })}
          </span>
          <Icon name="chevronRight" className="size-4 text-muted" />
        </Link>
        <Link to="/oportunidades?tab=estagios" className={row}>
          <span className="text-sm font-normal text-night">
            {t('home.opportunitiesInternships', { count: count('estagio') })}
          </span>
          <Icon name="chevronRight" className="size-4 text-muted" />
        </Link>
      </div>
    </Tile>
  )
}
