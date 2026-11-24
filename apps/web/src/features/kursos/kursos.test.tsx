import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { courseSteps, KURSOS, REVIEW, stepKey } from '../../data/kursos'
import { EMPTY_KURSO, getUser, type KursoProgress } from '../../state/userStore'
import { renderWithApp } from '../../test/render'
import { seedUser } from '../../test/user'
import CompletedPage from './CompletedPage'
import CourseOverviewPage from './CourseOverviewPage'
import ExamPage from './ExamPage'
import LessonPage from './LessonPage'

// The certificate is a PDF saved on the device; here the saving is what is checked.
const saved = vi.hoisted(() => vi.fn<(blob: Blob, name: string) => void>())
vi.mock('../../lib/saveFile', () => ({ saveFile: saved }))

const SLOW = { timeout: 60000 }
const COURSE = KURSOS[0] as (typeof KURSOS)[number]
const STEPS = courseSteps(COURSE)
const ALL_DONE = STEPS.map(stepKey)
const lessonRoute = 'kursos/:curso/:unidade/:licao'

const withProgress = (progress: Partial<KursoProgress>) =>
  seedUser({ kursos: { [COURSE.id]: { ...EMPTY_KURSO, ...progress } } })
const progress = () => getUser().kursos[COURSE.id] ?? EMPTY_KURSO

const reset = () => screen.queryByRole('button', { name: 'Recomeçar' })
const exam = () =>
  renderWithApp(<ExamPage />, { route: `/kursos/${COURSE.id}/exame`, path: 'kursos/:curso/exame' })
const completed = () =>
  renderWithApp(<CompletedPage />, {
    route: `/kursos/${COURSE.id}/concluido`,
    path: 'kursos/:curso/concluido',
  })

/** Fills in every exercise on the screen: the first option of each choice, a word in each gap, the first match. */
async function answerEverything(scope: HTMLElement = document.body) {
  const groups = new Set(
    within(scope)
      .queryAllByRole('radio')
      .map((radio) => radio.getAttribute('name')),
  )
  for (const name of groups) {
    const first = scope.querySelector(`input[type="radio"][name="${CSS.escape(name ?? '')}"]`)
    if (first) await userEvent.click(first)
  }
  for (const input of within(scope).queryAllByPlaceholderText('Escreve aqui'))
    await userEvent.type(input, 'is')
  for (const select of within(scope).queryAllByRole('combobox')) {
    const option = within(select).getAllByRole('option')[1] as HTMLOptionElement | undefined
    if (option) await userEvent.selectOptions(select, option.value)
  }
}

beforeEach(() => {
  seedUser()
  saved.mockClear()
  vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined)
})

