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
      className="group flex h-full gap-4 rounded-card bg-surface p-4 shadow-card transition-[box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:shadow-lift"
    >
      <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-navy-100 text-navy">
        <Icon name={GROUP_ICONS[career.group]} className="size-6" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-2">
          <span className="font-display text-lg leading-tight font-semibold text-navy">{career.name}</span>
          {match && <Chip tone={match === 'alto' ? 'success' : 'neutral'}>{t(`fit.${match}`)}</Chip>}
        </span>
        <span className="mt-1 block text-sm text-muted">{career.summary}</span>
        <span className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs font-medium text-navy">
          <span>{t(`demand.${career.demand}`)}</span>
          {career.salaryMedian !== null && (
            <span>{t('careers.median', { value: formatKz(career.salaryMedian) })}</span>
          )}
          {!career.detailed && <span className="text-muted">{t('careers.inCuration')}</span>}
        </span>
        {reasons.length > 0 && (
          <span className="mt-2 flex flex-wrap gap-1.5">
            {reasons.map((reason) => (
              <Chip key={reason} tone="goldSoft">
                {reason}
              </Chip>
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
