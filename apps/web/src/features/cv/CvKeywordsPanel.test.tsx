import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { getUser } from '../../state/userStore'
import { renderWithApp } from '../../test/render'
import { seedUser } from '../../test/user'
import CvEditorPage from './CvEditorPage'

const mockRead = vi.hoisted(() => vi.fn<(file: File) => Promise<string>>())
vi.mock('./cvPdfText', () => ({
  NoTextError: class NoTextError extends Error {},
  readPdfText: mockRead,
}))

const open = async (change: Parameters<typeof seedUser>[0] = {}) => {
  seedUser(change)
  renderWithApp(<CvEditorPage />)
  return screen.findByRole('textbox', { name: 'Nome' })
}

const title = () => screen.queryByRole('heading', { name: 'Já tens um CV?' })

describe('CvKeywordsPanel', () => {
  it('is skipped for a minor', async () => {
    await open({
      profile: {
        name: 'Zé',
        birthYear: 2012,
        province: 'Luanda',
        education: 'medio_tecnico',
        guardianInformed: true,
      },
    })
    expect(title()).not.toBeInTheDocument()
  })

  it('reads pasted text, lets the person remove a tag and adds only the confirmed ones', async () => {
    await open()
    expect(title()).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Colar texto' }))
    await userEvent.click(screen.getByRole('button', { name: 'Sim, ler' }))
    await userEvent.click(screen.getByLabelText('Cola aqui o texto do teu CV'))
    await userEvent.paste('Sei Python e Negociação. Tel 923 456 789.')
    await userEvent.click(screen.getByRole('button', { name: 'Ler' }))
    await userEvent.click(screen.getByRole('checkbox', { name: 'Negociação' }))
    await userEvent.click(screen.getByRole('button', { name: 'Adicionar 1 ao CV' }))
    const skills = getUser().cvs[0]!.cv.skills
    expect(skills).toContain('Python')
    expect(skills).not.toContain('Negociação')
  })

  it('asks to paste the text when the PDF has no text layer', async () => {
    const { NoTextError } = await import('./cvPdfText')
    mockRead.mockRejectedValueOnce(new NoTextError())
    await open()
    await userEvent.click(screen.getByRole('button', { name: 'Carregar PDF' }))
    await userEvent.click(screen.getByRole('button', { name: 'Sim, ler' }))
    await userEvent.upload(
      screen.getByLabelText('Escolhe o PDF do teu CV (até 5 MB)'),
      new File(['x'], 'cv.pdf', { type: 'application/pdf' }),
    )
    expect(await screen.findByRole('alert')).toHaveTextContent('Não consegui ler este PDF; cola o texto.')
  })
})
