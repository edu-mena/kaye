import { useNews } from '../data/queries'
import { isAboutMe, isUnseen, myCareers } from '../domain/path'
import { useUser } from './userStore'

/** How many pieces of news about the person's careers they have not seen yet (the dot on the bell). */
export function useUnseenNotifications(): number {
  const user = useUser()
  const { data: news = [] } = useNews()
  const mine = myCareers(user)
  return news.filter((item) => isAboutMe(item, mine) && isUnseen(item, user.notificationsSeenAt)).length
}
