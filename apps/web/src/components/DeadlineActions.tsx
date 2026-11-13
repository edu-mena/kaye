import { useTranslation } from 'react-i18next'
import type { CalendarEvent } from '../domain/ics'
import { addToCalendar } from '../lib/calendar'
import { userActions, useUser } from '../state/userStore'
import { Icon } from './icons'

const ROUND = 'grid size-9 shrink-0 place-items-center rounded-full text-night hover:bg-ash-100'

type CalendarButtonProps = {
  event: CalendarEvent
  /** What it is ("Bolsa", "Exame de acesso"): the calendar shows it before the title. */
  label: string
  path: string
  /** Only the icon (in a row of a list). */
  compact?: boolean
}

/** "Adicionar ao calendário": an .ics with a reminder 3 days before. */
export function CalendarButton({ event, label, path, compact = false }: CalendarButtonProps) {
  const { t } = useTranslation()
  const add = () => addToCalendar(event, label, path)
  if (compact)
    return (
      <button
        type="button"
        onClick={add}
        aria-label={t('deadlines.addToCalendar')}
        title={t('deadlines.addToCalendar')}
        className={ROUND}
      >
        <Icon name="calendar" className="size-4" />
      </button>
    )
  return (
    <button
      type="button"
      onClick={add}
      className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full px-3 text-xs font-normal text-night hover:bg-ash-100"
    >
      <Icon name="calendar" className="size-4" />
      {t('deadlines.addToCalendar')}
    </button>
  )
}

/** "Lembrar-me": the star that puts a deadline in "Só para mim" on /prazos and in the notifications. */
export function RemindStar({ id, title }: { id: string; title: string }) {
  const { t } = useTranslation()
  const on = useUser().remindedDeadlines.includes(id)
  return (
    <button
      type="button"
      aria-pressed={on}
      aria-label={t('share.remind', { name: title })}
      title={on ? t('share.reminded') : t('share.remindShort')}
      onClick={() => userActions.toggleReminder(id)}
      className={`${ROUND} ${on ? 'text-gold-ink' : ''}`}
    >
      <Icon name="star" className={`size-4 ${on ? 'fill-current' : ''}`} />
    </button>
  )
}
