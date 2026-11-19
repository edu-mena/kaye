import { useTranslation } from 'react-i18next'
import { ExternalLink } from '../../components/DetailParts'
import { Icon } from '../../components/icons'
import { Chip } from '../../components/ui/Chip'
import type { NewsEvent } from '../../data/types'

/** "14 nov." or "24–27 nov. 2026", in the person's language. */
function useEventDates(event: NewsEvent): string {
  const { i18n } = useTranslation()
  const format = new Intl.DateTimeFormat(i18n.language, { day: 'numeric', month: 'short', year: 'numeric' })
  const start = new Date(`${event.starts}T12:00:00`)
  if (!event.ends) return format.format(start)
  return format.formatRange(start, new Date(`${event.ends}T12:00:00`))
}

const isPast = (event: NewsEvent) => (event.ends ?? event.starts) < new Date().toISOString().slice(0, 10)

/** One line under the title while the piece is closed: when, where and whether it costs. */
export function EventLine({ event }: { event: NewsEvent }) {
  const { t } = useTranslation()
  const dates = useEventDates(event)
  return (
    <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-night">
      <span className="inline-flex items-center gap-1">
        <Icon name="calendar" className="size-3.5 text-gold" />
        {dates}
        {event.time && ` · ${event.time}`}
      </span>
      <span className="inline-flex min-w-0 items-center gap-1">
        <Icon name="pin" className="size-3.5 shrink-0 text-gold" />
        <span className="truncate">
          {event.venue}, {event.city}
        </span>
      </span>
      <Chip tone={event.free ? 'success' : 'neutral'}>
        {event.free ? t('news.eventFree') : t('news.eventPaid')}
      </Chip>
      {event.formats.map((format) => (
        <Chip key={format}>{t(`news.format_${format}`)}</Chip>
      ))}
      {isPast(event) && <Chip tone="coral">{t('news.eventPast')}</Chip>}
    </div>
  )
}

/** The whole facts when the piece is opened: access, organiser, where to sign up. */
export function EventDetails({ event }: { event: NewsEvent }) {
  const { t } = useTranslation()
  const dates = useEventDates(event)
  const access = event.free
    ? t('news.eventFree')
    : event.price
      ? t('news.eventPaidFrom', { price: event.price })
      : t('news.eventPaid')
  return (
    <dl className="grid gap-x-4 gap-y-1 rounded-xl bg-ash-100 px-3 py-2.5 text-xs sm:grid-cols-[auto_1fr]">
      <dt className="font-semibold text-night">{t('news.eventWhen')}</dt>
      <dd className="text-copy">
        {dates}
        {event.time && ` · ${event.time}`}
      </dd>
      <dt className="font-semibold text-night">{t('news.eventWhere')}</dt>
      <dd className="text-copy">
        {event.venue}, {event.city}
      </dd>
      <dt className="font-semibold text-night">{t('news.eventAccess')}</dt>
      <dd className="text-copy">{access}</dd>
      {event.organizer && (
        <dd className="text-copy sm:col-span-2">{t('news.eventBy', { name: event.organizer })}</dd>
      )}
      {event.register && (
        <dd className="sm:col-span-2">
          <ExternalLink href={event.register.url}>
            {t('news.eventRegister', { label: event.register.label })}
          </ExternalLink>
        </dd>
      )}
      {event.unconfirmed && <dd className="text-coral sm:col-span-2">{t('news.eventUnconfirmed')}</dd>}
    </dl>
  )
}
