import type {
  Career,
  CareerSummary,
  CareerTraits,
  Demand,
  EducationLevel,
  EntryLevel,
  RiasecKey,
  RiasecProfile,
  SkillLevel,
} from '../data/types'
import { compatibility, sharedStrength } from './riasec'
import type { Strengths, StudyGoal, WorkPrefs } from './strengths'

// docs/arquitetura.md, 5.4. Weights are configuration, not code elsewhere. `style` is small on purpose:
// how someone likes to work breaks ties, it never decides. Without answers each part is neutral (0.5),
// so the order is the same as with interests and market alone.
const WEIGHTS = { fit: 0.6, market: 0.25, feasibility: 0.15, style: 0.05 }
/** Below this, a career is only suggested if there are not enough better ones. */
const MIN_FIT = 0.55
const NEUTRAL = 0.5

const DEMAND: Record<Demand, number> = { alta: 1, media: 0.6, baixa: 0.3 }

/**
 * Feasibility from part 2's conditions (docs/decisoes/0017). Each answered condition gives 0–1 and they are
 * averaged; an unanswered one does not count.
 */
const FEASIBILITY = {
  /** Each level above the one the person wants to study to costs this much. */
  levelGap: 0.4,
  /** Needs to work now: how soon each way in leads to a job. A short course is never penalised. */
  workNow: { short: 1, technical: 1, degree: 0.35 } satisfies Record<EntryLevel, number>,
  /** Cannot study away from their province: taught there (or online), only elsewhere, not known. */
  home: { here: 1, elsewhere: 0.3, unknown: 0.6 },
}

const ENTRY_RANK: Record<EntryLevel, number> = { short: 0, technical: 1, degree: 2 }
const GOAL_RANK: Record<Exclude<StudyGoal, 'unsure'>, number> = { short: 0, technical: 1, degree: 2 }

/** The level an academic step gives, as a way in: up to the II ciclo is still "short". */
const ENTRY_OF: Record<EducationLevel, EntryLevel> = {
  primario: 'short',
  i_ciclo: 'short',
  ii_ciclo: 'short',
  medio_tecnico: 'technical',
  licenciatura: 'degree',
  mestrado: 'degree',
}

type Place = { careers: string[]; province: string; online: boolean }

/** A curated career reduced to what the recommendation weighs. */
export function careerTraits(career: Career, places: Place[]): CareerTraits {
  const entries = career.pathways.map((pathway) => {
    const levels = pathway.steps
      .filter((step) => step.kind === 'academico' && step.need === 'essencial')
      .map((step) => (step.level ? ENTRY_OF[step.level] : 'degree'))
    const level = levels.reduce<EntryLevel>(
      (top, item) => (ENTRY_RANK[item] > ENTRY_RANK[top] ? item : top),
      'short',
    )
    return { level, pathway: pathway.name }
  })
  const taught = places.filter((place) => place.careers.includes(career.slug))
  return {
    slug: career.slug,
    skills: career.skills,
    workStyles: career.workStyles,
    entry: entries.toSorted((a, b) => ENTRY_RANK[a.level] - ENTRY_RANK[b.level])[0] ?? null,
    provinces: [...new Set(taught.filter((place) => !place.online).map((place) => place.province))],
    online: taught.some((place) => place.online),
  }
}

// Words of the careers' work styles (Portuguese, as the catalogue writes them) that each preference
// looks for. Lower case, matched as part of the style.
const STYLE_WORDS: Record<string, string[]> = {
  team: ['equipa'],
  alone: ['independência', 'autonomia'],
  field: ['resistência física', 'sentido prático', 'observação'],
  office: ['organização', 'clareza a escrever', 'discrição'],
  stable: ['rigor', 'disciplina', 'cumprir prazos'],
  risk: ['decisão', 'iniciativa', 'negócio', 'negociação', 'persistência'],
  help: ['empatia', 'gostar de pessoas', 'paciência', 'escuta', 'respeito pelas pessoas', 'simpatia'],
  create: ['criatividade', 'curiosidade', 'imaginação'],
}

/** What the person said about how they like to work, as keys of STYLE_WORDS. */
function preferenceKeys(work: WorkPrefs): string[] {
  const keys: (string | null)[] = [work.place, work.company, work.security, ...work.values]
  return keys.filter((key): key is string => key !== null && key !== 'income')
}

