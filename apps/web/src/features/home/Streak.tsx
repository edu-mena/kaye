import { useTranslation } from 'react-i18next'
import { Icon } from '../../components/icons'
import { Card } from '../../components/ui/Card'
import { currentStreak, weekView, type DayState } from '../../domain/streak'
import { todayIso } from '../../domain/scholarships'
import { useUser } from '../../state/userStore'
import { CardHeading } from './CardHeading'

const LABEL = {
  done: 'forYou.dayDone',
  today: 'forYou.dayToday',
  rest: 'forYou.dayRest',
  future: 'forYou.dayFuture',
} as const satisfies Record<DayState, string>

const DOT: Record<DayState, string> = {
  done: 'bg-night text-white',
  today: 'bg-surface text-night ring-2 ring-night',
  rest: 'bg-ash-100',
  future: 'bg-ash-100',
}

/** The days in a row with something done, and the week at a glance. Missing one day does not cut it. */
export function Streak() {
  const { t, i18n } = useTranslation()
  const { activity = [] } = useUser()
  const today = todayIso()
  const days = currentStreak(activity, today)
  const week = weekView(activity, today)
  const weekday = new Intl.DateTimeFormat(i18n.language, { weekday: 'narrow' })
  const weekdayLong = new Intl.DateTimeFormat(i18n.language, { weekday: 'long' })
  const doneToday = activity.includes(today)

  return (
    <Card as="section" aria-labelledby="home-streak" className="p-5">
      <CardHeading id="home-streak" icon="bolt">
        {days > 0 ? t('forYou.streakDays', { count: days }) : t('forYou.streakStart')}
      </CardHeading>
      <ol aria-label={t('forYou.weekLabel')} className="mt-4 flex justify-between">
        {week.map(({ day, state }) => {
          const date = new Date(`${day}T12:00:00`)
          return (
            <li key={day} className="grid justify-items-center gap-1.5 text-xs font-light text-muted">
              <span className="sr-only">{`${weekdayLong.format(date)}: ${t(LABEL[state])}`}</span>
              <span
                aria-hidden="true"
                className={`grid size-9 place-items-center rounded-full ${DOT[state]}`}
              >
                {state === 'done' && <Icon name="check" className="size-4" />}
              </span>
              <span aria-hidden="true">{weekday.format(date)}</span>
            </li>
          )
        })}
      </ol>
      <p className="mt-4 text-sm font-light text-copy">
        {doneToday ? t('forYou.streakToday') : t('forYou.streakHint')}
      </p>
      {days > 1 && <p className="mt-1 text-xs font-light text-muted">{t('forYou.streakForgive')}</p>}
    </Card>
  )
}
