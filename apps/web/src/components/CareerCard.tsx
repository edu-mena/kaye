import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import type { CareerSummary } from '../data/types'
import type { InterestLevel } from '../domain/fit'
import { formatKz } from '../domain/format'
import { GROUP_ICONS } from './groupIcons'
import { Icon } from './icons'
import { Chip } from './ui/Chip'

const NO_REASONS: string[] = []

type CareerCardProps = {
  career: CareerSummary
  match?: InterestLevel
  reasons?: string[]
}

export function CareerCard({ career, match, reasons = NO_REASONS }: CareerCardProps) {
  const { t } = useTranslation()

  return (
    <Link
      to={`/carreiras/${career.slug}`}
      className="group flex h-full gap-4 rounded-card bg-surface p-5 shadow-card transition-[box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:shadow-lift"
    >
      <span className="grid size-12 shrink-0 place-items-center rounded-full bg-coal text-white">
        <Icon name={GROUP_ICONS[career.group]} className="size-6" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-2">
          <span className="text-base leading-snug font-semibold text-night">{career.name}</span>
          {match && <Chip tone={match === 'alto' ? 'success' : 'neutral'}>{t(`fit.${match}`)}</Chip>}
        </span>
        <span className="mt-1 block text-sm font-light text-copy">{career.summary}</span>
        <span className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs font-light text-muted">
          <span>{t(`demand.${career.demand}`)}</span>
          {career.salaryMedian !== null && (
            <span>{t('careers.median', { value: formatKz(career.salaryMedian) })}</span>
          )}
          {!career.detailed && <span className="text-muted">{t('careers.inCuration')}</span>}
        </span>
        {reasons.length > 0 && (
          <span className="mt-3 flex flex-wrap gap-2">
            {reasons.map((reason) => (
              <Chip key={reason}>{reason}</Chip>
            ))}
          </span>
        )}
      </span>
      <Icon
        name="chevronRight"
        className="mt-1 size-5 shrink-0 text-muted transition-transform group-hover:translate-x-0.5"
      />
    </Link>
  )
}
