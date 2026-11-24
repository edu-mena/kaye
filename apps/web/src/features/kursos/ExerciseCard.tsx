import { useMemo, useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Icon } from '../../components/icons'
import { Button } from '../../components/ui/Button'
import { parseNumber } from '../../domain/exercises/build'
import type { EntryLine, Exercise, Verdict } from '../../domain/exercises/types'
import { ChoiceOptions } from './ChoiceOptions'
import { useDailySeed } from './shared'

// The exercises of the engine (domain/exercises) in the reader. Every control has a label and works with the keyboard,
// and right or wrong is always said in words and an icon, never by colour alone.

const INPUT = 'h-10 rounded-xl border border-line bg-ash-100 px-3 text-night placeholder:text-muted/70'

/** An engine exercise whose numbers come from the day's seed. */
export function PracticeCard({ make }: { make: (seed: string) => Exercise }) {
  const seed = useDailySeed()
  const exercise = useMemo(() => make(seed), [make, seed])
  return <ExerciseCard key={exercise.id} exercise={exercise} />
}

function ExerciseCard({ exercise }: { exercise: Exercise }) {
  switch (exercise.kind) {
    case 'choice':
      return <ChoiceCard exercise={exercise} />
    case 'case':
      return <DecisionCard exercise={exercise} />
    case 'numeric':
      return <NumericCard exercise={exercise} />
    case 'entries':
      return <EntriesCard exercise={exercise} />
    case 'order':
      return <LinesCard exercise={exercise} />
    case 'fill':
      return <FillCard exercise={exercise} />
    case 'output':
      return <OutputCard exercise={exercise} />
  }
}

/** The verdict of the last check; any change to the answer clears it. */
function useVerdict(): [Verdict | null, (run: () => Verdict) => void, () => void] {
  const [verdict, setVerdict] = useState<Verdict | null>(null)
  return [verdict, (run) => setVerdict(run()), () => setVerdict(null)]
}

function Frame({
  title,
  verdict,
  onCheck,
  children,
}: {
  title: string
  verdict: Verdict | null
  onCheck: () => void
  children: ReactNode
}) {
  const { t } = useTranslation()
  return (
    <section className="my-8 rounded-card border border-line bg-surface px-5 py-5 shadow-card">
      <p className="mb-4 flex items-center gap-2 font-semibold text-night">
        <Icon name="pencil" className="size-4 shrink-0 text-gold" />
        {title}
      </p>
      <div className="space-y-3">{children}</div>
      <div className="mt-5 flex flex-wrap items-start gap-3">
        <Button size="sm" onClick={onCheck}>
          {t('kursos.check')}
        </Button>
        <output className="block min-w-0 flex-1 text-sm" lang="pt">
          {verdict && (
            <>
              <span
                className={`inline-flex items-center gap-1 font-semibold ${verdict.correct ? 'text-success' : 'text-coral'}`}
              >
                <Icon name={verdict.correct ? 'check' : 'close'} className="size-4" />
                {verdict.correct ? t('kursos.correct') : t('kursos.wrong')}
              </span>
              <p className="mt-1 text-muted">{verdict.explanation}</p>
            </>
          )}
        </output>
      </div>
    </section>
  )
}

function ChoiceCard({ exercise }: { exercise: Extract<Exercise, { kind: 'choice' }> }) {
  const [answer, setAnswer] = useState<number | null>(null)
  const [verdict, run, clear] = useVerdict()
  return (
    <Frame title={exercise.prompt} verdict={verdict} onCheck={() => run(() => exercise.check(answer))}>
      <ChoiceOptions
        label={exercise.prompt}
        options={exercise.options}
        value={answer}
        onChange={(choice) => {
          setAnswer(choice)
          clear()
        }}
      />
    </Frame>
  )
}

