import {
  GROUP_AREAS,
  type Career,
  type CatalogCourse,
  type Company,
  type Scholarship,
} from '../../data/types'
import { studyCost } from '../../domain/fees'
import { scholarshipsFor, todayIso } from '../../domain/scholarships'

const unique = (items: string[]) => [...new Set(items.filter(Boolean))]

type Catalogue = { courses: CatalogCourse[]; companies: Company[]; scholarships: Scholarship[] }

/**
 * What a family asks about a career, from the catalogue only: the PDF (familySheet) and the /familia page
 * share it, so both say the same.
 */
export function familyFacts(career: Career, { courses, companies, scholarships }: Catalogue) {
  const offers = courses
    .filter((course) => course.careers.includes(career.slug))
    .flatMap((course) => course.offers)
  const decrees = unique(offers.flatMap(({ offer }) => (offer.recognition ? [offer.recognition.label] : [])))
  return {
    cost: studyCost(offers),
    /** The decrees that recognise the courses: proof it is serious. */
    decrees,
    /** Recognised institutions first. */
    institutions: unique(
      offers
        .toSorted((a, b) => Number(Boolean(b.offer.recognition)) - Number(Boolean(a.offer.recognition)))
        .map(({ academy }) => academy.name),
    ).slice(0, 3),
    publicPlaces: unique(
      offers.filter(({ academy }) => academy.ownership === 'publica').map(({ academy }) => academy.name),
    ).slice(0, 3),
    employers: companies
      .filter((company) => company.careers.includes(career.slug))
      .slice(0, 3)
      .map((company) => company.name),
    grants: scholarshipsFor(scholarships, { areas: [GROUP_AREAS[career.group]] }, todayIso()).slice(0, 3),
  }
}
