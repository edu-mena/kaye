import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render } from '@testing-library/react'
import type { ReactElement } from 'react'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router'
import { vi } from 'vitest'

type Options = {
  route?: string
  /** Route pattern for pages that read params, e.g. "/carreiras/:slug". */
  path?: string
}

/** Shows where the app is, so tests can check navigation: screen.getByTestId('location'). */
function LocationProbe() {
  const location = useLocation()
  return <output data-testid="location">{`${location.pathname}${location.search}`}</output>
}

/**
 * Renders a component with the app's providers: a fresh query cache (no retries)
 * and an in-memory router. Use this in every component test.
 */
export function renderWithApp(ui: ReactElement, { route = '/', path }: Options = {}) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[route]}>
        {path ? (
          <Routes>
            <Route path={path} element={ui} />
            <Route path="*" element={null} />
          </Routes>
        ) : (
          ui
        )}
        <LocationProbe />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

/** Replaces fetch with a mock that answers every request with the given JSON. */
export function mockFetchJson(body: unknown, status = 200) {
  const fetchMock = vi.fn<typeof fetch>(async () => Response.json(body, { status }))
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}
