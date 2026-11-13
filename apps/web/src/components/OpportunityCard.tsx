import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import type { IconName } from './icons'
import { Icon } from './icons'
import { LIST_ROW } from './CareerRow'
import { ExternalLink } from './DetailParts'
import { Subheading } from './DetailLayout'
import { ButtonLink } from './ui/Button'
import { Card } from './ui/Card'
import { Chip } from './ui/Chip'
import { stagger } from '../lib/ui'
import type { SourceLink } from '../data/types'

// Bolsas and Estágios: real opportunities with a provider, a deadline, the official site and the source.

/** What every opportunity has in common. */
export type Opportunity = {
  id: string
  name: string
  provider: string
  deadline: string | null
  recurring: boolean
  url: string
  sources: SourceLink[]
}

/** "Prazo: 6 nov. 2026", "Prazo por confirmar", or that it opens every year. */
function useDeadline() {
  const { t, i18n } = useTranslation()
  const date = new Intl.DateTimeFormat(i18n.language, { day: 'numeric', month: 'short', year: 'numeric' })
  return ({ deadline, recurring }: Pick<Opportunity, 'deadline' | 'recurring'>) =>
    deadline === null
      ? t(recurring ? 'opportunity.deadlineYearly' : 'opportunity.deadlineNone')
      : t('opportunity.deadline', { date: date.format(new Date(`${deadline}T12:00:00`)) })
}

type OpportunityCardProps = {
  item: Opportunity
  /** Each chip's text; `open` adds the green "open now" one. */
  chips: string[]
  open: boolean
  openLabel: string
  facts: { icon: IconName; text: ReactNode }[]
  /** False for what has no deadline (a support programme). */
  showDeadline?: boolean
  /** A second action under the apply button ("Treinar a entrevista"). */
  extra?: ReactNode
}

/** One opportunity: chips, name, provider, the facts (the deadline last), the official site and the source. */
export function OpportunityCard({
  item,
  chips,
  open,
  openLabel,
  facts,
  showDeadline = true,
  extra,
}: OpportunityCardProps) {
  const { t } = useTranslation()
  const deadline = useDeadline()
  const titleId = `opportunity-${item.id}`
  return (
    <Card as="article" aria-labelledby={titleId} className="flex h-full flex-col">
      <div className="flex flex-wrap gap-1.5">
        {chips.map((chip) => (
          <Chip key={chip}>{chip}</Chip>
        ))}
        {open && <Chip tone="success">{openLabel}</Chip>}
      </div>
      <h3 id={titleId} className="mt-3 text-base leading-snug font-semibold text-night">
        {item.name}
      </h3>
      <p className="mt-1 text-xs font-light text-muted">{item.provider}</p>
      <ul className="mt-4 space-y-1.5 text-sm font-light text-copy">
        {[...facts, ...(showDeadline ? [{ icon: 'clock' as const, text: deadline(item) }] : [])].map(
          (fact) => (
            <li key={`${fact.icon}-${fact.text}`} className="flex items-start gap-2">
              <Icon name={fact.icon} className="mt-0.5 size-4 shrink-0 text-muted" />
              {fact.text}
            </li>
          ),
        )}
      </ul>
      <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-2 pt-5">
        <ButtonLink to={item.url} target="_blank" rel="noopener noreferrer" size="sm">
          {t('opportunity.apply')}
          <Icon name="arrowRight" className="size-4" />
        </ButtonLink>
        <span className="text-xs font-light text-muted">
          {t('opportunity.source')}{' '}
          {item.sources.map((source, index) => (
            <span key={source.url}>
              {index > 0 && ', '}
              <ExternalLink href={source.url}>{source.label}</ExternalLink>
            </span>
          ))}
        </span>
      </div>
      {extra}
    </Card>
  )
}

type OpportunityGridProps<T extends Opportunity> = {
  items: T[]
  count: string
  empty: string
  render: (item: T) => ReactNode
}

/** The count, then the cards in a grid, or a line saying the filters left nothing. */
export function OpportunityGrid<T extends Opportunity>({
  items,
  count,
  empty,
  render,
}: OpportunityGridProps<T>) {
  return (
    <>
      <output className="block text-xs font-light text-muted">{count}</output>
      {items.length === 0 ? (
        <p className="rounded-card bg-surface py-10 text-center text-sm font-light text-muted shadow-card">
          {empty}
        </p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((item, index) => (
            <li key={item.id} className="rise" style={stagger(Math.min(index, 6))}>
              {render(item)}
            </li>
          ))}
        </ul>
      )}
    </>
  )
}

const SHOWN = 3

type OpportunityLinksProps = {
  title: string
  items: Opportunity[]
  icon: IconName
  seeAllTo: string
  seeAllLabel: string
  className?: string
}

/** Up to three opportunities, each to its official site, and a link to all of them on their page. */
export function OpportunityLinks({
  title,
  items,
  icon,
  seeAllTo,
  seeAllLabel,
  className = '',
}: OpportunityLinksProps) {
  const deadline = useDeadline()
  if (items.length === 0) return null
  return (
    <div className={className}>
      <Subheading>{title}</Subheading>
      <ul className="grid gap-2 sm:grid-cols-2">
        {items.slice(0, SHOWN).map((item) => (
          <li key={item.id}>
            <a href={item.url} target="_blank" rel="noopener noreferrer" className={`${LIST_ROW} h-full`}>
              <span className="grid size-8 shrink-0 place-items-center rounded-full bg-coal text-gold">
                <Icon name={icon} className="size-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm leading-snug font-semibold text-night">{item.name}</span>
                <span className="mt-0.5 block truncate text-xs font-light text-muted">
                  {item.provider} · {deadline(item)}
                </span>
              </span>
              <Icon name="chevronRight" className="size-4 shrink-0 text-muted" />
            </a>
          </li>
        ))}
      </ul>
      <ButtonLink to={seeAllTo} variant="ghost" className="mt-3 -ml-3">
        {seeAllLabel}
        <Icon name="arrowRight" className="size-4" />
      </ButtonLink>
    </div>
  )
}
