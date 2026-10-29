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

  it('values the whole start most, then the name over the rest, and only the start of a word', () => {
    const startOfName = matchScore(['dados'], item('Dados e IA'))
    const wordInName = matchScore(['dados'], item('Analista de Dados'))
    const onlyInRest = matchScore(['dados'], item('Analista de BI', 'trabalha com dados'))

    expect(startOfName).toBeGreaterThan(wordInName)
    expect(wordInName).toBeGreaterThan(onlyInRest)
    expect(onlyInRest).toBeGreaterThan(0)
    // "dados" is not in "Cuidados Intensivos", nor "ados" in "Dados".
    expect(matchScore(['dados'], item('Enfermeiro de Cuidados Intensivos'))).toBe(0)
    expect(matchScore(['ados'], item('Analista de Dados'))).toBe(0)
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
