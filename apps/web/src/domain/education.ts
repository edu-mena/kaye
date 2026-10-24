import type { Career, EducationLevel, MonthRange, Pathway, PathwayStep } from '../data/types'

const RANK: Record<EducationLevel, number> = {
  primario: 1,
  i_ciclo: 2,
  ii_ciclo: 3,
  medio_tecnico: 3,
  licenciatura: 4,
  mestrado: 5,
}

/** True if someone with `current` already has what `required` gives. */
export function satisfies(current: EducationLevel, required: EducationLevel): boolean {
  if (current === required || RANK[current] > RANK[required]) return true
  // The technical track also completes secondary school.
  return required === 'ii_ciclo' && current === 'medio_tecnico'
}

/** Only academic steps can be known as done; training and experience are always ahead. */
export function isStepDone(step: PathwayStep, education: EducationLevel | null): boolean {
  return Boolean(education && step.kind === 'academico' && step.level && satisfies(education, step.level))
}

export type Remaining = { steps: PathwayStep[]; months: MonthRange }

/** What is left on a path: steps not done yet, except optional ones, which nobody requires. */
export function remainingSteps(pathway: Pathway, education: EducationLevel | null): Remaining {
  const steps = pathway.steps.filter((step) => step.need !== 'opcional' && !isStepDone(step, education))
  const months = steps.reduce<MonthRange>(
    (total, step) => ({
      min: total.min + (step.months?.min ?? 0),
      max: total.max === null || !step.months ? total.max : total.max + (step.months.max ?? step.months.min),
    }),
    { min: 0, max: 0 },
  )
  return { steps, months }
}

/** The pathway that gets this person there soonest. */
export function quickestPathway(career: Career, education: EducationLevel | null) {
  const options = career.pathways.map((pathway) => ({ pathway, ...remainingSteps(pathway, education) }))
  return options.toSorted((a, b) => a.months.min - b.months.min)[0] ?? null
}

export function ageIn(birthYear: number, year = new Date().getFullYear()): number {
  return year - birthYear
}

/** 14–17: no public profile, no salary reports, guardian informed (docs/seguranca.md). */
export function isMinor(birthYear: number, year = new Date().getFullYear()): boolean {
  return ageIn(birthYear, year) < 18
}
