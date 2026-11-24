import { seeded, type Random } from '../../../domain/daily'
import { choice, decision, entries, fill, numeric, order, steps } from '../../../domain/exercises/build'
import type { EntryLine, Exercise } from '../../../domain/exercises/types'
import type { TopicMeta } from '../topicCourse'
import type { Block, ChoiceItem, UnitContent } from '../types'
import { TOPICS } from './topics'

// Tools to write a Contabilidade topic: one short lesson (about 5 minutes) and a bank of 8 or more exercises from the
// engine (domain/exercises). Every right answer is computed here, in TypeScript, from the numbers of the variant.
// Companies, people and amounts are invented; the books only give themes (ADR 0016).

const SOURCE =
  'Wikipedia (CC BY-SA 4.0) e textos oficiais (PGC, Decreto n.º 82/01; CIVA, Lei n.º 7/19; INSS, Decreto Presidencial n.º 227/18) só como tema; pergunta escrita de raiz pelo Kayé, empresas e valores inventados'

/** Names of the accounts used in the entries; the same words in every topic. */
export const ACC = {
  caixa: 'Caixa',
  bancos: 'Bancos',
  clientes: 'Clientes',
  fornecedores: 'Fornecedores',
  mercadorias: 'Mercadorias',
  capital: 'Capital',
  vendas: 'Vendas',
  cmv: 'Custo das mercadorias vendidas',
  ivaDed: 'IVA dedutível',
  ivaLiq: 'IVA liquidado',
  estado: 'Estado (IVA a pagar)',
  equip: 'Equipamento',
  amortAc: 'Amortizações acumuladas',
  amortEx: 'Amortizações do exercício',
  pessoal: 'Custos com o pessoal',
  salarios: 'Pessoal (salários a pagar)',
  inss: 'Segurança Social (INSS a pagar)',
  fst: 'Fornecimentos e serviços de terceiros',
  emprestimos: 'Empréstimos bancários',
  devolucoes: 'Devoluções de vendas',
  descontos: 'Descontos concedidos',
  rendas: 'Rendas pagas adiantadas',
  acrescimo: 'Acréscimos de custos',
  resultado: 'Resultado do exercício',
} as const

/** A debit line and a credit line. */
export const debit = (account: string, amount: number): EntryLine => ({ account, side: 'debit', amount })
export const credit = (account: string, amount: number): EntryLine => ({ account, side: 'credit', amount })

/** 12500 → "12.500 Kz"; with cents, "12.500,50 Kz". */
export function kz(amount: number): string {
  const [whole = '0', cents] = amount.toFixed(2).split('.')
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  return `${grouped}${cents && cents !== '00' ? `,${cents}` : ''} Kz`
}

/** 14% VAT of a base that is a multiple of 50 Kz is always a whole number. */
export const vat = (base: number) => (base * 14) / 100

type Make = (seed: string) => Exercise

