import { useTranslation } from 'react-i18next'
import type { Market } from '../../data/types'

const MAX_BAR = 72 // px, the tallest month

type PostingsChartProps = {
  months: Market['postingsByMonth']
  label?: string
  /** Months in each bar (`month` is the first): 3 on Mercado, whose dates are partly estimated. */
  span?: number
}

/**
 * Job ads per month, oldest first: the trend behind "Procura +12%" (examples on the career page, real
 * ones on Mercado, with their own `label`). The last month is emphasised and labelled; every month is
 * in the text for screen readers and in a tooltip.
 */
export function PostingsChart({ months, label, span = 1 }: PostingsChartProps) {
  const { t, i18n } = useTranslation()
  const max = Math.max(...months.map((item) => item.count), 1)
  const name = (date: Date) => new Intl.DateTimeFormat(i18n.language, { month: 'short' }).format(date)
  const monthName = (month: string) => {
    const start = new Date(`${month}-01T12:00:00`)
    if (span === 1) return name(start)
    const end = new Date(start)
    end.setMonth(end.getMonth() + span - 1)
    return `${name(start)}–${name(end)}`
  }

  return (
    <ol aria-label={label ?? t('career.postingsChart')} className="flex items-end gap-2">
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
