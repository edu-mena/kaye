import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import type { CareerSummary } from '../data/types'
import { GROUP_ICONS } from './groupIcons'
import { Icon } from './icons'

/** A white one-line item in a list (careers, institutions): the first of a list gets a card, the rest these. */
export const LIST_ROW =
  'flex items-center gap-3 rounded-2xl bg-surface p-3 shadow-card transition duration-300 hover:-translate-y-0.5 hover:shadow-lift'

/** A career after the first one: its area icon, the name and the area, in one line. */
export function CareerRow({ career }: { career: CareerSummary }) {
  const { t } = useTranslation()
  return (
    <Link to={`/carreiras/${career.slug}`} className={LIST_ROW}>
      <span className="grid size-10 shrink-0 place-items-center rounded-full bg-coal text-gold">
        <Icon name={GROUP_ICONS[career.group]} className="size-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm leading-snug font-semibold text-night">{career.name}</span>
        <span className="mt-1 block text-xs font-light text-muted">{t(`groups.${career.group}`)}</span>
      </span>
      <Icon name="chevronRight" className="size-5 shrink-0 text-muted" />
    </Link>
  )
}
