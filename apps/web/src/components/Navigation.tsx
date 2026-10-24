import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, NavLink } from 'react-router'
import logo from '../assets/kaye-logo.png'
import { DATA_SOURCE } from '../data/source'
import { Icon, type IconName } from './icons'
import { Dialog } from './ui/Dialog'

type NavKey =
  | 'home'
  | 'search'
  | 'careers'
  | 'courses'
  | 'academies'
  | 'companies'
  | 'market'
  | 'news'
  | 'cv'
  | 'notifications'
  | 'profile'
  | 'support'
  | 'settings'

type NavItem = { to: string; key: NavKey; icon: IconName }
type NavGroup = { key: 'groupExplore' | 'groupYou' | 'groupHelp'; items: NavItem[] }

const HOME: NavItem = { to: '/', key: 'home', icon: 'home' }
const SEARCH: NavItem = { to: '/pesquisa', key: 'search', icon: 'search' }
const CAREERS: NavItem = { to: '/carreiras', key: 'careers', icon: 'compass' }
const COURSES: NavItem = { to: '/cursos', key: 'courses', icon: 'cap' }
const ACADEMIES: NavItem = { to: '/academias', key: 'academies', icon: 'landmark' }
const COMPANIES: NavItem = { to: '/empresas', key: 'companies', icon: 'building' }
const MARKET: NavItem = { to: '/mercado', key: 'market', icon: 'chart' }
const NEWS: NavItem = { to: '/novidades', key: 'news', icon: 'newspaper' }
const CV: NavItem = { to: '/cv', key: 'cv', icon: 'document' }
const NOTIFICATIONS: NavItem = { to: '/notificacoes', key: 'notifications', icon: 'bell' }
const PROFILE: NavItem = { to: '/perfil', key: 'profile', icon: 'user' }
const SUPPORT: NavItem = { to: '/suporte', key: 'support', icon: 'help' }
const SETTINGS: NavItem = { to: '/configuracoes', key: 'settings', icon: 'sliders' }

// One map for every navigation: the sidebar shows it all, phones split it
// between the bottom bar (the five used most) and the menu.
const SIDEBAR: NavGroup[] = [
  { key: 'groupExplore', items: [HOME, SEARCH, CAREERS, COURSES, ACADEMIES, COMPANIES, MARKET, NEWS] },
  { key: 'groupYou', items: [CV, NOTIFICATIONS, PROFILE] },
]
const SIDEBAR_FOOTER = [SUPPORT, SETTINGS]
const BOTTOM = [HOME, SEARCH, CAREERS, COURSES, CV]
const MENU: NavGroup[] = [
  { key: 'groupExplore', items: [ACADEMIES, COMPANIES, MARKET, NEWS] },
  { key: 'groupYou', items: [NOTIFICATIONS, PROFILE] },
  { key: 'groupHelp', items: SIDEBAR_FOOTER },
]

const GROUP_LABEL = 'mb-2 px-3 text-[11px] font-bold tracking-[0.14em] text-white/55 uppercase'

type DarkLinkProps = { item: NavItem; iconOnly?: boolean; onNavigate?: () => void }

