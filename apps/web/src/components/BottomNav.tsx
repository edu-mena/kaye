import { useTranslation } from 'react-i18next'
import { NavLink } from 'react-router'
import { BriefcaseIcon, CompassIcon, DocumentIcon, HomeIcon, UserIcon } from './icons'

const TABS = [
  { to: '/', key: 'home', Icon: HomeIcon },
  { to: '/explorar', key: 'explore', Icon: CompassIcon },
  { to: '/vagas', key: 'jobs', Icon: BriefcaseIcon },
  { to: '/cv', key: 'cv', Icon: DocumentIcon },
  { to: '/perfil', key: 'profile', Icon: UserIcon },
] as const

export function BottomNav() {
  const { t } = useTranslation()

  return (
    <nav className="fixed inset-x-0 bottom-0 z-10 mx-auto max-w-lg border-t border-slate-200 bg-white pb-[env(safe-area-inset-bottom)]">
      <ul className="grid grid-cols-5">
        {TABS.map(({ to, key, Icon }) => (
          <li key={key}>
            <NavLink
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 border-t-2 pt-2 pb-2 text-xs ${
                  isActive ? 'border-gold font-semibold text-navy' : 'border-transparent text-muted'
                }`
              }
            >
              <Icon className="size-6" />
              {t(`nav.${key}`)}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
