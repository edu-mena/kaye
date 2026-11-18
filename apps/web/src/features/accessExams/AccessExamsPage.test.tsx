import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getUser } from '../../state/userStore'
import { fakeClock, jumpTime } from '../../test/clock'
import { renderWithApp } from '../../test/render'
import { seedUser } from '../../test/user'
import AccessExamsPage from './AccessExamsPage'

const SLOW = { timeout: 30000 }

/** Answers the question on screen with its first option. */
async function answerFirst() {
  const first = screen.getAllByRole('button').find((button) => /^[ABCD]/.test(button.textContent ?? ''))
  await userEvent.click(first as HTMLElement)
}

beforeEach(() => {
  seedUser()
  vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined)
})

describe('AccessExamsPage', () => {
  it('lists the subjects, those with questions first', async () => {
    renderWithApp(<AccessExamsPage />, { route: '/exames-de-acesso' })
    expect(await screen.findByRole('heading', { name: 'As disciplinas' })).toBeInTheDocument()
    const maths = screen.getByRole('article', { name: 'Matemática' })
    expect(within(maths).getByText(/perguntas$/)).toBeInTheDocument()
    expect(within(maths).getByText('Ainda não treinaste esta disciplina.')).toBeInTheDocument()
    expect(screen.getAllByText('Em breve').length).toBeGreaterThan(0)
    expect(screen.getByText(/Escolhe um curso e uma instituição/)).toBeInTheDocument()
  })

  it('trains a subject with a correction at each answer, then shows and keeps the result', SLOW, async () => {
    renderWithApp(<AccessExamsPage />, { route: '/exames-de-acesso' })
    const maths = await screen.findByRole('article', { name: 'Matemática' })
    await userEvent.click(within(maths).getByRole('button', { name: 'Treino' }))

    for (let question = 1; question <= 10; question++) {
      expect(screen.getAllByText(`Pergunta ${question} de 10`).length).toBeGreaterThan(0)
      await answerFirst()
      expect(screen.getByText(/^(Certo!|Errado\. A certa é: )/)).toBeInTheDocument()
      await userEvent.click(
        screen.getByRole('button', { name: question === 10 ? /Ver o resultado/ : /Seguinte/ }),
      )
    }

    expect(await screen.findByText(/de 10 certas/)).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Temas a rever' })).toBeInTheDocument()
    expect(getUser().accessExams).toHaveLength(1)
    expect(getUser().accessExams[0]).toMatchObject({ subject: 'matematica', mode: 'practice' })

    await userEvent.click(screen.getByRole('button', { name: 'Outras disciplinas' }))
    const again = await screen.findByRole('article', { name: 'Matemática' })
    expect(within(again).getByText(/sessões/)).toBeInTheDocument()
  })

  it('times the simulation, corrects at the end and can be left', SLOW, async () => {
    renderWithApp(<AccessExamsPage />, { route: '/exames-de-acesso' })
    const maths = await screen.findByRole('article', { name: 'Matemática' })
    await userEvent.click(within(maths).getByRole('button', { name: /Simulação/ }))

    expect(screen.getByRole('timer')).toHaveTextContent('60:00')
    await answerFirst()
    expect(screen.queryByText(/^(Certo!|Errado)/)).not.toBeInTheDocument()
    expect(screen.getAllByText('Pergunta 2 de 30').length).toBeGreaterThan(0)

    await userEvent.click(screen.getByRole('button', { name: 'Sair' }))
    expect(await screen.findByRole('heading', { name: 'As disciplinas' })).toBeInTheDocument()
    expect(getUser().accessExams).toHaveLength(0)
  })

  it('ends the simulation when the time runs out, counting the blanks as wrong', SLOW, async () => {
    fakeClock()
    try {
      renderWithApp(<AccessExamsPage />, { route: '/exames-de-acesso' })
      const maths = await screen.findByRole('article', { name: 'Matemática' })
      await userEvent.click(within(maths).getByRole('button', { name: /Simulação/ }))
      await jumpTime(60 * 60 * 1000 + 1000)

      expect(await screen.findByText(/O tempo acabou/)).toBeInTheDocument()
      expect(screen.getAllByText('Ficou sem resposta')).toHaveLength(30)
      expect(getUser().accessExams[0]).toMatchObject({ mode: 'simulation' })
    } finally {
      vi.useRealTimers()
    }
  })

  it('shows the exam of a course and institution, with a button per subject', async () => {
    renderWithApp(<AccessExamsPage />, { route: '/exames-de-acesso' })
    const course = await screen.findByLabelText('Curso')
    await vi.waitFor(() => expect(within(course).getAllByRole('option').length).toBeGreaterThan(1))
    const first = within(course).getAllByRole('option')[1] as HTMLOptionElement
    await userEvent.selectOptions(course, first.value)

    const institution = screen.getByLabelText('Instituição')
    expect(institution).toBeEnabled()
    const academies = within(institution).getAllByRole('option')
    await userEvent.selectOptions(institution, (academies[1] as HTMLOptionElement).value)

    expect(screen.queryByText(/Escolhe um curso e uma instituição/)).not.toBeInTheDocument()
    expect(screen.getByTestId('location')).toHaveTextContent(`curso=${first.value}`)
    expect(screen.getByTestId('location')).toHaveTextContent('instituicao=')
  })
})
