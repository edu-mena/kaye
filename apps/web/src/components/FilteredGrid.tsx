import { type ReactNode, useState } from 'react'
import { FilterCombobox, TYPE_TO_FIND } from './ui/Filters'
import { Pagination } from './ui/Pagination'

type GridFilter = {
  key: string
  label: string
  /** The option that means "no filter". */
  placeholder: string
  value: string
  options: { value: string; label: string }[]
  onChange: (value: string) => void
}

type FilteredGridProps<T> = {
  filters: GridFilter[]
  items: T[]
  itemKey: (item: T) => string
  renderItem: (item: T) => ReactNode
  /** Shown when no item passes the filters. */
  empty: string
  pagesLabel: string
  pageSize?: number
}

const SELECT = 'mt-1 h-11 w-full rounded-full border border-line bg-surface px-4 text-sm text-night'

/**
 * Cards in two columns under labelled selects, a page at a time: a detail page's list (the institutions that
 * teach a course, the courses an institution teaches). A filter change goes back to the first page.
 */
export function FilteredGrid<T>({
  filters,
  items,
  itemKey,
  renderItem,
  empty,
  pagesLabel,
  pageSize = 6,
}: FilteredGridProps<T>) {
  const [page, setPage] = useState(1)
  const pages = Math.max(1, Math.ceil(items.length / pageSize))
  const current = Math.min(page, pages)
  return (
    <>
      {filters.length > 0 && (
        <div className="mb-6 grid gap-4 sm:grid-cols-2">
          {filters.map((filter) =>
            filter.options.length > TYPE_TO_FIND ? (
              <div key={filter.key}>
                <span aria-hidden="true" className="mb-1 block text-xs font-light text-muted">
                  {filter.label}
                </span>
                <FilterCombobox
                  block
                  label={filter.label}
                  placeholder={filter.placeholder}
                  options={filter.options}
                  value={filter.value || null}
                  onChange={(value) => {
                    filter.onChange(value ?? '')
                    setPage(1)
                  }}
                />
              </div>
            ) : (
              <label key={filter.key} className="block">
                <span className="block text-xs font-light text-muted">{filter.label}</span>
                <select
                  value={filter.value}
                  onChange={(event) => {
                    filter.onChange(event.target.value)
                    setPage(1)
                  }}
                  className={SELECT}
                >
                  <option value="">{filter.placeholder}</option>
                  {filter.options.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            ),
          )}
        </div>
      )}
      {items.length === 0 ? (
        <p className="text-sm font-light text-copy">{empty}</p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {items.slice((current - 1) * pageSize, current * pageSize).map((item) => (
            <li key={itemKey(item)}>{renderItem(item)}</li>
          ))}
        </ul>
      )}
      <Pagination page={current} pages={pages} onChange={setPage} label={pagesLabel} />
    </>
  )
}
