import { useCallback, useMemo } from 'react'
import { useCareers } from '../data/queries'
import { onlyRelevant, hasProfile, type InterestProfile, type Subject } from '../domain/relevance'
import { interestAreas } from '../domain/interests'
import { myCareers } from '../domain/path'
import { useUser } from '../state/userStore'
import { usePersistentFlag } from './usePersistentFlag'
import { useRecommendations } from './useRecommendations'

/**
 * The person's interest profile: the areas they chose, the areas and careers of what they saved and of their test
 * result, and the companies they saved.
 */
export function useInterestProfile(): InterestProfile {
  const user = useUser()
  const { data: careers } = useCareers()
  const recommendations = useRecommendations()
  return useMemo(() => {
    const recommended = (recommendations ?? []).map((item) => item.career)
    return {
      areas: interestAreas(user, careers ?? [], recommended),
      careers: new Set([...myCareers(user), ...recommended.map((career) => career.slug)]),
      companies: new Set(user.savedCompanies),
    }
  }, [user, careers, recommendations])
}

/**
 * One list's filter: by default it keeps what has to do with the person; "Ver outras áreas" turns it off for this
 * list only, and the choice is remembered on this device for that list.
 */
export function useInterestFilter(listId: string) {
  const profile = useInterestProfile()
  const [others, setOthers] = usePersistentFlag(`kaye.others.${listId}`, false)
  const active = hasProfile(profile)
  const filtering = active && !others
  const apply = useCallback(
    <T>(items: readonly T[], subjectOf: (item: T) => Subject) =>
      filtering ? onlyRelevant(items, subjectOf, profile) : { items: [...items], hidden: 0 },
    [filtering, profile],
  )
  return { profile, active, others, setOthers, apply }
}

export type InterestFilter = ReturnType<typeof useInterestFilter>
