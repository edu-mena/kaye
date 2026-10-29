import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { Icon, type IconName } from '../../components/icons'
import { PageHeader } from '../../components/ui/PageHeader'
import { Panel } from '../../components/ui/Panel'
import { Soon } from '../../components/ui/Rows'
import { LegalLinks } from '../settings/SettingsParts'

/** The questions, by group; their texts are support.q_<id> and support.a_<id>. */
const GROUPS = [
  { id: 'kaye', icon: 'info', questions: ['what', 'free', 'training', 'sources'] },
  { id: 'data', icon: 'shield', questions: ['account', 'minors', 'erase'] },
  { id: 'test', icon: 'compass', questions: ['test', 'again', 'order'] },
  { id: 'market', icon: 'chart', questions: ['verdict'] },
] as const satisfies readonly { id: string; icon: IconName; questions: readonly string[] }[]

const SHORTCUTS = [
  { id: 'test', to: '/teste', icon: 'compass' },
  { id: 'cv', to: '/cv', icon: 'document' },
  { id: 'compare', to: '/cursos/comparar', icon: 'cap' },
  { id: 'data', to: '/configuracoes', icon: 'shield' },
] as const satisfies readonly { id: string; to: string; icon: IconName }[]

/** Suporte: the frequent questions, answered as the app works today, and shortcuts to what people look for. */
export default function SupportPage() {
  const { t } = useTranslation()

  return (
    <>
      <PageHeader compact title={t('nav.support')} />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-start">
        <div className="space-y-4">
          {GROUPS.map((group) => (
            <Panel
              key={group.id}
              id={`support-${group.id}`}
              icon={group.icon}
              title={t(`support.group_${group.id}`)}
            >
              <div className="-my-2 divide-y divide-line">
                {group.questions.map((question) => (
                  <details key={question} className="group py-2">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-3 py-1 text-sm font-normal text-night [&::-webkit-details-marker]:hidden">
                      {t(`support.q_${question}`)}
                      <Icon
                        name="chevronRight"
                        className="size-4 shrink-0 text-muted transition-transform group-open:rotate-90"
                      />
                    </summary>
                    <p className="mt-1 mb-1 text-sm font-light text-copy">{t(`support.a_${question}`)}</p>
                  </details>
                ))}
              </div>
            </Panel>
          ))}
        </div>

        <aside aria-label={t('support.asideLabel')} className="space-y-4 lg:sticky lg:top-6">
          <Panel id="support-shortcuts" icon="path" title={t('support.shortcuts')}>
            <ul className="-my-1 divide-y divide-line">
              {SHORTCUTS.map((shortcut) => (
                <li key={shortcut.id}>
                  <Link
                    to={shortcut.to}
                    className="flex items-center gap-3 py-2 text-sm font-normal text-night hover:text-blue"
                  >
                    <Icon name={shortcut.icon} className="size-4 shrink-0 text-muted" />
                    <span className="flex-1">{t(`support.shortcut_${shortcut.id}`)}</span>
                    <Icon name="chevronRight" className="size-3.5 text-muted" />
                  </Link>
                </li>
              ))}
            </ul>
          </Panel>
          <Panel id="support-contact" icon="help" title={t('support.contactTitle')} action={<Soon />}>
            <p className="text-xs font-light text-copy">{t('support.contactBody')}</p>
          </Panel>
          <Panel id="support-legal" icon="document" title={t('support.legalTitle')}>
            <LegalLinks className="-mx-4 -my-2 sm:-mx-5" />
          </Panel>
        </aside>
      </div>
    </>
  )
}
