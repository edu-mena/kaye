// Practice for the access exams of the public universities: original questions, written by us at the level of
// the official secondary-school programmes (INIDE/MED), never copied from an exam or a study booklet.
// The questions are in Portuguese, the language of the exam. Sources: docs/recolha-de-dados.md.

export const EXAM_SUBJECTS = [
  'matematica',
  'portugues',
  'fisica',
  'quimica',
  'biologia',
  'historia',
  'geografia',
] as const
export type ExamSubject = (typeof EXAM_SUBJECTS)[number]

export const EXAM_TOPICS = {
  matematica: ['algebra', 'funcoes', 'equacoes', 'geometria', 'trigonometria', 'estatistica'],
  portugues: ['interpretacao', 'gramatica', 'ortografia', 'vocabulario'],
  fisica: [],
  quimica: [],
  biologia: [],
  historia: [],
  geografia: [],
} as const satisfies Record<ExamSubject, readonly string[]>

export type ExamTopic = (typeof EXAM_TOPICS)[ExamSubject][number]

export type ExamLevel = 'easy' | 'medium' | 'hard'

export type ExamQuestion = {
  id: string
  subject: ExamSubject
  topic: ExamTopic
  level: ExamLevel
  /** A short original text the question is about (interpretation), shown above it. */
  passage?: string
  text: string
  options: [string, string, string, string]
  /** Index of the right option; the session shuffles the options. */
  answer: 0 | 1 | 2 | 3
  explanation: string
}

type Options = ExamQuestion['options']

/**
 * A writer for one topic: the right option comes first and the session shuffles them. Ids are the topic and the
 * position, so new questions go at the end of a list.
 */
export function topicWriter<S extends ExamSubject>(
  subject: S,
  prefix: string,
  topic: (typeof EXAM_TOPICS)[S][number],
) {
  let n = 0
  return (
    level: ExamLevel,
    text: string,
    options: Options,
    explanation: string,
    passage?: string,
  ): ExamQuestion => {
    n += 1
    return {
      id: `${prefix}-${topic}-${n}`,
      subject,
      topic,
      level,
      ...(passage ? { passage } : {}),
      text,
      options,
      answer: 0,
      explanation,
    }
  }
}
