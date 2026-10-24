import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Icon, type IconName } from '../../components/icons'
import { InstitutionLogo } from '../../components/InstitutionLogo'
import { ScoreRing } from '../../components/ScoreRing'
import { Button } from '../../components/ui/Button'
import { Slides } from '../../components/ui/Slides'
import type { Program } from '../../data/types'
import { formatKz, formatPercent } from '../../domain/format'
import { recognitionBody, type ScoredProgram } from '../../domain/ranking'
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

type Fact = { id: string; label: string; value: string; note?: string; visual: ReactNode }

/** The course one fact at a time: the score, the cost, how long and how students rate it. */
function useFacts(item: ScoredProgram, tone: Tone): Fact[] {
  const { t } = useTranslation()
  const duration = useDuration()
  const rating = useRatingParts()(item.program.rating)
  const { program, score } = item
  const circle = `grid size-12 shrink-0 place-items-center rounded-full ${tone === 'dark' ? 'bg-white/10 text-gold' : 'bg-ash-100 text-night'}`
  const icon = (name: IconName) => (
    <span className={circle}>
      <Icon name={name} className="size-5" />
    </span>
  )
  const perMonth =
    program.totalCost !== null && program.durationMonths > 0
      ? program.totalCost / program.durationMonths
      : null

  return [
    program.recognized
      ? {
          id: 'score',
          label: t('training.score'),
          value: t('training.scoreValue', { score }),
          note: `${t('training.recognizedBy')} ${recognitionBody(program.level).code}`,
          visual: <ScoreRing score={score} tone={tone} />,
        }
      : { id: 'score', label: t('training.score'), value: t('training.recognizedNo'), visual: icon('info') },
    {
      id: 'cost',
      label: t('training.cost'),
      value: program.totalCost === null ? '—' : formatKz(program.totalCost),
      note: perMonth === null ? undefined : t('training.perMonth', { value: formatKz(perMonth) }),
      visual: icon('wallet'),
    },
    {
      id: 'duration',
      label: t('training.duration'),
      value: duration({ min: program.durationMonths, max: program.durationMonths }),
      note: [program.level, ...program.schedule].map((key) => t(`training.${key}`)).join(' · '),
      visual: icon('clock'),
    },
    {
      id: 'rating',
      label: t('training.rating'),
      value: rating.value,
      note: rating.note,
      visual: icon('award'),
    },
  ]
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
 * institution's logo, the name, then one fact at a time in slides, and the two actions.
 * The photo is decorative (the name says it).
 */
export function ProgramCard({ item, rank, lead, onOpen }: ProgramCardProps) {
  const { program } = item
  const tone: Tone = lead ? 'dark' : 'light'
  const quiet = lead ? 'text-white/70' : 'text-muted'
  const facts = useFacts(item, tone)

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
        <h3 className="text-base leading-snug font-semibold">{program.name}</h3>
        <p className={`mt-1 text-xs font-light ${quiet}`}>
          {program.institution.name} · {program.institution.province}
        </p>

        <div className="mt-auto pt-5">
          <div className={`border-t pt-4 ${lead ? 'border-white/10' : 'border-line'}`}>
            <Slides
              label={program.name}
              tone={tone}
              slides={facts.map((fact) => ({
                id: fact.id,
                label: fact.label,
                content: (
                  <div className="flex min-h-16 items-center gap-4">
                    {fact.visual}
                    <div className="min-w-0">
                      <p className={`text-xs font-light ${quiet}`}>{fact.label}</p>
                      <p className="mt-1 text-lg leading-snug font-extrabold">{fact.value}</p>
                      {fact.note && <p className={`mt-1 text-xs font-light ${quiet}`}>{fact.note}</p>}
                    </div>
                  </div>
                ),
              }))}
            />
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            {onOpen && <DetailsButton program={program} onOpen={onOpen} tone={tone} />}
            <CompareButton programId={program.id} tone={tone} />
          </div>
        </div>
      </div>
    </article>
  )
}
