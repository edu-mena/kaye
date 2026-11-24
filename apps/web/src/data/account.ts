import { api, ApiError } from '../lib/api'

// The account on the Laravel API (docs/arquitetura.md, 5.1 and 6). Only the build the Laravel serves
// (VITE_DATA_SOURCE=api) has accounts; the demo site keeps everything on the device.

export const ACCOUNTS = import.meta.env.VITE_DATA_SOURCE === 'api'

/** Where the web login starts; Google sends the person back to `next` with the session cookie. */
export function signInUrl(next = '/'): string {
  return `/auth/google/redirect?next=${encodeURIComponent(next)}`
}

/** "Os meus dados" from the server: a JSON file, downloaded with the session cookie. */
export const EXPORT_URL = '/api/v1/me/export'

export type Me = {
  id: number
  name: string
  email: string
  avatarUrl: string | null
  birthYear: number | null
  minor: boolean
  consents: string[]
}

/** The account's copy of the data and its version; `data` is null before the first write. */
export type Remote<T> = { version: number; data: T | null }

export type ConsentKind = 'terms' | 'privacy' | 'guardian_informed' | 'community_count' | NoticeConsent

/** The notices, one consent per channel and purpose: service (saved deadlines) or marketing (the news). */
export type NoticeConsent = 'email_service' | 'email_marketing' | 'push_service' | 'push_marketing'

const json = (body: unknown): RequestInit => ({ body: JSON.stringify(body) })

/** The signed-in person, or null without a session. */
export async function getMe(): Promise<Me | null> {
  try {
    return await api<Me>('/me')
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) return null
    throw error
  }
}

export const getData = <T>() => api<Remote<T>>('/me/data')

/** Replaces the account's copy; a stale `version` fails with 409. */
export const putData = <T>(version: number, data: unknown) =>
  api<Remote<T>>('/me/data', { method: 'PUT', ...json({ version, data }) })

/** Merges this device's copy into the account's: nothing on either side is lost. */
export const mergeData = <T>(data: unknown) =>
  api<Remote<T>>('/me/data/merge', { method: 'POST', ...json({ data }) })

export const giveConsent = (kind: ConsentKind, version: string) =>
  api<unknown>('/me/consents', { method: 'POST', ...json({ kind, version }) })

export const revokeConsent = (kind: ConsentKind) => api<void>(`/me/consents/${kind}`, { method: 'DELETE' })

/** The public VAPID key for Web Push; null while the server has push off. */
export const getPushKey = () => api<{ key: string | null }>('/push/key').then((answer) => answer.key)

export type PushSubscriptionBody = {
  endpoint: string
  keys: { p256dh: string; auth: string }
  contentEncoding: 'aes128gcm'
}

/** Keeps this browser's subscription; the server refuses it without a push consent. */
export const savePushSubscription = (subscription: PushSubscriptionBody) =>
  api<unknown>('/me/push-subscriptions', { method: 'POST', ...json(subscription) })

export const deletePushSubscription = (endpoint: string) =>
  api<void>('/me/push-subscriptions', { method: 'DELETE', ...json({ endpoint }) })

/** A topic of a Kurso finished on the account (`topic` is a unit, or `exam`), on a local day (ADR 0025). */
export type KursoDone = { course: string; topic: string; completedOn: string; score: number | null }

export const getKursoProgress = () => api<{ completions: KursoDone[] }>('/kursos/progress')

/** The server refuses a second topic a day without Plus: 409 with `code: 'daily_limit'`. */
export const completeKursoTopic = (course: string, topic: string, day: string, score?: number) =>
  api<{ completedOn: string }>(`/kursos/${course}/topics/${topic}/complete`, {
    method: 'POST',
    ...json({ day, score }),
  })

export const logout = () => api<void>('/auth/logout', { method: 'POST' })

export const deleteAccount = () => api<void>('/me', { method: 'DELETE' })

/** How a person relates to an area. Self-declared, never verified (ADR 0025). */
export const COMMUNITY_LEVELS = ['student', 'aspirant', 'graduate', 'professional'] as const
export type CommunityLevel = (typeof COMMUNITY_LEVELS)[number]
export type Membership = { level: CommunityLevel | null; pioneerNumber: number | null }

/** The people in an area's community: null while there are fewer than 50, so nothing is invented. */
export const getCommunityCount = (area: string) =>
  api<{ count: number | null }>(`/areas/${area}/community`).then((answer) => answer.count)

export const getMembership = (area: string) => api<Membership>(`/me/communities/${area}`)

export const setMembership = (area: string, level: CommunityLevel) =>
  api<Membership>(`/me/communities/${area}`, { method: 'PUT', ...json({ level }) })
