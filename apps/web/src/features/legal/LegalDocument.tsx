import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { Icon } from '../../components/icons'
import { PageHeader } from '../../components/ui/PageHeader'
import { LEGAL_VERSION } from '../../data/legalVersion'
import { operatorDetails } from '../../data/operator'
import type { Locale } from '../../lib/i18n'

// The terms of use and the privacy policy. They are long, so they live here and travel with
// their own page, instead of in locales/ (which every visitor downloads with the app).

/** A paragraph, or a bulleted list. `{email}` becomes the contact link. */
type Block = string | string[]

type LegalText = {
  intro: string
  /** "Em poucas palavras": what matters most, before the full text. */
  summary: string[]
  sections: { id: string; title: string; body: Block[] }[]
}

/** The same text in every language the app speaks. */
export type LegalDoc = Record<Locale, LegalText>

const CONTACT_EMAIL = 'ola@kaye.ao'

const PATHS = { terms: '/termos', privacy: '/privacidade' } as const

const LINK = 'font-normal text-night underline underline-offset-2 hover:text-blue'

function withEmail(text: string, locale: Locale): ReactNode {
  const filled = text.replace('{operator}', operatorDetails(locale))
  const [before, after] = filled.split('{email}')
  if (after === undefined) return filled
  return (
    <>
      {before}
      <a href={`mailto:${CONTACT_EMAIL}`} className={LINK}>
        {CONTACT_EMAIL}
      </a>
      {after}
    </>
  )
}

type LegalDocumentProps = { kind: 'terms' | 'privacy'; doc: LegalDoc }

/** A legal text: the version, the summary in plain words, then the full text with its contents. */
export function LegalDocument({ kind, doc }: LegalDocumentProps) {
  const { t, i18n } = useTranslation()
  const locale = i18n.language as Locale
  const text = doc[locale]
  const other = kind === 'terms' ? 'privacy' : 'terms'
  const date = new Intl.DateTimeFormat(i18n.language, { dateStyle: 'long' }).format(
    new Date(`${LEGAL_VERSION}T12:00:00`),
  )

  return (
    <article>
      <PageHeader
        title={t(`legal.${kind}`)}
        subtitle={text.intro}
        back={{ to: '/configuracoes', label: t('legal.back') }}
      />
      <p className="-mt-5 mb-6 text-sm font-light text-muted">{t('legal.version', { date })}</p>

      <section aria-labelledby="summary" className="rise rounded-card bg-night p-6 text-white sm:p-10">
        <h2 id="summary" className="text-xl font-extrabold sm:text-2xl">
          {t('legal.summary')}
        </h2>
        <ul className="mt-5 space-y-3">
          {text.summary.map((point) => (
            <li key={point} className="flex gap-3 text-sm font-light text-white/90 sm:text-base">
              <Icon name="check" className="mt-0.5 size-5 shrink-0 text-gold" />
              {point}
            </li>
          ))}
        </ul>
      </section>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[15rem_1fr] lg:items-start">
        <nav
          aria-labelledby="contents"
          className="rounded-card bg-surface p-6 shadow-card lg:sticky lg:top-6"
        >
          <h2 id="contents" className="text-sm font-semibold text-night">
            {t('legal.contents')}
          </h2>
          <ol className="mt-3 space-y-2 text-sm font-light">
            {text.sections.map((section, index) => (
              <li key={section.id}>
                <a href={`#${section.id}`} className="text-copy hover:text-night">
                  {index + 1}. {section.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="space-y-10 rounded-card bg-surface p-6 shadow-card sm:p-10">
          {text.sections.map((section, index) => (
            <section key={section.id} aria-labelledby={section.id}>
              <h2 id={section.id} className="scroll-mt-24 text-lg font-extrabold text-night sm:text-xl">
                {index + 1}. {section.title}
              </h2>
              <div className="mt-3 max-w-prose space-y-3 text-sm leading-relaxed font-light text-copy sm:text-base">
                {section.body.map((block) =>
                  typeof block === 'string' ? (
                    <p key={block}>{withEmail(block, locale)}</p>
                  ) : (
                    <ul key={block.join()} className="list-disc space-y-1.5 pl-5">
                      {block.map((item) => (
                        <li key={item}>{withEmail(item, locale)}</li>
                      ))}
                    </ul>
                  ),
                )}
              </div>
            </section>
          ))}
          <p className="border-t border-line pt-6 text-sm font-light text-copy">
            {t('legal.readAlso')}{' '}
            <Link to={PATHS[other]} className={LINK}>
              {t(`legal.${other}`)}
            </Link>
          </p>
        </div>
      </div>
    </article>
  )
}
