import { questions } from './demo/assessment'
import { ACADEMIES } from './demo/academies'
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
  Scholarship,
  Internship,
  Skill,
  SupportProgram,
  Testimonial,
} from './types'

// The demo content bundled with the app (docs/decisoes/0005): the same answers as /api/v1, read from the files in
// ./demo. A module of its own, loaded by source.ts only when VITE_DATA_SOURCE is not `api`: the production build
// never reaches it, so the browser does not download what the API already serves.

const DETAILED = new Set(CAREERS.map((career) => career.slug))

export async function listCareers(): Promise<CareerSummary[]> {
  return CAREER_SUMMARIES.map((career) => Object.assign({}, career, { detailed: DETAILED.has(career.slug) }))
}

/**
 * The curated careers in the order of the careers list, the order the backend keeps (`position`): the lists made
 * from them come out the same from both sources.
 */
const CURATED = CAREER_SUMMARIES.flatMap(({ slug }) => CAREERS.find((career) => career.slug === slug) ?? [])

export async function listSkills(): Promise<Skill[]> {
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

export async function listCareerTraits(): Promise<CareerTraits[]> {
  const taught = places()
  return CURATED.map((career) => careerTraits(career, taught))
}

export async function getCareer(slug: string): Promise<Career | null> {
  const career = CAREERS.find((item) => item.slug === slug)
  if (!career) return null
  const selfEmployment = SELF_EMPLOYMENT[slug]
  return selfEmployment ? { ...career, selfEmployment } : career
}

export async function listSupportPrograms(): Promise<SupportProgram[]> {
  return SUPPORT_PROGRAMS
}

export async function listPrograms(careerSlug?: string): Promise<Program[]> {
  return careerSlug ? PROGRAMS.filter((program) => program.careers.includes(careerSlug)) : PROGRAMS
}

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
  return ALL_ACADEMIES
}

export async function getAcademy(id: string): Promise<Academy | null> {
  return ALL_ACADEMIES.find((academy) => academy.id === id) ?? null
}

const COURSES = catalogCourses(ALL_ACADEMIES)

export async function listCourses(): Promise<CatalogCourse[]> {
  return COURSES
}

export async function getCourse(id: string): Promise<CatalogCourse | null> {
  return COURSES.find((course) => course.id === id) ?? null
}

export async function listCompanies(): Promise<Company[]> {
  return companies()
}

export async function getCompany(id: string): Promise<Company | null> {
  return companies().find((company) => company.id === id) ?? null
}

export async function getJobMarket(): Promise<JobMarket> {
  return (await import('./market/jobs.json')).default as JobMarket
}

export async function getEducation(): Promise<EducationStats> {
  return (await import('./market/education.json')).default as EducationStats
}

export async function getEmployment(): Promise<EmploymentStats> {
  return (await import('./market/employment.json')).default as EmploymentStats
}

export async function listNews(): Promise<NewsItem[]> {
  return NEWS
}

export async function listScholarships(): Promise<Scholarship[]> {
  return SCHOLARSHIPS
}

export async function listInternships(): Promise<Internship[]> {
  return INTERNSHIPS
}

export async function listFreeCourses(careerSlug?: string): Promise<FreeCourse[]> {
  return careerSlug ? FREE_COURSES.filter((course) => course.careerSlugs.includes(careerSlug)) : FREE_COURSES
}

export async function listAdmissions(): Promise<Admission[]> {
  return ADMISSIONS
}

export async function listFigures(): Promise<Figure[]> {
  return FIGURES
}

export async function getAssessment(locale: Locale = 'pt'): Promise<AssessmentQuestion[]> {
  return questions(locale)
}

export async function listCvExamples(careerSlug?: string): Promise<CvExample[]> {
  return careerSlug ? CV_EXAMPLES.filter((example) => example.careerSlug === careerSlug) : CV_EXAMPLES
}

export async function listTestimonials(careerSlug?: string): Promise<Testimonial[]> {
  return careerSlug ? TESTIMONIALS.filter((item) => item.careerSlug === careerSlug) : TESTIMONIALS
}
