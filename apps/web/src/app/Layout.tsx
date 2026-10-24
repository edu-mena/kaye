import { useTranslation } from 'react-i18next'
import { Outlet, ScrollRestoration, useMatches } from 'react-router'
import { BottomNav, DemoBanner, Sidebar, TopBar } from '../components/Navigation'
import { usePersistentFlag } from '../lib/usePersistentFlag'

/** What a route can ask of the layout, through its `handle`. */
export type RouteHandle = {
  /** The screen opens with a full-width hero, so the demo notice moves out of the way. */
  hideDemoBanner?: boolean
  /** Use the whole width on large screens, with a thin margin. */
  wide?: boolean
}

export function Layout() {
  const { t } = useTranslation()
  const [collapsed, setCollapsed] = usePersistentFlag('kaye.sidebar.collapsed', false)
  const handles = useMatches().map((match) => match.handle as RouteHandle | undefined)
  const hideBanner = handles.some((handle) => handle?.hideDemoBanner)
  const wide = handles.some((handle) => handle?.wide)

  return (
    // Large screens leave room for the floating sidebar: its width plus the same gap on both sides.
    <div
      className={`min-h-dvh transition-[padding] duration-300 ${collapsed ? 'lg:pl-[6.5rem]' : 'lg:pl-[17.5rem]'}`}
    >
      <a
        href="#conteudo"
        className="sr-only z-50 rounded-full bg-night px-4 py-2 text-white focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        {t('common.skipToContent')}
      </a>
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <div className="flex min-h-dvh min-w-0 flex-col">
        <TopBar />
        <main
          id="conteudo"
          className={`mx-auto w-full flex-1 px-3 pt-3 pb-28 lg:pb-12 ${wide ? 'lg:px-2.5 lg:pt-2.5' : 'max-w-5xl lg:px-10 lg:pt-6'}`}
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
