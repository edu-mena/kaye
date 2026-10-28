import { useEffect, useRef, useState } from 'react'
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

/**
 * A text filter in the URL (a search field). The field keeps what is typed and the address
 * follows: reading it back from the address, which updates a moment later, would drop letters
 * typed quickly. The field takes the address again only when it changes from outside (the
 * back button, a link, "Limpar filtros"): to a value this field did not write.
 */
export function useUrlText(key: string) {
  const [params, setParam] = useUrlFilters()
  const value = params.get(key) ?? ''
  const [text, setText] = useState(value)
  // What this field wrote since the address last caught up with it.
  const written = useRef(new Set([value]))

  useEffect(() => {
    if (value === text) written.current = new Set([value])
    else if (!written.current.has(value)) {
      written.current = new Set([value])
      setText(value)
    }
  }, [value, text])

  /** `clear`: other filters that a new text resets (the page number). */
  const change = (next: string, clear: string[] = []) => {
    const stored = next.trim() ? next : ''
    written.current.add(stored)
    setText(next)
    setParam(key, stored || null, clear)
  }

  return [text, change] as const
}
