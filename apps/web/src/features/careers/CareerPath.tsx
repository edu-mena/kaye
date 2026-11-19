import { useTranslation } from 'react-i18next'
import { Icon, type IconName } from '../../components/icons'
import { Chip } from '../../components/ui/Chip'
import type { EducationLevel, Pathway, PathwayStep, PathwayStepKind } from '../../data/types'
import { isStepDone } from '../../domain/education'
import { useDuration } from '../../lib/useFormat'

const KIND_ICONS: Record<PathwayStepKind, IconName> = {
  academico: 'cap',
  formacao: 'target',
  certificacao: 'award',
  portfolio: 'eye',
  experiencia: 'briefcase',
}

type State = 'done' | 'current' | 'ahead'

const NODE: Record<State, string> = {
  done: 'bg-success text-white',
  current: 'bg-gold text-night animate-pulse-ring',
  ahead: 'border-2 border-night bg-surface text-night',
}

/** Optional steps look lighter: a dashed outline, so the essential path stands out. */
const OPTIONAL_NODE = 'border-2 border-dashed border-ash-300 bg-surface text-muted'

function StepNotes({ step }: { step: PathwayStep }) {
  const { t } = useTranslation()
  const notes: { icon: IconName; text: string }[] = []
  if (step.selfTaught) notes.push({ icon: 'compass', text: t('career.selfTaught') })
  if (step.certificate) notes.push({ icon: 'award', text: t(`career.certificate_${step.certificate}`) })
  if (step.kind === 'portfolio') notes.push({ icon: 'eye', text: t('career.portfolioHint') })
  if (notes.length === 0) return null
  return (
    <ul className="mt-2 space-y-1">
      {notes.map((note) => (
        <li key={note.icon} className="flex items-start gap-1.5 text-xs font-light text-copy">
          <Icon name={note.icon} className="mt-px size-3.5 shrink-0 text-night" />
          {note.text}
        </li>
      ))}
    </ul>
  )
}

// Node centres alternate between two columns, so the line winds like the logo.
const X = [18, 38] as const

type CareerPathProps = { pathway: Pathway; education: EducationLevel | null }

/** "Como lá chegar": the winding path from the Kayé logo, one node per step. */
export function CareerPath({ pathway, education }: CareerPathProps) {
  const { t } = useTranslation()
  const duration = useDuration()
  const done = pathway.steps.map((step) => isStepDone(step, education))
  // "Estás aqui" is the first step still to do that someone actually needs.
  const currentIndex = education
    ? pathway.steps.findIndex((step, index) => !done[index] && step.need !== 'opcional')
    : -1
  const state = (index: number): State => {
    if (done[index]) return 'done'
    return index === currentIndex ? 'current' : 'ahead'
  }

  return (
    <ol className="mt-2">
      {pathway.steps.map((step, index) => {
        const here = state(index)
        const from = X[index % 2] ?? 18
        const to = X[(index + 1) % 2] ?? 38
        const isLast = index === pathway.steps.length - 1

        return (
          <li
            key={`${step.kind}-${step.title}`}
            className="relative grid grid-cols-[3.5rem_minmax(0,1fr)] gap-3 pb-7"
          >
            <div className="relative">
              {!isLast && (
                <svg
                  aria-hidden="true"
                  viewBox="0 0 56 100"
                  preserveAspectRatio="none"
                  className="absolute top-5 left-0 h-full w-14 overflow-visible"
                >
                  <path
                    d={`M${from} 0 C${from} 50, ${to} 50, ${to} 100`}
                    fill="none"
                    vectorEffect="non-scaling-stroke"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeDasharray={done[index] ? undefined : '1 8'}
                    className={done[index] ? 'stroke-success' : 'stroke-night/40'}
                  />
                </svg>
              )}
              <span
                aria-hidden="true"
                className={`absolute top-0 grid size-10 place-items-center rounded-full ${here === 'ahead' && step.need === 'opcional' ? OPTIONAL_NODE : NODE[here]}`}
                style={{ left: from - 20 }}
              >
                <Icon name={here === 'done' ? 'check' : KIND_ICONS[step.kind]} className="size-5" />
              </span>
            </div>
            <div>
              <p className="flex flex-wrap items-center gap-2 text-xs font-semibold text-muted">
                {t(`career.step${step.kind}`)}
                <span
                  className={here === 'done' ? 'text-success' : here === 'current' ? 'text-gold-ink' : ''}
                >
                  ·{' '}
                  {t(
                    here === 'done'
                      ? 'career.stepDone'
                      : here === 'current'
                        ? 'career.stepCurrent'
                        : 'career.stepAhead',
                  )}
                </span>
              </p>
              <p className="mt-0.5 flex flex-wrap items-center gap-2 text-sm leading-snug font-normal text-night">
                {step.title}
                <Chip tone={step.need === 'essencial' ? 'night' : 'neutral'}>
                  {t(`career.need_${step.need}`)}
                </Chip>
              </p>
              <p className="mt-1 text-sm font-light text-copy">{step.description}</p>
              <StepNotes step={step} />
              {step.months && (
                <p className="mt-1.5 inline-flex items-center gap-1 text-xs font-light text-night">
                  <Icon name="clock" className="size-3.5" />
                  {duration(step.months)}
                </p>
              )}
            </div>
          </li>
        )
      })}
    </ol>
  )
}
