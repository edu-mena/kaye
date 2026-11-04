import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { CareerCard } from '../../components/CareerCard'
import { Icon, type IconName } from '../../components/icons'
import { PathMark } from '../../components/PathMark'
import { PhotoImg } from '../../components/PhotoImg'
import { ButtonLink } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Chip } from '../../components/ui/Chip'
import { Hexagon } from '../../components/ui/Hexagon'
import { SectionHeading } from '../../components/ui/PageHeader'
import { ProgressBar } from '../../components/ui/ProgressBar'
import { useAcademies, useCareer, useCareers, useCompanies, useCourses, useNews } from '../../data/queries'
import { MARKET_AREAS, type NewsItem } from '../../data/types'
import { achievements, totalXp } from '../../domain/achievements'
import { cvCompleteness } from '../../domain/cv'
import { quickestPathway } from '../../domain/education'
import { isAboutMe, myCareers } from '../../domain/path'
import { riasecCode } from '../../domain/riasec'
import { stagger } from '../../lib/ui'
import { useRecommendations } from '../../lib/useRecommendations'
import { useRiasecProfile } from '../../state/useRiasecProfile'
import { activeCv, useUser } from '../../state/userStore'
import { DeadlineRow } from '../deadlines/DeadlineRow'
import { useDeadlines } from '../../state/useDeadlines'
import { NewsCard } from '../news/NewsCard'

const LINK = 'text-sm font-normal text-blue underline-offset-4 hover:underline'

/** A small card title with its icon in a circle of the main blue. */
function CardTitle({ icon, children }: { icon: IconName; children: string }) {
  return (
    <h2 className="flex items-center gap-3 text-base font-semibold text-night">
      <span className="grid size-8 shrink-0 place-items-center rounded-full bg-blue text-white">
        <Icon name={icon} className="size-4" />
      </span>
      {children}
    </h2>
  )
}

export default function HomePage() {
  const { t } = useTranslation()
  const user = useUser()

  if (!user.profile) return <Welcome />

  return (
    <div className="space-y-8">
      <h1 className="rise text-3xl leading-tight font-extrabold text-night sm:text-4xl">
        {t('home.greeting', { name: user.profile.name })}
      </h1>
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
        {/* A feed: what to do next, then what is new, then the careers that fit; always two columns. */}
        <div className="min-w-0 space-y-8">
          <ul className="grid gap-4 sm:grid-cols-2">
            <li className="rise">
              <TestCard />
            </li>
            <li className="rise" style={stagger(1)}>
              <CvCard />
            </li>
          </ul>
          <Latest />
          <Recommended />
        </div>
        <aside aria-label={t('home.asideLabel')} className="space-y-4 lg:sticky lg:top-6">
          <TargetCard />
          <UpcomingDeadlines />
          <Progress />
        </aside>
      </div>
    </div>
  )
}

function Welcome() {
  return (
    <div className="space-y-10">
      <Hero />
      <HowItWorks />
      <ValueGrid />
      <Coverage />
      <FinalCta />
    </div>
  )
}

function Hero() {
  const { t } = useTranslation()
  return (
    <Card tone="coal" className="relative rise overflow-hidden p-6 sm:p-10">
      <PathMark className="pointer-events-none absolute -right-10 -bottom-12 w-56 opacity-40 sm:-right-12 sm:-bottom-10 sm:w-80 sm:opacity-50 lg:w-[28rem]" />
      <div className="relative">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-gold/40 px-3 py-1 text-xs font-semibold whitespace-nowrap text-gold">
          <Icon name="check" className="size-3.5" />
          {t('home.freeBadge')}
        </span>
        <h1 className="mt-4 max-w-xl text-3xl leading-tight font-extrabold sm:text-5xl">
          {t('home.greetingGuest')}
        </h1>
        <p className="mt-4 max-w-md text-sm font-light text-white/80">{t('home.intro')}</p>
        <div className="mt-8 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <ButtonLink to="/entrar" variant="onDark" size="lg" className="w-full sm:w-auto">
            {t('home.startCta')}
          </ButtonLink>
          <ButtonLink to="/carreiras" variant="onDarkOutline" size="lg" className="w-full sm:w-auto">
            {t('home.explore')}
          </ButtonLink>
        </div>
      </div>
    </Card>
  )
}

const HOW_STEPS = [
  { icon: 'compass', title: 'home.howStep1Title', body: 'home.howStep1Body' },
  { icon: 'briefcase', title: 'home.howStep2Title', body: 'home.howStep2Body' },
  { icon: 'cap', title: 'home.howStep3Title', body: 'home.howStep3Body' },
  { icon: 'building', title: 'home.howStep4Title', body: 'home.howStep4Body' },
] as const satisfies { icon: IconName; title: string; body: string }[]

