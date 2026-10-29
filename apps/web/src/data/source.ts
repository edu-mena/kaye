import { ACADEMIES } from './demo/academies'
import { QUESTIONS } from './demo/assessment'
import { CAREER_SUMMARIES, CAREERS } from './demo/careers'
import { COMPANIES } from './demo/companies'
import { CV_EXAMPLES } from './demo/cvExamples'
import { withAreas } from './demo/areaCatalog'
import { BUSINESS } from './demo/businessCatalog'
import { HEALTH } from './demo/healthCatalog'
import { HUMANITIES } from './demo/humanitiesCatalog'
import { SCIENCES } from './demo/sciencesCatalog'
import { NEWS } from './demo/news'
import { PROGRAMS } from './demo/programs'
import type {
  Academy,
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
/** The curated institutions and companies, and those of each area of the catalogue (health, business, humanities, sciences). */
const ALL_ACADEMIES = withAreas(ACADEMIES, [
  HEALTH.academies,
  BUSINESS.academies,
  HUMANITIES.academies,
  SCIENCES.academies,
])
const ALL_COMPANIES = [
  ...COMPANIES,
  ...HEALTH.companies,
  ...BUSINESS.companies,
  ...HUMANITIES.companies,
  ...SCIENCES.companies,
]

export async function listAcademies(): Promise<Academy[]> {
  return ALL_ACADEMIES
}

/** GET /institutions/{id} (null = 404) */
export async function getAcademy(id: string): Promise<Academy | null> {
  return ALL_ACADEMIES.find((academy) => academy.id === id) ?? null
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
