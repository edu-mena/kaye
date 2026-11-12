import { useId, useMemo, useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Icon } from '../../components/icons'
import { Button } from '../../components/ui/Button'
import type { Block, ChoiceItem, ExerciseBlock, GapItem, MatchItem, OrderItem } from '../../data/kursos/types'
import { itemCorrect, itemKey, shuffle, type Answer } from '../../domain/kursos'

// The pieces of a lesson, typeset like a textbook page.

const HEADING = 'mt-10 mb-3 text-lg font-semibold text-night'
const PARA = 'mb-4 leading-relaxed text-ink'

/** `lang`: the language of the course's examples and exercises (Course.lang). */
export function BlockView({ block, lang }: { block: Block; lang: string }) {
  switch (block.type) {
    case 'text':
      return (
        <section>
          {block.title && <h2 className={HEADING}>{block.title}</h2>}
          {block.body.map((paragraph) => (
            <p key={paragraph} className={PARA}>
              {paragraph}
            </p>
          ))}
        </section>
      )
    case 'rule':
      return (
        <aside className="my-6 rounded-2xl border-l-4 border-gold bg-ash-100 px-5 py-4">
          <p className="mb-1 text-sm font-semibold text-night">{block.title}</p>
          <p className="leading-relaxed text-ink">{block.body}</p>
        </aside>
      )
    case 'table':
      return (
        <div className="my-6 overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            {block.caption && (
              <caption className="mb-2 text-left text-sm font-semibold text-night">{block.caption}</caption>
            )}
            <thead>
              <tr>
                {block.head.map((cell) => (
                  <th
                    key={cell}
                    scope="col"
                    className="border-b-2 border-line px-3 py-2 text-left font-semibold text-night"
                  >
                    {cell}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row) => (
                <tr key={row.join('|')} className="odd:bg-ash-100/60">
                  {block.head.map((column, at) => (
                    <td
                      key={column}
                      className={`border-b border-line px-3 py-2 ${at === 0 ? 'font-semibold text-night' : 'text-ink'}`}
                    >
                      {row[at]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
    case 'examples':
      return (
        <section className="my-6">
          {block.title && <h2 className={HEADING}>{block.title}</h2>}
          <ul className="space-y-2">
            {block.items.map((item) => (
              <li key={item.text} className="rounded-xl bg-surface px-4 py-2.5 shadow-card">
                <p lang={lang} className="font-semibold text-night">
                  {item.text}
                </p>
                {item.note && <p className="text-sm text-muted">{item.note}</p>}
              </li>
            ))}
          </ul>
        </section>
      )
    case 'case':
      return (
        <section className="my-6 rounded-card border border-line bg-surface px-5 py-5 shadow-card">
          <p className="mb-1 flex items-center gap-2 text-xs font-semibold tracking-wide text-gold uppercase">
            <Icon name="briefcase" className="size-4" />
            Caso
          </p>
          <h3 className="mb-3 font-semibold text-night">{block.title}</h3>
          {block.body.map((paragraph) => (
            <p key={paragraph} className="mb-3 leading-relaxed text-ink last:mb-0">
              {paragraph}
            </p>
          ))}
        </section>
      )
    case 'exercise':
      return <PracticeExercise block={block} lang={lang} />
    case 'summary':
      return <Summary points={block.points} />
  }
}

function Summary({ points }: { points: string[] }) {
  return (
    <section className="my-8 rounded-card bg-coal px-5 py-5 text-white">
      <p className="mb-2 text-sm font-semibold text-gold">Resumo</p>
      <ul className="list-disc space-y-1 pl-5">
        {points.map((point) => (
          <li key={point}>{point}</li>
        ))}
      </ul>
    </section>
  )
}

/** A lesson's exercise: check and answer key on demand, nothing saved. */
function PracticeExercise({ block, lang }: { block: ExerciseBlock; lang: string }) {
  const { t } = useTranslation()
  const [answers, setAnswers] = useState<Answer[]>(() => block.items.map(() => null))
  const [checked, setChecked] = useState(false)
  const [showKey, setShowKey] = useState(false)
  return (
    <ExerciseView
      block={block}
      lang={lang}
      answers={answers}
      onChange={(next) => {
        setAnswers(next)
        setChecked(false)
      }}
      checked={checked}
      showKey={showKey}
      actions={
        <>
          <Button size="sm" onClick={() => setChecked(true)}>
            {t('kursos.check')}
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setShowKey(!showKey)} aria-expanded={showKey}>
            {showKey ? t('kursos.hideKey') : t('kursos.showKey')}
          </Button>
        </>
      }
    />
  )
}

type ExerciseViewProps = {
  block: ExerciseBlock
  lang: string
  answers: Answer[]
  onChange: (answers: Answer[]) => void
  checked: boolean
  showKey: boolean
  actions?: ReactNode
}

export function ExerciseView({
  block,
  lang,
  answers,
  onChange,
  checked,
  showKey,
  actions,
}: ExerciseViewProps) {
  const { t } = useTranslation()
  const set = (index: number, value: Answer) =>
    onChange(answers.map((answer, at) => (at === index ? value : answer)))
  // Match: the right-hand side in a fixed shuffled order, the same for every item.
  const rights = useMemo(
    () => (block.kind === 'match' ? shuffle(block.items.map((item) => item.right)) : []),
    [block],
  )

  return (
    <section className="my-8 rounded-card border border-line bg-surface px-5 py-5 shadow-card">
      <p className="mb-4 flex items-center gap-2 font-semibold text-night">
        <Icon name="pencil" className="size-4 text-gold" />
        {block.instruction}
      </p>
      <ol className="space-y-4">
        {block.items.map((item, index) => {
          const answer = answers[index] ?? null
          const right = itemCorrect(block, index, answer)
          return (
            <li key={itemId(item)} className="flex gap-3">
              <span className="w-5 shrink-0 pt-1 text-sm text-muted">{index + 1}.</span>
              <div className="min-w-0 flex-1" lang={lang}>
                {block.kind === 'choice' && 'options' in item && (
                  <>
                    <p className="mb-2 text-ink">{item.prompt}</p>
                    <ChoiceOptions
                      label={item.prompt}
                      options={item.options}
                      value={answer}
                      onChange={(choice) => set(index, choice)}
                    />
                  </>
                )}
                {block.kind === 'gap' && 'answers' in item && (
                  <GapInput
                    prompt={item.prompt}
                    value={String(answer ?? '')}
                    onChange={(value) => set(index, value || null)}
                  />
                )}
                {block.kind === 'match' && 'left' in item && (
                  <label className="flex flex-wrap items-center gap-3">
                    <span className="min-w-24 font-semibold text-night">{item.left}</span>
                    <span aria-hidden="true" className="text-muted">
                      →
                    </span>
                    <select
                      value={String(answer ?? '')}
                      onChange={(event) => set(index, event.target.value || null)}
                      className="h-10 rounded-xl border border-line bg-surface px-3 text-sm text-night"
                    >
                      <option value="">{t('kursos.choose')}</option>
                      {rights.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </label>
                )}
                {block.kind === 'order' && 'words' in item && (
                  <OrderInput item={item} onChange={(value) => set(index, value)} />
                )}
                {(checked || showKey) && (
                  <p className="mt-2 flex flex-wrap items-center gap-2 text-sm" lang="pt">
                    {checked && (
                      <span
                        className={`inline-flex items-center gap-1 font-semibold ${right ? 'text-success' : 'text-coral'}`}
                      >
                        <Icon name={right ? 'check' : 'close'} className="size-4" />
                        {right ? t('kursos.correct') : t('kursos.wrong')}
                      </span>
                    )}
                    {(showKey || (checked && !right)) && (
                      <span className="text-muted">{t('kursos.key', { value: itemKey(block, index) })}</span>
                    )}
                  </p>
                )}
              </div>
            </li>
          )
        })}
      </ol>
      {actions && <div className="mt-5 flex flex-wrap gap-2">{actions}</div>}
    </section>
  )
}

function GapInput({
  prompt,
  value,
  onChange,
}: {
  prompt: string
  value: string
  onChange: (value: string) => void
}) {
  const { t } = useTranslation()
  const [before, after = ''] = prompt.split('___')
  return (
    <p className="leading-loose text-ink">
      {before}
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-label={prompt}
        placeholder={t('kursos.typeHere')}
        autoCapitalize="off"
        autoCorrect="off"
        spellCheck={false}
        className="mx-1 inline-block h-9 w-36 rounded-lg border border-line bg-ash-100 px-2 text-night placeholder:text-muted/70"
      />
      {after}
    </p>
  )
}

function OrderInput({ item, onChange }: { item: OrderItem; onChange: (value: string | null) => void }) {
  const { t } = useTranslation()
  const [picked, setPicked] = useState<number[]>([])
  const pick = (next: number[]) => {
    setPicked(next)
    onChange(next.length ? next.map((index) => item.words[index]).join(' ') : null)
  }
  return (
    <div>
      <p className="mb-2 min-h-10 rounded-xl border border-dashed border-line px-3 py-2 text-night">
        {picked.map((index) => item.words[index]).join(' ')}
      </p>
      <div className="flex flex-wrap gap-2">
        {item.words.map((word, index) => (
          <button
            key={word}
            type="button"
            disabled={picked.includes(index)}
            onClick={() => pick([...picked, index])}
            className="rounded-lg border border-line bg-ash-100 px-3 py-1 text-sm text-night hover:bg-ash-200 disabled:opacity-30"
          >
            {word}
          </button>
        ))}
        {picked.length > 0 && (
          <button
            type="button"
            onClick={() => pick([])}
            className="px-2 text-sm text-muted underline"
            lang="pt"
          >
            {t('kursos.orderReset')}
          </button>
        )}
      </div>
    </div>
  )
}

const itemId = (item: ChoiceItem | GapItem | MatchItem | OrderItem) =>
  'prompt' in item ? item.prompt : 'left' in item ? item.left : item.answer

type ChoiceOptionsProps = {
  label: string
  options: string[]
  value: Answer
  onChange: (choice: number) => void
  disabled?: boolean
}

/** One-of-several answers as pills, on real radio buttons. */
export function ChoiceOptions({ label, options, value, onChange, disabled = false }: ChoiceOptionsProps) {
  const name = useId()
  return (
    <fieldset disabled={disabled} className="flex flex-wrap gap-2">
      <legend className="sr-only">{label}</legend>
      {options.map((option, choice) => (
        <label
          key={option}
          className="cursor-pointer rounded-full border border-line px-3.5 py-1.5 text-sm text-night transition-colors hover:bg-ash-100 has-checked:border-night has-checked:bg-night has-checked:text-white has-focus-visible:ring-2 has-focus-visible:ring-blue"
        >
          <input
            type="radio"
            name={name}
            className="sr-only"
            checked={value === choice}
            onChange={() => onChange(choice)}
          />
          {option}
        </label>
      ))}
    </fieldset>
  )
}
