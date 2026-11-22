import type { Academy, CareerSummary, CatalogCourse, Company, MarketArea } from '../data/types'
import { groupAreas } from './interests'

// What is relevant to a person (docs/arquitetura.md, "Filtro pelos gostos"). One rule for every kind of item
// (career, company, academy, course, news, scholarship, internship): lists show what touches the person's
// areas by default, and they can ask for the rest. Nothing paid enters the calculation.

/** What the person's interests are made of: their areas, careers they saved or aim at, companies they saved. */
export type InterestProfile = {
  /** Most interesting first (domain/interests.ts). Empty: no profile yet, so nothing is hidden. */
  areas: readonly MarketArea[]
  careers: ReadonlySet<string>
  companies: ReadonlySet<string>
}

export const EMPTY_PROFILE: InterestProfile = { areas: [], careers: new Set(), companies: new Set() }

/** What an item is about, in the app's own terms; the caller reads it from the item's areas, careers or company. */
export type Subject = {
  areas?: readonly MarketArea[]
  careers?: readonly string[]
  /** Ids of the companies it is about. */
  companies?: readonly string[]
}

/** A profile with no areas filters nothing: the person has not said what they like. */
export const hasProfile = (profile: InterestProfile) => profile.areas.length > 0

/**
 * Whether an item has to do with the person: it touches one of their areas, one of their careers or one of their
 * saved companies. An item that says nothing about areas, careers or companies (general news, a scholarship open to
 * any area) is for everyone. Without a profile, everything is relevant.
 */
export function isRelevant(profile: InterestProfile, subject: Subject): boolean {
  if (!hasProfile(profile)) return true
  const { areas = [], careers = [], companies = [] } = subject
  if (areas.length === 0 && careers.length === 0 && companies.length === 0) return true
  return (
    areas.some((area) => profile.areas.includes(area)) ||
    careers.some((slug) => profile.careers.has(slug)) ||
    companies.some((id) => profile.companies.has(id))
  )
}

/** The items that have to do with the person, in the order they came, and how many were left out. */
export function onlyRelevant<T>(
  items: readonly T[],
  subjectOf: (item: T) => Subject,
  profile: InterestProfile,
): { items: T[]; hidden: number } {
  const kept = items.filter((item) => isRelevant(profile, subjectOf(item)))
  return { items: kept, hidden: items.length - kept.length }
}

// What each kind of item is about. An item is about its areas, the careers it leads to or hires for and, for a
// company, itself (a saved company counts).

export const careerSubject = (career: Pick<CareerSummary, 'slug' | 'group'>): Subject => ({
  areas: groupAreas([career.group]),
  careers: [career.slug],
})

export const companySubject = (company: Pick<Company, 'id' | 'areas' | 'careers'>): Subject => ({
  areas: groupAreas(company.areas),
  careers: company.careers,
  companies: [company.id],
})

export const academySubject = (academy: Pick<Academy, 'offers'>): Subject => ({
  areas: groupAreas(academy.offers.flatMap((offer) => offer.areas)),
  careers: academy.offers.flatMap((offer) => offer.careers),
})

export const courseSubject = (course: Pick<CatalogCourse, 'areas' | 'careers'>): Subject => ({
  areas: course.areas,
  careers: course.careers,
})

/** Scholarships and internships: their areas (a scholarship open to any area has none, so it is for everyone). */
export const areasSubject = (item: { areas: readonly MarketArea[] }): Subject => ({ areas: item.areas })
