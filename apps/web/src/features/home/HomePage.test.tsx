import { screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { mockFetchJson, renderWithApp } from '../../test/render'
import HomePage from './HomePage'

describe('HomePage', () => {
  it('says it is connected when the API answers', async () => {
    mockFetchJson({ status: 'ok', app: 'Kayé', locale: 'pt', locales: ['pt', 'en', 'fr'] })
    renderWithApp(<HomePage />)

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Olá! Este é o Kayé')
    expect(await screen.findByText('Ligado ao servidor')).toBeInTheDocument()
  })

  it('says there is no connection when the API fails, after one retry', async () => {
    const fetchMock = mockFetchJson({ message: 'Server Error' }, 500)
    renderWithApp(<HomePage />)

    // useApiHealth retries once (flaky mobile networks), about a second later.
    expect(await screen.findByText('Sem ligação ao servidor', {}, { timeout: 3000 })).toBeInTheDocument()
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('shows that it is checking while the request is in flight', () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => new Promise(() => {})),
    )
    renderWithApp(<HomePage />)

    expect(screen.getByText('A ligar ao servidor…')).toBeInTheDocument()
  })
})
