import { useMemo } from 'react'
import { useCareers } from '../data/queries'
import type { NewsItem } from '../data/types'
import { isSubscribed, newsAreas } from '../domain/interests'
import { isAboutMe, myCareers } from '../domain/path'
import { isRelevant } from '../domain/relevance'
import { useUser } from '../state/userStore'
import { useInterestProfile } from './useInterestFilter'

/**
 * What decides which news is for the person: the areas of each piece (from its careers), whether it
 * is in their subscription and whether it is about their careers or saved companies.
 */
export function useNewsForMe() {
  const { savedCareers, savedCompanies, targetCareer, subscriptions } = useUser()
  const { data: careers } = useCareers()
  const profile = useInterestProfile()
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
      /** What has to do with the person's areas, careers or companies: the home page hides the rest. */
      relevant: (item: NewsItem) =>
        subscribed(item) ||
        isAboutMe(item, mine, companies) ||
        isRelevant(profile, {
          areas: areasOf(item),
          careers: item.careers ?? [],
          companies: item.companies ?? [],
        }),
    }
  }, [savedCareers, savedCompanies, targetCareer, subscriptions, careers, profile])
}
