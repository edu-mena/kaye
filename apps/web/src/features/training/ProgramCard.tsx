import { useTranslation } from 'react-i18next'
import { Icon } from '../../components/icons'
import { ScoreRing } from '../../components/ScoreRing'
import { Button } from '../../components/ui/Button'
import { Chip } from '../../components/ui/Chip'
import { formatKz, formatPercent } from '../../domain/format'
import type { ScoredProgram } from '../../domain/ranking'
import { useDuration, useRatingLabel } from '../../lib/useFormat'
import { MAX_COMPARE, userActions, useUser } from '../../state/userStore'

type ProgramCardProps = { item: ScoredProgram; rank?: number }

/**
 * How the Kayé score adds up (docs/arquitetura.md, 5.7). Each criterion's bar is as long as its
 * weight (40% of the width for 40% of the score), filled with the points the course earned.
 */
export function ScoreBreakdown({ criteria }: { criteria: ScoredProgram['criteria'] }) {
  const { t } = useTranslation()
  return (
    <ul className="space-y-4">
      {criteria.map((criterion) => {
        const max = Math.round(criterion.weight * 100)
        const got = criterion.value === null ? null : Math.round(criterion.value * criterion.weight * 100)
        return (
          <li key={criterion.key}>
            <div className="mb-2 flex items-baseline justify-between gap-4 text-xs">
              <span className="font-normal text-night">
                {t(`training.${criterion.key}`)}
                {got !== null && (
                  <span className="font-light text-muted">
                    {' '}
                    · {t('training.weight', { value: formatPercent(criterion.weight) })}
                  </span>
                )}
              </span>
              <span className="shrink-0 font-normal text-night tabular-nums">
                {got === null ? t('training.noData') : t('training.points', { got, max })}
              </span>
            </div>
            <span aria-hidden="true" className="block h-2 rounded-full bg-ash-100">
              <span className="block h-full rounded-full bg-ash-300" style={{ width: `${max}%` }}>
                <span
                  className="block h-full rounded-full bg-night"
                  style={{ width: got === null || max === 0 ? 0 : `${(got / max) * 100}%` }}
                />
              </span>
            </span>
          </li>
        )
      })}
    </ul>
  )
}

/** Adds or removes a course from the comparison (up to MAX_COMPARE). */
export function CompareButton({ programId }: { programId: string }) {
  const { t } = useTranslation()
  const { compare } = useUser()
  const comparing = compare.includes(programId)
  const full = compare.length >= MAX_COMPARE && !comparing
  return (
    <Button
      variant={comparing ? 'primary' : 'secondary'}
      size="sm"
      aria-pressed={comparing}
      disabled={full}
      onClick={() => userActions.toggleCompare(programId)}
    >
      <Icon name={comparing ? 'check' : 'plus'} className="size-4" />
      {comparing ? t('training.comparing') : t('training.compare')}
    </Button>
  )
}

export function ProgramCard({ item, rank }: ProgramCardProps) {
  const { t } = useTranslation()
  const duration = useDuration()
  const ratingLabel = useRatingLabel()
  const { program, score, criteria } = item

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
        {program.recognized && <ScoreRing score={score} />}
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
            <summary className="cursor-pointer font-normal text-night">{t('training.seeCalc')}</summary>
            <div className="mt-2">
              <ScoreBreakdown criteria={criteria} />
            </div>
          </details>
        ) : (
          <span />
        )}
        <CompareButton programId={program.id} />
      </div>
    </article>
  )
}
