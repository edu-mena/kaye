import { minutesFor, SECONDS_PER_ANSWER, SECONDS_PER_STEP, STRENGTH_STEPS } from '../domain/strengths'
import { useRiasecProfile } from './useRiasecProfile'
import { useUser } from './userStore'

/** Where the person is in each part, and how long is really left: from the questions and steps still open. */
export function useTestProgress() {
  const { answered, total, completed } = useRiasecProfile()
  const { strengths } = useUser()
  const stepsDone = STRENGTH_STEPS.filter((step) => strengths.done.includes(step)).length
  const stepsTotal = STRENGTH_STEPS.length
  const left1 = completed ? 0 : (total - answered) * SECONDS_PER_ANSWER
  const left2 = (stepsTotal - stepsDone) * SECONDS_PER_STEP
  return {
    answered,
    total,
    completed,
    stepsDone,
    stepsTotal,
    strengthsDone: stepsDone === stepsTotal,
    minutes1: minutesFor(total * SECONDS_PER_ANSWER),
    minutes2: minutesFor(stepsTotal * SECONDS_PER_STEP),
    /** Minutes left in both parts; zero when everything is done. */
    left: left1 + left2 === 0 ? 0 : minutesFor(left1 + left2),
  }
}
