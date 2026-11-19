import type { Academy, AcademyOffer, CareerGroup, Curriculum, SourceLink } from '../types'
import { fold, slug } from './areaCatalog'

/** A course a decree creates at an institution, with its plan of studies when the decree publishes one (ADR 0011). */
export type DecreeCourse = {
  /** The institution's name as the catalogue has it. */
  institution: string
  name: string
  level: AcademyOffer['level']
  /** Editorial: the careers the course prepares for, and their areas. */
  careers: string[]
  areas: CareerGroup[]
  decree: SourceLink
  periods?: Curriculum['periods']
}

const sameCourse = (offer: AcademyOffer, course: DecreeCourse) =>
  offer.course.id === slug(course.name) && offer.level === course.level

const fromDecree = (course: DecreeCourse) => ({
  recognition: course.decree,
  ...(course.periods ? { curriculum: { periods: course.periods, source: course.decree } } : {}),
})

/**
 * The academies with each decree's course: an offer the yearbook already lists gains the decree and its plan of
 * studies; a course it does not list (created after the yearbook's year) becomes a new offer. A course of an
 * institution the catalogue does not have is a mistake in the data.
 */
export function withDecrees(academies: Academy[], courses: DecreeCourse[]): Academy[] {
  const names = new Set(academies.map((academy) => fold(academy.name)))
  const unknown = courses.find((course) => !names.has(fold(course.institution)))
  if (unknown) throw new Error(`No academy for the decree course at ${unknown.institution}`)

  return academies.map((academy) => {
    const own = courses.filter((course) => fold(course.institution) === fold(academy.name))
    if (own.length === 0) return academy
    const offers = academy.offers.map((offer) => {
      const course = own.find((candidate) => sameCourse(offer, candidate))
      return course ? Object.assign({}, offer, fromDecree(course)) : offer
    })
    const added: AcademyOffer[] = own
      .filter((course) => !academy.offers.some((offer) => sameCourse(offer, course)))
      .map((course) =>
        Object.assign(
          {
            course: { id: slug(course.name), name: course.name },
            name: course.name,
            level: course.level,
            careers: course.careers,
            areas: course.areas,
          },
          fromDecree(course),
        ),
      )
    const sources = [...academy.sources, ...own.map((course) => course.decree)]
    return {
      ...academy,
      offers: [...offers, ...added],
      sources: [...new Map(sources.map((source) => [source.url, source])).values()],
    }
  })
}
