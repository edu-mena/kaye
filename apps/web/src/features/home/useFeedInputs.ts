import { KURSOS } from '../../data/kursos'
import { useAcademies, useCareers, useCompanies, useEducation, useJobMarket } from '../../data/queries'
import { GROUP_AREAS, type CareerSummary, type MarketArea } from '../../data/types'
import type { FactData, FeedInputs, FeedReason } from '../../domain/feed'
import { byInterest } from '../../domain/interests'
import { areaShares, marketSummary } from '../../domain/market'
import { academiesForCareers, companiesForCareers } from '../../domain/relations'
import { wantsShortPath } from '../../domain/strengths'
import { usePlus } from '../../lib/plan'
import { useInterestAreas } from '../../lib/useInterestAreas'
import { useNewsForMe } from '../../lib/useNewsForMe'
import { useRecommendations } from '../../lib/useRecommendations'
import { useDeadlines } from '../../state/useDeadlines'
import { useUser } from '../../state/userStore'
import { useAreaNews } from './useAreaNews'

const MAX_CAREERS = 24
const ANCHORS = 8

/**
 * What the feed is made of, each list in order of relevance: the person's areas first, their target career
 * and the careers they saved, then what the test recommends. Nothing paid enters (docs/design.md).
 */
export function useFeedInputs(): FeedInputs {
  const user = useUser()
  const { data: careers = [] } = useCareers()
  const { data: companies = [] } = useCompanies()
  const { data: academies = [] } = useAcademies()
  const { data: jobs } = useJobMarket()
  const { data: education } = useEducation()
  const ranked = useRecommendations(12)
  const areas = useInterestAreas()
  const { relevant, areasOf } = useNewsForMe()
  const { shownIds, of: newsOf } = useAreaNews()
  const deadlines = useDeadlines()
  const { promotable } = usePlus()

  // The careers the cards are about, in order, and why each is there.
  const bySlug = new Map(careers.map((career) => [career.slug, career]))
  const reasons = new Map<string, FeedReason>()
  const pool: CareerSummary[] = []
  const add = (career: CareerSummary | undefined, reason: FeedReason) => {
    if (!career || reasons.has(career.slug)) return
    reasons.set(career.slug, reason)
    pool.push(career)
  }
  add(bySlug.get(user.targetCareer ?? ''), { kind: 'target' })
  for (const slug of user.savedCareers) add(bySlug.get(slug), { kind: 'saved' })
  for (const item of ranked ?? []) add(item.career, { kind: 'recommended' })
  for (const career of careers) {
    if (career.demand === 'alta' && areas.includes(GROUP_AREAS[career.group])) {
      add(career, { kind: 'area', area: GROUP_AREAS[career.group] })
    }
  }
  // A career in one of the person's areas says so; the order keeps the target and the saved ones first.
  const ordered = [
    ...pool.filter((career) => ['target', 'saved'].includes(reasons.get(career.slug)?.kind ?? '')),
    ...byInterest(
      pool.filter((career) => !['target', 'saved'].includes(reasons.get(career.slug)?.kind ?? '')),
      (career) => [GROUP_AREAS[career.group]],
      areas,
    ),
  ].slice(0, MAX_CAREERS)
  const reasonOf = (career: CareerSummary): FeedReason | undefined => {
    const reason = reasons.get(career.slug)
    const area = GROUP_AREAS[career.group]
    return reason?.kind === 'recommended' && areas.includes(area) ? { kind: 'area', area } : reason
  }

  const anchors = ordered.slice(0, ANCHORS)
  const facts: FactData[] = []
  if (jobs && education) {
    const shares = areaShares(jobs, education)
    const mine: MarketArea | undefined = areas.find((area) => shares.some((entry) => entry.area === area))
    for (const area of [mine, marketSummary(jobs, education).area?.area]) {
      const entry = shares.find((item) => item.area === area)
      if (
        entry &&
        entry.postingsShare > 0 &&
        !facts.some((fact) => fact.kind === 'areaShare' && fact.area === area)
      ) {
        facts.push({ kind: 'areaShare', area: entry.area, share: entry.postingsShare })
      }
    }
    const { noExperience } = marketSummary(jobs, education)
    if (typeof noExperience === 'number') facts.push({ kind: 'noExperience', share: noExperience })
  }

  const opened = (kind: 'bolsa' | 'estagio') =>
    new Set(deadlines.all.filter((item) => item.kind === kind).map((item) => item.to)).size
  const inProgress = KURSOS.filter((course) => !user.kursos[course.id]?.completedAt)

  return {
    careers: ordered.map((career) => ({ career: career.slug, reason: reasonOf(career) })),
    whoHires: anchors.flatMap((career) => {
      const hiring = companiesForCareers(companies, [career.slug])
      return hiring.length > 0
        ? [
            {
              career: career.slug,
              companies: hiring.slice(0, 4).map(({ item }) => item.id),
              reason: reasonOf(career),
            },
          ]
        : []
    }),
    whereToStudy: anchors.flatMap((career) => {
      const teaching = academiesForCareers(academies, [career.slug])
      return teaching.length > 0
        ? [
            {
              career: career.slug,
              academies: teaching.slice(0, 3).map(({ item }) => item.id),
              reason: reasonOf(career),
            },
          ]
        : []
    }),
    deadlines: (deadlines.mine.length > 0 ? deadlines.mine : deadlines.all)
      .slice(0, 6)
      .map((item) => item.id),
    facts,
    // Newest first; the pieces the highlight shows are not repeated.
    news: newsOf(null)
      .filter((item) => relevant(item) && !shownIds.has(item.id))
      .map((item) => {
        const area = areasOf(item).find((entry) => areas.includes(entry))
        return { news: item.id, reason: area ? { kind: 'area' as const, area } : undefined }
      }),
    opportunities: (['bolsa', 'estagio'] as const).flatMap((kind) =>
      opened(kind) > 0 ? [{ kind, count: opened(kind) }] : [],
    ),
    // The course in progress comes first.
    kursos: [
      ...inProgress.filter((course) => user.kursos[course.id]?.position),
      ...inProgress.filter((course) => !user.kursos[course.id]?.position),
    ].map((course) => course.id),
    hasPlan: user.plan !== null,
    noDegree: wantsShortPath(user.strengths),
    plus: promotable,
    dismissed: user.dismissed ?? [],
  }
}
