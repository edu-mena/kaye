import { useId, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Icon, type IconName } from '../icons'
import { Button } from './Button'
import { Dialog } from './Dialog'

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

type Option = {
  value: string
  label: string
  /** A short mark next to the label in the suggestions ("Para ti"). */ hint?: string
}

type FilterSelectProps = {
  label: string
  /** The option that means "no filter". */
  placeholder: string
  value: string | null
  onChange: (value: string | null) => void
  options: Option[]
  /** Full width. */
  block?: boolean
  /** In the phone's filter sheet: the suggestions push the fields below instead of covering them. */
  sheet?: boolean
}

/** Past this many options a select becomes a box to type in: scrolling a long list takes too long. */
export const TYPE_TO_FIND = 8

const FIELD = 'h-10 rounded-full border text-sm'
const FIELD_ON = 'border-night bg-night font-normal text-white'
const FIELD_OFF = 'border-line bg-surface font-light text-night hover:border-ash-300'

/** Lower case and without accents, so "saude" finds "Saúde". */
const fold = (text: string) =>
  text
    .normalize('NFD')
    .replaceAll(/\p{Diacritic}/gu, '')
    .toLowerCase()

/**
 * A compact select for a list's toolbar. Dark while it filters, so the active filters show at a
 * glance. The label is for screen readers (the placeholder says it on screen).
 */
