import { Icon } from './icons'

type AreaPickerProps<T extends string> = {
  label: string
  /** The option that means "every area". */
  allLabel: string
  options: { value: T; label: string }[]
  value: T | null
  onChange: (value: T | null) => void
  className?: string
}

/**
 * One area of the catalogue (technology, health…) as a select, "todas as áreas" first: thirteen
 * long names do not fit a row of buttons, on a phone or otherwise.
 */
export function AreaPicker<T extends string>({
  label,
  allLabel,
  options,
  value,
  onChange,
  className = '',
}: AreaPickerProps<T>) {
  return (
    <label className={`relative block ${className}`}>
      <span className="sr-only">{label}</span>
      <select
        value={value ?? ''}
        onChange={(event) => {
          const picked = options.find((option) => option.value === event.target.value)
          onChange(picked ? picked.value : null)
        }}
        className="h-11 w-full appearance-none rounded-full border border-line bg-surface pr-10 pl-4 text-sm text-night *:bg-surface"
      >
        <option value="">{allLabel}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <Icon
        name="chevronRight"
        className="pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2 rotate-90 text-muted"
      />
    </label>
  )
}
