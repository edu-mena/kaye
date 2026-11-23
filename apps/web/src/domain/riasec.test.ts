import { describe, expect, it } from 'vitest'
import { QUESTIONS } from '../data/demo/assessment'
import type { RiasecProfile } from '../data/types'
import { answersFor, choicesFor } from '../test/user'
import {
  compatibility,
  isAnswered,
  rankDimensions,
  riasecCode,
  scoreAnswers,
  SITUATION_WEIGHT,
  sharedStrength,
} from './riasec'

const profile = (R: number, I: number, A: number, S: number, E: number, C: number): RiasecProfile => ({
  R,
  I,
  A,
  S,
  E,
  C,
})

describe('scoreAnswers', () => {
  const values = { R: 1, I: 5, A: 3, S: 2, E: 4, C: 5 } as const
  const fromStatements = { R: 0, I: 1, A: 0.5, S: 0.25, E: 0.75, C: 1 }

  it('turns 1–5 statements into 0–1 and gives each situation card to its interest', () => {
    // Every card picked is an I: 12 votes of 12 is above the half that already counts as the maximum.
    const scores = scoreAnswers(QUESTIONS, answersFor(values), choicesFor('I'))
    for (const key of ['R', 'I', 'A', 'S', 'E', 'C'] as const) {
      const votes = key === 'I' ? 1 : 0
      expect(scores?.[key]).toBeCloseTo(
        (1 - SITUATION_WEIGHT) * fromStatements[key] + SITUATION_WEIGHT * votes,
      )
    }
  })

  it('lets the situations move the result when the statements are all the same', () => {
    const flat = answersFor({ R: 3, I: 3, A: 3, S: 3, E: 3, C: 3 })
    const scores = scoreAnswers(QUESTIONS, flat, choicesFor('S'))
    expect(scores).not.toBeNull()
    expect(riasecCode(scores ?? { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 })[0]).toBe('S')
    expect(scores?.S).toBeCloseTo(0.5 * (1 - SITUATION_WEIGHT) + SITUATION_WEIGHT)
    expect(scores?.R).toBeCloseTo(0.5 * (1 - SITUATION_WEIGHT))
  })

  it('shares the votes between interests: half of the situations to one already counts as all', () => {
    const picks = choicesFor('I')
    const ids = Object.keys(picks)
    ids.slice(0, 6).forEach((id) => (picks[id] = 'A'))
    const flat = answersFor({ R: 3, I: 3, A: 3, S: 3, E: 3, C: 3 })
    const scores = scoreAnswers(QUESTIONS, flat, picks)
    expect(scores?.A).toBeCloseTo(scores?.I ?? -1)
  })

  it('waits until every question is answered, statements and situations alike', () => {
    const answers = answersFor()
    const choices = choicesFor()
    expect(scoreAnswers(QUESTIONS, answers, choices)).not.toBeNull()
    expect(scoreAnswers(QUESTIONS, answers)).toBeNull()
    delete answers.R1
    expect(scoreAnswers(QUESTIONS, answers, choices)).toBeNull()
    expect(scoreAnswers([], {})).toBeNull()
  })

  it('knows which question has an answer', () => {
    const [statement, situation] = [
      QUESTIONS.find((q) => q.kind === 'statement'),
      QUESTIONS.find((q) => q.kind === 'situation'),
    ]
    if (!statement || !situation) throw new Error('questions missing')
    expect(isAnswered(statement, { [statement.id]: 3 }, {})).toBe(true)
    expect(isAnswered(statement, {}, { [situation.id]: 'R' })).toBe(false)
    expect(isAnswered(situation, {}, { [situation.id]: 'R' })).toBe(true)
    expect(isAnswered(situation, { [statement.id]: 3 }, {})).toBe(false)
  })
})

describe('the Holland code', () => {
  it('is the three strongest dimensions', () => {
    expect(riasecCode(profile(0.2, 0.9, 0.7, 0.1, 0.3, 0.6))).toBe('IAC')
  })

  it('breaks ties in R-I-A-S-E-C order', () => {
    expect(rankDimensions(profile(0.5, 0.5, 0.5, 0.5, 0.5, 0.5))).toEqual(['R', 'I', 'A', 'S', 'E', 'C'])
  })
})

describe('compatibility', () => {
  const person = profile(0.2, 0.9, 0.7, 0.1, 0.3, 0.6)

  it('is 1 for the same shape, whatever the level', () => {
    expect(compatibility(person, person)).toBeCloseTo(1)
    expect(compatibility(person, profile(0.1, 0.45, 0.35, 0.05, 0.15, 0.3))).toBeCloseTo(1)
  })

  it('is low for the opposite shape', () => {
    expect(compatibility(person, profile(0.9, 0.1, 0.2, 0.8, 0.7, 0.3))).toBeLessThan(0.25)
  })

  it('is neutral when a profile has no shape at all', () => {
    expect(compatibility(person, profile(0.5, 0.5, 0.5, 0.5, 0.5, 0.5))).toBe(0.5)
  })

  it('names the interest both share most', () => {
    expect(sharedStrength(person, profile(0.1, 0.8, 0.2, 0.1, 0.2, 0.9))).toBe('I')
  })
})
