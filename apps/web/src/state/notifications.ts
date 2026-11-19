import { useNews } from '../data/queries'
import { daysUntil, isDeadlineUnseen } from '../domain/deadlines'
import { isNotification, isUnseen } from '../domain/path'
import { useNewsForMe } from '../lib/useNewsForMe'
import { useDeadlines } from './useDeadlines'
import { useUser } from './userStore'

/** The person's deadlines that count on the bell: a week away or less. */
const BELL_DAYS = 7

/**
 * How many pieces of news about the person's careers or subscribed topics, and of their deadlines a week away, they have not seen yet
 * (the dot on the bell).
 */
export function useUnseenNotifications(): number {
  const user = useUser()
  const { data: news = [] } = useNews()
  const deadlines = useDeadlines()
  const { mine, companies, subscribed } = useNewsForMe()
  const unseenNews = news.filter(
    (item) =>
      isNotification(item, mine, subscribed(item), companies) && isUnseen(item, user.notificationsSeenAt),
  )
  const unseenDeadlines = deadlines.mine.filter(
    (item) =>
      daysUntil(deadlines.today, item.date) <= BELL_DAYS && isDeadlineUnseen(item, user.notificationsSeenAt),
  )
  return unseenNews.length + unseenDeadlines.length
}
