import { useNews } from '../data/queries'
import { daysUntil, isDeadlineUnseen } from '../domain/deadlines'
import { isNotification, isUnseen, myCareers } from '../domain/path'
import { useDeadlines } from './useDeadlines'
import { useUser } from './userStore'

/** The person's deadlines that count on the bell: a week away or less. */
const BELL_DAYS = 7

/**
 * How many pieces of news about the person's careers, and of their deadlines a week away, they have not seen yet
 * (the dot on the bell).
 */
export function useUnseenNotifications(): number {
  const user = useUser()
  const { data: news = [] } = useNews()
  const deadlines = useDeadlines()
  const mine = myCareers(user)
  const unseenNews = news.filter(
    (item) => isNotification(item, mine) && isUnseen(item, user.notificationsSeenAt),
  )
  const unseenDeadlines = deadlines.mine.filter(
    (item) =>
      daysUntil(deadlines.today, item.date) <= BELL_DAYS && isDeadlineUnseen(item, user.notificationsSeenAt),
  )
  return unseenNews.length + unseenDeadlines.length
}
