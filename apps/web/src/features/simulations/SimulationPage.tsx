import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router'
import { Icon } from '../../components/icons'
import { NotFoundState } from '../../components/PageStates'
import { Button, ButtonLink } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { ProgressBar } from '../../components/ui/ProgressBar'
import { SIMULATIONS } from '../../data/demo/simulations'
import { useCareers } from '../../data/queries'
import type { Simulation, SimulationMoment, SimulationOption } from '../../data/types'
import { resultOf } from '../../domain/simulations'
import { userActions, useUser } from '../../state/userStore'
import { Authorship } from './Authorship'
import { Comments } from './Comments'

const NEXT_LINKS = { academy: '/academias', internship: '/estagios' } as const

/** One simulation (/simulacoes/:id): the intro, the moments of the day with their decisions, and the end. */
export default function SimulationPage() {
  const { t } = useTranslation()
  const { id } = useParams()
  const simulation = SIMULATIONS.find((entry) => entry.id === id)
  if (!simulation) {
    return (
      <NotFoundState
        title={t('simulations.notFoundTitle')}
        body={t('simulations.notFound')}
        action={{ to: '/simulacoes', label: t('simulations.back') }}
      />
    )
  }
  // A key per simulation: opening another one starts at its intro.
  return <Run key={simulation.id} simulation={simulation} />
}

/** The step the person is at: the intro, a moment of the day, or the end. */
type Step = 'intro' | number | 'end'

function Run({ simulation }: { simulation: Simulation }) {
  const { t } = useTranslation()
  const { data: careers = [] } = useCareers()
  const career = careers.find((entry) => entry.slug === simulation.careerSlug)
  const [step, setStep] = useState<Step>('intro')
  // What the person chose at each decision, by moment id. Only lives on this screen.
  const [picked, setPicked] = useState<Record<string, string>>({})
  const total = simulation.moments.length

  const moment = typeof step === 'number' ? simulation.moments[step] : undefined
  const advance = () => setStep(typeof step === 'number' ? (step + 1 < total ? step + 1 : 'end') : 0)
  const restart = () => {
    setPicked({})
    setStep('intro')
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        to="/simulacoes"
        className="mb-4 inline-flex items-center gap-2 text-sm font-light text-muted hover:text-night"
      >
        <Icon name="arrowLeft" className="size-4" />
        {t('simulations.back')}
      </Link>
      <header className="mb-6 rise">
        {career && <p className="text-xs font-semibold tracking-wide text-muted uppercase">{career.name}</p>}
        <h1 className="mt-1 text-2xl leading-tight font-extrabold text-night sm:text-3xl">
          {simulation.title}
        </h1>
        <div className="mt-3">
          <Authorship simulation={simulation} />
        </div>
      </header>

      {step === 'intro' && (
        <Card>
          <p className="text-base leading-relaxed font-light text-copy">{simulation.intro}</p>
          <p className="mt-3 flex items-center gap-1 text-xs font-light text-muted">
            <Icon name="clock" className="size-3.5" />
            {t('simulations.minutes', { count: simulation.minutes })} ·{' '}
            {t('simulations.moments', { count: total })}
          </p>
          <Button className="mt-5" onClick={advance}>
            {t('simulations.start')}
            <Icon name="arrowRight" className="size-4" />
          </Button>
        </Card>
      )}

      {moment && typeof step === 'number' && (
        <MomentView
          key={moment.id}
          moment={moment}
          position={step + 1}
          total={total}
          picked={picked[moment.id]}
          onPick={(optionId) => setPicked((current) => ({ ...current, [moment.id]: optionId }))}
          onNext={advance}
          last={step + 1 === total}
        />
      )}

      {step === 'end' && <Ending simulation={simulation} careerName={career?.name} onRestart={restart} />}
    </div>
  )
}

type MomentProps = {
  moment: SimulationMoment
  position: number
  total: number
  picked: string | undefined
  onPick: (optionId: string) => void
  onNext: () => void
  last: boolean
}

function MomentView({ moment, position, total, picked, onPick, onNext, last }: MomentProps) {
  const { t } = useTranslation()
  const options = moment.decision?.options ?? []
  const chosen = options.find((option) => option.id === picked)
  const waiting = moment.decision !== undefined && chosen === undefined

  return (
    <section aria-labelledby="moment-title">
      <ProgressBar value={position / total} label={t('simulations.momentOf', { current: position, total })} />
      <p className="mt-2 text-xs font-light text-muted">
        {t('simulations.momentOf', { current: position, total })}
      </p>
      <Card className="mt-3">
        <p className="text-sm font-semibold text-muted">{moment.time}</p>
        <h2 id="moment-title" className="mt-1 text-xl font-extrabold text-night">
          {moment.title}
        </h2>
        <p className="mt-3 text-base leading-relaxed font-light text-copy">{moment.text}</p>

        {moment.decision && (
          <div className="mt-5">
            <h3 className="text-base font-semibold text-night">{t('simulations.choose')}</h3>
            <p className="mt-1 text-sm font-light text-copy">{moment.decision.question}</p>
            <ul className="mt-3 space-y-2">
              {options.map((option) => (
                <li key={option.id}>
                  <button
                    type="button"
                    disabled={chosen !== undefined}
                    aria-pressed={chosen?.id === option.id}
                    onClick={() => onPick(option.id)}
                    className={`w-full rounded-2xl border px-4 py-3 text-left text-sm font-light transition ${
                      chosen?.id === option.id
                        ? 'border-night bg-ash-100 text-night'
                        : 'border-line bg-surface text-copy enabled:hover:border-night disabled:opacity-60'
                    }`}
                  >
                    {option.text}
                  </button>
                </li>
              ))}
            </ul>
            {chosen && <Outcome option={chosen} />}
          </div>
        )}

        <Button className="mt-5" disabled={waiting} onClick={onNext}>
          {last ? t('simulations.asksTitle') : t('simulations.continue')}
          <Icon name="arrowRight" className="size-4" />
        </Button>
      </Card>
    </section>
  )
}

