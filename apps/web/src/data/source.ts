import { QUESTIONS } from './demo/assessment'
import { CAREER_SUMMARIES, CAREERS } from './demo/careers'
import { CV_EXAMPLES } from './demo/cvExamples'
import { PROGRAMS } from './demo/programs'
import type { AssessmentQuestion, Career, CareerSummary, CvExample, Program } from './types'

/**
 * Where the app's content comes from. Today: demo data bundled with the app,
 * so the frontend can be built before the API (docs/decisoes/0005). Each function
 * matches one /api/v1 endpoint; switching to the API changes only this file.
 */
export const DATA_SOURCE: 'demo' | 'api' = 'demo'

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

/** GET /assessment */
export async function getAssessment(): Promise<AssessmentQuestion[]> {
  return QUESTIONS
}

/** GET /occupations/{slug}/cv-examples, or all of them */
export async function listCvExamples(careerSlug?: string): Promise<CvExample[]> {
  return careerSlug ? CV_EXAMPLES.filter((example) => example.careerSlug === careerSlug) : CV_EXAMPLES
}
