import { AREA_QUESTIONS, GENERAL_QUESTIONS, type InterviewQuestion } from '../data/demo/interviews'
import type { MarketArea } from '../data/types'
import { seeded, shuffle } from './psychotech'

// Interview practice (value offer, point 2.2.1): no AI. A session is 2 general questions and 4 of
// the area, picked with a seed; the answers go to the Kayé team, who review them and get in touch.

export const GENERAL_COUNT = 2
export const AREA_COUNT = 4
export const THINK_SECONDS = 30
export const ANSWER_SECONDS = 120
/** Each one is read by a person: two a day keeps the reviews possible. */
export const INTERVIEWS_PER_DAY = 2

/** Six questions: two general ones first, then four of the area. */
export function buildInterview(area: MarketArea, seed: number): InterviewQuestion[] {
  const random = seeded(seed)
  return [
    ...shuffle(random, GENERAL_QUESTIONS).slice(0, GENERAL_COUNT),
    ...shuffle(random, AREA_QUESTIONS[area]).slice(0, AREA_COUNT),
  ]
}

/** How many interviews were sent on the same local day as `now`. */
export function sentToday(sent: { at: string }[], now = new Date()): number {
  const day = now.toDateString()
  return sent.filter((entry) => new Date(entry.at).toDateString() === day).length
}

export type InterviewAnswer = {
  questionId: string
  question: string
  answer: string
  /** How long the person took to answer. */
  seconds: number
  /** Whether any of it came from the voice dictation. */
  dictated: boolean
}

/** What POST /interviews receives: the person, the interview and every answer. */
export type InterviewSubmission = {
  area: MarketArea
  /** The profession, when the interview was built from one. */
  career?: { slug: string; name: string }
  locale: string
  startedAt: string
  candidate: {
    name: string
    birthYear: number
    province?: string
    education?: string
    contact: string
    guardianInformed: boolean
  }
  answers: InterviewAnswer[]
}
