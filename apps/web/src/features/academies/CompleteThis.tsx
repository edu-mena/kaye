import { useTranslation } from 'react-i18next'
import { Icon } from '../../components/icons'
import type { Academy } from '../../data/types'
import { missingFacts } from '../../domain/academyCompleteness'

/** Kayé's address for corrections; without it, the "Ajuda-nos a completar" link is not shown. */
const KAYE_EMAIL = import.meta.env.VITE_KAYE_EMAIL

/**
 * When the team last checked the institution's facts, and, while some are missing, an email to Kayé with the
 * subject filled in, so anyone who knows them can tell us.
 */
export function CompleteThis({ academy }: { academy: Academy }) {
  const { t, i18n } = useTranslation()
  const missing = missingFacts(academy)
  const ask = KAYE_EMAIL && missing.length > 0
  if (!academy.checkedAt && !ask) return null
  const subject = t('academy.helpSubject', { name: academy.name })
  const body = t('academy.helpBody', {
    name: academy.name,
    missing: missing.map((key) => t(`academy.missing_${key}`)).join(', '),
  })
  return (
    <section aria-label={t('academy.dataTitle')} className="rounded-card bg-surface p-6 shadow-card sm:p-8">
      {academy.checkedAt && (
        <p className="inline-flex items-center gap-1.5 rounded-full bg-paper px-3 py-1 text-xs font-semibold text-night">
          <Icon name="check" className="size-3.5" />
          {t('academy.checkedAt', {
            date: new Date(academy.checkedAt).toLocaleDateString(i18n.language, {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            }),
          })}
        </p>
      )}
      {ask && (
        <>
          <p className="mt-3 text-sm font-light text-copy">{t('academy.helpText')}</p>
          <a
            href={`mailto:${KAYE_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`}
            className="mt-3 inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 text-sm font-normal text-night hover:border-night"
          >
            <Icon name="mail" className="size-4" />
            {t('academy.helpButton')}
          </a>
        </>
      )}
    </section>
  )
}
