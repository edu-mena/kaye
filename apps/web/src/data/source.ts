import type { InterviewSubmission } from '../domain/interviews'
import { api, ApiError } from '../lib/api'
import { withBuiltAssets } from './assets'
import { ACADEMIES } from './demo/academies'
import { questions } from './demo/assessment'
import { CAREER_SUMMARIES, CAREERS } from './demo/careers'
import { SELF_EMPLOYMENT } from './demo/selfEmployment'
import { SUPPORT_PROGRAMS } from './demo/supportPrograms'
import { COMPANIES } from './demo/companies'
import { CV_EXAMPLES } from './demo/cvExamples'
import { withAreas, withoutRepeats } from './demo/areaCatalog'
import { withProfiles } from './demo/companyProfiles'
import { withFees } from './demo/academyFees'
import { withImages } from './demo/academyImages'
import { withContacts } from './demo/academyContacts'
import { withShowcase } from './demo/academyShowcase'
import { LUANDA_MIDDLE_SCHOOLS } from './demo/luandaMiddleSchools'
import { withDecrees } from './demo/courseDecrees'
import { HEALTH_COURSE_DECREES, SPECIALISATION_INSTITUTE } from './demo/healthCourseDecrees'
import { HEALTH_SCHOOLS } from './demo/healthSchools'
import { CERTIFICATION_CENTRES } from './demo/certificationCentres'
import { EDUCATION_COMPANIES } from './demo/educationGuides'
import { LEGAL_COMPANIES } from './demo/legalGuides'
import { PUBLIC_COMPANIES } from './demo/publicGuides'
import { SCIENCES_COMPANIES } from './demo/sciencesGuides'
import { COMMUNICATION_COMPANIES } from './demo/communicationGuides'
import { LAST_AREAS_COMPANIES } from './demo/lastAreasGuides'
import { ENGINEERING_COMPANIES } from './demo/engineeringGuides'
import { OFFSHORE_COMPANIES, OIL_ACADEMIES } from './demo/offshoreTrades'
import { PMI_ANGOLA, PROJECT_COMPANIES } from './demo/projectManagement'
import { BUSINESS } from './demo/businessCatalog'
import { BUSINESS_SCHOOLS } from './demo/businessGuides'
import { HEALTH } from './demo/healthCatalog'
import { HUMANITIES } from './demo/humanitiesCatalog'
import { SCIENCES } from './demo/sciencesCatalog'
import { TECHNOLOGY } from './demo/technologyCatalog'
import { EDUCATION } from './demo/educationCatalog'
import { ENGINEERING } from './demo/engineeringCatalog'
import { OIL_MINING } from './demo/oilMiningCatalog'
import { AGRICULTURE } from './demo/agricultureCatalog'
import { LOGISTICS } from './demo/logisticsCatalog'
import { HOSPITALITY } from './demo/hospitalityCatalog'
import { TRADE_CENTRES } from './demo/tradeCareers'
import { FIGURES } from './demo/figures'
import { NEWS } from './demo/news'
import { SCHOLARSHIPS } from './demo/scholarships'
import { INTERNSHIPS } from './demo/internships'
import { FREE_COURSES } from './demo/freeCourses'
import { ADMISSIONS } from './demo/admissions'
import { PROGRAMS } from './demo/programs'
import { TESTIMONIALS } from './demo/testimonials'
import { catalogCourses } from '../domain/courses'
import { careerTraits } from '../domain/recommend'
import type { Locale } from '../lib/i18n'
import type {
  CareerTraits,
  Academy,
  Admission,
  AssessmentQuestion,
  Career,
  CareerSummary,
  CatalogCourse,
  Company,
  CvExample,
  EducationStats,
  EmploymentStats,
  Figure,
  FreeCourse,
  JobMarket,
  NewsItem,
  Program,
  PublicCard,
  Scholarship,
  Internship,
  Skill,
  SupportProgram,
  Testimonial,
} from './types'

