import {
  RIASEC_KEYS,
  type AssessmentQuestion,
  type Likert,
  type RiasecKey,
  type RiasecProfile,
} from '../data/types'

/** Average of each dimension, from 1–5 answers to 0–1. Null until every question is answered. */
export function scoreAnswers(
  questions: AssessmentQuestion[],
  answers: Record<string, Likert>,
): RiasecProfile | null {
  if (questions.length === 0 || questions.some((question) => answers[question.id] === undefined)) return null

  const totals = Object.fromEntries(RIASEC_KEYS.map((key) => [key, { sum: 0, count: 0 }])) as Record<
    RiasecKey,
    { sum: number; count: number }
  >
  for (const question of questions) {
    const total = totals[question.dimension]
    total.sum += ((answers[question.id] ?? 1) - 1) / 4
    total.count += 1
  }

  return Object.fromEntries(
    RIASEC_KEYS.map((key) => [key, totals[key].count ? totals[key].sum / totals[key].count : 0]),
  ) as RiasecProfile
}

/** Dimensions from strongest to weakest; ties keep the R-I-A-S-E-C order. */
export function rankDimensions(profile: RiasecProfile): RiasecKey[] {
  return RIASEC_KEYS.toSorted((a, b) => profile[b] - profile[a])
}

/** Holland code: the three strongest dimensions, e.g. "IAC". */
export function riasecCode(profile: RiasecProfile): string {
  return rankDimensions(profile).slice(0, 3).join('')
}

/** Each dimension minus the profile's mean. */
function centre(profile: RiasecProfile): number[] {
  const mean = RIASEC_KEYS.reduce((sum, key) => sum + profile[key], 0) / RIASEC_KEYS.length
  return RIASEC_KEYS.map((key) => profile[key] - mean)
}

/**
 * How similar two profiles are, from 0 to 1: cosine of the centred vectors,
 * so what counts is the shape (which interests stand out), not the level.
 */
export function compatibility(a: RiasecProfile, b: RiasecProfile): number {
  const x = centre(a)
  const y = centre(b)
  const dot = x.reduce((sum, value, index) => sum + value * (y[index] ?? 0), 0)
  const norm = Math.hypot(...x) * Math.hypot(...y)

  return norm === 0 ? 0.5 : (dot / norm + 1) / 2
}

/** The dimension that most explains a match: strong in both profiles. */
export function sharedStrength(a: RiasecProfile, b: RiasecProfile): RiasecKey {
  return RIASEC_KEYS.toSorted((x, y) => a[y] * b[y] - a[x] * b[x])[0] ?? 'R'
}
