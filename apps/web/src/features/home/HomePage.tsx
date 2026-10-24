import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { CareerCard } from '../../components/CareerCard'
import { Icon, type IconName } from '../../components/icons'
import { PathMark } from '../../components/PathMark'
import { ButtonLink } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Hexagon } from '../../components/ui/Hexagon'
import { SectionHeading } from '../../components/ui/PageHeader'
import { ProgressBar } from '../../components/ui/ProgressBar'
import { useCareer } from '../../data/queries'
import { achievements, totalXp } from '../../domain/achievements'
import { quickestPathway } from '../../domain/education'
import { riasecCode } from '../../domain/riasec'
import { stagger } from '../../lib/ui'
import { useRecommendations } from '../../lib/useRecommendations'
import { useRiasecProfile } from '../../state/useRiasecProfile'
import { useUser } from '../../state/userStore'

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
      <header className="rise">
        <h1 className="text-3xl leading-tight font-extrabold text-night sm:text-4xl">
          {t('home.greeting', { name: user.profile.name })}
        </h1>
        <p className="mt-2 max-w-prose text-sm font-light text-copy">{t('home.intro')}</p>
      </header>
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="space-y-8">
          <TestCard />
          <Recommended />
        </div>
        <div className="space-y-4">
          <TargetCard />
          <Progress />
        </div>
      </div>
    </div>
  )
}

function Welcome() {
  const { t } = useTranslation()
  return (
    <div className="space-y-4">
      <Card tone="coal" className="rise overflow-hidden p-6 sm:p-10">
        <PathMark className="mb-8 w-56" />
        <h1 className="max-w-xl text-3xl leading-tight font-extrabold sm:text-5xl">
          {t('home.greetingGuest')}
        </h1>
        <p className="mt-4 max-w-prose text-sm font-light text-white/80">{t('home.intro')}</p>
        <div className="mt-8 flex flex-wrap gap-2">
          <ButtonLink to="/entrar" variant="onDark" size="lg">
            {t('home.startCta')}
          </ButtonLink>
          <ButtonLink
            to="/carreiras"
            variant="ghost"
            size="lg"
            className="text-white ring-1 ring-white/30 hover:bg-white/10"
          >
            {t('home.explore')}
          </ButtonLink>
        </div>
      </Card>
      <Card className="rise p-6" style={stagger(1)}>
        <CardTitle icon="target">{t('home.startTitle')}</CardTitle>
        <p className="mt-2 pl-11 text-sm font-light text-copy">{t('home.startBody')}</p>
      </Card>
    </div>
  )
}

function TestCard() {
  const { t } = useTranslation()
  const { profile, answered, total, completed } = useRiasecProfile()

  if (completed && profile) {
    return (
      <Card className="flex rise items-center gap-4 p-6">
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
    <Card tone="coal" className="rise p-6 sm:p-8">
      <h2 className="text-2xl font-extrabold">{t('home.testTitle')}</h2>
      <p className="mt-2 max-w-prose text-sm font-light text-white/80">{t('home.testBody')}</p>
      {answered > 0 && (
        <ProgressBar
          value={answered / Math.max(total, 1)}
          label={t('home.testTitle')}
          tone="gold"
          track="bg-white/15"
          className="mt-6"
        />
      )}
      <ButtonLink to="/teste" variant="onDark" className="mt-6">
        {answered > 0 ? t('home.testContinue', { answered, total }) : t('home.testCta')}
        <Icon name="arrowRight" className="size-4" />
      </ButtonLink>
    </Card>
  )
}

function Recommended() {
  const { t } = useTranslation()
  const recommendations = useRecommendations(3)
  if (!recommendations) return null

  return (
    <section aria-labelledby="recommended">
      <SectionHeading
        id="recommended"
        title={t('home.recommended')}
        icon="compass"
        action={
          <Link to="/teste/resultado" className={LINK}>
            {t('common.seeAll')}
          </Link>
        }
      />
      <ul className="space-y-4">
        {recommendations.map((item, index) => (
          <li key={item.career.slug} className="rise" style={stagger(index + 1)}>
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
