import {
  RIASEC_KEYS,
  type AssessmentQuestion,
  type Likert,
  type RiasecKey,
  type RiasecProfile,
} from '../data/types'

/** What the situation questions weigh in the profile; the statements weigh the rest (ADR 0017). */
export const SITUATION_WEIGHT = 0.3
/** Picking the same interest in this share of the situations, or more, already counts as the maximum. */
const SITUATION_FULL = 0.5

/** Whether a question has an answer: a 1–5 value for a statement, a card for a situation. */
export function isAnswered(
  question: AssessmentQuestion,
  answers: Record<string, Likert>,
  choices: Record<string, RiasecKey>,
): boolean {
  return question.kind === 'statement'
    ? answers[question.id] !== undefined
    : choices[question.id] !== undefined
}

/**
 * Each interest from 0 to 1. The statements give its average (1–5 turned into 0–1); each situation gives a vote
 * to the interest of the card picked, and the share of votes counts 30% of the score (`SITUATION_WEIGHT`). Null until every
 * question is answered.
 */
export function scoreAnswers(
  questions: AssessmentQuestion[],
  answers: Record<string, Likert>,
  choices: Record<string, RiasecKey> = {},
): RiasecProfile | null {
  if (questions.length === 0 || questions.some((question) => !isAnswered(question, answers, choices)))
    return null

  const statements = Object.fromEntries(RIASEC_KEYS.map((key) => [key, { sum: 0, count: 0 }])) as Record<
    RiasecKey,
    { sum: number; count: number }
  >
  const votes = Object.fromEntries(RIASEC_KEYS.map((key) => [key, 0])) as Record<RiasecKey, number>
  let situations = 0
  for (const question of questions) {
    if (question.kind === 'statement') {
      const total = statements[question.dimension]
      total.sum += ((answers[question.id] ?? 1) - 1) / 4
      total.count += 1
    } else {
      const picked = choices[question.id]
      if (picked) votes[picked] += 1
      situations += 1
    }
  }

  return Object.fromEntries(
    RIASEC_KEYS.map((key) => {
      const fromStatements = statements[key].count ? statements[key].sum / statements[key].count : 0
      if (situations === 0) return [key, fromStatements]
      const fromSituations = Math.min(1, votes[key] / situations / SITUATION_FULL)
      return [key, (1 - SITUATION_WEIGHT) * fromStatements + SITUATION_WEIGHT * fromSituations]
    }),
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
