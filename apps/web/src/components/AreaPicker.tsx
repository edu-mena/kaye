import { useTranslation } from 'react-i18next'
import { FilterCombobox } from './ui/Filters'

const NONE: readonly never[] = []

type AreaPickerProps<T extends string> = {
  label: string
  /** The option that means "every area". */
  allLabel: string
  options: { value: T; label: string }[]
  value: T | null
  onChange: (value: T | null) => void
  /** The person's areas, most interesting first: they lead the suggestions, marked "Para ti". */
  mine?: readonly T[]
  className?: string
}

/**
 * One area of the catalogue (technology, health…) as a box to type in, with the matching areas
 * as suggestions: thirteen long names do not fit a row of buttons, and a long select is slow.
 */
export function AreaPicker<T extends string>({
  label,
  allLabel,
  options,
  value,
  onChange,
  mine = NONE,
  className = '',
}: AreaPickerProps<T>) {
  const { t } = useTranslation()
  const rank = (option: { value: T }) => {
    const index = mine.indexOf(option.value)
    return index === -1 ? mine.length : index
  }
  const sorted = options
    .toSorted((a, b) => rank(a) - rank(b))
    .map((option) => ({
      value: option.value,
      label: option.label,
      hint: mine.includes(option.value) ? t('common.forYou') : undefined,
    }))
  return (
    <div className={className}>
      <FilterCombobox
        block
        label={label}
        placeholder={allLabel}
        options={sorted}
        value={value}
        onChange={(picked) => onChange(options.find((option) => option.value === picked)?.value ?? null)}
      />
    </div>
  )
}
