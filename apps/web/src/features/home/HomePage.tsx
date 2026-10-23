import { useTranslation } from 'react-i18next'
import { useApiHealth } from './useApiHealth'

export default function HomePage() {
  const { t } = useTranslation()

  return (
    <div className="space-y-5 py-4">
      <section>
        <h1 className="text-2xl font-bold text-navy">{t('home.greeting')}</h1>
        <p className="mt-2 text-muted">{t('home.intro')}</p>
      </section>

      <section className="rounded-2xl bg-navy p-5 text-white">
        <h2 className="text-lg font-semibold">{t('home.testTitle')}</h2>
        <p className="mt-1 text-sm text-white/80">{t('home.testBody')}</p>
        <span className="mt-4 inline-block rounded-full bg-gold px-3 py-1 text-sm font-semibold text-navy">
          {t('comingSoon')}
        </span>
      </section>

      <ApiStatus />
    </div>
  )
}

function ApiStatus() {
  const { t } = useTranslation()
  const { isPending, isError } = useApiHealth()

  const [label, dot] = isPending
    ? [t('status.checking'), 'bg-slate-300']
    : isError
      ? [t('status.offline'), 'bg-red-500']
      : [t('status.online'), 'bg-emerald-500']

  return (
    <p role="status" className="flex items-center gap-2 text-sm text-muted">
      <span className={`size-2 rounded-full ${dot}`} />
      {label}
    </p>
  )
}
