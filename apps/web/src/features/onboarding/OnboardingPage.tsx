import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate, useSearchParams } from 'react-router'
import { Icon, type IconName } from '../../components/icons'
import { PathMark } from '../../components/PathMark'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { safeNext, stagger } from '../../lib/ui'
import { useUser } from '../../state/userStore'
import { ProfileForm } from './ProfileForm'

type Step = 'welcome' | 'profile' | 'start'

export default function OnboardingPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const next = safeNext(params.get('next'))
  const { profile } = useUser()
  const [step, setStep] = useState<Step>(profile ? 'start' : 'welcome')

  if (step === 'profile') {
    return (
      <div className="mx-auto max-w-xl">
        <h1 className="rise text-3xl leading-tight font-extrabold text-night">
          {t('onboarding.profileTitle')}
        </h1>
        <p className="mt-2 mb-8 text-sm font-light text-copy">{t('onboarding.profileBody')}</p>
        <ProfileForm onSaved={() => (next ? navigate(next) : setStep('start'))} />
      </div>
    )
  }

  if (step === 'start') return <StartChoices />

  return (
    <div className="mx-auto max-w-xl">
      <Card tone="coal" className="relative rise overflow-hidden p-6 sm:p-8">
        <PathMark className="mb-8 w-48" />
        <h1 className="text-3xl leading-tight font-extrabold sm:text-4xl">{t('onboarding.welcomeTitle')}</h1>
        <p className="mt-4 text-sm font-light text-white/80">{t('onboarding.welcomeBody')}</p>
        <Button
          variant="onDark"
          size="lg"
          className="mt-8 w-full sm:w-auto"
          onClick={() => setStep('profile')}
        >
          {t('onboarding.google')}
        </Button>
        <p className="mt-4 text-xs font-light text-white/70">{t('onboarding.googleSoon')}</p>
      </Card>
      <Link
        to="/carreiras"
        className="mt-6 inline-flex items-center gap-2 text-sm font-normal text-blue underline-offset-4 hover:underline"
      >
        {t('onboarding.explore')}
        <Icon name="arrowRight" className="size-4" />
      </Link>
    </div>
  )
}

const CHOICES: { to: string; icon: IconName; title: 'startTest' | 'startCareers' | 'startCv' }[] = [
  { to: '/teste', icon: 'target', title: 'startTest' },
  { to: '/carreiras', icon: 'compass', title: 'startCareers' },
  { to: '/cv', icon: 'document', title: 'startCv' },
]

function StartChoices() {
  const { t } = useTranslation()

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="mb-8 rise text-3xl leading-tight font-extrabold text-night">
        {t('onboarding.startTitle')}
      </h1>
      <ul className="space-y-4">
        {CHOICES.map((choice, index) => (
          <li key={choice.to} className="rise" style={stagger(index + 1)}>
            <Link
              to={choice.to}
              className="flex items-center gap-4 rounded-card bg-surface p-5 shadow-card transition duration-300 hover:-translate-y-0.5 hover:shadow-lift"
            >
              <span className="grid size-12 shrink-0 place-items-center rounded-full bg-coal text-white">
                <Icon name={choice.icon} className="size-5" />
              </span>
              <span className="flex-1">
                <span className="block text-base font-semibold text-night">
                  {t(`onboarding.${choice.title}`)}
                </span>
                <span className="mt-1 block text-xs font-light text-muted">
                  {t(`onboarding.${choice.title}Body`)}
                </span>
              </span>
              <Icon name="chevronRight" className="size-5 text-muted" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
