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
    changeLocale('fr')

    await api('/health')

    const headers = new Headers(fetchMock.mock.calls[0]?.[1]?.headers)
    expect(headers.get('Accept')).toBe('application/json')
    expect(headers.get('Accept-Language')).toBe('fr')
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

  it('throws an ApiError with the status when the request fails', async () => {
    mockFetchJson({ message: 'Not Found' }, 404)

    const error = await api('/missing').catch((caught: unknown) => caught)

    expect(error).toBeInstanceOf(ApiError)
    expect(error).toMatchObject({ status: 404 })
  })
})
