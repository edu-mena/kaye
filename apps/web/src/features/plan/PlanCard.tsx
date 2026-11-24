import { useTranslation } from 'react-i18next'
import { Icon } from '../../components/icons'
import { ButtonLink } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { ProgressBar } from '../../components/ui/ProgressBar'
import { nextSteps } from '../../domain/plan'
import { usePlan } from '../../state/usePlan'
import { usePlanText } from './usePlanText'

/** "O meu plano" as a card of the home feed: the progress and the next step (the feed only has it for who made one). */
export function PlanCard() {
  const { t } = useTranslation()
  const text = usePlanText()
  const { view, loading } = usePlan()
  if (loading || !view) return null

  const next = nextSteps(view.items, 1)[0]
  return (
    <Card as="article" tone="coal" aria-labelledby="home-plan" data-tour="plan" className="p-5 sm:p-6">
      <div className="flex flex-wrap items-start gap-4">
        <div className="min-w-0 flex-1 basis-56">
          <p className="text-xs font-light text-white/70">{t('plan.title')}</p>
          <h2 id="home-plan" className="text-lg font-extrabold">
            {view.career.name}
          </h2>
          <p className="mt-1 text-sm font-light text-white/80">
            {t('plan.progress', { done: view.done, total: view.items.length })}
          </p>
          <ProgressBar
            className="mt-2"
            tone="gold"
            track="bg-white/15"
            value={view.items.length ? view.done / view.items.length : 0}
            label={t('plan.title')}
          />
        </div>
        <ButtonLink to="/plano" variant="onDark" size="sm">
          {t('plan.homeOpen')}
          <Icon name="arrowRight" className="size-4" />
        </ButtonLink>
      </div>
      {next && (
        <div className="mt-4 rounded-2xl bg-white/10 p-4">
          <p className="text-xs font-light text-white/70">{t('plan.homeNext')}</p>
          <p className="mt-1 text-sm font-normal">{text(next.step.title)}</p>
        </div>
      )}
    </Card>
  )
}
