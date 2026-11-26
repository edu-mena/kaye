import { useId } from 'react'
import type { Answer } from '../../domain/kursos'

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
