import { useTranslation } from 'react-i18next'
import { Icon } from '../../components/icons'
import { ButtonLink } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { ProgressBar } from '../../components/ui/ProgressBar'
import { nextSteps } from '../../domain/plan'
import { usePlan } from '../../state/usePlan'
import { usePlanText } from './usePlanText'

/** "O meu plano" on top of the home: the progress and the next step, or an invitation to make one. */
export function PlanCard() {
  const { t } = useTranslation()
  const text = usePlanText()
  const { view, loading } = usePlan()
  if (loading) return null

  if (!view) {
    return (
      <Card
        as="section"
        tone="notice"
        aria-labelledby="home-plan"
        data-tour="plan"
        className="flex flex-wrap items-center gap-4 p-5"
      >
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-blue text-white">
          <Icon name="path" className="size-5" />
        </span>
        <div className="min-w-0 flex-1 basis-56">
          <h2 id="home-plan" className="text-base font-semibold text-night">
            {t('plan.title')}
          </h2>
          <p className="mt-0.5 text-sm font-light text-copy">{t('plan.homeEmpty')}</p>
        </div>
        <ButtonLink to="/plano">
          {t('plan.homeCta')}
          <Icon name="arrowRight" className="size-4" />
        </ButtonLink>
      </Card>
    )
  }

  const next = nextSteps(view.items, 1)[0]
  return (
    <Card as="section" tone="coal" aria-labelledby="home-plan" data-tour="plan" className="p-5 sm:p-6">
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
