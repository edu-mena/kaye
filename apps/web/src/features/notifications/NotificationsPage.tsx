import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { Icon } from '../../components/icons'
import { Loading, RowsSkeleton } from '../../components/PageStates'
import { QueryState } from '../../components/QueryState'
import { ButtonLink } from '../../components/ui/Button'
import { PageHeader } from '../../components/ui/PageHeader'
import { Panel } from '../../components/ui/Panel'
import { Soon } from '../../components/ui/Rows'
import { useNews } from '../../data/queries'
import type { NewsItem } from '../../data/types'
import { daysUntil } from '../../domain/deadlines'
import { isNotification, isUnseen, pathSteps } from '../../domain/path'
import { useNewsForMe } from '../../lib/useNewsForMe'
import { stagger } from '../../lib/ui'
import { userActions, useUser } from '../../state/userStore'
import { DeadlineRow } from '../deadlines/DeadlineRow'
import { useDeadlines } from '../../state/useDeadlines'
import { NewsCard } from '../news/NewsCard'

/**
 * Notificações: what is about the person (docs/arquitetura.md, 7): the next step of their path and the news
 * about the careers they saved or chose and of the topics they subscribed to. Opening the page marks the news as seen; this visit still shows
 * which ones were new.
 */
export default function NotificationsPage() {
  const { t } = useTranslation()
  const query = useNews()

  return (
    <>
      <PageHeader compact title={t('nav.notifications')} />
      <QueryState
        query={query}
        loading={
          <Loading>
            <RowsSkeleton count={4} />
          </Loading>
        }
      >
        {(news) => <Inbox news={news} />}
      </QueryState>
    </>
  )
}

/** The person's deadlines shown on top: two weeks away or less. */
const SOON_DAYS = 14

function Inbox({ news }: { news: NewsItem[] }) {
  const { t, i18n } = useTranslation()
  const user = useUser()
  // What was new when the page opened, before it is marked as seen.
  const [seenAt] = useState(() => user.notificationsSeenAt)
  useEffect(() => userActions.seeNotifications(), [])

  const deadlines = useDeadlines()
  const soon = deadlines.mine.filter((item) => daysUntil(deadlines.today, item.date) <= SOON_DAYS)
  const { mine, subscribed, subscriptions } = useNewsForMe()
  const about = news.filter((item) => isNotification(item, mine, subscribed(item)))
  const followsNothing = mine.size === 0 && subscriptions === null
  const next = pathSteps(user).find((step) => !step.done)
  const date = new Intl.DateTimeFormat(i18n.language, { day: 'numeric', month: 'short', year: 'numeric' })

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-start">
      <div className="space-y-3">
        {soon.length > 0 && (
          <section aria-labelledby="deadlines-soon" className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <h2 id="deadlines-soon" className="text-sm font-semibold text-night">
                {t('deadlines.soonTitle')}
              </h2>
              <Link to="/prazos?meus=sim" className="text-xs font-normal text-night hover:text-blue">
                {t('common.seeAll')}
              </Link>
            </div>
            <ul className="space-y-2">
              {soon.map((item) => (
                <li key={item.id}>
                  <DeadlineRow item={item} today={deadlines.today} />
                </li>
              ))}
            </ul>
          </section>
        )}
        {next && (
          <section
            aria-labelledby="next-step"
            className="flex flex-wrap items-center gap-4 rounded-2xl bg-coal p-4 text-white shadow-card"
          >
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-white/10 text-gold">
              <Icon name="path" className="size-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-light text-white/80">{t('profile.next')}</p>
              <h2 id="next-step" className="text-sm font-semibold">
                {t(`profile.step_${next.id}`)}
              </h2>
            </div>
            <ButtonLink to={next.to} variant="onDark" size="sm">
              {t('notifications.go')}
              <Icon name="arrowRight" className="size-4" />
            </ButtonLink>
          </section>
        )}
        {about.length > 0 ? (
          <ul aria-label={t('notifications.aboutYou')} className="space-y-3">
            {about.map((item, index) => (
              <li key={item.id} className="rise" style={stagger(Math.min(index, 6))}>
                <NewsCard
                  item={item}
                  fresh={isUnseen(item, seenAt)}
                  date={date.format(new Date(`${item.date}T12:00:00`))}
                />
              </li>
            ))}
          </ul>
        ) : (
          <div className="rounded-2xl bg-surface p-5 shadow-card">
            <p className="text-sm font-light text-copy">
              {followsNothing ? t('news.forYouEmpty') : t('notifications.nothingYet')}
            </p>
            <Link
              to={followsNothing ? '/carreiras' : '/novidades'}
              className="mt-2 inline-flex items-center gap-1 text-sm font-normal text-night hover:text-blue"
            >
              {followsNothing ? t('news.careersLink') : t('notifications.allNews')}
              <Icon name="chevronRight" className="size-3.5" />
            </Link>
          </div>
        )}
      </div>

      <aside aria-label={t('notifications.asideLabel')} className="space-y-4 lg:sticky lg:top-6">
        <Panel id="notifications-how" icon="info" title={t('notifications.howTitle')}>
          <p className="text-xs font-light text-copy">{t('notifications.howBody')}</p>
          <Link
            to="/novidades"
            className="mt-2 inline-flex items-center gap-1 text-xs font-normal text-night hover:text-blue"
          >
            {t('notifications.allNews')}
            <Icon name="chevronRight" className="size-3.5" />
          </Link>
        </Panel>
        <Panel id="notifications-push" icon="bell" title={t('notifications.pushTitle')} action={<Soon />}>
          <p className="text-xs font-light text-copy">{t('notifications.pushBody')}</p>
        </Panel>
      </aside>
    </div>
  )
}
