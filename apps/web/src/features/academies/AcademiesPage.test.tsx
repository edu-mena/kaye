import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { renderWithApp } from '../../test/render'
import AcademiesPage from './AcademiesPage'
import { listAcademies } from '../../data/source'
import type { Academy } from '../../data/types'
import { pickFilter } from '../../test/filters'

const count = (text: string) => screen.getByText(text, { selector: 'output' })

const ACADEMIES = await listAcademies()
const TOTAL = ACADEMIES.length
const of = (test: (academy: Academy) => boolean) => ACADEMIES.filter(test)
const institutions = (list: Academy[]) =>
  list.length === 1 ? '1 instituição' : `${list.length} instituições`
const ALL = `${TOTAL} instituições`

describe('AcademiesPage', () => {
  it('shows each institution with its photo, its logo and what it is, without courses or sources', async () => {
    renderWithApp(<AcademiesPage />)
    expect(await screen.findByRole('heading', { level: 1, name: 'Academias' })).toBeInTheDocument()
    expect(count(ALL)).toBeInTheDocument()

    const uan = screen.getByRole('article', { name: 'Universidade Agostinho Neto' })
    expect(uan.querySelector('img[src*="uan-banner"]')).not.toBeNull()
    expect(uan.querySelector('img[src*="uan-logo"]')).not.toBeNull()

    expect(
      within(screen.getByRole('article', { name: 'ITEL' })).getByText(/Gestão por confirmar/),
    ).toBeInTheDocument()
    expect(
      within(screen.getByRole('article', { name: 'Escola 42 Luanda' })).getByText('A partir dos 17 anos'),
    ).toBeInTheDocument()
    const list = screen.getByRole('list', { name: 'Instituições' })
    expect(within(list).getByRole('link', { name: 'ITEL' })).toHaveAttribute('href', '/academias/itel')
    expect(within(list).queryByText('Engenharia Informática')).not.toBeInTheDocument()
  })

  it('answers the hero question: where to study a course', async () => {
    renderWithApp(<AcademiesPage />)
    await pickFilter('Que curso queres estudar?', 'Engenharia Informática')
    expect(screen.getByRole('heading', { name: 'Onde estudar Engenharia Informática' })).toBeInTheDocument()
    expect(
      count(
        institutions(
          of((academy) => academy.offers.some((offer) => offer.course.id === 'engenharia-informatica')),
        ),
      ),
    ).toBeInTheDocument()
    expect(screen.queryByRole('article', { name: 'ITEL' })).not.toBeInTheDocument()
    expect(screen.getByTestId('location')).toHaveTextContent('?curso=engenharia-informatica')
  })

  it('shows the filters that fit the type: area for mid-level, faculty for universities', async () => {
    renderWithApp(<AcademiesPage />, { route: '/?onde=Luanda' })
    const type = await screen.findByRole('combobox', { name: 'Tipo de instituição' })
    expect(screen.queryByRole('searchbox', { name: 'Área' })).not.toBeInTheDocument()
    expect(screen.queryByRole('combobox', { name: 'Faculdade' })).not.toBeInTheDocument()

    // Informática e Multimédia leads to design careers: only the ITEL teaches it.
    await userEvent.selectOptions(type, 'instituto_medio')
    expect(screen.queryByRole('combobox', { name: 'Faculdade' })).not.toBeInTheDocument()
    await pickFilter('Área', 'Design')
    expect(count('1 instituição')).toBeInTheDocument()
    expect(screen.getByRole('article', { name: 'ITEL' })).toBeInTheDocument()
    expect(screen.getByTestId('location')).toHaveTextContent('area=design')

    // Another type clears the filters that belonged to the old one.
    await userEvent.selectOptions(type, 'universidade')
    expect(screen.getByTestId('location')).not.toHaveTextContent('area=')
    expect(screen.queryByRole('searchbox', { name: 'Área' })).not.toBeInTheDocument()
    await userEvent.selectOptions(
      screen.getByRole('combobox', { name: 'Faculdade' }),
      'Faculdade de Engenharia',
    )
    expect(count('2 instituições')).toBeInTheDocument()
    await userEvent.selectOptions(screen.getByRole('combobox', { name: 'Nível' }), 'mestrado')
    expect(count('1 instituição')).toBeInTheDocument()
    expect(screen.getByRole('article', { name: 'Universidade Metodista de Angola' })).toBeInTheDocument()
  })

  it('filters by type and ownership, says when nothing matches, and clears', async () => {
    renderWithApp(<AcademiesPage />)
    await userEvent.selectOptions(
      await screen.findByRole('combobox', { name: 'Tipo de instituição' }),
      'instituto_medio',
    )
    expect(count(institutions(of((academy) => academy.type === 'instituto_medio')))).toBeInTheDocument()
    expect(screen.getByTestId('location')).toHaveTextContent('?tipo=instituto_medio')

    // No mid-level institute in the catalogue is private (public, or still to confirm).
    await userEvent.selectOptions(screen.getByRole('combobox', { name: 'Gestão' }), 'privada')
    expect(screen.getByText('Nenhuma instituição com estes filtros.')).toBeInTheDocument()

    await userEvent.click(screen.getAllByRole('button', { name: 'Limpar filtros' })[0] as HTMLElement)
    expect(count(ALL)).toBeInTheDocument()
  })

  it('ignores filters it does not know in the address', async () => {
    renderWithApp(<AcademiesPage />, {
      route: '/?tipo=castelo&gestao=talvez&area=magia&nivel=doutoramento&faculdade=Letras&curso=x&onde=Marte',
    })
    expect(await screen.findByText(ALL, { selector: 'output' })).toBeInTheDocument()
  })
})
