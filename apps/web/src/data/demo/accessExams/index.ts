import { MATEMATICA } from './matematica'
import { PORTUGUES } from './portugues'
import type { ExamQuestion, ExamSubject } from './types'

export * from './types'

/** The question bank, by subject. An empty list shows the subject as "em breve". */
export const ACCESS_EXAM_BANK: Record<ExamSubject, ExamQuestion[]> = {
  matematica: MATEMATICA,
  portugues: PORTUGUES,
  fisica: [],
  quimica: [],
  biologia: [],
  historia: [],
  geografia: [],
}