describe('CourseOverviewPage', () => {
  it('shows the course, its roadmap and where to start', async () => {
    renderWithApp(<CourseOverviewPage />, { route: `/kursos/${COURSE.id}`, path: 'kursos/:curso' })
    expect(await screen.findByRole('heading', { level: 1, name: COURSE.title })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Roadmap' })).toBeInTheDocument()
    expect(screen.getAllByText('Em breve').length).toBeGreaterThan(0)
    expect(screen.getByText('Acaba todas as unidades para desbloquear o exame.')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Começar' })).toHaveAttribute(
      'href',
      `/kursos/${COURSE.id}/${stepKey(STEPS[0] as never)}`,
    )
    expect(screen.getByRole('heading', { name: 'Créditos e licenças' })).toBeInTheDocument()
  })

  it('continues where the person stopped, then opens the exam when every unit is done', async () => {
    withProgress({ done: [ALL_DONE[0] as string], position: ALL_DONE[1] as string, scores: { u1: 0.8 } })
    const { unmount } = renderWithApp(<CourseOverviewPage />, {
      route: `/kursos/${COURSE.id}`,
      path: 'kursos/:curso',
    })
    expect(await screen.findByRole('link', { name: 'Continuar' })).toHaveAttribute(
      'href',
      `/kursos/${COURSE.id}/${ALL_DONE[1]}`,
    )
    expect(screen.getAllByText('Em curso').length).toBeGreaterThan(0)
    unmount()

    withProgress({ done: ALL_DONE, scores: { u1: 0.8 } })
    renderWithApp(<CourseOverviewPage />, { route: `/kursos/${COURSE.id}`, path: 'kursos/:curso' })
    expect(await screen.findByRole('link', { name: 'Fazer o exame' })).toHaveAttribute(
      'href',
      `/kursos/${COURSE.id}/exame`,
    )
    expect(screen.getAllByText('Concluída').length).toBeGreaterThan(0)
    expect(screen.getByText('80%')).toBeInTheDocument()
  })

  it('says when to try the exam again, and links to the certificate once passed', async () => {
    const at = new Date().toISOString()
    withProgress({ done: ALL_DONE, exam: [{ at, score: 0.4, units: {} }] })
    const { unmount } = renderWithApp(<CourseOverviewPage />, {
      route: `/kursos/${COURSE.id}`,
      path: 'kursos/:curso',
    })
    expect(await screen.findByText(/Nova tentativa a partir das/)).toBeInTheDocument()
    unmount()

    withProgress({
      done: ALL_DONE,
      exam: [{ at, score: 0.9, units: {} }],
      completedAt: at,
      certificate: 'KY-1',
    })
    renderWithApp(<CourseOverviewPage />, { route: `/kursos/${COURSE.id}`, path: 'kursos/:curso' })
    expect(await screen.findByText('Exame feito com 90%.')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Ver o certificado' })).toHaveAttribute(
      'href',
      `/kursos/${COURSE.id}/concluido`,
    )
  })

  it('sends an unknown course back to the list', async () => {
    renderWithApp(<CourseOverviewPage />, { route: '/kursos/nao-existe', path: 'kursos/:curso' })
    await waitFor(() => expect(screen.getByTestId('location')).toHaveTextContent('/kursos'))
  })
})

describe('LessonPage', () => {
  // One lesson per written topic of every course (about 90): it grows with each topic written.
  it('opens every written lesson of every course, with its blocks', { timeout: 180000 }, async () => {
    for (const course of KURSOS) {
      for (const step of courseSteps(course).filter((item) => item.lesson !== REVIEW)) {
        const { unmount } = renderWithApp(<LessonPage />, {
          route: `/kursos/${course.id}/${step.unit}/${step.lesson}`,
          path: lessonRoute,
        })
        // The text of a unit loads the first time it is opened.
        const next = await screen.findByRole('button', { name: 'Concluir e seguir' })
        await waitFor(() => expect(next).toBeEnabled())
        expect(screen.getAllByText(/Unidade \d/).length).toBeGreaterThan(0)
        unmount()
      }
    }
  })

  it('checks a practice exercise and shows its key, then moves to the next step', async () => {
    const [first, second] = STEPS as [(typeof STEPS)[number], (typeof STEPS)[number]]
    renderWithApp(<LessonPage />, { route: `/kursos/${COURSE.id}/${stepKey(first)}`, path: lessonRoute })
    await screen.findByRole('button', { name: 'Concluir e seguir' })
    expect(progress().position).toBe(stepKey(first))

    // The first lesson ends with a practice exercise.
    const check = (await screen.findAllByRole('button', { name: 'Verificar' }))[0] as HTMLElement
    const exercise = check.closest('section') as HTMLElement
    await answerEverything(exercise)
    await userEvent.click(check)
    expect(within(exercise).getAllByText(/^(Certo|Errado)$/).length).toBeGreaterThan(0)
    await userEvent.click(within(exercise).getByRole('button', { name: 'Ver a chave' }))
    expect(within(exercise).getByRole('button', { name: 'Esconder a chave' })).toHaveAttribute(
      'aria-expanded',
      'true',
    )

    await userEvent.click(screen.getByRole('button', { name: 'Concluir e seguir' }))
    expect(progress().done).toContain(stepKey(first))
    expect(screen.getByTestId('location')).toHaveTextContent(`/kursos/${COURSE.id}/${stepKey(second)}`)
  })

  it('grades the review of a unit and keeps the grade', async () => {
    const review = STEPS.find((step) => step.lesson === REVIEW) as (typeof STEPS)[number]
    renderWithApp(<LessonPage />, { route: `/kursos/${COURSE.id}/${stepKey(review)}`, path: lessonRoute })
    expect(await screen.findByRole('heading', { level: 1, name: 'Revisão da unidade' })).toBeInTheDocument()
    await answerEverything()
    await userEvent.click(screen.getByRole('button', { name: 'Verificar' }))
    expect(screen.getByText(/^Nota: \d+%$/)).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: /Guardar a nota e seguir|Concluir a unidade/ }))
    expect(progress().scores[review.unit]).toBeTypeOf('number')
    expect(progress().done).toContain(stepKey(review))
  })

  it('builds a sentence from words in order, and starts it again', async () => {
    const withOrder = await (async () => {
      for (const course of KURSOS)
        for (const unit of course.units) {
          if (!unit.load) continue
          const content = await unit.load()
          const lesson = content.lessons.find((item) =>
            item.blocks.some((block) => block.type === 'exercise' && block.kind === 'order'),
          )
          if (lesson) return { course, unit, lesson }
        }
      return null
    })()
    expect(withOrder).not.toBeNull()
    const { course, unit, lesson } = withOrder as NonNullable<typeof withOrder>
    renderWithApp(<LessonPage />, {
      route: `/kursos/${course.id}/${unit.id}/${lesson.id}`,
      path: lessonRoute,
    })
    await screen.findByRole('heading', { level: 1, name: lesson.title })
    expect(reset()).not.toBeInTheDocument()

    const order = lesson.blocks.find((block) => block.type === 'exercise' && block.kind === 'order')
    const words =
      order && 'items' in order && 'words' in (order.items[0] ?? {})
        ? (order.items[0] as { words: string[] }).words
        : []
    await userEvent.click(screen.getAllByRole('button', { name: words[0] as string })[0] as HTMLElement)
    expect(screen.getAllByRole('button', { name: words[0] as string })[0]).toBeDisabled()
    await userEvent.click(reset() as HTMLElement)
    expect(reset()).not.toBeInTheDocument()
  })

  it('sends a step that does not exist back to the course', async () => {
    renderWithApp(<LessonPage />, { route: `/kursos/${COURSE.id}/u9/l9`, path: lessonRoute })
    await waitFor(() => expect(screen.getByTestId('location')).toHaveTextContent(`/kursos/${COURSE.id}`))
  })
})

