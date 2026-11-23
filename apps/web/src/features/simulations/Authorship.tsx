import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { Icon } from '../../components/icons'
import { Chip } from '../../components/ui/Chip'
import { AGENTS } from '../../data/demo/agents'
import type { Simulation } from '../../data/types'
import { authorOf } from '../../domain/simulations'
import type { Locale } from '../../lib/i18n'

/** True when the text exists in the app's language; otherwise it shows in Portuguese, marked. */
function useTranslated(simulation: Simulation): boolean {
  const { i18n } = useTranslation()
  return simulation.languages.includes(i18n.language.slice(0, 2) as Locale)
}

/** Who wrote a simulation, and the marks that say it is an example and not yet translated. */
export function Authorship({ simulation }: { simulation: Simulation }) {
  const { t, i18n } = useTranslation()
  const agent = authorOf(simulation, AGENTS)
  const translated = useTranslated(simulation)
  const date = new Intl.DateTimeFormat(i18n.language, { day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <div className="space-y-2 text-sm font-light text-copy">
      <p className="flex flex-wrap items-center gap-2">
        <Icon name="pencil" className="size-4 shrink-0" />
        {agent ? (
          <>
            <Link to={`/agentes/${agent.id}`} className="font-normal text-night underline underline-offset-2">
              {t('simulations.by', { name: agent.name })}
            </Link>
            <span className="text-xs text-muted">
              {t('simulations.verified', {
                by: agent.verifiedBy,
                date: date.format(new Date(agent.verifiedAt)),
              })}
            </span>
          </>
        ) : (
          <span className="font-normal text-night">
            {t('simulations.by', { name: t('simulations.team') })}
          </span>
        )}
      </p>
      {simulation.example && (
        <p className="flex flex-wrap items-center gap-2">
          <Chip>{t('simulations.example')}</Chip>
          <span className="text-xs text-muted">{t('simulations.exampleHint')}</span>
        </p>
      )}
      {!translated && <p className="text-xs text-muted">{t('simulations.notTranslated')}</p>}
    </div>
  )
}
