import { isMinor } from '../domain/education'
import { useUser } from './userStore'

/**
 * Minors (14–17) see no salary anywhere in the app: not on cards, career pages, courses, the
 * interview practice or the family link (docs/seguranca.md). Without a birth year we cannot
 * know, so it counts as a minor.
 */
export function useShowsSalaries(): boolean {
  const { profile } = useUser()
  return profile ? !isMinor(profile.birthYear) : false
}
