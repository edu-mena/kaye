import { useTranslation } from 'react-i18next'
import { Icon } from '../../components/icons'
import { ScoreBadge } from '../../components/ScoreBadge'
import { Button } from '../../components/ui/Button'
import { Chip } from '../../components/ui/Chip'
import { formatKz, formatPercent } from '../../domain/format'
import type { ScoredProgram } from '../../domain/ranking'
import { useDuration, useRatingLabel } from '../../lib/useFormat'
import { MAX_COMPARE, userActions, useUser } from '../../state/userStore'

type ProgramCardProps = { item: ScoredProgram; rank?: number }

export function ProgramCard({ item, rank }: ProgramCardProps) {
  const { t } = useTranslation()
  const duration = useDuration()
  const ratingLabel = useRatingLabel()
  const { compare } = useUser()
  const { program, score, criteria } = item
  const comparing = compare.includes(program.id)
  const full = compare.length >= MAX_COMPARE && !comparing

  return (
    <article className="rounded-card bg-surface p-4 shadow-card sm:p-5">
      <div className="flex items-start gap-4">
        {rank !== undefined && (
          <span className="font-display text-3xl leading-none font-bold text-navy/25" aria-hidden="true">
            {rank}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <h3 className="font-display text-lg leading-snug font-semibold text-navy">{program.name}</h3>
          <p className="text-sm text-muted">
            {program.institution.name} · {program.institution.province}
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <Chip>{t(`training.${program.level}`)}</Chip>
            {program.schedule.map((slot) => (
              <Chip key={slot}>{t(`training.${slot}`)}</Chip>
            ))}
            {program.recognized && (
              <Chip tone="success">
                <Icon name="check" className="size-3" />
                {t('training.recognized')}
              </Chip>
            )}
          </div>
        </div>
        {program.recognized && <ScoreBadge score={score} />}
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
        <div>
          <dt className="text-xs font-semibold text-muted">{t('training.duration')}</dt>
          <dd className="font-semibold text-navy">
            {duration({ min: program.durationMonths, max: program.durationMonths })}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-semibold text-muted">{t('training.cost')}</dt>
          <dd className="font-semibold text-navy">
            {program.totalCost === null ? '—' : formatKz(program.totalCost)}
          </dd>
        </div>
        <div className="col-span-2 sm:col-span-1">
          <dt className="text-xs font-semibold text-muted">{t('training.rating')}</dt>
          <dd className="font-semibold text-navy">{ratingLabel(program.rating)}</dd>
        </div>
      </dl>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        {program.recognized ? (
          <details className="group text-sm">
            <summary className="cursor-pointer font-semibold text-navy">{t('training.seeCalc')}</summary>
            <ul className="mt-2 space-y-1 text-muted">
              {criteria.map((criterion) => (
                <li key={criterion.key}>
                  {t(`training.${criterion.key}`)}:{' '}
                  {criterion.value === null
                    ? t('training.noData')
                    : `${Math.round(criterion.value * 100)} × ${formatPercent(criterion.weight)}`}
                </li>
              ))}
            </ul>
          </details>
        ) : (
          <span />
        )}
        <Button
          variant={comparing ? 'primary' : 'secondary'}
          size="sm"
          aria-pressed={comparing}
          disabled={full}
          onClick={() => userActions.toggleCompare(program.id)}
        >
          <Icon name={comparing ? 'check' : 'plus'} className="size-4" />
          {comparing ? t('training.comparing') : t('training.compare')}
        </Button>
      </div>
    </article>
  )
}