// Where the app's content comes from. Each function matches one /api/v1 endpoint (docs/arquitetura.md, section 6)
// and returns the same types from both sources. VITE_DATA_SOURCE=api reads the Laravel API; anything else (the
// default, `demo`) uses the demo data bundled with the app (docs/decisoes/0005). In API mode a failed request is
// an error the screen shows: it never falls back to the demo data.
const FROM_API = import.meta.env.VITE_DATA_SOURCE === 'api'

const DETAILED = new Set(CAREERS.map((career) => career.slug))

/** A detail the API answers with 404 (it does not exist, or is not published) is null, as in the demo. */
async function orNull<T>(request: Promise<T>): Promise<T | null> {
  try {
    return await request
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null
    throw error
  }
}

/** A read of the content, with the photos pointing to this build (data/assets.ts). */
const read = async <T>(route: string, init?: RequestInit): Promise<T> =>
  withBuiltAssets(await api<T>(route, init))

const path = (base: string, slug: string) => `${base}/${encodeURIComponent(slug)}`
/** A detail (null = 404). No slug is no record: `/occupations/` would be the whole list. */
const detail = <T>(base: string, slug: string): Promise<T | null> =>
  slug ? orNull(read<T>(path(base, slug))) : Promise.resolve(null)

const ofCareer = (careerSlug?: string) => (careerSlug ? `?occupation=${encodeURIComponent(careerSlug)}` : '')

/** GET /occupations — `detailed` says whether the full page is already curated. */
export async function listCareers(): Promise<CareerSummary[]> {
  if (FROM_API) return read('/occupations')
  return CAREER_SUMMARIES.map((career) => Object.assign({}, career, { detailed: DETAILED.has(career.slug) }))
}

/** GET /public-cards/{slug} (null = 404 or switched off): the one thing that needs a real server. */
export function getPublicCard(slug: string): Promise<PublicCard | null> {
  return orNull(api<PublicCard>(path('/public-cards', slug)))
}

/** POST /public-cards: the secret comes back once and only this device keeps it. */
export function createPublicCard(card: PublicCard): Promise<{ slug: string; secret: string }> {
  return api('/public-cards', { method: 'POST', body: JSON.stringify(card) })
}

const ownerHeaders = (secret: string) => ({ Authorization: `Bearer ${secret}` })

/** PUT /public-cards/{slug} */
export function updatePublicCard(slug: string, secret: string, card: PublicCard): Promise<PublicCard> {
  return api(`/public-cards/${encodeURIComponent(slug)}`, {
    method: 'PUT',
    headers: ownerHeaders(secret),
    body: JSON.stringify(card),
  })
}

/** DELETE /public-cards/{slug}: the link stops working at once. */
export function deletePublicCard(slug: string, secret: string): Promise<void> {
  return api(`/public-cards/${encodeURIComponent(slug)}`, { method: 'DELETE', headers: ownerHeaders(secret) })
}

/** POST /interviews: the answers go to the Kayé team, who review them and get in touch. */
export function sendInterview(interview: InterviewSubmission): Promise<{ id: string }> {
  return api('/interviews', { method: 'POST', body: JSON.stringify(interview) })
}

/**
 * The curated careers in the order of the careers list, the order the backend keeps (`position`): the lists made
 * from them come out the same from both sources.
 */
const CURATED = CAREER_SUMMARIES.flatMap(({ slug }) => CAREERS.find((career) => career.slug === slug) ?? [])

/** GET /skills: each skill once, whichever careers ask for it (as the last of them names it). */
export async function listSkills(): Promise<Skill[]> {
  if (FROM_API) return read('/skills')
  const skills = new Map(CURATED.flatMap((career) => career.skills).map((skill) => [skill.id, skill]))
  return [...skills.values()]
}

// Where each career is taught: the demo programmes and the real catalogue's courses. A function, because
// COURSES is defined further down.
const places = () => [
  ...PROGRAMS.map((program) => ({
    careers: program.careers,
    province: program.institution.province,
    online: program.schedule.includes('online') || program.institution.type === 'online',
  })),
  ...COURSES.flatMap((course) =>
    course.offers.map(({ academy }) => ({
      careers: course.careers,
      province: academy.province,
      online: academy.type === 'online',
    })),
  ),
]

