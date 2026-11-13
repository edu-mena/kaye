import {
  GROUP_AREAS,
  type CareerGroup,
  type CareerSummary,
  type MarketArea,
  type NewsItem,
  type Subscriptions,
} from '../data/types'
import type { Discovery } from './discovery'

type InterestUser = { discovery: Discovery | null; savedCareers: string[] }

/**
 * The person's areas, most interesting first: those they chose with the guide, then those of the
 * careers they saved, then those of their recommendations. Without onboarding, none: the lists
 * keep today's order.
 */
export function interestAreas(
  user: InterestUser,
  careers: CareerSummary[],
  recommended: CareerSummary[] = [],
): MarketArea[] {
  if (!user.discovery) return []
  const saved = careers.filter((career) => user.savedCareers.includes(career.slug))
  return [
    ...new Set([
      ...user.discovery.areas,
      ...saved.map((career) => GROUP_AREAS[career.group]),
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
