import { describe, expect, it } from 'vitest'
import { CAREERS } from '../data/demo/careers'
import { ageIn, isMinor, isStepDone, quickestPathway, remainingSteps, satisfies } from './education'

const frontend = CAREERS[0]!
const [university, technical] = frontend.pathways

describe('satisfies', () => {
  it('counts the technical track as finished secondary school', () => {
    expect(satisfies('medio_tecnico', 'ii_ciclo')).toBe(true)
    expect(satisfies('ii_ciclo', 'medio_tecnico')).toBe(false)
  })

  it('counts any higher level, and the same level', () => {
    expect(satisfies('licenciatura', 'medio_tecnico')).toBe(true)
    expect(satisfies('i_ciclo', 'i_ciclo')).toBe(true)
    expect(satisfies('i_ciclo', 'licenciatura')).toBe(false)
  })
})

describe('pathway steps', () => {
  it('only academic steps can be known as done', () => {
    const portfolio = university!.steps.find((step) => step.kind === 'portfolio')!
    expect(isStepDone(university!.steps[0]!, 'medio_tecnico')).toBe(true)
    expect(isStepDone(portfolio, 'mestrado')).toBe(false)
    expect(isStepDone(university!.steps[0]!, null)).toBe(false)
  })

  it('adds up the months still ahead', () => {
    const left = remainingSteps(technical!, 'medio_tecnico')
    expect(left.steps.map((step) => step.kind)).toEqual(['formacao', 'portfolio', 'experiencia'])
    expect(left.months).toEqual({ min: 13, max: 24 })
  })

  it('picks the pathway that gets the person there soonest', () => {
    expect(quickestPathway(frontend, 'medio_tecnico')?.pathway.id).toBe('tecnica')
    expect(quickestPathway({ ...frontend, pathways: [] }, 'ii_ciclo')).toBeNull()
  })
})

describe('age', () => {
  it('uses only the birth year', () => {
    expect(ageIn(2008, 2026)).toBe(18)
    expect(isMinor(2009, 2026)).toBe(true)
    expect(isMinor(2008, 2026)).toBe(false)
  })
})
