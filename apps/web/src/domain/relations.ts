import {
  GROUP_AREAS,
  type Academy,
  type CareerSummary,
  type Company,
  type MarketArea,
  type Program,
} from '../data/types'

/** An entity that links to careers, with how many of the asked careers it covers. */
export type Related<T> = { item: T; matches: string[] }

/** Most matches first, then by name, so the order is the same on every screen. */
function ranked<T extends { name: string }>(items: Related<T>[]): Related<T>[] {
  return items.toSorted(
    (a, b) => b.matches.length - a.matches.length || a.item.name.localeCompare(b.item.name),
  )
}

function relate<T extends { name: string }>(
  items: T[],
  slugs: string[],
  careersOf: (item: T) => string[],
): Related<T>[] {
  const wanted = new Set(slugs)
  return ranked(
    items.flatMap((item) => {
      const matches = [...new Set(careersOf(item))].filter((slug) => wanted.has(slug))
      return matches.length > 0 ? [{ item, matches }] : []
    }),
  )
}

/** The companies that hire for any of the careers. */
export function companiesForCareers(companies: Company[], slugs: string[]): Related<Company>[] {
  return relate(companies, slugs, (company) => company.careers)
}

/** The academies whose courses prepare for any of the careers. */
export function academiesForCareers(academies: Academy[], slugs: string[]): Related<Academy>[] {
  return relate(academies, slugs, (academy) => academy.offers.flatMap((offer) => offer.careers))
}

/** The courses (programs) that lead to any of the careers. */
export function programsOfCareers(programs: Program[], slugs: string[]): Program[] {
  const wanted = new Set(slugs)
  return programs.filter((program) => program.careers.some((slug) => wanted.has(slug)))
}

export function careersOfArea<T extends Pick<CareerSummary, 'group'>>(careers: T[], area: MarketArea): T[] {
  return careers.filter((career) => GROUP_AREAS[career.group] === area)
}
