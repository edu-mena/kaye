import { SKILL_DICTIONARY, type DictionaryArea } from '../data/skillDictionary'

// The CV reader (docs/decisoes/0025): finds the dictionary's skills in the text of a CV. It returns only
// dictionary entries, never the text, so contacts, ID numbers and phones cannot come out of here.

export type CvKeyword = { skill: string; area: DictionaryArea; matches: string[] }

/** Lower case and without accents, so "Liderança" and "lideranca" are the same word. */
export const normalizeText = (text: string): string =>
  text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()

const escape = (term: string) => term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/** A whole word: "java" is not in "javascript", "sql" is not in "mysql". */
const wordPattern = (term: string) => new RegExp(`(?<![a-z0-9])${escape(term)}(?![a-z0-9])`, 'u')

const PATTERNS = SKILL_DICTIONARY.map((entry) => ({
  entry,
  terms: entry.terms.map((term) => ({ term, pattern: wordPattern(term) })),
}))

export function extractKeywords(text: string): CvKeyword[] {
  const normalized = normalizeText(text)
  return PATTERNS.flatMap(({ entry, terms }) => {
    const matches = terms.filter(({ pattern }) => pattern.test(normalized)).map(({ term }) => term)
    return matches.length > 0 ? [{ skill: entry.name, area: entry.area, matches }] : []
  })
}