/** 0–1: how many of the person's preferences the career's work styles show. Neutral when unknown. */
function styleScore(work: WorkPrefs, traits: CareerTraits | undefined): number {
  const keys = preferenceKeys(work)
  const wantsIncome = work.values.includes('income')
  if ((keys.length === 0 && !wantsIncome) || !traits) return NEUTRAL
  const styles = traits.workStyles.map((style) => style.toLowerCase())
  const hits = keys.filter((key) =>
    STYLE_WORDS[key]?.some((word) => styles.some((style) => style.includes(word))),
  )
  // "Rendimento depressa": a way in without a degree.
  const income = wantsIncome ? 1 : 0
  const quick = wantsIncome && traits.entry !== null && traits.entry.level !== 'degree' ? 1 : 0
  return (hits.length + quick) / (keys.length + income)
}

/** 0–1: whether the person can get there with the studies, place and time they have. Neutral when unknown. */
function feasibilityScore(
  conditions: Strengths['conditions'],
  traits: CareerTraits | undefined,
  province: string | null,
): number {
  const entry = traits?.entry?.level
  if (!traits || !entry) return NEUTRAL
  const parts: number[] = []
  if (conditions.study && conditions.study !== 'unsure') {
    const gap = Math.max(0, ENTRY_RANK[entry] - GOAL_RANK[conditions.study])
    parts.push(Math.max(0, 1 - FEASIBILITY.levelGap * gap))
  }
  if (conditions.workNow === true) parts.push(FEASIBILITY.workNow[entry])
  if (conditions.move === false && province) {
    const known = traits.online || traits.provinces.length > 0
    parts.push(
      traits.online || traits.provinces.includes(province)
        ? FEASIBILITY.home.here
        : known
          ? FEASIBILITY.home.elsewhere
          : FEASIBILITY.home.unknown,
    )
  }
  return parts.length === 0 ? NEUTRAL : parts.reduce((sum, value) => sum + value, 0) / parts.length
}

export type Reason =
  | { kind: 'interest'; dimension: RiasecKey }
  | { kind: 'demand' }
  | { kind: 'salary' }
  | { kind: 'skills'; count: number }
  | { kind: 'path'; level: EntryLevel; pathway: string }

export type Recommendation = {
  career: CareerSummary
  score: number
  compatibility: number
  reasons: Reason[]
}

/** What part 2 adds; without it the recommendation is interests and market only. */
export type RecommendContext = {
  traits: CareerTraits[]
  strengths: Strengths
  skills: Record<string, SkillLevel>
  province: string | null
}

const knows = (level: SkillLevel | undefined) => level === 'sei' || level === 'domino'

export function recommend(
  profile: RiasecProfile,
  careers: CareerSummary[],
  limit = 5,
  context?: RecommendContext,
): Recommendation[] {
  const salaries = careers.map((career) => career.salaryMedian ?? 0)
  const top = Math.max(...salaries, 1)
  const traitsOf = new Map(context?.traits.map((traits) => [traits.slug, traits]))

  const scored = careers.map((career) => {
    const traits = traitsOf.get(career.slug)
    const fit = compatibility(profile, career.riasec)
    const salary = (career.salaryMedian ?? 0) / top
    const market = 0.6 * DEMAND[career.demand] + 0.4 * salary
    const feasibility = context
      ? feasibilityScore(context.strengths.conditions, traits, context.province)
      : NEUTRAL
    const style = context ? styleScore(context.strengths.work, traits) : NEUTRAL
    const reasons: Reason[] = [{ kind: 'interest', dimension: sharedStrength(profile, career.riasec) }]
    const known = traits?.skills.filter((skill) => knows(context?.skills[skill.id])).length ?? 0
    if (known > 0) reasons.push({ kind: 'skills', count: known })
    if (traits?.entry) reasons.push({ kind: 'path', ...traits.entry })
    if (career.demand === 'alta') reasons.push({ kind: 'demand' })
    if (salary >= 0.6) reasons.push({ kind: 'salary' })

    return {
      career,
      compatibility: fit,
      score:
        WEIGHTS.fit * fit +
        WEIGHTS.market * market +
        WEIGHTS.feasibility * feasibility +
        WEIGHTS.style * style,
      reasons,
    }
  })
  const short = (item: Recommendation) => {
    const entry = traitsOf.get(item.career.slug)?.entry
    return entry ? entry.level !== 'degree' : false
  }

  // Fit comes first: the market never pushes a career that does not match.
  const matching = scored
    .filter((item) => item.compatibility >= MIN_FIT)
    .toSorted((a, b) => b.score - a.score)
  const rest = scored
    .filter((item) => item.compatibility < MIN_FIT)
    .toSorted((a, b) => b.compatibility - a.compatibility)
  const picked = [...matching, ...rest].slice(0, limit)

  // At least one way in without higher education, when a matching one exists in the catalogue.
  if (picked.length === limit && limit > 1 && !picked.some(short)) {
    const way = matching.find(short)
    if (way) picked.splice(limit - 1, 1, way)
  }
  return picked
}
