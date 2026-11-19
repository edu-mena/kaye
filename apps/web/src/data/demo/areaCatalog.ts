import type {
  Academy,
  AcademyOffer,
  CareerGroup,
  CareerSummary,
  Company,
  CompanySector,
  SourceLink,
} from '../types'

// An area of the catalogue from what scrapers/catalog/<area>.py writes for the app (docs/decisoes/0009): every
// institution with the area's degree courses, with their students and graduates (MESCTI yearbook), the training
// outside degrees and the employers with a name. Each area brings its rules: which careers a course or an employer
// leads to. Public figures only.

type Course = { name: string; students: number; graduates: number }
type Institution = { name: string; nature: string; province: string; courses: Course[] }
type Training = { name: string; province: string; summary: string; source: SourceLink }
type Employer = {
  name: string
  kind: string
  province: string
  sector?: string
  postings?: number
  source?: SourceLink
}

/** What an area's file brings to the app. */
export type AreaData = {
  year: string
  sources: { education: SourceLink }
  institutions: Institution[]
  training?: Training[]
  employers: Employer[]
}

export type AreaRules = {
  careers: CareerSummary[]
  /** "nos seus cursos de saúde": what the area's courses are called in a sentence. */
  courses: string
  /** Editorial: the careers each course leads to, by its (folded) name; the first rule that matches. */
  courseCareers: [RegExp, string[]][]
  /** Editorial: who an employer usually hires, by its name; `fallback` when no rule matches. */
  employs: [RegExp, string[]][]
  fallback: string[]
  sector: CompanySector
  /** The source of an employer that names none. */
  source: SourceLink
  describe: (employer: Employer) => string
}

export const fold = (text: string) =>
  text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
export const slug = (text: string) =>
  fold(text)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
const match = (rules: [RegExp, string[]][], name: string) =>
  rules.find(([pattern]) => pattern.test(fold(name)))?.[1]

/** The area's institutions as academies, and its employers as companies. */
export function buildArea(data: AreaData, rules: AreaRules): { academies: Academy[]; companies: Company[] } {
  const groupsOf = (careers: string[]): CareerGroup[] => [
    ...new Set(rules.careers.filter((career) => careers.includes(career.slug)).map((career) => career.group)),
  ]
  const offer = (course: Course): AcademyOffer => {
    const careers = match(rules.courseCareers, course.name) ?? []
    return {
      course: { id: slug(course.name), name: course.name },
      name: course.name,
      level: 'licenciatura',
      careers,
      areas: groupsOf(careers),
      students: course.students,
      graduates: course.graduates,
      year: data.year,
    }
  }
  const institutions: Academy[] = data.institutions.map((institution) => {
    const students = institution.courses.reduce((sum, course) => sum + course.students, 0)
    const ownership = institution.nature === 'publica' ? 'publica' : 'privada'
    return {
      id: slug(institution.name),
      name: institution.name,
      type: /^universidade/i.test(institution.name) ? 'universidade' : 'instituto_superior',
      ownership,
      province: institution.province,
      place: institution.province,
      summary: `Ensino superior ${ownership === 'publica' ? 'público' : 'privado'} em ${institution.province}. Em ${
        data.year
      } tinha ${students.toLocaleString('pt-PT')} estudantes nos seus cursos de ${rules.courses}.`,
      offers: institution.courses.map(offer),
      sources: [data.sources.education],
    }
  })
  const training: Academy[] = (data.training ?? []).map((school) => ({
    id: slug(school.name),
    name: school.name,
    type: 'centro_formacao',
    ownership: null,
    province: school.province,
    place: school.province,
    summary: school.summary,
    offers: [],
    sources: [school.source],
  }))
  const companies: Company[] = data.employers.map((employer) => {
    const careers = match(rules.employs, employer.name) ?? rules.fallback
    return {
      id: slug(employer.name),
      name: employer.name,
      sector: (employer.sector as CompanySector | undefined) ?? rules.sector,
      province: employer.province,
      place: employer.province,
      summary: rules.describe(employer),
      careers,
      careersSourced: false,
      areas: groupsOf(careers),
      programs: [],
      partners: [],
      sources: [employer.source ?? rules.source],
    }
  })
  return { academies: [...institutions, ...training], companies }
}

/** One employer in the job ads of two areas is one company, with the careers of both. */
export function withoutRepeats(companies: Company[]): Company[] {
  const byId = new Map<string, Company>()
  for (const company of companies) {
    const known = byId.get(company.id)
    byId.set(
      company.id,
      known
        ? {
            ...known,
            careers: [...new Set([...known.careers, ...company.careers])],
            areas: [...new Set([...known.areas, ...company.areas])],
          }
        : company,
    )
  }
  return [...byId.values()]
}

const sameOffer = (a: AcademyOffer, b: AcademyOffer) => a.course.id === b.course.id && a.level === b.level

/** A curated offer takes the yearbook's figures for the same course at the same level, instead of showing it twice. */
function mergeOffers(curated: AcademyOffer[], extra: AcademyOffer[]): AcademyOffer[] {
  return [
    ...curated.map((offer) => {
      const found = extra.find((other) => sameOffer(other, offer))
      if (!found) return offer
      return {
        ...found,
        ...offer,
        careers: [...new Set([...offer.careers, ...found.careers])],
        areas: [...new Set([...offer.areas, ...found.areas])],
      }
    }),
    ...extra.filter((other) => !curated.some((offer) => sameOffer(offer, other))),
  ]
}

/**
 * The curated academies with the courses of every area added, then the institutions no curated entry covers.
 * One institution in two areas (Universidade Agostinho Neto teaches health and economics) is one academy.
 */
export function withAreas(curated: Academy[], areas: Academy[][]): Academy[] {
  const byName = new Map<string, Academy>()
  for (const academy of areas.flat()) {
    const known = byName.get(fold(academy.name))
    byName.set(
      fold(academy.name),
      known ? { ...known, offers: [...known.offers, ...academy.offers], summary: known.summary } : academy,
    )
  }
  const merged = curated.map((academy) => {
    const extra = byName.get(fold(academy.name))
    if (!extra) return academy
    byName.delete(fold(academy.name))
    return {
      ...academy,
      offers: mergeOffers(academy.offers, extra.offers),
      sources: [...academy.sources, ...extra.sources],
    }
  })
  return [...merged, ...byName.values()]
}
