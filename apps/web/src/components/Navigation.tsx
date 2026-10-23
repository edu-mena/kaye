import { useTranslation } from 'react-i18next'
import { NavLink } from 'react-router'
import logo from '../assets/kaye-logo.png'
import { DATA_SOURCE } from '../data/source'
import { Icon, type IconName } from './icons'

const NAV_ITEMS = [
  { to: '/', key: 'home', icon: 'home' },
  { to: '/carreiras', key: 'careers', icon: 'compass' },
  { to: '/formacao', key: 'training', icon: 'cap' },
  { to: '/cv', key: 'cv', icon: 'document' },
  { to: '/perfil', key: 'profile', icon: 'user' },
] as const satisfies readonly { to: string; key: string; icon: IconName }[]

/** Phones: fixed bar at the bottom, thumb-reachable. */
export function BottomNav() {
  const { t } = useTranslation()

  return (
    <nav
      aria-label={t('nav.label')}
      className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-surface/95 pb-[env(safe-area-inset-bottom)] lg:hidden"
    >
      <ul className="mx-auto grid max-w-lg grid-cols-5">
        {NAV_ITEMS.map(({ to, key, icon }) => (
          <li key={key}>
            <NavLink
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `relative flex flex-col items-center gap-1 pt-2.5 pb-2 text-xs ${
                  isActive ? 'font-semibold text-navy' : 'text-muted'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    aria-hidden="true"
                    className={`absolute top-0 h-1 w-8 rounded-b-full bg-gold transition-opacity ${isActive ? 'opacity-100' : 'opacity-0'}`}
                  />
                  <Icon name={icon} className="size-6" />
                  {t(`nav.${key}`)}
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}

/** Large screens: the NOVU-style sidebar. */
export function SideNav() {
  const { t } = useTranslation()

  return (
    <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r border-line bg-surface px-4 py-6 lg:flex">
      <img src={logo} alt="Kayé" className="mb-8 ml-2 h-9 w-auto self-start" />
      <nav aria-label={t('nav.label')}>
        <ul className="space-y-1">
          {NAV_ITEMS.map(({ to, key, icon }) => (
            <li key={key}>
              <NavLink
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3 py-2.5 font-medium transition-colors ${
                    isActive ? 'bg-navy text-white' : 'text-navy hover:bg-navy-100'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon name={icon} className={`size-5 ${isActive ? 'text-gold' : ''}`} />
                    {t(`nav.${key}`)}
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <p className="mt-auto px-3 text-sm text-muted">{t('app.tagline')}</p>
    </aside>
  )
}

/** Honest about demo content: numbers here must never pass for real ones. */
export function DemoBanner() {
  const { t } = useTranslation()
  if (DATA_SOURCE !== 'demo') return null

  return (
    <p className="mb-5 flex items-start gap-2 rounded-xl bg-gold-soft px-3 py-2 text-xs text-navy">
      <Icon name="info" className="mt-px size-4 shrink-0" />
      {t('common.demo')}
    </p>
  )
}
