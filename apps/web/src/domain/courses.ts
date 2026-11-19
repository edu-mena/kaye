import { GROUP_AREAS, MARKET_AREAS } from '../data/types'
import type { Academy, AcademyOffer, CatalogCourse, MarketArea } from '../data/types'
import { hasWord, normalize } from './careers'

/** The levels in the order a person meets them. */
export const OFFER_LEVELS: AcademyOffer['level'][] = [
  'formacao_profissional',
  'medio_tecnico',
  'licenciatura',
  'especialidade',
  'mestrado',
  'certificacao',
]

/**
 * The courses of every institution, one entry per course with its offer at each institution: the most studied
 * first. A course's areas are those of the careers its offers lead to.
 */
export function catalogCourses(academies: Academy[]): CatalogCourse[] {
  const byId = new Map<string, CatalogCourse>()
  for (const academy of academies) {
    const { id, name, type, ownership, province } = academy
    for (const offer of academy.offers) {
      const known = byId.get(offer.course.id)
      const offers = [...(known?.offers ?? []), { academy: { id, name, type, ownership, province }, offer }]
      const levels = new Set([...(known?.levels ?? []), offer.level])
      const areas = new Set([...(known?.areas ?? []), ...offer.areas.map((group) => GROUP_AREAS[group])])
      byId.set(offer.course.id, {
        ...offer.course,
        levels: OFFER_LEVELS.filter((level) => levels.has(level)),
        areas: MARKET_AREAS.filter((area) => areas.has(area)),
        careers: [...new Set([...(known?.careers ?? []), ...offer.careers])],
        offers,
        students: (known?.students ?? 0) + (offer.students ?? 0),
        graduates: (known?.graduates ?? 0) + (offer.graduates ?? 0),
      })
    }
  }
  return [...byId.values()].toSorted((a, b) => b.students - a.students || a.name.localeCompare(b.name))
}

export type CourseFilter = {
  query?: string
  area?: MarketArea | null
  level?: AcademyOffer['level'] | null
  career?: string | null
}

/** The courses that pass every filter that is set; the search finds words of the name, without accents. */
export function filterCourses(
  courses: CatalogCourse[],
  { query, area, level, career }: CourseFilter,
): CatalogCourse[] {
  const words = normalize(query ?? '')
    .split(/\s+/)
    .filter(Boolean)
  return courses.filter(
    (course) =>
      (!area || course.areas.includes(area)) &&
      (!level || course.levels.includes(level)) &&
      (!career || course.careers.includes(career)) &&
      words.every((word) => hasWord(normalize(course.name), word)),
  )
}
