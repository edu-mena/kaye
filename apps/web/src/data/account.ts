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

export type ConsentKind = 'terms' | 'privacy' | 'guardian_informed'

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

export const logout = () => api<void>('/auth/logout', { method: 'POST' })

export const deleteAccount = () => api<void>('/me', { method: 'DELETE' })
