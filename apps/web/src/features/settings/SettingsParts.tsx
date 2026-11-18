import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { Icon, type IconName } from '../../components/icons'
import { Button } from '../../components/ui/Button'
import { Dialog } from '../../components/ui/Dialog'
import { Switch } from '../../components/ui/Switch'
import { changeLocale, LOCALE_NAMES, LOCALES } from '../../lib/i18n'
import { saveFile } from '../../lib/saveFile'
import { useApiHealth } from '../../lib/useApiHealth'
import { deviceSavesData, setDataSaver, useDataSaver, useDataSaverChoice } from '../../lib/useDataSaver'
import { EXPORT_URL } from '../../data/account'
import { eraseEverything, signOut, useAccount } from '../../state/accountSync'
import { getUser } from '../../state/userStore'

// The working parts of the settings (docs/arquitetura.md, 7). Configurações lays them out in
// compact rows; Perfil (Conta, Privacidade) in its own larger sections.

/** The three languages as pills, each in its own name; the current one is pressed. */
export function LanguagePicker() {
  const { t, i18n } = useTranslation()
  return (
    <fieldset>
      <legend className="sr-only">{t('profile.language')}</legend>
      <div className="grid grid-cols-3 gap-2">
        {LOCALES.map((locale) => {
          const active = i18n.language === locale
          return (
            <button
              key={locale}
              type="button"
              lang={locale}
              aria-pressed={active}
              onClick={() => void changeLocale(locale)}
              className={`rounded-full border px-3 py-3 text-sm transition-colors ${
                active
                  ? 'border-night bg-night font-normal text-white'
                  : 'border-line bg-surface font-light text-night hover:bg-ash-100'
              }`}
            >
              {LOCALE_NAMES[locale]}
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}

/** Whether the server answers, as a coloured dot and a word. */
export function ServiceStatus() {
  const { t } = useTranslation()
  const { isPending, isError } = useApiHealth()
  const [label, dot] = isPending
    ? [t('status.checking'), 'bg-track']
    : isError
      ? [t('status.offline'), 'bg-coral']
      : [t('status.online'), 'bg-success']

  return (
    <output className="flex items-center gap-2 text-sm font-light text-muted">
      <span className={`size-2 rounded-full ${dot}`} />
      {label}
    </output>
  )
}

/**
 * A JSON copy of everything Kayé keeps about the person: with an account, the server's export (the
 * account, the data and the consents); without one, this device's copy.
 */
function downloadMyData(signedIn: boolean) {
  if (signedIn) {
    window.location.assign(EXPORT_URL)
    return
  }
  saveFile(
    new Blob([JSON.stringify(getUser(), null, 2)], { type: 'application/json' }),
    'kaye-os-meus-dados.json',
  )
}

export function ExportButton() {
  const { t } = useTranslation()
  const { status } = useAccount()
  return (
    <Button variant="secondary" size="sm" onClick={() => downloadMyData(status === 'signedIn')}>
      <Icon name="download" className="size-4" />
      {t('profile.export')}
    </Button>
  )
}

/** Who is signed in, and the button to end the session on this device. Nothing without a session. */
export function AccountRow() {
  const { t } = useTranslation()
  const { status, me } = useAccount()
  if (status !== 'signedIn' || !me) return null
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-3">
      <div className="min-w-0">
        <p className="text-sm text-night">{t('settings.account')}</p>
        <p className="mt-0.5 truncate text-xs font-light text-muted">{me.email}</p>
      </div>
      <Button variant="secondary" size="sm" onClick={() => void signOut().catch(() => {})}>
        {t('settings.signOut')}
      </Button>
    </div>
  )
}

/** Deletes everything the app keeps, only after the person confirms it. */
export function EraseButton({ onErased }: { onErased?: () => void }) {
  const { t } = useTranslation()
  const { status } = useAccount()
  const [confirming, setConfirming] = useState(false)
  const [failed, setFailed] = useState(false)
  const [erasing, setErasing] = useState(false)

  async function erase() {
    setErasing(true)
    setFailed(false)
    try {
      await eraseEverything()
      setConfirming(false)
      onErased?.()
    } catch {
      // The account could not be deleted (no network): nothing was erased, the person can try again.
      setFailed(true)
    } finally {
      setErasing(false)
    }
  }

  return (
    <>
      <Button variant="danger" size="sm" className="border border-line" onClick={() => setConfirming(true)}>
        <Icon name="trash" className="size-4" />
        {t('profile.erase')}
      </Button>
      <Dialog
        open={confirming}
        onClose={() => setConfirming(false)}
        title={t('profile.eraseTitle')}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setConfirming(false)}>
              {t('common.cancel')}
            </Button>
            <Button className="bg-coral hover:bg-coral" disabled={erasing} onClick={() => void erase()}>
              {t('profile.eraseConfirm')}
            </Button>
          </div>
        }
      >
        <p className="text-sm font-light text-copy">
          {t(status === 'signedIn' ? 'profile.eraseAccountBody' : 'profile.eraseBody')}
        </p>
        {failed && (
          <p role="alert" className="mt-3 text-sm text-coral">
            {t('profile.eraseFailed')}
          </p>
        )}
      </Dialog>
    </>
  )
}

const LEGAL: { to: string; key: 'privacy' | 'terms'; icon: IconName }[] = [
  { to: '/privacidade', key: 'privacy', icon: 'shield' },
  { to: '/termos', key: 'terms', icon: 'document' },
]

/** The privacy policy and the terms of use, one line each. The caller frames the list. */
export function LegalLinks({ className = '' }: { className?: string }) {
  const { t } = useTranslation()
  return (
    <ul className={`divide-y divide-line ${className}`}>
      {LEGAL.map((item) => (
        <li key={item.key}>
          <Link
            to={item.to}
            className="flex items-center gap-3 px-4 py-3 text-sm font-light text-night hover:bg-ash-100"
          >
            <Icon name={item.icon} className="size-4 text-muted" />
            {t(`legal.${item.key}`)}
            <Icon name="chevronRight" className="ml-auto size-4 text-muted" />
          </Link>
        </li>
      ))}
    </ul>
  )
}

/**
 * The data saver switch. Until the person chooses, it follows the phone's own "save data"
 * setting, and says so.
 */
export function DataSaverSwitch() {
  const { t } = useTranslation()
  const choice = useDataSaverChoice()
  const on = useDataSaver()
  const fromPhone = choice === 'auto' && deviceSavesData()
  return (
    <div className="space-y-1">
      <Switch
        checked={on}
        label={t('dataSaver.title')}
        onChange={(next) => setDataSaver(next ? 'on' : 'off')}
      />
      {fromPhone && <p className="text-xs font-light text-muted">{t('dataSaver.fromPhone')}</p>}
    </div>
  )
}
