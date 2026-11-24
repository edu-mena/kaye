import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { Card } from '../../components/ui/Card'
import { Chip } from '../../components/ui/Chip'
import { journey, type JourneyPhase } from '../../domain/journey'
import { strengthsDone } from '../../domain/strengths'
import { useRiasecProfile } from '../../state/useRiasecProfile'
import { activeCv, useUser } from '../../state/userStore'
import { CardHeading } from './CardHeading'

const TEXT = {
  discover: { title: 'forYou.journeyDiscover', body: 'forYou.journeyDiscoverBody' },
  decide: { title: 'forYou.journeyDecide', body: 'forYou.journeyDecideBody' },
  prepare: { title: 'forYou.journeyPrepare', body: 'forYou.journeyPrepareBody' },
} as const satisfies Record<JourneyPhase, { title: string; body: string }>

/** Where each phase leads: the step of it the person has not done yet. */
function useRoutes(): Record<JourneyPhase, string> {
  const user = useUser()
  const { completed } = useRiasecProfile()
  return {
    discover: !completed ? '/teste' : '/teste/valencias',
    decide: user.targetCareer ? `/carreiras/${user.targetCareer}?secao=path` : '/carreiras',
    prepare: !activeCv(user) ? '/cv' : '/plano',
  }
}

/** Discover, decide, prepare: three phases, the first one not done is where the person is. */
export function Journey() {
  const { t } = useTranslation()
  const user = useUser()
  const { completed } = useRiasecProfile()
  const routes = useRoutes()
  const steps = journey({
    testDone: completed,
    strengthsDone: strengthsDone(user.strengths),
    targetCareer: user.targetCareer,
    hasCv: activeCv(user) !== null,
    hasPlan: user.plan !== null,
  })

  return (
    <Card as="section" aria-labelledby="home-journey" className="p-5">
      <CardHeading id="home-journey" icon="path">
        {t('forYou.journeyTitle')}
      </CardHeading>
      <ol className="mt-3 divide-y divide-line">
        {steps.map((step, index) => {
          return (
            <li key={step.phase} className="py-3 first:pt-0 last:pb-0">
              <Link to={routes[step.phase]} className="flex items-center gap-4">
                <span
                  aria-hidden="true"
                  className={`font-display text-3xl leading-none font-extrabold tabular-nums ${
                    step.current ? 'text-blue' : 'text-muted'
                  }`}
                >
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-normal text-night">{t(TEXT[step.phase].title)}</span>
                  <span className="block text-xs font-light text-muted">{t(TEXT[step.phase].body)}</span>
                </span>
                {step.current ? (
                  <Chip tone="night">{t('forYou.journeyHere')}</Chip>
                ) : (
                  <span className="text-xs font-light text-muted">
                    {step.done ? t('forYou.journeyDone') : t('forYou.journeyNext')}
                  </span>
                )}
              </Link>
            </li>
          )
        })}
      </ol>
    </Card>
  )
}
