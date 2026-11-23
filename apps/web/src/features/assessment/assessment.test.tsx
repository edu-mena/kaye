import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { getAssessment } from '../../data/source'
import { useInterestAreas } from '../../lib/useInterestAreas'
import { getUser } from '../../state/userStore'
import { renderWithApp } from '../../test/render'
import { answersFor, choicesFor, seedTested, seedUser } from '../../test/user'
import AssessmentPage from './AssessmentPage'
import ResultPage from './ResultPage'

const QUESTIONS = await getAssessment('pt')
const text = (id: string) => QUESTIONS.find((question) => question.id === id)?.text ?? id
/** The statement as the page asks it: it completes "Quanto gostas de…". */
const asked = (id: string) => `${text(id)}?`
const FIRST_SITUATION = QUESTIONS.find((question) => question.kind === 'situation')
const LAST = QUESTIONS.at(-1)

function Areas() {
  return <output data-testid="areas">{useInterestAreas().join(',')}</output>
}

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

  it('asks a situation with a card for each interest, and records the interest of the card picked', async () => {
    seedUser({ answers: answersFor() })
    renderWithApp(<AssessmentPage />)
    await userEvent.click(await screen.findByRole('button', { name: 'Continuar o teste' }))

    if (FIRST_SITUATION?.kind !== 'situation') throw new Error('no situation question')
    expect(
      screen.getByRole('group', { name: (name) => name.includes(FIRST_SITUATION.text) }),
    ).toBeInTheDocument()
    expect(screen.getByText(/Na escola/)).toBeInTheDocument()
    expect(screen.getAllByRole('button', { pressed: false })).toHaveLength(6)
    expect(screen.queryByRole('button', { name: /Bastante/ })).not.toBeInTheDocument()

    const card = FIRST_SITUATION.options.find((option) => option.dimension === 'A')
    await userEvent.click(screen.getByRole('button', { name: card?.text ?? '' }))

    expect(getUser().choices).toEqual({ [FIRST_SITUATION.id]: 'A' })
    expect(getUser().answers).toEqual(answersFor())
    await userEvent.click(screen.getByRole('button', { name: /Anterior/ }))
    expect(screen.getByRole('button', { name: card?.text ?? '' })).toHaveAttribute('aria-pressed', 'true')
  })

  it('continues where the person stopped, whichever kind of question was left', async () => {
    const answers = answersFor()
    delete answers.I3
    seedUser({ answers, choices: choicesFor() })
    renderWithApp(<AssessmentPage />)
    await userEvent.click(await screen.findByRole('button', { name: 'Continuar o teste' }))
    expect(screen.getByRole('group', { name: (name) => name.includes(asked('I3')) })).toBeInTheDocument()
  })

  it('finishes on the last question and goes on to part 2, the strengths', async () => {
    const answers = answersFor()
    if (LAST?.kind !== 'statement') throw new Error('the last question is a statement')
    delete answers[LAST.id]
    seedUser({ answers, choices: choicesFor() })
    renderWithApp(<AssessmentPage />, { route: '/teste', path: '/teste' })
    await userEvent.click(await screen.findByRole('button', { name: 'Continuar o teste' }))

    expect(screen.getByText('Pergunta 42 de 42')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Ver o resultado/ })).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: /Muito/ }))
    await userEvent.click(screen.getByRole('button', { name: /Ver o resultado/ }))

    expect(getUser().assessmentCompletedAt).not.toBeNull()
    expect(screen.getByTestId('location')).toHaveTextContent('/teste/valencias')
  })

  it('offers the result or a fresh start once finished, and a fresh start clears both kinds of answer', async () => {
    seedTested()
    renderWithApp(<AssessmentPage />)
    expect(await screen.findByRole('link', { name: 'Ver o resultado' })).toHaveAttribute(
      'href',
      '/teste/resultado',
    )
    await userEvent.click(screen.getByRole('button', { name: 'Recomeçar o teste' }))
    expect(getUser().answers).toEqual({})
    expect(getUser().choices).toEqual({})
    expect(screen.getByText('Pergunta 1 de 42')).toBeInTheDocument()
  })

  it('asks a test finished before the situations existed for them, not for the whole test again', async () => {
    seedUser({ answers: answersFor(), assessmentCompletedAt: '2026-10-23T10:00:00.000Z' })
    renderWithApp(<AssessmentPage />)

    expect(screen.queryByRole('link', { name: 'Ver o resultado' })).not.toBeInTheDocument()
    await userEvent.click(await screen.findByRole('button', { name: 'Continuar o teste' }))
    expect(
      screen.getByRole('group', { name: (name) => name.includes(FIRST_SITUATION?.text ?? '') }),
    ).toBeInTheDocument()
  })

  it('updates the interest profile the lists use when the test is finished', async () => {
    const answers = answersFor()
    if (LAST?.kind !== 'statement') throw new Error('the last question is a statement')
    delete answers[LAST.id]
    seedUser({ answers, choices: choicesFor() })
    renderWithApp(
      <>
        <AssessmentPage />
        <Areas />
      </>,
    )
    await userEvent.click(await screen.findByRole('button', { name: 'Continuar o teste' }))
    expect(screen.getByTestId('areas')).toHaveTextContent('')

    await userEvent.click(screen.getByRole('button', { name: /Muito/ }))
    await userEvent.click(screen.getByRole('button', { name: /Ver o resultado/ }))

    expect((await screen.findByTestId('areas')).textContent).not.toBe('')
  })
})

