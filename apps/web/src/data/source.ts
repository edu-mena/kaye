import type { InterviewSubmission } from '../domain/interviews'
import { api, ApiError } from '../lib/api'
import { withBuiltAssets } from './assets'
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
// default, `demo`) uses the demo data bundled with the app (docs/decisoes/0005), kept in source.demo.ts. In API
// mode a failed request is an error the screen shows: it never falls back to the demo data. The demo module is
// imported only when the source is not the API, so the production build leaves it (and its 1.8 MB) out.
const FROM_API = import.meta.env.VITE_DATA_SOURCE === 'api'

// In demo mode the module loads with this one (as the static imports did, before the screens ask); with the API,
// `FROM_API` is a constant the build folds away, so the import goes with it.
const demoModule = FROM_API ? undefined : await import('./source.demo')
const demo = () => demoModule as typeof import('./source.demo')

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
  return demo().listCareers()
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

/** GET /skills: each skill once, whichever careers ask for it (as the last of them names it). */
export async function listSkills(): Promise<Skill[]> {
  if (FROM_API) return read('/skills')
  return demo().listSkills()
}

/** GET /occupations?fields=traits: the curated careers, in what the recommendation weighs. */
export async function listCareerTraits(): Promise<CareerTraits[]> {
  if (FROM_API) return read('/occupations?fields=traits')
  return demo().listCareerTraits()
}

/** GET /occupations/{slug} (null = 404) */
export async function getCareer(slug: string): Promise<Career | null> {
  if (FROM_API) return detail<Career>('/occupations', slug)
  return demo().getCareer(slug)
}

/** GET /support-programs: real programmes for starting on one's own (registration, kits, credit, incubation). */
export async function listSupportPrograms(): Promise<SupportProgram[]> {
  if (FROM_API) return read('/support-programs')
  return demo().listSupportPrograms()
}

/** GET /programs?occupation= */
export async function listPrograms(careerSlug?: string): Promise<Program[]> {
  if (FROM_API) return read(`/programs${ofCareer(careerSlug)}`)
  return demo().listPrograms(careerSlug)
}

/** GET /institutions — real ones, with public facts only. */
export async function listAcademies(): Promise<Academy[]> {
  if (FROM_API) return read('/institutions')
  return demo().listAcademies()
}

/** GET /institutions/{id} (null = 404) */
export async function getAcademy(id: string): Promise<Academy | null> {
  if (FROM_API) return detail<Academy>('/institutions', id)
  return demo().getAcademy(id)
}

/** GET /courses — every real course, with its offer at each institution. */
export async function listCourses(): Promise<CatalogCourse[]> {
  if (FROM_API) return read('/courses')
  return demo().listCourses()
}

/** GET /courses/{id} (null = 404) */
export async function getCourse(id: string): Promise<CatalogCourse | null> {
  if (FROM_API) return detail<CatalogCourse>('/courses', id)
  return demo().getCourse(id)
}

/** GET /companies — real ones, with public facts only. */
export async function listCompanies(): Promise<Company[]> {
  if (FROM_API) return read('/companies')
  return demo().listCompanies()
}

/** GET /companies/{id} (null = 404) */
export async function getCompany(id: string): Promise<Company | null> {
  if (FROM_API) return detail<Company>('/companies', id)
  return demo().getCompany(id)
}

/** GET /market/jobs — counted from Angolan job sites. A separate file, loaded only when Mercado opens. */
export async function getJobMarket(): Promise<JobMarket> {
  if (FROM_API) return read('/market/jobs')
  return demo().getJobMarket()
}

/** GET /market/education — graduates per course and area, from the official yearbooks. */
export async function getEducation(): Promise<EducationStats> {
  if (FROM_API) return read('/market/education')
  return demo().getEducation()
}

/** GET /market/employment — unemployment by age, from INE's employment survey. */
export async function getEmployment(): Promise<EmploymentStats> {
  if (FROM_API) return read('/market/employment')
  return demo().getEmployment()
}

/** GET /news — newest first. */
export async function listNews(): Promise<NewsItem[]> {
  if (FROM_API) return read('/news')
  return demo().listNews()
}

/** GET /scholarships */
export async function listScholarships(): Promise<Scholarship[]> {
  if (FROM_API) return read('/scholarships')
  return demo().listScholarships()
}

/** GET /internships */
export async function listInternships(): Promise<Internship[]> {
  if (FROM_API) return read('/internships')
  return demo().listInternships()
}

/** GET /free-courses?occupation= */
export async function listFreeCourses(careerSlug?: string): Promise<FreeCourse[]> {
  if (FROM_API) return read(`/free-courses${ofCareer(careerSlug)}`)
  return demo().listFreeCourses(careerSlug)
}

/** GET /admissions */
export async function listAdmissions(): Promise<Admission[]> {
  if (FROM_API) return read('/admissions')
  return demo().listAdmissions()
}

/** GET /figures */
export async function listFigures(): Promise<Figure[]> {
  if (FROM_API) return read('/figures')
  return demo().listFigures()
}

/** GET /assessment, in the language of Accept-Language. */
export async function getAssessment(locale: Locale = 'pt'): Promise<AssessmentQuestion[]> {
  if (FROM_API) return read('/assessment', { headers: { 'Accept-Language': locale } })
  return demo().getAssessment(locale)
}

/** GET /occupations/{slug}/cv-examples, or all of them */
export async function listCvExamples(careerSlug?: string): Promise<CvExample[]> {
  if (FROM_API) return read(careerSlug ? `${path('/occupations', careerSlug)}/cv-examples` : '/cv-examples')
  return demo().listCvExamples(careerSlug)
}

/** GET /occupations/{slug}/testimonials, or all of them */
export async function listTestimonials(careerSlug?: string): Promise<Testimonial[]> {
  if (FROM_API) return read(careerSlug ? `${path('/occupations', careerSlug)}/testimonials` : '/testimonials')
  return demo().listTestimonials(careerSlug)
}
