import { describe, expect, it } from 'vitest'
import type { Institution, Program } from '../data/types'
import { COST_BANDS, DURATION_BANDS, findBand, inBand } from './bands'
import { matchesProgram } from './programs'

const institution = (change: Partial<Institution>): Institution => ({
  id: 'uprivada',
  name: 'Universidade Exemplo',
  type: 'universidade',
  ownership: 'privada',
  province: 'Luanda',
  ...change,
})

const base: Program = {
  id: 'base',
  institution: institution({}),
  course: { id: 'engenharia-informatica', name: 'Engenharia Informática' },
  name: 'Licenciatura em Engenharia Informática',
  level: 'licenciatura',
  durationMonths: 60,
  schedule: ['diurno'],
  totalCost: 1800000,
  recognized: true,
  rating: null,
  careers: ['desenvolvedor-frontend'],
}
const course = (change: Partial<Program>): Program => ({ ...base, ...change })

const CATALOGUE: Program[] = [
  course({ id: 'uni-publica-frontend', institution: institution({ ownership: 'publica' }) }),
  course({ id: 'uni-privada-frontend', totalCost: 6300000 }),
  course({
    id: 'ccomp-publica-dados',
    institution: institution({ ownership: 'publica' }),
    careers: ['analista-de-dados'],
    totalCost: 1500000,
  }),
  course({
    id: 'tecnico-publica-dados',
    institution: institution({ ownership: 'publica' }),
    level: 'medio_tecnico',
    durationMonths: 48,
    careers: ['analista-de-dados'],
    totalCost: 350000,
  }),
  course({
    id: 'bootcamp-online',
    level: 'formacao_profissional',
    durationMonths: 3,
    schedule: ['online'],
    totalCost: 150000,
  }),
  course({
    id: 'figma-benguela',
    institution: institution({ province: 'Benguela' }),
    level: 'formacao_profissional',
    durationMonths: 3,
    careers: ['designer-ui-ux'],
    totalCost: 120000,
  }),
]

const ids = (filter: Parameters<typeof matchesProgram>[1]) =>
  CATALOGUE.filter((program) => matchesProgram(program, filter)).map((program) => program.id)

describe('bands', () => {
  it('include the upper limit and leave out the lower one', () => {
    const upTo200 = findBand(COST_BANDS, 'ate200')
    expect(inBand(200_000, upTo200)).toBe(true)
    expect(inBand(200_001, upTo200)).toBe(false)
    expect(inBand(200_000, findBand(COST_BANDS, 'de200a1000'))).toBe(false)
  })

  it('let everything through without a band, and never match an unknown value', () => {
    expect(inBand(null, undefined)).toBe(true)
    expect(inBand(null, findBand(COST_BANDS, 'ate200'))).toBe(false)
    expect(findBand(COST_BANDS, 'nao-existe')).toBeUndefined()
  })
})

describe('matchesProgram', () => {
  it('lets every course through with no filter', () => {
    expect(ids({})).toHaveLength(CATALOGUE.length)
  })

  it('filters by length, cost, schedule and ownership together', () => {
    expect(ids({ duration: findBand(DURATION_BANDS, 'longa') })).toEqual([
      'uni-publica-frontend',
      'uni-privada-frontend',
      'ccomp-publica-dados',
      'tecnico-publica-dados',
    ])
    expect(ids({ cost: findBand(COST_BANDS, 'ate200'), schedule: 'online' })).toEqual(['bootcamp-online'])
    expect(ids({ ownership: 'publica', career: 'analista-de-dados' })).toEqual([
      'ccomp-publica-dados',
      'tecnico-publica-dados',
    ])
    expect(ids({ province: 'Benguela', level: 'formacao_profissional' })).toEqual(['figma-benguela'])
  })
})
