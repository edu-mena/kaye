import { useSyncExternalStore } from 'react'
import type { CvData, CvExample, EducationLevel, Likert, SkillLevel } from '../data/types'
import { newEntry } from '../domain/cv'

// What the person has done in the app. Until the API exists it lives only on this
// device (localStorage); later each action becomes a /api/v1 call (docs/decisoes/0005).

export type Profile = {
  name: string
  birthYear: number
  province: string
  education: EducationLevel
  guardianInformed: boolean
}

export type UserData = {
  version: 1
  profile: Profile | null
  answers: Record<string, Likert>
  assessmentCompletedAt: string | null
  skills: Record<string, SkillLevel>
  savedCareers: string[]
  visitedCareers: string[]
  targetCareer: string | null
  cv: CvData
  cvBasedOn: string | null
  compare: string[]
}

export const EMPTY_CV: CvData = {
  name: '',
  headline: '',
  contact: '',
  summary: '',
  experience: [],
  education: [],
  projects: [],
  skills: [],
  languages: [],
}

const INITIAL: UserData = {
  version: 1,
  profile: null,
  answers: {},
  assessmentCompletedAt: null,
  skills: {},
  savedCareers: [],
  visitedCareers: [],
  targetCareer: null,
  cv: EMPTY_CV,
  cvBasedOn: null,
  compare: [],
}

export const MAX_COMPARE = 3
const KEY = 'kaye.user.v1'
const listeners = new Set<() => void>()
let state: UserData = load()

function load(): UserData {
  try {
    const raw = localStorage.getItem(KEY)
    const saved = raw ? (JSON.parse(raw) as Partial<UserData>) : null
    return saved?.version === 1 ? { ...INITIAL, ...saved } : INITIAL
  } catch {
    // Blocked storage or a corrupted value: start fresh rather than break the app.
    return INITIAL
  }
}

function update(change: (current: UserData) => UserData) {
  state = change(state)
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    // Not critical: progress just won't survive a reload.
  }
  listeners.forEach((listener) => listener())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function getUser(): UserData {
  return state
}

export function useUser(): UserData {
  return useSyncExternalStore(subscribe, getUser)
}

/** Reloads from storage (tests, and after "apagar os meus dados"). */
export function reloadUser() {
  state = load()
  listeners.forEach((listener) => listener())
}

const toggle = (list: string[], item: string) =>
  list.includes(item) ? list.filter((entry) => entry !== item) : [...list, item]

export const userActions = {
  saveProfile: (profile: Profile) => update((user) => ({ ...user, profile })),

  answer: (questionId: string, value: Likert) =>
    update((user) => ({ ...user, answers: { ...user.answers, [questionId]: value } })),

  completeAssessment: () => update((user) => ({ ...user, assessmentCompletedAt: new Date().toISOString() })),

  restartAssessment: () => update((user) => ({ ...user, answers: {}, assessmentCompletedAt: null })),

  setSkill: (skillId: string, level: SkillLevel | null) =>
    update((user) => {
      const skills = { ...user.skills }
      if (level) skills[skillId] = level
      else delete skills[skillId]
      return { ...user, skills }
    }),

  toggleSaved: (slug: string) =>
    update((user) => ({ ...user, savedCareers: toggle(user.savedCareers, slug) })),

  visitCareer: (slug: string) =>
    update((user) =>
      user.visitedCareers.includes(slug) ? user : { ...user, visitedCareers: [...user.visitedCareers, slug] },
    ),

  setTarget: (slug: string | null) => update((user) => ({ ...user, targetCareer: slug })),

  updateCv: (cv: CvData) => update((user) => ({ ...user, cv })),

  /** Copies the structure of a model CV, never its data (docs/arquitetura.md, 5.5). */
  startCvFrom: (example: CvExample) =>
    update((user) => ({
      ...user,
      cvBasedOn: example.id,
      cv: {
        ...EMPTY_CV,
        name: user.profile?.name ?? '',
        experience: example.cv.experience.map(newEntry),
        education: example.cv.education.map(newEntry),
        projects: example.cv.projects.map(newEntry),
      },
    })),

  toggleCompare: (programId: string) =>
    update((user) => {
      if (user.compare.includes(programId)) return { ...user, compare: toggle(user.compare, programId) }
      return user.compare.length >= MAX_COMPARE ? user : { ...user, compare: [...user.compare, programId] }
    }),

  /** "Apagar os meus dados": everything the app keeps about the person. */
  eraseAll: () => {
    try {
      localStorage.removeItem(KEY)
    } catch {
      // Nothing stored, nothing to erase.
    }
    reloadUser()
  },
}
