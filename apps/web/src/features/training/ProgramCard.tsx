import { useTranslation } from 'react-i18next'
import { Icon } from '../../components/icons'
import { InstitutionLogo } from '../../components/InstitutionLogo'
import { ScoreRing } from '../../components/ScoreRing'
import { Button } from '../../components/ui/Button'
import { formatKz, formatPercent } from '../../domain/format'
import type { ScoredProgram } from '../../domain/ranking'
import { useDuration } from '../../lib/useFormat'
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

type CompareButtonProps = { programId: string; tone?: Tone; className?: string }

/** Adds or removes a course from the comparison (up to MAX_COMPARE). White on dark cards. */
export function CompareButton({ programId, tone = 'light', className }: CompareButtonProps) {
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
      className={className}
    >
      <Icon name={comparing ? 'check' : 'plus'} className="size-4" />
      {comparing ? t('training.comparing') : t('training.compare')}
    </Button>
  )
}

type ProgramCardProps = {
  item: ScoredProgram
  /** Place in the ranking; without it (courses awaiting recognition) no number is shown. */
  rank?: number
  /** The first place: a dark card. */
  featured?: boolean
  /** Opens the course in full; the whole card is the target (ranked courses). */
  onOpen?: () => void
}

/**
 * A course, small enough for two side by side on a phone: the photo with the place and the score,
 * the name, the institution, the cost and how long, and the compare button. The rest is on the
 * course's own view. The photo is decorative (the name says it).
 */
export function ProgramCard({ item, rank, featured = false, onOpen }: ProgramCardProps) {
  const duration = useDuration()
  const { program, score } = item
  const tone: Tone = featured ? 'dark' : 'light'
  const quiet = featured ? 'text-white/70' : 'text-muted'

  return (
    <article
      className={`relative flex h-full flex-col overflow-hidden rounded-card shadow-card transition duration-300 hover:-translate-y-0.5 hover:shadow-lift ${featured ? 'bg-coal text-white' : 'bg-surface text-night'}`}
    >
      <div className="relative h-28 shrink-0 bg-coal sm:h-36">
        {program.image && (
          <img src={program.image.small} alt="" loading="lazy" className="size-full object-cover" />
        )}
        {rank !== undefined && (
          <span
            aria-hidden="true"
            className="absolute top-2 left-2 grid h-8 min-w-8 place-items-center rounded-full bg-coal px-2 font-display text-sm font-extrabold text-gold tabular-nums"
          >
            {rank}
          </span>
        )}
        {program.recognized && (
          <span className="absolute top-2 right-2 rounded-full bg-coal">
            <ScoreRing score={score} tone="dark" />
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-3 sm:p-4">
        <h3 className="line-clamp-2 text-sm leading-snug font-semibold sm:text-base">
          {onOpen ? (
            <button type="button" onClick={onOpen} className="text-left after:absolute after:inset-0">
              {program.name}
            </button>
          ) : (
            program.name
          )}
        </h3>
        <p className={`mt-2 flex items-center gap-2 text-xs font-light ${quiet}`}>
          <InstitutionLogo institution={program.institution} size="sm" />
          <span className="line-clamp-2 min-w-0">{program.institution.name}</span>
        </p>
        <p className="mt-auto pt-3 text-sm font-semibold">
          {program.totalCost === null ? '—' : formatKz(program.totalCost)}
          <span className={`block text-xs font-light ${quiet}`}>
            {duration({ min: program.durationMonths, max: program.durationMonths })}
          </span>
        </p>
        <div className="relative z-10 mt-3">
          <CompareButton programId={program.id} tone={tone} className="w-full" />
        </div>
      </div>
    </article>
  )
}
