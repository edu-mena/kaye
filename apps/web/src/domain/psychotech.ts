import { ANALOGIES, NONSENSE_WORDS, SYNONYMS } from '../data/demo/psychotech'
import { mathItem, type Diagram, type MathTopic } from './psychotechMath'

export type { Diagram }

// Psychotechnical practice: the kinds of questions found in public competitions and scholarship
// selections. Never an IQ test and never an IQ number. Every question is built from a seed by the
// pure functions below, so they never run out and copy no published battery.

export const SKILLS = ['numerical', 'logical', 'abstract', 'quantitative', 'verbal', 'attention'] as const
export type Skill = (typeof SKILLS)[number]

export const LEVELS = ['easy', 'medium', 'hard'] as const
export type Level = (typeof LEVELS)[number]

/** "Simulação completa" or one skill. */
export type Mode = 'full' | Skill

/** Four questions of each of the six skills. */
export const FULL_QUESTIONS = 24
export const FULL_SECONDS = 18 * 60
export const PRACTICE_QUESTIONS = 10
/** Attention questions are against the clock: unanswered in time counts as wrong. */
export const ATTENTION_SECONDS: Record<Level, number> = { easy: 20, medium: 15, hard: 12 }
/** Below this share of right answers a skill gets tips. */
const WEAK_BELOW = 0.6

type Shape = 'circle' | 'square' | 'triangle' | 'diamond'
export type Figure = { shape: Shape; count: 1 | 2 | 3; filled: boolean }
type Quantifier = 'all' | 'none' | 'some' | 'someNot'
export type Statement = { q: Quantifier; a: string; b: string }

type Base<S extends Skill, O> = { skill: S; level: Level; options: O[]; answer: number }

export type Question =
  | (Base<'numerical', string> & { kind: 'series'; terms: string[] })
  | (Base<'logical', string> & { kind: 'series'; terms: string[] })
  | (Base<'logical', Statement> & { kind: 'syllogism'; premises: Statement[] })
  | (Base<'abstract', Figure> & { kind: 'matrix'; cells: (Figure | null)[] })
  | (Base<'quantitative', string> & {
      kind: 'math'
      topic: MathTopic
      params: Record<string, number | string>
      diagram?: Diagram
    })
  | (Base<'verbal', string> & { kind: 'analogy'; a: string; b: string; c: string })
  | (Base<'verbal', string> & { kind: 'synonym'; word: string })
  | (Base<'attention', string> & { kind: 'odd'; columns: number })

// ---------- Randomness from a seed ----------

type Random = () => number

