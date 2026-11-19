import { describe, expect, it } from 'vitest'
import { mockFetchJson } from '../test/render'
import { api, ApiError } from './api'
import { changeLocale } from './i18n'

describe('api', () => {
  it('calls the v1 API on the same domain and returns the JSON body', async () => {
    const fetchMock = mockFetchJson({ status: 'ok' })

    await expect(api('/health')).resolves.toEqual({ status: 'ok' })
    expect(fetchMock).toHaveBeenCalledWith('/api/v1/health', expect.any(Object))
  })

  it('asks for JSON in the current language', async () => {
    const fetchMock = mockFetchJson({})
    await changeLocale('fr')

    await api('/health')

    const headers = new Headers(fetchMock.mock.calls[0]?.[1]?.headers)
    expect(headers.get('Accept')).toBe('application/json')
    expect(headers.get('Accept-Language')).toBe('fr')
  })

  it('keeps the language a call asks for', async () => {
    const fetchMock = mockFetchJson({})
    await changeLocale('fr')

    await api('/assessment', { headers: { 'Accept-Language': 'en' } })

    expect(new Headers(fetchMock.mock.calls[0]?.[1]?.headers).get('Accept-Language')).toBe('en')
  })

  it('sends a JSON content type only when there is a body', async () => {
    const fetchMock = mockFetchJson({})

    await api('/reports', { method: 'POST', body: JSON.stringify({ a: 1 }) })
    await api('/health')

    const withBody = new Headers(fetchMock.mock.calls[0]?.[1]?.headers)
    const withoutBody = new Headers(fetchMock.mock.calls[1]?.[1]?.headers)
    expect(withBody.get('Content-Type')).toBe('application/json')
    expect(withoutBody.has('Content-Type')).toBe(false)
  })

  it('sends the CSRF token from the XSRF-TOKEN cookie on writes only, and cookies only to this site', async () => {
    const fetchMock = mockFetchJson({})
    document.cookie = 'XSRF-TOKEN=abc%3D%3D; path=/'

    await api('/me/data', { method: 'PUT', body: '{}' })
    await api('/me')

    const write = fetchMock.mock.calls[0]?.[1]
    const read = fetchMock.mock.calls[1]?.[1]
    expect(new Headers(write?.headers).get('X-XSRF-TOKEN')).toBe('abc==')
    expect(new Headers(read?.headers).has('X-XSRF-TOKEN')).toBe(false)
    expect(write?.credentials).toBe('same-origin')
    document.cookie = 'XSRF-TOKEN=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/'
  })

  it('sends no CSRF header when there is no cookie (the demo site, the native apps)', async () => {
    const fetchMock = mockFetchJson({})

    await api('/me/data', { method: 'PUT', body: '{}' })

    expect(new Headers(fetchMock.mock.calls[0]?.[1]?.headers).has('X-XSRF-TOKEN')).toBe(false)
  })

  it('throws an ApiError with the status when the request fails', async () => {
    mockFetchJson({ message: 'Not Found' }, 404)

    const error = await api('/missing').catch((caught: unknown) => caught)

    expect(error).toBeInstanceOf(ApiError)
    expect(error).toMatchObject({ status: 404 })
  })
})
