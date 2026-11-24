import { describe, expect, it } from 'vitest'
import { choice, decision, entries, fill, numeric, order, output, parseNumber } from './exercises/build'
import { compoundInterest, exerciseSeed, generate, loopOutput, purchaseEntry } from './exercises/generators'

const meta = { id: 'x', topic: 'topic', source: 'Kayé', prompt: '?' }

describe('choice', () => {
  const exercise = choice({ ...meta, options: ['a', 'b'], answer: 1, why: 'Porque sim.' })
  it('right, wrong and empty', () => {
    expect(exercise.check(1).correct).toBe(true)
    const wrong = exercise.check(0)
    expect(wrong.correct).toBe(false)
    expect(wrong.explanation).toContain('b')
    expect(exercise.check(null).correct).toBe(false)
  })
})

describe('numeric', () => {
  const exercise = numeric({ ...meta, answer: 1250.5, tolerance: 1, unit: 'Kz', why: 'Conta.' })
  it('accepts the number in the formats people type', () => {
    for (const typed of ['1250,5', '1.250,50', '1 250,5 Kz', '1250.5', 1250.5]) {
      expect(exercise.check(typed).correct).toBe(true)
    }
  })
  it('has a tolerance, and nothing beyond it', () => {
    expect(exercise.check('1251,5').correct).toBe(true)
    expect(exercise.check('1252').correct).toBe(false)
    expect(exercise.check('1249,4').correct).toBe(false)
  })
  it('rejects text and empty answers', () => {
    for (const typed of ['', 'abc', null, '12abc']) expect(exercise.check(typed).correct).toBe(false)
    expect(parseNumber('1.000.000')).toBe(1_000_000)
  })
})

describe('entries', () => {
  const exercise = entries({
    ...meta,
    accounts: ['Caixa', 'Mercadorias'],
    answer: [
      { account: 'Mercadorias', side: 'debit', amount: 100 },
      { account: 'Caixa', side: 'credit', amount: 100 },
    ],
    why: 'Compra a pronto.',
  })
  it('is right in any order, with accents and case ignored', () => {
    expect(
      exercise.check([
        { account: 'CAIXA', side: 'credit', amount: 100 },
        { account: 'mercadórias', side: 'debit', amount: 100 },
      ]).correct,
    ).toBe(true)
  })
  it('is wrong with the sides swapped, a wrong amount or a missing line', () => {
    const swapped = [
      { account: 'Mercadorias', side: 'credit' as const, amount: 100 },
      { account: 'Caixa', side: 'debit' as const, amount: 100 },
    ]
    expect(exercise.check(swapped).correct).toBe(false)
    expect(exercise.check([{ account: 'Mercadorias', side: 'debit', amount: 100 }]).correct).toBe(false)
    expect(
      exercise.check([
        { account: 'Mercadorias', side: 'debit', amount: 90 },
        { account: 'Caixa', side: 'credit', amount: 90 },
      ]).correct,
    ).toBe(false)
  })
})