/** What would happen, and why: shown after the choice, like the real consequence. */
function Outcome({ option }: { option: SimulationOption }) {
  const { t } = useTranslation()
  return (
    <output className="mt-4 block space-y-3 rounded-2xl bg-ash-100 p-4">
      <div>
        <p className="text-xs font-semibold tracking-wide text-muted uppercase">{t('simulations.happens')}</p>
        <p className="mt-1 text-sm font-light text-copy">{option.result}</p>
      </div>
      <div>
        <p className="text-xs font-semibold tracking-wide text-muted uppercase">{t('simulations.why')}</p>
        <p className="mt-1 text-sm font-light text-copy">{option.why}</p>
      </div>
    </output>
  )
}

function Ending({
  simulation,
  careerName,
  onRestart,
}: {
  simulation: Simulation
  careerName: string | undefined
  onRestart: () => void
}) {
  const { t } = useTranslation()
  const { simulations: results } = useUser()
  const answer = resultOf(results, simulation.id)

  const rate = (liked: boolean) =>
    userActions.rateSimulation({
      id: simulation.id,
      careerSlug: simulation.careerSlug,
      liked,
      at: new Date().toISOString(),
    })

  return (
    <div className="space-y-4">
      <Card as="section" aria-labelledby="asks-title">
        <h2 id="asks-title" className="text-xl font-extrabold text-night">
          {t('simulations.asksTitle')}
        </h2>
        <ul className="mt-3 space-y-2">
          {simulation.asks.map((ask) => (
            <li key={ask} className="flex items-start gap-2 text-sm font-light text-copy">
              <Icon name="check" className="mt-0.5 size-4 shrink-0 text-blue" />
              {ask}
            </li>
          ))}
        </ul>
      </Card>

      <Card as="section" aria-labelledby="rating-title">
        <h2 id="rating-title" className="text-xl font-extrabold text-night">
          {t('simulations.ratingTitle')}
        </h2>
        <p className="mt-1 text-sm font-light text-copy">{t('simulations.ratingHint')}</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Button
            variant={answer?.liked === true ? 'primary' : 'secondary'}
            aria-pressed={answer?.liked === true}
            onClick={() => rate(true)}
          >
            <Icon name="heart" className="size-4" />
            {t('simulations.liked')}
          </Button>
          <Button
            variant={answer?.liked === false ? 'primary' : 'secondary'}
            aria-pressed={answer?.liked === false}
            onClick={() => rate(false)}
          >
            <Icon name="close" className="size-4" />
            {t('simulations.disliked')}
          </Button>
        </div>
        {answer && (
          <output className="mt-3 block text-sm font-light text-copy">
            {t(answer.liked ? 'simulations.thanksLiked' : 'simulations.thanksDisliked')}
          </output>
        )}
      </Card>

      <Card as="section" aria-labelledby="next-title">
        <h2 id="next-title" className="text-xl font-extrabold text-night">
          {t('simulations.nextTitle')}
        </h2>
        <ul className="mt-3 space-y-3">
          {simulation.next.map((next) => (
            <li key={next.kind} className="text-sm font-light text-copy">
              <Link
                to={next.kind === 'course' ? `/carreiras/${simulation.careerSlug}` : NEXT_LINKS[next.kind]}
                className="font-semibold text-night underline underline-offset-2"
              >
                {t(`simulations.step_${next.kind}`)}
              </Link>
              : {next.text}
            </li>
          ))}
        </ul>
        <div className="mt-5 flex flex-wrap gap-3">
          <ButtonLink to={`/carreiras/${simulation.careerSlug}`}>
            {careerName ?? t('simulations.backToCareer')}
          </ButtonLink>
          <Button variant="secondary" onClick={onRestart}>
            {t('simulations.again')}
          </Button>
          <ButtonLink to="/simulacoes" variant="secondary">
            {t('simulations.otherDays')}
          </ButtonLink>
        </div>
      </Card>

      <Comments type="simulation" id={simulation.id} />
    </div>
  )
}
