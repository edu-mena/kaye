import { describe, expect, it } from 'vitest'
import { matchRanges, matchScore, rank, searchWords } from './search'

const item = (name: string, ...others: string[]) => ({ name, others })

describe('searchWords', () => {
  it('splits the query into words without accents or capitals', () => {
    expect(searchWords('  Engenharia   INFORMÁTICA ')).toEqual(['engenharia', 'informatica'])
    expect(searchWords('   ')).toEqual([])
  })
})

describe('matchScore', () => {
  it('needs every word, in the name or the rest', () => {
    expect(matchScore(['dados'], item('Analista de Dados'))).toBeGreaterThan(0)
    expect(matchScore(['dados', 'luanda'], item('Analista de Dados', 'Luanda'))).toBeGreaterThan(0)
    expect(matchScore(['dados', 'huambo'], item('Analista de Dados', 'Luanda'))).toBe(0)
    expect(matchScore([], item('Analista de Dados'))).toBe(0)
  })

  it('values the name over the rest, the start of a word over the middle, and the whole start most', () => {
    const startOfName = matchScore(['dados'], item('Dados e IA'))
    const wordInName = matchScore(['dados'], item('Analista de Dados'))
    const middleOfName = matchScore(['ados'], item('Analista de Dados'))
    const onlyInRest = matchScore(['dados'], item('Analista de BI', 'trabalha com dados'))

    expect(startOfName).toBeGreaterThan(wordInName)
    expect(wordInName).toBeGreaterThan(middleOfName)
    expect(middleOfName).toBeGreaterThan(onlyInRest)
    expect(onlyInRest).toBeGreaterThan(0)
  })
})

describe('rank', () => {
  it('keeps only what matches, best first, and equal ones in their order', () => {
    const items = [
      item('Técnico de Redes', 'infraestrutura'),
      item('Analista de Dados', 'dados'),
      item('Cientista de Dados', 'dados'),
      item('Dados para todos'),
    ]
    expect(rank(items, ['dados'], (entry) => entry).map((entry) => entry.name)).toEqual([
      'Dados para todos',
      'Analista de Dados',
      'Cientista de Dados',
    ])
  })
})

describe('matchRanges', () => {
  it('finds the words in the original text, accents and capitals included', () => {
    expect(matchRanges('Engenharia Informática', ['informatica'])).toEqual([[11, 22]])
    expect(matchRanges('Dados e mais dados', ['dados'])).toEqual([
      [0, 5],
      [13, 18],
    ])
  })

  it('merges words that touch or overlap, and finds nothing when absent', () => {
    expect(matchRanges('Desenvolvedor', ['desen', 'envol'])).toEqual([[0, 8]])
    expect(matchRanges('Redes', ['dados'])).toEqual([])
  })
})
