import type { Locale } from '../lib/i18n'
import { ACCESS_EXAM_BANK } from './demo/accessExams'
import { AREA_QUESTIONS, GENERAL_QUESTIONS } from './demo/interviews'
import { MENTORS } from './demo/mentors'
import { ANALOGIES, NONSENSE_WORDS, SYNONYMS } from './demo/psychotech'
import { VIDEO_STORIES } from './demo/videoStories'
import { ANNOUNCED, KURSOS } from './kursos'
import { PROVINCES } from './provinces'
import * as source from './source'

// The frontend's content as the backend will import it (ADR 0019): every list and detail of source.ts, and the
// modules the app reads directly, per locale. scripts/export-data.ts writes it to apps/api/database/data and
// export.test.ts fails when that copy is out of date. Runs inside Vite (vitest or the script's server), because
// the data uses import.meta.glob and image imports.

// Not lib/i18n's LOCALES: that module reads localStorage and navigator when it loads.
const LOCALES: readonly Locale[] = ['pt', 'en', 'fr']

type Data = readonly unknown[] | Record<string, unknown>

/** The detail endpoints that return the list item as it is: the list file already holds them. */
async function sameAsList<T extends { id: string }>(
  list: T[],
  get: (id: string) => Promise<T | null>,
  name: string,
) {
  const found = await Promise.all(list.map((item) => get(item.id)))
  const differs = list.find((item, at) => found[at] !== item)
  if (differs) throw new Error(`${name}(${differs.id}) differs from its list item`)
}

async function kursos() {
  return Promise.all(
    KURSOS.map(async ({ loadExam, units, ...course }) =>
      Object.assign(course, {
        units: await Promise.all(
          units.map(async ({ load, ...unit }) =>
            load ? Object.assign(unit, { content: await load() }) : unit,
          ),
        ),
        exam: await loadExam(),
      }),
    ),
  )
}

async function resources(locale: Locale): Promise<Record<string, Data>> {
  const careers = await source.listCareers()
  const academies = await source.listAcademies()
  const courses = await source.listCourses()
  const companies = await source.listCompanies()
  await sameAsList(academies, source.getAcademy, 'getAcademy')
  await sameAsList(courses, source.getCourse, 'getCourse')
  await sameAsList(companies, source.getCompany, 'getCompany')
  const details = await Promise.all(
    careers.filter((career) => career.detailed).map(({ slug }) => source.getCareer(slug)),
  )

  return {
    careers: careers,
    'career-details': details.filter((career) => career !== null),
    'career-traits': await source.listCareerTraits(),
    skills: await source.listSkills(),
    'support-programs': await source.listSupportPrograms(),
    programs: await source.listPrograms(),
    institutions: academies,
    courses: courses,
    companies: companies,
    'market-jobs': await source.getJobMarket(),
    'market-education': await source.getEducation(),
    'market-employment': await source.getEmployment(),
    news: await source.listNews(),
    scholarships: await source.listScholarships(),
    internships: await source.listInternships(),
    'free-courses': await source.listFreeCourses(),
    admissions: await source.listAdmissions(),
    figures: await source.listFigures(),
    'assessment-questions': await source.getAssessment(locale),
    'cv-examples': await source.listCvExamples(),
    testimonials: await source.listTestimonials(),
    kursos: await kursos(),
    'kursos-announced': ANNOUNCED,
    'access-exam-questions': Object.values(ACCESS_EXAM_BANK).flat(),
    'interview-questions': [
      ...GENERAL_QUESTIONS.map((question) => Object.assign({}, question, { area: null })),
      ...Object.entries(AREA_QUESTIONS).flatMap(([area, list]) =>
        list.map((question) => Object.assign({}, question, { area })),
      ),
    ],
    psychotech: { analogies: ANALOGIES, synonyms: SYNONYMS, nonsenseWords: NONSENSE_WORDS },
    mentors: MENTORS,
    'video-stories': VIDEO_STORIES,
    provinces: PROVINCES,
  }
}

const key = (record: unknown) => {
  if (typeof record !== 'object' || record === null) return null
  const { slug, id, area } = record as { slug?: unknown; id?: unknown; area?: unknown }
  const own = typeof slug === 'string' ? slug : typeof id === 'string' ? id : null
  return own === null ? null : `${typeof area === 'string' ? area : ''}/${own}`
}

/**
 * Sorted by slug (the id when there is none), so a reordering in the frontend does not rewrite the file; `position`
 * keeps the order the app shows. Lists without ids (provinces) and single objects stay as they are.
 */
function sorted(data: Data): Data {
  if (!Array.isArray(data) || data.length === 0 || data.some((record) => key(record) === null)) return data
  return data
    .map((record, position) => Object.assign({}, record, { position }))
    .toSorted((a, b) => (key(a) as string).localeCompare(key(b) as string, 'en'))
}

export type ExportFile = { resource: string; locale: Locale; name: string; records: number; text: string }

export const serialize = (data: Data) => `${JSON.stringify(sorted(data), null, 2)}\n`

/** Web Crypto, so this module also loads in the browser build's type check (and in Node 22, and in jsdom). */
export async function sha256(text: string) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('')
}

/** Every file of apps/api/database/data, with its text, in a fixed order. */
export async function exportFiles(): Promise<ExportFile[]> {
  const perLocale = await Promise.all(
    LOCALES.map(async (locale) => ({ locale, all: await resources(locale) })),
  )
  return perLocale.flatMap(({ locale, all }) =>
    Object.entries(all).map(([resource, data]) => ({
      resource,
      locale,
      name: `${resource}.${locale}.json`,
      records: Array.isArray(data) ? data.length : 1,
      text: serialize(data),
    })),
  )
}

export type Manifest = Record<
  string,
  Partial<Record<Locale, { file: string; records: number; sha256: string }>>
>

export async function manifest(files: ExportFile[]): Promise<Manifest> {
  const hashes = await Promise.all(files.map((file) => sha256(file.text)))
  const result: Manifest = {}
  files.forEach((file, at) => {
    result[file.resource] = Object.assign(result[file.resource] ?? {}, {
      [file.locale]: { file: file.name, records: file.records, sha256: hashes[at] },
    })
  })
  return result
}
