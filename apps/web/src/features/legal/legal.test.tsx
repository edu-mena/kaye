import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { operatorDetails } from '../../data/operator'
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
  it('shows the version, and sums it up before the full text', () => {
    renderWithApp(<TermsPage />)

    expect(screen.getByRole('heading', { level: 1, name: 'Termos de uso' })).toBeInTheDocument()
    expect(screen.getByText('Versão de 24 de novembro de 2026')).toBeInTheDocument()
    expect(screen.queryByText(/Versão provisória/)).not.toBeInTheDocument()
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
    expect(links[0]).toHaveAttribute('href', '#quem-somos')
    expect(screen.getByRole('heading', { level: 2, name: '2. O que é o Kayé' })).toHaveAttribute(
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
    expect(screen.getByText('Version of November 24, 2026')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: '2. What Kayé is' })).toBeInTheDocument()
  })
})

describe('PrivacyPage', () => {
  it('shows the policy, with its lists, and points to the terms', async () => {
    renderWithApp(<PrivacyPage />)

    expect(screen.getByRole('heading', { level: 1, name: 'Política de privacidade' })).toBeInTheDocument()
    const rights = screen.getByRole('region', { name: /Os teus direitos$/ })
    expect(within(rights).getAllByRole('listitem')).toHaveLength(4)
    expect(within(rights).getByRole('link', { name: 'ola@kaye.ao' })).toBeInTheDocument()
    await userEvent.click(screen.getByRole('link', { name: 'Termos de uso' }))
    expect(screen.getByTestId('location')).toHaveTextContent('/termos')
  })
})

const text = (doc: typeof TERMS, locale: (typeof LOCALES)[number]) => JSON.stringify(doc[locale])
const sectionIds = (doc: typeof TERMS) => doc.pt.sections.map((section) => section.id)

describe('what the texts must say', () => {
  it('the privacy policy names the law, the authority and the rights, in every language', () => {
    for (const locale of LOCALES) {
      const policy = text(PRIVACY, locale)
      expect(policy).toContain('22/11')
      expect(policy).toContain('APD')
      expect(policy).toContain('30')
    }
    expect(sectionIds(PRIVACY)).toEqual(
      expect.arrayContaining([
        'responsavel',
        'dados',
        'menores',
        'partilha',
        'transferencias',
        'conservacao',
        'seguranca',
        'direitos',
        'incidentes',
        'queixas',
      ]),
    )
  })

  it('the terms cover the Plus, minors, liability and the governing law', () => {
    expect(sectionIds(TERMS)).toEqual(
      expect.arrayContaining([
        'gratis-plus',
        'independencia',
        'quem-pode-usar',
        'responsabilidade',
        'suspensao',
        'lei-litigios',
        'propriedade',
      ]),
    )
    for (const locale of LOCALES) {
      const terms = text(TERMS, locale)
      expect(terms).toContain('18')
      expect(terms).toContain('INADEC')
      expect(terms).toContain('Luanda')
    }
  })

  it('promises minors what the app does: no public profile, no salaries, no marketing', () => {
    expect(text(PRIVACY, 'pt')).toMatch(/nunca é público/)
    expect(text(PRIVACY, 'pt')).toMatch(/nunca mostramos salários/)
    expect(text(PRIVACY, 'pt')).toMatch(/não enviamos promoções/)
    expect(text(TERMS, 'pt')).toMatch(/não podem subscrever funcionalidades pagas/)
  })

  it('says nothing paid influences the recommendations, in every language', () => {
    expect(text(TERMS, 'pt')).toMatch(/Nada que seja pago, incluindo o Kayé Plus, influencia/)
    expect(text(TERMS, 'en')).toMatch(/Nothing paid, including Kayé Plus, influences/)
    expect(text(TERMS, 'fr')).toMatch(/Rien de payant, y compris Kayé Plus, n’influence/)
  })
})

describe('the identification of who runs Kayé', () => {
  it('adds nothing to the text until the entity is known, and never shows the placeholder', () => {
    renderWithApp(<TermsPage />)
    expect(document.body).not.toHaveTextContent('{operator}')
    expect(document.body).not.toHaveTextContent('{email}')
    expect(operatorDetails('pt')).toBe('')
  })

  it('writes the name, the tax number and the office in the language of the text', () => {
    const operator = { name: 'Kayé, Lda.', nif: '5417000000', address: 'Luanda, Angola' }
    expect(operatorDetails('pt', operator)).toBe(', Kayé, Lda. (NIF 5417000000), com sede em Luanda, Angola')
    expect(operatorDetails('en', operator)).toBe(
      ', Kayé, Lda. (tax number 5417000000), registered at Luanda, Angola',
    )
    expect(operatorDetails('fr', { name: 'Kayé, Lda.', nif: '', address: '' })).toBe(', Kayé, Lda.')
  })
})
