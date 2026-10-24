import type { Program } from '../data/types'

// docs/arquitetura.md, 5.7. Published on the page itself, next to the ranking.
export const CRITERIA = [
  { key: 'rating', weight: 0.4 },
  { key: 'cost', weight: 0.25 },
  { key: 'market', weight: 0.2 },
  { key: 'schedule', weight: 0.15 },
] as const

type CriterionKey = (typeof CRITERIA)[number]['key']
/** A rating only counts with at least this many reviews. */
export const MIN_REVIEWS = 5

/** Who recognises a course in Angola depends on its level: higher education, schools, or vocational training. */
const RECOGNITION = {
  licenciatura: { code: 'MESCTI', name: 'Ministério do Ensino Superior, Ciência, Tecnologia e Inovação' },
  medio_tecnico: { code: 'MED', name: 'Ministério da Educação' },
  formacao_profissional: { code: 'INEFOP', name: 'Instituto Nacional de Emprego e Formação Profissional' },
  certificacao: { code: 'INEFOP', name: 'Instituto Nacional de Emprego e Formação Profissional' },
} as const satisfies Record<Program['level'], { code: string; name: string }>

export function recognitionBody(level: Program['level']) {
  return RECOGNITION[level]
}

export type ScoredProgram = {
  program: Program
  /** 0 to 100. */
  score: number
  /** Value 0–1, or null when there is no data; weights already renormalised. */
  criteria: { key: CriterionKey; weight: number; value: number | null }[]
}

function criterionValue(
  key: CriterionKey,
  program: Program,
  cost: { min: number; max: number },
): number | null {
  switch (key) {
    case 'rating':
      return program.rating && program.rating.count >= MIN_REVIEWS ? program.rating.average / 5 : null
    case 'cost':
      if (program.totalCost === null) return null
      return cost.max === cost.min ? 1 : 1 - (program.totalCost - cost.min) / (cost.max - cost.min)
    case 'market':
      // Who did the course and works in the area: needs real users (Fase 2).
      return null
    case 'schedule':
      return program.schedule.some((slot) => slot === 'pos_laboral' || slot === 'online') ? 1 : 0.5
  }
}

export function scorePrograms(programs: Program[]): ScoredProgram[] {
  const costs = programs.flatMap((program) => (program.totalCost === null ? [] : [program.totalCost]))
  const range = { min: Math.min(...costs), max: Math.max(...costs) }

  return programs.map((program) => {
    const values = CRITERIA.map(({ key, weight }) => ({
      key,
      weight,
      value: criterionValue(key, program, range),
    }))
    const available = values.filter((criterion) => criterion.value !== null)
    const totalWeight = available.reduce((sum, criterion) => sum + criterion.weight, 0)
    const criteria = values.map(({ key, weight, value }) => ({
      key,
      value,
      weight: value === null || totalWeight === 0 ? 0 : weight / totalWeight,
    }))
    const score = criteria.reduce((sum, criterion) => sum + criterion.weight * (criterion.value ?? 0), 0)

    return { program, score: Math.round(score * 100), criteria }
  })
}

export type SortKey = 'score' | 'price' | 'rating'

const SORTERS: Record<SortKey, (a: ScoredProgram, b: ScoredProgram) => number> = {
  score: (a, b) => b.score - a.score,
  price: (a, b) => (a.program.totalCost ?? Infinity) - (b.program.totalCost ?? Infinity),
  rating: (a, b) => (b.program.rating?.average ?? 0) - (a.program.rating?.average ?? 0),
}

/**
 * Only officially recognised courses are ranked; the others are listed apart.
 * Takes programs already scored against the whole catalogue, so a course has
 * the same score on every screen, whatever the filter.
 */
export function rankPrograms(scored: ScoredProgram[], sort: SortKey) {
  const sorted = scored.toSorted(SORTERS[sort])
  return {
    ranked: sorted.filter((item) => item.program.recognized),
    unrecognized: sorted.filter((item) => !item.program.recognized),
  }
}