function DecisionCard({ exercise }: { exercise: Extract<Exercise, { kind: 'case' }> }) {
  const { t } = useTranslation()
  const [answer, setAnswer] = useState<number | null>(null)
  const [verdict, run, clear] = useVerdict()
  return (
    <Frame title={exercise.prompt} verdict={verdict} onCheck={() => run(() => exercise.check(answer))}>
      {exercise.scenario.map((paragraph) => (
        <p key={paragraph} className="leading-relaxed text-ink">
          {paragraph}
        </p>
      ))}
      <ChoiceOptions
        label={t('kursos.decisionLegend')}
        options={exercise.decisions}
        value={answer}
        onChange={(choice) => {
          setAnswer(choice)
          clear()
        }}
      />
    </Frame>
  )
}

function NumericCard({ exercise }: { exercise: Extract<Exercise, { kind: 'numeric' }> }) {
  const { t } = useTranslation()
  const [answer, setAnswer] = useState('')
  const [verdict, run, clear] = useVerdict()
  return (
    <Frame title={exercise.prompt} verdict={verdict} onCheck={() => run(() => exercise.check(answer))}>
      <label className="flex flex-wrap items-center gap-2 text-sm text-night">
        <span>{t('kursos.answerLabel')}</span>
        <input
          value={answer}
          inputMode="decimal"
          autoComplete="off"
          onChange={(event) => {
            setAnswer(event.target.value)
            clear()
          }}
          className={`${INPUT} w-40`}
        />
        {exercise.unit && <span className="text-muted">{exercise.unit}</span>}
      </label>
    </Frame>
  )
}

type Row = { id: number; account: string; side: EntryLine['side']; amount: string }

let nextRow = 0
const blank = (side: Row['side'] = 'debit'): Row => ({ id: nextRow++, account: '', side, amount: '' })

function EntriesCard({ exercise }: { exercise: Extract<Exercise, { kind: 'entries' }> }) {
  const { t } = useTranslation()
  const [rows, setRows] = useState<Row[]>(() => [blank(), blank('credit')])
  const [verdict, run, clear] = useVerdict()
  const change = (next: Row[]) => {
    setRows(next)
    clear()
  }
  const set = (index: number, part: Partial<Row>) =>
    change(rows.map((row, at) => (at === index ? { ...row, ...part } : row)))
  const lines = (): EntryLine[] =>
    rows.map((row) => ({ account: row.account, side: row.side, amount: parseNumber(row.amount) ?? 0 }))
  return (
    <Frame title={exercise.prompt} verdict={verdict} onCheck={() => run(() => exercise.check(lines()))}>
      {rows.map((row, index) => (
        <fieldset key={row.id} className="flex flex-wrap gap-2">
          <legend className="sr-only">{`${t('kursos.entryLine')} ${index + 1}`}</legend>
          <select
            value={row.account}
            aria-label={`${t('kursos.entryAccount')} ${index + 1}`}
            onChange={(event) => set(index, { account: event.target.value })}
            className={`${INPUT} min-w-40 flex-1`}
          >
            <option value="">{t('kursos.entryAccount')}</option>
            {exercise.accounts.map((account) => (
              <option key={account} value={account}>
                {account}
              </option>
            ))}
          </select>
          <select
            value={row.side}
            aria-label={`${t('kursos.entrySide')} ${index + 1}`}
            onChange={(event) => set(index, { side: event.target.value === 'credit' ? 'credit' : 'debit' })}
            className={INPUT}
          >
            <option value="debit">{t('kursos.entryDebit')}</option>
            <option value="credit">{t('kursos.entryCredit')}</option>
          </select>
          <input
            value={row.amount}
            inputMode="decimal"
            aria-label={`${t('kursos.entryAmount')} ${index + 1}`}
            placeholder={t('kursos.entryAmount')}
            autoComplete="off"
            onChange={(event) => set(index, { amount: event.target.value })}
            className={`${INPUT} w-32`}
          />
          {rows.length > 2 && (
            <button
              type="button"
              onClick={() => change(rows.filter((_, at) => at !== index))}
              className="px-2 text-sm text-muted underline"
            >
              {t('kursos.entryRemove', { n: index + 1 })}
            </button>
          )}
        </fieldset>
      ))}
      <Button size="sm" variant="ghost" onClick={() => change([...rows, blank()])}>
        {t('kursos.entryAdd')}
      </Button>
    </Frame>
  )
}

