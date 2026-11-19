import type { CareerGroup, CareerSummary, Demand, RiasecProfile } from '../types'
import { CAREER_IMAGES } from './images'

// The builders of the career catalogue, shared by every area's file.

export function riasec(R: number, I: number, A: number, S: number, E: number, C: number): RiasecProfile {
  return { R, I, A, S, E, C }
}

/** A salary from the State's tables: the base salary of the category a person with the course's training enters. */
type EntrySalary = { entry: number }

export const entry = (value: number): EntrySalary => ({ entry: value })

export function summary(
  slug: string,
  name: string,
  group: CareerGroup,
  text: string,
  profile: RiasecProfile,
  demand: Demand,
  salary: number | EntrySalary | null,
): CareerSummary {
  const image = CAREER_IMAGES[slug]
  const onEntry = typeof salary === 'object' && salary !== null
  return {
    slug,
    name,
    group,
    summary: text,
    riasec: profile,
    demand,
    salaryMedian: onEntry ? salary.entry : salary,
    ...(onEntry ? { salaryKind: 'entrada' as const } : {}),
    detailed: false,
    ...(image ? { image } : {}),
  }
}