function HowItWorks() {
  const { t } = useTranslation()
  return (
    <section aria-labelledby="how">
      <SectionHeading id="how" title={t('home.howTitle')} icon="compass" />
      <ol className="relative grid gap-8 sm:grid-cols-4 sm:gap-6">
        <div aria-hidden="true" className="absolute top-6 right-6 left-6 hidden h-0.5 bg-ash-300 sm:block" />
        {HOW_STEPS.map((step, index) => (
          <li key={step.title} className="relative rise" style={stagger(index + 1)}>
            <span className="relative grid size-12 place-items-center rounded-full bg-blue text-white ring-4 ring-paper">
              <Icon name={step.icon} className="size-5" />
            </span>
            <h3 className="mt-4 text-base font-semibold text-night">{t(step.title)}</h3>
            <p className="mt-1 text-sm font-light text-copy">{t(step.body)}</p>
          </li>
        ))}
      </ol>
    </section>
  )
}

const VALUES = [
  {
    to: '/teste',
    icon: 'compass',
    title: 'home.valueTestTitle',
    body: 'home.valueTestBody',
    photoSlug: null,
  },
  {
    to: '/carreiras',
    icon: 'briefcase',
    title: 'home.valueCareersTitle',
    body: 'home.valueCareersBody',
    photoSlug: 'desenvolvedor-frontend',
  },
  {
    to: '/cursos',
    icon: 'cap',
    title: 'home.valueTrainingTitle',
    body: 'home.valueTrainingBody',
    photoSlug: 'formador-de-tic',
  },
  {
    to: '/bolsas',
    icon: 'award',
    title: 'home.valueScholarshipsTitle',
    body: 'home.valueScholarshipsBody',
    photoSlug: 'engenheiro-civil',
  },
  {
    to: '/estagios',
    icon: 'briefcase',
    title: 'home.valueInternshipsTitle',
    body: 'home.valueInternshipsBody',
    photoSlug: 'engenheiro-de-petroleos',
  },
  {
    to: '/prazos',
    icon: 'calendar',
    title: 'home.valueDeadlinesTitle',
    body: 'home.valueDeadlinesBody',
    photoSlug: null,
  },
  {
    to: '/empresas',
    icon: 'building',
    title: 'home.valueCompaniesTitle',
    body: 'home.valueCompaniesBody',
    photoSlug: 'product-manager',
  },
  {
    to: '/mercado',
    icon: 'wallet',
    title: 'home.valueMarketTitle',
    body: 'home.valueMarketBody',
    photoSlug: 'analista-financeiro',
  },
  {
    to: '/cv',
    icon: 'document',
    title: 'home.valueCvTitle',
    body: 'home.valueCvBody',
    photoSlug: 'secretario-executivo',
  },
  {
    to: '/cursos',
    icon: 'scale',
    title: 'home.valueCostTitle',
    body: 'home.valueCostBody',
    photoSlug: 'contabilista',
  },
  {
    to: '/carreiras',
    icon: 'path',
    title: 'home.valueStoriesTitle',
    body: 'home.valueStoriesBody',
    photoSlug: 'enfermeiro',
  },
  {
    to: '/cursos',
    icon: 'landmark',
    title: 'home.valueRecognisedTitle',
    body: 'home.valueRecognisedBody',
    photoSlug: 'engenheiro-de-petroleos',
  },
] as const satisfies { to: string; icon: IconName; title: string; body: string; photoSlug: string | null }[]

