import { normalize } from './careers'

// Pesquisa: one query over careers, courses, academies and companies.

/** What an item is searched by: its name counts more than the rest. */
export type Searchable = { name: string; others: string[] }

export function searchWords(query: string): string[] {
  return normalize(query).split(/\s+/).filter(Boolean)
}

const wordsOf = (text: string) => text.split(/[^\p{L}\p{N}]+/u)

/**
 * How well an item matches the words, 0 when it does not: every word must appear somewhere.
 * A word at the start of a word of the name is worth most, anywhere in the name less, and in
 * the rest least; a name that starts with the whole query goes first.
 */
export function matchScore(words: string[], { name, others }: Searchable): number {
  if (words.length === 0) return 0
  const title = normalize(name)
  const rest = normalize(others.join(' '))
  let score = title.startsWith(words.join(' ')) ? 10 : 0
  for (const word of words) {
    if (wordsOf(title).some((part) => part.startsWith(word))) score += 4
    else if (title.includes(word)) score += 2
    else if (rest.includes(word)) score += 1
    else return 0
  }
  return score
}

/** The items that match, best first; equal ones keep their order. */
export function rank<T>(items: T[], words: string[], fields: (item: T) => Searchable): T[] {
  return items
    .map((item) => ({ item, score: matchScore(words, fields(item)) }))
    .filter((entry) => entry.score > 0)
    .toSorted((a, b) => b.score - a.score)
    .map((entry) => entry.item)
}

/** One character without accents or capitals; keeps the length, so positions stay the same. */
function fold(char: string): string {
  const folded = char
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
  return folded.length === 1 ? folded : char
}

/** Where the words appear in a text, as [start, end) pairs in order and merged, to highlight them. */
export function matchRanges(text: string, words: string[]): [number, number][] {
  const folded = Array.from(text, fold).join('')
  const found: [number, number][] = []
  for (const word of words) {
    for (let at = folded.indexOf(word); at !== -1; at = folded.indexOf(word, at + word.length)) {
      found.push([at, at + word.length])
    }
  }
  return found
    .toSorted((a, b) => a[0] - b[0])
    .reduce<[number, number][]>((merged, range) => {
      const last = merged.at(-1)
      if (last && range[0] <= last[1]) last[1] = Math.max(last[1], range[1])
      else merged.push([...range])
      return merged
    }, [])
}
