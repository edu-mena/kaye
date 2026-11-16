import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { changeLocale, LOCALES } from '../../lib/i18n'
import { renderWithApp } from '../../test/render'
import { PRIVACY } from './privacy'
import PrivacyPage from './PrivacyPage'
import { TERMS } from './terms'
import TermsPage from './TermsPage'

describe('legal texts', () => {
  it.each([
    ['terms', TERMS],
    ['privacy', PRIVACY],
  ])('%s say the same thing in every language, with nothing empty', (_, doc) => {
    const shape = (locale: (typeof LOCALES)[number]) => ({
      summary: doc[locale].summary.length,
      sections: doc[locale].sections.map((section) => ({
        id: section.id,
        blocks: section.body.map((block) => (typeof block === 'string' ? 'p' : block.length)),
      })),
    })

    for (const locale of LOCALES) {
      expect(shape(locale)).toEqual(shape('pt'))
      expect(JSON.stringify(doc[locale])).not.toContain('""')
      // Every text tells people how to reach us.
      expect(JSON.stringify(doc[locale])).toContain('{email}')
    }
  })
})

describe('TermsPage', () => {
  it('shows the version, says it is provisional, and sums it up before the full text', () => {
    renderWithApp(<TermsPage />)

    expect(screen.getByRole('heading', { level: 1, name: 'Termos de uso' })).toBeInTheDocument()
    expect(screen.getByText('Versão de 12 de novembro de 2026')).toBeInTheDocument()
    expect(screen.getByText(/Versão provisória/)).toBeInTheDocument()
    const summary = screen.getByRole('region', { name: 'Em poucas palavras' })
    expect(within(summary).getAllByRole('listitem')).toHaveLength(TERMS.pt.summary.length)
    expect(screen.getByRole('link', { name: /Voltar às configurações/ })).toHaveAttribute(
      'href',
      '/configuracoes',
    )
  })

  it('lists its sections, each one a link to its place on the page', () => {
    renderWithApp(<TermsPage />)

    const contents = screen.getByRole('navigation', { name: 'Nesta página' })
    const links = within(contents).getAllByRole('link')
    expect(links).toHaveLength(TERMS.pt.sections.length)
    expect(links[0]).toHaveAttribute('href', '#o-que-e')
    expect(screen.getByRole('heading', { level: 2, name: '1. O que é o Kayé' })).toHaveAttribute(
      'id',
      'o-que-e',
    )
  })

  it('turns the contact into an email link and points to the privacy policy', async () => {
    renderWithApp(<TermsPage />)

    const contact = screen.getByRole('region', { name: /Contacto$/ })
    expect(within(contact).getByRole('link', { name: 'ola@kaye.ao' })).toHaveAttribute(
      'href',
      'mailto:ola@kaye.ao',
    )
    await userEvent.click(screen.getByRole('link', { name: 'Política de privacidade' }))
    expect(screen.getByTestId('location')).toHaveTextContent('/privacidade')
  })

  it('follows the language of the app', async () => {
    await changeLocale('en')
    renderWithApp(<TermsPage />)

    expect(screen.getByRole('heading', { level: 1, name: 'Terms of use' })).toBeInTheDocument()
    expect(screen.getByText('Version of November 12, 2026')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: '1. What Kayé is' })).toBeInTheDocument()
  })
})

describe('PrivacyPage', () => {
  it('shows the policy, with its lists, and points to the terms', async () => {
    renderWithApp(<PrivacyPage />)

    expect(screen.getByRole('heading', { level: 1, name: 'Política de privacidade' })).toBeInTheDocument()
    const rights = screen.getByRole('region', { name: /Os teus direitos$/ })
    expect(within(rights).getAllByRole('listitem')).toHaveLength(3)
    expect(within(rights).getByRole('link', { name: 'ola@kaye.ao' })).toBeInTheDocument()
    await userEvent.click(screen.getByRole('link', { name: 'Termos de uso' }))
    expect(screen.getByTestId('location')).toHaveTextContent('/termos')
  })
})
