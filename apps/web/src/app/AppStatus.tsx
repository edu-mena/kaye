import { Capacitor } from '@capacitor/core'
import { useSyncExternalStore } from 'react'
import { useTranslation } from 'react-i18next'
import { useRegisterSW } from 'virtual:pwa-register/react'
import { Icon } from '../components/icons'
import { Button } from '../components/ui/Button'

/**
 * Small notices at the bottom of every screen: a new version is ready, or there is no connection.
 * The service worker is registered here, on the web only: the Android app carries its own files.
 */
export function AppStatus() {
  const { t } = useTranslation()
  const native = Capacitor.isNativePlatform()
  const online = useOnline()
  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-3 bottom-24 z-50 flex flex-col items-center gap-2 lg:inset-x-auto lg:right-6 lg:bottom-6 lg:items-end"
    >
      {!online && (
        <p className="pointer-events-auto flex items-center gap-2 rounded-full bg-night px-4 py-2 text-xs text-white shadow-card">
          <Icon name="signal" className="size-3.5 shrink-0" />
          {t('appStatus.offline')}
        </p>
      )}
      {!native && <UpdateNotice />}
    </div>
  )
}

/** "Há uma versão nova": the new service worker waits until the person chooses to reload. */
function UpdateNotice() {
  const { t } = useTranslation()
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_url, registration) {
      // A tab left open for days still hears about new versions: check every hour.
      if (registration) setInterval(() => void registration.update().catch(() => {}), 60 * 60 * 1000)
    },
  })
  if (!needRefresh) return null
  return (
    <div className="pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-2xl bg-surface p-3 pl-4 text-sm text-night shadow-card ring-1 ring-line">
      <Icon name="refresh" className="size-4 shrink-0 text-blue" />
      <p className="min-w-0 flex-1">{t('appStatus.update')}</p>
      <Button size="xs" onClick={() => void updateServiceWorker(true)}>
        {t('appStatus.reload')}
      </Button>
      <button
        type="button"
        aria-label={t('common.close')}
        onClick={() => setNeedRefresh(false)}
        className="grid size-8 shrink-0 place-items-center rounded-full text-muted hover:bg-ash-100"
      >
        <Icon name="close" className="size-4" />
      </button>
    </div>
  )
}

function subscribe(listener: () => void) {
  window.addEventListener('online', listener)
  window.addEventListener('offline', listener)
  return () => {
    window.removeEventListener('online', listener)
    window.removeEventListener('offline', listener)
  }
}

function useOnline(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => navigator.onLine,
    () => true,
  )
}
