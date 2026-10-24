import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { CareerCard } from '../../components/CareerCard'
import { Icon } from '../../components/icons'
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

export default function HomePage() {
  const { t } = useTranslation()
  const user = useUser()

  if (!user.profile) return <Welcome />

  return (
    <div className="space-y-8">
      <header className="rise">
        <h1 className="text-3xl font-bold text-navy sm:text-4xl">
          {t('home.greeting', { name: user.profile.name })}
        </h1>
        <p className="mt-2 max-w-prose text-muted">{t('home.intro')}</p>
      </header>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
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
    <div className="space-y-6">
      <Card tone="navy" className="rise overflow-hidden p-6 sm:p-10">
        <PathMark className="mb-6 w-56" />
        <h1 className="max-w-xl text-3xl leading-tight font-bold sm:text-5xl">{t('home.greetingGuest')}</h1>
        <p className="mt-3 max-w-prose text-white/80">{t('home.intro')}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <ButtonLink to="/entrar" variant="onNavy" size="lg">
            {t('home.startCta')}
          </ButtonLink>
          <ButtonLink to="/carreiras" variant="ghost" size="lg" className="text-white hover:bg-white/10">
            {t('home.explore')}
          </ButtonLink>
        </div>
      </Card>
      <Card className="flex rise items-start gap-3" style={stagger(1)}>
        <Icon name="target" className="mt-0.5 size-6 shrink-0 text-navy" />
        <div>
          <h2 className="font-semibold text-navy">{t('home.startTitle')}</h2>
          <p className="text-sm text-muted">{t('home.startBody')}</p>
        </div>
      </Card>
    </div>
  )
}

function TestCard() {
  const { t } = useTranslation()
  const { profile, answered, total, completed } = useRiasecProfile()

  if (completed && profile) {
    return (
      <Card className="flex rise items-center gap-4">
        <Hexagon>{riasecCode(profile)}</Hexagon>
        <div className="flex-1">
          <p className="text-sm font-semibold text-muted">{t('home.profileCode')}</p>
          <Link
            to="/teste/resultado"
            className="font-display text-xl font-semibold text-navy underline-offset-4 hover:underline"
          >
            {t('home.seeResult')}
          </Link>
        </div>
      </Card>
    )
  }

  return (
    <Card tone="navy" className="rise p-6">
      <h2 className="text-2xl font-semibold">{t('home.testTitle')}</h2>
      <p className="mt-2 text-white/80">{t('home.testBody')}</p>
      {answered > 0 && (
        <ProgressBar
          value={answered / Math.max(total, 1)}
          label={t('home.testTitle')}
          tone="white"
          track="bg-white/15"
          className="mt-4"
        />
      )}
      <ButtonLink to="/teste" variant="onNavy" className="mt-5">
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
        action={
          <Link
            to="/teste/resultado"
            className="text-sm font-semibold text-navy underline-offset-4 hover:underline"
          >
            {t('common.seeAll')}
          </Link>
        }
      />
      <ul className="space-y-3">
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
      <Card>
        <h2 className="flex items-center gap-2 font-semibold text-navy">
          <Icon name="target" className="size-5" />
          {t('home.targetTitle')}
        </h2>
        <p className="mt-1 text-sm text-muted">{t('home.targetEmpty')}</p>
        <ButtonLink to="/carreiras" variant="secondary" size="sm" className="mt-3">
          {t('home.explore')}
        </ButtonLink>
      </Card>
    )
  }

  const quickest = quickestPathway(career, user.profile?.education ?? null)
  const next = quickest?.steps[0]
  return (
    <Card tone="notice">
      <p className="text-sm font-semibold">{t('home.targetTitle')}</p>
      <Link
        to={`/carreiras/${career.slug}#path`}
        className="font-display text-xl font-semibold underline-offset-4 hover:underline"
      >
        {career.name}
      </Link>
      {quickest && <p className="mt-1 text-sm">{t('home.targetSteps', { count: quickest.steps.length })}</p>}
      {next && (
        <p className="mt-3 rounded-xl bg-surface p-3 text-sm">
          <span className="block text-xs font-semibold text-muted">{t('home.nextStep')}</span>
          {next.title}
        </p>
      )}
    </Card>
  )
}

function Progress() {
  const { t } = useTranslation()
  const list = achievements(useUser())
  const earned = list.filter((achievement) => achievement.earned).length

  return (
    <Card>
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-navy">{t('home.progressTitle')}</h2>
        <span className="text-sm font-semibold text-gold-ink">{t('common.xp', { xp: totalXp(list) })}</span>
      </div>
      <ProgressBar value={earned / list.length} label={t('home.progressTitle')} className="my-3" />
      <Link to="/perfil" className="text-sm font-semibold text-navy underline-offset-4 hover:underline">
        {t('profile.achievements')} · {earned}/{list.length}
      </Link>
    </Card>
  )
}
