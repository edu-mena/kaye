import { useTranslation } from 'react-i18next'

/** The thin strip on every Kursos screen (an exception to docs/decisoes/0007, see 0016). */
export function TestBanner() {
  const { t } = useTranslation()
  return (
    <p
      role="note"
      title={t('kursos.banner')}
      className="truncate bg-gold/20 px-4 py-1.5 text-center text-xs text-night sm:whitespace-normal"
    >
      {t('kursos.banner')}
    </p>
  )
}
