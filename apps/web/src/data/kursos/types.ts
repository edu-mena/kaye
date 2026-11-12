// Kursos: short courses written like a technical textbook (docs/decisoes/0016).
// Course > Unit > Lesson > Block. Explanations in Portuguese, examples and exercises in the
// language being taught. Each unit lives in its own file and downloads when opened.

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
  | { type: 'examples'; title?: string; items: { en: string; pt: string }[] }
  | ExerciseBlock
  | { type: 'summary'; points: string[] }

export type Lesson = { id: string; title: string; estimatedMinutes: number; blocks: Block[] }

/** The written part of a unit: its lessons and the review that closes it, with a grade. */
export type UnitContent = { lessons: Lesson[]; review: ExerciseBlock[] }

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

export type Credit = { title: string; author: string; license: string; url: string; use: string }

export type Course = {
  id: string
  title: string
  level: string
  subtitle: string
  audience: string
  goals: string[]
  units: Unit[]
  loadExam: () => Promise<ExamQuestion[]>
  credits: Credit[]
}
