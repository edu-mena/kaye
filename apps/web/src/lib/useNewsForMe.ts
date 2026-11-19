import { useMemo } from 'react'
import { useCareers } from '../data/queries'
import type { NewsItem } from '../data/types'
import { isSubscribed, newsAreas } from '../domain/interests'
import { isAboutMe, myCareers } from '../domain/path'
import { useUser } from '../state/userStore'

/**
 * What decides which news is for the person: the areas of each piece (from its careers), whether it
 * is in their subscription and whether it is about their careers or saved companies.
 */
export function useNewsForMe() {
  const { savedCareers, savedCompanies, targetCareer, subscriptions } = useUser()
  const { data: careers } = useCareers()
  return useMemo(() => {
    const mine = myCareers({ savedCareers, targetCareer })
    const companies = new Set(savedCompanies)
    const areasOf = (item: NewsItem) => newsAreas(item, careers ?? [])
    const subscribed = (item: NewsItem) => isSubscribed(item, areasOf(item), subscriptions)
    return {
      mine,
      companies,
      subscriptions,
      areasOf,
      subscribed,
      forMe: (item: NewsItem) => subscribed(item) || isAboutMe(item, mine, companies),
    }
  }, [savedCareers, savedCompanies, targetCareer, subscriptions, careers])
}
