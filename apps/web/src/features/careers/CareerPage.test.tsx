import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { getUser } from '../../state/userStore'
import { renderWithApp } from '../../test/render'
import { seedTested, seedUser } from '../../test/user'
import CareerPage from './CareerPage'

const open = (slug: string) =>
  renderWithApp(<CareerPage />, { route: `/carreiras/${slug}`, path: '/carreiras/:slug' })

const openTab = async (name: string) => userEvent.click(await screen.findByRole('tab', { name }))

describe('CareerPage', () => {
  it('opens with a credited photo and the three key numbers', async () => {
    open('desenvolvedor-frontend')
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Desenvolvedor Frontend' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('img', { name: /Programador a sorrir/ })).toHaveAttribute('srcset')
    expect(screen.getByRole('link', { name: 'Foto: Daudi Mukiibi · CC BY-SA 4.0' })).toHaveAttribute(
      'href',
      'https://commons.wikimedia.org/wiki/File:Software_Developer_at_work_03.jpg',
    )
    const hero = screen.getByRole('banner')
    expect(hero).toHaveTextContent('Salário mediano: 350 mil Kz/mês')
    expect(hero).toHaveTextContent('Procura +12% em 3 meses')
    expect(hero).toHaveTextContent(/anos? até lá/)
  })

  it('opens what the career is in a popup from the "i" next to the name', async () => {
    open('desenvolvedor-frontend')
    await userEvent.click(await screen.findByRole('button', { name: 'O que é esta profissão?' }))
    const about = screen.getByRole('dialog', { name: 'Desenvolvedor Frontend' })
    expect(about).toHaveTextContent('Constrói os ecrãs de sites e apps: o que as pessoas veem e tocam.')
    expect(about).toHaveTextContent('Desenvolvimento')
    expect(about).toHaveTextContent('Procura alta')
    await userEvent.click(screen.getByRole('button', { name: 'Fechar' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('shows one part at a time, each behind its tab', async () => {
    open('desenvolvedor-frontend')
    const sections = [
      'O que faz',
      'Características',
      'O que pedem',
      'Como lá chegar',
      'Onde estudar',
      'Mercado',
      'CVs modelo',
    ]
    for (const section of sections) {
      await openTab(section)
      expect(screen.getByRole('tab', { name: section })).toHaveAttribute('aria-selected', 'true')
      expect(screen.getAllByRole('tabpanel')).toHaveLength(1)
      expect(screen.getByRole('tabpanel')).toContainElement(
        screen.getByRole('heading', { level: 2, name: section }),
      )
    }
    // The open tab lives in the URL, so back and shared links keep it.
    expect(screen.getByTestId('location')).toHaveTextContent('/carreiras/desenvolvedor-frontend?secao=cvs')
  })

  it('moves between tabs with the arrow keys', async () => {
    open('desenvolvedor-frontend')
    await userEvent.click(await screen.findByRole('tab', { name: 'O que faz' }))
    await userEvent.keyboard('{ArrowRight}')
    expect(screen.getByRole('tab', { name: 'Características' })).toHaveFocus()
    expect(screen.getByRole('tab', { name: 'Características' })).toHaveAttribute('aria-selected', 'true')
    await userEvent.keyboard('{ArrowLeft}{ArrowLeft}')
    expect(screen.getByRole('tab', { name: 'CVs modelo' })).toHaveAttribute('aria-selected', 'true')
    await userEvent.keyboard('{Home}')
    expect(screen.getByRole('tab', { name: 'O que faz' })).toHaveAttribute('aria-selected', 'true')
  })

  it('shows employer asks as aggregated numbers only', async () => {
    open('desenvolvedor-frontend')
    await openTab('O que pedem')
    expect(screen.getByText('Vagas de exemplo analisadas').closest('div')).toHaveTextContent('58')
    expect(screen.getByRole('list', { name: 'Competências mais pedidas' })).toHaveTextContent('JavaScript86%')
    expect(screen.getByText('Só números agregados: o Kayé não publica vagas.')).toBeInTheDocument()
    expect(getUser().visitedCareers).toEqual(['desenvolvedor-frontend'])
  })

  it('saves the career and makes it the destination', async () => {
    open('analista-de-dados')
    await userEvent.click(await screen.findByRole('button', { name: 'Guardar' }))
    await userEvent.click(screen.getByRole('button', { name: 'Escolher como destino' }))
    expect(getUser()).toMatchObject({
      savedCareers: ['analista-de-dados'],
      targetCareer: 'analista-de-dados',
    })
    expect(screen.getByRole('button', { name: 'Guardada' })).toHaveAttribute('aria-pressed', 'true')
    await userEvent.click(screen.getByRole('button', { name: 'O teu destino' }))
    expect(getUser().targetCareer).toBeNull()
  })

  it('draws the path with what is done, where the person is, and what is ahead', async () => {
    seedUser()
    open('desenvolvedor-frontend')
    await openTab('Como lá chegar')
    await userEvent.click(await screen.findByRole('button', { name: 'Via técnica' }))
    const path = screen.getByRole('heading', { name: 'Como lá chegar' }).closest('section')!
    expect(within(path).getAllByText(/· Feito/)).toHaveLength(2)
    expect(within(path).getByText(/· Estás aqui/)).toBeInTheDocument()
    const course = within(path).getByText('Curso profissional de desenvolvimento web').closest('li')!
    expect(course).toHaveTextContent('Opcional')
    expect(course).toHaveTextContent('Dá para aprender sozinho')
    expect(course).toHaveTextContent('O certificado é opcional')
    expect(within(path).getByText('3 projetos publicados').closest('li')).toHaveTextContent('Essencial')
    expect(within(path).getByText('Duração: 5 a 5,5 anos')).toBeInTheDocument()
  })

  it('ranks where to study with the same scores as the Cursos page', async () => {
    open('desenvolvedor-frontend')
    await openTab('Onde estudar')
    const study = (await screen.findByRole('heading', { name: 'Onde estudar' })).closest('section')!
    expect(await within(study).findByText('Desenvolvimento Web com React')).toBeInTheDocument()
    expect(within(study).getByRole('link', { name: /Ver todos os cursos/ })).toHaveAttribute(
      'href',
      '/cursos?carreira=desenvolvedor-frontend',
    )
  })

  it('opens a career that is still being curated without inventing content', async () => {
    open('product-manager')
    expect(await screen.findByRole('heading', { level: 1, name: 'Product Manager' })).toBeInTheDocument()
    expect(screen.getByText(/Estamos a preparar esta página/)).toBeInTheDocument()
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })

  it('says when a career does not exist', async () => {
    open('nao-existe')
    expect(
      await screen.findByText('Esta profissão não existe ou ainda não foi publicada.'),
    ).toBeInTheDocument()
  })
})

describe('FitPanel', () => {
  it('comes after the tabs and can be minimized', async () => {
    open('desenvolvedor-frontend')
    const fit = await screen.findByRole('region', { name: 'O meu encaixe' })
    expect(screen.getByRole('tabpanel').compareDocumentPosition(fit)).toBe(Node.DOCUMENT_POSITION_FOLLOWING)
    const toggle = within(fit).getByRole('button', { name: 'O meu encaixe' })
    expect(within(fit).getByText('Interesses')).toBeVisible()
    await userEvent.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    expect(within(fit).getByText('Interesses')).not.toBeVisible()

    // The hero's "Encaixe" button opens it again.
    await userEvent.click(screen.getByRole('button', { name: 'Encaixe' }))
    expect(toggle).toHaveAttribute('aria-expanded', 'true')
  })

  it('invites the test and the profile when they are missing', async () => {
    open('designer-ui-ux')
    const fit = await screen.findByRole('region', { name: 'O meu encaixe' })
    expect(within(fit).getByRole('link', { name: 'Faz o teste vocacional para saber.' })).toHaveAttribute(
      'href',
      '/teste',
    )
    expect(
      within(fit).getByRole('link', { name: 'Diz-nos a tua escolaridade no perfil.' }),
    ).toBeInTheDocument()
  })

  it('updates the skills part as soon as the person marks what they know', async () => {
    seedTested()
    open('desenvolvedor-frontend')
    const fit = await screen.findByRole('region', { name: 'O meu encaixe' })
    // The profile needs the questions, which load like any API data.
    expect(await within(fit).findByText('Combina muito')).toBeInTheDocument()
    expect(within(fit).getByText('Faltam 2 passos, pela via técnica')).toBeInTheDocument()
    expect(within(fit).getByText('Já tens 0 de 6 essenciais')).toBeInTheDocument()

    await userEvent.click(within(fit).getByRole('button', { name: 'Marcar o que sei' }))
    const dialog = screen.getByRole('dialog', { name: 'O que já sabes?' })
    await userEvent.click(
      within(within(dialog).getByRole('group', { name: 'React' })).getByRole('button', { name: 'Sei fazer' }),
    )
    await userEvent.click(
      within(within(dialog).getByRole('group', { name: 'Git' })).getByRole('button', { name: 'A aprender' }),
    )
    await userEvent.click(
      within(within(dialog).getByRole('group', { name: 'Git' })).getByRole('button', { name: 'Ainda não' }),
    )
    await userEvent.click(within(dialog).getByRole('button', { name: 'Feito' }))

    expect(getUser().skills).toEqual({ react: 'sei' })
    expect(within(fit).getByText('Já tens 1 de 6 essenciais')).toBeInTheDocument()
  })
})
