import type { ReactNode } from 'react'
import { Icon, type IconName } from '../../components/icons'
import { stagger } from '../../lib/ui'

type Option<T extends string> = {
  value: T
  label: string
  body?: string
  /** A flat icon in a circle, or a small drawing of its own. */
  icon?: IconName
  art?: ReactNode
}

type OptionGridProps<T extends string> = {
  label: string
  options: Option<T>[]
  selected: readonly T[]
  onToggle: (value: T) => void
  /** Reached the most that can be chosen: only what is chosen can still be touched. */
  full?: boolean
}

/** The answers of a question: two columns on a phone, three when there is room for many. */
export function OptionGrid<T extends string>({
  label,
  options,
  selected,
  onToggle,
  full = false,
}: OptionGridProps<T>) {
  return (
    <fieldset>
      <legend className="sr-only">{label}</legend>
      <ul className={`grid grid-cols-2 gap-3 ${options.length > 6 ? 'sm:grid-cols-3' : ''}`}>
        {options.map((option, index) => {
          const active = selected.includes(option.value)
          return (
            <li key={option.value} className="rise" style={stagger(index)}>
              <button
                type="button"
                aria-pressed={active}
                disabled={full && !active}
                onClick={() => onToggle(option.value)}
                className={`relative flex h-full min-h-36 w-full flex-col items-center justify-center gap-3 rounded-card p-4 text-center transition duration-300 active:scale-[0.97] disabled:opacity-45 ${
                  active ? 'bg-night text-white shadow-lift' : 'bg-paper text-night hover:bg-ash-100'
                }`}
              >
                {option.art ?? (
                  <span
                    className={`grid size-14 place-items-center rounded-full transition-colors duration-300 ${
                      active ? 'bg-white text-night' : 'bg-coal text-gold'
                    }`}
                  >
                    {option.icon && <Icon name={option.icon} className="size-6" />}
                  </span>
                )}
                <span className="block">
                  <span className="block text-sm leading-snug font-semibold">{option.label}</span>
                  {option.body && (
                    <span className={`mt-1 block text-xs font-light ${active ? 'text-white' : 'text-copy'}`}>
                      {option.body}
                    </span>
                  )}
                </span>
                {active && (
                  <span className="absolute top-3 right-3 grid size-6 animate-pop place-items-center rounded-full bg-gold text-night">
                    <Icon name="check" className="size-4" />
                  </span>
                )}
              </button>
            </li>
          )
        })}
      </ul>
    </fieldset>
  )
}

/** Steps that rise with the level: how far someone has gone, drawn instead of an icon. */
export function LevelBars({ level, total }: { level: number; total: number }) {
  return (
    <span aria-hidden="true" className="flex h-14 items-end gap-1.5">
      {Array.from({ length: total }, (_, index) => (
        <span
          key={index}
          style={{ height: `${((index + 1) / total) * 100}%`, ...stagger(index) }}
          className={`w-3 origin-bottom animate-grow rounded-full bg-current ${index < level ? '' : 'opacity-20'}`}
        />
      ))}
    </span>
  )
}
