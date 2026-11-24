import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getUser } from '../../state/userStore'
import { fakeClock, jumpTime } from '../../test/clock'
import { renderWithApp } from '../../test/render'
import { seedUser } from '../../test/user'
import PsychotechPage from './PsychotechPage'

// The story image is drawn on a canvas, which jsdom does not have; the page's part is what goes in it.
const story = vi.hoisted(() => ({
  image: vi.fn<(result: unknown) => Promise<Blob | null>>(
    async () => new Blob(['png'], { type: 'image/png' }),
  ),
  share: vi.fn<(blob: Blob, name: string, title: string) => Promise<void>>(async () => undefined),
}))
vi.mock('./storyImage', () => ({ storyImage: story.image }))
vi.mock('../../lib/shareFile', () => ({ shareFile: story.share }))

const SLOW = { timeout: 30000 }

const panel = () => screen.getByRole('region', { name: /Pergunta \d+ de \d+/ })

/** Answers the question on screen with its first option. */
async function answerFirst() {
  const first = within(panel())
    .getAllByRole('button')
    .find((button) => button.textContent !== 'Desistir')
  await userEvent.click(first as HTMLElement)
}

async function answerAll(count: number) {
  for (let question = 1; question <= count; question++) {
    expect(
      screen.getByRole('region', { name: new RegExp(`Pergunta ${question} de ${count}`) }),
    ).toBeInTheDocument()
    await answerFirst()
  }
}

beforeEach(() => {
  seedUser()
  story.image.mockClear()
  story.share.mockClear()
})

describe('PsychotechPage', () => {
  it('runs the full simulation against the clock and keeps only the scores', SLOW, async () => {
    renderWithApp(<PsychotechPage />, { route: '/treino' })
    expect(await screen.findByText(/24 perguntas de todas as competências, 18 minutos/)).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Começar' }))

    expect(within(panel()).getAllByRole('timer')[0]).toBeInTheDocument()
    await answerAll(24)

    expect(await screen.findByRole('heading', { name: /resultado/i })).toBeInTheDocument()
    expect(getUser().psychotech).toHaveLength(1)
    expect(getUser().psychotech[0]).toMatchObject({ mode: 'full', level: 'medium' })

    await userEvent.click(screen.getByRole('button', { name: 'Partilhar o resultado' }))
    expect(story.image).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Joana', url: expect.stringMatching(/\/treino$/) }),
    )
    expect(story.share).toHaveBeenCalledWith(
      expect.any(Blob),
      'kaye-psicotecnico.png',
      expect.stringContaining('/treino'),
    )
  })

  it.each([
    ['Numérico', 'numerical'],
    ['Lógico', 'logical'],
    ['Abstrato', 'abstract'],
    ['Quantitativo', 'quantitative'],
    ['Verbal', 'verbal'],
    ['Atenção', 'attention'],
  ])('practises %s alone, ten questions', SLOW, async (label, skill) => {
    renderWithApp(<PsychotechPage />, { route: '/treino' })
    await userEvent.click(await screen.findByRole('button', { name: label }))
    await userEvent.click(screen.getByRole('button', { name: 'Difícil' }))
    expect(screen.getByText(/10 perguntas, sem limite de tempo total/)).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Começar' }))

    await answerAll(10)
    await screen.findByRole('heading', { name: /resultado/i })
    expect(getUser().psychotech[0]).toMatchObject({ mode: skill, level: 'hard' })
  })

  it('trains the weakest skill again from the result, and shows the history', SLOW, async () => {
    renderWithApp(<PsychotechPage />, { route: '/treino' })
    await userEvent.click(await screen.findByRole('button', { name: 'Fácil' }))
    await userEvent.click(screen.getByRole('button', { name: 'Começar' }))
    await answerAll(24)
    await screen.findByRole('heading', { name: /resultado/i })

    // Always choosing the first option leaves a weak skill (about one in four right).
    await userEvent.click(screen.getByRole('button', { name: /^Treinar: / }))
    expect(panel()).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Desistir' }))
    expect(await screen.findByRole('heading', { name: 'A tua evolução' })).toBeInTheDocument()
  })

  it(
    'counts an attention question as wrong when its seconds run out, and ends at the full time',
    SLOW,
    async () => {
      fakeClock()
      try {
        renderWithApp(<PsychotechPage />, { route: '/treino' })
        await userEvent.click(await screen.findByRole('button', { name: 'Atenção' }))
        await userEvent.click(screen.getByRole('button', { name: 'Começar' }))
        expect(within(panel()).getByText('Tempo para esta pergunta')).toBeInTheDocument()
        await jumpTime(16_000)
        expect(await screen.findByRole('region', { name: /Pergunta 2 de 10/ })).toBeInTheDocument()
        await userEvent.click(screen.getByRole('button', { name: 'Desistir' }))

        await userEvent.click(screen.getByRole('button', { name: 'Simulação completa' }))
        await userEvent.click(screen.getByRole('button', { name: 'Começar' }))
        await jumpTime(18 * 60 * 1000 + 1000)
        expect(await screen.findByText(/O tempo acabou/)).toBeInTheDocument()
        expect(getUser().psychotech[0]).toMatchObject({ mode: 'full' })
      } finally {
        vi.useRealTimers()
      }
    },
  )
})
