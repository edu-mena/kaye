import { useMemo } from 'react'
import { useCareers } from '../data/queries'
import type { NewsItem } from '../data/types'
import { isSubscribed, newsAreas } from '../domain/interests'
import { isAboutMe, myCareers } from '../domain/path'
import { useUser } from '../state/userStore'

/**
 * What decides which news is for the person: the areas of each piece (from its careers), whether it
 * is in their subscription and whether it is about their careers.
 */
export function useNewsForMe() {
  const { savedCareers, targetCareer, subscriptions } = useUser()
  const { data: careers } = useCareers()
  return useMemo(() => {
    const mine = myCareers({ savedCareers, targetCareer })
    const areasOf = (item: NewsItem) => newsAreas(item, careers ?? [])
    const subscribed = (item: NewsItem) => isSubscribed(item, areasOf(item), subscriptions)
    return {
      mine,
      subscriptions,
      areasOf,
      subscribed,
      forMe: (item: NewsItem) => subscribed(item) || isAboutMe(item, mine),
    }
  }, [savedCareers, targetCareer, subscriptions, careers])
}
