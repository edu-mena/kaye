import { Icon } from './icons'
import { Segmented } from './ui/Segmented'

type AreaPickerProps<T extends string> = {
  label: string
  options: { value: T; label: string }[]
  value: T | null
  onChange: (value: T) => void
}

/**
 * One area of the catalogue at a time (technology, health…): a row of buttons from tablets up and a select on
 * phones, where thirteen long names do not fit a row.
 */
export function AreaPicker<T extends string>({ label, options, value, onChange }: AreaPickerProps<T>) {
  return (
    <>
      <label className="relative mb-4 block sm:hidden">
        <span className="sr-only">{label}</span>
        <select
          value={value ?? ''}
          onChange={(event) => {
            const picked = options.find((option) => option.value === event.target.value)
            if (picked) onChange(picked.value)
          }}
          className="h-11 w-full appearance-none rounded-full border border-line bg-surface pr-10 pl-4 text-sm text-night *:bg-surface"
        >
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
      <div className="mb-4 hidden sm:block">
        <Segmented
          label={label}
          options={options}
          value={value}
          onChange={(picked) => picked && onChange(picked)}
        />
      </div>
    </>
  )
}
