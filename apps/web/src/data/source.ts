import { ACADEMIES } from './demo/academies'
import { QUESTIONS } from './demo/assessment'
import { CAREER_SUMMARIES, CAREERS } from './demo/careers'
import { COMPANIES } from './demo/companies'
import { CV_EXAMPLES } from './demo/cvExamples'
import { withAreas, withoutRepeats } from './demo/areaCatalog'
import { withImages } from './demo/academyImages'
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
import { NEWS } from './demo/news'
import { PROGRAMS } from './demo/programs'
import { catalogCourses } from '../domain/courses'
import type {
  Academy,
  CatalogCourse,
  Company,
  AssessmentQuestion,
  Career,
  CareerSummary,
  CvExample,
  EducationStats,
  EmploymentStats,
  JobMarket,
  NewsItem,
  Program,
} from './types'

// Where the app's content comes from. Today: demo data bundled with the app, so the
// frontend can be built before the API (docs/decisoes/0005). Each function matches one
// /api/v1 endpoint; switching to the API changes only this file.

const DETAILED = new Set(CAREERS.map((career) => career.slug))

/** GET /occupations — `detailed` says whether the full page is already curated. */
export async function listCareers(): Promise<CareerSummary[]> {
  return CAREER_SUMMARIES.map((career) => Object.assign({}, career, { detailed: DETAILED.has(career.slug) }))
}

/** GET /occupations/{slug} (null = 404) */
export async function getCareer(slug: string): Promise<Career | null> {
  return CAREERS.find((career) => career.slug === slug) ?? null
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
    ...BUSINESS_SCHOOLS,
    ...CERTIFICATION_CENTRES,
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
const ALL_ACADEMIES = withImages(withDecrees(AREA_ACADEMIES, HEALTH_COURSE_DECREES))
const ALL_COMPANIES = withoutRepeats([
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
])

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

/** GET /assessment */
export async function getAssessment(): Promise<AssessmentQuestion[]> {
  return QUESTIONS
}

/** GET /occupations/{slug}/cv-examples, or all of them */
export async function listCvExamples(careerSlug?: string): Promise<CvExample[]> {
  return careerSlug ? CV_EXAMPLES.filter((example) => example.careerSlug === careerSlug) : CV_EXAMPLES
}
