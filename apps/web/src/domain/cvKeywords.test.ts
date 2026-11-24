import { describe, expect, it } from 'vitest'
import { CAREERS } from '../data/demo/careers'
import { SKILL_DICTIONARY } from '../data/skillDictionary'
import { extractKeywords, normalizeText } from './cvKeywords'

const skills = (text: string) => extractKeywords(text).map(({ skill }) => skill)

describe('extractKeywords', () => {
  it('finds skills without caring about accents or case', () => {
    expect(skills('LIDERANÇA de equipas e Negociação; Lançamentos Contabilísticos')).toEqual([
      'Lançamentos contabilísticos',
      'Liderança de equipas',
      'Negociação',
    ])
  })

  it('finds the English synonyms and says which words matched', () => {
    expect(extractKeywords('Experienced in team leadership and customer service')).toEqual([
      { skill: 'Liderança de equipas', area: 'gestao', matches: ['team leadership', 'leadership'] },
      { skill: 'Atendimento ao cliente', area: 'gestao', matches: ['customer service'] },
    ])
  })

  it('matches whole words only: java is not javascript, sql is not in mysql-less words', () => {
    expect(skills('Escrevo JavaScript todos os dias')).toEqual(['JavaScript'])
    expect(skills('Conheço Java e Python')).toEqual(['Python', 'Java'])
    expect(skills('Treino em Transqlation e javascripting')).toEqual([])
  })

  it('returns only dictionary skills, never contacts, ID numbers or phones', () => {
    const text =
      'Maria Silva, BI 004567890LA041, tel +244 923 456 789, maria.silva@gmail.com, Rua da Missão 12, Luanda. Sei Excel e Python.'
    const result = JSON.stringify(extractKeywords(text))
    for (const personal of ['Maria', 'Silva', '004567890', '923', 'gmail', 'Missão', 'Luanda']) {
      expect(result).not.toContain(personal)
    }
    expect(skills(text)).toEqual(['Python', 'Excel'])
  })

  it('finds nothing in an empty text', () => {
    expect(extractKeywords('')).toEqual([])
  })
})

describe('the dictionary', () => {
  it('has every term without accents and in lower case, and no repeated id', () => {
    for (const { terms } of SKILL_DICTIONARY) {
      for (const term of terms) expect(term).toBe(normalizeText(term))
    }
    const ids = SKILL_DICTIONARY.map(({ id }) => id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('reuses the catalogue skills instead of keeping its own list', () => {
    const catalogue = new Set(CAREERS.flatMap((career) => career.skills).map((skill) => skill.id))
    const reused = SKILL_DICTIONARY.filter(({ id }) => catalogue.has(id))
    expect(reused.length).toBeGreaterThanOrEqual(12)
  })
})
