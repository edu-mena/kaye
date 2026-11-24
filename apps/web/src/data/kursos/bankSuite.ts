import { describe, expect, it } from 'vitest'
import type { Exercise } from '../../domain/exercises/types'
import type { TopicMeta } from './topicCourse'
import type { ExamQuestion, UnitContent } from './types'

// Integrity of a topic course's bank, shared by the course tests: every written topic has 8 or more exercises, each
// one is well formed for any seed, has a source, and has exactly one right option when it is a choice. Problems are
// collected as text so the failure says which exercise broke.

const SEEDS = Array.from({ length: 12 }, (_, at) => `2026-11-${10 + at}|device-${at}`)

/** What is wrong with this exercise, in words; an empty list means it is well formed. */
function problems(exercise: Exercise, topic: string): string[] {
  const found: string[] = []
  const wrong = (condition: boolean, text: string) => {
    if (condition) found.push(`${exercise.id}: ${text}`)
  }
  wrong(exercise.topic !== topic, 'wrong topic')
  wrong(exercise.source === '' || exercise.prompt === '', 'empty source or prompt')
  if (exercise.kind === 'choice') {
    const right = exercise.options.filter((_, at) => exercise.check(at).correct)
    wrong(right.length !== 1, 'not exactly one right option')
    wrong(new Set(exercise.options).size !== exercise.options.length, 'repeated options')
    wrong(exercise.check(null).correct, 'null is right')
  }
  if (exercise.kind === 'numeric') wrong(exercise.check(null).correct, 'nothing is right')
  if (exercise.kind === 'entries') wrong(exercise.check([]).correct, 'an empty entry is right')
  if (exercise.kind === 'output') {
    wrong(exercise.code.trim() === '', 'empty code')
    wrong(exercise.check('  ').correct, 'blank is right')
    wrong(exercise.check('resposta que nao existe').correct, 'nonsense is right')
  }
  if (exercise.kind === 'fill') {
    wrong(exercise.template.split('___').length !== exercise.blanks + 1, 'blanks do not match the template')
    wrong(exercise.check(Array<string>(exercise.blanks).fill('')).correct, 'empty blanks are right')
  }
  if (exercise.kind === 'order') wrong(exercise.lines.length < 3, 'fewer than 3 lines')
  if (exercise.kind === 'case') {
    wrong(
      exercise.decisions.filter((_, at) => exercise.check(at).correct).length !== 1,
      'not exactly one best',
    )
  }
  return found
}

type Files = Record<string, () => Promise<{ default: UnitContent }>>

export function describeBank(
  name: string,
  files: Files,
  topics: TopicMeta[],
  loadExam: () => Promise<ExamQuestion[]>,
) {
  const written = Object.keys(files)
    .map((path) => /t\d\d/.exec(path)?.[0] ?? '')
    .toSorted()

  describe(`${name} bank`, () => {
    it('has only topics that exist in the list, in a contiguous run from t01', () => {
      expect(written.length).toBeGreaterThan(0)
      expect(written).toEqual(topics.slice(0, written.length).map((topic) => topic.id))
    })

    it.each(written)('%s: 8+ well-formed exercises, a source and a review of 3', async (id) => {
      const unit = (await files[`./${id}.ts`]?.())?.default
      const review = unit?.review[0]
      const items = review?.kind === 'choice' ? review.items : []
      const issues: string[] = []
      if ((unit?.bank?.length ?? 0) < 8) issues.push('fewer than 8 exercises in the bank')
      if (items.length !== 3) issues.push('the review does not have 3 questions')
      for (const item of items) {
        if (item.options[item.answer] === undefined)
          issues.push(`review: answer out of range in "${item.prompt}"`)
        if (new Set(item.options).size !== item.options.length)
          issues.push(`review: repeated options in "${item.prompt}"`)
      }
      for (const seed of SEEDS) {
        const exercises = (unit?.bank ?? []).map((make) => make(seed))
        issues.push(...exercises.flatMap((exercise) => problems(exercise, id)))
        const ids = exercises.map((exercise) => exercise.id)
        if (new Set(ids).size !== ids.length) issues.push(`repeated ids with seed ${seed}`)
      }
      expect(issues).toEqual([])
    })

    it('builds the exam from the reviews: 3 questions per topic, unique ids, valid answers', async () => {
      const questions = await loadExam()
      expect(questions).toHaveLength(written.length * 3)
      expect(new Set(questions.map((question) => question.id)).size).toBe(questions.length)
      const broken = questions.filter(
        (question) => question.kind === 'choice' && !question.options[question.answer],
      )
      expect(broken).toEqual([])
    })
  })
}
