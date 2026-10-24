import { useTranslation } from 'react-i18next'
import type { Market } from '../../data/types'

const MAX_BAR = 72 // px, the tallest month

/**
 * Example job ads per month, oldest first: the trend behind "Procura +12%". The last month is
 * emphasised and labelled; every month is in the text for screen readers and in a tooltip.
 */
export function PostingsChart({ months }: { months: Market['postingsByMonth'] }) {
  const { t, i18n } = useTranslation()
  const max = Math.max(...months.map((item) => item.count), 1)
  const monthName = (month: string) =>
    new Intl.DateTimeFormat(i18n.language, { month: 'short' }).format(new Date(`${month}-01T12:00:00`))

  return (
    <ol aria-label={t('career.postingsChart')} className="flex items-end gap-2">
      {months.map((item, index) => {
        const last = index === months.length - 1
        const text = t('career.postingsValue', { count: item.count, month: monthName(item.month) })
        return (
          <li key={item.month} title={text} className="flex flex-1 flex-col items-center gap-1">
            <span className="sr-only">{text}</span>
            <span aria-hidden="true" className={`text-[11px] text-night ${last ? 'font-bold' : 'invisible'}`}>
              {item.count}
            </span>
            <span
              aria-hidden="true"
              className={`w-full max-w-10 rounded-t-[4px] ${last ? 'bg-night' : 'bg-track'}`}
              style={{ height: Math.max(4, (item.count / max) * MAX_BAR) }}
            />
            <span aria-hidden="true" className="text-[11px] font-light text-muted capitalize">
              {monthName(item.month)}
            </span>
          </li>
        )
      })}
    </ol>
  )
}
