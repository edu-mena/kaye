import { useTranslation } from 'react-i18next'

type Props = {
  title: string
  body: string
}

/** Temporary screen for the tabs that are not built yet. */
export function PagePlaceholder({ title, body }: Props) {
  const { t } = useTranslation()

  return (
    <section className="py-6">
      <h1 className="text-2xl font-bold text-navy">{title}</h1>
      <p className="mt-2 text-muted">{body}</p>
      <span className="mt-4 inline-block rounded-full bg-gold-soft px-3 py-1 text-sm font-medium text-navy">
        {t('comingSoon')}
      </span>
    </section>
  )
}
