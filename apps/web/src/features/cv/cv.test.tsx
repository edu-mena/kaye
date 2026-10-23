import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { EMPTY_CV, getUser } from '../../state/userStore'
import { renderWithApp } from '../../test/render'
import { seedUser } from '../../test/user'
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
    expect(screen.getByText('Ainda não começaste o teu CV.')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Começar do zero' })).toHaveAttribute('href', '/cv/editar')
    expect(await screen.findByRole('link', { name: /Analista de Dados Júnior/ })).toHaveAttribute(
      'href',
      '/cv/modelos/dados-junior',
    )
  })

  it('shows how complete the CV is', () => {
    seedUser({ cv: { ...EMPTY_CV, name: 'Joana', headline: 'Frontend' } })
    renderWithApp(<CvPage />)
    expect(screen.getByText('Completo a 29%')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Editar o meu CV' })).toBeInTheDocument()
  })
})

describe('CvExamplePage', () => {
  it('explains why each part works', async () => {
    openExample('frontend-primeiro-emprego')
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Desenvolvedora Frontend em início de carreira' }),
    ).toBeInTheDocument()
    const summary = screen.getByRole('region', { name: 'Resumo' })
    expect(within(summary).getByText('Porque funciona')).toBeInTheDocument()
  })

  it('starts the person CV from the model structure', async () => {
    seedUser()
    openExample('dados-junior')
    await userEvent.click(await screen.findByRole('button', { name: 'Começar a partir deste modelo' }))
    expect(getUser().cvBasedOn).toBe('dados-junior')
    expect(screen.getByTestId('location')).toHaveTextContent('/cv/editar')
  })

  it('asks before replacing a CV already started', async () => {
    seedUser({ cv: { ...EMPTY_CV, summary: 'O meu resumo' } })
    openExample('dados-junior')
    await userEvent.click(await screen.findByRole('button', { name: 'Começar a partir deste modelo' }))
    const dialog = screen.getByRole('dialog', { name: 'Substituir o teu CV?' })
    await userEvent.click(within(dialog).getByRole('button', { name: 'Cancelar' }))
    expect(getUser().cv.summary).toBe('O meu resumo')

    await userEvent.click(screen.getByRole('button', { name: 'Começar a partir deste modelo' }))
    await userEvent.click(
      within(screen.getByRole('dialog', { name: 'Substituir o teu CV?' })).getByRole('button', {
        name: 'Substituir',
      }),
    )
    expect(getUser().cv.summary).toBe('')
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
    await userEvent.type(screen.getByLabelText('Nome'), 'Joana Manuel')
    await userEvent.type(screen.getByRole('textbox', { name: 'Competências' }), 'React, Git,')

    expect(getUser().cv).toMatchObject({ name: 'Joana Manuel', skills: ['React', 'Git'] })
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
    expect(getUser().cv.experience.map((entry) => entry.title)).toEqual(['', 'Estágio'])

    await userEvent.click(within(experience).getAllByRole('button', { name: 'Tirar' })[0]!)
    expect(getUser().cv.experience.map((entry) => entry.title)).toEqual(['Estágio'])
  })

  it('fills every field, and the CV becomes complete', async () => {
    seedUser()
    renderWithApp(<CvEditorPage />)
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

    const { cv } = getUser()
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

  it('shows the tips of the model it started from, and the PDF as coming soon', async () => {
    seedUser({ cvBasedOn: 'frontend-primeiro-emprego' })
    renderWithApp(<CvEditorPage />)
    expect(await screen.findAllByText(/Dica do modelo/)).not.toHaveLength(0)
    expect(screen.getByRole('button', { name: 'Descarregar PDF' })).toBeDisabled()
    expect(screen.getByText('O PDF chega com o servidor.')).toBeInTheDocument()
  })

  it('switches between editing and preview on phones', async () => {
    seedUser()
    renderWithApp(<CvEditorPage />)
    const form = screen.getByRole('form', { name: 'Editar o meu CV' })
    await userEvent.click(screen.getByRole('button', { name: 'Pré-visualização' }))
    expect(form).toHaveClass('hidden')
    await userEvent.click(screen.getByRole('button', { name: 'Editar' }))
    expect(form).not.toHaveClass('hidden')
  })
})
