import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { getUser } from '../../state/userStore'
import { renderWithApp } from '../../test/render'
import { savedCv, seedUser } from '../../test/user'
import CvEditorPage from './CvEditorPage'
import CvExamplePage from './CvExamplePage'
import CvPage from './CvPage'

/** Puts text in a field in one go, as when the person pastes it. */
async function fill(field: HTMLElement, text: string) {
  await userEvent.click(field)
  await userEvent.paste(text)
}

const openExample = (id: string) =>
  renderWithApp(<CvExamplePage />, { route: `/cv/modelos/${id}`, path: '/cv/modelos/:id' })

describe('CvPage', () => {
  it('invites to start and lists the model CVs by career', async () => {
    renderWithApp(<CvPage />)
    expect(screen.getByText('Um CV que abre portas')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Continuar a editar' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Criar novo CV' })).toBeInTheDocument()
    const [dataModel] = await screen.findAllByRole('button', { name: /^Analista de Dados.*Júnior · Europeu/ })
    await userEvent.click(dataModel!)
    expect(screen.getByRole('dialog', { name: /^Analista de Dados · / })).toBeInTheDocument()
  })

  it('shows how complete the CV is', () => {
    seedUser({ cvs: [savedCv({ name: 'Joana', headline: 'Frontend' })] })
    renderWithApp(<CvPage />)
    expect(screen.getAllByText('Completo a 29%').length).toBeGreaterThan(0)
    expect(screen.getByRole('button', { name: 'Continuar a editar' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Editar: O meu CV' })).toBeInTheDocument()
  })
})

describe('CvExamplePage', () => {
  it('explains why the model works, section by section, with the rules of its career', async () => {
    openExample('frontend-primeiro-emprego')
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Desenvolvedora Frontend em início de carreira' }),
    ).toBeInTheDocument()
    expect(
      within(screen.getByRole('region', { name: 'Porque funciona' })).getByText('Resumo'),
    ).toBeInTheDocument()
    const guide = await screen.findByRole('region', { name: 'O que este CV precisa' })
    expect(guide).toHaveTextContent('Links do GitHub')
    expect(guide).toHaveTextContent('Foto e elementos que distraem')
  })

  it('starts the person CV from the model structure', async () => {
    seedUser()
    openExample('dados-junior')
    await userEvent.click(await screen.findByRole('button', { name: 'Começar a partir deste modelo' }))
    expect(getUser().cvs[0]?.basedOn).toBe('dados-junior')
    expect(screen.getByTestId('location')).toHaveTextContent('/cv/editar')
  })

  it('offers a way back when the model does not exist', async () => {
    openExample('nao-existe')
    expect(await screen.findByRole('link', { name: 'CVs modelo' })).toHaveAttribute('href', '/cv')
  })
})

describe('CvEditorPage', () => {
  it('saves every change on the device and shows it in the preview', async () => {
    seedUser()
    renderWithApp(<CvEditorPage />)
    // A new CV starts with the profile's name.
    expect(screen.getByLabelText('Nome')).toHaveValue('Joana')
    await userEvent.clear(screen.getByLabelText('Nome'))
    await userEvent.type(screen.getByLabelText('Nome'), 'Joana Manuel')
    await userEvent.type(screen.getByRole('textbox', { name: 'Competências' }), 'React, Git,')

    expect(getUser().cvs[0]!.cv).toMatchObject({ name: 'Joana Manuel', skills: ['React', 'Git'] })
    // The text keeps the trailing comma while typing.
    expect(screen.getByRole('textbox', { name: 'Competências' })).toHaveValue('React, Git,')
    expect(screen.getAllByText('Joana Manuel').length).toBeGreaterThan(0)
  })

  it('adds and removes entries', async () => {
    seedUser()
    renderWithApp(<CvEditorPage />)
    const experience = screen.getByRole('group', { name: 'Experiência' })
    await userEvent.click(within(experience).getByRole('button', { name: 'Acrescentar' }))
    await userEvent.click(within(experience).getByRole('button', { name: 'Acrescentar' }))
    await userEvent.type(within(experience).getAllByLabelText('Título')[1]!, 'Estágio')
    expect(getUser().cvs[0]!.cv.experience.map((entry) => entry.title)).toEqual(['', 'Estágio'])

    await userEvent.click(within(experience).getAllByRole('button', { name: 'Tirar' })[0]!)
    expect(getUser().cvs[0]!.cv.experience.map((entry) => entry.title)).toEqual(['Estágio'])
  })

  it('fills every field, and the CV becomes complete', async () => {
    seedUser()
    renderWithApp(<CvEditorPage />)
    await userEvent.clear(screen.getByLabelText('Nome'))
    await fill(screen.getByLabelText('Nome'), 'Ana Kiala')
    await fill(screen.getByLabelText('Título profissional'), 'Designer UI/UX')
    await fill(screen.getByLabelText('Contacto'), 'ana@exemplo.ao')
    await fill(screen.getByRole('textbox', { name: 'Resumo' }), 'Redesenhei a app de uma associação.')
    await fill(screen.getByRole('textbox', { name: 'Línguas' }), 'Português, Francês')

    for (const section of ['Formação', 'Projetos']) {
      const group = screen.getByRole('group', { name: section })
      await userEvent.click(within(group).getByRole('button', { name: 'Acrescentar' }))
      await fill(within(group).getByLabelText('Título'), `${section} 1`)
      await fill(within(group).getByLabelText('Onde'), 'Luanda')
      await fill(within(group).getByLabelText('Quando'), '2025')
      await fill(within(group).getByLabelText(/O que fizeste/), 'Um resultado concreto')
    }
    await fill(screen.getByRole('textbox', { name: 'Competências' }), 'Figma')

    const { cv } = getUser().cvs[0]!
    expect(cv).toMatchObject({
      headline: 'Designer UI/UX',
      contact: 'ana@exemplo.ao',
      languages: ['Português', 'Francês'],
    })
    expect(cv.projects[0]).toMatchObject({
      title: 'Projetos 1',
      place: 'Luanda',
      period: '2025',
      description: 'Um resultado concreto',
    })
    const { cvCompleteness } = await import('../../domain/cv')
    expect(cvCompleteness(cv)).toBe(1)
  })

  it('shows the tips of the model it started from, and makes the PDF on the device', async () => {
    seedUser({ cvs: [savedCv({ name: 'Joana Manuel' }, 'frontend-primeiro-emprego')] })
    const createObjectURL = vi.fn<(blob: Blob) => string>(() => 'blob:kaye')
    vi.stubGlobal(
      'URL',
      Object.assign(URL, { createObjectURL, revokeObjectURL: vi.fn<(url: string) => void>() }),
    )
    renderWithApp(<CvEditorPage />)
    expect(await screen.findAllByText(/Dica do modelo/)).not.toHaveLength(0)

    await userEvent.click(screen.getByRole('button', { name: 'Descarregar PDF' }))
    await waitFor(() => expect(createObjectURL).toHaveBeenCalledTimes(1))
    expect(createObjectURL.mock.calls[0]?.[0].type).toBe('application/pdf')
  })

  it('switches between editing and preview on phones', async () => {
    seedUser()
    renderWithApp(<CvEditorPage />)
    const form = screen.getByRole('form', { name: 'Editar o meu CV' })
    await userEvent.click(screen.getByRole('button', { name: 'Pré-visualização' }))
    expect(form).toHaveClass('hidden')
    // The switch shows twice (top bar and bottom of the phone screen).
    await userEvent.click(screen.getAllByRole('button', { name: 'Editar' })[0] as HTMLElement)
    expect(form).not.toHaveClass('hidden')
  })
})
