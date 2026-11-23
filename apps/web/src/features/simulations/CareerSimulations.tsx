import { useTranslation } from 'react-i18next'
import { Icon } from '../../components/icons'
import { ButtonLink } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { SIMULATIONS } from '../../data/demo/simulations'
import { resultOf, simulationsOf } from '../../domain/simulations'
import { useUser } from '../../state/userStore'

/** On the career page: "Vive um dia como…", for each simulation of the career; nothing when it has none. */
export function CareerSimulations({ careerSlug, careerName }: { careerSlug: string; careerName: string }) {
  const { t } = useTranslation()
  const { simulations: results } = useUser()
  const list = simulationsOf(SIMULATIONS, careerSlug)
  if (list.length === 0) return null

  return (
    <section className="mt-8">
      {list.map((simulation) => {
        const answer = resultOf(results, simulation.id)
        return (
          <Card key={simulation.id} tone="gray" className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Icon name="play" className="size-6 shrink-0" />
            <div className="min-w-0 flex-1">
              <h2 id={`simulations-${simulation.id}`} className="text-base font-semibold text-night">
                {t('simulations.careerTitle', { career: careerName })}
              </h2>
              <p className="text-sm font-light text-copy">{t('simulations.careerBody')}</p>
              {answer && (
                <p className="mt-1 text-xs font-light text-muted">
                  {t(answer.liked ? 'simulations.likedBadge' : 'simulations.dislikedBadge')}
                </p>
              )}
            </div>
            <ButtonLink to={`/simulacoes/${simulation.id}`}>{t('simulations.live')}</ButtonLink>
          </Card>
        )
      })}
    </section>
  )
}
