import { describe, expect, it } from 'vitest'
import { journey, nextStep, type JourneyInput } from './journey'

const NOTHING: JourneyInput = {
  testDone: false,
  strengthsDone: false,
  targetCareer: null,
  hasCv: false,
  hasPlan: false,
}
const DECIDED = { ...NOTHING, testDone: true, strengthsDone: true, targetCareer: 'enfermeiro' }

const current = (input: JourneyInput) => journey(input).find((step) => step.current)?.phase

describe('journey', () => {
  it('starts at discover and moves on one phase at a time', () => {
    expect(current(NOTHING)).toBe('discover')
    expect(current({ ...NOTHING, testDone: true })).toBe('discover')
    expect(current({ ...NOTHING, testDone: true, strengthsDone: true })).toBe('decide')
    expect(current(DECIDED)).toBe('prepare')
  })

  it('needs both a CV and a plan to finish the last phase', () => {
    expect(current({ ...DECIDED, hasCv: true })).toBe('prepare')
    expect(current({ ...DECIDED, hasPlan: true })).toBe('prepare')
    expect(current({ ...DECIDED, hasCv: true, hasPlan: true })).toBeUndefined()
  })
})

describe('nextStep', () => {
  it('follows the journey: test, strengths, a target, CV, then the path to the target', () => {
    expect(nextStep(NOTHING)).toEqual({ kind: 'test' })
    expect(nextStep({ ...NOTHING, testDone: true })).toEqual({ kind: 'strengths' })
    expect(nextStep({ ...NOTHING, testDone: true, strengthsDone: true })).toEqual({ kind: 'explore' })
    expect(nextStep(DECIDED)).toEqual({ kind: 'cv' })
    expect(nextStep({ ...DECIDED, hasCv: true })).toEqual({ kind: 'plan', career: 'enfermeiro' })
    expect(nextStep({ ...DECIDED, hasCv: true, hasPlan: true })).toEqual({
      kind: 'plan',
      career: 'enfermeiro',
    })
  })
})
