import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, NavLink, useLocation, useMatch } from 'react-router'
import logo from '../assets/kaye-logo.png'
import { useHideOnScroll } from '../lib/useHideOnScroll'
import { useUnseenNotifications } from '../state/notifications'
import { useUser } from '../state/userStore'
import { Icon, type IconName } from './icons'
import { Dialog } from './ui/Dialog'

type NavKey =
  | 'home'
  | 'search'
  | 'careers'
  | 'tests'
  | 'courses'
  | 'kursos'
  | 'academies'
  | 'opportunities'
  | 'deadlines'
  | 'companies'
  | 'market'
  | 'news'
  | 'cv'
  | 'notifications'
  | 'profile'
  | 'support'
  | 'settings'

type NavItem = {
  to: string
  key: NavKey
  icon: IconName
  /** White icon instead of gold: Suporte and Configurações stay in the background. */
  quiet?: boolean
  /** On large screens the tutorial points at the sidebar link (components/Tour.tsx). */
  tour?: string
  /** Other addresses that belong to this item: the tests it gathers, for example. */
  also?: string[]
}
type NavGroup = { key: 'groupExplore' | 'groupYou' | 'groupHelp'; items: NavItem[] }

const HOME: NavItem = { to: '/', key: 'home', icon: 'home' }
const SEARCH: NavItem = { to: '/pesquisa', key: 'search', icon: 'search' }
const CAREERS: NavItem = { to: '/carreiras', key: 'careers', icon: 'compass' }
const TESTS: NavItem = {
  to: '/testes',
  key: 'tests',
  icon: 'brain',
  also: ['/teste', '/treino', '/entrevistas'],
}
const COURSES: NavItem = { to: '/cursos', key: 'courses', icon: 'cap' }
const KURSOS: NavItem = { to: '/kursos', key: 'kursos', icon: 'book' }
const ACADEMIES: NavItem = { to: '/academias', key: 'academies', icon: 'landmark' }
const OPPORTUNITIES: NavItem = { to: '/oportunidades', key: 'opportunities', icon: 'award' }
const DEADLINES: NavItem = { to: '/prazos', key: 'deadlines', icon: 'calendar', tour: 'deadlines' }
const COMPANIES: NavItem = { to: '/empresas', key: 'companies', icon: 'building' }
const MARKET: NavItem = { to: '/mercado', key: 'market', icon: 'chart' }
const NEWS: NavItem = { to: '/novidades', key: 'news', icon: 'newspaper' }
const CV: NavItem = { to: '/cv', key: 'cv', icon: 'document' }
const NOTIFICATIONS: NavItem = { to: '/notificacoes', key: 'notifications', icon: 'bell' }
const PROFILE: NavItem = { to: '/perfil', key: 'profile', icon: 'user' }
const SUPPORT: NavItem = { to: '/suporte', key: 'support', icon: 'help', quiet: true }
const SETTINGS: NavItem = { to: '/configuracoes', key: 'settings', icon: 'sliders', quiet: true }

// One map for every navigation: the sidebar shows it all, phones split it
// between the bottom bar (the five used most) and the menu.
const SIDEBAR: NavGroup[] = [
  {
    key: 'groupExplore',
    items: [
      HOME,
      SEARCH,
      CAREERS,
      TESTS,
      COURSES,
      KURSOS,
      ACADEMIES,
      OPPORTUNITIES,
      DEADLINES,
      COMPANIES,
      MARKET,
      NEWS,
    ],
  },
  { key: 'groupYou', items: [CV, NOTIFICATIONS, PROFILE] },
]
const SIDEBAR_FOOTER = [SUPPORT, SETTINGS]
const BOTTOM = [HOME, SEARCH, CAREERS, COURSES, CV]
const MENU: NavGroup[] = [
  {
    key: 'groupExplore',
    items: [TESTS, KURSOS, ACADEMIES, OPPORTUNITIES, DEADLINES, COMPANIES, MARKET, NEWS],
  },
  { key: 'groupYou', items: [NOTIFICATIONS, PROFILE] },
  { key: 'groupHelp', items: SIDEBAR_FOOTER },
]

const GROUP_LABEL = 'mb-2 px-3 text-xs font-semibold text-white'

type DarkLinkProps = { item: NavItem; iconOnly?: boolean; onNavigate?: () => void }

