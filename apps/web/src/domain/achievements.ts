import type { CvData } from '../data/types'
import { bestCvCompleteness } from './cv'

/** The part of the person's data that earns points; the saved user data fits it. */
type Progress = {
  profile: object | null
  assessmentCompletedAt: string | null
  visitedCareers: string[]
  targetCareer: string | null
  skills: Record<string, unknown>
  cvs: { cv: CvData }[]
  kursos?: Record<string, { done: string[]; completedAt?: string }>
}

const kursos = (user: Progress) => Object.values(user.kursos ?? {})

// Points only for useful actions (docs/roadmap.md, 1.8). Server-side ledger later.
const RULES = [
  { id: 'perfil', xp: 50, earned: (user: Progress) => user.profile !== null },
  { id: 'teste', xp: 200, earned: (user: Progress) => user.assessmentCompletedAt !== null },
  { id: 'explorador', xp: 50, earned: (user: Progress) => user.visitedCareers.length >= 3 },
  { id: 'destino', xp: 50, earned: (user: Progress) => user.targetCareer !== null },
  { id: 'competencias', xp: 50, earned: (user: Progress) => Object.keys(user.skills).length >= 5 },
  { id: 'cv', xp: 100, earned: (user: Progress) => bestCvCompleteness(user.cvs) === 1 },
  { id: 'licao', xp: 20, earned: (user: Progress) => kursos(user).some((course) => course.done.length > 0) },
  { id: 'kurso', xp: 150, earned: (user: Progress) => kursos(user).some((course) => course.completedAt) },
] as const

type AchievementId = (typeof RULES)[number]['id']
export type Achievement = { id: AchievementId; xp: number; earned: boolean }

export function achievements(user: Progress): Achievement[] {
  return RULES.map((rule) => ({ id: rule.id, xp: rule.xp, earned: rule.earned(user) }))
}

/** The challenge of the day: answering earns for the habit, being right earns a little more. */
export const DAILY_XP = 20
export const DAILY_XP_CORRECT = 10

const dailyXp = (daily: Record<string, { correct: boolean }> = {}): number =>
  Object.values(daily).reduce((sum, day) => sum + DAILY_XP + (day.correct ? DAILY_XP_CORRECT : 0), 0)

/** The points of the achievements earned, plus those of the daily challenges answered (`daily`). */
export function totalXp(list: Achievement[], daily?: Record<string, { correct: boolean }>): number {
  return list.reduce((sum, achievement) => sum + (achievement.earned ? achievement.xp : 0), dailyXp(daily))
}
