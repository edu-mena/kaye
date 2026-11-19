import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Mentor } from '../../data/types'
import { renderWithApp } from '../../test/render'
import { seedUser } from '../../test/user'

// Kayé's contacts come from the build; the list of approved mentors is still empty, so the test brings two.
vi.hoisted(() => {
  vi.stubEnv('VITE_KAYE_WHATSAPP', '+244 900 000 000')
  vi.stubEnv('VITE_KAYE_EMAIL', 'mentores@kaye.test')
})
const mentors = vi.hoisted(() => ({ list: [] as Mentor[] }))
vi.mock('../../data/demo/mentors', () => ({
  get MENTORS() {
    return mentors.list
  },
}))

const { default: MentorsPage } = await import('./MentorsPage')

const GROUP: Mentor = {
  id: 'm-1',
  name: 'Ana Lima',
  role: 'Analista de segurança',
  company: 'Unitel',
  careers: ['analista-de-ciberseguranca'],
  bio: 'Protejo redes há oito anos.',
  languages: ['pt', 'en'],
  consentAt: '2026-10-01',
  availability: 'grupo',
}
const SOLO: Mentor = {
  ...GROUP,
  id: 'm-2',
  name: 'Bruno Costa',
  company: undefined,
  careers: ['enfermeiro', 'analista-de-ciberseguranca'],
  availability: 'individual',
}
const year = new Date().getFullYear()
const minor = () =>
  seedUser({
    profile: {
      name: 'Edson',
      birthYear: year - 15,
      province: 'Luanda',
      education: 'medio_tecnico',
      guardianInformed: true,
    },
  })
const adult = () =>
  seedUser({
    profile: {
      name: 'Joana',
      birthYear: year - 22,
      province: 'Luanda',
      education: 'licenciatura',
      guardianInformed: false,
    },
  })

beforeEach(() => {
  mentors.list = [GROUP, SOLO]
})

describe('MentorsPage', () => {
  it('says there are no mentors yet, with the rules', async () => {
    mentors.list = []
    renderWithApp(<MentorsPage />, { route: '/mentores' })
    expect(await screen.findByText(/Ainda não há mentores/)).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'As regras' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Denunciar no Suporte' })).toHaveAttribute('href', '/suporte')
  })

  it('shows a minor only the mentors who take groups', async () => {
    minor()
    renderWithApp(<MentorsPage />, { route: '/mentores' })
    expect(await screen.findByRole('heading', { name: 'Ana Lima' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Bruno Costa' })).not.toBeInTheDocument()
    expect(screen.getByText('Analista de segurança · Unitel')).toBeInTheDocument()
    expect(screen.getByText(/Sessões em grupo/)).toBeInTheDocument()
  })

  it('filters by area and career, and says when none fit', async () => {
    adult()
    renderWithApp(<MentorsPage />, { route: '/mentores' })
    expect(await screen.findByRole('heading', { name: 'Bruno Costa' })).toBeInTheDocument()
    const careers = screen.getByLabelText('Carreira')
    await vi.waitFor(() => expect(within(careers).getAllByRole('option').length).toBeGreaterThan(2))

    await userEvent.selectOptions(careers, 'enfermeiro')
    expect(screen.queryByRole('heading', { name: 'Ana Lima' })).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Bruno Costa' })).toBeInTheDocument()

    const area = screen.getByLabelText('Área')
    const other = within(area)
      .getAllByRole('option')
      .find((option) => option.getAttribute('value') && option.textContent !== '') as HTMLOptionElement
    await userEvent.selectOptions(area, other.value)
    expect(screen.getByTestId('location')).not.toHaveTextContent('carreira=')
  })

  it('asks for a conversation: checks the form, then opens a ready message and keeps nothing', async () => {
    adult()
    const open = vi.spyOn(window, 'open').mockImplementation(() => null)
    renderWithApp(<MentorsPage />, { route: '/mentores?carreira=analista-de-ciberseguranca' })
    await screen.findByRole('heading', { name: 'Bruno Costa' })
    // In the list order: Ana Lima, then Bruno Costa.
    await userEvent.click(screen.getAllByRole('button', { name: /Pedir conversa/ })[1] as HTMLElement)

    const dialog = await screen.findByRole('dialog', { name: 'Conversa com Bruno Costa' })
    expect(within(dialog).getByText(/Vais pedir uma conversa individual/)).toBeInTheDocument()
    await userEvent.click(within(dialog).getByRole('button', { name: /Enviar por WhatsApp/ }))
    expect(within(dialog).getAllByText('Preenche este campo.')).toHaveLength(2)
    expect(open).not.toHaveBeenCalled()

    await userEvent.type(within(dialog).getByLabelText('O que procuras?'), 'Saber como começar')
    await userEvent.type(within(dialog).getByLabelText('Quando estás disponível?'), 'Sábados')
    await userEvent.click(within(dialog).getByRole('button', { name: /Enviar por email/ }))

    const href = String(open.mock.calls[0]?.[0])
    expect(href).toMatch(/^mailto:mentores@kaye\.test\?subject=/)
    expect(decodeURIComponent(href)).toContain('O que procuro: Saber como começar')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('sends a minor to a group session by WhatsApp', async () => {
    minor()
    const open = vi.spyOn(window, 'open').mockImplementation(() => null)
    renderWithApp(<MentorsPage />, { route: '/mentores' })
    await userEvent.click(await screen.findByRole('button', { name: /Pedir conversa/ }))
    const dialog = await screen.findByRole('dialog')
    await userEvent.type(within(dialog).getByLabelText('O que procuras?'), 'Dúvidas')
    await userEvent.type(within(dialog).getByLabelText('Quando estás disponível?'), 'Domingo')
    await userEvent.click(within(dialog).getByRole('button', { name: /Enviar por WhatsApp/ }))

    const href = String(open.mock.calls[0]?.[0])
    expect(href).toMatch(/^https:\/\/wa\.me\/244900000000\?text=/)
    expect(decodeURIComponent(href)).toContain('sessão em grupo')
  })
})
