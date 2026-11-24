// The exercise engine (docs/decisoes/0025): plain data plus a pure check. No React, no code is ever run:
// "what does this print" is answered by a value the generator computed, never by running the listing.

export type Verdict = { correct: boolean; explanation: string }

/** One line of an accounting entry: an account, the side it moves and the amount in Kz. */
export type EntryLine = { account: string; side: 'debit' | 'credit'; amount: number }

export type Base<K extends string, A> = {
  id: string
  kind: K
  /** The topic (unit) it practises. */
  topic: string
  /** Where the theme comes from (the books only give themes, ADR 0016): free text for the credits. */
  source: string
  prompt: string
  /** What the person answers with; `null`/empty is never right. */
  check: (answer: A) => Verdict
}

export type ChoiceExercise = Base<'choice', number | null> & { options: string[] }
/** The answer is a number or text such as "1.250,50"; right within `tolerance` (absolute). */
export type NumericExercise = Base<'numeric', string | number | null> & { unit?: string; tolerance: number }
export type EntriesExercise = Base<'entries', EntryLine[]> & { accounts: string[] }
export type OrderExercise = Base<'order', string[]> & { lines: string[] }
/** `template` has one "___" per blank. */
export type FillExercise = Base<'fill', string[]> & { template: string; blanks: number }
export type OutputExercise = Base<'output', string | null> & { code: string; language: string }
export type CaseExercise = Base<'case', number | null> & { scenario: string[]; decisions: string[] }

export type Exercise =
  | ChoiceExercise
  | NumericExercise
  | EntriesExercise
  | OrderExercise
  | FillExercise
  | OutputExercise
  | CaseExercise

/** A generator: the same seed (day + device) always gives the same exercise, other seeds other numbers. */
export type Generator = (seed: string) => Exercise
