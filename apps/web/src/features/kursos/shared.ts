import { useEffect, useState } from 'react'
import { useParams } from 'react-router'
import { courseSteps, findCourse, stepKey, type Step } from '../../data/kursos'
import type { Course, Unit, UnitContent } from '../../data/kursos/types'
import { EMPTY_KURSO, userActions, useUser, type KursoProgress } from '../../state/userStore'

export function useCourse(): { course: Course | undefined; progress: KursoProgress } {
  const { curso } = useParams()
  const course = findCourse(curso)
  const { kursos } = useUser()
  return { course, progress: (course && kursos[course.id]) || EMPTY_KURSO }
}

export const stepHref = (course: Course, step: Step) => `/kursos/${course.id}/${step.unit}/${step.lesson}`

/** Where "Começar/Continuar" goes: the last step opened, else the first one not done. */
export function resumeStep(course: Course, progress: KursoProgress): Step | undefined {
  const steps = courseSteps(course)
  return (
    steps.find((step) => stepKey(step) === progress.position && !progress.done.includes(stepKey(step))) ??
    steps.find((step) => !progress.done.includes(stepKey(step))) ??
    steps[0]
  )
}

export const totalMinutes = (course: Course) =>
  course.units.reduce(
    (sum, unit) => sum + (unit.lessons ?? []).reduce((part, lesson) => part + lesson.estimatedMinutes, 0),
    0,
  )

/** Downloads a unit's text the first time it is opened. */
export function useUnitContent(unit: Unit | undefined): UnitContent | null {
  const [content, setContent] = useState<{ unit: Unit; content: UnitContent } | null>(null)
  useEffect(() => {
    let alive = true
    const load = async () => {
      if (!unit?.load) return
      const loaded = await unit.load()
      if (alive) setContent({ unit, content: loaded })
    }
    void load()
    return () => {
      alive = false
    }
  }, [unit])
  return content && content.unit === unit ? content.content : null
}

const TICK = 15
const IDLE_MS = 2 * 60 * 1000

/** Counts study time: only while the page is visible and was used in the last 2 minutes. */
export function useActiveTime(courseId: string | undefined) {
  useEffect(() => {
    if (!courseId) return
    let last = Date.now()
    const touch = () => {
      last = Date.now()
    }
    const events = ['pointerdown', 'keydown', 'scroll', 'touchstart'] as const
    events.forEach((name) => window.addEventListener(name, touch, { passive: true }))
    const timer = window.setInterval(() => {
      if (document.visibilityState === 'visible' && Date.now() - last < IDLE_MS)
        userActions.addKursoTime(courseId, TICK)
    }, TICK * 1000)
    return () => {
      window.clearInterval(timer)
      events.forEach((name) => window.removeEventListener(name, touch))
    }
  }, [courseId])
}

export const percent = (share: number) => Math.round(share * 100)
