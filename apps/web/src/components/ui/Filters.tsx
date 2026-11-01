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
                <span className="block truncate text-sm leading-snug font-semibold">{tile.label}</span>
                <span
                  className={`mt-1 block truncate text-xs font-light ${active ? 'text-white/70' : 'text-muted'}`}
                >
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

type Option = { value: string; label: string }

type FilterSelectProps = {
  label: string
  /** The option that means "no filter". */
  placeholder: string
  value: string | null
  onChange: (value: string | null) => void
  options: Option[]
}

/**
 * A compact select for a list's toolbar. Dark while it filters, so the active filters show at a
 * glance. The label is for screen readers (the placeholder says it on screen).
 */
function FilterSelect({ label, placeholder, value, onChange, options }: FilterSelectProps) {
  const active = value !== null
  return (
    <label className="relative block shrink-0">
      <span className="sr-only">{label}</span>
      <select
        value={value ?? ''}
        onChange={(event) => onChange(event.target.value || null)}
        className={`h-10 appearance-none rounded-full border pr-10 pl-4 text-sm *:bg-surface *:text-night ${
          active
            ? 'border-night bg-night font-normal text-white'
            : 'border-line bg-surface font-light text-night hover:border-ash-300'
        }`}
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
        className={`pointer-events-none absolute top-1/2 right-3.5 size-4 -translate-y-1/2 rotate-90 ${active ? 'text-white' : 'text-muted'}`}
      />
    </label>
  )
}

type FilterDef = {
  key: string
  label: string
  placeholder: string
  value: string | null
  options: Option[]
}

type FilterBarProps = {
  filters: FilterDef[]
  onChange: (key: string, value: string | null) => void
  onClear: () => void
  clearLabel: string
}

/** A list's filters in one row (it wraps), and a way to clear them all once any is set. */
export function FilterBar({ filters, onChange, onClear, clearLabel }: FilterBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {filters.map((filter) => (
        <FilterSelect
          key={filter.key}
          label={filter.label}
          placeholder={filter.placeholder}
          value={filter.value}
          options={filter.options}
          onChange={(value) => onChange(filter.key, value)}
        />
      ))}
      {filters.some((filter) => filter.value !== null) && (
        <button
          type="button"
          onClick={onClear}
          className="inline-flex h-10 items-center gap-1.5 rounded-full px-3 text-sm font-light text-night hover:bg-ash-100"
        >
          <Icon name="close" className="size-4" />
          {clearLabel}
        </button>
      )}
    </div>
  )
}
