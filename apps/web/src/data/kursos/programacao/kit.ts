import { seeded, type Random } from '../../../domain/daily'
import { choice, decision, fill, order, output } from '../../../domain/exercises/build'
import type { Exercise } from '../../../domain/exercises/types'
import type { Block, ChoiceItem, UnitContent } from '../types'
import { TOPICS } from './topics'

// Tools to write a Programação topic: one short lesson (about 5 minutes) and a bank of 8 or more exercises from the
// engine (domain/exercises). The code is never run: the answer of an "o que imprime" is computed here, in TypeScript,
// by the author of each variant. All sample data is invented.

const SOURCE =
  'Wikibook Python Programming e Wikipedia (CC BY-SA 4.0): só o tema; pergunta escrita de raiz pelo Kayé, dados inventados'

/** Python's `/`, `//` and `%` for the numbers a variant uses, formatted as print() shows them. */
export const py = {
  div: (a: number, b: number) => (Number.isInteger(a / b) ? `${a / b}.0` : String(a / b)),
  floor: (a: number, b: number) => Math.floor(a / b),
  mod: (a: number, b: number) => a - b * Math.floor(a / b),
}

type Make = (seed: string) => Exercise

type Ctx = {
  int: (min: number, max: number) => number
  pick: <T>(list: readonly T[]) => T
  /** "What does it print?": `answer` is computed by the variant, the listing is never run. */
  out: (code: string, answer: string, why: string, prompt?: string) => Exercise
  /** A choice question; the right option lands in a random place. */
  ask: (prompt: string, right: string, wrong: string[], why: string) => Exercise
  /** Complete the code: `template` has one ___ per blank, `answers` lists the accepted texts of each. */
  fill: (template: string, answers: string[][], why: string, prompt?: string) => Exercise
  /** Put the lines in order (3 or more lines). */
  order: (prompt: string, lines: string[], why: string) => Exercise
  /** A small case with decisions: `best` is the index of the right one. */
  decide: (
    scenario: string[],
    decisions: { text: string; consequence: string }[],
    best: number,
    prompt?: string,
  ) => Exercise
}

const hash = (text: string) => {
  let value = 0
  for (const char of text) value = (Math.imul(value, 31) + char.charCodeAt(0)) >>> 0
  return value.toString(36)
}

function context(topic: string, n: number, random: Random): Ctx {
  const meta = (key: string, prompt: string) => ({
    id: `${topic}-${n}-${hash(key)}`,
    topic,
    source: SOURCE,
    prompt,
  })
  const int = (min: number, max: number) => min + Math.floor(random() * (max - min + 1))
  return {
    int,
    pick: (list) => list[int(0, list.length - 1)] as never,
    out: (code, answer, why, prompt = 'O que imprime este código?') =>
      output({ ...meta(code, prompt), code, language: 'python', answer, why }),
    ask: (prompt, right, wrong, why) => {
      const options = [...wrong]
      const answer = int(0, options.length)
      options.splice(answer, 0, right)
      return choice({ ...meta(prompt + right, prompt), options, answer, why })
    },
    fill: (template, answers, why, prompt = 'Completa o código.') =>
      fill({ ...meta(template, prompt), template, answers, why }),
    order: (prompt, lines, why) => order({ ...meta(prompt + lines.join(), prompt), lines, why }),
    decide: (scenario, decisions, best, prompt = 'O que fazes?') =>
      decision({ ...meta(scenario.join(), prompt), scenario, decisions, best }),
  }
}

/** Exercise number `n` of a topic: the seed (day + device) picks the variant. */
const exercise =
  (topic: string, n: number, build: (c: Ctx) => Exercise): Make =>
  (seed) =>
    build(context(topic, n, seeded(`${seed}|${topic}|${n}`)))

export type TopicSpec = {
  id: string
  /** Paragraphs of the lesson, in plain Portuguese. */
  intro: string[]
  /** The one rule to remember. */
  rule: string
  code: { caption: string; lines: string[] }
  /** Optional extra blocks (a table, a case) between the code and the exercises. */
  extra?: Block[]
  points: string[]
  /** Three questions for the unit review and the final exam. */
  quiz: ChoiceItem[]
  /** 8 or more: the first 5 are in the lesson, all of them are in the bank (training and exam). */
  exercises: ((c: Ctx) => Exercise)[]
}

export function defineTopic(spec: TopicSpec): UnitContent {
  const meta = TOPICS.find((topic) => topic.id === spec.id)
  if (!meta) throw new Error(`Unknown topic ${spec.id}`)
  const bank = spec.exercises.map((build, at) => exercise(spec.id, at + 1, build))
  return {
    lessons: [
      {
        id: 'l1',
        title: meta.title,
        estimatedMinutes: 5,
        blocks: [
          { type: 'text', title: meta.title, body: spec.intro },
          { type: 'rule', title: 'Regra', body: spec.rule },
          { type: 'code', language: 'Python', caption: spec.code.caption, code: spec.code.lines.join('\n') },
          ...(spec.extra ?? []),
          ...bank
            .slice(0, 5)
            .map((make, at): Block => ({ type: 'practice', id: `${spec.id}-p${at + 1}`, make })),
          { type: 'summary', points: spec.points },
        ],
      },
    ],
    review: [
      {
        type: 'exercise',
        id: `${spec.id}-r`,
        kind: 'choice',
        instruction: 'Escolhe a resposta certa.',
        items: spec.quiz,
      },
    ],
    bank,
  }
}
