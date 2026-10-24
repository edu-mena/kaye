import { fireEvent, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { changeLocale } from '../lib/i18n'
import { pageItems } from '../lib/pagination'
import { renderWithApp } from '../test/render'
import { seedUser } from '../test/user'
import { BottomNav, DemoBanner, Sidebar, TopBar } from './Navigation'
import { RequireProfile } from './RequireProfile'
import { BarList } from './ui/BarList'
import { Dialog } from './ui/Dialog'
import { CheckboxField, SelectField, TextAreaField, TextField } from './ui/Field'
import { ProgressBar } from './ui/ProgressBar'
import { Segmented } from './ui/Segmented'
import { CardRow, ROW_ITEM } from './ui/CardRow'

/** Page items as text: "1 … 4 5 6 … 10". */
const pageNumbers = (page: number, pages: number) =>
  pageItems(page, pages)
    .map((item) => (item.gap ? '…' : item.page))
    .join(' ')

function DialogHarness() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        abrir
      </button>
      <Dialog open={open} onClose={() => setOpen(false)} title="Título" footer={<span>rodapé</span>}>
        corpo
      </Dialog>
    </>
  )
}

describe('navigation', () => {
  it('has the five destinations of a guidance app, with no job board', () => {
    renderWithApp(<BottomNav />)
    const labels = screen.getAllByRole('link').map((link) => link.textContent)
    expect(labels).toEqual(['Início', 'Pesquisa', 'Carreiras', 'Cursos', 'CV'])
  })

  it('marks the current destination and follows the language', () => {
    changeLocale('fr')
    renderWithApp(<Sidebar collapsed={false} onToggle={() => {}} />, { route: '/cursos' })
    expect(screen.getByRole('link', { name: 'Cours' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('link', { name: 'Métiers' })).toHaveAttribute('href', '/carreiras')
  })

  it('folds the sidebar to icons, keeping every name for screen readers', async () => {
    const onToggle = vi.fn<() => void>()
    renderWithApp(<Sidebar collapsed onToggle={onToggle} />, { route: '/mercado' })
    const market = screen.getByRole('link', { name: 'Mercado' })
    expect(market).toHaveAttribute('title', 'Mercado')
    expect(market).toHaveAttribute('aria-current', 'page')
    await userEvent.click(screen.getByRole('button', { name: 'Abrir o menu' }))
    expect(onToggle).toHaveBeenCalledTimes(1)
  })

  it('puts the other sections behind the menu on phones, and closes it on the way', async () => {
    renderWithApp(<TopBar />)
    await userEvent.click(screen.getByRole('button', { name: 'Menu' }))
    const menu = screen.getByRole('navigation', { name: 'Mais opções' })
    expect(menu).toHaveTextContent(
      /Academias.*Empresas.*Mercado.*Novidades.*Notificações.*Perfil.*Suporte.*Configurações/,
    )
    await userEvent.click(within(menu).getByRole('link', { name: 'Academias' }))
    expect(screen.getByTestId('location')).toHaveTextContent('/academias')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('always says the data is a demonstration', () => {
    renderWithApp(<DemoBanner />)
    expect(screen.getByText(/Demonstração/)).toBeInTheDocument()
  })
})

describe('RequireProfile', () => {
  it('sends a person without a profile to /entrar and remembers where they were', () => {
    renderWithApp(<RequireProfile>segredo</RequireProfile>, { route: '/teste', path: '/teste' })
    expect(screen.queryByText('segredo')).not.toBeInTheDocument()
    expect(screen.getByTestId('location')).toHaveTextContent('/entrar?next=%2Fteste')
  })

  it('shows the page once there is a profile', () => {
    seedUser()
    renderWithApp(<RequireProfile>segredo</RequireProfile>)
    expect(screen.getByText('segredo')).toBeInTheDocument()
  })
})

describe('ui', () => {
  it('Segmented selects, and clears only when clearable', async () => {
    const onChange = vi.fn<(value: string | null) => void>()
    renderWithApp(
      <Segmented
        label="Área"
        clearable
        value="a"
        onChange={onChange}
        options={[
          { value: 'a', label: 'A' },
          { value: 'b', label: 'B' },
        ]}
      />,
    )
    expect(screen.getByRole('group', { name: 'Área' })).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'A' }))
    expect(onChange).toHaveBeenLastCalledWith(null)
    await userEvent.click(screen.getByRole('button', { name: 'B' }))
    expect(onChange).toHaveBeenLastCalledWith('b')
  })

  it('Pagination keeps long ranges short, with gaps', () => {
    expect(pageNumbers(2, 5)).toBe('1 2 3 4 5')
    expect(pageNumbers(5, 10)).toBe('1 … 4 5 6 … 10')
    expect(pageNumbers(1, 10)).toBe('1 2 … 10')
  })

  it('CardRow lists the cards in one row, with arrows that move a screenful', async () => {
    renderWithApp(
      <CardRow label="Cursos">
        {['A', 'B', 'C'].map((name) => (
          <li key={name} className={ROW_ITEM}>
            {name}
          </li>
        ))}
      </CardRow>,
    )
    const row = screen.getByRole('list', { name: 'Cursos' })
    expect(within(row).getAllByRole('listitem')).toHaveLength(3)
    const next = screen.getByRole('button', { name: 'Seguinte' })
    expect(next).toBeDisabled()

    const scrollBy = vi.fn<(options: ScrollToOptions) => void>()
    Object.defineProperties(row, {
      clientWidth: { value: 100 },
      scrollWidth: { value: 300 },
      scrollBy: { value: scrollBy },
    })
    fireEvent.scroll(row)
    expect(next).toBeEnabled()
    expect(screen.getByRole('button', { name: 'Anterior' })).toBeDisabled()
    await userEvent.click(next)
    expect(scrollBy).toHaveBeenCalledWith({ left: 100, behavior: 'smooth' })
  })

  it('ProgressBar is a native progress bar with a name', () => {
    renderWithApp(<ProgressBar value={0.426} label="Teste" />)
    expect(screen.getByRole('progressbar', { name: 'Teste' })).toHaveAttribute('value', '43')
  })

  it('BarList writes every value, so the bars are never colour-only', () => {
    renderWithApp(
      <BarList
        label="Interesses"
        items={[{ label: 'Social', value: 0.5, valueLabel: '50', emphasized: true }]}
      />,
    )
    expect(screen.getByRole('list', { name: 'Interesses' })).toHaveTextContent('Social50')
  })

  it('fields link labels, hints and errors for screen readers', () => {
    renderWithApp(
      <>
        <TextField label="Nome" error="Falta" />
        <TextAreaField label="Resumo" hint="Duas frases" />
        <SelectField label="Ano" placeholder="Escolhe" options={[{ value: '2007', label: '2007' }]} />
        <CheckboxField label="Aceito" error="Obrigatório" />
      </>,
    )
    expect(screen.getByLabelText('Nome')).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByLabelText('Nome')).toHaveAccessibleDescription('Falta')
    expect(screen.getByLabelText('Resumo')).toHaveAccessibleDescription('Duas frases')
    expect(screen.getByLabelText('Ano')).toHaveDisplayValue('Escolhe')
    expect(screen.getByLabelText('Aceito')).toHaveAccessibleDescription('Obrigatório')
  })

  it('Dialog opens as a modal and closes with its button', async () => {
    renderWithApp(<DialogHarness />)
    const dialog = screen.getByRole('dialog', { hidden: true })
    expect(dialog).not.toHaveAttribute('open')
    await userEvent.click(screen.getByRole('button', { name: 'abrir' }))
    expect(dialog).toHaveAttribute('open')
    expect(screen.getByRole('dialog', { name: 'Título' })).toHaveTextContent('corpo')
    await userEvent.click(screen.getByRole('button', { name: 'Fechar' }))
    expect(dialog).not.toHaveAttribute('open')
  })
})
