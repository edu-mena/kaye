import type { CvData } from '../data/types'
import { cvCompleteness } from './cv'

/** The part of the person's data that earns points; the saved user data fits it. */
type Progress = {
  profile: object | null
  assessmentCompletedAt: string | null
  visitedCareers: string[]
  targetCareer: string | null
  skills: Record<string, unknown>
  cv: CvData
}

// Points only for useful actions (docs/roadmap.md, 1.8). Server-side ledger later.
const RULES = [
  { id: 'perfil', xp: 50, earned: (user: Progress) => user.profile !== null },
  { id: 'teste', xp: 200, earned: (user: Progress) => user.assessmentCompletedAt !== null },
  { id: 'explorador', xp: 50, earned: (user: Progress) => user.visitedCareers.length >= 3 },
  { id: 'destino', xp: 50, earned: (user: Progress) => user.targetCareer !== null },
  { id: 'competencias', xp: 50, earned: (user: Progress) => Object.keys(user.skills).length >= 5 },
  { id: 'cv', xp: 100, earned: (user: Progress) => cvCompleteness(user.cv) === 1 },
] as const

type AchievementId = (typeof RULES)[number]['id']
export type Achievement = { id: AchievementId; xp: number; earned: boolean }

export function achievements(user: Progress): Achievement[] {
  return RULES.map((rule) => ({ id: rule.id, xp: rule.xp, earned: rule.earned(user) }))
}

export function totalXp(list: Achievement[]): number {
  return list.reduce((sum, achievement) => sum + (achievement.earned ? achievement.xp : 0), 0)
}
