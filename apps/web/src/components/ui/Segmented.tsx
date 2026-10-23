type Option<T extends string> = { value: T; label: string }

type SegmentedProps<T extends string> = {
  label: string
  options: Option<T>[]
  value: T | null
  onChange: (value: T | null) => void
  /** Pressing the active option again clears it (filters). */
  clearable?: boolean
  className?: string
}

/** A row of toggle buttons. Scrolls sideways on phones instead of wrapping. */
export function Segmented<T extends string>({
  label,
  options,
  value,
  onChange,
  clearable = false,
  className = '',
}: SegmentedProps<T>) {
  return (
    <fieldset
      className={`-mx-4 no-scrollbar flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0 ${className}`}
    >
      <legend className="sr-only">{label}</legend>
      {options.map((option) => {
        const active = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(active && clearable ? null : option.value)}
            className={`shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-semibold transition-colors ${
              active
                ? 'border-navy bg-navy text-white'
                : 'border-line bg-surface text-navy hover:border-navy/40'
            }`}
          >
            {option.label}
          </button>
        )
      })}
    </fieldset>
  )
}
