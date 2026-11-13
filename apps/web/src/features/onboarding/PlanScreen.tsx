import { useTranslation } from 'react-i18next'
import { CareerCard } from '../../components/CareerCard'
import { Icon, type IconName } from '../../components/icons'
import { ButtonLink } from '../../components/ui/Button'
import type { Goal } from '../../domain/discovery'
import { stagger } from '../../lib/ui'
import { useRecommendations } from '../../lib/useRecommendations'
import { useUser } from '../../state/userStore'
import { StepFooter, StepHeading } from './StepScreens'

const GOAL_STEP_ICONS: Record<Goal, IconName> = {
  discover: 'target',
  change: 'target',
  course: 'cap',
  job: 'building',
  cv: 'document',
}

/**
 * What the person gets for answering: the careers that follow from it and the steps from here. Then
 * Novidades, already showing "Para ti" from the areas they chose.
 */
export function PlanScreen({ next }: { next: string | null }) {
  const { t } = useTranslation()
  const { profile, discovery } = useUser()
  const recommendations = useRecommendations(4)
  const goal = discovery?.goal ?? 'discover'

  const steps: { icon: IconName; title: string; body: string }[] = [
    { icon: 'briefcase', title: t('onboarding.plan1Title'), body: t('onboarding.plan1Body') },
    {
      icon: GOAL_STEP_ICONS[goal],
      title: t(`onboarding.plan2Title_${goal}`),
      body: t(`onboarding.plan2Body_${goal}`),
    },
    { icon: 'path', title: t('onboarding.plan3Title'), body: t('onboarding.plan3Body') },
  ]

  return (
    <div className="flex min-h-dvh flex-col bg-surface">
      <main className="mx-auto w-full max-w-2xl flex-1 animate-step-in px-4 pt-6 pb-6">
        <StepHeading
          title={t('onboarding.planTitle', { name: profile?.name ?? '' })}
          hint={t('onboarding.planHint')}
          speaking={false}
          hop="plan"
        />

        <h2 className="mt-8 text-base font-semibold text-night">{t('onboarding.planCareers')}</h2>
        <ul className="mt-4 grid grid-cols-2 gap-3">
          {recommendations?.map((item, index) => (
            <li key={item.career.slug} className="rise" style={stagger(index + 1)}>
              <CareerCard career={item.career} match={item.match} brief />
            </li>
          ))}
        </ul>

        <h2 className="mt-8 text-base font-semibold text-night">{t('onboarding.planSteps')}</h2>
        <ol className="relative mt-4 space-y-5 before:absolute before:top-4 before:bottom-4 before:left-5 before:w-0.5 before:bg-ash-300">
          {steps.map((step, index) => (
            <li key={step.title} className="relative flex rise gap-4" style={stagger(index + 5)}>
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-coal text-gold">
                <Icon name={step.icon} className="size-5" />
              </span>
              <span>
                <span className="block text-sm font-semibold text-night">{step.title}</span>
                <span className="mt-1 block text-sm font-light text-copy">{step.body}</span>
              </span>
            </li>
          ))}
        </ol>
      </main>
      <StepFooter>
        <ButtonLink to={next ?? '/novidades'} size="lg" className="w-full">
          {t('onboarding.planCta')}
          <Icon name="arrowRight" className="size-4" />
        </ButtonLink>
      </StepFooter>
    </div>
  )
}
