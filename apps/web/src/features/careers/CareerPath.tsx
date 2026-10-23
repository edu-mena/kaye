import { useTranslation } from 'react-i18next'
import { Icon, type IconName } from '../../components/icons'
import type { EducationLevel, Pathway, PathwayStepKind } from '../../data/types'
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
  current: 'bg-gold text-navy animate-pulse-ring',
  ahead: 'border-2 border-navy bg-surface text-navy',
}

// Node centres alternate between two columns, so the line winds like the logo.
const X = [18, 38] as const

type CareerPathProps = { pathway: Pathway; education: EducationLevel | null }

/** "Como lá chegar": the winding path from the Kayé logo, one node per step. */
export function CareerPath({ pathway, education }: CareerPathProps) {
  const { t } = useTranslation()
  const duration = useDuration()
  const done = pathway.steps.map((step) => isStepDone(step, education))
  const currentIndex = education ? done.indexOf(false) : -1
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
                    className={done[index] ? 'stroke-success' : 'stroke-navy/40'}
                  />
                </svg>
              )}
              <span
                aria-hidden="true"
                className={`absolute top-0 grid size-10 place-items-center rounded-full ${NODE[here]}`}
                style={{ left: from - 20 }}
              >
                <Icon name={here === 'done' ? 'check' : KIND_ICONS[step.kind]} className="size-5" />
              </span>
            </div>
            <div>
              <p className="flex flex-wrap items-center gap-2 text-xs font-semibold tracking-wide text-muted uppercase">
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
              <p className="mt-0.5 font-display text-lg leading-snug font-semibold text-navy">{step.title}</p>
              <p className="mt-1 text-sm text-muted">{step.description}</p>
              {step.months && (
                <p className="mt-1.5 inline-flex items-center gap-1 text-xs font-semibold text-navy">
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
