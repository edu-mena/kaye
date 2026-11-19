import { i18n } from './i18n'

// The web app talks to the API on the same domain; the native apps need the full URL.
const BASE_URL = import.meta.env.VITE_API_URL ?? '/api/v1'

export class ApiError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS'])

/**
 * The CSRF token Laravel leaves in the `XSRF-TOKEN` cookie (readable on purpose; the session cookie
 * is HttpOnly). Sent back as a header on every write, so no screen has to remember it (ADR 0003).
 */
function csrfToken(): string | null {
  const cookie = document.cookie.split('; ').find((entry) => entry.startsWith('XSRF-TOKEN='))
  return cookie ? decodeURIComponent(cookie.slice('XSRF-TOKEN='.length)) : null
}

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers)
  headers.set('Accept', 'application/json')
  // The app's language, unless the call asks for one (the test in another language).
  if (!headers.has('Accept-Language')) headers.set('Accept-Language', i18n.language)
  if (init.body !== undefined && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }
  const token = SAFE_METHODS.has((init.method ?? 'GET').toUpperCase()) ? null : csrfToken()
  if (token) headers.set('X-XSRF-TOKEN', token)

  // The session cookie goes only to this site, never to another origin.
  const response = await fetch(`${BASE_URL}${path}`, { credentials: 'same-origin', ...init, headers })

  if (!response.ok) {
    throw new ApiError(response.status, `${init.method ?? 'GET'} ${path} failed with ${response.status}`)
  }

  if (response.status === 204) return undefined as T

  return (await response.json()) as T
}
