import type {
  CaseExercise,
  ChoiceExercise,
  EntriesExercise,
  EntryLine,
  FillExercise,
  NumericExercise,
  OrderExercise,
  OutputExercise,
  Verdict,
} from './types'

// Builders: each takes what the author knows and returns an exercise whose `check` is already written.

/** Case, accents and spacing do not matter ("Ambito" = "âmbito"); code keeps its punctuation. */
export function fold(text: string): string {
  return text.toLowerCase().normalize('NFD').replace(/\p{M}/gu, '').replace(/\s+/g, ' ').trim()
}

const verdict = (correct: boolean, right: string, why: string): Verdict => ({
  correct,
  explanation: correct ? why : `${right} ${why}`.trim(),
})

type Meta = { id: string; topic: string; source: string; prompt: string }

export function choice(meta: Meta & { options: string[]; answer: number; why: string }): ChoiceExercise {
  const { options, answer, why, ...rest } = meta
  return {
    ...rest,
    kind: 'choice',
    options,
    check: (given) => verdict(given === answer, options[answer] ?? '', why),
  }
}

/** "1.250,50", "1 250,5 Kz", "1250.5" and 1250.5 are the same number. */
export function parseNumber(value: string | number | null): number | null {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null
  if (!value) return null
  let text = value.replace(/[\s ]|kz/gi, '')
  if (!/^-?[\d.,]+$/.test(text)) return null
  if (text.includes(',')) text = text.replace(/\./g, '').replace(',', '.')
  else if ((text.match(/\./g) ?? []).length > 1) text = text.replace(/\./g, '')
  const number = Number(text)
  return Number.isFinite(number) ? number : null
}

export function numeric(
  meta: Meta & { answer: number; tolerance: number; unit?: string; why: string },
): NumericExercise {
  const { answer, tolerance, why, ...rest } = meta
  return {
    ...rest,
    kind: 'numeric',
    tolerance,
    check: (given) => {
      const number = parseNumber(given)
      const ok = number !== null && Math.abs(number - answer) <= tolerance + 1e-9
      return verdict(ok, `${answer}${meta.unit ? ` ${meta.unit}` : ''}.`, why)
    },
  }
}

const entryKey = (line: EntryLine) => `${fold(line.account)}|${line.side}|${Math.round(line.amount * 100)}`
const describe = (lines: EntryLine[]) =>
  lines.map((line) => `${line.side === 'debit' ? 'D' : 'C'} ${line.account} ${line.amount}`).join('; ')

/** Right when the same accounts move on the same sides by the same amounts, in any order. */
export function entries(
  meta: Meta & { accounts: string[]; answer: EntryLine[]; why: string },
): EntriesExercise {
  const { accounts, answer, why, ...rest } = meta
  const key = answer.map(entryKey).toSorted().join('#')
  return {
    ...rest,
    kind: 'entries',
    accounts,
    check: (given) => {
      const lines = given.filter((line) => line.account.trim() !== '' && line.amount > 0)
      const debit = lines.filter((line) => line.side === 'debit').reduce((sum, line) => sum + line.amount, 0)
      const credit = lines
        .filter((line) => line.side === 'credit')
        .reduce((sum, line) => sum + line.amount, 0)
      const ok = lines.map(entryKey).toSorted().join('#') === key && Math.abs(debit - credit) < 0.005
      return verdict(ok, `${describe(answer)}.`, why)
    },
  }
}

export function order(meta: Meta & { lines: string[]; why: string }): OrderExercise {
  const { lines, why, ...rest } = meta
  // The author writes the lines in the right order; what is shown is the same lines rotated.
  const shown = [...lines.slice(2), ...lines.slice(0, 2)]
  return {
    ...rest,
    kind: 'order',
    lines: shown,
    check: (given) =>
      verdict(
        given.length === lines.length && given.every((line, at) => fold(line) === fold(lines[at] ?? '')),
        `${lines.join(' / ')}.`,
        why,
      ),
  }
}

export function fill(meta: Meta & { template: string; answers: string[][]; why: string }): FillExercise {
  const { answers, why, ...rest } = meta
  return {
    ...rest,
    kind: 'fill',
    blanks: answers.length,
    check: (given) => {
      const ok =
        given.length === answers.length &&
        answers.every((options, at) => {
          const typed = fold(given[at] ?? '')
          return typed !== '' && options.some((option) => fold(option) === typed)
        })
      return verdict(ok, `${answers.map((options) => options[0]).join(', ')}.`, why)
    },
  }
}

const lines = (text: string) => text.split(/\r?\n/).map(fold).join('\n').trim()

export function output(
  meta: Meta & { code: string; language: string; answer: string; why: string },
): OutputExercise {
  const { answer, why, ...rest } = meta
  return {
    ...rest,
    kind: 'output',
    check: (given) => {
      const ok = given !== null && given.trim() !== '' && lines(given) === lines(answer)
      return verdict(ok, `${answer}.`, why)
    },
  }
}

/** A decision with a consequence: every option says what happens; `best` is the one that serves the business. */
export function decision(
  meta: Meta & { scenario: string[]; decisions: { text: string; consequence: string }[]; best: number },
): CaseExercise {
  const { scenario, decisions, best, ...rest } = meta
  return {
    ...rest,
    kind: 'case',
    scenario,
    decisions: decisions.map((option) => option.text),
    check: (given) => {
      const chosen = given === null ? undefined : decisions[given]
      return {
        correct: given === best,
        explanation: chosen
          ? `${chosen.consequence}${given === best ? '' : ` Melhor: ${decisions[best]?.text}. ${decisions[best]?.consequence}`}`
          : '',
      }
    },
  }
}
