import { seeded, type Random } from '../daily'
import { entries, numeric, output } from './build'
import type { Exercise, Generator } from './types'

// Generators by parameters: the numbers come from the seed and the right answer is computed here, never typed by
// hand. A wrong formula teaches wrong, so each generator has its tests (exercises.test.ts).

const int = (random: Random, min: number, max: number) => min + Math.floor(random() * (max - min + 1))
const money = (amount: number) => Math.round(amount * 100) / 100

const SOURCE = 'Kayé: exercício gerado por parâmetros (tema de domínio público)'

/** Compound interest: the capital after some years at a yearly rate. */
export const compoundInterest: Generator = (seed) => {
  const random = seeded(`${seed}|compound`)
  const capital = int(random, 20, 200) * 5000
  const rate = int(random, 4, 15)
  const years = int(random, 2, 5)
  const answer = money(capital * (1 + rate / 100) ** years)
  return numeric({
    id: `compound-${capital}-${rate}-${years}`,
    topic: 'financas',
    source: SOURCE,
    prompt: `Depositas ${capital} Kz a ${rate}% ao ano, com juros compostos. Quanto tens ao fim de ${years} anos?`,
    answer,
    tolerance: 1,
    unit: 'Kz',
    why: `Capital × (1 + taxa)^anos = ${capital} × ${1 + rate / 100}^${years}.`,
  })
}

/** A purchase on credit with 14% VAT: the entry that records it. */
export const purchaseEntry: Generator = (seed) => {
  const random = seeded(`${seed}|purchase`)
  const base = int(random, 10, 300) * 1000
  const vat = money(base * 0.14)
  return entries({
    id: `purchase-${base}`,
    topic: 'contabilidade',
    source: SOURCE,
    prompt: `Compraste mercadorias a crédito por ${base} Kz, mais IVA de 14%. Faz o lançamento.`,
    accounts: ['Mercadorias', 'IVA dedutível', 'Fornecedores', 'Caixa'],
    answer: [
      { account: 'Mercadorias', side: 'debit', amount: base },
      { account: 'IVA dedutível', side: 'debit', amount: vat },
      { account: 'Fornecedores', side: 'credit', amount: money(base + vat) },
    ],
    why: 'As compras e o IVA pago entram a débito; a dívida ao fornecedor (valor com IVA) entra a crédito.',
  })
}

/** What a small loop prints: the answer is the sum computed here, the listing is never run. */
export const loopOutput: Generator = (seed) => {
  const random = seeded(`${seed}|loop`)
  const start = int(random, 1, 4)
  const stop = start + int(random, 3, 6)
  const step = int(random, 2, 4)
  let total = 0
  for (let value = start; value < stop; value++) total += value * step
  return output({
    id: `loop-${start}-${stop}-${step}`,
    topic: 'programacao',
    source: SOURCE,
    prompt: 'O que imprime este código?',
    language: 'python',
    code: `total = 0\nfor i in range(${start}, ${stop}):\n    total += i * ${step}\nprint(total)`,
    answer: String(total),
    why: `i vai de ${start} a ${stop - 1}; soma-se cada i × ${step}.`,
  })
}

const GENERATORS: Record<string, Generator> = { compoundInterest, purchaseEntry, loopOutput }

/** The seed of the day: the local day plus an id kept on the device, so two people see different numbers. */
export const exerciseSeed = (day: string, deviceId: string) => `${day}|${deviceId}`

export const generate = (name: string, seed: string): Exercise | undefined => GENERATORS[name]?.(seed)
