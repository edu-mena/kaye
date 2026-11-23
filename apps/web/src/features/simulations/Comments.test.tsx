import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { renderWithApp } from '../../test/render'
import { seedUser } from '../../test/user'

// Comments live on the server: they only exist in the build that has accounts.
vi.hoisted(() => {
  vi.stubEnv('VITE_DATA_SOURCE', 'api')
})
const { Comments } = await import('./Comments')

const COMMENT = {
  id: 7,
  type: 'simulation',
  subject: 'dia',
  author: 'Ana',
  body: 'Gostei muito.',
  at: '2026-11-22T10:00:00Z',
}
const MINE = { ...COMMENT, id: 8, author: 'Joana', body: 'O meu comentário.' }

type Call = { url: string; method: string; body?: string }
const calls: Call[] = []

/** The API: the comments of the simulation, the ids of the person's own, and the answers to writes. */
function api(write: Response = Response.json(MINE, { status: 201 })) {
  calls.length = 0
  vi.stubGlobal(
    'fetch',
    vi.fn<typeof fetch>(async (input, init) => {
      const url = String(input)
      const method = init?.method ?? 'GET'
      calls.push({ url, method, body: typeof init?.body === 'string' ? init.body : undefined })
      if (method !== 'GET') return write.clone()
      return url.includes('/me/comments') ? Response.json([8]) : Response.json([COMMENT, MINE])
    }),
  )
}

beforeEach(() => seedUser())
afterEach(() => vi.unstubAllGlobals())

const show = () => renderWithApp(<Comments type="simulation" id="dia" />)

describe('Comments', () => {
  it('lists the comments, with "Apagar" only on the person\'s own', async () => {
    api()
    show()
    expect(await screen.findByText('Gostei muito.')).toBeInTheDocument()
    expect(calls[0]?.url).toContain('/comments?type=simulation&id=dia')
    expect(await screen.findByRole('button', { name: 'Apagar' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Denunciar' })).toBeInTheDocument()
  })

  it('sends a comment and shows it first', async () => {
    api()
    const user = userEvent.setup()
    show()
    await screen.findByText('Gostei muito.')
    await user.type(screen.getByLabelText('O teu comentário'), 'O meu comentário.')
    await user.click(screen.getByRole('button', { name: 'Comentar' }))
    await vi.waitFor(() => expect(calls.some((call) => call.method === 'POST')).toBe(true))
    const post = calls.find((call) => call.method === 'POST')
    expect(post?.url).toContain('/comments')
    expect(JSON.parse(post?.body ?? '{}')).toEqual({
      type: 'simulation',
      id: 'dia',
      body: 'O meu comentário.',
    })
    expect(await screen.findByLabelText('O teu comentário')).toHaveValue('')
  })

  it('says when the filter refused the comment', async () => {
    api(Response.json({ error: 'refused', reason: 'phone' }, { status: 422 }))
    const user = userEvent.setup()
    show()
    await screen.findByText('Gostei muito.')
    await user.type(screen.getByLabelText('O teu comentário'), 'liga 923000000')
    await user.click(screen.getByRole('button', { name: 'Comentar' }))
    expect(await screen.findByText(/não pode ter palavrões/)).toBeInTheDocument()
  })

  it("reports another person's comment and deletes its own", async () => {
    api(new Response(null, { status: 204 }))
    const user = userEvent.setup()
    show()
    await user.click(await screen.findByRole('button', { name: 'Denunciar' }))
    await vi.waitFor(() => expect(calls.some((call) => call.url.endsWith('/comments/7/report'))).toBe(true))
    await user.click(await screen.findByRole('button', { name: 'Apagar' }))
    await vi.waitFor(() => expect(calls.some((call) => call.method === 'DELETE')).toBe(true))
    expect(screen.queryByText('O meu comentário.')).not.toBeInTheDocument()
  })

  it('asks for an account before sending, and sends nothing without one', async () => {
    seedUser({ profile: null })
    api()
    const user = userEvent.setup()
    show()
    await screen.findByText('Gostei muito.')
    await user.type(screen.getByLabelText('O teu comentário'), 'Olá')
    await user.click(screen.getByRole('button', { name: 'Comentar' }))
    expect(calls.filter((call) => call.method === 'POST')).toEqual([])
  })

  it('says when the comments cannot be loaded', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn<typeof fetch>(async () => new Response(null, { status: 500 })),
    )
    show()
    expect(await screen.findByText('Não foi possível carregar os comentários.')).toBeInTheDocument()
  })

  it('shows nothing on the demo site, which has no accounts', async () => {
    vi.resetModules()
    vi.stubEnv('VITE_DATA_SOURCE', 'demo')
    const { Comments: Demo } = await import('./Comments')
    const { container } = renderWithApp(<Demo type="simulation" id="dia" />)
    expect(container.querySelector('section')).toBeNull()
    vi.stubEnv('VITE_DATA_SOURCE', 'api')
  })
})
