import { useTranslation } from 'react-i18next'
import type { Figure, Question, Statement } from '../../domain/psychotech'

const OPTION =
  'rounded-2xl border border-line bg-surface px-4 py-3 text-left text-sm font-normal text-night transition-colors hover:border-night hover:bg-ash-100'

/** Up to three shapes in a row, outlined or filled. */
function FigureMark({ figure }: { figure: Figure }) {
  const { t } = useTranslation()
  const step = 60 / (figure.count + 1)
  const label = t('psychotech.figure', {
    count: figure.count,
    shape: t(`psychotech.shape_${figure.shape}`),
    fill: t(figure.filled ? 'psychotech.filled' : 'psychotech.empty'),
  })
  return (
    // An inline drawing made from the question's data, so there is no file for an <img>; role="img" plus a label
    // is how such a drawing is announced as one picture.
    // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role
    <svg viewBox="0 0 60 30" role="img" aria-label={label} className="h-10 w-20">
      {Array.from({ length: figure.count }, (_, i) => {
        const x = step * (i + 1)
        const paint = {
          fill: figure.filled ? 'currentColor' : 'none',
          stroke: 'currentColor',
          strokeWidth: 2,
        }
        if (figure.shape === 'circle') return <circle key={i} cx={x} cy={15} r={7} {...paint} />
        if (figure.shape === 'square')
          return <rect key={i} x={x - 6.5} y={8.5} width={13} height={13} {...paint} />
        if (figure.shape === 'triangle')
          return <polygon key={i} points={`${x},7 ${x + 8},22 ${x - 8},22`} {...paint} />
        return <polygon key={i} points={`${x},6 ${x + 8},15 ${x},24 ${x - 8},15`} {...paint} />
      })}
    </svg>
  )
}

function useStatement() {
  const { t } = useTranslation()
  return (statement: Statement) => t(`psychotech.q_${statement.q}`, { a: statement.a, b: statement.b })
}

const figureKey = (figure: Figure) => `${figure.count}-${figure.shape}-${figure.filled}`

/** A number or letter series; the terms can repeat, and their place in the row is what identifies them. */
function Series({ terms, ask }: { terms: string[]; ask: string }) {
  return (
    <>
      <p className="text-sm font-light text-copy">{ask}</p>
      <p className="flex flex-wrap items-center gap-2 text-2xl font-semibold text-night tabular-nums">
        {[...terms, '?'].map((term, index) => (
          // A fixed row that never reorders, and terms repeat: the position is the identity.
          // oxlint-disable-next-line react/no-array-index-key
          <span key={index} className="rounded-xl bg-ash-100 px-3 py-1.5">
            {term}
          </span>
        ))}
      </p>
    </>
  )
}

type Props = { question: Question; onAnswer: (index: number) => void }

/** One question and its options; choosing an option answers it (no going back, as in the real tests). */
export function QuestionView({ question, onAnswer }: Props) {
  const { t } = useTranslation()
  const say = useStatement()

  const textOptions = (options: string[]) => (
    <div className="grid grid-cols-2 gap-3">
      {options.map((option, index) => (
        <button key={option} type="button" className={OPTION} onClick={() => onAnswer(index)}>
          {option}
        </button>
      ))}
    </div>
  )

  switch (question.kind) {
    case 'series':
      return (
        <div className="space-y-5">
          <Series
            terms={question.terms}
            ask={t(
              question.skill === 'numerical' ? 'psychotech.ask_numberSeries' : 'psychotech.ask_letterSeries',
            )}
          />
          {textOptions(question.options)}
        </div>
      )
    case 'syllogism':
      return (
        <div className="space-y-5">
          <ul className="space-y-1 rounded-2xl bg-ash-100 p-4 text-base font-normal text-night">
            {question.premises.map((premise) => (
              <li key={say(premise)}>{say(premise)}</li>
            ))}
          </ul>
          <p className="text-sm font-light text-copy">{t('psychotech.ask_syllogism')}</p>
          <div className="grid gap-3">
            {question.options.map((option, index) => (
              <button key={say(option)} type="button" className={OPTION} onClick={() => onAnswer(index)}>
                {say(option)}
              </button>
            ))}
          </div>
        </div>
      )
    case 'matrix':
      return (
        <div className="space-y-5">
          <p className="text-sm font-light text-copy">{t('psychotech.ask_matrix')}</p>
          <div className="grid max-w-xs grid-cols-3 gap-2 text-night">
            {question.cells.map((cell, index) => (
              // The 3×3 grid is fixed and cells repeat: the position is the identity.
              // oxlint-disable-next-line react/no-array-index-key
              <div key={index} className="grid h-14 place-items-center rounded-xl bg-ash-100">
                {cell ? (
                  <FigureMark figure={cell} />
                ) : (
                  <span className="text-xl font-semibold text-muted">
                    ?<span className="sr-only">{t('psychotech.missing')}</span>
                  </span>
                )}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {question.options.map((option, index) => (
              <button
                key={figureKey(option)}
                type="button"
                className={`${OPTION} grid place-items-center`}
                onClick={() => onAnswer(index)}
              >
                <FigureMark figure={option} />
              </button>
            ))}
          </div>
        </div>
      )
    case 'analogy':
      return (
        <div className="space-y-5">
          <p className="text-lg font-normal text-night">
            {t('psychotech.ask_analogy', { a: question.a, b: question.b, c: question.c })}
          </p>
          {textOptions(question.options)}
        </div>
      )
    case 'synonym':
      return (
        <div className="space-y-5">
          <p className="text-lg font-normal text-night">
            {t('psychotech.ask_synonym', { word: question.word })}
          </p>
          {textOptions(question.options)}
        </div>
      )
    case 'odd':
      return (
        <div className="space-y-5">
          <p className="text-sm font-light text-copy">{t('psychotech.ask_odd')}</p>
          <fieldset
            aria-label={t('psychotech.symbolsLabel')}
            className="grid max-w-sm min-w-0 gap-1.5"
            style={{ gridTemplateColumns: `repeat(${question.columns}, minmax(0, 1fr))` }}
          >
            {question.options.map((symbol, index) => (
              <button
                // A fixed grid of mostly identical symbols: the position is the identity.
                // oxlint-disable-next-line react/no-array-index-key
                key={index}
                type="button"
                aria-label={t('psychotech.cellLabel', { n: index + 1, symbol })}
                onClick={() => onAnswer(index)}
                className="grid aspect-square place-items-center rounded-lg bg-ash-100 text-xl font-semibold text-night hover:bg-ash-200"
              >
                {symbol}
              </button>
            ))}
          </fieldset>
        </div>
      )
  }
}
