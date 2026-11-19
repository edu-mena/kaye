import { useEffect, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

/** Keeps search engines out, on top of the server's header: these pages are shared, not published. */
function useNoIndex() {
  useEffect(() => {
    const meta = document.createElement('meta')
    meta.name = 'robots'
    meta.content = 'noindex, nofollow'
    document.head.append(meta)
    return () => meta.remove()
  }, [])
}

/** The frame of a public page, outside the app's layout (/c/:slug, /familia): content and "Feito com Kayé". */
export function PublicShell({ children, wide = false }: { children: ReactNode; wide?: boolean }) {
  const { t } = useTranslation()
  useNoIndex()
  return (
    <main className={`mx-auto flex min-h-dvh w-full flex-col px-4 py-10 ${wide ? 'max-w-3xl' : 'max-w-md'}`}>
      <div className="flex-1">{children}</div>
      <p className="mt-10 text-center text-xs font-light text-muted">
        {t('publicCard.madeWith')}{' '}
        <Link to="/" className="underline">
          Kayé
        </Link>
      </p>
    </main>
  )
}
