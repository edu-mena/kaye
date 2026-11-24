import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { usePlus } from '../../lib/plan'
import { getUser } from '../../state/userStore'
import { renderWithApp } from '../../test/render'
import { seedUser } from '../../test/user'
import { CvDownloadButton } from '../cv/CvDownloadButton'
import PlusPage from './PlusPage'
import { PlusCard } from './PlusCard'
import { PlusGate } from './PlusGate'

const profile = (birthYear: number) => ({
  name: 'Ana',
  birthYear,
  province: 'Luanda',
  education: 'licenciatura' as const,
  guardianInformed: birthYear > 2008,
})
const ADULT = profile(1990)
const MINOR = profile(2010)

const on = () => vi.stubEnv('VITE_PLUS_ENABLED', 'true')

function Feature() {
  const { spendTrial } = usePlus()
  return (
    <PlusGate feature="training">
      <button type="button" onClick={() => spendTrial('training')}>
        Treinar
      </button>
    </PlusGate>
  )
}

describe('PlusGate', () => {
  it('blocks nothing while the Plus is off, whatever was used', () => {
    seedUser({ profile: ADULT, plusTrials: { training: true } })
    renderWithApp(<Feature />)
    expect(screen.getByRole('button', { name: 'Treinar' })).toBeInTheDocument()
    expect(screen.queryByText('Isto faz parte do Kayé Plus')).not.toBeInTheDocument()
  })

  it('lets an adult try once, and closes the next time', async () => {
    on()
    seedUser({ profile: ADULT })
    const first = renderWithApp(<Feature />)
    // The first time: the feature, and what the person does there uses the free try.
    await userEvent.click(screen.getByRole('button', { name: 'Treinar' }))
    expect(getUser().plusTrials).toEqual({ training: true })
    // The result of what they just did stays on screen: the gate decides when it appears.
    expect(screen.getByRole('button', { name: 'Treinar' })).toBeInTheDocument()
    first.unmount()

    renderWithApp(<Feature />)
    expect(screen.queryByRole('button', { name: 'Treinar' })).not.toBeInTheDocument()
    expect(screen.getByText('Isto faz parte do Kayé Plus')).toBeInTheDocument()
    expect(screen.getByText('1.999 Kz por mês')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Ver o Plus/ })).toHaveAttribute('href', '/plus')
  })

  it('counts the tries by feature: using one leaves the others open', () => {
    on()
    seedUser({ profile: ADULT, plusTrials: { cv_pdf: true } })
    renderWithApp(<Feature />)
    expect(screen.getByRole('button', { name: 'Treinar' })).toBeInTheDocument()
  })

  it('never closes for a minor, nor for who has no profile (no commercial pressure)', () => {
    on()
    seedUser({ profile: MINOR, plusTrials: { training: true } })
    const minor = renderWithApp(<Feature />)
    expect(screen.getByRole('button', { name: 'Treinar' })).toBeInTheDocument()
    minor.unmount()

    seedUser({ profile: null, plusTrials: { training: true } })
    renderWithApp(<Feature />)
    expect(screen.getByRole('button', { name: 'Treinar' })).toBeInTheDocument()
  })

  it('shows the fallback it was given, instead of the lock card', () => {
    on()
    seedUser({ profile: ADULT, plusTrials: { training: true } })
    renderWithApp(
      <PlusGate feature="training" fallback={<p>fechado</p>}>
        <p>aberto</p>
      </PlusGate>,
    )
    expect(screen.getByText('fechado')).toBeInTheDocument()
    expect(screen.queryByText('aberto')).not.toBeInTheDocument()
  })
})

describe('CvDownloadButton', () => {
  it('downloads the first time and uses the free try; after that it leads to the Plus page', async () => {
    on()
    seedUser({ profile: ADULT })
    const download = vi.fn<() => void>()
    const first = renderWithApp(<CvDownloadButton size="sm" onDownload={download} />)
    await userEvent.click(screen.getByRole('button', { name: /Descarregar/ }))
    expect(download).toHaveBeenCalledTimes(1)
    expect(getUser().plusTrials).toEqual({ cv_pdf: true })
    first.unmount()

    renderWithApp(<CvDownloadButton size="sm" onDownload={download} />)
    expect(screen.queryByRole('button', { name: /Descarregar/ })).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Descarregar/ })).toHaveAttribute('href', '/plus')
    expect(download).toHaveBeenCalledTimes(1)
  })

  it('is a plain button while the Plus is off, however many times it is used', async () => {
    seedUser({ profile: ADULT, plusTrials: { cv_pdf: true } })
    const download = vi.fn<() => void>()
    renderWithApp(<CvDownloadButton size="lg" onDownload={download} />)
    await userEvent.click(screen.getByRole('button', { name: /Descarregar/ }))
    expect(download).toHaveBeenCalledTimes(1)
  })
})

describe('PlusCard', () => {
  it('is not there while the Plus is off', () => {
    seedUser({ profile: ADULT })
    const { container } = renderWithApp(<PlusCard />)
    expect(container.querySelector('section, article')).toBeNull()
  })

  it('is not there for a minor, even with the Plus on', () => {
    on()
    seedUser({ profile: MINOR })
    const { container } = renderWithApp(<PlusCard />)
    expect(container.querySelector('section, article')).toBeNull()
  })

  it('tells an adult what it includes and the price, and can be hidden', async () => {
    on()
    seedUser({ profile: ADULT })
    const hide = vi.fn<() => void>()
    renderWithApp(<PlusCard onDismiss={hide} />)
    expect(screen.getByRole('heading', { name: 'Kayé Plus' })).toBeInTheDocument()
    expect(screen.getByText('1.999 Kz por mês')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Ver o que inclui/ })).toHaveAttribute('href', '/plus')
    await userEvent.click(screen.getByRole('button', { name: 'Não me interessa' }))
    expect(hide).toHaveBeenCalledTimes(1)
  })
})

describe('PlusPage', () => {
  it('does not exist while the Plus is off: it leads home', () => {
    seedUser({ profile: ADULT })
    renderWithApp(<PlusPage />, { route: '/plus' })
    expect(screen.getByTestId('location')).toHaveTextContent(/^\/$/)
  })

  it('tells an adult what it includes, the price, the answers and lets them ask to be told', () => {
    on()
    seedUser({ profile: ADULT })
    renderWithApp(<PlusPage />, { route: '/plus' })
    expect(screen.getByRole('heading', { level: 1, name: 'Kayé Plus' })).toBeInTheDocument()
    expect(screen.getByText('1.999 Kz por mês')).toBeInTheDocument()
    expect(screen.getByText(/Ainda não cobramos nada/)).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Perguntas frequentes' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Avisa-me quando abrir' })).toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: /só para me avisar quando o Plus abrir/ })).not.toBeChecked()
  })

  it('tells a minor it is for adults, without price or promotion', () => {
    on()
    seedUser({ profile: MINOR })
    renderWithApp(<PlusPage />, { route: '/plus' })
    expect(screen.getByText('O Plus é para maiores de 18 anos')).toBeInTheDocument()
    expect(screen.queryByText('1.999 Kz por mês')).not.toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Avisa-me quando abrir' })).not.toBeInTheDocument()
  })
})