/** A link on the near-black menus: white text, gold icon; a lighter pill when active. */
function DarkLink({ item, iconOnly = false, onNavigate }: DarkLinkProps) {
  const { t } = useTranslation()
  const label = t(`nav.${item.key}`)
  const { pathname } = useLocation()
  const alsoActive = (item.also ?? []).some((path) => pathname === path || pathname.startsWith(`${path}/`))
  return (
    <NavLink
      to={item.to}
      end={item.to === '/'}
      title={iconOnly ? label : undefined}
      data-tour={item.tour}
      onClick={onNavigate}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-2xl py-2.5 text-sm font-light transition-colors ${iconOnly ? 'justify-center' : 'px-3'} ${
          isActive || alsoActive ? 'bg-white/15 font-normal text-white' : 'text-white hover:bg-white/5'
        }`
      }
    >
      <Icon name={item.icon} className={`size-5 shrink-0 ${item.quiet ? 'text-white' : 'text-gold'}`} />
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
      className={`fixed inset-y-3 left-3 z-30 hidden flex-col rounded-card bg-coal py-5 text-white shadow-lift transition-[width] duration-300 lg:flex ${
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
          className="grid size-9 place-items-center rounded-full text-gold hover:bg-white/10"
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

const ROUND_BUTTON = 'grid size-10 place-items-center rounded-full bg-ash-100 text-night hover:bg-ash-200'

/**
 * A floating bar, rounded like the sidebar. It sticks to the top, hides while scrolling
 * down and comes back on the way up; `--topbar-space` tells sticky bars below where to sit.
 * Phones: logo, notifications and the menu. Large screens: search, notifications and profile.
 */
export function TopBar() {
  const { t } = useTranslation()
  const { photo } = useUser()
  const unseen = useUnseenNotifications()
  const [menuOpen, setMenuOpen] = useState(false)
  // On Pesquisa the page has its own field: a second one up here would only repeat it.
  const onSearch = useMatch('/pesquisa')
  const hidden = useHideOnScroll()
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const root = document.documentElement
    const space = hidden ? 0 : (ref.current?.offsetHeight ?? 0) + 12
    root.style.setProperty('--topbar-space', `${space}px`)
    return () => {
      root.style.removeProperty('--topbar-space')
    }
  }, [hidden])

  return (
    <header
      ref={ref}
      className={`sticky top-[max(env(safe-area-inset-top),0.75rem)] z-30 mx-3 mt-[max(env(safe-area-inset-top),0.75rem)] flex items-center gap-3 rounded-card bg-surface px-4 py-3 shadow-card transition-transform duration-300 focus-within:translate-y-0 lg:mx-2.5 lg:px-5 ${
        hidden ? '-translate-y-[calc(100%+1.5rem)]' : ''
      }`}
    >
      <Link to="/" className="rounded-md lg:hidden">
        <img src={logo} alt="Kayé" className="h-8 w-auto" />
      </Link>
      {!onSearch && (
        <Link
          to="/pesquisa"
          className="hidden h-11 w-full max-w-md items-center gap-3 rounded-full bg-ash-100 pr-4 pl-1.5 text-sm text-muted transition-colors hover:bg-ash-200 lg:flex"
        >
          <span className="grid size-8 shrink-0 place-items-center rounded-full bg-coal text-white">
            <Icon name="search" className="size-4" />
          </span>
          {t('nav.searchPlaceholder')}
        </Link>
      )}
      <div className="ml-auto flex items-center gap-2">
        <Link to="/notificacoes" className={`relative ${ROUND_BUTTON}`}>
          <Icon name="bell" className="size-5" />
          <span className="sr-only">
            {unseen > 0 ? t('nav.notificationsNew', { count: unseen }) : t('nav.notifications')}
          </span>
          {unseen > 0 && (
            <span
              aria-hidden="true"
              className="absolute top-2 right-2 size-2.5 rounded-full bg-gold ring-2 ring-surface"
            />
          )}
        </Link>
        <Link
          to="/perfil"
          className="hidden size-10 place-items-center overflow-hidden rounded-full bg-coal text-gold hover:bg-night lg:grid"
        >
          {photo ? (
            <img src={photo} alt="" className="size-full object-cover" />
          ) : (
            <Icon name="user" className="size-5" />
          )}
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
      className="fixed inset-x-3 bottom-[max(env(safe-area-inset-bottom),0.75rem)] z-20 rounded-card bg-surface px-2 py-1.5 shadow-lift lg:hidden"
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
