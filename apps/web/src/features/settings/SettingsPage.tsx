import { useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Icon, type IconName } from '../../components/icons'
import { PageHeader } from '../../components/ui/PageHeader'
import { Soon } from '../../components/ui/Rows'
import { stagger } from '../../lib/ui'
import { EraseButton, ExportButton, LanguagePicker, LegalLinks, ServiceStatus } from './SettingsParts'

type GroupProps = {
  id: string
  icon: IconName
  title: string
  index: number
  note?: ReactNode
  children: ReactNode
}

/** A titled group of settings: a small heading over one white card, its rows divided by lines. */
function Group({ id, icon, title, index, note, children }: GroupProps) {
  return (
    <section aria-labelledby={id} className="rise" style={stagger(index)}>
      <h2 id={id} className="mb-2 flex items-center gap-2 px-1 text-sm font-semibold text-night">
        <span className="grid size-6 place-items-center rounded-full bg-blue text-white">
          <Icon name={icon} className="size-3.5" />
        </span>
        {title}
      </h2>
      <div className="divide-y divide-line overflow-hidden rounded-2xl bg-surface shadow-card">
        {children}
      </div>
      {note && <div className="mt-2 space-y-1 px-1 text-xs font-light text-muted">{note}</div>}
    </section>
  )
}

/** One setting: what it is and its action on the right; with a line on what it does, the action goes below. */
function Row({ title, body, action }: { title: string; body?: string; action: ReactNode }) {
  return (
    <div
      className={`px-4 py-3 ${body ? 'space-y-3' : 'flex flex-wrap items-center justify-between gap-x-4 gap-y-2'}`}
    >
      <div className="min-w-0">
        <p className="text-sm text-night">{title}</p>
        {body && <p className="mt-0.5 text-xs font-light text-muted">{body}</p>}
      </div>
      {action}
    </div>
  )
}

/** The language, the person's data (a copy, deleting it, the legal texts) and the notifications. */
export default function SettingsPage() {
  const { t } = useTranslation()
  const [erased, setErased] = useState(false)

  return (
    <>
      <PageHeader compact title={t('nav.settings')} subtitle={t('settings.subtitle')} />
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <Group id="language" icon="globe" title={t('profile.language')} index={0}>
            <div className="p-3">
              <LanguagePicker />
            </div>
          </Group>
          <Group
            id="data"
            icon="shield"
            title={t('profile.data')}
            index={1}
            note={
              <>
                {/* Always there, so screen readers hear the message when it appears. */}
                <output className="block text-sm font-semibold text-night">
                  {erased && t('settings.erased')}
                </output>
                <p>{t('profile.privacyRights')}</p>
                <p>{t('profile.dataBody')}</p>
              </>
            }
          >
            <Row title={t('profile.exportTitle')} body={t('profile.exportBody')} action={<ExportButton />} />
            <Row
              title={t('profile.eraseHeading')}
              body={t('profile.eraseShort')}
              action={<EraseButton onErased={() => setErased(true)} />}
            />
          </Group>
        </div>

        <div className="space-y-6">
          <Group id="legal" icon="document" title={t('settings.legalTitle')} index={2}>
            <LegalLinks />
          </Group>
          <Group id="notifications" icon="bell" title={t('profile.notificationsTitle')} index={3}>
            <Row title={t('profile.notifyInstitutions')} action={<Soon />} />
            <Row title={t('profile.notifyDeadlines')} action={<Soon />} />
            <Row title={t('profile.notifyTips')} action={<Soon />} />
          </Group>
          <Group id="about" icon="info" title={t('profile.about')} index={4}>
            <Row title={t('app.tagline')} action={<ServiceStatus />} />
          </Group>
        </div>
      </div>
    </>
  )
}
