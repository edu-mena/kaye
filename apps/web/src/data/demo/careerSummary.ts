import type { CareerGroup, CareerSummary, Demand, RiasecProfile } from '../types'
import { CAREER_IMAGES } from './images'

// The builders of the career catalogue, shared by every area's file.

export function riasec(R: number, I: number, A: number, S: number, E: number, C: number): RiasecProfile {
  return { R, I, A, S, E, C }
}

export function summary(
  slug: string,
  name: string,
  group: CareerGroup,
  text: string,
  profile: RiasecProfile,
  demand: Demand,
  salaryMedian: number | null,
): CareerSummary {
  const image = CAREER_IMAGES[slug]
  return {
    slug,
    name,
    group,
    summary: text,
    riasec: profile,
    demand,
    salaryMedian,
    detailed: false,
    ...(image ? { image } : {}),
  }
}