/** A link on a dark surface: a white pill when active, so it reads at a glance. */
function DarkLink({ item, iconOnly = false, onNavigate }: DarkLinkProps) {
  const { t } = useTranslation()
  const label = t(`nav.${item.key}`)
  return (
    <NavLink
      to={item.to}
      end={item.to === '/'}
      title={iconOnly ? label : undefined}
      onClick={onNavigate}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-2xl py-2.5 text-sm font-semibold transition-colors ${iconOnly ? 'justify-center' : 'px-3'} ${
          isActive ? 'bg-white text-night' : 'text-white/70 hover:bg-white/10 hover:text-white'
        }`
      }
    >
      <Icon name={item.icon} className="size-5 shrink-0" />
      <span className={iconOnly ? 'sr-only' : 'truncate'}>{label}</span>
    </NavLink>
  )
}

/** The "K" of the favicon, for the folded sidebar. */
function BrandMark({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" className={className}>
      <path
        d="M22 14v36M22 36l16-14M27 31l13 19"
        fill="none"
        className="stroke-white"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M40 12l8-6" className="stroke-gold" strokeWidth="5" strokeLinecap="round" />
    </svg>
  )
}

type SidebarProps = { collapsed: boolean; onToggle: () => void }

/** Large screens: a floating black sidebar, inset from the edges, that folds to icons. */
export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const { t } = useTranslation()

  return (
    <aside
      className={`fixed inset-y-3 left-3 z-30 hidden flex-col rounded-[1.75rem] bg-night py-5 text-white shadow-lift transition-[width] duration-300 lg:flex ${
        collapsed ? 'w-20 px-3' : 'w-64 px-4'
      }`}
    >
      <div className={`mb-6 flex items-center ${collapsed ? 'flex-col gap-3' : 'justify-between pl-2'}`}>
        <Link to="/" className="rounded-md">
          {collapsed ? (
            <>
              <BrandMark className="size-10" />
              <span className="sr-only">Kayé</span>
            </>
          ) : (
            <img src={logo} alt="Kayé" className="h-8 w-auto brightness-0 invert" />
          )}
        </Link>
        <button
          type="button"
          aria-expanded={!collapsed}
          onClick={onToggle}
          className="grid size-9 place-items-center rounded-full text-white/70 hover:bg-white/10 hover:text-white"
        >
          <Icon name="panel" className="size-5" />
          <span className="sr-only">{collapsed ? t('nav.expand') : t('nav.collapse')}</span>
        </button>
      </div>

      <nav aria-label={t('nav.label')} className="-mx-1 no-scrollbar flex-1 overflow-y-auto px-1">
        {SIDEBAR.map((group, index) => (
          <div key={group.key} className="mb-5">
            {collapsed ? (
              <>
                {index > 0 && <hr aria-hidden="true" className="mx-3 mb-5 border-white/10" />}
                <p className="sr-only">{t(`nav.${group.key}`)}</p>
              </>
            ) : (
              <p className={GROUP_LABEL}>{t(`nav.${group.key}`)}</p>
            )}
            <ul className="space-y-1">
              {group.items.map((item) => (
                <li key={item.key}>
                  <DarkLink item={item} iconOnly={collapsed} />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <ul className="space-y-1 border-t border-white/10 pt-4">
        {SIDEBAR_FOOTER.map((item) => (
          <li key={item.key}>
            <DarkLink item={item} iconOnly={collapsed} />
          </li>
        ))}
      </ul>
    </aside>
  )
}

const ROUND_BUTTON =
  'grid size-10 place-items-center rounded-full bg-surface text-night shadow-card hover:bg-ash-100'

/** Phones: logo, notifications and the menu. Large screens: search, notifications and profile. */
export function TopBar() {
  const { t } = useTranslation()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="flex items-center gap-3 px-4 pt-[max(env(safe-area-inset-top),1rem)] pb-2 lg:px-2.5 lg:pt-3">
      <Link to="/" className="rounded-md lg:hidden">
        <img src={logo} alt="Kayé" className="h-8 w-auto" />
      </Link>
      <Link
        to="/pesquisa"
        className="hidden h-11 w-full max-w-md items-center gap-2 rounded-full border border-line bg-surface px-4 text-sm text-muted transition-colors hover:border-ash-300 lg:flex"
      >
        <Icon name="search" className="size-4" />
        {t('nav.searchPlaceholder')}
      </Link>
      <div className="ml-auto flex items-center gap-2">
        <Link to="/notificacoes" className={ROUND_BUTTON}>
          <Icon name="bell" className="size-5" />
          <span className="sr-only">{t('nav.notifications')}</span>
        </Link>
        <Link to="/perfil" className={`${ROUND_BUTTON} hidden lg:grid`}>
          <Icon name="user" className="size-5" />
          <span className="sr-only">{t('nav.profile')}</span>
        </Link>
        <button
          type="button"
          aria-haspopup="dialog"
          onClick={() => setMenuOpen(true)}
          className={`${ROUND_BUTTON} lg:hidden`}
        >
          <Icon name="menu" className="size-5" />
          <span className="sr-only">{t('nav.menu')}</span>
        </button>
      </div>

      <Dialog open={menuOpen} onClose={() => setMenuOpen(false)} title={t('nav.menu')} variant="drawer">
        <nav aria-label={t('nav.more')}>
          {MENU.map((group) => (
            <div key={group.key} className="mb-6">
              <p className={GROUP_LABEL}>{t(`nav.${group.key}`)}</p>
              <ul className="space-y-1">
                {group.items.map((item) => (
                  <li key={item.key}>
                    <DarkLink item={item} onNavigate={() => setMenuOpen(false)} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </Dialog>
    </header>
  )
}

/** Phones: a floating bar with the five destinations used most; the active one in a black circle. */
export function BottomNav() {
  const { t } = useTranslation()

  return (
    <nav
      aria-label={t('nav.label')}
      className="fixed inset-x-3 bottom-[max(env(safe-area-inset-bottom),0.75rem)] z-20 rounded-[1.75rem] bg-surface px-2 py-1.5 shadow-lift lg:hidden"
    >
      <ul className="mx-auto grid max-w-lg grid-cols-5">
        {BOTTOM.map((item) => (
          <li key={item.key}>
            <NavLink
              to={item.to}
              end={item.to === '/'}
              className="flex flex-col items-center gap-0.5 py-0.5 text-[11px] font-semibold text-night"
            >
              {({ isActive }) => (
                <>
                  <span
                    className={`grid size-10 place-items-center rounded-full transition-colors ${
                      isActive ? 'bg-night text-white' : ''
                    }`}
                  >
                    <Icon name={item.icon} className="size-5" />
                  </span>
                  {t(`nav.${item.key}`)}
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}

/** Honest about demo content: numbers here must never pass for real ones. */
export function DemoBanner() {
  const { t } = useTranslation()
  if (DATA_SOURCE !== 'demo') return null

  return (
    <p className="mb-5 flex items-start gap-2 rounded-xl border border-line bg-surface px-3 py-2 text-xs text-copy">
      <Icon name="info" className="mt-px size-4 shrink-0" />
      {t('common.demo')}
    </p>
  )
}