/** Mulberry32: small, fast, and the same seed always gives the same numbers. */
export function seeded(seed: number): Random {
  let state = seed >>> 0
  return () => {
    state = (state + 0x6d2b79f5) >>> 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const int = (random: Random, min: number, max: number) => min + Math.floor(random() * (max - min + 1))
const pick = <T>(random: Random, list: readonly T[]): T => list[Math.floor(random() * list.length)]

export function shuffle<T>(random: Random, list: readonly T[]): T[] {
  const copy = [...list]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

/** The right option among three distinct wrong ones, in a random order. */
function choices<T>(random: Random, correct: T, candidates: T[], key: (item: T) => string = String) {
  const seen = new Set([key(correct)])
  const wrong: T[] = []
  for (const candidate of candidates) {
    if (wrong.length === 3) break
    if (seen.has(key(candidate))) continue
    seen.add(key(candidate))
    wrong.push(candidate)
  }
  const options = shuffle(random, [correct, ...wrong])
  return { options, answer: options.findIndex((option) => key(option) === key(correct)) }
}

// ---------- Numerical: number series ----------

function numberSeries(random: Random, level: Level): number[] {
  if (level === 'easy') {
    const start = int(random, 1, 30)
    const step = int(random, 2, 9)
    return Array.from({ length: 6 }, (_, i) => start + i * step)
  }
  if (level === 'medium') {
    if (random() < 0.5) {
      const start = int(random, 1, 5)
      const ratio = int(random, 2, 3)
      return Array.from({ length: 6 }, (_, i) => start * ratio ** i)
    }
    // The differences grow by the same amount each time.
    const terms = [int(random, 1, 10)]
    let step = int(random, 1, 4)
    const growth = int(random, 1, 3)
    while (terms.length < 6) {
      terms.push(terms[terms.length - 1] + step)
      step += growth
    }
    return terms
  }
  const kind = int(random, 0, 3)
  if (kind === 3) {
    // Two series woven together: the odd places grow by one step, the even places by another.
    const [first, second] = [int(random, 1, 9), int(random, 20, 40)]
    const [up, down] = [int(random, 2, 5), int(random, 2, 6)]
    return Array.from({ length: 6 }, (_, i) =>
      i % 2 === 0 ? first + (i / 2) * up : second - ((i - 1) / 2) * down,
    )
  }
  if (kind === 0) {
    // Two operations, one after the other: ×2, +k, ×2, +k…
    const add = int(random, 1, 6)
    const terms = [int(random, 1, 6)]
    while (terms.length < 6) {
      const last = terms[terms.length - 1]
      terms.push(terms.length % 2 === 1 ? last * 2 : last + add)
    }
    return terms
  }
  if (kind === 1) {
    // Each term is the sum of the two before it.
    const terms = [int(random, 1, 5), int(random, 2, 7)]
    while (terms.length < 6) terms.push(terms[terms.length - 1] + terms[terms.length - 2])
    return terms
  }
  // Squares plus a constant.
  const offset = int(random, -3, 5)
  const first = int(random, 1, 4)
  return Array.from({ length: 6 }, (_, i) => (first + i) ** 2 + offset)
}

function numerical(random: Random, level: Level): Question {
  const terms = numberSeries(random, level)
  const correct = terms[5]
  const lastStep = Math.abs(terms[5] - terms[4]) || 1
  const deltas = shuffle(random, [1, -1, 2, -2, lastStep, -lastStep, 10, -10, 3, -3])
  const { options, answer } = choices(
    random,
    String(correct),
    deltas.map((delta) => String(correct + delta)),
  )
  return { skill: 'numerical', level, kind: 'series', terms: terms.slice(0, 5).map(String), options, answer }
}

// ---------- Logical: letter series and syllogisms ----------

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const letter = (index: number) => ALPHABET[((index % 26) + 26) % 26]

function letterSeries(random: Random, level: Level): Question {
  const positions = [int(random, 0, 12)]
  if (level === 'easy') {
    const step = int(random, 1, 3)
    while (positions.length < 6) positions.push(positions[positions.length - 1] + step)
  } else if (level === 'medium') {
    // Two steps taking turns.
    const steps = [int(random, 1, 3), int(random, 4, 5)]
    while (positions.length < 6)
      positions.push(positions[positions.length - 1] + steps[(positions.length - 1) % 2])
  } else {
    // Each step one bigger than the last.
    let step = int(random, 1, 2)
    while (positions.length < 6) {
      positions.push(positions[positions.length - 1] + step)
      step += 1
    }
  }
  const correct = positions[5]
  const { options, answer } = choices(
    random,
    letter(correct),
    shuffle(random, [1, -1, 2, -2, 3]).map((delta) => letter(correct + delta)),
  )
  return {
    skill: 'logical',
    level,
    kind: 'series',
    terms: positions.slice(0, 5).map(letter),
    options,
    answer,
  }
}

const statementKey = (statement: Statement) => `${statement.q}|${statement.a}|${statement.b}`

const say = (q: Quantifier, x: string, y: string): Statement => ({ q, a: x, b: y })

function syllogism(random: Random, level: Level): Question {
  const [a, b, c] = shuffle(random, NONSENSE_WORDS)
  const forms: Record<Level, { premises: Statement[]; correct: Statement; wrong: Statement[] }> = {
    easy: {
      premises: [say('all', a, b), say('all', b, c)],
      correct: say('all', a, c),
      wrong: [say('all', c, a), say('none', a, c), say('someNot', a, c)],
    },
    medium: {
      premises: [say('none', a, b), say('all', c, a)],
      correct: say('none', c, b),
      wrong: [say('all', c, b), say('some', c, b), say('all', b, c)],
    },
    hard: {
      premises: shuffle(random, [say('all', a, b), say('some', c, a)]),
      correct: say('some', c, b),
      wrong: [say('all', c, b), say('none', c, b), say('all', b, c)],
    },
  }
  const form = forms[level]
  const { options, answer } = choices(random, form.correct, form.wrong, statementKey)
  return { skill: 'logical', level, kind: 'syllogism', premises: form.premises, options, answer }
}

const logical = (random: Random, level: Level) =>
  random() < 0.5 ? letterSeries(random, level) : syllogism(random, level)

// ---------- Abstract: 3×3 matrices of figures ----------

const SHAPES: Shape[] = ['circle', 'square', 'triangle', 'diamond']
const COUNTS: Figure['count'][] = [1, 2, 3]
const figureKey = (figure: Figure) => `${figure.shape}|${figure.count}|${figure.filled}`

function abstract(random: Random, level: Level): Question {
  const shapes = shuffle(random, SHAPES).slice(0, 3)
  const counts = shuffle(random, COUNTS)
  const rowFill = [random() < 0.5, random() < 0.5, random() < 0.5]
  const cell = (row: number, column: number): Figure => {
    if (level === 'easy') return { shape: shapes[row], count: counts[column], filled: false }
    if (level === 'medium')
      return { shape: shapes[(row + column) % 3], count: counts[column], filled: rowFill[row] }
    return {
      shape: shapes[(row + column) % 3],
      count: counts[(row + 2 * column) % 3],
      filled: (row + column) % 2 === 0,
    }
  }
  const cells = Array.from({ length: 9 }, (_, i) => cell(Math.floor(i / 3), i % 3))
  const correct = cells[8]
  const otherShape = SHAPES.filter((shape) => shape !== correct.shape)
  const otherCount = COUNTS.filter((count) => count !== correct.count)
  const candidates = shuffle(random, [
    { ...correct, shape: pick(random, otherShape) },
    { ...correct, count: pick(random, otherCount) },
    { ...correct, filled: !correct.filled },
    { ...correct, shape: pick(random, otherShape), count: pick(random, otherCount) },
    { ...correct, count: pick(random, otherCount), filled: !correct.filled },
  ])
  const { options, answer } = choices(random, correct, candidates, figureKey)
  return { skill: 'abstract', level, kind: 'matrix', cells: [...cells.slice(0, 8), null], options, answer }
}

// ---------- Quantitative: geometry, proportions, percentages and chance ----------

function quantitative(random: Random, level: Level): Question {
  const item = mathItem(random, level)
  const { options, answer } = choices(random, item.correct, item.wrong)
  return {
    skill: 'quantitative',
    level,
    kind: 'math',
    topic: item.topic,
    params: item.params,
    ...(item.diagram && { diagram: item.diagram }),
    options,
    answer,
  }
}

// ---------- Verbal: analogies and synonyms (our own lists) ----------

function verbal(random: Random, level: Level): Question {
  if (random() < 0.5) {
    const item = pick(random, ANALOGIES[level])
    const { options, answer } = choices(random, item.answer, item.wrong)
    return { skill: 'verbal', level, kind: 'analogy', a: item.a, b: item.b, c: item.c, options, answer }
  }
  const item = pick(random, SYNONYMS[level])
  const { options, answer } = choices(random, item.answer, item.wrong)
  return { skill: 'verbal', level, kind: 'synonym', word: item.word, options, answer }
}

// ---------- Attention: find the one that is different ----------

const LOOKALIKES: Record<Level, [string, string][]> = {
  easy: [
    ['O', 'Q'],
    ['M', 'N'],
    ['3', '8'],
    ['T', 'Y'],
  ],
  medium: [
    ['b', 'd'],
    ['p', 'q'],
    ['6', '9'],
    ['E', 'F'],
  ],
  hard: [
    ['R', 'P'],
    ['C', 'G'],
    ['B', '8'],
    ['Z', '2'],
  ],
}
const GRID_COLUMNS: Record<Level, number> = { easy: 4, medium: 5, hard: 6 }

function attention(random: Random, level: Level): Question {
  const [common, odd] = shuffle(random, pick(random, LOOKALIKES[level]))
  const columns = GRID_COLUMNS[level]
  const answer = int(random, 0, columns * columns - 1)
  const options = Array.from({ length: columns * columns }, (_, i) => (i === answer ? odd : common))
  return { skill: 'attention', level, kind: 'odd', columns, options, answer }
}

// ---------- Questions and sessions ----------

const GENERATORS: Record<Skill, (random: Random, level: Level) => Question> = {
  numerical,
  logical,
  abstract,
  quantitative,
  verbal,
  attention,
}

/** One question: the same skill, level and seed always give the same question. */
function generate(skill: Skill, level: Level, seed: number): Question {
  return GENERATORS[skill](seeded(seed), level)
}

/** What the question asks, without the order of its options: two equal keys are a repeat. */
function questionKey(question: Question) {
  return JSON.stringify(question, (key, value: unknown) =>
    key === 'options' || key === 'answer' ? undefined : value,
  )
}

/** The questions of one session, without repeats; the full simulation mixes every skill equally. */
export function buildSession(mode: Mode, level: Level, seed: number): Question[] {
  const random = seeded(seed)
  const skills =
    mode === 'full'
      ? shuffle(
          random,
          SKILLS.flatMap((skill) => Array<Skill>(FULL_QUESTIONS / SKILLS.length).fill(skill)),
        )
      : Array<Skill>(PRACTICE_QUESTIONS).fill(mode)
  const seen = new Set<string>()
  return skills.map((skill, index) => {
    let question = generate(skill, level, seed + index * 7919)
    // A few tries for a new one; the short verbal lists may still repeat in a long session.
    for (let attempt = 1; attempt < 12 && seen.has(questionKey(question)); attempt++)
      question = generate(skill, level, seed + index * 7919 + attempt * 104729)
    seen.add(questionKey(question))
    return question
  })
}

// ---------- Scores ----------

/** `ms` is null when time ran out before the question was answered. */
export type Answer = { skill: Skill; correct: boolean; ms: number | null }
export type SkillScore = { correct: number; total: number; answered: number; ms: number }
export type Scores = Partial<Record<Skill, SkillScore>>

export function score(answers: Answer[]): Scores {
  const scores: Scores = {}
  for (const { skill, correct, ms } of answers) {
    const current = scores[skill] ?? { correct: 0, total: 0, answered: 0, ms: 0 }
    scores[skill] = {
      correct: current.correct + (correct ? 1 : 0),
      total: current.total + 1,
      answered: current.answered + (ms === null ? 0 : 1),
      ms: current.ms + (ms ?? 0),
    }
  }
  return scores
}

/** Share of right answers, 0 to 1. */
export const share = (entry: SkillScore) => (entry.total ? entry.correct / entry.total : 0)

/** Average seconds per answered question. */
export const averageSeconds = (entry: SkillScore) => (entry.answered ? entry.ms / entry.answered / 1000 : 0)

export function overall(scores: Scores): number {
  const entries = Object.values(scores)
  const total = entries.reduce((sum, entry) => sum + entry.total, 0)
  return total ? entries.reduce((sum, entry) => sum + entry.correct, 0) / total : 0
}

const ratio = (entry: SkillScore | undefined) => (entry ? share(entry) : 1)

/** Skills below WEAK_BELOW, weakest first. */
export function weakSkills(scores: Scores): Skill[] {
  return SKILLS.filter((skill) => {
    return ratio(scores[skill]) < WEAK_BELOW
  }).toSorted((a, b) => ratio(scores[a]) - ratio(scores[b]))
}
