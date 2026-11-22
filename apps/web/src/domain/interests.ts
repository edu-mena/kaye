import {
  GROUP_AREAS,
  type CareerGroup,
  type CareerSummary,
  type MarketArea,
  type NewsItem,
  type Subscriptions,
} from '../data/types'
import type { Discovery } from './discovery'

export type InterestUser = {
  discovery: Discovery | null
  /** What the person chose to see (entry screen, Definições); without it, the guide's areas. */
  interestAreas?: MarketArea[] | null
  savedCareers: string[]
  targetCareer?: string | null
}

/**
 * The person's areas, most interesting first: those they chose (the entry screen, the guide, Definições),
 * then those of the careers they saved or aim at, then those of their recommendations (the test).
 * Nobody chose or saved anything: none, and the lists keep today's order.
 */
export function interestAreas(
  user: InterestUser,
  careers: CareerSummary[],
  recommended: CareerSummary[] = [],
): MarketArea[] {
  const chosen = user.interestAreas ?? user.discovery?.areas ?? []
  const mine = new Set([...user.savedCareers, ...(user.targetCareer ? [user.targetCareer] : [])])
  return [
    ...new Set([
      ...chosen,
      ...careers.filter((career) => mine.has(career.slug)).map((career) => GROUP_AREAS[career.group]),
      ...recommended.map((career) => GROUP_AREAS[career.group]),
    ]),
  ]
}

/**
 * The items that touch the person's first areas come first; the order is otherwise kept and
 * nothing is hidden. With no areas, the list is returned as it was.
 */
export function byInterest<T>(
  items: readonly T[],
  areasOf: (item: T) => readonly MarketArea[],
  areas: readonly MarketArea[],
): T[] {
  if (areas.length === 0) return [...items]
  const rank = (item: T) =>
    Math.min(
      areas.length,
      ...areasOf(item).map((area) => {
        const index = areas.indexOf(area)
        return index === -1 ? areas.length : index
      }),
    )
  return items.toSorted((a, b) => rank(a) - rank(b))
}

/** The areas of career groups (offers and companies list groups, not areas). */
export const groupAreas = (groups: readonly CareerGroup[]): MarketArea[] =>
  groups.map((group) => GROUP_AREAS[group])

/** The areas of a piece of news, from the careers it is about (news is never tagged by hand). */
export function newsAreas(item: NewsItem, careers: readonly CareerSummary[]): MarketArea[] {
  const slugs = new Set(item.careers ?? [])
  return [
    ...new Set(careers.filter((career) => slugs.has(career.slug)).map((career) => GROUP_AREAS[career.group])),
  ]
}

/**
 * A piece of news is in the person's subscription when its type is followed and, if it is about
 * careers, one of their areas is followed too (general news of a followed type always counts).
 */
export function isSubscribed(
  item: NewsItem,
  areas: readonly MarketArea[],
  subscriptions: Subscriptions | null,
): boolean {
  if (!subscriptions?.kinds.includes(item.kind)) return false
  return areas.length === 0 || areas.some((area) => subscriptions.areas.includes(area))
}

/** A piece of news is about a company the person saved (its news counts as "Para ti" and reaches Notificações). */
export function aboutSavedCompany(item: NewsItem, saved: ReadonlySet<string>): boolean {
  return item.companies?.some((id) => saved.has(id)) ?? false
}
