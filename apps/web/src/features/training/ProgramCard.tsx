import { useTranslation } from 'react-i18next'
import { Icon } from '../../components/icons'
import { InstitutionLogo } from '../../components/InstitutionLogo'
import { ScoreRing } from '../../components/ScoreRing'
import { Button } from '../../components/ui/Button'
import { Chip } from '../../components/ui/Chip'
import type { Program } from '../../data/types'
import { formatKz, formatPercent } from '../../domain/format'
import type { ScoredProgram } from '../../domain/ranking'
import { useDuration, useRatingParts } from '../../lib/useFormat'
import { MAX_COMPARE, userActions, useUser } from '../../state/userStore'

type Tone = 'light' | 'dark'

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

/** Adds or removes a course from the comparison (up to MAX_COMPARE). White on dark cards. */
export function CompareButton({ programId, tone = 'light' }: { programId: string; tone?: Tone }) {
  const { t } = useTranslation()
  const { compare } = useUser()
  const comparing = compare.includes(programId)
  const full = compare.length >= MAX_COMPARE && !comparing
  const variant =
    tone === 'dark' ? (comparing ? 'onDark' : 'onDarkOutline') : comparing ? 'primary' : 'secondary'
  return (
    <Button
      variant={variant}
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

type DetailsButtonProps = { program: Program; onOpen: () => void; tone?: Tone }

/** Opens the course popup. The visible words stay short; the name tells screen readers which course. */
export function DetailsButton({ program, onOpen, tone = 'light' }: DetailsButtonProps) {
  const { t } = useTranslation()
  return (
    <Button
      variant={tone === 'dark' ? 'onDark' : 'secondary'}
      size="sm"
      aria-label={t('training.detailsOf', { name: program.name })}
      onClick={onOpen}
    >
      {t('training.details')}
      <Icon name="arrowRight" className="size-4" />
    </Button>
  )
}

type ProgramFactsProps = { program: Program; tone?: Tone; className?: string }

/** The three numbers people compare first: how long, how much, how students rate it. */
export function ProgramFacts({ program, tone = 'light', className = '' }: ProgramFactsProps) {
  const { t } = useTranslation()
  const duration = useDuration()
  const rating = useRatingParts()(program.rating)
  const quiet = tone === 'dark' ? 'text-white/70' : 'text-muted'
  const facts = [
    {
      label: t('training.duration'),
      value: duration({ min: program.durationMonths, max: program.durationMonths }),
    },
    { label: t('training.cost'), value: program.totalCost === null ? '—' : formatKz(program.totalCost) },
    { label: t('training.rating'), value: rating.value, note: rating.note },
  ]
  return (
    <dl className={`grid grid-cols-3 gap-4 ${className}`}>
      {facts.map((fact) => (
        <div key={fact.label} className="min-w-0">
          <dt className={`text-xs font-light ${quiet}`}>{fact.label}</dt>
          <dd className={`mt-1 text-sm font-semibold ${tone === 'dark' ? 'text-white' : 'text-night'}`}>
            {fact.value}
            {fact.note && <span className={`mt-1 block text-xs font-light ${quiet}`}>{fact.note}</span>}
          </dd>
        </div>
      ))}
    </dl>
  )
}

type ProgramCardProps = {
  item: ScoredProgram
  rank?: number
  /** Opens the course in a popup (ranked courses). */
  onOpen?: () => void
}

/**
 * A course in the list: a stack on phones and one row from lg (who and what, the numbers, the
 * actions), so a long list stays easy to scan on a wide screen.
 */
export function ProgramCard({ item, rank, onOpen }: ProgramCardProps) {
  const { t } = useTranslation()
  const { program, score } = item

  return (
    <article className="rounded-card bg-surface p-5 shadow-card sm:p-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:gap-8">
        <div className="flex min-w-0 flex-1 items-start gap-4">
          {rank !== undefined && (
            <span
              className="w-7 shrink-0 pt-3 font-display text-2xl leading-none font-extrabold text-blue tabular-nums"
              aria-hidden="true"
            >
              {rank}
            </span>
          )}
          <InstitutionLogo institution={program.institution} className="ring-1 ring-line" />
          <div className="min-w-0 flex-1">
            <h3 className="text-base leading-snug font-semibold text-night">{program.name}</h3>
            <p className="mt-1 text-xs font-light text-muted">
              {program.institution.name} · {program.institution.province}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
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

        <ProgramFacts program={program} className="lg:w-96 lg:shrink-0" />

        <div className="flex flex-wrap gap-2 lg:w-40 lg:shrink-0 lg:flex-col lg:items-stretch">
          {onOpen && <DetailsButton program={program} onOpen={onOpen} />}
          <CompareButton programId={program.id} />
        </div>
      </div>
    </article>
  )
}
