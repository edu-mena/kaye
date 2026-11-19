import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { getAssessment } from '../../data/source'
import { getUser } from '../../state/userStore'
import { renderWithApp } from '../../test/render'
import { answersFor, seedTested, seedUser } from '../../test/user'
import AssessmentPage from './AssessmentPage'
import ResultPage from './ResultPage'

const QUESTIONS = await getAssessment('pt')
/** The question as the page asks it: the statement completes "Quanto gostas de…". */
const asked = (id: string) => `${QUESTIONS.find((question) => question.id === id)?.text ?? id}?`

describe('AssessmentPage', () => {
  it('records each answer, moves on, and lets the person go back', async () => {
    seedUser()
    renderWithApp(<AssessmentPage />)
    await userEvent.click(await screen.findByRole('button', { name: 'Começar' }))

    expect(screen.getByText('Pergunta 1 de 42')).toBeInTheDocument()
    const first = QUESTIONS[0]?.id ?? ''
    expect(screen.getByRole('group', { name: (name) => name.includes(asked(first)) })).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: /Bastante/ }))

    expect(getUser().answers).toEqual({ [first]: 4 })
    expect(screen.getByText('Pergunta 2 de 42')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: /Anterior/ }))
    expect(screen.getByRole('button', { name: /Bastante/ })).toHaveAttribute('aria-pressed', 'true')
  })

  it('continues where the person stopped', async () => {
    const answers = answersFor()
    delete answers.I3
    seedUser({ answers })
    renderWithApp(<AssessmentPage />)
    await userEvent.click(await screen.findByRole('button', { name: 'Continuar o teste' }))
    expect(screen.getByRole('group', { name: (name) => name.includes(asked('I3')) })).toBeInTheDocument()
  })

  it('finishes on the last question and goes on to part 2, the strengths', async () => {
    const answers = answersFor()
    delete answers.C7
    seedUser({ answers })
    renderWithApp(<AssessmentPage />, { route: '/teste', path: '/teste' })
    await userEvent.click(await screen.findByRole('button', { name: 'Continuar o teste' }))

    expect(screen.getByText('Pergunta 42 de 42')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Ver o resultado/ })).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: /Muito/ }))
    await userEvent.click(screen.getByRole('button', { name: /Ver o resultado/ }))

    expect(getUser().assessmentCompletedAt).not.toBeNull()
    expect(screen.getByTestId('location')).toHaveTextContent('/teste/valencias')
  })

  it('offers the result or a fresh start once finished', async () => {
    seedTested()
    renderWithApp(<AssessmentPage />)
    expect(await screen.findByRole('link', { name: 'Ver o resultado' })).toHaveAttribute(
      'href',
      '/teste/resultado',
    )
    await userEvent.click(screen.getByRole('button', { name: 'Recomeçar o teste' }))
    expect(getUser().answers).toEqual({})
    expect(screen.getByText('Pergunta 1 de 42')).toBeInTheDocument()
  })
})

describe('ResultPage', () => {
  it('shows the code, the three strongest interests and 6 careers with reasons', async () => {
    seedTested()
    renderWithApp(<ResultPage />)

    expect(await screen.findByRole('heading', { name: 'O teu perfil: IAC' })).toBeInTheDocument()
    const scores = screen.getByRole('list', { name: 'Os teus interesses, de 0 a 100' })
    expect(within(scores).getAllByRole('listitem')[0]).toHaveTextContent('Investigativo100')

    const careers = await screen.findAllByRole('link', { name: /Combina com o teu lado/ })
    expect(careers).toHaveLength(6)
  })

  it('sends people who have not finished the test back to it', () => {
    seedUser()
    renderWithApp(<ResultPage />, { route: '/teste/resultado', path: '/teste/resultado' })
    expect(screen.getByTestId('location')).toHaveTextContent('/teste')
  })
})
