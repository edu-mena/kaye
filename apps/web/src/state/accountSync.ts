import { useSyncExternalStore } from 'react'
import {
  ACCOUNTS,
  deleteAccount,
  completeKursoTopic,
  getData,
  getKursoProgress,
  getMe,
  giveConsent,
  logout,
  mergeData,
  putData,
  signInUrl,
  type Me,
  type Remote,
} from '../data/account'
import { ApiError } from '../lib/api'
import { LEGAL_VERSION } from '../data/legalVersion'
import { todayIso } from '../domain/scholarships'
import { getUser, replaceUser, subscribeUser, toAccount, userActions, type UserData } from './userStore'

// Offline first (ADR 0019): the app always works on this device's copy (userStore) and sends it to
// the account when there is a network. At the first login on a device, the device's copy is merged
// into the account's, never lost. Then each change goes up a moment later with the version it was
// based on; when another device wrote first (409), the server merges the two and both keep everything.

export type AccountState = { status: 'off' | 'checking' | 'signedOut' | 'signedIn'; me: Me | null }

/** Which account this device's copy belongs to, the account version it matches, and if it has changed since. */
type SyncRecord = { user: number; version: number; dirty: boolean }

const KEY = 'kaye.sync.v1'
/** Set just before going to Google: back in the app, there is a session to look for. */
const SIGNING_IN = 'kaye.signingIn'
const SEND_AFTER_MS = 1500

let account: AccountState = { status: ACCOUNTS ? 'checking' : 'off', me: null }
const listeners = new Set<() => void>()
let started = false
let applying = false
let changes = 0
let timer: ReturnType<typeof setTimeout> | undefined
let sending: Promise<void> | null = null
let sendAgain = false

function readRecord(): SyncRecord | null {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as SyncRecord) : null
  } catch {
    return null
  }
}

function writeRecord(record: SyncRecord | null) {
  try {
    if (record) localStorage.setItem(KEY, JSON.stringify(record))
    else localStorage.removeItem(KEY)
  } catch {
    // Blocked storage: the sync still works while the app is open.
  }
}

function setAccount(next: AccountState) {
  account = next
  listeners.forEach((listener) => listener())
}

/** The account's copy becomes this device's; the store change it causes is not a change to send. */
function apply(remote: Remote<Partial<UserData>>, user: number) {
  applying = true
  try {
    if (remote.data) replaceUser(remote.data)
  } finally {
    applying = false
  }
  writeRecord({ user, version: remote.version, dirty: false })
}

function signedOut() {
  writeRecord(null)
  setAccount({ status: 'signedOut', me: null })
}

/** Sends this device's copy; one request at a time, and a change made meanwhile goes right after. */
function send(): Promise<void> {
  if (sending) {
    sendAgain = true
    return sending
  }
  sending = (async () => {
    const record = readRecord()
    if (!record?.dirty) return
    const sent = changes
    try {
      const remote = await putData<Partial<UserData>>(record.version, toAccount(getUser()))
      writeRecord({ ...record, version: remote.version, dirty: changes !== sent })
    } catch (error) {
      if (error instanceof ApiError && error.status === 409)
        apply(await mergeData<Partial<UserData>>(toAccount(getUser())), record.user)
      else if (error instanceof ApiError && error.status === 401) signedOut()
      // Anything else (no network): the copy stays marked and goes later.
    }
  })()
    .catch(() => {})
    .finally(() => {
      sending = null
      if (sendAgain) {
        sendAgain = false
        void send()
      }
    })
  return sending
}

function onUserChange() {
  if (applying) return
  const record = readRecord()
  if (!record) return
  changes += 1
  if (!record.dirty) writeRecord({ ...record, dirty: true })
  clearTimeout(timer)
  timer = setTimeout(() => void send(), SEND_AFTER_MS)
}

/** The first login on this device: its copy joins the account's, then the texts it accepted are recorded. */
async function firstLogin(me: Me) {
  apply(await mergeData<Partial<UserData>>(toAccount(getUser())), me.id)
  const profile = getUser().profile
  if (!profile || me.consents.includes('terms')) return
  const kinds = [
    'terms',
    'privacy',
    ...(profile.guardianInformed ? ['guardian_informed' as const] : []),
  ] as const
  await Promise.all(kinds.map((kind) => giveConsent(kind, LEGAL_VERSION))).catch(() => {})
}

function signingIn(): boolean {
  try {
    return localStorage.getItem(SIGNING_IN) !== null
  } catch {
    return false
  }
}

async function connect() {
  // Only a device that signed in, or is coming back from Google, asks who it is: a visitor
  // without an account never gets a 401 (which the browser logs as an error).
  if (!readRecord() && !signingIn()) return signedOut()
  let me: Me | null
  try {
    me = await getMe()
  } catch {
    // No network: this device keeps working and tries again when the network is back.
    return
  }
  try {
    localStorage.removeItem(SIGNING_IN)
  } catch {
    // Blocked storage: nothing was kept.
  }
  if (!me) return signedOut()
  setAccount({ status: 'signedIn', me })

  const record = readRecord()
  if (record?.user !== me.id) return firstLogin(me)
  if (record.dirty) await send()
  else {
    // Another device may have written since: its copy comes down.
    const remote = await getData<Partial<UserData>>()
    if (remote.version !== record.version) apply(remote, me.id)
  }
  await pullKursos()
}

/** The topics finished on the account join this device's (the server is the one that counts the days). */
async function pullKursos() {
  try {
    userActions.mergeKursoCompletions((await getKursoProgress()).completions)
  } catch {
    // No network: this device's copy stays as it is.
  }
}

/**
 * A topic (or the passed exam) was finished on this device: the account records it with the local day.
 * The device keeps its own copy either way; a refusal (daily limit) is the server's word for the day.
 */
export async function reportKursoTopic(course: string, topic: string, score?: number) {
  if (account.status !== 'signedIn') return
  try {
    await completeKursoTopic(course, topic, todayIso(), score)
  } catch {
    // Offline or refused: the next pull brings the account's truth.
  }
}

/** Starts the sync once, at launch, in the build with accounts. */
export function startAccountSync(): Promise<void> {
  if (!ACCOUNTS || started) return Promise.resolve()
  started = true
  subscribeUser(onUserChange)
  window.addEventListener('online', () => {
    if (account.status === 'checking') void connect().catch(() => {})
    else void send()
  })
  return connect().catch(() => {})
}

/** Goes to Google's login; it comes back to `next` in this app, with the session. */
export function beginSignIn(next = '/') {
  try {
    localStorage.setItem(SIGNING_IN, '1')
  } catch {
    // Blocked storage: the login still works, the app just will not look for it until reopened.
  }
  window.location.assign(signInUrl(next))
}

/** Ends the session on this device. The data stays here, as it was before the login. */
export async function signOut() {
  try {
    await logout()
  } finally {
    signedOut()
  }
}

/** "Apagar os meus dados": with an account, the account goes first; if that fails, nothing is erased. */
export async function eraseEverything() {
  if (account.status === 'signedIn') {
    await deleteAccount()
    signedOut()
  }
  userActions.eraseAll()
}

export function getAccount(): AccountState {
  return account
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function useAccount(): AccountState {
  return useSyncExternalStore(subscribe, getAccount)
}
