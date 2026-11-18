import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { getUser } from '../../state/userStore'
import { fakeClock, jumpTime } from '../../test/clock'
import { renderWithApp } from '../../test/render'
import { seedUser } from '../../test/user'
import InterviewsPage from './InterviewsPage'

const SLOW = { timeout: 30000 }
const CYBER = 'analista-de-ciberseguranca'
const year = new Date().getFullYear()

/** The Kayé team's inbox: answers as the server does, or with the status given. */
function inbox(status = 201) {
  const fetchMock = vi.fn<typeof fetch>(async () => Response.json({ id: 'int-1' }, { status }))
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

/** The browser's speech recognition, driven by the test. */
class FakeRecognition {
  static last: FakeRecognition | null = null
  lang = ''
  continuous = false
  interimResults = false
  listeners: Record<string, ((event: never) => void)[]> = {}
  start = vi.fn<() => void>()
  stop = vi.fn<() => void>()
  constructor() {
    FakeRecognition.last = this
  }
  addEventListener(type: string, listener: (event: never) => void) {
    ;(this.listeners[type] ??= []).push(listener)
  }
  emit(type: string, event: unknown = {}) {
    for (const listener of this.listeners[type] ?? []) listener(event as never)
  }
}

/** Answers every question in writing (the first with the text given), up to the last. */
async function answerAll(first = 'Organizei a equipa e cumprimos o prazo.') {
  for (let index = 0; ; index++) {
    await userEvent.click(await screen.findByRole('button', { name: 'Já sei, responder' }))
    if (index === 0) await userEvent.type(screen.getByLabelText('A tua resposta'), first)
    const finish = screen.queryByRole('button', { name: 'Terminar' })
    if (finish) return userEvent.click(finish)
    await userEvent.click(screen.getByRole('button', { name: 'Próxima pergunta' }))
  }
}

beforeEach(() => {
  seedUser()
})

afterEach(() => {
  FakeRecognition.last = null
})

describe('InterviewsPage', () => {
  it('runs an area interview and sends it to the team with the consent', SLOW, async () => {
    const fetchMock = inbox()
    renderWithApp(<InterviewsPage />, { route: '/entrevistas?area=health' })
    expect(await screen.findByText('Hoje ainda podes fazer 2 entrevistas.')).toBeInTheDocument()
    const areas = screen.getByRole('region', { name: 'Escolhe a área da entrevista' })
    const health = within(areas).getAllByRole('button')[0] as HTMLElement
    expect(health).toHaveTextContent('Saúde')
    expect(health).toHaveTextContent('Para ti')
    await userEvent.click(health)

    expect(screen.getByRole('timer')).toHaveTextContent('0:30')
    await answerAll()

    expect(await screen.findByText(/Respondeste a 1 de 6 perguntas de Saúde/)).toBeInTheDocument()
    const send = screen.getByRole('button', { name: 'Enviar respostas' })
    await userEvent.type(screen.getByLabelText(/Email ou WhatsApp/), 'nao-e-contacto')
    expect(screen.getByText('Escreve um email ou um número de telefone válido.')).toBeInTheDocument()
    await userEvent.clear(screen.getByLabelText(/Email ou WhatsApp/))
    await userEvent.type(screen.getByLabelText(/Email ou WhatsApp/), '+244 923 000 000')
    expect(send).toBeDisabled()
    await userEvent.click(screen.getByLabelText(/Aceito enviar à equipa do Kayé/))
    await userEvent.click(send)

    expect(await screen.findByRole('heading', { name: 'Entrevista enviada' })).toBeInTheDocument()
    const body = JSON.parse(String(fetchMock.mock.calls[0]?.[1]?.body)) as Record<string, unknown>
    expect(body).toMatchObject({ area: 'health', candidate: { name: 'Joana', contact: '+244 923 000 000' } })
    expect(getUser().interviews).toHaveLength(1)

    await userEvent.click(screen.getByRole('button', { name: 'Voltar às entrevistas' }))
    expect(await screen.findByRole('heading', { name: 'Entrevistas enviadas' })).toBeInTheDocument()
    expect(screen.getByText('Hoje ainda podes fazer 1 entrevista.')).toBeInTheDocument()
  })

  it('builds the interview of a profession, with its kinds of question', SLOW, async () => {
    const fetchMock = inbox()
    seedUser({ targetCareer: CYBER })
    renderWithApp(<InterviewsPage />, { route: '/entrevistas' })
    const careers = await screen.findByRole('region', { name: 'Por profissão' })
    const card = await within(careers).findByRole('button', { name: /Analista de Cibersegurança/ })
    expect(card).toHaveTextContent('O teu destino')
    await userEvent.click(card)

    expect(await screen.findByRole('region', { name: 'Pergunta 1 de 8' })).toBeInTheDocument()
    await answerAll()
    await userEvent.type(await screen.findByLabelText(/Email ou WhatsApp/), 'joana@exemplo.ao')
    await userEvent.click(screen.getByLabelText(/Aceito enviar à equipa do Kayé/))
    await userEvent.click(screen.getByRole('button', { name: 'Enviar respostas' }))

    await screen.findByRole('heading', { name: 'Entrevista enviada' })
    const body = JSON.parse(String(fetchMock.mock.calls[0]?.[1]?.body)) as Record<string, unknown>
    expect(body).toMatchObject({ career: { slug: CYBER } })
    expect(getUser().interviews[0]).toMatchObject({ career: 'Analista de Cibersegurança' })
  })

  it('leaves the salary question out for a minor, who also confirms the guardian', SLOW, async () => {
    inbox()
    seedUser({
      profile: {
        name: 'Edson',
        birthYear: year - 15,
        province: 'Luanda',
        education: 'medio_tecnico',
        guardianInformed: false,
      },
    })
    renderWithApp(<InterviewsPage />, { route: `/entrevistas?carreira=${CYBER}` })
    const careers = await screen.findByRole('region', { name: 'Por profissão' })
    await userEvent.click(await within(careers).findByRole('button', { name: /Vieste daqui/ }))

    const kinds: string[] = []
    for (;;) {
      await userEvent.click(await screen.findByRole('button', { name: 'Já sei, responder' }))
      kinds.push(screen.getByRole('region').querySelector('p')?.textContent ?? '')
      if (kinds.length === 1) await userEvent.type(screen.getByLabelText('A tua resposta'), 'Gosto de redes.')
      const finish = screen.queryByRole('button', { name: 'Terminar' })
      if (finish) {
        await userEvent.click(finish)
        break
      }
      await userEvent.click(screen.getByRole('button', { name: 'Próxima pergunta' }))
    }
    expect(screen.queryByText('Pretensão salarial')).not.toBeInTheDocument()

    await userEvent.type(await screen.findByLabelText(/Email ou WhatsApp/), 'edson@exemplo.ao')
    await userEvent.click(screen.getByLabelText(/Aceito enviar à equipa do Kayé/))
    expect(screen.getByRole('button', { name: 'Enviar respostas' })).toBeDisabled()
    await userEvent.click(screen.getByLabelText(/O meu encarregado de educação sabe/))
    expect(screen.getByRole('button', { name: 'Enviar respostas' })).toBeEnabled()
  })

  it('says when the team has had too many, and when the network failed', SLOW, async () => {
    inbox(429)
    renderWithApp(<InterviewsPage />, { route: '/entrevistas' })
    const areas = await screen.findByRole('region', { name: 'Escolhe a área da entrevista' })
    await userEvent.click(within(areas).getAllByRole('button')[0] as HTMLElement)
    await answerAll()
    await userEvent.type(await screen.findByLabelText(/Email ou WhatsApp/), 'joana@exemplo.ao')
    await userEvent.click(screen.getByLabelText(/Aceito enviar à equipa do Kayé/))
    await userEvent.click(screen.getByRole('button', { name: 'Enviar respostas' }))
    expect(await screen.findByText(/Enviaste muitas entrevistas seguidas/)).toBeInTheDocument()

    vi.stubGlobal(
      'fetch',
      vi.fn<typeof fetch>(async () => Promise.reject(new TypeError('offline'))),
    )
    await userEvent.click(screen.getByRole('button', { name: 'Enviar respostas' }))
    expect(await screen.findByText(/Não foi possível enviar/)).toBeInTheDocument()
    expect(getUser().interviews).toHaveLength(0)

    await userEvent.click(screen.getByRole('button', { name: 'Não enviar' }))
    expect(await screen.findByRole('heading', { name: 'Como funciona' })).toBeInTheDocument()
  })

  it('stops at two interviews a day', async () => {
    const at = new Date().toISOString()
    seedUser({
      interviews: [
        { at, area: 'health', questions: 6 },
        { at: new Date(Date.now() - 1000).toISOString(), area: 'legal', questions: 6 },
      ],
    })
    renderWithApp(<InterviewsPage />, { route: '/entrevistas' })
    expect(await screen.findByText(/Já fizeste as 2 entrevistas de hoje/)).toBeInTheDocument()
    const areas = screen.getByRole('region', { name: 'Escolhe a área da entrevista' })
    for (const button of within(areas).getAllByRole('button')) expect(button).toBeDisabled()
  })

  it('dictates the answer, and says when the microphone is refused', SLOW, async () => {
    vi.stubGlobal('SpeechRecognition', FakeRecognition)
    renderWithApp(<InterviewsPage />, { route: '/entrevistas' })
    const areas = await screen.findByRole('region', { name: 'Escolhe a área da entrevista' })
    await userEvent.click(within(areas).getAllByRole('button')[0] as HTMLElement)
    await userEvent.click(screen.getByRole('button', { name: 'Já sei, responder' }))

    await userEvent.click(screen.getByRole('button', { name: 'Ditar' }))
    const recognition = FakeRecognition.last as FakeRecognition
    expect(recognition.lang).toBe('pt-PT')
    expect(recognition.start).toHaveBeenCalledOnce()
    await vi.waitFor(() =>
      recognition.emit('result', { resultIndex: 0, results: [{ isFinal: false, 0: { transcript: 'eu' } }] }),
    )
    expect(await screen.findByDisplayValue('eu')).toBeInTheDocument()
    recognition.emit('result', {
      resultIndex: 0,
      results: [{ isFinal: true, 0: { transcript: 'Eu liderei. ' } }],
    })
    expect(await screen.findByDisplayValue('Eu liderei.')).toBeInTheDocument()

    // A phone ends the session after a pause: it starts again while the person still wants it.
    recognition.emit('end')
    expect(recognition.start).toHaveBeenCalledTimes(2)
    await userEvent.click(screen.getByRole('button', { name: 'Parar de ditar' }))
    expect(recognition.stop).toHaveBeenCalled()

    await userEvent.click(screen.getByRole('button', { name: 'Ditar' }))
    ;(FakeRecognition.last as FakeRecognition).emit('error', { error: 'not-allowed' })
    expect(await screen.findByText(/Não foi possível usar o microfone/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Ditar' })).toHaveAttribute('aria-pressed', 'false')
  })

  it('moves on by itself when the time to think and to answer runs out', SLOW, async () => {
    fakeClock()
    try {
      renderWithApp(<InterviewsPage />, { route: '/entrevistas' })
      const areas = await screen.findByRole('region', { name: 'Escolhe a área da entrevista' })
      await userEvent.click(within(areas).getAllByRole('button')[0] as HTMLElement)
      await jumpTime(31_000)
      expect(await screen.findByLabelText('A tua resposta')).toBeInTheDocument()
      await jumpTime(121_000)
      expect(await screen.findByRole('region', { name: /Pergunta 2 de/ })).toBeInTheDocument()
      await userEvent.click(screen.getByRole('button', { name: 'Sair da entrevista' }))
      expect(await screen.findByRole('heading', { name: 'Como funciona' })).toBeInTheDocument()
    } finally {
      vi.useRealTimers()
    }
  })
})
