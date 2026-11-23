import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router'
import { Icon } from '../../components/icons'
import { NotFoundState } from '../../components/PageStates'
import { Card } from '../../components/ui/Card'
import { Chip } from '../../components/ui/Chip'
import { PageHeader } from '../../components/ui/PageHeader'
import { AGENTS } from '../../data/demo/agents'
import { SIMULATIONS } from '../../data/demo/simulations'

const PHOTOS = import.meta.glob<string>('../../assets/mentors/*.{webp,jpg,jpeg,png}', {
  eager: true,
  import: 'default',
})

/** A Kayé agent (/agentes/:id): who they are, what they allowed to show, who checked them and what they wrote. */
export default function AgentPage() {
  const { t, i18n } = useTranslation()
  const { id } = useParams()
  const agent = AGENTS.find((entry) => entry.id === id)
  if (!agent) {
    return (
      <NotFoundState
        title={t('simulations.agent.notFoundTitle')}
        body={t('simulations.agent.notFound')}
        action={{ to: '/simulacoes', label: t('simulations.agent.back') }}
      />
    )
  }

  const photo = agent.photo ? PHOTOS[`../../assets/mentors/${agent.photo}`] : undefined
  const date = new Intl.DateTimeFormat(i18n.language, { day: 'numeric', month: 'long', year: 'numeric' })
  const written = SIMULATIONS.filter((simulation) => simulation.agentId === agent.id)

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title={agent.name}
        subtitle={[agent.role, agent.company].filter(Boolean).join(' · ')}
        back={{ to: '/simulacoes', label: t('simulations.agent.back') }}
      />
      <Card className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          {photo && <img src={photo} alt="" decoding="async" className="size-16 rounded-full object-cover" />}
          <div className="space-y-1 text-sm font-light text-copy">
            <Chip>{t('simulations.agent.title')}</Chip>
            <p>{t('simulations.agent.area', { area: t(`market.area_${agent.area}`) })}</p>
            {agent.company && <p>{t('simulations.agent.company', { company: agent.company })}</p>}
          </div>
        </div>
        <p className="flex items-center gap-2 text-sm font-light text-copy">
          <Icon name="shield" className="size-4 shrink-0" />
          {t('simulations.agent.verified', {
            by: agent.verifiedBy,
            date: date.format(new Date(agent.verifiedAt)),
          })}
        </p>
        <p className="text-xs font-light text-muted">{t('simulations.agent.rules')}</p>
      </Card>
      <h2 className="mt-8 text-lg font-semibold text-night">{t('simulations.agent.written')}</h2>
      {written.length === 0 ? (
        <p className="mt-2 text-sm font-light text-muted">{t('simulations.agent.none')}</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {written.map((simulation) => (
            <li key={simulation.id}>
              <Link
                to={`/simulacoes/${simulation.id}`}
                className="text-sm font-normal text-night underline underline-offset-2"
              >
                {simulation.title}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