describe('ResultPage', () => {
  it('shows the code, the three strongest interests and 5 careers with reasons', async () => {
    seedTested()
    renderWithApp(<ResultPage />)

    expect(await screen.findByRole('heading', { name: 'O teu perfil: IAC' })).toBeInTheDocument()
    const scores = screen.getByRole('list', { name: 'Os teus interesses, de 0 a 100' })
    expect(within(scores).getAllByRole('listitem')[0]).toHaveTextContent('Investigativo100')

    const careers = await screen.findAllByRole('link', { name: /Combina com o teu lado/ })
    expect(careers).toHaveLength(5)
  })

  it('explains each area in the person’s own words and gives each career a next step', async () => {
    seedTested()
    renderWithApp(<ResultPage />)

    const why = await screen.findByRole('region', { name: 'Porquê estas áreas' })
    expect(within(why).getAllByRole('heading', { level: 3 }).length).toBeGreaterThanOrEqual(1)
    expect(within(why).getAllByText(/^(Disseste que gostas de|Escolheste:)/).length).toBeGreaterThanOrEqual(1)

    const steps = await screen.findAllByText('O teu próximo passo')
    expect(steps).toHaveLength(5)
    // The curated careers name the first step of their easiest way in; the others point to the career page.
    expect(
      (
        await screen.findAllByText(
          /^(Estudar|Fazer uma formação|Tirar uma certificação|Montar um portefólio|Ganhar experiência)/,
        )
      ).length,
    ).toBeGreaterThanOrEqual(1)
  })

  it('stays on the result while the questions are still loading, as on a reload of this page', async () => {
    seedTested()
    renderWithApp(<ResultPage />, { route: '/teste/resultado', path: '/teste/resultado' })
    expect(screen.getByTestId('location')).toHaveTextContent('/teste/resultado')
    expect(await screen.findByRole('heading', { name: /O teu perfil/ })).toBeInTheDocument()
    expect(screen.getByTestId('location')).toHaveTextContent('/teste/resultado')
  })

  it('sends people who have not finished the test back to it', () => {
    seedUser()
    renderWithApp(<ResultPage />, { route: '/teste/resultado', path: '/teste/resultado' })
    expect(screen.getByTestId('location')).toHaveTextContent('/teste')
  })
})
