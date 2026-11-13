import {
  GROUP_AREAS,
  MARKET_AREAS,
  type CareerGroup,
  type CareerSummary,
  type Demand,
  type MarketArea,
  type RiasecKey,
} from '../data/types'

// What the first conversation with the Kayé guide finds out, and the careers that follow from it
// (docs/decisoes/0012). The RIASEC test is still there for whoever wants to go deeper.

export const SITUATIONS = ['school', 'university', 'seeking', 'working'] as const
export type Situation = (typeof SITUATIONS)[number]

export type Goal = 'discover' | 'change' | 'course' | 'job' | 'cv'

export const AREA_LEVELS = ['curious', 'learning', 'studying', 'working'] as const
export type AreaLevel = (typeof AREA_LEVELS)[number]

export const REACTIONS = ['no', 'maybe', 'yes'] as const
export type Reaction = (typeof REACTIONS)[number]

export const MAX_AREAS = 3
export const MAX_GROUPS = 2
export const MAX_INTERESTS = 2

export type AreaAnswers = {
  groups: CareerGroup[]
  level: AreaLevel | null
  /** The career shown to the person, and what they said about it. */
  career: string | null
  reaction: Reaction | null
}

export const EMPTY_AREA: AreaAnswers = { groups: [], level: null, career: null, reaction: null }

export type Discovery = {
  situation: Situation
  goal: Goal
  areas: MarketArea[]
  /** Only for who did not know which area to choose: what they like doing. */
  interests: RiasecKey[]
  answers: Partial<Record<MarketArea, AreaAnswers>>
}

export type DiscoveryReason = { kind: 'liked' } | { kind: 'group'; group: CareerGroup } | { kind: 'demand' }

type DiscoveryPick = { career: CareerSummary; liked: boolean; reasons: DiscoveryReason[] }

const DEMAND_SCORE: Record<Demand, number> = { alta: 1, media: 0.5, baixa: 0 }

/** The groups of an area that have careers, biggest first. */
export function groupsOf(careers: CareerSummary[], area: MarketArea): CareerGroup[] {
  const counts = new Map<CareerGroup, number>()
  for (const career of careers) {
    if (GROUP_AREAS[career.group] === area) counts.set(career.group, (counts.get(career.group) ?? 0) + 1)
  }
  return [...counts.keys()].toSorted((a, b) => (counts.get(b) ?? 0) - (counts.get(a) ?? 0))
}

/** How many careers each area has. */
export function areaCounts(careers: CareerSummary[]): { area: MarketArea; count: number }[] {
  return MARKET_AREAS.map((area) => ({
    area,
    count: careers.filter((career) => GROUP_AREAS[career.group] === area).length,
  })).filter((item) => item.count > 0)
}

/** The areas whose careers best match what the person likes doing. */
export function areasFor(interests: RiasecKey[], careers: CareerSummary[], limit = MAX_AREAS): MarketArea[] {
  if (interests.length === 0) return []
  const average = (area: MarketArea) => {
    const own = careers.filter((career) => GROUP_AREAS[career.group] === area)
    const total = own.reduce(
      (sum, career) => sum + interests.reduce((part, key) => part + career.riasec[key], 0),
      0,
    )
    return total / Math.max(own.length, 1)
  }
  return areaCounts(careers)
    .map(({ area }) => ({ area, score: average(area) }))
    .toSorted((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ area }) => area)
}

const rankForShowing = (career: CareerSummary) =>
  DEMAND_SCORE[career.demand] + (career.detailed ? 1 : 0) + (career.image ? 0.5 : 0)

/** The career to ask about: from what the person chose, the one best known and most in demand. */
export function pickCareer(
  careers: CareerSummary[],
  area: MarketArea,
  groups: CareerGroup[],
): CareerSummary | null {
  const pool = careers.filter(
    (career) => GROUP_AREAS[career.group] === area && (groups.length === 0 || groups.includes(career.group)),
  )
  return pool.toSorted((a, b) => rankForShowing(b) - rankForShowing(a))[0] ?? null
}

function scored(career: CareerSummary, discovery: Discovery, answers: AreaAnswers) {
  const shown = answers.career === career.slug
  const chosenGroup = answers.groups.includes(career.group)
  const liked = shown && answers.reaction === 'yes'
  let score = DEMAND_SCORE[career.demand] / 2
  if (chosenGroup) score += 2
  if (liked) score += 4
  if (shown && answers.reaction === 'maybe') score += 2
  for (const key of discovery.interests) score += career.riasec[key]

  const reasons: DiscoveryReason[] = []
  if (liked) reasons.push({ kind: 'liked' })
  if (chosenGroup) reasons.push({ kind: 'group', group: career.group })
  if (career.demand === 'alta') reasons.push({ kind: 'demand' })
  return { pick: { career, liked, reasons }, score }
}

/** The best careers of each chosen area, taking turns, so no area hides the others. */
export function recommendFromDiscovery(
  discovery: Discovery,
  careers: CareerSummary[],
  limit = 4,
): DiscoveryPick[] {
  const byArea = discovery.areas.map((area) => {
    const answers = discovery.answers[area] ?? EMPTY_AREA
    return careers
      .filter(
        (career) =>
          GROUP_AREAS[career.group] === area &&
          !(answers.career === career.slug && answers.reaction === 'no'),
      )
      .map((career) => scored(career, discovery, answers))
      .toSorted((a, b) => b.score - a.score)
  })

  const picks: DiscoveryPick[] = []
  for (let turn = 0; picks.length < limit && byArea.some((list) => turn < list.length); turn++) {
    for (const list of byArea) {
      const next = list[turn]
      if (next && picks.length < limit) picks.push(next.pick)
    }
  }
  return picks
}
