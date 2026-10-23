import { useTranslation } from 'react-i18next'

/** Full-screen placeholder while the first screen's code downloads. */
export function AppLoading() {
  const { t } = useTranslation()

  return (
    <div aria-busy="true" className="flex min-h-dvh items-center justify-center bg-white">
      <p className="text-sm text-muted">{t('loading')}</p>
    </div>
  )
}
