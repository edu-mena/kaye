import {
  GROUP_AREAS,
  type Career,
  type CareerSummary,
  type Demand,
  type EducationLevel,
  type MarketArea,
} from '../data/types'
import { quickestPathway } from './education'

// The challenge of the day: one question made from the catalogue, the same for everyone on a date.
// There is no written content: the date is the seed.

type DailyKind = 'salary' | 'demand' | 'time'

export type DailyOption =
  | { kind: 'kz'; value: number }
  | { kind: 'career'; slug: string; name: string }
  | { kind: 'months'; value: number }

export type DailyChallenge = {
  date: string
  kind: DailyKind
  /** The careers the question is about (the answer links to them). */
  careers: string[]
  /** The career a salary or time question is about; "demand" compares the two careers in `options`. */
  subject: string | null
  options: DailyOption[]
  /** Index of the right option. */
  answer: number
  /** The number behind it is an estimate: the answer says so. */
  estimated: boolean
}

export type DailyInput = {
  date: string
  careers: CareerSummary[]
  /** Careers in full, for "how long to get there". */
  details?: Career[]
  areas?: readonly MarketArea[]
  target?: string | null
  education?: EducationLevel | null
  /** Minors never see salaries (CLAUDE.md): they get another kind of question. */
  showSalaries: boolean
}

export type Random = () => number

/** To the nearest 10 000 Kz, never below it: the options of a salary question. */
const round = (amount: number) => Math.max(10_000, Math.round(amount / 10_000) * 10_000)

/** A small deterministic generator (mulberry32) seeded from a text such as the date. */
export function seeded(seed: string): Random {
  let state = 0
  for (const char of seed) state = (Math.imul(state, 31) + char.charCodeAt(0)) >>> 0
  return () => {
    state = (state + 0x6d2b79f5) >>> 0
    let value = state
    value = Math.imul(value ^ (value >>> 15), value | 1)
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61)
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296
  }
}

const DEMAND_RANK: Record<Demand, number> = { alta: 2, media: 1, baixa: 0 }

type Preference = Pick<DailyInput, 'careers' | 'areas' | 'target'>

/** The careers a question may be about: the person's target and areas first, else every career. */
function pool({ careers, areas = [], target }: Preference): CareerSummary[] {
  const mine = new Set<MarketArea>(areas)
  const preferred = careers.filter((career) => career.slug === target || mine.has(GROUP_AREAS[career.group]))
  return preferred.length >= 4 ? preferred : careers
}

const pick = <T>(items: T[], random: Random): T | undefined => items[Math.floor(random() * items.length)]

/** The values in ascending order, rotated by a random amount so the right one is not always in the same place. */
function rotated(values: number[], random: Random): number[] {
  const sorted = values.toSorted((a, b) => a - b)
  const shift = Math.floor(random() * sorted.length)
  return sorted.map((_, index) => sorted[(index + shift) % sorted.length] as number)
}

function salaryQuestion(input: DailyInput, random: Random): DailyChallenge | null {
  const career = pick(
    pool(input).filter((item) => item.salaryMedian !== null && item.salaryMedian > 0),
    random,
  )
  if (!career || career.salaryMedian === null) return null
  const real = round(career.salaryMedian)
  const values = [...new Set([round(career.salaryMedian * 0.55), real, round(career.salaryMedian * 1.7)])]
  if (values.length < 3) return null
  const ordered = rotated(values, random)
  return {
    date: input.date,
    kind: 'salary',
    careers: [career.slug],
    subject: career.name,
    options: ordered.map((value) => ({ kind: 'kz', value })),
    answer: ordered.indexOf(real),
    estimated: career.salaryKind !== 'entrada',
  }
}

function demandQuestion(input: DailyInput, random: Random): DailyChallenge | null {
  const first = pick(pool(input), random)
  if (!first) return null
  const other = pick(
    input.careers.filter((career) => DEMAND_RANK[career.demand] !== DEMAND_RANK[first.demand]),
    random,
  )
  if (!other) return null
  const [a, b] = random() < 0.5 ? [first, other] : [other, first]
  if (!a || !b) return null
  return {
    date: input.date,
    kind: 'demand',
    careers: [a.slug, b.slug],
    subject: null,
    options: [a, b].map((career) => ({ kind: 'career', slug: career.slug, name: career.name })),
    answer: DEMAND_RANK[a.demand] > DEMAND_RANK[b.demand] ? 0 : 1,
    estimated: true,
  }
}

function timeQuestion(input: DailyInput, random: Random): DailyChallenge | null {
  const known = (input.details ?? []).flatMap((career) => {
    const quickest = quickestPathway(career, input.education ?? null)
    return quickest && quickest.months.min > 0 ? [{ career, months: quickest.months.min }] : []
  })
  const chosen = pick(known, random)
  if (!chosen) return null
  const values = [
    ...new Set([Math.max(3, Math.round(chosen.months / 2)), chosen.months, Math.round(chosen.months * 1.8)]),
  ]
  if (values.length < 3) return null
  const ordered = rotated(values, random)
  return {
    date: input.date,
    kind: 'time',
    careers: [chosen.career.slug],
    subject: chosen.career.name,
    options: ordered.map((value) => ({ kind: 'months', value })),
    answer: ordered.indexOf(chosen.months),
    estimated: true,
  }
}

const BUILDERS: Record<DailyKind, (input: DailyInput, random: Random) => DailyChallenge | null> = {
  salary: salaryQuestion,
  demand: demandQuestion,
  time: timeQuestion,
}

/** The kinds of question this person may get: a minor gets no salaries. */
const kindsFor = (showSalaries: boolean): DailyKind[] =>
  showSalaries ? ['salary', 'demand', 'time'] : ['demand', 'time']

/**
 * The careers whose full record the "time" question may need, the same ones on a given date: load
 * their details before calling `dailyChallenge`, so the question does not change when they arrive.
 */
export function dailyCandidates(input: Preference & { date: string }): string[] {
  const random = seeded(`${input.date}:time`)
  const candidates = pool(input)
  const slugs = Array.from({ length: 4 }, () => pick(candidates, random)?.slug)
  return [...new Set(slugs.flatMap((slug) => (slug ? [slug] : [])))]
}

/**
 * The question of `date`: its kind comes from the date; with no data for it, the next kind is tried.
 * Null when the catalogue cannot make any question.
 */
export function dailyChallenge(input: DailyInput): DailyChallenge | null {
  const kinds = kindsFor(input.showSalaries)
  const start = Math.floor(seeded(input.date)() * kinds.length)
  for (let step = 0; step < kinds.length; step += 1) {
    const kind = kinds[(start + step) % kinds.length] as DailyKind
    const question = BUILDERS[kind](input, seeded(`${input.date}:${kind}`))
    if (question) return question
  }
  return null
}
