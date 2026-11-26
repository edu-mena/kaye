import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { renderWithApp } from '../../test/render'
import { decodeFamilyLink, familyLinkUrl, type FamilyLink, linkFirstName } from './familyLink'
import FamilyPage from './FamilyPage'

// The PDF is built on the phone and handed to the share sheet; here the hand-over is what is checked.
const shared = vi.hoisted(() =>
  vi.fn<(blob: Blob, name: string, title: string) => Promise<void>>(async () => undefined),
)
vi.mock('../../lib/shareFile', () => ({ shareFile: shared }))

const CYBER = 'analista-de-ciberseguranca'
const hashOf = (link: FamilyLink) => new URL(familyLinkUrl(link)).hash
const open = (link: FamilyLink) => renderWithApp(<FamilyPage />, { route: `/familia${hashOf(link)}` })

beforeEach(() => {
  shared.mockClear()
  // No font files in the tests: the PDF falls back to the built-in font.
  vi.stubGlobal(
    'fetch',
    vi.fn<typeof fetch>(async () => new Response(null, { status: 404 })),
  )
})

describe('familyLink', () => {
  it('travels in the fragment and comes back the same', () => {
    const link: FamilyLink = {
      v: 1,
      code: 'IAS',
      careers: [CYBER, CYBER],
      lang: 'pt',
      firstName: 'Joana',
      adult: true,
    }
    expect(decodeFamilyLink(hashOf(link))).toEqual({ ...link, careers: [CYBER] })
  })

  it.each([
    ['not base64', '#%%%'],
    ['not an object', `#${btoa('1')}`],
    ['an old version', `#${btoa(JSON.stringify({ v: 0, code: '', careers: ['a'], lang: 'pt' }))}`],
    ['a repeated letter', `#${btoa(JSON.stringify({ v: 1, code: 'II', careers: ['a'], lang: 'pt' }))}`],
    ['no careers', `#${btoa(JSON.stringify({ v: 1, code: '', careers: [], lang: 'pt' }))}`],
    ['a strange slug', `#${btoa(JSON.stringify({ v: 1, code: '', careers: ['A B'], lang: 'pt' }))}`],
    ['an unknown language', `#${btoa(JSON.stringify({ v: 1, code: '', careers: ['a'], lang: 'xx' }))}`],
    [
      'a name with digits',
      `#${btoa(JSON.stringify({ v: 1, code: '', careers: ['a'], lang: 'pt', firstName: 'J0' }))}`,
    ],
  ])('refuses %s', (_, fragment) => {
    expect(decodeFamilyLink(fragment)).toBeNull()
  })

  it('keeps only a first name it accepts', () => {
    expect(linkFirstName('  Ana Maria ')).toBe('Ana')
    expect(linkFirstName('<script>')).toBeUndefined()
    expect(linkFirstName(undefined)).toBeUndefined()
  })
})

describe('FamilyPage', () => {
  it('explains the test and the career to an adult family, with the salary, and builds the PDF', async () => {
    open({ v: 1, code: 'IAS', careers: [CYBER], lang: 'pt', firstName: 'Joana', adult: true })
    expect(
      await screen.findByRole('heading', { level: 1, name: 'O que o teste diz sobre Joana' }),
    ).toBeInTheDocument()
    expect(screen.getByText(/O interesse mais forte é o lado Investigativo/)).toBeInTheDocument()
    expect(screen.getByText(/E também o lado Social/)).toBeInTheDocument()

    const career = await screen.findByRole('article')
    expect(within(career).getByRole('heading', { name: 'Analista de Cibersegurança' })).toBeInTheDocument()
    expect(within(career).getByText('Onde estudar')).toBeInTheDocument()
    expect(await within(career).findByText(/Kz/)).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Como podem ajudar' })).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: /PDF/ }))
    await waitFor(() => expect(shared).toHaveBeenCalledOnce())
    const [blob, name] = shared.mock.calls[0] ?? []
    expect(blob?.type).toBe('application/pdf')
    expect(name).toContain(CYBER)
  })

  it('never shows a salary about a minor, and says when the test is not done', async () => {
    open({ v: 1, code: '', careers: [CYBER, 'enfermeiro'], lang: 'pt' })
    expect(
      await screen.findByRole('heading', { level: 1, name: 'O que o teste vocacional diz' }),
    ).toBeInTheDocument()
    expect(screen.getByText(/O teste vocacional ainda não foi feito/)).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'As carreiras escolhidas' })).toBeInTheDocument()
    await waitFor(() => expect(screen.getAllByRole('article')).toHaveLength(2))
    expect(screen.queryByText(/por mês|\/mês/)).not.toBeInTheDocument()
  })

  it('says when the link does not open', async () => {
    renderWithApp(<FamilyPage />, { route: '/familia#estragado' })
    expect(await screen.findByRole('heading', { name: 'Este link não abre' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Conhecer o Kayé/ })).toHaveAttribute('href', '/')
  })
})
