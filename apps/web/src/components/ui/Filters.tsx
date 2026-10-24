import { Icon, type IconName } from '../icons'

type Tile<T extends string> = { value: T; icon: IconName; label: string; note: string }

type FilterTilesProps<T extends string> = {
  tiles: Tile<T>[]
  selected: T | null
  onSelect: (value: T | null) => void
  /** Grid columns from sm up. */
  columns?: string
}

/**
 * Filters as tiles: the icon in a dark circle on the left, the name and how many on the right.
 * Pressing the active tile again clears the filter. A row that scrolls sideways on phones.
 */
export function FilterTiles<T extends string>({
  tiles,
  selected,
  onSelect,
  columns = 'sm:grid-cols-3 lg:grid-cols-5',
}: FilterTilesProps<T>) {
  return (
    <ul
      className={`-mx-3 no-scrollbar flex gap-3 overflow-x-auto px-3 pb-2 sm:mx-0 sm:grid sm:overflow-visible sm:px-0 ${columns}`}
    >
      {tiles.map((tile) => {
        const active = selected === tile.value
        return (
          <li key={tile.value} className="shrink-0">
            <button
              type="button"
              aria-pressed={active}
              onClick={() => onSelect(active ? null : tile.value)}
              className={`flex h-full w-56 items-center gap-3 rounded-2xl border p-3 pr-4 text-left transition duration-300 sm:w-full ${
                active
                  ? 'border-night bg-night text-white'
                  : 'border-line bg-surface text-night hover:-translate-y-0.5 hover:shadow-card'
              }`}
            >
              <span
                className={`grid size-10 shrink-0 place-items-center rounded-full text-gold ${active ? 'bg-white/10' : 'bg-coal'}`}
              >
                <Icon name={tile.icon} className="size-5" />
              </span>
              <span className="min-w-0">
                <span className="block text-sm leading-snug font-semibold">{tile.label}</span>
                <span className={`mt-1 block text-xs font-light ${active ? 'text-white/70' : 'text-muted'}`}>
                  {tile.note}
                </span>
              </span>
            </button>
          </li>
        )
      })}
    </ul>
  )
}

type FilterSelectProps = {
  label: string
  /** The option that means "no filter". */
  placeholder: string
  value: string | null
  onChange: (value: string | null) => void
  options: { value: string; label: string }[]
}

/** A compact select for a list's toolbar, next to the order. The label is for screen readers. */
export function FilterSelect({ label, placeholder, value, onChange, options }: FilterSelectProps) {
  return (
    <label className="relative block">
      <span className="sr-only">{label}</span>
      <select
        value={value ?? ''}
        onChange={(event) => onChange(event.target.value || null)}
        className="h-10 appearance-none rounded-full border border-line bg-surface pr-10 pl-4 text-sm font-light text-night hover:border-ash-300"
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <Icon
        name="chevronRight"
        className="pointer-events-none absolute top-1/2 right-3.5 size-4 -translate-y-1/2 rotate-90 text-muted"
      />
    </label>
  )
}
