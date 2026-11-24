// Kursos: short courses written like a technical textbook (docs/decisoes/0016).
// Course > Unit > Lesson > Block. Explanations in Portuguese. In a language course, examples and
// exercises are in the language taught; in any other course they are short Angolan cases, in
// Portuguese. Each unit lives in its own file and downloads when opened.

import type { Exercise } from '../../domain/exercises/types'

export type ChoiceItem = { prompt: string; options: string[]; /** Index in `options`. */ answer: number }
/** `prompt` has one "___" for the gap; any of `answers` is right (see domain/kursos.ts). */
export type GapItem = { prompt: string; answers: string[] }
export type MatchItem = { left: string; right: string }
/** `words` in a shuffled order; `answer` is the sentence they make. */
export type OrderItem = { words: string[]; answer: string }

export type ExerciseBlock = { type: 'exercise'; id: string; instruction: string } & (
  | { kind: 'choice'; items: ChoiceItem[] }
  | { kind: 'gap'; items: GapItem[] }
  | { kind: 'match'; items: MatchItem[] }
  | { kind: 'order'; items: OrderItem[] }
)

export type Block =
  | { type: 'text'; title?: string; body: string[] }
  | { type: 'rule'; title: string; body: string }
  | { type: 'table'; caption?: string; head: string[]; rows: string[][] }
  /** `text` is the example (a sentence, or a short case); `note` its translation or a comment. */
  | { type: 'examples'; title?: string; items: { text: string; note?: string }[] }
  /** A worked case study, longer than an example. */
  | { type: 'case'; title: string; body: string[] }
  /** A code listing, shown as written (no colours, never run in the browser). */
  | { type: 'code'; caption?: string; language: string; code: string }
  | ExerciseBlock
  /** An exercise from the engine: make gets the day's seed (domain/exercises), so the numbers change. */
  | { type: 'practice'; id: string; make: (seed: string) => Exercise }
  | { type: 'summary'; points: string[] }

type Lesson = { id: string; title: string; estimatedMinutes: number; blocks: Block[] }

/** The written part of a unit: its lessons and the review that closes it, with a grade. */
export type UnitContent = {
  lessons: Lesson[]
  review: ExerciseBlock[]
  /** Engine exercises of the topic (8 or more) for training and the exam; the lesson shows the first ones. */
  bank?: ((seed: string) => Exercise)[]
}

export type Unit = {
  id: string
  number: number
  title: string
  summary: string
  /** Absent while the unit is not written yet ("Em breve"). */
  load?: () => Promise<UnitContent>
  /** Shown in the roadmap without downloading the unit. */
  lessons?: { id: string; title: string; estimatedMinutes: number }[]
}

/** One question of the final exam: a single choice or a single gap. */
export type ExamQuestion = { id: string; unit: string } & (
  ({ kind: 'choice' } & ChoiceItem) | ({ kind: 'gap' } & GapItem)
)

type Credit = { title: string; author: string; license: string; url: string; use: string }

/** A course's icon: names from components/icons (data/ does not import UI). */
export type CourseIcon =
  'globe' | 'briefcase' | 'target' | 'chart' | 'wallet' | 'code' | 'book' | 'shield' | 'megaphone' | 'server'

/** The colour behind a course's icon. */
export type CourseTone = 'blue' | 'gold' | 'coral' | 'night' | 'success'

export type Course = {
  id: string
  title: string
  /** Free text: "A1 (QECR)" for a language, "Iniciante" otherwise. */
  level: string
  /** BCP 47 code of the examples and exercises ("en" in English A1, "pt" otherwise). */
  lang: string
  icon: CourseIcon
  tone: CourseTone
  subtitle: string
  audience: string
  goals: string[]
  units: Unit[]
  loadExam: () => Promise<ExamQuestion[]>
  credits: Credit[]
}

/** A course announced as "Em breve": shown in the catalogue, not written yet. */
export type AnnouncedCourse = { id: string; title: string; body: string; icon: CourseIcon }
