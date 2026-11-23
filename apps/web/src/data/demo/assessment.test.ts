import { describe, expect, it } from 'vitest'
import { LOCALES } from '../../lib/i18n'
import { getAssessment } from '../source'
import { RIASEC_KEYS, SITUATION_CONTEXTS, type AssessmentQuestion } from '../types'
import { questions, QUESTIONS } from './assessment'

const statements = (list: AssessmentQuestion[]) => list.filter((question) => question.kind === 'statement')
const situations = (list: AssessmentQuestion[]) => list.filter((question) => question.kind === 'situation')

const shape = (list: AssessmentQuestion[]) =>
  list.map((question) =>
    question.kind === 'statement'
      ? [question.id, question.dimension]
      : [question.id, question.context, question.options.map((o) => `${o.dimension}:${o.icon}`)],
  )

describe('the test questions (ADR 0017)', () => {
  it('has 42 questions: 30 statements and 12 situations, served by the data source', async () => {
    const served = await getAssessment()
    expect(served).toEqual(QUESTIONS)
    expect(served).toHaveLength(42)
    expect(statements(served)).toHaveLength(30)
    expect(situations(served)).toHaveLength(12)
  })

  it('weighs the six interests the same: 5 statements and one card in every situation for each', () => {
    for (const key of RIASEC_KEYS) {
      expect(statements(QUESTIONS).filter((question) => question.dimension === key)).toHaveLength(5)
    }
    for (const question of situations(QUESTIONS)) {
      expect(question.options.map((option) => option.dimension).toSorted()).toEqual(RIASEC_KEYS.toSorted())
    }
  })

  it('puts every interest in every card position the same number of times', () => {
    for (let position = 0; position < RIASEC_KEYS.length; position++) {
      for (const key of RIASEC_KEYS) {
        const count = situations(QUESTIONS).filter((q) => q.options[position]?.dimension === key).length
        expect(count, `${key} at ${position}`).toBe(2)
      }
    }
  })

  it('never repeats a question, an id or a card, and never asks two statements of one interest in a row', () => {
    const texts = QUESTIONS.flatMap((question) =>
      question.kind === 'statement'
        ? [question.text]
        : [question.text, ...question.options.map((o) => o.text)],
    )
    expect(new Set(texts).size).toBe(texts.length)
    expect(new Set(QUESTIONS.map((question) => question.id)).size).toBe(QUESTIONS.length)
    const order = QUESTIONS.map((question) => (question.kind === 'statement' ? question.dimension : '·'))
    expect(order.every((key, i) => key === '·' || key !== order[i - 1])).toBe(true)
  })

  it('mixes the two kinds: never two situations in a row, and one within every four questions', () => {
    const kinds = QUESTIONS.map((question) => question.kind)
    for (let i = 1; i < kinds.length; i++) {
      expect(kinds[i] === 'situation' && kinds[i - 1] === 'situation').toBe(false)
    }
    for (let i = 0; i + 3 <= kinds.length; i++) expect(kinds.slice(i, i + 4)).toContain('situation')
  })

  it('spreads the situations over everyday places, none more than twice', () => {
    const contexts = situations(QUESTIONS).map((question) => question.context)
    expect(new Set(contexts).size).toBeGreaterThanOrEqual(SITUATION_CONTEXTS.length - 1)
    for (const context of SITUATION_CONTEXTS) {
      expect(contexts.filter((item) => item === context).length).toBeLessThanOrEqual(2)
    }
  })

  it('has every text in Portuguese, English and French, with the same ids and cards', () => {
    for (const locale of LOCALES) {
      const list = questions(locale)
      expect(shape(list)).toEqual(shape(QUESTIONS))
      for (const question of list) {
        expect(question.text.trim(), `${locale} ${question.id}`).not.toBe('')
      }
    }
    const cards = QUESTIONS.flatMap((question) => (question.kind === 'situation' ? question.options : []))
    for (const locale of LOCALES) {
      const texts = questions(locale).flatMap((q) =>
        q.kind === 'situation' ? q.options.map((o) => o.text) : [],
      )
      expect(texts).toHaveLength(cards.length)
      expect(texts.every((text) => text.trim() !== '')).toBe(true)
    }
    expect(questions('en')[0]?.text).not.toBe(QUESTIONS[0]?.text)
    expect(questions('fr')[0]?.text).not.toBe(QUESTIONS[0]?.text)
  })
})
