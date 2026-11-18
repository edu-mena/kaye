import { useSyncExternalStore } from 'react'
import { getUser } from './userStore'

// Exploring needs no account (docs/decisoes/0021): the sign-up only appears when the person saves something,
// comments or makes the plan. Every such action asks here first; without a profile it opens the prompt instead.

let open = false
const listeners = new Set<() => void>()

function setOpen(value: boolean) {
  open = value
  listeners.forEach((listener) => listener())
}

/** True when the person has a profile. Otherwise the sign-up prompt opens and the action must not run. */
function askForAccount(): boolean {
  if (getUser().profile) return true
  setOpen(true)
  return false
}

/** An action that only runs for someone with a profile; without one, the prompt opens. */
export function needsAccount<Args extends unknown[]>(action: (...args: Args) => void) {
  return (...args: Args) => {
    if (askForAccount()) action(...args)
  }
}

export function closeAccountPrompt() {
  setOpen(false)
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function useAccountPrompt(): boolean {
  return useSyncExternalStore(subscribe, () => open)
}
