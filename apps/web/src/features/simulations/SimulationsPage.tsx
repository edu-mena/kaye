import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { Icon } from '../../components/icons'
import { InterestNotice } from '../../components/InterestNotice'
import { Card } from '../../components/ui/Card'
import { Chip } from '../../components/ui/Chip'
import { SelectField } from '../../components/ui/Field'
import { PageHeader } from '../../components/ui/PageHeader'
import { SIMULATIONS } from '../../data/demo/simulations'
import { useCareers } from '../../data/queries'
import {
  GROUP_AREAS,
  MARKET_AREAS,
  type CareerSummary,
  type MarketArea,
  type Simulation,
} from '../../data/types'
import { decisionMoments, resultOf } from '../../domain/simulations'
import { careerSubject, type Subject } from '../../domain/relevance'
import { useInterestFilter } from '../../lib/useInterestFilter'
import { useUrlFilters } from '../../lib/useUrlFilters'
import { useUser } from '../../state/userStore'

/** Simulações (/simulacoes): a working day of each profession, the ones that touch the person's areas first. */
export default function SimulationsPage() {
  const { t } = useTranslation()
  const { data: careers = [] } = useCareers()
  const { simulations: results } = useUser()
  const interest = useInterestFilter('simulations')
  const [params, setParam] = useUrlFilters()

  const careerOf = (slug: string) => careers.find((career) => career.slug === slug)
  const areaOf = (simulation: Simulation): MarketArea | undefined => {
    const career = careerOf(simulation.careerSlug)
    return career ? GROUP_AREAS[career.group] : undefined
  }
  // A simulation whose career is not loaded yet says nothing about areas: it is for everyone.
  const subjectOf = (simulation: Simulation): Subject => {
    const career = careerOf(simulation.careerSlug)
    return career ? careerSubject(career) : {}
  }

  const area = params.get('area')
  const chosen = area ? SIMULATIONS.filter((simulation) => areaOf(simulation) === area) : SIMULATIONS
  // Choosing an area is asking for it: the interest filter keeps out of the way.
  const { items, hidden } = area ? { items: chosen, hidden: 0 } : interest.apply(chosen, subjectOf)
  const areas = MARKET_AREAS.filter((candidate) =>
    SIMULATIONS.some((simulation) => areaOf(simulation) === candidate),
  )
  const done = results.length

  return (
    <>
      <PageHeader title={t('simulations.title')} subtitle={t('simulations.subtitle')} />
      {SIMULATIONS.length === 0 ? (
        <p className="text-sm font-light text-muted">{t('simulations.empty')}</p>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2">
            <SelectField
              label={t('simulations.area')}
              placeholder={t('simulations.allAreas')}
              value={area ?? ''}
              options={areas.map((value) => ({ value, label: t(`market.area_${value}`) }))}
              onChange={(event) => setParam('area', event.target.value || null)}
            />
            {done > 0 && (
              <p className="self-end text-sm font-light text-copy">
                {t('simulations.testsDone', { count: done })}
              </p>
            )}
          </div>
          <div className="mt-3">
            <InterestNotice filter={interest} hidden={hidden} />
          </div>
          {items.length === 0 ? (
            <p className="mt-6 text-sm font-light text-muted">{t('simulations.noMatch')}</p>
          ) : (
            <ul className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {items.map((simulation) => (
                <li key={simulation.id}>
                  <SimulationCard
                    simulation={simulation}
                    career={careerOf(simulation.careerSlug)}
                    liked={resultOf(results, simulation.id)?.liked}
                  />
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </>
  )
}

type CardProps = { simulation: Simulation; career: CareerSummary | undefined; liked: boolean | undefined }

function SimulationCard({ simulation, career, liked }: CardProps) {
  const { t } = useTranslation()
  return (
    <Card className="flex h-full flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        {career && <Chip>{career.name}</Chip>}
        {simulation.example && <Chip>{t('simulations.example')}</Chip>}
        {liked !== undefined && (
          <Chip tone={liked ? 'success' : 'neutral'}>
            {t(liked ? 'simulations.likedBadge' : 'simulations.dislikedBadge')}
          </Chip>
        )}
      </div>
      <h2 className="text-base font-semibold text-night">
        <Link to={`/simulacoes/${simulation.id}`} className="hover:underline">
          {simulation.title}
        </Link>
      </h2>
      <p className="text-sm leading-relaxed font-light text-copy">{simulation.intro}</p>
      <p className="mt-auto flex items-center gap-1 text-xs font-light text-muted">
        <Icon name="clock" className="size-3.5" />
        {t('simulations.minutes', { count: simulation.minutes })} ·{' '}
        {t('simulations.decisions', { count: decisionMoments(simulation).length })}
      </p>
    </Card>
  )
}
