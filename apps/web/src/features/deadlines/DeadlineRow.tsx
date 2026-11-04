import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { Icon } from '../../components/icons'
import { daysUntil, type DeadlineItem } from '../../domain/deadlines'
import { toIcs } from '../../domain/ics'

/** Downloads the event as a Blob: the phone's calendar opens it, with no server. */
function addToCalendar(item: DeadlineItem, label: string) {
  const link = document.createElement('a')
  link.href = URL.createObjectURL(
    new Blob([toIcs(item, label, `${window.location.origin}${item.to}`)], {
      type: 'text/calendar;charset=utf-8',
    }),
  )
  link.download = `${item.id}.ics`
  link.click()
  URL.revokeObjectURL(link.href)
}

/** One deadline: the day, the kind, the title, the days left, "Adicionar ao calendário" and the link. */
export function DeadlineRow({
  item,
  today,
  compact = false,
}: {
  item: DeadlineItem
  today: string
  compact?: boolean
}) {
  const { t, i18n } = useTranslation()
  const date = new Date(`${item.date}T12:00:00`)
  const days = daysUntil(today, item.date)
  const kind = t(`deadlines.kind_${item.kind}`)

  return (
    <div className="flex items-center gap-3 rounded-2xl bg-surface p-3 shadow-card">
      <span className="grid w-12 shrink-0 place-items-center rounded-xl bg-night py-1.5 text-white">
        <span className="text-lg leading-none font-bold">{date.getDate()}</span>
        <span className="text-[0.65rem] uppercase">
          {new Intl.DateTimeFormat(i18n.language, { month: 'short' }).format(date)}
        </span>
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-light text-muted">
          {kind} ·{' '}
          <span className={days <= 7 ? 'font-semibold text-gold-ink' : ''}>
            {t('deadlines.daysLeft', { count: days })}
          </span>
        </p>
        <Link to={item.to} className="block truncate text-sm font-semibold text-night hover:text-blue">
          {item.title}
        </Link>
      </div>
      {!compact && (
        <button
          type="button"
          onClick={() => addToCalendar(item, kind)}
          className="inline-flex shrink-0 items-center gap-1 rounded-full px-3 py-1.5 text-xs font-normal text-night hover:bg-ash-100"
        >
          <Icon name="calendar" className="size-4" />
          <span className="hidden sm:inline">{t('deadlines.addToCalendar')}</span>
          <span className="sr-only sm:hidden">{t('deadlines.addToCalendar')}</span>
        </button>
      )}
    </div>
  )
}
