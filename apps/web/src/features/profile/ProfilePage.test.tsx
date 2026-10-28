import { fireEvent, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { getUser } from '../../state/userStore'
import { mockFetchJson, renderWithApp } from '../../test/render'
import { seedTested, seedUser } from '../../test/user'
import ProfilePage from './ProfilePage'

// The cropper has its own test; here it just hands back a picture.
vi.mock('../../components/ImageCropper', () => ({
  ImageCropper: ({
    file,
    title,
    onDone,
  }: {
    file: File | null
    title: string
    onDone: (image: string) => void
  }) =>
    file ? (
      <button type="button" onClick={() => onDone('data:image/webp;base64,AAA')}>
        {title}
      </button>
    ) : null,
}))

const picture = new File(['x'], 'eu.png', { type: 'image/png' })
const choose = (container: HTMLElement, name: 'photo' | 'cover', file = picture) => {
  const input = container.querySelector(`input[name="${name}"]`)
  if (!input) throw new Error(`no ${name} input`)
  fireEvent.change(input, { target: { files: [file] } })
}

const openTab = async (name: string) => userEvent.click(await screen.findByRole('tab', { name }))

describe('ProfilePage', () => {
  it('invites people without a profile to create one, with only the sections that need none', () => {
    mockFetchJson({ status: 'ok' })
    renderWithApp(<ProfilePage />)
    expect(screen.getByText('Ainda não tens perfil.')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Criar perfil' })).toHaveAttribute('href', '/entrar')
    expect(screen.getAllByRole('tab').map((tab) => tab.textContent)).toEqual([
      'Conta e acesso',
      'Privacidade',
    ])
  })

  it('shows the person, the test code, the destination and saved careers on the summary', async () => {
    mockFetchJson({ status: 'ok' })
    seedTested({ skills: { react: 'sei' }, savedCareers: ['designer-ui-ux', 'analista-de-dados'] })
    renderWithApp(<ProfilePage />)
    expect(screen.getByText('Joana')).toBeInTheDocument()
    expect(await screen.findByRole('link', { name: 'IAC' })).toHaveAttribute('href', '/teste/resultado')
    expect(screen.getByText('Ainda não escolheste uma profissão como destino.')).toBeInTheDocument()
    const saved = screen.getByRole('region', { name: 'Carreiras guardadas' })
    expect(await within(saved).findByRole('link', { name: /Designer UI\/UX/ })).toBeInTheDocument()
    expect(within(saved).getByRole('link', { name: /Analista de Dados/ })).toBeInTheDocument()
  })

  it('shows how far along the path the person is, and the next step', () => {
    mockFetchJson({ status: 'ok' })
    seedTested()
    renderWithApp(<ProfilePage />)
    const path = screen.getByRole('region', { name: 'O teu caminho' })
    expect(within(path).getByText('2 de 6')).toBeInTheDocument()
    expect(within(path).getByRole('link', { name: 'Escolher um destino' })).toHaveAttribute(
      'href',
      '/carreiras',
    )
  })

  it('takes a profile photo and a cover through the cropper, kept on the device and removable', async () => {
    mockFetchJson({ status: 'ok' })
    seedUser()
    const { container } = renderWithApp(<ProfilePage />)
    expect(screen.getByRole('button', { name: 'Adicionar capa' })).toBeInTheDocument()
    choose(container, 'photo')
    await userEvent.click(screen.getByRole('button', { name: 'Ajustar a foto de perfil' }))
    expect(getUser().photo).toBe('data:image/webp;base64,AAA')
    choose(container, 'cover')
    await userEvent.click(screen.getByRole('button', { name: 'Ajustar a imagem de capa' }))
    expect(getUser().cover).toBe('data:image/webp;base64,AAA')
    expect(screen.getByRole('button', { name: 'Mudar a capa' })).toBeInTheDocument()

    await openTab('Dados pessoais')
    await userEvent.click(screen.getByRole('button', { name: 'Remover a foto de perfil' }))
    await userEvent.click(screen.getByRole('button', { name: 'Remover a imagem de capa' }))
    expect(getUser().photo).toBeNull()
    expect(getUser().cover).toBeNull()
    expect(screen.getByText('Sem foto')).toBeInTheDocument()
  })

  it('refuses what is not a picture, or is too big, before cropping', async () => {
    mockFetchJson({ status: 'ok' })
    seedUser()
    const { container } = renderWithApp(<ProfilePage />)
    choose(container, 'photo', new File(['x'], 'notas.pdf', { type: 'application/pdf' }))
    expect(await screen.findByRole('alert')).toHaveTextContent(/Escolhe uma foto JPG, PNG ou WebP/)
    const big = new File(['x'], 'grande.png', { type: 'image/png' })
    Object.defineProperty(big, 'size', { value: 20 * 1024 * 1024 })
    choose(container, 'cover', big)
    expect(screen.getByRole('alert')).toHaveTextContent(/menos de 15 MB/)
    expect(screen.queryByRole('button', { name: 'Ajustar a imagem de capa' })).not.toBeInTheDocument()
  })

  it('marks minors as a private profile', () => {
    mockFetchJson({ status: 'ok' })
    seedUser({
      profile: {
        name: 'Ana',
        birthYear: new Date().getFullYear() - 15,
        province: 'Bié',
        education: 'i_ciclo',
        guardianInformed: true,
      },
    })
    renderWithApp(<ProfilePage />)
    expect(screen.getByText('Perfil privado')).toBeInTheDocument()
  })

  it('shows earned and locked achievements with the XP total', () => {
    mockFetchJson({ status: 'ok' })
    seedTested()
    renderWithApp(<ProfilePage />)
    const achievements = screen.getByRole('region', { name: 'Conquistas' })
    expect(within(achievements).getByText('250 XP')).toBeInTheDocument()
    expect(within(achievements).getByText(/vale pontos \(XP\).*nunca te comparam/)).toBeInTheDocument()
    expect(within(achievements).getByText('Autoconhecimento')).toBeInTheDocument()
    expect(within(achievements).getAllByText('Por conquistar')).toHaveLength(4)
  })

  it('lists the history newest first, each step linked back', async () => {
    mockFetchJson({ status: 'ok' })
    seedUser({
      history: [
        { type: 'saved', at: '2026-10-20T10:00:00.000Z', ref: 'designer-ui-ux' },
        { type: 'test', at: '2026-10-19T09:00:00.000Z' },
      ],
    })
    renderWithApp(<ProfilePage />, { route: '/perfil?secao=percurso' })
    const saved = await screen.findByRole('link', { name: 'Guardaste Designer UI/UX' })
    expect(saved).toHaveAttribute('href', '/carreiras/designer-ui-ux')
    const steps = within(screen.getByRole('tabpanel')).getAllByRole('listitem')
    expect(steps[0]).toContainElement(saved)
    expect(steps[1]).toHaveTextContent('Terminaste o teste vocacional')
    expect(within(steps[1]!).getByText(/2026/)).toHaveAttribute('datetime', '2026-10-19T09:00:00.000Z')
  })

  it('says when there is no history yet', async () => {
    mockFetchJson({ status: 'ok' })
    seedUser()
    renderWithApp(<ProfilePage />)
    await openTab('Percurso')
    expect(screen.getByText('Ainda não há passos no teu percurso.')).toBeInTheDocument()
    expect(screen.getByTestId('location')).toHaveTextContent('secao=percurso')
  })

  it('shows the personal data and saves a correction', async () => {
    mockFetchJson({ status: 'ok' })
    seedUser()
    renderWithApp(<ProfilePage />)
    await openTab('Dados pessoais')
    expect(screen.getByText('Luanda')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Editar' }))
    const name = screen.getByLabelText('Como te chamas?')
    await userEvent.clear(name)
    await userEvent.type(name, 'Joana Maria')
    await userEvent.click(screen.getByRole('button', { name: 'Guardar' }))
    expect(getUser().profile?.name).toBe('Joana Maria')
    expect(getUser().history[0]?.type).toBe('profileEdit')
    expect(screen.getAllByText('Joana Maria').length).toBeGreaterThan(0)
  })

  it('shows the courses being compared and their institutions', async () => {
    mockFetchJson({ status: 'ok' })
    seedUser({ compare: ['web-react'] })
    renderWithApp(<ProfilePage />, { route: '/perfil?secao=instituicoes' })
    expect(await screen.findByRole('link', { name: 'Desenvolvimento Web com React' })).toHaveAttribute(
      'href',
      '/cursos/web-react',
    )
    const institutions = screen.getByRole('region', { name: 'Instituições de interesse' })
    expect(within(institutions).getByText('Academia Digital Exemplo')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Comparar lado a lado' })).toHaveAttribute(
      'href',
      '/cursos/comparar',
    )
  })

  it('shows the CV and the documents that wait for a secure account', async () => {
    mockFetchJson({ status: 'ok' })
    seedUser()
    renderWithApp(<ProfilePage />)
    await openTab('Documentos')
    expect(screen.getByRole('link', { name: /Abrir o CV/ })).toHaveAttribute('href', '/cv')
    expect(screen.getByText(/nunca ficam guardados apenas neste aparelho/)).toBeInTheDocument()
    const uploads = screen.getAllByRole('button', { name: 'Carregar' })
    expect(uploads).toHaveLength(5)
    for (const upload of uploads) expect(upload).toBeDisabled()
  })

  it('switches the language', async () => {
    mockFetchJson({ status: 'ok' })
    renderWithApp(<ProfilePage />)
    await userEvent.click(screen.getByRole('button', { name: 'English' }))
    expect(await screen.findByRole('heading', { level: 1, name: 'Profile' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'English' })).toHaveAttribute('aria-pressed', 'true')
  })

  it('downloads a copy of everything the app keeps', async () => {
    mockFetchJson({ status: 'ok' })
    seedUser()
    const createObjectURL = vi.fn<(blob: Blob) => string>(() => 'blob:kaye')
    vi.stubGlobal(
      'URL',
      Object.assign(URL, { createObjectURL, revokeObjectURL: vi.fn<(url: string) => void>() }),
    )
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
    renderWithApp(<ProfilePage />, { route: '/perfil?secao=privacidade' })

    await userEvent.click(screen.getByRole('button', { name: 'Descarregar os meus dados' }))
    expect(createObjectURL).toHaveBeenCalledTimes(1)
    expect(click).toHaveBeenCalledTimes(1)
  })

  it('erases the data only after confirming', async () => {
    mockFetchJson({ status: 'ok' })
    seedUser()
    renderWithApp(<ProfilePage />)
    await openTab('Privacidade')
    await userEvent.click(screen.getByRole('button', { name: 'Apagar os meus dados' }))
    const dialog = screen.getByRole('dialog', { name: 'Apagar tudo?' })
    await userEvent.click(within(dialog).getByRole('button', { name: 'Cancelar' }))
    expect(getUser().profile).not.toBeNull()

    await userEvent.click(screen.getByRole('button', { name: 'Apagar os meus dados' }))
    await userEvent.click(
      within(screen.getByRole('dialog', { name: 'Apagar tudo?' })).getByRole('button', {
        name: 'Sim, apagar',
      }),
    )
    expect(getUser().profile).toBeNull()
    expect(screen.getByText('Ainda não tens perfil.')).toBeInTheDocument()
  })

  it('says whether the server answers', async () => {
    mockFetchJson({ status: 'ok' })
    renderWithApp(<ProfilePage />)
    expect(await screen.findByText('Ligado ao servidor')).toBeInTheDocument()
  })

  it('says when the server does not answer', async () => {
    mockFetchJson({ message: 'down' }, 503)
    renderWithApp(<ProfilePage />)
    expect(await screen.findByText('Sem ligação ao servidor', {}, { timeout: 3000 })).toBeInTheDocument()
  })
})