export type Ctx = {
  int: (min: number, max: number) => number
  pick: <T>(list: readonly T[]) => T
  /** A whole base amount, a multiple of 50 Kz, between `min` and `max` thousands. */
  base: (min: number, max: number) => number
  /**
   * A number the whole topic shares for the day (a case's facts stay the same across its exercises):
   * the same `key` gives the same value in every exercise of the topic, a multiple of `step` in [min, max].
   */
  shared: (key: string, min: number, max: number, step?: number) => number
  /** A choice question; the right option lands in a random place. */
  ask: (prompt: string, right: string, wrong: string[], why: string) => Exercise
  /** A calculation: `answer` is computed by the variant. */
  num: (prompt: string, answer: number, why: string, unit?: string, tolerance?: number) => Exercise
  /** An entry: the right lines are given; the account list shown is the lines' accounts plus `extra`, sorted. */
  entry: (prompt: string, lines: EntryLine[], why: string, extra?: string[]) => Exercise
  /** A calculation in steps or a table: every cell has its own right number, computed by the variant. */
  steps: (
    prompt: string,
    data: string[],
    cells: { label: string; answer: number; unit?: string }[],
    why: string,
  ) => Exercise
  fill: (template: string, answers: string[][], why: string, prompt?: string) => Exercise
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

function context(topic: string, n: number, random: Random, seed: string, source: string): Ctx {
  const meta = (key: string, prompt: string) => ({
    id: `${topic}-${n}-${hash(key)}`,
    topic,
    source,
    prompt,
  })
  const int = (min: number, max: number) => min + Math.floor(random() * (max - min + 1))
  return {
    int,
    pick: (list) => list[int(0, list.length - 1)] as never,
    base: (min, max) => int(min * 20, max * 20) * 50,
    shared: (key, min, max, step = 1) =>
      min + step * Math.floor(seeded(`${seed}|${topic}|${key}`)() * (Math.floor((max - min) / step) + 1)),
    ask: (prompt, right, wrong, why) => {
      const options = [...wrong]
      const answer = int(0, options.length)
      options.splice(answer, 0, right)
      return choice({ ...meta(prompt + right, prompt), options, answer, why })
    },
    num: (prompt, answer, why, unit = 'Kz', tolerance = 0.5) =>
      numeric({ ...meta(prompt, prompt), answer, tolerance, unit, why }),
    entry: (prompt, lines, why, extra = []) => {
      const side = (which: EntryLine['side']) =>
        lines.filter((line) => line.side === which).reduce((total, line) => total + line.amount, 0)
      if (Math.abs(side('debit') - side('credit')) > 0.005) throw new Error(`Unbalanced entry: ${prompt}`)
      return entries({
        ...meta(prompt, prompt),
        accounts: [...new Set([...lines.map((line) => line.account), ...extra])].toSorted((a, b) =>
          a.localeCompare(b, 'pt'),
        ),
        answer: lines,
        why,
      })
    },
    steps: (prompt, data, cells, why) =>
      steps({ ...meta(prompt + cells.map((cell) => cell.label).join(), prompt), data, steps: cells, why }),
    fill: (template, answers, why, prompt = 'Completa.') =>
      fill({ ...meta(template, prompt), template, answers, why }),
    order: (prompt, lines, why) => order({ ...meta(prompt + lines.join(), prompt), lines, why }),
    decide: (scenario, decisions, best, prompt = 'O que fazes?') =>
      decision({ ...meta(scenario.join(), prompt), scenario, decisions, best }),
  }
}

/** Exercise number `n` of a topic: the seed (day + device) picks the variant. */
const exercise =
  (topic: string, n: number, build: (c: Ctx) => Exercise, source: string): Make =>
  (seed) =>
    build(context(topic, n, seeded(`${seed}|${topic}|${n}`), seed, source))

export type TopicSpec = {
  id: string
  /** Paragraphs of the lesson, in plain Portuguese. */
  intro: string[]
  /** The one rule to remember. */
  rule: string
  /** A worked example: a table, examples or a case, between the rule and the exercises. */
  extra: Block[]
  points: string[]
  /** Three questions for the unit review and the final exam. */
  quiz: ChoiceItem[]
  /** 8 or more: the first 5 are in the lesson, all of them are in the bank (training and exam). */
  exercises: ((c: Ctx) => Exercise)[]
}

/** `topics` and `source` default to the Iniciante course; another course (the PGC one) passes its own. */
export function defineTopic(spec: TopicSpec, topics: TopicMeta[] = TOPICS, source = SOURCE): UnitContent {
  const meta: TopicMeta | undefined = topics.find((topic) => topic.id === spec.id)
  if (!meta) throw new Error(`Unknown topic ${spec.id}`)
  const bank = spec.exercises.map((build, at) => exercise(spec.id, at + 1, build, source))
  return {
    lessons: [
      {
        id: 'l1',
        title: meta.title,
        estimatedMinutes: 5,
        blocks: [
          { type: 'text', title: meta.title, body: spec.intro },
          { type: 'rule', title: 'Regra', body: spec.rule },
          ...spec.extra,
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
