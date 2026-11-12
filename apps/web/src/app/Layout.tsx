import { useTranslation } from 'react-i18next'
import { Outlet, ScrollRestoration, useMatches } from 'react-router'
import { BottomNav, Sidebar, TopBar } from '../components/Navigation'
import { TourHost } from '../components/Tour'
import { useFocusMode } from '../lib/focusMode'
import { usePersistentFlag } from '../lib/usePersistentFlag'
import { useUser } from '../state/userStore'
import { AppStatus } from './AppStatus'

/** What a route can ask of the layout, through its `handle`. */
export type RouteHandle = {
  /** Use the whole width on large screens, with a thin margin. */
  wide?: boolean
  /** Outside the account the screen brings its own page: no margins around it. */
  bare?: boolean
  /** A Kursos reader: like focus mode, no app bars, and the page uses the whole screen. */
  reader?: boolean
}

export function Layout() {
  const { t } = useTranslation()
  const [collapsed, setCollapsed] = usePersistentFlag('kaye.sidebar.collapsed', false)
  const handles = useMatches().map((match) => match.handle as RouteHandle | undefined)
  const wide = handles.some((handle) => handle?.wide)
  const bare = handles.some((handle) => handle?.bare)
  const { profile } = useUser()
  const reader = handles.some((handle) => handle?.reader)
  const focus = useFocusMode() || reader

  // Without an account there is nowhere to navigate to: only the public screens get here.
  if (!profile) {
    return (
      <>
        {bare ? (
          <Outlet />
        ) : (
          <main id="conteudo" className="mx-auto w-full max-w-5xl px-3 py-6 lg:px-10">
            <Outlet />
          </main>
        )}
        <AppStatus />
        <ScrollRestoration />
      </>
    )
  }

  // An interview or a test in progress (focus mode) hides the navigation. The tree around the
  // Outlet must stay the same: a different one would remount the page and lose the session.
  const padding = focus ? '' : collapsed ? 'lg:pl-[6.5rem]' : 'lg:pl-[17.5rem]'
  const mainClass = reader
    ? 'max-w-none'
    : focus
      ? 'max-w-3xl px-3 py-6 lg:py-10'
      : `px-3 pt-3 pb-28 lg:pb-12 ${wide ? 'lg:px-2.5 lg:pt-2.5' : 'max-w-5xl lg:px-10 lg:pt-6'}`

  return (
    // Large screens leave room for the floating sidebar: its width plus the same gap on both sides.
    <div className={`min-h-dvh transition-[padding] duration-300 ${padding}`}>
      <a
        href="#conteudo"
        className="sr-only z-50 rounded-full bg-night px-4 py-2 text-white focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        {t('common.skipToContent')}
      </a>
      {!focus && <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />}
      <div className="flex min-h-dvh min-w-0 flex-col">
        {!focus && <TopBar />}
        <main id="conteudo" className={`mx-auto w-full flex-1 ${mainClass}`}>
          <Outlet />
        </main>
      </div>
      {!focus && <BottomNav />}
      <TourHost />
      <AppStatus />
      {/* New screens start at the top; going back restores where you were. */}
      <ScrollRestoration />
    </div>
  )
}
