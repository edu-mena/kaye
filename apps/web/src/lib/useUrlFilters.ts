import { useSearchParams } from 'react-router'

/**
 * Filters kept in the URL, so the back button and shared links keep them.
 * `setParam(key, null)` removes a filter; changes replace the history entry
 * instead of adding one per tap.
 */
export function useUrlFilters() {
  const [params, setParams] = useSearchParams()

  const setParam = (key: string, value: string | null) =>
    setParams(
      (current) => {
        const next = new URLSearchParams(current)
        if (value) next.set(key, value)
        else next.delete(key)
        return next
      },
      { replace: true },
    )

  return [params, setParam] as const
}
