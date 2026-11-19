import { MENTORS } from '../../data/demo/mentors'
import type { Mentor } from '../../data/types'
import { isMinor } from '../../domain/education'
import { useUser } from '../../state/userStore'

/** Without a birth year we cannot know, so it counts as a minor (as for salaries). */
export function useMinor(): boolean {
  const { profile } = useUser()
  return profile ? isMinor(profile.birthYear) : true
}

/** The mentors this person may see: minors only the ones who take groups (docs/mentores.md). */
export function useVisibleMentors(): Mentor[] {
  const minor = useMinor()
  return MENTORS.filter((mentor) => !minor || mentor.availability === 'grupo')
}
