import { api } from './api'

// The errors the app could not handle go to Sentry through our own API (POST /client-errors), never straight to
// Sentry: the CSP allows connections only to this site, and the server cleans each report of personal data before
// it leaves (docs/observabilidade.md). Only the message, the stack and the path (no query string) are sent.

export type ErrorSource = 'window' | 'promise' | 'react'

type Report = { message: string; stack?: string; path: string; source: ErrorSource }

/** At most this many reports per page load: an error in a loop must not flood the API or the Sentry quota. */
const MAX_REPORTS = 5

async function deliver(send: (report: Report) => Promise<unknown>, report: Report): Promise<void> {
  try {
    await send(report)
  } catch {
    // Offline or refused: the report is dropped, never retried.
  }
}

export function createErrorReporter(send: (report: Report) => Promise<unknown>, limit = MAX_REPORTS) {
  const seen = new Set<string>()

  return function report(error: unknown, source: ErrorSource): void {
    const message = (error instanceof Error ? `${error.name}: ${error.message}` : String(error))
      .slice(0, 500)
      .trim()
    // "Script error." is a script from another origin (an extension): nothing to fix on our side.
    if (message === '' || message.startsWith('Script error')) return
    if (seen.has(message) || seen.size >= limit) return
    seen.add(message)

    const stack = error instanceof Error && error.stack ? error.stack.slice(0, 4000) : undefined
    // Reporting must never cause another error, nor wait.
    void deliver(send, { message, stack, path: window.location.pathname, source })
  }
}

/** Only the build Laravel serves (with the API); the demo sites and the tests report nothing. */
const ENABLED = import.meta.env.PROD && import.meta.env.VITE_DATA_SOURCE === 'api'

export const reportError: (error: unknown, source: ErrorSource) => void = ENABLED
  ? createErrorReporter((report) =>
      api('/client-errors', { method: 'POST', body: JSON.stringify(report), keepalive: true }),
    )
  : () => undefined

/** Script errors and unhandled promises; React's own errors come from the root (main.tsx). */
export function startErrorReporting(report = reportError): void {
  window.addEventListener('error', (event) => report(event.error ?? event.message, 'window'))
  window.addEventListener('unhandledrejection', (event) => report(event.reason, 'promise'))
}
