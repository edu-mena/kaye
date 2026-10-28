import { useQuery } from '@tanstack/react-query'
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { renderWithApp } from '../test/render'
import { DetailSkeleton, ListSkeleton, NotFoundState } from './PageStates'
import { QueryState } from './QueryState'

/** A query function that fails the first time and works when tried again. */
function flaky() {
  let attempts = 0
  return async () => {
    attempts += 1
    if (attempts === 1) throw new Error('down')
    return 'Pronto'
  }
}

function Flaky({ load, compact = false }: { load: () => Promise<string>; compact?: boolean }) {
  const query = useQuery({ queryKey: ['flaky', compact], queryFn: load })
  return (
    <QueryState query={query} compact={compact} loading={<ListSkeleton />}>
      {(value) => <p>{value}</p>}
    </QueryState>
  )
}

describe('page states', () => {
  it('shows a skeleton while loading, then an error that can be tried again', async () => {
    renderWithApp(<Flaky load={flaky()} />)
    expect(screen.getByText('A carregar…').closest('[aria-busy]')).toHaveAttribute('aria-busy', 'true')
    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent('Não foi possível carregar')
    expect(within(alert).getByRole('link', { name: 'Ir para o início' })).toHaveAttribute('href', '/')
    await userEvent.click(within(alert).getByRole('button', { name: 'Tentar outra vez' }))
    expect(await screen.findByText('Pronto')).toBeInTheDocument()
  })

  it('keeps the error small inside a section, without the way home', async () => {
    renderWithApp(<Flaky load={flaky()} compact />)
    const alert = await screen.findByRole('alert')
    expect(within(alert).getByRole('button', { name: 'Tentar outra vez' })).toBeInTheDocument()
    expect(within(alert).queryByRole('link')).not.toBeInTheDocument()
  })

  it('says what was not found and leads back', () => {
    renderWithApp(
      <NotFoundState
        title="Não encontrámos"
        body="Já não existe."
        action={{ to: '/cursos', label: 'Cursos' }}
      />,
    )
    expect(screen.getByRole('heading', { level: 1, name: 'Não encontrámos' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Cursos' })).toHaveAttribute('href', '/cursos')
  })

  it('announces a loading detail page once, hiding the grey shapes', () => {
    renderWithApp(<DetailSkeleton />)
    expect(screen.getAllByText('A carregar…')).toHaveLength(1)
    expect(screen.queryAllByRole('listitem')).toHaveLength(0)
  })
})
