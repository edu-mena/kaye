import { useMemo } from 'react'
import { useAssessment } from '../data/queries'
import type { RiasecProfile } from '../data/types'
import { scoreAnswers } from '../domain/riasec'
import { useUser } from './userStore'

export type RiasecState = {
  /** Null until the test is finished. */
  profile: RiasecProfile | null
  answered: number
  total: number
  completed: boolean
}

/** The person's RIASEC profile, from the saved answers. Home, results and fit share it. */
export function useRiasecProfile(): RiasecState {
  const { answers, assessmentCompletedAt } = useUser()
  const { data: questions = [] } = useAssessment()

  return useMemo(() => {
    const answered = questions.filter((question) => answers[question.id] !== undefined).length
    const completed = assessmentCompletedAt !== null
    return {
      profile: completed ? scoreAnswers(questions, answers) : null,
      answered,
      total: questions.length,
      completed,
    }
  }, [questions, answers, assessmentCompletedAt])
}
