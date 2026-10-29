import { MARKET_AREAS, type EducationStats, type JobMarket, type MarketArea } from '../data/types'

// Mercado: the job ads, the public competitions and the graduates, read together. Facts side by side, never a
// verdict on an area.

export type AreaShares = {
  area: MarketArea
  postings: number
  /** Of the job posts with a known area, of all posts announced in public competitions, and of all graduates (0 to 1). */
  postingsShare: number
  publicOpenings: number
  publicShare: number
  graduates: number
  graduatesShare: number
  /** Students now, and their share of all students. */
  enrolled: number
  enrolledShare: number
}

/**
 * Each area from end to end: its part of the job posts (mostly private), of the posts in public competitions
 * (how the State hires) and of the graduates, most job posts first.
 */
export function areaShares(jobs: JobMarket, education: EducationStats): AreaShares[] {
  const known = jobs.areas.filter((entry) => entry.area !== 'other')
  const posted = known.reduce((sum, entry) => sum + entry.postings, 0) || 1
  const opened = jobs.public.areas.reduce((sum, entry) => sum + entry.openings, 0) || 1
  return MARKET_AREAS.map((area) => {
    const postings = known.find((entry) => entry.area === area)?.postings ?? 0
    const publicOpenings = jobs.public.areas.find((entry) => entry.area === area)?.openings ?? 0
    const studies = education.areas.find((entry) => entry.area === area)
    const graduates = studies?.graduates ?? 0
    const enrolled = studies?.enrolled ?? 0
    return {
      area,
      postings,
      postingsShare: postings / posted,
      publicOpenings,
      publicShare: publicOpenings / opened,
      graduates,
      graduatesShare: graduates / (education.total || 1),
      enrolled,
      enrolledShare: enrolled / (education.access.enrolled || 1),
    }
  })
    .filter(
      (entry) => entry.postings > 0 || entry.publicOpenings > 0 || entry.graduates > 0 || entry.enrolled > 0,
    )
    .toSorted((a, b) => b.postings - a.postings)
}

export type MarketSummary = {
  /** The share of the posts that say how much experience they want and take people with none. */
  noExperience: number | null
  area: { area: MarketArea; share: number } | null
  publicCompetitions: { competitions: number; openings: number }
  graduates: { year: string; total: number; course: { name: string; graduates: number } | null }
  techCareer: { slug: string; postings: number } | null
}

/** What the Mercado says in a few sentences, from the numbers behind it. */
export function marketSummary(jobs: JobMarket, education: EducationStats): MarketSummary {
  const said = jobs.asks.experience.reduce((sum, entry) => sum + entry.postings, 0)
  const none = jobs.asks.experience.find((entry) => entry.band === 'none')?.postings ?? 0
  const [area] = areaShares(jobs, education)
  const course = education.areas
    .flatMap((entry) => entry.courses)
    .reduce<{ name: string; graduates: number } | null>(
      (best, entry) => (!best || entry.graduates > best.graduates ? entry : best),
      null,
    )
  return {
    noExperience: said ? none / said : null,
    area: area && area.postings > 0 ? { area: area.area, share: area.postingsShare } : null,
    publicCompetitions: { competitions: jobs.public.competitions, openings: jobs.public.openings },
    graduates: { year: education.year, total: education.total, course },
    techCareer: jobs.careers[0] ?? null,
  }
}
