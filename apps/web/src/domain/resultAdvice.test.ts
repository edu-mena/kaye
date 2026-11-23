import { describe, expect, it } from 'vitest'
import { QUESTIONS } from '../data/demo/assessment'
import { getCareer } from '../data/source'
import type { Career, Likert, RiasecProfile } from '../data/types'
import { evidenceFor, nextStep, whyDimension } from './resultAdvice'

const statement = (dimension: string, at = 0) => {
  const found = QUESTIONS.filter(
    (question) => question.kind === 'statement' && question.dimension === dimension,
  )[at]
  if (found?.kind !== 'statement') throw new Error('no statement')
  return found
}
const situation = (at = 0) => {
  const found = QUESTIONS.filter((question) => question.kind === 'situation')[at]
  if (found?.kind !== 'situation') throw new Error('no situation')
  return found
}

describe('evidenceFor: what the person said that points to an interest', () => {
  it('puts the statements they like most first, then the cards they picked', () => {
    const answers: Record<string, Likert> = {
      [statement('S', 0).id]: 4,
      [statement('S', 1).id]: 5,
      [statement('S', 2).id]: 2,
    }
    const choices = { [situation(0).id]: 'S' as const }
    expect(evidenceFor('S', QUESTIONS, answers, choices, 3)).toEqual([
      { kind: 'liked', text: statement('S', 1).text },
      { kind: 'liked', text: statement('S', 0).text },
      { kind: 'picked', text: situation(0).options.find((o) => o.dimension === 'S')?.text },
    ])
  })

  it('keeps only what fits the limit, leaves out what they did not like and other interests', () => {
    const answers: Record<string, Likert> = { [statement('S', 0).id]: 3, [statement('I', 0).id]: 5 }
    const choices = { [situation(1).id]: 'I' as const }
    expect(evidenceFor('S', QUESTIONS, answers, choices)).toEqual([])
    expect(evidenceFor('I', QUESTIONS, answers, choices, 1)).toEqual([
      { kind: 'liked', text: statement('I', 0).text },
    ])
  })
})

describe('whyDimension', () => {
  const profile: RiasecProfile = { R: 0, I: 1, A: 0, S: 0.2, E: 0, C: 0.5 }
  it('names the interest strong in both the person and the career', () => {
    expect(whyDimension(profile, { riasec: { R: 0.1, I: 0.2, A: 0, S: 0.9, E: 0, C: 0.9 } })).toBe('C')
  })
})

const optional = (path: Career) => ({
  ...path,
  pathways: path.pathways.map((pathway) => ({
    ...pathway,
    steps: pathway.steps.map((step) => ({ ...step, need: 'opcional' as const })),
  })),
})

describe('nextStep', () => {
  it('is the first essential step of the easiest way in', async () => {
    const career = await getCareer('desenvolvedor-frontend')
    if (!career) throw new Error('career missing')
    const step = nextStep(career)
    expect(step).not.toBeNull()
    expect(step?.title).toBeTruthy()
  })

  it('falls back to the first step, and is null without a path', async () => {
    const career = await getCareer('desenvolvedor-frontend')
    if (!career) throw new Error('career missing')
    expect(career.pathways.flatMap((p) => p.steps.map((s) => s.title))).toContain(
      nextStep(optional(career))?.title,
    )
    expect(nextStep({ ...career, pathways: [] })).toBeNull()
  })
})
