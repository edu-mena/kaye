import {
  ACCESS_EXAM_BANK,
  EXAM_SUBJECTS,
  EXAM_TOPICS,
  type ExamQuestion,
  type ExamSubject,
  type ExamTopic,
} from '../data/demo/accessExams'
import { seeded, shuffle } from './psychotech'

// Exames de acesso: practice by subject, from the bank of original questions. "Treino" is short, untimed and
// corrected at each answer; "Simulação" is longer, against the clock and corrected at the end. Only the grades
// per topic are kept, never the answers.

export type ExamMode = 'practice' | 'simulation'

export const PRACTICE_SIZE = 10
export const SIMULATION_SIZE = 30
export const SIMULATION_SECONDS = 60 * 60
/** Below this share of right answers a topic is one to review. */
const REVIEW_BELOW = 0.6

/** A question as asked: its options in this session's order. */
export type ExamItem = ExamQuestion

export const bankOf = (subject: ExamSubject) => ACCESS_EXAM_BANK[subject]

/** The subjects that already have questions, in their order. */
export const READY_SUBJECTS = EXAM_SUBJECTS.filter((subject) => bankOf(subject).length > 0)

export const QUESTION_COUNT = READY_SUBJECTS.reduce((sum, subject) => sum + bankOf(subject).length, 0)

export const topicsOf = (subject: ExamSubject): readonly ExamTopic[] => EXAM_TOPICS[subject]

/** The same question with its options shuffled and the answer following the right one. */
function shuffled(question: ExamQuestion, random: () => number): ExamItem {
  const order = shuffle(random, [0, 1, 2, 3] as const)
  return {
    ...question,
    options: order.map((index) => question.options[index]) as ExamQuestion['options'],
    answer: order.indexOf(question.answer) as ExamQuestion['answer'],
  }
}

/**
 * The questions of one session, without repeats. The simulation takes the topics in turn, so every one is there;
 * practice can stay on one topic (the one to review).
 */
export function buildExamSession(
  subject: ExamSubject,
  mode: ExamMode,
  seed: number,
  topic?: ExamTopic,
): ExamItem[] {
  const random = seeded(seed)
  const bank = bankOf(subject).filter((question) => !topic || question.topic === topic)
  const size = mode === 'practice' ? PRACTICE_SIZE : SIMULATION_SIZE
  const pools = topicsOf(subject)
    .map((name) =>
      shuffle(
        random,
        bank.filter((question) => question.topic === name),
      ),
    )
    .filter((pool) => pool.length > 0)
  const picked: ExamQuestion[] = []
  for (let round = 0; picked.length < size && pools.some((pool) => pool.length > round); round++) {
    for (const pool of shuffle(random, pools)) {
      if (picked.length < size && pool[round]) picked.push(pool[round])
    }
  }
  return shuffle(random, picked).map((question) => shuffled(question, random))
}

// ---------- Grades by topic ----------

export type TopicScore = { correct: number; total: number }
export type TopicScores = Partial<Record<ExamTopic, TopicScore>>

export function scoreByTopic(answers: { topic: ExamTopic; correct: boolean }[]): TopicScores {
  const scores: TopicScores = {}
  for (const { topic, correct } of answers) {
    const current = scores[topic] ?? { correct: 0, total: 0 }
    scores[topic] = { correct: current.correct + (correct ? 1 : 0), total: current.total + 1 }
  }
  return scores
}

/** Every session's grades added up (a subject's progress over time). */
export function addScores(list: TopicScores[]): TopicScores {
  const sum: TopicScores = {}
  for (const scores of list) {
    for (const [topic, entry] of Object.entries(scores) as [ExamTopic, TopicScore][]) {
      const current = sum[topic] ?? { correct: 0, total: 0 }
      sum[topic] = { correct: current.correct + entry.correct, total: current.total + entry.total }
    }
  }
  return sum
}

export const topicShare = (entry: TopicScore) => (entry.total ? entry.correct / entry.total : 0)

export function examOverall(scores: TopicScores): number {
  const entries = Object.values(scores)
  const total = entries.reduce((sum, entry) => sum + entry.total, 0)
  return total ? entries.reduce((sum, entry) => sum + entry.correct, 0) / total : 0
}

/** The topics with answers, weakest first. */
export function rankedTopics(scores: TopicScores): ExamTopic[] {
  return (Object.keys(scores) as ExamTopic[]).toSorted(
    (a, b) => topicShare(scores[a] as TopicScore) - topicShare(scores[b] as TopicScore),
  )
}

/** The topics below REVIEW_BELOW, weakest first. */
export const topicsToReview = (scores: TopicScores) =>
  rankedTopics(scores).filter((topic) => topicShare(scores[topic] as TopicScore) < REVIEW_BELOW)

// ---------- From the admissions' subject names ----------

const SUBJECT_NAMES: [RegExp, ExamSubject][] = [
  [/matem/i, 'matematica'],
  [/portugu/i, 'portugues'],
  [/f[ií]sica/i, 'fisica'],
  [/qu[ií]mica/i, 'quimica'],
  [/biolog/i, 'biologia'],
  [/hist[oó]ria/i, 'historia'],
  [/geograf/i, 'geografia'],
]

/** The bank's subject for a name in an admission record ("Língua Portuguesa"), or null (Desenho, Cultura Geral). */
export const subjectOf = (name: string): ExamSubject | null =>
  SUBJECT_NAMES.find(([words]) => words.test(name))?.[1] ?? null
