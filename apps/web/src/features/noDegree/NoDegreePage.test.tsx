import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { renderWithApp } from '../../test/render'
import { seedUser } from '../../test/user'
import { clearFilter, pickFilter } from '../../test/filters'
import NoDegreePage from './NoDegreePage'

const panel = () => screen.getByRole('tabpanel')

describe('NoDegreePage', () => {
  it('lists the trades with their shortest path, and filters them by area', async () => {
    renderWithApp(<NoDegreePage />, { route: '/sem-universidade' })
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Sem universidade, com futuro' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /Aprender um ofício/ })).toHaveAttribute('aria-selected', 'true')

    const trades = () =>
      within(panel())
        .getAllByRole('link')
        .filter((link) => link.getAttribute('href')?.startsWith('/carreiras/'))
    // The catalogue loads after the first paint.
    await waitFor(() => expect(trades().length).toBeGreaterThan(1))
    const before = trades().length
    expect(within(panel()).getAllByText(/meses|anos|semanas/).length).toBeGreaterThan(0)

    const field = screen.getByRole('searchbox', { name: 'Área' })
    await userEvent.click(field)
    const options = within(screen.getByRole('list', { name: 'Área' })).getAllByRole('button')
    await userEvent.click(options[0] as HTMLElement)
    expect(trades().length).toBeLessThan(before)
    expect(screen.getByRole('link', { name: /Ver todas as carreiras sem licenciatura/ })).toHaveAttribute(
      'href',
      '/carreiras?entrada=sem-licenciatura',
    )
  })

  it('finds the training centres, those of the province first, by type and province', async () => {
    seedUser()
    renderWithApp(<NoDegreePage />, { route: '/sem-universidade?secao=onde' })
    expect(await screen.findByRole('heading', { name: 'Onde aprender' })).toBeInTheDocument()
    expect((await within(panel()).findAllByText('Para ti')).length).toBeGreaterThan(0)

    await pickFilter('Tipo', 'Centro de formação')
    await userEvent.click(screen.getByRole('searchbox', { name: 'Província' }))
    const elsewhere = within(screen.getByRole('list', { name: 'Província' }))
      .getAllByRole('button')
      .find((button) => button.firstChild?.textContent !== 'Luanda') as HTMLElement
    await userEvent.click(elsewhere)
    expect(within(panel()).queryByText('Para ti')).not.toBeInTheDocument()
    await clearFilter('Tipo')
    await clearFilter('Província')
  })

  it('shows the steps to work on one own and to go formal, each with its source', async () => {
    renderWithApp(<NoDegreePage />, { route: '/sem-universidade' })
    await userEvent.click(await screen.findByRole('tab', { name: /Trabalhar por conta própria/ }))
    expect(screen.getByTestId('location')).toHaveTextContent('secao=conta-propria')
    expect(await screen.findByRole('heading', { name: 'Apoios e microcrédito' })).toBeInTheDocument()
    expect(within(panel()).getAllByRole('listitem').length).toBeGreaterThan(3)

    await userEvent.click(screen.getByRole('tab', { name: /Do informal ao formal/ }))
    expect(await screen.findByRole('heading', { name: 'Porque compensa' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Passo a passo' })).toBeInTheDocument()
    expect(within(panel()).getAllByRole('link').length).toBeGreaterThan(0)

    await userEvent.click(screen.getByRole('tab', { name: /Aprender um ofício/ }))
    expect(screen.getByTestId('location')).not.toHaveTextContent('secao=')
  })
})
