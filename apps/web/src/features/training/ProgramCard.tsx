import { useTranslation } from 'react-i18next'
import { Icon } from '../../components/icons'
import { InstitutionLogo } from '../../components/InstitutionLogo'
import { ScoreRing } from '../../components/ScoreRing'
import { Button } from '../../components/ui/Button'
import { Chip } from '../../components/ui/Chip'
import type { Program } from '../../data/types'
import { formatKz, formatPercent } from '../../domain/format'
import type { ScoredProgram } from '../../domain/ranking'
import { useDuration, useRatingLabel } from '../../lib/useFormat'
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
function DetailsButton({ program, onOpen, tone = 'light' }: DetailsButtonProps) {
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

/** The three numbers people compare first, one line each: how long, how much, how students rate it. */
function ProgramFacts({ program, tone = 'light', className = '' }: ProgramFactsProps) {
  const { t } = useTranslation()
  const duration = useDuration()
  const ratingLabel = useRatingLabel()
  const dark = tone === 'dark'
  const facts = [
    {
      label: t('training.duration'),
      value: duration({ min: program.durationMonths, max: program.durationMonths }),
    },
    { label: t('training.cost'), value: program.totalCost === null ? '—' : formatKz(program.totalCost) },
    { label: t('training.rating'), value: ratingLabel(program.rating) },
  ]
  return (
    <dl className={`divide-y ${dark ? 'divide-white/10' : 'divide-line'} ${className}`}>
      {facts.map((fact) => (
        <div key={fact.label} className="flex items-baseline justify-between gap-4 py-2">
          <dt className={`shrink-0 text-xs font-light ${dark ? 'text-white/70' : 'text-muted'}`}>
            {fact.label}
          </dt>
          <dd className={`text-right text-sm font-semibold ${dark ? 'text-white' : 'text-night'}`}>
            {fact.value}
          </dd>
        </div>
      ))}
    </dl>
  )
}

type ProgramCardProps = {
  item: ScoredProgram
  /** Place in the ranking; without it (courses awaiting recognition) no number is shown. */
  rank?: number
  /** The first place: a dark card, with a line on why it leads. */
  lead?: string
  /** Opens the course in a popup (ranked courses). */
  onOpen?: () => void
}

/**
 * A course at a glance, like a career card: the course photo with its place (gold) and the
 * institution's logo, then the name, the score, the level and the three numbers people compare.
 * The photo is decorative (the name says it).
 */
export function ProgramCard({ item, rank, lead, onOpen }: ProgramCardProps) {
  const { t } = useTranslation()
  const { program, score } = item
  const tone: Tone = lead ? 'dark' : 'light'
  const quiet = lead ? 'text-white/70' : 'text-muted'

  return (
    <article
      className={`flex h-full flex-col overflow-hidden rounded-card shadow-card ${lead ? 'bg-coal text-white' : 'bg-surface text-night'}`}
    >
      <div className="relative h-40 shrink-0 bg-coal">
        {program.image && (
          <img src={program.image.small} alt="" loading="lazy" className="size-full object-cover" />
        )}
        {rank !== undefined && (
          <span
            aria-hidden="true"
            className="absolute top-3 left-3 grid h-10 min-w-10 place-items-center rounded-full bg-coal px-3 font-display text-base font-extrabold text-gold tabular-nums"
          >
            {rank}
          </span>
        )}
        <span className="absolute bottom-3 left-3">
          <InstitutionLogo institution={program.institution} />
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        {lead && <p className="mb-2 text-xs font-light text-white/70">{lead}</p>}
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h3 className="text-base leading-snug font-semibold">{program.name}</h3>
            <p className={`mt-1 text-xs font-light ${quiet}`}>
              {program.institution.name} · {program.institution.province}
            </p>
          </div>
          {program.recognized && <ScoreRing score={score} tone={tone} />}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {[program.level, ...program.schedule].map((key) => (
            <Chip key={key} tone={lead ? 'onDark' : 'neutral'}>
              {t(`training.${key}`)}
            </Chip>
          ))}
        </div>

        <div className="mt-auto pt-4">
          <ProgramFacts
            program={program}
            tone={tone}
            className={`border-t ${lead ? 'border-white/10' : 'border-line'}`}
          />
          <div className="mt-4 flex flex-wrap gap-2">
            {onOpen && <DetailsButton program={program} onOpen={onOpen} tone={tone} />}
            <CompareButton programId={program.id} tone={tone} />
          </div>
        </div>
      </div>
    </article>
  )
}
