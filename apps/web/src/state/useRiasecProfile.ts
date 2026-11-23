import { useMemo } from 'react'
import { useAssessment } from '../data/queries'
import type { RiasecProfile } from '../data/types'
import { isAnswered, scoreAnswers } from '../domain/riasec'
import { useUser } from './userStore'

export type RiasecState = {
  /** Null until the test is finished. */
  profile: RiasecProfile | null
  answered: number
  total: number
  completed: boolean
}

/**
 * The person's RIASEC profile, from the saved answers. Home, results and fit share it. A test finished before the
 * situation questions existed is not complete any more: it asks for them (ADR 0017).
 */
export function useRiasecProfile(): RiasecState {
  const { answers, choices, assessmentCompletedAt } = useUser()
  const { data: questions = [] } = useAssessment()

  return useMemo(() => {
    const answered = questions.filter((question) => isAnswered(question, answers, choices)).length
    // While the questions are still loading nothing is known yet: a finished test stays finished.
    const completed = assessmentCompletedAt !== null && answered === questions.length
    return {
      profile: completed ? scoreAnswers(questions, answers, choices) : null,
      answered,
      total: questions.length,
      completed,
    }
  }, [questions, answers, choices, assessmentCompletedAt])
}
