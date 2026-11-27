import { describe, expect, it, vi } from 'vitest'
import { createErrorReporter, startErrorReporting } from './errorReporting'

// The app's errors on their way to Sentry (through the API): what is sent, and what never is.

function reporter(limit?: number) {
  const send = vi.fn<(report: unknown) => Promise<unknown>>().mockResolvedValue(undefined)
  return { send, report: createErrorReporter(send, limit) }
}

describe('error reporting', () => {
  it('sends the message, the stack, the path without the query string and where it came from', () => {
    window.history.pushState({}, '', '/carreiras/enfermeiro?q=segredo#topo')
    const { send, report } = reporter()
    const error = new TypeError('x is undefined')

    report(error, 'react')

    expect(send).toHaveBeenCalledWith({
      message: 'TypeError: x is undefined',
      stack: error.stack,
      path: '/carreiras/enfermeiro',
      source: 'react',
    })
  })

  it('sends each message once and at most five per page load', () => {
    const { send, report } = reporter()

    report(new Error('same'), 'window')
    report(new Error('same'), 'window')
    for (let i = 0; i < 10; i++) report(new Error(`error ${i}`), 'window')

    expect(send).toHaveBeenCalledTimes(5)
  })

  it('ignores errors from scripts of other sites and empty ones', () => {
    const { send, report } = reporter()

    report('Script error.', 'window')
    report('', 'promise')

    expect(send).not.toHaveBeenCalled()
  })

  it('reports a rejection that is not an Error by its text, and a failed send stays quiet', async () => {
    const send = vi.fn<(report: unknown) => Promise<unknown>>().mockRejectedValue(new Error('offline'))
    const report = createErrorReporter(send)

    report('quota exceeded', 'promise')
    await Promise.resolve()

    expect(send).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'quota exceeded', stack: undefined }),
    )
  })

  it('listens to script errors and unhandled promises', () => {
    const report = vi.fn<(error: unknown, source: string) => void>()
    startErrorReporting(report)
    const error = new Error('boom')

    window.dispatchEvent(new ErrorEvent('error', { error, message: 'boom' }))
    const rejection = new Event('unhandledrejection') as PromiseRejectionEvent
    Object.defineProperty(rejection, 'reason', { value: 'nope' })
    window.dispatchEvent(rejection)

    expect(report).toHaveBeenCalledWith(error, 'window')
    expect(report).toHaveBeenCalledWith('nope', 'promise')
  })
})
