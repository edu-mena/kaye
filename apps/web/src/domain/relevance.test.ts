import { describe, expect, it } from 'vitest'
import {
  academySubject,
  areasSubject,
  careerSubject,
  companySubject,
  courseSubject,
  EMPTY_PROFILE,
  hasProfile,
  isRelevant,
  onlyRelevant,
  type InterestProfile,
} from './relevance'

const health: InterestProfile = {
  areas: ['health'],
  careers: new Set(['enfermeiro']),
  companies: new Set(['clinica-sagrada-esperanca']),
}

describe('isRelevant', () => {
  it('keeps what touches one of the areas', () => {
    expect(isRelevant(health, { areas: ['technology', 'health'] })).toBe(true)
  })

  it('hides what has no relation at all', () => {
    expect(isRelevant(health, { areas: ['technology'], careers: ['programador'] })).toBe(false)
    expect(isRelevant(health, { areas: ['business'], companies: ['unitel'] })).toBe(false)
  })

  it('keeps a career or a company the person saved, even in another area', () => {
    expect(isRelevant(health, { areas: ['technology'], careers: ['enfermeiro'] })).toBe(true)
    expect(isRelevant(health, { areas: ['business'], companies: ['clinica-sagrada-esperanca'] })).toBe(true)
  })

  it('keeps what says nothing about areas, careers or companies: it is for everyone', () => {
    expect(isRelevant(health, {})).toBe(true)
    expect(isRelevant(health, { areas: [], careers: [] })).toBe(true)
  })

  it('keeps everything while there is no profile', () => {
    expect(hasProfile(EMPTY_PROFILE)).toBe(false)
    expect(isRelevant(EMPTY_PROFILE, { areas: ['technology'] })).toBe(true)
    // Only a saved company or career, without any area, is not a profile yet.
    expect(isRelevant({ ...EMPTY_PROFILE, careers: new Set(['x']) }, { areas: ['legal'] })).toBe(true)
  })
})

describe('onlyRelevant', () => {
  const items = [
    { id: 'a', areas: ['health' as const] },
    { id: 'b', areas: ['technology' as const] },
    { id: 'c', areas: [] },
  ]

  it('keeps the order and says how many it left out', () => {
    const result = onlyRelevant(items, areasSubject, health)
    expect(result.items.map((item) => item.id)).toEqual(['a', 'c'])
    expect(result.hidden).toBe(1)
  })

  it('leaves nothing out without a profile', () => {
    expect(onlyRelevant(items, areasSubject, EMPTY_PROFILE)).toEqual({ items, hidden: 0 })
  })
})

describe('subjects', () => {
  it('read areas, careers and companies from each kind of item', () => {
    expect(careerSubject({ slug: 'enfermeiro', group: 'enfermagem' })).toEqual({
      areas: ['health'],
      careers: ['enfermeiro'],
    })
    expect(companySubject({ id: 'unitel', areas: ['dados'], careers: ['analista-de-dados'] })).toEqual({
      areas: ['technology'],
      careers: ['analista-de-dados'],
      companies: ['unitel'],
    })
    expect(
      academySubject({
        offers: [{ areas: ['medicina', 'enfermagem'], careers: ['medico'] }],
      } as never),
    ).toEqual({ areas: ['health', 'health'], careers: ['medico'] })
    expect(courseSubject({ areas: ['legal'], careers: ['advogado'] })).toEqual({
      areas: ['legal'],
      careers: ['advogado'],
    })
  })
})
