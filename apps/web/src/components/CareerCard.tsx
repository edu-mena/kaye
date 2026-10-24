import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import type { CareerSummary } from '../data/types'
import type { InterestLevel } from '../domain/fit'
import { formatKz } from '../domain/format'
import { DemandMeter } from './DemandMeter'
import { GROUP_ICONS } from './groupIcons'
import { Icon } from './icons'
import { Chip } from './ui/Chip'

const NO_REASONS: string[] = []
const MATCH_STEPS: Record<InterestLevel, number> = { baixo: 1, medio: 2, alto: 3 }

type CareerCardProps = {
  career: CareerSummary
  match?: InterestLevel
  reasons?: string[]
  /** Leaves out the two lines on what the career is (long lists, where the name says enough). */
  brief?: boolean
}

/**
 * A career at a glance: the name first and strong, the area quiet under it, and a footer with the
 * two numbers people compare (salary, demand). With the test done, how well it matches closes the
 * card as a small meter.
 */
export function CareerCard({ career, match, reasons = NO_REASONS, brief = false }: CareerCardProps) {
  const { t } = useTranslation()

  return (
    <Link
      to={`/carreiras/${career.slug}`}
      className="group flex h-full flex-col rounded-card bg-surface p-5 shadow-card transition duration-300 hover:-translate-y-0.5 hover:shadow-lift"
    >
      <span className="flex items-start gap-4">
        <span className="grid size-11 shrink-0 place-items-center rounded-full bg-coal text-white">
          <Icon name={GROUP_ICONS[career.group]} className="size-5" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-base leading-snug font-semibold text-night">{career.name}</span>
          <span className="mt-1 block text-xs font-light text-muted">
            {t(`groups.${career.group}`)}
            {!career.detailed && ` · ${t('careers.inCuration')}`}
          </span>
        </span>
      </span>

      {!brief && <span className="mt-4 line-clamp-2 text-sm font-light text-copy">{career.summary}</span>}
      {reasons.length > 0 && (
        <span className="mt-4 flex flex-wrap gap-2">
          {reasons.map((reason) => (
            <Chip key={reason}>{reason}</Chip>
          ))}
        </span>
      )}

      <span className="mt-auto pt-5">
        <span className="flex items-end justify-between gap-4 border-t border-line pt-4">
          <span>
            <span className="block text-xs font-light text-muted">{t('careers.medianLabel')}</span>
            <span className="mt-1 block text-sm font-semibold text-night">
              {career.salaryMedian === null
                ? '—'
                : t('careers.perMonth', { value: formatKz(career.salaryMedian) })}
            </span>
          </span>
          <span className="flex items-center gap-3">
            <DemandMeter demand={career.demand} />
            <Icon
              name="chevronRight"
              className="size-5 shrink-0 text-muted transition-transform group-hover:translate-x-0.5"
            />
          </span>
        </span>
        {match && (
          <span className="mt-4 flex items-center justify-between gap-4 rounded-2xl bg-ash-100 px-4 py-3">
            <span className="flex items-center gap-2 text-xs font-normal text-night">
              <Icon name="target" className="size-4 text-blue" />
              {t(`fit.${match}`)}
            </span>
            <span aria-hidden="true" className="flex gap-1">
              {[1, 2, 3].map((step) => (
                <span
                  key={step}
                  className={`h-1.5 w-6 rounded-full ${step <= MATCH_STEPS[match] ? 'bg-blue' : 'bg-ash-300'}`}
                />
              ))}
            </span>
          </span>
        )}
      </span>
    </Link>
  )
}
