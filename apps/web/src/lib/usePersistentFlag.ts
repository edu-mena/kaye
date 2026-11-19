import { useCallback, useState } from 'react'

/**
 * A yes/no preference remembered on this device, such as the folded sidebar.
 * Works without storage too (private windows): it then lasts for the visit.
 */
export function usePersistentFlag(key: string, initial: boolean) {
  const [value, setValue] = useState(() => {
    try {
      const saved = localStorage.getItem(key)
      return saved === null ? initial : saved === '1'
    } catch {
      return initial
    }
  })

  // Stable, so effects that depend on it do not run again on every render.
  const update = useCallback(
    (next: boolean) => {
      setValue(next)
      try {
        localStorage.setItem(key, next ? '1' : '0')
      } catch {
        // Storage blocked: the choice still holds until the page closes.
      }
    },
    [key],
  )

  return [value, update] as const
}