function FilterSelect({ label, placeholder, value, onChange, options, block = false }: FilterSelectProps) {
  const active = value !== null
  return (
    <label className={`relative block shrink-0 ${block ? 'w-full' : ''}`}>
      <span className="sr-only">{label}</span>
      <select
        value={value ?? ''}
        onChange={(event) => onChange(event.target.value || null)}
        className={`${FIELD} appearance-none pr-10 pl-4 *:bg-surface *:text-night ${active ? FIELD_ON : FIELD_OFF} ${block ? 'w-full' : ''}`}
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

/**
 * A long list as a box to type in (ARIA combobox): the matching options show while the person
 * writes, arrows and Enter pick one, Esc closes. With a value set, it shows dark with a way to clear.
 */
export function FilterCombobox({
  label,
  placeholder,
  value,
  onChange,
  options,
  block = false,
  sheet = false,
}: FilterSelectProps) {
  const { t } = useTranslation()
  const id = useId()
  const [text, setText] = useState('')
  const [open, setOpen] = useState(false)
  const [cursor, setCursor] = useState(0)
  const selected = options.find((option) => option.value === value)
  const matches = options.filter((option) => fold(option.label).includes(fold(text)))

  const pick = (option: Option) => {
    onChange(option.value)
    setText('')
    setOpen(false)
  }

  if (selected) {
    return (
      <span
        className={`inline-flex shrink-0 items-center pr-1 pl-4 ${FIELD} ${FIELD_ON} ${block ? 'w-full' : 'max-w-64'}`}
      >
        <span className="min-w-0 flex-1 truncate">
          <span className="sr-only">{label}: </span>
          {selected.label}
        </span>
        <button
          type="button"
          onClick={() => onChange(null)}
          className="grid size-8 shrink-0 place-items-center rounded-full hover:bg-white/15"
        >
          <Icon name="close" className="size-4" />
          <span className="sr-only">
            {t('common.clear')} {label}
          </span>
        </button>
      </span>
    )
  }

  return (
    <div
      className={`relative shrink-0 ${block ? 'w-full' : 'w-56'}`}
      // Open while the focus stays inside: in the box or on a suggestion.
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false)
      }}
    >
      <Icon
        name="search"
        className="pointer-events-none absolute top-5 left-3.5 size-4 -translate-y-1/2 text-muted"
      />
      <input
        type="search"
        aria-label={label}
        aria-controls={`${id}-list`}
        autoComplete="off"
        enterKeyHint="search"
        value={text}
        placeholder={placeholder}
        onChange={(event) => {
          setText(event.target.value)
          setCursor(0)
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(event) => {
          const match = matches[cursor]
          if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault()
            const step = event.key === 'ArrowDown' ? 1 : -1
            setOpen(true)
            setCursor((current) => (current + step + matches.length) % Math.max(1, matches.length))
          } else if (event.key === 'Enter' && open && match) {
            event.preventDefault()
            pick(match)
          } else if (event.key === 'Escape' && open) {
            // Closes the suggestions, not the filter sheet around them.
            event.preventDefault()
            event.stopPropagation()
            setOpen(false)
          }
        }}
        className={`${FIELD} ${FIELD_OFF} w-full pr-4 pl-10 placeholder:text-night`}
      />
      {open && (
        <ul
          id={`${id}-list`}
          aria-label={label}
          className={`z-20 mt-1 max-h-64 w-full overflow-y-auto rounded-2xl border border-line bg-surface p-1 shadow-lift ${sheet ? 'relative' : 'absolute'}`}
        >
          {matches.length === 0 && (
            <li className="px-3 py-2 text-sm font-light text-muted">{t('common.noMatches')}</li>
          )}
          {matches.map((option, index) => (
            <li key={option.value}>
              <button
                type="button"
                onClick={() => pick(option)}
                className={`block w-full rounded-xl px-3 py-2 text-left text-sm text-night hover:bg-ash-100 ${index === cursor ? 'bg-ash-100 font-normal' : 'font-light'}`}
              >
                {option.label}
                {option.hint && (
                  <span className="ml-2 rounded-full bg-ash-100 px-2 py-0.5 text-xs font-normal text-muted">
                    {option.hint}
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
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

type FilterFieldsProps = Pick<FilterBarProps, 'filters' | 'onChange'> & { block?: boolean }

function FilterFields({ filters, onChange, block = false }: FilterFieldsProps) {
  return filters.map((filter) => {
    const Field = filter.options.length > TYPE_TO_FIND ? FilterCombobox : FilterSelect
    return (
      <Field
        key={filter.key}
        label={filter.label}
        placeholder={filter.placeholder}
        value={filter.value}
        options={filter.options}
        onChange={(value) => onChange(filter.key, value)}
        block={block}
        sheet={block}
      />
    )
  })
}

/**
 * A list's filters: in one row from sm up, and a way to clear them all once any is set. On phones
 * the row would wrap into a tall block, so it is one filter button that opens them in a sheet.
 */
export function FilterBar({ filters, onChange, onClear, clearLabel }: FilterBarProps) {
  const { t } = useTranslation()
  const [sheet, setSheet] = useState(false)
  const set = filters.filter((filter) => filter.value !== null).length
  const clear = set > 0 && (
    <button
      type="button"
      onClick={onClear}
      className="inline-flex h-10 items-center gap-1.5 rounded-full px-3 text-sm font-light text-night hover:bg-ash-100"
    >
      <Icon name="close" className="size-4" />
      {clearLabel}
    </button>
  )

  return (
    <>
      <div className="hidden flex-wrap items-center gap-2 sm:flex">
        <FilterFields filters={filters} onChange={onChange} />
        {clear}
      </div>

      <div className="flex items-center gap-2 sm:hidden">
        <button
          type="button"
          onClick={() => setSheet(true)}
          className={`inline-flex h-10 items-center gap-2 rounded-full border px-4 text-sm ${set > 0 ? FIELD_ON : FIELD_OFF}`}
        >
          <Icon name="sliders" className="size-4" />
          {t('common.filters')}
          {set > 0 && (
            <span className="grid size-5 place-items-center rounded-full bg-gold text-xs font-semibold text-night">
              {set}
            </span>
          )}
        </button>
        {clear}
      </div>

      <Dialog
        open={sheet}
        onClose={() => setSheet(false)}
        title={t('common.filters')}
        footer={
          <div className="flex items-center justify-between gap-3">
            {clear || <span />}
            <Button onClick={() => setSheet(false)}>{t('common.showResults')}</Button>
          </div>
        }
      >
        {sheet && (
          <div className="space-y-3">
            <FilterFields filters={filters} onChange={onChange} block />
          </div>
        )}
      </Dialog>
    </>
  )
}
