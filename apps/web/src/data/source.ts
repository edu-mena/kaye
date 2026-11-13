import type { InterviewSubmission } from '../domain/interviews'
import { api, ApiError } from '../lib/api'
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

// Where the app's content comes from. Today: demo data bundled with the app, so the
// frontend can be built before the API (docs/decisoes/0005). Each function matches one
// /api/v1 endpoint; switching to the API changes only this file.

const DETAILED = new Set(CAREERS.map((career) => career.slug))

/** GET /occupations — `detailed` says whether the full page is already curated. */
export async function listCareers(): Promise<CareerSummary[]> {
  return CAREER_SUMMARIES.map((career) => Object.assign({}, career, { detailed: DETAILED.has(career.slug) }))
}

/** GET /public-cards/{slug} (null = 404 or switched off): the one thing that needs a real server. */
export async function getPublicCard(slug: string): Promise<PublicCard | null> {
  try {
    return await api<PublicCard>(`/public-cards/${encodeURIComponent(slug)}`)
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null
    throw error
  }
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

/** GET /skills: each skill once, whichever careers ask for it. */
export async function listSkills(): Promise<Skill[]> {
  const skills = new Map(CAREERS.flatMap((career) => career.skills).map((skill) => [skill.id, skill]))
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
  return CAREERS.map((career) => careerTraits(career, places()))
}

/** GET /occupations/{slug} (null = 404) */
export async function getCareer(slug: string): Promise<Career | null> {
  const career = CAREERS.find((item) => item.slug === slug)
  if (!career) return null
  const selfEmployment = SELF_EMPLOYMENT[slug]
  return selfEmployment ? { ...career, selfEmployment } : career
}

/** GET /support-programs: real programmes for starting on one's own (registration, kits, credit, incubation). */
export async function listSupportPrograms(): Promise<SupportProgram[]> {
  return SUPPORT_PROGRAMS
}

/** GET /programs?occupation= */
export async function listPrograms(careerSlug?: string): Promise<Program[]> {
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
const ALL_ACADEMIES = withContacts(withImages(withFees(withDecrees(AREA_ACADEMIES, HEALTH_COURSE_DECREES))))
const ALL_COMPANIES = withProfiles(
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
)

export async function listAcademies(): Promise<Academy[]> {
  return ALL_ACADEMIES
}

/** GET /institutions/{id} (null = 404) */
export async function getAcademy(id: string): Promise<Academy | null> {
  return ALL_ACADEMIES.find((academy) => academy.id === id) ?? null
}

const COURSES = catalogCourses(ALL_ACADEMIES)

/** GET /courses — every real course, with its offer at each institution. */
export async function listCourses(): Promise<CatalogCourse[]> {
  return COURSES
}

/** GET /courses/{id} (null = 404) */
export async function getCourse(id: string): Promise<CatalogCourse | null> {
  return COURSES.find((course) => course.id === id) ?? null
}

/** GET /companies — real ones, with public facts only. */
export async function listCompanies(): Promise<Company[]> {
  return ALL_COMPANIES
}

/** GET /companies/{id} (null = 404) */
export async function getCompany(id: string): Promise<Company | null> {
  return ALL_COMPANIES.find((company) => company.id === id) ?? null
}

/** GET /market/jobs — counted from Angolan job sites. A separate file, loaded only when Mercado opens. */
export async function getJobMarket(): Promise<JobMarket> {
  return (await import('./market/jobs.json')).default as JobMarket
}

/** GET /market/education — graduates per course and area, from the official yearbooks. */
export async function getEducation(): Promise<EducationStats> {
  return (await import('./market/education.json')).default as EducationStats
}

/** GET /market/employment — unemployment by age, from INE's employment survey. */
export async function getEmployment(): Promise<EmploymentStats> {
  return (await import('./market/employment.json')).default as EmploymentStats
}

/** GET /news — newest first. */
export async function listNews(): Promise<NewsItem[]> {
  return NEWS
}

/** GET /scholarships */
export async function listScholarships(): Promise<Scholarship[]> {
  return SCHOLARSHIPS
}

/** GET /internships */
export async function listInternships(): Promise<Internship[]> {
  return INTERNSHIPS
}

/** GET /free-courses?occupation= */
export async function listFreeCourses(careerSlug?: string): Promise<FreeCourse[]> {
  return careerSlug ? FREE_COURSES.filter((course) => course.careerSlugs.includes(careerSlug)) : FREE_COURSES
}

/** GET /admissions */
export async function listAdmissions(): Promise<Admission[]> {
  return ADMISSIONS
}

/** GET /figures */
export async function listFigures(): Promise<Figure[]> {
  return FIGURES
}

/** GET /assessment, in the language of Accept-Language. */
export async function getAssessment(locale: Locale = 'pt'): Promise<AssessmentQuestion[]> {
  return questions(locale)
}

/** GET /occupations/{slug}/cv-examples, or all of them */
export async function listCvExamples(careerSlug?: string): Promise<CvExample[]> {
  return careerSlug ? CV_EXAMPLES.filter((example) => example.careerSlug === careerSlug) : CV_EXAMPLES
}

/** GET /occupations/{slug}/testimonials, or all of them */
export async function listTestimonials(careerSlug?: string): Promise<Testimonial[]> {
  return careerSlug ? TESTIMONIALS.filter((item) => item.careerSlug === careerSlug) : TESTIMONIALS
}
