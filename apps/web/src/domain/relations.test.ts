import { describe, expect, it } from 'vitest'
import type { Academy, CareerSummary, Company, Program } from '../data/types'
import { academiesForCareers, careersOfArea, companiesForCareers, programsOfCareers } from './relations'

const company = (id: string, name: string, careers: string[]) => ({ id, name, careers }) as Company
const academy = (id: string, name: string, offers: string[][]) =>
  ({ id, name, offers: offers.map((careers) => ({ careers })) }) as unknown as Academy

describe('companiesForCareers', () => {
  const companies = [
    company('b', 'Banco B', ['x']),
    company('a', 'Banco A', ['x', 'y']),
    company('c', 'Casa C', ['z']),
    company('d', 'Dado D', ['x', 'x']),
  ]

  it('lists who hires for any of the careers, with the careers that match', () => {
    const found = companiesForCareers(companies, ['x', 'y'])
    expect(found.map((entry) => entry.item.id)).toEqual(['a', 'b', 'd'])
    expect(found[0]?.matches).toEqual(['x', 'y'])
  })

  it('puts the one with more matching careers first, then by name', () => {
    expect(companiesForCareers(companies, ['x', 'y']).map((entry) => entry.item.name)).toEqual([
      'Banco A',
      'Banco B',
      'Dado D',
    ])
  })

  it('counts a repeated career once', () => {
    expect(companiesForCareers(companies, ['x']).find((entry) => entry.item.id === 'd')?.matches).toEqual([
      'x',
    ])
  })

  it('is empty when no career matches, or none is asked', () => {
    expect(companiesForCareers(companies, ['nada'])).toEqual([])
    expect(companiesForCareers(companies, [])).toEqual([])
  })
})

describe('academiesForCareers', () => {
  it('looks into the careers of every course an academy offers', () => {
    const academies = [
      academy('1', 'Zeta', [['x'], ['y']]),
      academy('2', 'Alfa', [['x']]),
      academy('3', 'Beta', [['z']]),
    ]
    const found = academiesForCareers(academies, ['x', 'y'])
    expect(found.map((entry) => entry.item.id)).toEqual(['1', '2'])
    expect(found[0]?.matches).toEqual(['x', 'y'])
  })
})

describe('programsOfCareers and careersOfArea', () => {
  it('keeps the programs that lead to a career', () => {
    const programs = [
      { id: 'p1', careers: ['x'] },
      { id: 'p2', careers: ['z'] },
    ] as Program[]
    expect(programsOfCareers(programs, ['x']).map((program) => program.id)).toEqual(['p1'])
    expect(programsOfCareers(programs, [])).toEqual([])
  })

  it('keeps the careers whose group belongs to the area', () => {
    const careers = [
      { slug: 'dev', group: 'desenvolvimento' },
      { slug: 'dados', group: 'dados' },
      { slug: 'adv', group: 'advocacia' },
    ] as CareerSummary[]
    expect(careersOfArea(careers, 'technology').map((career) => career.slug)).toEqual(['dev', 'dados'])
    expect(careersOfArea(careers, 'legal').map((career) => career.slug)).toEqual(['adv'])
    expect(careersOfArea(careers, 'health')).toEqual([])
  })
})
