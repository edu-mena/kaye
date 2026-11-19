import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Chip } from './Chip'

/** A label on the left, the value on the right: a spec sheet, one line each. */
export function Rows({ rows }: { rows: { label: string; value: ReactNode }[] }) {
  return (
    <dl className="divide-y divide-line rounded-2xl border border-line">
      {rows.map((row) => (
        <div
          key={row.label}
          className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 px-4 py-3"
        >
          <dt className="text-sm font-light text-muted">{row.label}</dt>
          <dd className="text-right text-sm font-semibold text-night">{row.value}</dd>
        </div>
      ))}
    </dl>
  )
}

/** Something the app will do but does not yet: said plainly, never faked. */
export function Soon() {
  const { t } = useTranslation()
  return <Chip>{t('soon.badge')}</Chip>
}
