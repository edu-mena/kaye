import { Icon, type IconName } from '../icons'

type TogglesProps<T extends string> = {
  legend: string
  options: { value: T; label: string; icon: IconName }[]
  selected: readonly T[]
  onToggle: (value: T) => void
}

/** A group of pill buttons, each one on or off (the areas and the kinds of news a person follows). */
export function Toggles<T extends string>({ legend, options, selected, onToggle }: TogglesProps<T>) {
  return (
    <fieldset className="mt-5">
      <legend className="text-sm font-semibold text-night">{legend}</legend>
      <ul className="mt-2 flex flex-wrap gap-2">
        {options.map((option) => {
          const active = selected.includes(option.value)
          return (
            <li key={option.value}>
              <button
                type="button"
                aria-pressed={active}
                onClick={() => onToggle(option.value)}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-normal transition ${
                  active
                    ? 'border-night bg-night text-white'
                    : 'border-line bg-surface text-night hover:bg-ash-100'
                }`}
              >
                <Icon name={active ? 'check' : option.icon} className="size-3.5" />
                {option.label}
              </button>
            </li>
          )
        })}
      </ul>
    </fieldset>
  )
}
