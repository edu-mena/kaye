import { screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderWithApp } from '../../test/render'
import { PlansSection } from './PlansSection'

describe('PlansSection', () => {
  it('shows Free and Plus side by side, with the price and where each one leads', () => {
    renderWithApp(<PlansSection signIn="/entrar" />)
    const free = screen.getByRole('article', { name: 'Grátis' })
    const plus = screen.getByRole('article', { name: 'Kayé Plus' })

    expect(within(free).getByText(/0 Kz/)).toBeInTheDocument()
    expect(within(plus).getByText(/1\.999 Kz/)).toBeInTheDocument()
    expect(within(plus).getByText('Presente de Natal')).toBeInTheDocument()
    expect(within(free).getByRole('link', { name: 'Começar grátis' })).toHaveAttribute('href', '/entrar')
    expect(within(plus).getByRole('link', { name: 'Usar o Plus de graça' })).toHaveAttribute(
      'href',
      '/entrar',
    )
  })

  it('makes clear what is limited for free: one topic a day, and the certificate, reminders and plan are locked', () => {
    renderWithApp(<PlansSection signIn="/entrar" />)
    const free = screen.getByRole('article', { name: 'Grátis' })

    expect(within(free).getByText('Kursos: um tópico por dia')).toBeInTheDocument()
    for (const locked of ['Certificado dos Kursos', 'Lembretes e subscrições (email e notificações)']) {
      // Locked rows say so to a screen reader, not only with the padlock.
      expect(within(free).getByText(locked).closest('li')).toHaveTextContent('não incluído')
    }
    expect(within(free).getByText('Teste vocacional').closest('li')).not.toHaveTextContent('não incluído')
  })

  it('lists in Plus what Free lacks, and says that minors get no certificate and that Plus is a free Christmas gift', () => {
    renderWithApp(<PlansSection signIn="/entrar" />)
    const plus = screen.getByRole('article', { name: 'Kayé Plus' })

    expect(within(plus).getByText('Tudo o que há no Grátis')).toBeInTheDocument()
    expect(within(plus).getByText('Kursos sem limite diário, com exame final')).toBeInTheDocument()
    expect(within(plus).getByText('Certificado dos Kursos')).toBeInTheDocument()
    expect(screen.getByText(/menos de 18 anos faz um tópico por dia, sem certificado/)).toBeInTheDocument()
    expect(screen.getByText(/todos usam o Plus de graça/)).toBeInTheDocument()
  })
})
