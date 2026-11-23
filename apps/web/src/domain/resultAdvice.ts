import type { AssessmentQuestion, Career, Likert, PathwayStep, RiasecKey, RiasecProfile } from '../data/types'
import { careerTraits } from './recommend'
import { sharedStrength } from './riasec'

export type Evidence = { kind: 'liked' | 'picked'; text: string }

/** Statements rated this high or higher count as "disseste que gostas". */
const LIKED_FROM = 4

/**
 * What the person said in the test that points to one interest, in their own words: the statements they like
 * most first, then the cards they picked. This is the "why" of the result (ADR 0017).
 */
export function evidenceFor(
  dimension: RiasecKey,
  questions: AssessmentQuestion[],
  answers: Record<string, Likert>,
  choices: Record<string, RiasecKey>,
  limit = 2,
): Evidence[] {
  const liked = questions
    .flatMap((question) => {
      const value = answers[question.id]
      return question.kind === 'statement' && question.dimension === dimension && value && value >= LIKED_FROM
        ? [{ text: question.text, value }]
        : []
    })
    .toSorted((a, b) => b.value - a.value)
    .map((item): Evidence => ({ kind: 'liked', text: item.text }))
  const picked = questions.flatMap((question): Evidence[] => {
    if (question.kind !== 'situation' || choices[question.id] !== dimension) return []
    const card = question.options.find((option) => option.dimension === dimension)
    return card ? [{ kind: 'picked', text: card.text }] : []
  })
  return [...liked, ...picked].slice(0, limit)
}

/** The interest of the person that most explains a career: strong in both. */
export function whyDimension(profile: RiasecProfile, career: { riasec: RiasecProfile }): RiasecKey {
  return sharedStrength(profile, career.riasec)
}

/**
 * The step to take now on the easiest way in (the shortest path by schooling, as the recommendation weighs it):
 * its first essential step, or its first. Null when the career has no path yet.
 */
export function nextStep(career: Career): PathwayStep | null {
  const easiest = careerTraits(career, []).entry?.pathway
  const pathway = career.pathways.find((item) => item.name === easiest) ?? career.pathways[0]
  return pathway?.steps.find((step) => step.need === 'essencial') ?? pathway?.steps[0] ?? null
}
