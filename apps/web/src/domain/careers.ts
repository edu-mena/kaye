import type { CareerGroup, CareerSummary, Demand, RiasecProfile } from '../data/types'
import { inBand, type Band } from './bands'
import { compatibility } from './riasec'

/** Lowercase without accents: "informatica" finds "Informática". */
export function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim()
}

export type CareerSort = 'forYou' | 'demand' | 'salary'

const DEMAND_ORDER: Record<Demand, number> = { alta: 0, media: 1, baixa: 2 }

const bySalary = (a: CareerSummary, b: CareerSummary) => (b.salaryMedian ?? 0) - (a.salaryMedian ?? 0)

type Filter = {
  query: string
  group: CareerGroup | null
  sort: CareerSort
  profile: RiasecProfile | null
  demand?: Demand | null
  /** Median monthly salary. */
  salary?: Band
  /** Only careers with a full page ("guia") or only those still being curated. */
  guide?: 'guia' | 'curadoria' | null
}

/** A word of the (normalised) text starts with the searched word: "dados" finds "Dados", not "cuidados". */
export function hasWord(text: string, word: string): boolean {
  return text.split(/[^\p{L}\p{N}]+/u).some((part) => part.startsWith(word))
}

export function filterCareers(
  careers: CareerSummary[],
  { query, group, sort, profile, demand, salary, guide }: Filter,
): CareerSummary[] {
  const words = normalize(query).split(/\s+/).filter(Boolean)
  const matches = careers.filter((career) => {
    if (group && career.group !== group) return false
    if (demand && career.demand !== demand) return false
    if (!inBand(career.salaryMedian, salary)) return false
    if (guide && career.detailed !== (guide === 'guia')) return false
    const haystack = normalize(`${career.name} ${career.summary} ${career.group}`)
    return words.every((word) => hasWord(haystack, word))
  })

  const sorters: Record<CareerSort, (a: CareerSummary, b: CareerSummary) => number> = {
    forYou: (a, b) => (profile ? compatibility(profile, b.riasec) - compatibility(profile, a.riasec) : 0),
    demand: (a, b) => DEMAND_ORDER[a.demand] - DEMAND_ORDER[b.demand] || bySalary(a, b),
    salary: bySalary,
  }
  return matches.toSorted(sorters[sort])
}
