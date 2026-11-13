import { useMemo } from 'react'
import {
  useAdmissions,
  useCareer,
  useCourses,
  useFreeCourses,
  useInternships,
  useScholarships,
} from '../data/queries'
import type { Career, Pathway } from '../data/types'
import { buildPlan, evidenceOf, type PlanStep, stepStatus, type StepStatus } from '../domain/plan'
import { todayIso } from '../domain/scholarships'
import { type Plan, useUser } from './userStore'

export type PlanItem = { step: PlanStep; status: StepStatus; auto: boolean }

export type PlanView = {
  plan: Plan
  career: Career
  pathway: Pathway
  items: PlanItem[]
  done: number
  today: string
}

/** The person's plan, rebuilt from the catalogue on this device; null without a plan or while it loads. */
export function usePlan(): { view: PlanView | null; loading: boolean } {
  const user = useUser()
  const plan = user.plan
  const career = useCareer(plan?.career ?? '')
  const courses = useCourses()
  const admissions = useAdmissions()
  const scholarships = useScholarships()
  const internships = useInternships()
  const freeCourses = useFreeCourses(plan?.career)
  const today = todayIso()

  const view = useMemo((): PlanView | null => {
    if (!plan || !career.data) return null
    const pathway = career.data.pathways.find((item) => item.id === plan.pathway) ?? career.data.pathways[0]
    if (!pathway) return null
    const steps = buildPlan(
      career.data,
      pathway,
      {
        education: user.profile?.education ?? null,
        province: user.profile?.province ?? null,
        skills: user.skills,
        since: plan.startedAt,
      },
      {
        courses: courses.data ?? [],
        admissions: admissions.data ?? [],
        scholarships: scholarships.data ?? [],
        internships: internships.data ?? [],
        freeCourses: freeCourses.data ?? [],
      },
      today,
    )
    const evidence = evidenceOf(user, plan)
    const items = steps.map((step) => {
      const status = stepStatus(step, evidence, today)
      return { step, status, auto: status === 'done' && !plan.done.includes(step.id) }
    })
    return {
      plan,
      career: career.data,
      pathway,
      items,
      done: items.filter((item) => item.status === 'done').length,
      today,
    }
  }, [
    plan,
    user,
    career.data,
    courses.data,
    admissions.data,
    scholarships.data,
    internships.data,
    freeCourses.data,
    today,
  ])

  return { view, loading: plan !== null && career.isPending }
}
