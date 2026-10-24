import { useSearchParams } from 'react-router'

/**
 * Filters kept in the URL, so the back button and shared links keep them.
 * `setParam(key, null)` removes a filter; `clear` removes others in the same step (the page
 * number when a filter changes). Changes replace the history entry instead of adding one per
 * tap, and keep the scroll where it is.
 */
export function useUrlFilters() {
  const [params, setParams] = useSearchParams()

  const setParam = (key: string, value: string | null, clear: string[] = []) =>
    setParams(
      (current) => {
        const next = new URLSearchParams(current)
        if (value) next.set(key, value)
        else next.delete(key)
        for (const other of clear) next.delete(other)
        return next
      },
      { replace: true, preventScrollReset: true },
    )

  return [params, setParam] as const
}