function ValueGrid() {
  const { t } = useTranslation()
  const { data: careers } = useCareers()

  return (
    <section aria-labelledby="values">
      <SectionHeading id="values" title={t('home.valuesTitle')} icon="panel" />
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {VALUES.map((value, index) => {
          const photo = value.photoSlug
            ? careers?.find((career) => career.slug === value.photoSlug)?.image
            : undefined
          return (
            <li key={value.title} className="rise" style={stagger(index + 1)}>
              <Link
                to={value.to}
                className="group flex h-full flex-col overflow-hidden rounded-card bg-surface shadow-card transition duration-300 hover:-translate-y-0.5 hover:shadow-lift"
              >
                <span className="relative block h-32 shrink-0 bg-night sm:h-36">
                  {photo ? (
                    <PhotoImg
                      photo={photo}
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      className="size-full object-cover"
                    />
                  ) : (
                    <span className="grid size-full place-items-center bg-gradient-to-br from-blue to-night">
                      <Icon name={value.icon} className="size-10 text-gold" />
                    </span>
                  )}
                  <span className="absolute bottom-3 left-3 grid size-9 place-items-center rounded-full bg-coal text-gold">
                    <Icon name={value.icon} className="size-4" />
                  </span>
                </span>
                <span className="flex flex-1 flex-col p-4 sm:p-5">
                  <span className="flex items-center justify-between gap-2">
                    <span className="text-base font-semibold text-night">{t(value.title)}</span>
                    <Icon
                      name="chevronRight"
                      className="size-4 shrink-0 text-muted transition-transform group-hover:translate-x-0.5"
                    />
                  </span>
                  <span className="mt-1 block text-sm font-light text-copy">{t(value.body)}</span>
                </span>
              </Link>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

function Coverage() {
  const { t } = useTranslation()
  const { data: careers } = useCareers()
  const { data: courses } = useCourses()
  const { data: academies } = useAcademies()
  const { data: companies } = useCompanies()

  const stats: { value: number; label: string }[] = [
    { value: careers?.length ?? 0, label: t('home.statsCareers') },
    { value: courses?.length ?? 0, label: t('home.statsCourses') },
    { value: academies?.length ?? 0, label: t('home.statsAcademies') },
    { value: companies?.length ?? 0, label: t('home.statsCompanies') },
  ]

  return (
    <section aria-labelledby="coverage">
      <SectionHeading id="coverage" title={t('home.statsTitle')} icon="globe" />
      <Card className="p-6 sm:p-8">
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label}>
              <p className="font-display text-3xl font-extrabold text-gold-ink sm:text-4xl">{stat.value}</p>
              <p className="mt-1 text-sm font-light text-copy">{stat.label}</p>
            </div>
          ))}
        </div>
        <div className="mt-6 flex flex-wrap gap-2 border-t border-line pt-6">
          {MARKET_AREAS.map((area) => (
            <Chip key={area}>{t(`market.area_${area}`)}</Chip>
          ))}
        </div>
      </Card>
    </section>
  )
}

function FinalCta() {
  const { t } = useTranslation()
  return (
    <Card
      tone="notice"
      className="flex rise flex-col items-start gap-4 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8"
    >
      <div>
        <CardTitle icon="target">{t('home.startTitle')}</CardTitle>
        <p className="mt-2 pl-11 text-sm font-light text-copy">{t('home.startBody')}</p>
      </div>
      <ButtonLink to="/entrar" size="lg" className="w-full shrink-0 sm:w-auto">
        {t('home.startCtaFinal')}
      </ButtonLink>
    </Card>
  )
}

function TestCard() {
  const { t } = useTranslation()
  const { profile, answered, total, completed } = useRiasecProfile()

  if (completed && profile) {
    return (
      <Card className="flex h-full items-center gap-4 p-6">
        <Hexagon>{riasecCode(profile)}</Hexagon>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-light text-muted">{t('home.profileCode')}</p>
          <Link
            to="/teste/resultado"
            className="mt-1 block text-base font-semibold text-night underline-offset-4 hover:underline"
          >
            {t('home.seeResult')}
          </Link>
        </div>
        <Icon name="chevronRight" className="size-5 shrink-0 text-muted" />
      </Card>
    )
  }

  return (
    <Card tone="coal" className="flex h-full flex-col items-start p-6">
      <h2 className="text-xl font-extrabold">{t('home.testTitle')}</h2>
      <p className="mt-2 max-w-prose text-sm font-light text-white/80">{t('home.testBody')}</p>
      {answered > 0 && (
        <ProgressBar
          value={answered / Math.max(total, 1)}
          label={t('home.testTitle')}
          tone="gold"
          track="bg-white/15"
          className="mt-6 w-full"
        />
      )}
      <ButtonLink to="/teste" variant="onDark" className="mt-6">
        {answered > 0 ? t('home.testContinue', { answered, total }) : t('home.testCta')}
        <Icon name="arrowRight" className="size-4" />
      </ButtonLink>
    </Card>
  )
}

function CvCard() {
  const { t } = useTranslation()
  const user = useUser()
  const document = activeCv(user)

  return (
    <Card tone="notice" className="flex h-full flex-col items-start p-6">
      <CardTitle icon="document">{t('home.cvTitle')}</CardTitle>
      {document ? (
        <>
          <p className="mt-2 text-sm font-light text-copy">{t('home.cvSome', { count: user.cvs.length })}</p>
          <ProgressBar
            value={cvCompleteness(document.cv)}
            label={t('home.cvTitle')}
            className="mt-4 w-full"
          />
        </>
      ) : (
        <p className="mt-2 text-sm font-light text-copy">{t('home.cvBody')}</p>
      )}
      <ButtonLink to="/cv" variant="secondary" className="mt-6">
        {document ? t('home.cvOpen') : t('home.cvCta')}
        <Icon name="arrowRight" className="size-4" />
      </ButtonLink>
    </Card>
  )
}

/** The latest news, the ones about the person's careers first. */
function Latest() {
  const { t, i18n } = useTranslation()
  const { data: news } = useNews()
  const { savedCareers, targetCareer } = useUser()
  if (!news || news.length === 0) return null

  const mine = myCareers({ savedCareers, targetCareer })
  const forYou = (item: NewsItem) => isAboutMe(item, mine)
  const shown = [...news.filter(forYou), ...news.filter((item) => !forYou(item))].slice(0, 4)
  const date = new Intl.DateTimeFormat(i18n.language, { day: 'numeric', month: 'short' })

  return (
    <section aria-labelledby="latest">
      <SectionHeading
        id="latest"
        title={t('nav.news')}
        icon="newspaper"
        action={
          <Link to="/novidades" className={LINK}>
            {t('common.seeAll')}
          </Link>
        }
      />
      <ul className="grid gap-4 sm:grid-cols-2">
        {shown.map((item, index) => (
          <li key={item.id} className="rise [&>*]:h-full" style={stagger(index + 1)}>
            <NewsCard
              item={item}
              forYou={forYou(item)}
              date={date.format(new Date(`${item.date}T12:00:00`))}
            />
          </li>
        ))}
      </ul>
    </section>
  )
}

function Recommended() {
  const { t } = useTranslation()
  const recommendations = useRecommendations(4)
  const { assessmentCompletedAt } = useUser()
  if (!recommendations) return null

  return (
    <section aria-labelledby="recommended">
      <SectionHeading
        id="recommended"
        title={t('home.recommended')}
        icon="compass"
        action={
          <Link to={assessmentCompletedAt ? '/teste/resultado' : '/carreiras'} className={LINK}>
            {t('common.seeAll')}
          </Link>
        }
      />
      <ul className="grid gap-4 sm:grid-cols-2">
        {recommendations.map((item, index) => (
          <li key={item.career.slug} className="rise [&>*]:h-full" style={stagger(index + 1)}>
            <CareerCard career={item.career} match={item.match} reasons={item.reasons} />
          </li>
        ))}
      </ul>
    </section>
  )
}

function TargetCard() {
  const { t } = useTranslation()
  const user = useUser()
  const { data: career } = useCareer(user.targetCareer ?? '')

  if (!user.targetCareer || !career) {
    return (
      <Card className="p-6">
        <CardTitle icon="target">{t('home.targetTitle')}</CardTitle>
        <p className="mt-2 text-sm font-light text-copy">{t('home.targetEmpty')}</p>
        <ButtonLink to="/carreiras" variant="secondary" size="sm" className="mt-4">
          {t('home.explore')}
        </ButtonLink>
      </Card>
    )
  }

  const quickest = quickestPathway(career, user.profile?.education ?? null)
  const next = quickest?.steps[0]
  return (
    <Card tone="notice" className="p-6">
      <p className="text-xs font-light text-muted">{t('home.targetTitle')}</p>
      <Link
        to={`/carreiras/${career.slug}?secao=path`}
        className="mt-1 block text-lg font-semibold text-night underline-offset-4 hover:underline"
      >
        {career.name}
      </Link>
      {quickest && (
        <p className="mt-1 text-sm font-light text-copy">
          {t('home.targetSteps', { count: quickest.steps.length })}
        </p>
      )}
      {next && (
        <div className="mt-4 rounded-2xl bg-ash-100 p-4">
          <p className="text-xs font-light text-muted">{t('home.nextStep')}</p>
          <p className="mt-1 text-sm font-normal text-night">{next.title}</p>
        </div>
      )}
    </Card>
  )
}

/** Próximos prazos: the person's three nearest deadlines (or anyone's, when none is theirs). */
function UpcomingDeadlines() {
  const { t } = useTranslation()
  const deadlines = useDeadlines()
  const shown = (deadlines.mine.length > 0 ? deadlines.mine : deadlines.all).slice(0, 3)
  if (shown.length === 0) return null

  return (
    <Card className="p-6">
      <CardTitle icon="calendar">{t('deadlines.homeTitle')}</CardTitle>
      <ul className="mt-4 space-y-2">
        {shown.map((item) => (
          <li key={item.id}>
            <DeadlineRow item={item} today={deadlines.today} compact />
          </li>
        ))}
      </ul>
      <Link to="/prazos" className={`mt-4 inline-block ${LINK}`}>
        {t('common.seeAll')}
      </Link>
    </Card>
  )
}

function Progress() {
  const { t } = useTranslation()
  const list = achievements(useUser())
  const earned = list.filter((achievement) => achievement.earned).length

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between gap-4">
        <CardTitle icon="award">{t('home.progressTitle')}</CardTitle>
        <span className="text-sm font-semibold text-gold-ink">{t('common.xp', { xp: totalXp(list) })}</span>
      </div>
      <ProgressBar value={earned / list.length} label={t('home.progressTitle')} className="mt-4" />
      <Link to="/perfil" className={`mt-4 inline-block ${LINK}`}>
        {t('profile.achievements')} · {earned}/{list.length}
      </Link>
    </Card>
  )
}
