import type { Career, EducationLevel, RiasecKey, RiasecProfile, Skill, SkillLevel } from '../data/types'
import { quickestPathway, type Remaining } from './education'
import { compatibility, sharedStrength } from './riasec'

export type InterestLevel = 'alto' | 'medio' | 'baixo'

export function interestLevel(score: number): InterestLevel {
  if (score >= 0.75) return 'alto'
  return score >= 0.55 ? 'medio' : 'baixo'
}

export type Fit = {
  /** Null without the test. */
  interests: { level: InterestLevel; compatibility: number; strength: RiasecKey } | null
  /** Null without an education level. */
  education: (Remaining & { pathwayName: string }) | null
  skills: { have: number; total: number; missing: Skill[] }
}

type FitInput = {
  profile: RiasecProfile | null
  education: EducationLevel | null
  skills: Record<string, SkillLevel>
}

/**
 * "O meu encaixe" in three parts, never one magic number
 * (docs/arquitetura.md, 5.4). Only essential skills count.
 */
export function careerFit(career: Career, { profile, education, skills }: FitInput): Fit {
  const score = profile ? compatibility(profile, career.riasec) : null
  const quickest = education ? quickestPathway(career, education) : null
  const essential = career.skills.filter((skill) => skill.importance === 'essencial')
  const known = (skill: Skill) => skills[skill.id] === 'sei' || skills[skill.id] === 'domino'

  return {
    interests:
      profile && score !== null
        ? {
            level: interestLevel(score),
            compatibility: score,
            strength: sharedStrength(profile, career.riasec),
          }
        : null,
    education: quickest
      ? { pathwayName: quickest.pathway.name, steps: quickest.steps, months: quickest.months }
      : null,
    skills: {
      have: essential.filter(known).length,
      total: essential.length,
      missing: essential.filter((skill) => !known(skill)),
    },
  }
}
