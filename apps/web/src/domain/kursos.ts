import { courseSteps, stepKey } from '../data/kursos'
import type { Course, ExamQuestion, ExerciseBlock } from '../data/kursos/types'

export const EXAM_SIZE = 20
export const EXAM_PASS = 0.7
export const EXAM_RETRY_MS = 60 * 60 * 1000

const CONTRACTIONS: [RegExp, string][] = [
  [/\bwon't\b/g, 'will not'],
  [/\bcan't\b/g, 'cannot'],
  [/n't\b/g, ' not'],
  [/'m\b/g, ' am'],
  [/'re\b/g, ' are'],
  [/'ve\b/g, ' have'],
  [/'ll\b/g, ' will'],
]

/**
 * What a typed answer means, whatever the case, spacing, apostrophe or contraction:
 * "They’re  NOT" and "they are not" are the same answer. The possessive 's is kept.
 */
export function normalizeAnswer(text: string): string {
  let result = text
    .toLowerCase()
    .replace(/[‘’ʼ`´]/g, "'")
    .replace(/\s+'/g, "'")
    .replace(/[.!?,;:]+$/g, '')
    .trim()
  for (const [pattern, replacement] of CONTRACTIONS) result = result.replace(pattern, replacement)
  return result.replace(/\s+/g, ' ').trim()
}

export const gapMatches = (typed: string, answers: string[]) =>
  answers.some((answer) => normalizeAnswer(answer) === normalizeAnswer(typed))

/** One answer per item: the option index (choice), the text (gap, order) or the chosen right side (match). */
export type Answer = number | string | null

export function itemCorrect(block: ExerciseBlock, index: number, answer: Answer): boolean {
  if (answer === null) return false
  switch (block.kind) {
    case 'choice':
      return block.items[index]?.answer === answer
    case 'gap':
      return gapMatches(String(answer), block.items[index]?.answers ?? [])
    case 'match':
      return block.items[index]?.right === answer
    case 'order':
      return normalizeAnswer(String(answer)) === normalizeAnswer(block.items[index]?.answer ?? '')
  }
}

/** The right answer, as the answer key shows it. */
export function itemKey(block: ExerciseBlock, index: number): string {
  switch (block.kind) {
    case 'choice': {
      const item = block.items[index]
      return item ? (item.options[item.answer] ?? '') : ''
    }
    case 'gap':
      return block.items[index]?.answers.join(' / ') ?? ''
    case 'match':
      return block.items[index]?.right ?? ''
    case 'order':
      return block.items[index]?.answer ?? ''
  }
}

export const examCorrect = (question: ExamQuestion, answer: Answer) =>
  question.kind === 'choice'
    ? question.answer === answer
    : answer !== null && gapMatches(String(answer), question.answers)

export function shuffle<T>(list: T[]): T[] {
  const copy = [...list]
  for (let index = copy.length - 1; index > 0; index--) {
    const other = Math.floor(Math.random() * (index + 1))
    ;[copy[index], copy[other]] = [copy[other] as T, copy[index] as T]
  }
  return copy
}

/** A fresh exam: questions only from the units that are written. */
export function drawExam(course: Course, bank: ExamQuestion[]): ExamQuestion[] {
  const written = new Set(course.units.filter((unit) => unit.load).map((unit) => unit.id))
  return shuffle(bank.filter((question) => written.has(question.unit))).slice(0, EXAM_SIZE)
}

/** Share right per unit, for the certificate page. */
export function scoreByUnit(questions: ExamQuestion[], answers: Answer[]): Record<string, number> {
  const totals: Record<string, { right: number; all: number }> = {}
  questions.forEach((question, index) => {
    const total = (totals[question.unit] ??= { right: 0, all: 0 })
    total.all++
    if (examCorrect(question, answers[index] ?? null)) total.right++
  })
  return Object.fromEntries(Object.entries(totals).map(([unit, { right, all }]) => [unit, right / all]))
}

export type CourseState = { done: number; total: number; share: number; unitsDone: boolean }

export function courseState(course: Course, done: string[]): CourseState {
  const steps = courseSteps(course).map(stepKey)
  const finished = steps.filter((step) => done.includes(step)).length
  return {
    done: finished,
    total: steps.length,
    share: steps.length ? finished / steps.length : 0,
    unitsDone: finished === steps.length,
  }
}

/** When a failed attempt allows the next one (null: now). */
export function nextAttemptAt(attempts: { at: string; score: number }[], now = Date.now()): number | null {
  const last = attempts[0]
  if (!last || last.score >= EXAM_PASS) return null
  const at = Date.parse(last.at) + EXAM_RETRY_MS
  return at > now ? at : null
}

/** A random code for the certificate, readable aloud: KY-7F3K-Q2MD. */
export function certificateCode(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const bytes = crypto.getRandomValues(new Uint8Array(8))
  const chars = [...bytes].map((byte) => alphabet[byte % alphabet.length]).join('')
  return `KY-${chars.slice(0, 4)}-${chars.slice(4)}`
}

export const formatMinutes = (seconds: number) => Math.max(0, Math.round(seconds / 60))
