import { useAcademies, useAdmissions, useCareers, useInternships, useScholarships } from '../data/queries'
import { type DeadlineItem, mine, myAreas, upcomingDeadlines } from '../domain/deadlines'
import { myCareers } from '../domain/path'
import { todayIso } from '../domain/scholarships'
import { usePlan } from './usePlan'
import { useUser } from './userStore'

/** Every upcoming deadline and the person's ones, read from the local state only (nothing leaves the phone). */
export function useDeadlines(): {
  all: DeadlineItem[]
  mine: DeadlineItem[]
  today: string
  loading: boolean
} {
  const user = useUser()
  const scholarships = useScholarships()
  const admissions = useAdmissions()
  const internships = useInternships()
  const academies = useAcademies()
  const { data: careers = [] } = useCareers()
  const today = todayIso()
  const all = upcomingDeadlines(
    {
      scholarships: scholarships.data ?? [],
      admissions: admissions.data ?? [],
      internships: internships.data ?? [],
      academies: academies.data ?? [],
    },
    today,
  )
  const slugs = myCareers(user)
  // The dates of the person's plan still to do are theirs too, whatever their area (the plan's reminder).
  const { view } = usePlan()
  const planned = new Set(
    view?.items.flatMap((item) =>
      item.status === 'todo' && item.step.deadlineId ? [item.step.deadlineId] : [],
    ),
  )
  const reminded = new Set(user.remindedDeadlines)
  const theirs = new Set(mine(all, { areas: myAreas(careers, slugs), careers: slugs }))
  return {
    all,
    mine: all.filter((item) => theirs.has(item) || planned.has(item.id) || reminded.has(item.id)),
    today,
    loading: scholarships.isPending || admissions.isPending || internships.isPending || academies.isPending,
  }
}
