import { useTranslation } from 'react-i18next'
import { Outlet } from 'react-router'
import logo from '../assets/kaye-logo.png'
import { BottomNav } from '../components/BottomNav'

export function Layout() {
  const { t } = useTranslation()

  return (
    <div className="mx-auto flex min-h-dvh max-w-lg flex-col bg-white">
      <header className="flex items-center gap-3 px-4 pt-[max(env(safe-area-inset-top),1rem)] pb-3">
        <img src={logo} alt="Kayé" className="h-8 w-auto" />
        <span className="text-sm text-muted">{t('app.tagline')}</span>
      </header>
      <main className="flex-1 px-4 pb-24">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}
