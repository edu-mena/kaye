import type { MarketArea } from '../data/types'

// The feed of the home: cards of different kinds, interleaved so the kind changes at every card.
// Pure: it only orders what it is given (ids), the screen looks the rest up. Nothing paid is ever an input.

/** Why a card is there: the screen turns it into "Porque gostas de…", "Na tua área: Saúde". */
export type FeedReason =
  { kind: 'area'; area: MarketArea } | { kind: 'target' } | { kind: 'saved' } | { kind: 'recommended' }

export type FactData =
  { kind: 'areaShare'; area: MarketArea; share: number } | { kind: 'noExperience'; share: number }

type Reasoned = { reason?: FeedReason }

export type FeedItem = (
  | { type: 'career'; career: string }
  | { type: 'whoHires'; career: string; companies: string[] }
  | { type: 'whereToStudy'; career: string; academies: string[] }
  | { type: 'deadline'; deadline: string }
  | { type: 'fact'; fact: FactData }
  | { type: 'news'; news: string }
  | { type: 'opportunity'; kind: 'bolsa' | 'estagio'; count: number }
  | { type: 'kurso'; course: string }
  | { type: 'plan' }
  | { type: 'noDegree' }
  | { type: 'plus' }
) &
  Reasoned & { id: string }

type FeedType = FeedItem['type']

/** The inputs, each list already in order of relevance (areas of interest, target, saved, test result). */
export type FeedInputs = {
  careers: ({ career: string } & Reasoned)[]
  whoHires: ({ career: string; companies: string[] } & Reasoned)[]
  whereToStudy: ({ career: string; academies: string[] } & Reasoned)[]
  deadlines: string[]
  facts: FactData[]
  /** News not shown in the highlight above the feed. */
  news: ({ news: string } & Reasoned)[]
  opportunities: { kind: 'bolsa' | 'estagio'; count: number }[]
  kursos: string[]
  hasPlan: boolean
  noDegree: boolean
  /** The Kayé Plus card may show (flag on, adult): it has a fixed place in the order, never a rank. */
  plus: boolean
  dismissed: readonly string[]
}

/** The order the kinds come in, over and over: never the same kind twice in a row, news about every fourth card. */
const PATTERN: FeedType[] = [
  'career',
  'news',
  'plan',
  'deadline',
  'whoHires',
  'news',
  'career',
  'fact',
  'whereToStudy',
  'news',
  'kurso',
  'opportunity',
  'plus',
  'noDegree',
]

const factId = (fact: FactData) =>
  fact.kind === 'areaShare' ? `fact:areaShare:${fact.area}` : 'fact:noExperience'

function candidates(inputs: FeedInputs): Record<FeedType, FeedItem[]> {
  return {
    career: inputs.careers.map((item) => ({ ...item, type: 'career', id: `career:${item.career}` })),
    whoHires: inputs.whoHires.map((item) => ({ ...item, type: 'whoHires', id: `whoHires:${item.career}` })),
    whereToStudy: inputs.whereToStudy.map((item) => ({
      ...item,
      type: 'whereToStudy',
      id: `whereToStudy:${item.career}`,
    })),
    deadline: inputs.deadlines.map((deadline) => ({
      type: 'deadline',
      deadline,
      id: `deadline:${deadline}`,
    })),
    fact: inputs.facts.map((fact) => ({ type: 'fact', fact, id: factId(fact) })),
    news: inputs.news.map((item) => ({ ...item, type: 'news', id: `news:${item.news}` })),
    opportunity: inputs.opportunities.map((item) => ({
      ...item,
      type: 'opportunity',
      id: `opportunity:${item.kind}`,
    })),
    kurso: inputs.kursos.map((course) => ({ type: 'kurso', course, id: `kurso:${course}` })),
    plan: inputs.hasPlan ? [{ type: 'plan', id: 'plan' }] : [],
    noDegree: inputs.noDegree ? [{ type: 'noDegree', id: 'noDegree' }] : [],
    plus: inputs.plus ? [{ type: 'plus', id: 'plus' }] : [],
  }
}

/** The whole feed, without what the person hid and without repeats. */
export function buildFeed(inputs: FeedInputs): FeedItem[] {
  const hidden = new Set(inputs.dismissed)
  const queues = Object.fromEntries(
    Object.entries(candidates(inputs)).map(([type, items]) => [
      type,
      items.filter((item) => !hidden.has(item.id)),
    ]),
  ) as Record<FeedType, FeedItem[]>
  const taken = new Set<string>()
  const feed: FeedItem[] = []
  let added = true
  while (added) {
    added = false
    for (const type of PATTERN) {
      let item = queues[type].shift()
      while (item && taken.has(item.id)) item = queues[type].shift()
      if (!item) continue
      taken.add(item.id)
      feed.push(item)
      added = true
    }
  }
  return feed
}

export const FEED_FILTERS = ['all', 'careers', 'study', 'companies', 'deadlines', 'news'] as const
export type FeedFilter = (typeof FEED_FILTERS)[number]

const FILTER_TYPES: Record<Exclude<FeedFilter, 'all'>, FeedType[]> = {
  careers: ['career', 'plan'],
  study: ['whereToStudy', 'kurso', 'noDegree'],
  companies: ['whoHires'],
  deadlines: ['deadline', 'opportunity'],
  news: ['news'],
}

export function filterFeed(feed: FeedItem[], filter: FeedFilter): FeedItem[] {
  return filter === 'all' ? feed : feed.filter((item) => FILTER_TYPES[filter].includes(item.type))
}
