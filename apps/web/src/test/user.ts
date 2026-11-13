import { EMPTY_STRENGTHS } from '../domain/strengths'
import { QUESTIONS } from '../data/demo/assessment'
import type { CvData, CvDocument, Likert, RiasecKey } from '../data/types'
import { EMPTY_CV, reloadUser, type Profile, type UserData } from '../state/userStore'

const PROFILE: Profile = {
  name: 'Joana',
  birthYear: 2007,
  province: 'Luanda',
  education: 'medio_tecnico',
  guardianInformed: false,
}

/** Every question answered with one value per dimension (default gives code IAC). */
export function answersFor(
  values: Record<RiasecKey, Likert> = { R: 2, I: 5, A: 4, S: 3, E: 2, C: 4 },
): Record<string, Likert> {
  return Object.fromEntries(QUESTIONS.map((question) => [question.id, values[question.dimension]]))
}

/** Puts a user in storage and reloads the store, as if the app had just opened. */
export function seedUser(change: Partial<UserData> = {}) {
  const user: UserData = {
    version: 1,
    profile: PROFILE,
    discovery: null,
    answers: {},
    assessmentCompletedAt: null,
    skills: {},
    savedCareers: [],
    savedAcademies: [],
    savedCompanies: [],
    remindedDeadlines: [],
    visitedCareers: [],
    targetCareer: null,
    cvs: [],
    activeCvId: null,
    publicPage: null,
    compare: [],
    history: [],
    searches: [],
    photo: null,
    cover: null,
    notificationsSeenAt: null,
    psychotech: [],
    interviews: [],
    subscriptions: null,
    kursos: {},
    strengths: EMPTY_STRENGTHS,
    plan: null,
    ...change,
  }
  localStorage.setItem('kaye.user.v1', JSON.stringify(user))
  reloadUser()
  return user
}

/** A user who finished the test. */
export function seedTested(change: Partial<UserData> = {}) {
  return seedUser({ answers: answersFor(), assessmentCompletedAt: '2026-10-23T10:00:00.000Z', ...change })
}

/** One saved CV, as the store keeps it. */
export function savedCv(cv: Partial<CvData>, basedOn: string | null = null): CvDocument {
  return { id: 'cv-1', title: '', cv: { ...EMPTY_CV, ...cv }, template: 'classico', style: {}, basedOn }
}