describe('ExamPage', () => {
  it('stays locked until every unit is done', async () => {
    exam()
    expect(await screen.findByText('Acaba todas as unidades para desbloquear o exame.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Entregar' })).toBeDisabled()
  })

  it(
    'draws the questions, hides the answers until it is handed in, and blocks a new try for an hour',
    SLOW,
    async () => {
      withProgress({ done: ALL_DONE })
      exam()
      expect(await screen.findByText(/Pergunta 1 de \d+/)).toBeInTheDocument()
      expect(screen.queryByText(/^(Certo|Errado)$/)).not.toBeInTheDocument()
      await answerEverything()
      await userEvent.click(screen.getByRole('button', { name: 'Entregar' }))

      expect(await screen.findByRole('heading', { name: 'As tuas respostas' })).toBeInTheDocument()
      expect(screen.getAllByText(/^(Certo|Errado)$/).length).toBeGreaterThan(0)
      expect(progress().exam).toHaveLength(1)
      expect(screen.getByText(/^(Passaste com|Tiveste) \d+%/)).toBeInTheDocument()
    },
  )

  it('says when the next try opens after a failed exam', async () => {
    withProgress({ done: ALL_DONE, exam: [{ at: new Date().toISOString(), score: 0.2, units: {} }] })
    exam()
    expect(await screen.findByText(/Nova tentativa a partir das/)).toBeInTheDocument()
  })
})

describe('CompletedPage', () => {
  it('says the exam is not done yet', async () => {
    completed()
    expect(await screen.findByText('Ainda não acabaste o exame deste curso.')).toBeInTheDocument()
  })

  it('shows the grade, downloads the certificate and adds the course to the CV', async () => {
    const at = '2026-11-10T10:00:00.000Z'
    withProgress({
      done: ALL_DONE,
      seconds: 5400,
      scores: { u1: 0.75 },
      exam: [{ at, score: 0.85, units: { u1: 0.9 } }],
      completedAt: at,
      certificate: 'KY-ABCD',
    })
    completed()
    expect(await screen.findByRole('heading', { name: 'Parabéns!' })).toBeInTheDocument()
    expect(screen.getByText('85%')).toBeInTheDocument()
    expect(screen.getByText('KY-ABCD')).toBeInTheDocument()
    expect(screen.getByText('90%')).toBeInTheDocument()
    expect(screen.getByText('Próximo curso')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: /Descarregar certificado/ }))
    await waitFor(() => expect(saved).toHaveBeenCalledOnce())
    expect(saved.mock.calls[0]?.[1]).toBe(`certificado-kaye-${COURSE.id}.pdf`)
    expect(saved.mock.calls[0]?.[0].type).toBe('application/pdf')

    await userEvent.click(screen.getByRole('button', { name: /Adicionar ao CV/ }))
    expect(screen.getByText('Adicionado à formação do teu CV.')).toBeInTheDocument()
    expect(JSON.stringify(getUser().cvs)).toContain(COURSE.title)
  })
})