describe('order, fill, output and case', () => {
  it('order: right only in the written order', () => {
    const exercise = order({ ...meta, lines: ['a = 1', 'b = 2', 'print(a + b)'], why: 'Primeiro define.' })
    expect(exercise.lines).not.toEqual(['a = 1', 'b = 2', 'print(a + b)'])
    expect(exercise.check(['a = 1', 'b = 2', 'print(a + b)']).correct).toBe(true)
    expect(exercise.check([...exercise.lines]).correct).toBe(false)
  })
  it('fill: any listed answer, without accents; empty is never right', () => {
    const exercise = fill({
      ...meta,
      template: 'for i ___ range(3): ___',
      answers: [['in'], ['print(i)', 'imprimir(i)']],
      why: 'Sintaxe.',
    })
    expect(exercise.blanks).toBe(2)
    expect(exercise.check(['IN', 'imprimir(i)']).correct).toBe(true)
    expect(exercise.check(['in', '']).correct).toBe(false)
    expect(exercise.check(['on', 'print(i)']).correct).toBe(false)
  })
  it('output: ignores spacing and case, rejects empty', () => {
    const exercise = output({
      ...meta,
      code: 'print(1)',
      language: 'python',
      answer: 'Olá\n3',
      why: 'Conta.',
    })
    expect(exercise.check('ola\n 3 ').correct).toBe(true)
    expect(exercise.check('3').correct).toBe(false)
    expect(exercise.check(' ').correct).toBe(false)
    expect(exercise.check(null).correct).toBe(false)
  })
  it('case: says the consequence of the choice, and the best one when wrong', () => {
    const exercise = decision({
      ...meta,
      scenario: ['O fornecedor atrasa.'],
      decisions: [
        { text: 'Esperar', consequence: 'Perdes vendas.' },
        { text: 'Pedir a outro', consequence: 'Manténs as vendas.' },
      ],
      best: 1,
    })
    expect(exercise.check(1)).toEqual({ correct: true, explanation: 'Manténs as vendas.' })
    const wrong = exercise.check(0)
    expect(wrong.correct).toBe(false)
    expect(wrong.explanation).toContain('Perdes vendas.')
    expect(wrong.explanation).toContain('Pedir a outro')
    expect(exercise.check(null).correct).toBe(false)
  })
})

describe('generators', () => {
  const seeds = ['2026-11-24|a', '2026-11-25|a', '2026-11-24|b', '2026-12-01|c', '2027-01-09|d']

  it('the same seed gives the same exercise, other seeds other numbers', () => {
    for (const make of [compoundInterest, purchaseEntry, loopOutput]) {
      expect(make(seeds[0] as string).id).toBe(make(seeds[0] as string).id)
      expect(new Set(seeds.map((seed) => make(seed).id)).size).toBeGreaterThan(1)
    }
  })

  it('the day and the device make the seed', () => {
    expect(exerciseSeed('2026-11-24', 'a')).not.toBe(exerciseSeed('2026-11-25', 'a'))
    expect(exerciseSeed('2026-11-24', 'a')).not.toBe(exerciseSeed('2026-11-24', 'b'))
    expect(generate('nope', 'x')).toBeUndefined()
  })

  it('the key is computed: compound interest', () => {
    for (const seed of seeds) {
      const exercise = compoundInterest(seed)
      if (exercise.kind !== 'numeric') throw new Error('kind')
      const [, capital = 0, rate = 0, years = 0] = exercise.id.split('-').map(Number)
      const key = capital * (1 + rate / 100) ** years
      expect(exercise.check(key.toFixed(2)).correct).toBe(true)
      expect(exercise.check(key * 1.1).correct).toBe(false)
      // Simple interest is the classic mistake.
      expect(exercise.check(capital * (1 + (rate / 100) * years)).correct).toBe(false)
    }
  })

  it('the key is computed: purchase with 14% VAT balances', () => {
    for (const seed of seeds) {
      const exercise = purchaseEntry(seed)
      if (exercise.kind !== 'entries') throw new Error('kind')
      const base = Number(exercise.id.split('-')[1])
      const right = [
        { account: 'Mercadorias', side: 'debit' as const, amount: base },
        { account: 'IVA dedutível', side: 'debit' as const, amount: base * 0.14 },
        { account: 'Fornecedores', side: 'credit' as const, amount: base * 1.14 },
      ]
      expect(exercise.check(right).correct).toBe(true)
      expect(exercise.check(right.slice(0, 2)).correct).toBe(false)
    }
  })

  it('the key is computed: what the loop prints', () => {
    for (const seed of seeds) {
      const exercise = loopOutput(seed)
      if (exercise.kind !== 'output') throw new Error('kind')
      const [, start = 0, stop = 0, step = 0] = exercise.id.split('-').map(Number)
      let total = 0
      for (let value = start; value < stop; value++) total += value * step
      expect(exercise.check(String(total)).correct).toBe(true)
      expect(exercise.check(String(total + 1)).correct).toBe(false)
    }
  })
})
