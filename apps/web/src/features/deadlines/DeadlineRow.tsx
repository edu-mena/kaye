import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { CalendarButton, RemindStar } from '../../components/DeadlineActions'
import { daysUntil, type DeadlineItem } from '../../domain/deadlines'

/** One deadline: the day, the kind, the title, the days left, the star ("Lembrar-me"), "Adicionar ao calendário" and the link. */
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
      <RemindStar id={item.id} title={item.title} />
      {!compact && <CalendarButton event={item} label={kind} path={item.to} compact />}
    </div>
  )
}
