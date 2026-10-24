import { useTranslation } from 'react-i18next'
import { Link, Outlet, ScrollRestoration, useMatches } from 'react-router'
import logo from '../assets/kaye-logo.png'
import { Icon } from '../components/icons'
import { BottomNav, DemoBanner, SideNav } from '../components/Navigation'

/** What a route can ask of the layout, through its `handle`. */
export type RouteHandle = {
  /** The screen opens with a full-width hero, so the demo notice moves out of the way. */
  hideDemoBanner?: boolean
  /** Use the whole width on large screens, with a thin margin. */
  wide?: boolean
}

export function Layout() {
  const { t } = useTranslation()
  const handles = useMatches().map((match) => match.handle as RouteHandle | undefined)
  const hideBanner = handles.some((handle) => handle?.hideDemoBanner)
  const wide = handles.some((handle) => handle?.wide)

  return (
    <div className="flex min-h-dvh">
      <a
        href="#conteudo"
        className="sr-only z-50 rounded-full bg-navy px-4 py-2 text-white focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        {t('common.skipToContent')}
      </a>
      <SideNav />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between px-4 pt-[max(env(safe-area-inset-top),1rem)] pb-2 lg:hidden">
          <Link to="/" className="rounded-md">
            <img src={logo} alt="Kayé" className="h-8 w-auto" />
          </Link>
          <Link
            to="/perfil"
            className="grid size-10 place-items-center rounded-full bg-surface text-navy shadow-card"
          >
            <Icon name="user" className="size-5" />
            <span className="sr-only">{t('nav.profile')}</span>
          </Link>
        </header>
        <main
          id="conteudo"
          className={`mx-auto w-full flex-1 px-4 pt-3 pb-28 lg:pb-12 ${wide ? 'lg:px-2.5 lg:pt-2.5' : 'max-w-5xl lg:px-10 lg:pt-10'}`}
        >
          {!hideBanner && <DemoBanner />}
          <Outlet />
        </main>
      </div>
      <BottomNav />
      {/* New screens start at the top; going back restores where you were. */}
      <ScrollRestoration />
    </div>
  )
}
