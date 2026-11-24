import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { Icon, type IconName } from '../../components/icons'
import { PathMark } from '../../components/PathMark'
import { PhotoImg } from '../../components/PhotoImg'
import { ButtonLink } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Chip } from '../../components/ui/Chip'
import { SectionHeading } from '../../components/ui/PageHeader'
import { useAcademies, useCareers, useCompanies, useCourses } from '../../data/queries'
import { MARKET_AREAS } from '../../data/types'
import { stagger } from '../../lib/ui'
import { useUser } from '../../state/userStore'
import { CardHeading } from './CardHeading'
import { ForYouHome } from './ForYouHome'

export default function HomePage() {
  const user = useUser()
  return user.profile ? <ForYouHome /> : <Welcome />
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
    to: '/oportunidades?tab=bolsas',
    icon: 'award',
    title: 'home.valueScholarshipsTitle',
    body: 'home.valueScholarshipsBody',
    photoSlug: 'engenheiro-civil',
  },
  {
    to: '/oportunidades?tab=estagios',
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
            <Link key={area} to={`/areas/${area}`} className="hover:opacity-70">
              <Chip>{t(`market.area_${area}`)}</Chip>
            </Link>
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
        <CardHeading icon="target">{t('home.startTitle')}</CardHeading>
        <p className="mt-2 pl-11 text-sm font-light text-copy">{t('home.startBody')}</p>
      </div>
      <ButtonLink to="/entrar" size="lg" className="w-full shrink-0 sm:w-auto">
        {t('home.startCtaFinal')}
      </ButtonLink>
    </Card>
  )
}
