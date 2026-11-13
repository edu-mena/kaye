import type { AcademyOffer, MarketArea, Scholarship } from '../data/types'

// Bolsas: which scholarships suit a career or a course, and which are open now.

/** Open to apply: the deadline has not passed, or it comes back every year (a scholarship, an application). */
export function isOpen(
  { deadline, recurring }: { deadline: string | null; recurring: boolean },
  today: string,
): boolean {
  return recurring || (deadline !== null && deadline >= today)
}

export type ScholarshipFilters = {
  level: AcademyOffer['level'] | null
  destination: Scholarship['destination'] | null
  area: MarketArea | null
  open: boolean
}

/** A scholarship with no areas is open to any area; one with areas only to those. */
const fitsArea = (scholarship: Scholarship, areas: MarketArea[]) =>
  scholarship.areas.length === 0 || scholarship.areas.some((area) => areas.includes(area))

export function filterScholarships(
  scholarships: Scholarship[],
  { level, destination, area, open }: ScholarshipFilters,
  today: string,
): Scholarship[] {
  return scholarships.filter(
    (scholarship) =>
      (level === null || scholarship.levels.includes(level)) &&
      (destination === null || scholarship.destination === destination) &&
      (area === null || fitsArea(scholarship, [area])) &&
      (!open || isOpen(scholarship, today)),
  )
}

/**
 * The scholarships for a career's or a course's areas and levels (no levels: any). Those made for the area go
 * first, then the open ones, then the nearest deadline.
 */
export function scholarshipsFor(
  scholarships: Scholarship[],
  { areas, levels = [] }: { areas: MarketArea[]; levels?: AcademyOffer['level'][] },
  today: string,
): Scholarship[] {
  return scholarships
    .filter(
      (scholarship) =>
        fitsArea(scholarship, areas) &&
        (levels.length === 0 || scholarship.levels.some((level) => levels.includes(level))),
    )
    .toSorted(
      (a, b) =>
        Number(b.areas.length > 0) - Number(a.areas.length > 0) ||
        Number(isOpen(b, today)) - Number(isOpen(a, today)) ||
        (a.deadline ?? '9999').localeCompare(b.deadline ?? '9999'),
    )
}

/** Today as an ISO date, in the person's time zone. */
export const todayIso = () => new Date().toLocaleDateString('sv-SE')
