import { describe, expect, it } from 'vitest'
import { CAREER_SUMMARIES } from '../data/demo/careers'
import { filterCareers, normalize } from './careers'

const all = { query: '', group: null, sort: 'demand' as const, profile: null }

describe('careers search', () => {
  it('ignores accents and case', () => {
    expect(normalize('  Informática ')).toBe('informatica')
    expect(filterCareers(CAREER_SUMMARIES, { ...all, query: 'ciberseguranca' }).map((c) => c.slug)).toEqual([
      'analista-de-ciberseguranca',
    ])
  })

  it('needs every word to match', () => {
    expect(filterCareers(CAREER_SUMMARIES, { ...all, query: 'dados engenheiro' }).map((c) => c.slug)).toEqual(
      ['engenheiro-de-dados'],
    )
    expect(filterCareers(CAREER_SUMMARIES, { ...all, query: 'medicina' })).toEqual([])
  })

  it('filters by area', () => {
    const design = filterCareers(CAREER_SUMMARIES, { ...all, group: 'design' })
    expect(design.every((career) => career.group === 'design')).toBe(true)
    expect(design).toHaveLength(2)
  })
})

describe('careers sorting', () => {
  it('puts high demand first, then the best paid', () => {
    const list = filterCareers(CAREER_SUMMARIES, all)
    expect(list[0]?.demand).toBe('alta')
    expect(list.at(-1)?.demand).toBe('baixa')
  })

  it('sorts by salary', () => {
    const salaries = filterCareers(CAREER_SUMMARIES, { ...all, sort: 'salary' }).map(
      (c) => c.salaryMedian ?? 0,
    )
    expect(salaries).toEqual(salaries.toSorted((a, b) => b - a))
  })

  it('sorts by fit with the person, when there is a test result', () => {
    const designer = CAREER_SUMMARIES.find((career) => career.slug === 'designer-grafico')!.riasec
    const list = filterCareers(CAREER_SUMMARIES, { ...all, sort: 'forYou', profile: designer })
    expect(list[0]?.slug).toBe('designer-grafico')
    // Without a profile the order is unchanged.
    const unsorted = filterCareers(CAREER_SUMMARIES, { ...all, sort: 'forYou' })
    expect(unsorted.map((c) => c.slug)).toEqual(CAREER_SUMMARIES.map((c) => c.slug))
  })
})
