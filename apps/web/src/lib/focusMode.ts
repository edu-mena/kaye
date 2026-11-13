import { useEffect, useSyncExternalStore } from 'react'

// Focus mode: while an interview or a psychotechnical test runs, the layout hides the sidebar,
// the top bar and the bottom bar, so nothing pulls the person out of it.

let active = 0
const listeners = new Set<() => void>()
const notify = () => listeners.forEach((listener) => listener())

const subscribe = (listener: () => void) => {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

/** True while some screen asks for focus. */
export const useFocusMode = () => useSyncExternalStore(subscribe, () => active > 0)

/** Asks for focus while `on` and the component is mounted. */
export function useFocus(on: boolean) {
  useEffect(() => {
    if (!on) return
    active += 1
    notify()
    window.scrollTo({ top: 0 })
    return () => {
      active -= 1
      notify()
    }
  }, [on])
}
