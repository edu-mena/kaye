import { useMemo } from 'react'
import { useCareers } from '../data/queries'
import type { MarketArea } from '../data/types'
import { interestAreas } from '../domain/interests'
import { useUser } from '../state/userStore'
import { useRecommendations } from './useRecommendations'

/** The person's areas, most interesting first (domain/interests.ts); empty before onboarding. */
export function useInterestAreas(): MarketArea[] {
  const user = useUser()
  const { data: careers } = useCareers()
  const recommendations = useRecommendations()
  return useMemo(
    () =>
      interestAreas(
        user,
        careers ?? [],
        (recommendations ?? []).map((item) => item.career),
      ),
    [user, careers, recommendations],
  )
}
