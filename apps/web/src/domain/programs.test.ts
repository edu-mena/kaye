import { describe, expect, it } from 'vitest'
import { PROGRAMS } from '../data/demo/programs'
import { COST_BANDS, DURATION_BANDS, findBand, inBand } from './bands'
import { matchesProgram } from './programs'

const ids = (filter: Parameters<typeof matchesProgram>[1]) =>
  PROGRAMS.filter((program) => matchesProgram(program, filter)).map((program) => program.id)

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
    expect(ids({})).toHaveLength(PROGRAMS.length)
  })

  it('filters by length, cost, schedule and ownership together', () => {
    expect(ids({ duration: findBand(DURATION_BANDS, 'longa') })).toEqual([
      'eng-informatica-publica',
      'eng-informatica',
      'ciencias-computacao',
      'tecnico-informatica',
      'estatistica',
      'lic-design',
    ])
    expect(ids({ cost: findBand(COST_BANDS, 'ate200'), schedule: 'online' })).toEqual(['bootcamp-frontend'])
    expect(ids({ ownership: 'publica', career: 'analista-de-dados' })).toEqual([
      'eng-informatica-publica',
      'ciencias-computacao',
      'estatistica',
    ])
    expect(ids({ province: 'Benguela', level: 'formacao_profissional' })).toEqual(['figma-benguela'])
  })
})
