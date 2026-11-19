import { describe, expect, it } from 'vitest'
import { QUESTIONS } from '../data/demo/assessment'
import type { RiasecProfile } from '../data/types'
import { answersFor } from '../test/user'
import { compatibility, rankDimensions, riasecCode, scoreAnswers, sharedStrength } from './riasec'

const profile = (R: number, I: number, A: number, S: number, E: number, C: number): RiasecProfile => ({
  R,
  I,
  A,
  S,
  E,
  C,
})

describe('scoreAnswers', () => {
  it('turns 1–5 answers into 0–1 per dimension', () => {
    const scores = scoreAnswers(QUESTIONS, answersFor({ R: 1, I: 5, A: 3, S: 2, E: 4, C: 5 }))
    expect(scores).toEqual({ R: 0, I: 1, A: 0.5, S: 0.25, E: 0.75, C: 1 })
  })

  it('waits until every question is answered', () => {
    const answers = answersFor()
    delete answers.R1
    expect(scoreAnswers(QUESTIONS, answers)).toBeNull()
    expect(scoreAnswers([], {})).toBeNull()
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
