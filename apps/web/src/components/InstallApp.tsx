import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { dismissInstall, promptInstall, useInstall } from '../lib/install'
import { Icon } from './icons'
import { Button } from './ui/Button'

/**
 * "Instalar": Chrome's own dialog where there is one; on iPhone, the two taps to do it by hand.
 * Renders nothing when the app is already installed or cannot be installed here.
 */
export function InstallButton() {
  const { t } = useTranslation()
  const { method } = useInstall()
  const [guide, setGuide] = useState(false)
  if (!method) return null
  if (guide) return <IosGuide />
  return (
    <Button size="sm" onClick={() => (method === 'prompt' ? void promptInstall() : setGuide(true))}>
      <Icon name="download" className="size-4" />
      {t('install.action')}
    </Button>
  )
}

function IosGuide() {
  const { t } = useTranslation()
  return <output className="block text-sm text-night">{t('install.iosGuide')}</output>
}

/** The home card: from the second visit, once. "Agora não" sends it away for good. */
export function InstallCard() {
  const { t } = useTranslation()
  const { method, returning, dismissed } = useInstall()
  if (!method || !returning || dismissed) return null
  return (
    <section
      aria-labelledby="install-title"
      className="flex rise flex-wrap items-center gap-4 rounded-2xl bg-surface p-4 shadow-card"
    >
      <img src={`${import.meta.env.BASE_URL}pwa-192.png`} alt="" className="size-12 shrink-0 rounded-xl" />
      <div className="min-w-0 flex-1 basis-56">
        <h2 id="install-title" className="text-base font-semibold text-night">
          {t('install.title')}
        </h2>
        <p className="mt-0.5 text-sm font-light text-muted">{t('install.body')}</p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <InstallButton />
        <Button size="sm" variant="ghost" onClick={dismissInstall}>
          {t('install.notNow')}
        </Button>
      </div>
    </section>
  )
}
