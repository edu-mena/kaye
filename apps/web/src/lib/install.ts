import { Capacitor } from '@capacitor/core'
import { useSyncExternalStore } from 'react'

/**
 * Installing the web app on the phone's home screen (PWA). Chrome and Edge fire `beforeinstallprompt`
 * and we keep it for our own "Instalar" button; iPhone never does, so there we show how to do it
 * by hand (Partilhar → Adicionar ao ecrã principal). Inside the Android app none of this applies.
 */

/** Chrome's event, not in the DOM types. */
type InstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const VISITS = 'kaye.visits'
const DISMISSED = 'kaye.install.dismissed'
const SESSION = 'kaye.visit.counted'

let deferred: InstallPromptEvent | null = null
let installed = false
let dismissed = readFlag(DISMISSED)
let visits = 0
let snapshot = takeSnapshot()
const listeners = new Set<() => void>()

function readFlag(key: string): boolean {
  try {
    return localStorage.getItem(key) === '1'
  } catch {
    return false
  }
}

/** Already on the home screen: opened in its own window, or Safari's own flag on iPhone. */
function runningInstalled(): boolean {
  if (typeof window === 'undefined') return false
  const ios = (navigator as Navigator & { standalone?: boolean }).standalone === true
  return ios || window.matchMedia?.('(display-mode: standalone)').matches === true
}

function isIos(): boolean {
  if (typeof navigator === 'undefined') return false
  // iPadOS says it is a Mac; the touch screen gives it away.
  return (
    /iphone|ipad|ipod/i.test(navigator.userAgent) ||
    (/macintosh/i.test(navigator.userAgent) && navigator.maxTouchPoints > 1)
  )
}

export type InstallState = {
  /** How the app can be installed here: Chrome's prompt, the iPhone guide, or not at all. */
  method: 'prompt' | 'ios' | null
  /** Seen at least twice: the home card waits for the second visit. */
  returning: boolean
  /** The person said "Agora não" to the home card. */
  dismissed: boolean
}

function takeSnapshot(): InstallState {
  const unavailable = installed || Capacitor.isNativePlatform() || runningInstalled()
  const method = unavailable ? null : deferred ? 'prompt' : isIos() ? 'ios' : null
  return { method, returning: visits >= 2, dismissed }
}

function notify() {
  snapshot = takeSnapshot()
  listeners.forEach((listener) => listener())
}

/** Called once at start-up (main.tsx): counts the visit and listens for Chrome's install offer. */
export function startInstallWatch() {
  if (Capacitor.isNativePlatform()) return
  try {
    visits = Number(localStorage.getItem(VISITS) ?? '0') || 0
    // A visit is a new tab or a new opening, not every reload.
    if (!sessionStorage.getItem(SESSION)) {
      visits += 1
      localStorage.setItem(VISITS, String(visits))
      sessionStorage.setItem(SESSION, '1')
    }
  } catch {
    // Storage blocked (private windows): every visit looks like the first, so the card stays away.
  }
  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault()
    deferred = event as InstallPromptEvent
    notify()
  })
  window.addEventListener('appinstalled', () => {
    installed = true
    deferred = null
    notify()
  })
  notify()
}

/** Opens Chrome's install dialog. Each offer can be used once. */
export async function promptInstall(): Promise<void> {
  const event = deferred
  if (!event) return
  deferred = null
  await event.prompt()
  const { outcome } = await event.userChoice
  if (outcome === 'accepted') installed = true
  notify()
}

/** "Agora não": the home card does not come back (Settings keep the option). */
export function dismissInstall() {
  dismissed = true
  try {
    localStorage.setItem(DISMISSED, '1')
  } catch {
    // Lasts for the visit.
  }
  notify()
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function useInstall(): InstallState {
  return useSyncExternalStore(subscribe, () => snapshot)
}