/** GET /occupations?fields=traits: the curated careers, in what the recommendation weighs. */
export async function listCareerTraits(): Promise<CareerTraits[]> {
  if (FROM_API) return read('/occupations?fields=traits')
  const taught = places()
  return CURATED.map((career) => careerTraits(career, taught))
}

/** GET /occupations/{slug} (null = 404) */
export async function getCareer(slug: string): Promise<Career | null> {
  if (FROM_API) return detail<Career>('/occupations', slug)
  const career = CAREERS.find((item) => item.slug === slug)
  if (!career) return null
  const selfEmployment = SELF_EMPLOYMENT[slug]
  return selfEmployment ? { ...career, selfEmployment } : career
}

/** GET /support-programs: real programmes for starting on one's own (registration, kits, credit, incubation). */
export async function listSupportPrograms(): Promise<SupportProgram[]> {
  if (FROM_API) return read('/support-programs')
  return SUPPORT_PROGRAMS
}

/** GET /programs?occupation= */
export async function listPrograms(careerSlug?: string): Promise<Program[]> {
  if (FROM_API) return read(`/programs${ofCareer(careerSlug)}`)
  return careerSlug ? PROGRAMS.filter((program) => program.careers.includes(careerSlug)) : PROGRAMS
}

/** GET /institutions — real ones, with public facts only. */
/**
 * The curated institutions and companies, and those of each area of the catalogue (health, business, humanities,
 * sciences, education and the five after it), with the courses their decrees create and approve (ADR 0011).
 */
const AREA_ACADEMIES = withAreas(
  [
    ...ACADEMIES,
    SPECIALISATION_INSTITUTE,
    PMI_ANGOLA,
    ...OIL_ACADEMIES,
    ...HEALTH_SCHOOLS,
    ...LUANDA_MIDDLE_SCHOOLS,
    ...BUSINESS_SCHOOLS,
    ...CERTIFICATION_CENTRES,
    ...TRADE_CENTRES,
  ],
  [
    TECHNOLOGY.academies,
    HEALTH.academies,
    BUSINESS.academies,
    HUMANITIES.academies,
    SCIENCES.academies,
    EDUCATION.academies,
    ENGINEERING.academies,
    OIL_MINING.academies,
    AGRICULTURE.academies,
    LOGISTICS.academies,
    HOSPITALITY.academies,
  ],
)
const ALL_ACADEMIES = withShowcase(
  withContacts(withImages(withFees(withDecrees(AREA_ACADEMIES, HEALTH_COURSE_DECREES)))),
)
// Built on first use, not at load: the profiles read the careers, which load the companies in a cycle.
let allCompanies: Company[] | null = null
const companies = (): Company[] =>
  (allCompanies ??= withProfiles(
    withoutRepeats([
      ...COMPANIES,
      ...HEALTH.companies,
      ...BUSINESS.companies,
      ...HUMANITIES.companies,
      ...SCIENCES.companies,
      ...EDUCATION.companies,
      ...ENGINEERING.companies,
      ...OIL_MINING.companies,
      ...AGRICULTURE.companies,
      ...LOGISTICS.companies,
      ...HOSPITALITY.companies,
      ...PROJECT_COMPANIES,
      ...OFFSHORE_COMPANIES,
      ...ENGINEERING_COMPANIES,
      ...EDUCATION_COMPANIES,
      ...LEGAL_COMPANIES,
      ...PUBLIC_COMPANIES,
      ...SCIENCES_COMPANIES,
      ...COMMUNICATION_COMPANIES,
      ...LAST_AREAS_COMPANIES,
    ]),
  ))

export async function listAcademies(): Promise<Academy[]> {
  if (FROM_API) return read('/institutions')
  return ALL_ACADEMIES
}

