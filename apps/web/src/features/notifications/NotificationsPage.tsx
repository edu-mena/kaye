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
import { isAboutMe, isUnseen, myCareers, pathSteps } from '../../domain/path'
import { stagger } from '../../lib/ui'
import { userActions, useUser } from '../../state/userStore'
import { NewsCard } from '../news/NewsCard'

/**
 * Notificações: what is about the person (docs/arquitetura.md, 7): the next step of their path and the news
 * about the careers they saved or chose. Opening the page marks the news as seen; this visit still shows
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

function Inbox({ news }: { news: NewsItem[] }) {
  const { t, i18n } = useTranslation()
  const user = useUser()
  // What was new when the page opened, before it is marked as seen.
  const [seenAt] = useState(() => user.notificationsSeenAt)
  useEffect(() => userActions.seeNotifications(), [])

  const mine = myCareers(user)
  const about = news.filter((item) => isAboutMe(item, mine))
  const next = pathSteps(user).find((step) => !step.done)
  const date = new Intl.DateTimeFormat(i18n.language, { day: 'numeric', month: 'short', year: 'numeric' })

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-start">
      <div className="space-y-3">
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
              {mine.size === 0 ? t('news.forYouEmpty') : t('notifications.nothingYet')}
            </p>
            <Link
              to={mine.size === 0 ? '/carreiras' : '/novidades'}
              className="mt-2 inline-flex items-center gap-1 text-sm font-normal text-night hover:text-blue"
            >
              {mine.size === 0 ? t('news.careersLink') : t('notifications.allNews')}
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
