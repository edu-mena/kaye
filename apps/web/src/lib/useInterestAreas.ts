import type { MarketArea } from '../data/types'
import { useInterestProfile } from './useInterestFilter'

/** The person's areas, most interesting first (domain/interests.ts); empty before they chose or saved anything. */
export function useInterestAreas(): readonly MarketArea[] {
  return useInterestProfile().areas
}