/** GET /institutions/{id} (null = 404) */
export async function getAcademy(id: string): Promise<Academy | null> {
  if (FROM_API) return detail<Academy>('/institutions', id)
  return ALL_ACADEMIES.find((academy) => academy.id === id) ?? null
}

const COURSES = catalogCourses(ALL_ACADEMIES)

/** GET /courses — every real course, with its offer at each institution. */
export async function listCourses(): Promise<CatalogCourse[]> {
  if (FROM_API) return read('/courses')
  return COURSES
}

/** GET /courses/{id} (null = 404) */
export async function getCourse(id: string): Promise<CatalogCourse | null> {
  if (FROM_API) return detail<CatalogCourse>('/courses', id)
  return COURSES.find((course) => course.id === id) ?? null
}

/** GET /companies — real ones, with public facts only. */
export async function listCompanies(): Promise<Company[]> {
  if (FROM_API) return read('/companies')
  return companies()
}

/** GET /companies/{id} (null = 404) */
export async function getCompany(id: string): Promise<Company | null> {
  if (FROM_API) return detail<Company>('/companies', id)
  return companies().find((company) => company.id === id) ?? null
}

/** GET /market/jobs — counted from Angolan job sites. A separate file, loaded only when Mercado opens. */
export async function getJobMarket(): Promise<JobMarket> {
  if (FROM_API) return read('/market/jobs')
  return (await import('./market/jobs.json')).default as JobMarket
}

/** GET /market/education — graduates per course and area, from the official yearbooks. */
export async function getEducation(): Promise<EducationStats> {
  if (FROM_API) return read('/market/education')
  return (await import('./market/education.json')).default as EducationStats
}

/** GET /market/employment — unemployment by age, from INE's employment survey. */
export async function getEmployment(): Promise<EmploymentStats> {
  if (FROM_API) return read('/market/employment')
  return (await import('./market/employment.json')).default as EmploymentStats
}

/** GET /news — newest first. */
export async function listNews(): Promise<NewsItem[]> {
  if (FROM_API) return read('/news')
  return NEWS
}

/** GET /scholarships */
export async function listScholarships(): Promise<Scholarship[]> {
  if (FROM_API) return read('/scholarships')
  return SCHOLARSHIPS
}

/** GET /internships */
export async function listInternships(): Promise<Internship[]> {
  if (FROM_API) return read('/internships')
  return INTERNSHIPS
}

/** GET /free-courses?occupation= */
export async function listFreeCourses(careerSlug?: string): Promise<FreeCourse[]> {
  if (FROM_API) return read(`/free-courses${ofCareer(careerSlug)}`)
  return careerSlug ? FREE_COURSES.filter((course) => course.careerSlugs.includes(careerSlug)) : FREE_COURSES
}

/** GET /admissions */
export async function listAdmissions(): Promise<Admission[]> {
  if (FROM_API) return read('/admissions')
  return ADMISSIONS
}

/** GET /figures */
export async function listFigures(): Promise<Figure[]> {
  if (FROM_API) return read('/figures')
  return FIGURES
}

/** GET /assessment, in the language of Accept-Language. */
export async function getAssessment(locale: Locale = 'pt'): Promise<AssessmentQuestion[]> {
  if (FROM_API) return read('/assessment', { headers: { 'Accept-Language': locale } })
  return questions(locale)
}

/** GET /occupations/{slug}/cv-examples, or all of them */
export async function listCvExamples(careerSlug?: string): Promise<CvExample[]> {
  if (FROM_API) return read(careerSlug ? `${path('/occupations', careerSlug)}/cv-examples` : '/cv-examples')
  return careerSlug ? CV_EXAMPLES.filter((example) => example.careerSlug === careerSlug) : CV_EXAMPLES
}

/** GET /occupations/{slug}/testimonials, or all of them */
export async function listTestimonials(careerSlug?: string): Promise<Testimonial[]> {
  if (FROM_API) return read(careerSlug ? `${path('/occupations', careerSlug)}/testimonials` : '/testimonials')
  return careerSlug ? TESTIMONIALS.filter((item) => item.careerSlug === careerSlug) : TESTIMONIALS
}