function LinesCard({ exercise }: { exercise: Extract<Exercise, { kind: 'order' }> }) {
  const { t } = useTranslation()
  const [lines, setLines] = useState(exercise.lines)
  const [verdict, run, clear] = useVerdict()
  const move = (index: number, by: -1 | 1) => {
    const next = [...lines]
    const other = index + by
    ;[next[index], next[other]] = [next[other] as string, next[index] as string]
    setLines(next)
    clear()
  }
  return (
    <Frame title={exercise.prompt} verdict={verdict} onCheck={() => run(() => exercise.check(lines))}>
      <ol className="space-y-2">
        {lines.map((line, index) => (
          <li key={line} className="flex items-center gap-2">
            <span className="w-5 text-sm text-muted">{index + 1}.</span>
            <code
              lang="en"
              className="min-w-0 flex-1 rounded-lg bg-coal px-3 py-1.5 font-mono text-sm text-white"
            >
              {line}
            </code>
            <Button
              size="sm"
              variant="secondary"
              disabled={index === 0}
              aria-label={t('kursos.lineUp', { n: index + 1 })}
              onClick={() => move(index, -1)}
            >
              ↑
            </Button>
            <Button
              size="sm"
              variant="secondary"
              disabled={index === lines.length - 1}
              aria-label={t('kursos.lineDown', { n: index + 1 })}
              onClick={() => move(index, 1)}
            >
              ↓
            </Button>
          </li>
        ))}
      </ol>
    </Frame>
  )
}

function FillCard({ exercise }: { exercise: Extract<Exercise, { kind: 'fill' }> }) {
  const { t } = useTranslation()
  const [answers, setAnswers] = useState<string[]>(() => Array<string>(exercise.blanks).fill(''))
  const [verdict, run, clear] = useVerdict()
  const parts = exercise.template.split('___').map((text, at) => ({ text, at, id: `${exercise.id}-${at}` }))
  return (
    <Frame title={exercise.prompt} verdict={verdict} onCheck={() => run(() => exercise.check(answers))}>
      <pre className="overflow-x-auto rounded-2xl bg-coal px-4 py-3 text-sm leading-loose text-white">
        <code lang="en" className="font-mono">
          {parts.map(({ text, at: index, id }) => (
            <span key={id}>
              {text}
              {index < parts.length - 1 && (
                <input
                  value={answers[index] ?? ''}
                  aria-label={t('kursos.blankN', { n: index + 1 })}
                  autoCapitalize="off"
                  autoCorrect="off"
                  spellCheck={false}
                  onChange={(event) => {
                    setAnswers(answers.map((value, at) => (at === index ? event.target.value : value)))
                    clear()
                  }}
                  className="mx-1 inline-block h-8 w-28 rounded-md border border-white/30 bg-white/10 px-2 font-mono text-white"
                />
              )}
            </span>
          ))}
        </code>
      </pre>
    </Frame>
  )
}

function OutputCard({ exercise }: { exercise: Extract<Exercise, { kind: 'output' }> }) {
  const { t } = useTranslation()
  const [answer, setAnswer] = useState('')
  const [verdict, run, clear] = useVerdict()
  return (
    <Frame title={exercise.prompt} verdict={verdict} onCheck={() => run(() => exercise.check(answer))}>
      <figure>
        <figcaption className="mb-1 text-xs font-semibold text-muted">{exercise.language}</figcaption>
        <pre className="overflow-x-auto rounded-2xl bg-coal px-4 py-3 text-sm leading-relaxed text-white">
          <code lang="en" className="font-mono">
            {exercise.code}
          </code>
        </pre>
      </figure>
      <label className="flex flex-wrap items-center gap-2 text-sm text-night">
        <span>{t('kursos.printsLabel')}</span>
        <input
          value={answer}
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
          onChange={(event) => {
            setAnswer(event.target.value)
            clear()
          }}
          className={`${INPUT} w-48 font-mono`}
        />
      </label>
    </Frame>
  )
}
