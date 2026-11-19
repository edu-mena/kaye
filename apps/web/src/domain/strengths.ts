import {
  GROUP_AREAS,
  type CareerSummary,
  type CareerTraits,
  type CvEntry,
  type MarketArea,
  type Skill,
  type SkillLevel,
} from '../data/types'

// "As tuas valências", the second part of the career test (docs/decisoes/0017): what the person already
// knows and has done. Every step can be skipped. It never asks for religion, ethnicity, income, address,
// health or date of birth; minors give the same as everyone, and none of it leaves the device.

export const STRENGTH_STEPS = [
  'languages',
  'digital',
  'trades',
  'soft',
  'experience',
  'work',
  'conditions',
] as const
export type StrengthStep = (typeof STRENGTH_STEPS)[number]

/** Spoken in Angola or asked by employers; "other" takes a short name. */
export const LANGUAGES = ['pt', 'en', 'fr', 'es', 'kmb', 'umb', 'kg', 'cjk', 'ln', 'zh', 'other'] as const
export type LanguageId = (typeof LANGUAGES)[number]
export const LANGUAGE_LEVELS = ['basic', 'intermediate', 'fluent', 'native'] as const
export type LanguageLevel = (typeof LANGUAGE_LEVELS)[number]
type LanguageSkill = { id: LanguageId; level: LanguageLevel; name?: string }

export const DIGITAL_SKILLS = [
  'phone',
  'email',
  'word',
  'excel',
  'powerpoint',
  'social',
  'design',
  'coding',
] as const
type DigitalSkill = (typeof DIGITAL_SKILLS)[number]

export const SOFT_SKILLS = [
  'communication',
  'teamwork',
  'leadership',
  'organisation',
  'problemSolving',
  'customerService',
  'creativity',
] as const
type SoftSkill = (typeof SOFT_SKILLS)[number]
/** 1 still little, 2 fairly, 3 a strong point. */
export const SOFT_LEVELS = ['1', '2', '3'] as const
type SoftLevel = (typeof SOFT_LEVELS)[number]

export const EXPERIENCE_KINDS = ['work', 'volunteer', 'internship', 'course'] as const
export type ExperienceKind = (typeof EXPERIENCE_KINDS)[number]
export type Experience = { id: string; kind: ExperienceKind; what: string; where: string; when: string }
export const MAX_EXPERIENCE = 12
export const MAX_TEXT = 80

export const WORK_VALUES = ['help', 'create', 'income'] as const
type WorkValue = (typeof WORK_VALUES)[number]
export type WorkPrefs = {
  place: 'office' | 'field' | null
  company: 'alone' | 'team' | null
  security: 'stable' | 'risk' | null
  values: WorkValue[]
}

/** How far the person wants to study; a level, never an amount of money. */
export const STUDY_GOALS = ['short', 'technical', 'degree', 'unsure'] as const
export type StudyGoal = (typeof STUDY_GOALS)[number]
type Conditions = { study: StudyGoal | null; move: boolean | null; workNow: boolean | null }

export type Strengths = {
  languages: LanguageSkill[]
  digital: Partial<Record<DigitalSkill, SkillLevel>>
  soft: Partial<Record<SoftSkill, SoftLevel>>
  /** The soft skills the person chose to show on the CV; the others stay private. */
  softInCv: SoftSkill[]
  experience: Experience[]
  work: WorkPrefs
  conditions: Conditions
  /** The steps answered or skipped: part 2 is done when all are here. */
  done: StrengthStep[]
}

export const EMPTY_STRENGTHS: Strengths = {
  languages: [],
  digital: {},
  soft: {},
  softInCv: [],
  experience: [],
  work: { place: null, company: null, security: null, values: [] },
  conditions: { study: null, move: null, workNow: null },
  done: [],
}

/** Saved data from before a field existed gets it empty. */
export function withAllStrengths(saved: Partial<Strengths> | undefined): Strengths {
  return {
    ...EMPTY_STRENGTHS,
    ...saved,
    work: { ...EMPTY_STRENGTHS.work, ...saved?.work },
    conditions: { ...EMPTY_STRENGTHS.conditions, ...saved?.conditions },
  }
}

export const strengthsDone = (strengths: Strengths) =>
  STRENGTH_STEPS.every((step) => strengths.done.includes(step))

/** Anything said at all, so the result and the hub know there is something to show or erase. */
export const hasStrengths = (strengths: Strengths) =>
  strengths.done.length > 0 || JSON.stringify(strengths) !== JSON.stringify(EMPTY_STRENGTHS)

/** Seconds per answer, to say an honest time: a Likert answer, or a row of a step. */
export const SECONDS_PER_ANSWER = 10
/** A typical step of part 2 takes about this long. */
export const SECONDS_PER_STEP = 45

export const minutesFor = (seconds: number) => Math.max(1, Math.round(seconds / 60))

/** Where each kind of experience goes on a CV. */
const CV_FIELD: Record<ExperienceKind, 'experience' | 'projects' | 'certifications'> = {
  work: 'experience',
  internship: 'experience',
  volunteer: 'projects',
  course: 'certifications',
}

export type CvEntrySuggestion = {
  field: 'experience' | 'projects' | 'certifications'
  entry: Omit<CvEntry, 'id'>
}

/** What already happened, as CV entries: the person's own, then the Kursos with their certificate. */
export function experienceEntries(
  experience: Experience[],
  kursos: { title: string; certificate: string; year: string }[],
  certificateLabel: (code: string) => string,
): CvEntrySuggestion[] {
  return [
    ...experience.map((item) => ({
      field: CV_FIELD[item.kind],
      entry: { title: item.what, place: item.where, period: item.when, description: '' },
    })),
    ...kursos.map((kurso) => ({
      field: 'certifications' as const,
      entry: {
        title: kurso.title,
        place: 'Kayé',
        period: kurso.year,
        description: certificateLabel(kurso.certificate),
      },
    })),
  ]
}

/**
 * The skills the area's curated careers ask for, the most asked first (never new ones): what "ofícios e
 * competências técnicas" shows for that area.
 */
export function areaSkills(traits: CareerTraits[], careers: CareerSummary[], area: MarketArea): Skill[] {
  const inArea = new Set(
    careers.filter((career) => GROUP_AREAS[career.group] === area).map((career) => career.slug),
  )
  const counts = new Map<string, { skill: Skill; count: number }>()
  for (const career of traits) {
    if (!inArea.has(career.slug)) continue
    for (const skill of career.skills) {
      const seen = counts.get(skill.id)
      counts.set(skill.id, { skill, count: (seen?.count ?? 0) + (skill.importance === 'essencial' ? 2 : 1) })
    }
  }
  return [...counts.values()].toSorted((a, b) => b.count - a.count).map((item) => item.skill)
}

/** Said in the test that they need to work now or want to study little: "Sem universidade" is for them. */
export const wantsShortPath = (strengths: Strengths): boolean =>
  strengths.conditions.workNow === true ||
  strengths.conditions.study === 'short' ||
  strengths.conditions.study === 'technical'
