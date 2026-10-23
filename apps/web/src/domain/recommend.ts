import type { CareerSummary, Demand, RiasecKey, RiasecProfile } from '../data/types'
import { compatibility, sharedStrength } from './riasec'

// docs/arquitetura.md, 5.4. Weights are configuration, not code elsewhere.
const WEIGHTS = { fit: 0.6, market: 0.25, feasibility: 0.15 }
/** Below this, a career is only suggested if there are not enough better ones. */
const MIN_FIT = 0.55

const DEMAND: Record<Demand, number> = { alta: 1, media: 0.6, baixa: 0.3 }

export type Reason = { kind: 'interest'; dimension: RiasecKey } | { kind: 'demand' } | { kind: 'salary' }

export type Recommendation = {
  career: CareerSummary
  score: number
  compatibility: number
  reasons: Reason[]
}

export function recommend(profile: RiasecProfile, careers: CareerSummary[], limit = 5): Recommendation[] {
  const salaries = careers.map((career) => career.salaryMedian ?? 0)
  const top = Math.max(...salaries, 1)

  const scored = careers.map((career) => {
    const fit = compatibility(profile, career.riasec)
    const salary = (career.salaryMedian ?? 0) / top
    const market = 0.6 * DEMAND[career.demand] + 0.4 * salary
    // Feasibility needs each person's education and every career's pathways (API, Fase 1).
    const feasibility = 0.5
    const reasons: Reason[] = [{ kind: 'interest', dimension: sharedStrength(profile, career.riasec) }]
    if (career.demand === 'alta') reasons.push({ kind: 'demand' })
    if (salary >= 0.6) reasons.push({ kind: 'salary' })

    return {
      career,
      compatibility: fit,
      score: WEIGHTS.fit * fit + WEIGHTS.market * market + WEIGHTS.feasibility * feasibility,
      reasons,
    }
  })

  // Fit comes first: the market never pushes a career that does not match.
  const matching = scored
    .filter((item) => item.compatibility >= MIN_FIT)
    .toSorted((a, b) => b.score - a.score)
  const rest = scored
    .filter((item) => item.compatibility < MIN_FIT)
    .toSorted((a, b) => b.compatibility - a.compatibility)

  return [...matching, ...rest].slice(0, limit)
}
