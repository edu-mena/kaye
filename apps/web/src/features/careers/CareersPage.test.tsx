import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { renderWithApp } from '../../test/render'
import { seedTested } from '../../test/user'
import CareersPage from './CareersPage'

describe('CareersPage', () => {
  it('lists every career, high demand first', async () => {
    renderWithApp(<CareersPage />)
    expect(await screen.findByText('27 profissões')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Para ti' })).not.toBeInTheDocument()
  })

  it('searches without caring about accents and keeps the search in the address', async () => {
    renderWithApp(<CareersPage />)
    await userEvent.type(
      await screen.findByRole('searchbox', { name: 'Procurar uma profissão' }),
      'ciberseguranca',
    )
    expect(screen.getByText('1 profissão')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Analista de Cibersegurança/ })).toBeInTheDocument()
    expect(screen.getByTestId('location')).toHaveTextContent('?q=ciberseguranca')
  })

  it('filters by area and clears the filter on a second press', async () => {
    renderWithApp(<CareersPage />)
    const design = await screen.findByRole('button', { name: 'Design' })
    await userEvent.click(design)
    expect(screen.getByText('2 profissões')).toBeInTheDocument()
    await userEvent.click(design)
    expect(screen.getByText('27 profissões')).toBeInTheDocument()
  })

  it('says so when nothing matches', async () => {
    renderWithApp(<CareersPage />, { route: '/carreiras?q=medicina' })
    expect(await screen.findByText('Nenhuma profissão encontrada. Tenta outra palavra.')).toBeInTheDocument()
  })

  it('offers "Para ti" and the match after the test', async () => {
    seedTested()
    renderWithApp(<CareersPage />)
    expect(await screen.findByRole('button', { name: 'Para ti' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getAllByText('Combina muito').length).toBeGreaterThan(0)
    await userEvent.click(screen.getByRole('button', { name: 'Mais bem pagas' }))
    expect(screen.getByTestId('location')).toHaveTextContent('ordem=salary')
  })
})
