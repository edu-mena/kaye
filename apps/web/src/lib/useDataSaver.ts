import { useSyncExternalStore } from 'react'

/** What the person chose: on, off, or nothing yet (then the phone's own "save data" decides). */
export type DataSaverChoice = 'on' | 'off' | 'auto'

const KEY = 'kaye.dataSaver'
const listeners = new Set<() => void>()

/** The Network Information API, only in some browsers (Chrome on Android among them). */
type NavigatorWithConnection = Navigator & { connection?: { saveData?: boolean } }

function readChoice(): DataSaverChoice {
  try {
    const saved = localStorage.getItem(KEY)
    return saved === 'on' || saved === 'off' ? saved : 'auto'
  } catch {
    return memory
  }
}

// Storage blocked (private windows): the choice lasts for the visit.
let memory: DataSaverChoice = 'auto'

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

/** True when the phone asks for less data ("Poupança de dados" in Chrome). */
export function deviceSavesData(): boolean {
  if (typeof navigator === 'undefined') return false
  return (navigator as NavigatorWithConnection).connection?.saveData === true
}

export function setDataSaver(choice: 'on' | 'off') {
  memory = choice
  try {
    localStorage.setItem(KEY, choice)
  } catch {
    // Kept in memory above.
  }
  listeners.forEach((listener) => listener())
}

/** The person's choice, shared by every screen so the switch takes effect at once. */
export function useDataSaverChoice(): DataSaverChoice {
  return useSyncExternalStore(subscribe, readChoice, () => 'auto')
}

/** Whether to save data now: the switch, or the phone's setting while there is no choice. */
export function useDataSaver(): boolean {
  const choice = useDataSaverChoice()
  return choice === 'on' || (choice === 'auto' && deviceSavesData())
}
