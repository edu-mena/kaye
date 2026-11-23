import { useSyncExternalStore } from 'react'
import { CV_EXAMPLES } from '../data/demo/cvExamples'
import { deletePublicCard } from '../data/source'
import type {
  CardModel,
  CardStyle,
  CvCard,
  CvData,
  CvDocument,
  CvEntry,
  CvExample,
  CvStyle,
  CvTarget,
  CvTemplate,
  EducationLevel,
  Likert,
  MarketArea,
  PublicCard,
  RiasecKey,
  SkillLevel,
  Subscriptions,
} from '../data/types'
import { NEWS_KINDS } from '../data/types'
import { newEntry, newId } from '../domain/cv'
import type { Discovery } from '../domain/discovery'
import { EMPTY_STRENGTHS, withAllStrengths, type Strengths, type StrengthStep } from '../domain/strengths'
import type { Level, Mode, Scores } from '../domain/psychotech'
import type { ExamMode, TopicScores } from '../domain/accessExams'
import type { ExamSubject } from '../data/demo/accessExams'

// What the person has done in the app. Until the API exists it lives only on this
// device (localStorage); later each action becomes a /api/v1 call (docs/decisoes/0005).

export type Profile = {
  name: string
  birthYear: number
  province: string
  education: EducationLevel
  guardianInformed: boolean
}

/** One step in the person's history ("Percurso"); `ref` names the career, course or CV model. */
export type HistoryEvent = {
  type: 'profile' | 'profileEdit' | 'test' | 'visit' | 'saved' | 'target' | 'cv' | 'compare'
  at: string
  ref?: string
}

/** One finished psychotechnical session: only the scores, never the answers. */
export type PsychotechResult = { at: string; mode: Mode; level: Level; scores: Scores }

/** One access-exam session (Exames de acesso): only the grades per topic, never the answers. */
export type AccessExamResult = { at: string; subject: ExamSubject; mode: ExamMode; topics: TopicScores }

/** One interview sent for review: only when and which area; the answers live with the Kayé team. */
export type InterviewResult = { at: string; area: MarketArea; questions: number; career?: string }

/** One try at a course's final exam: the grade and the grade per unit, never the answers. */
export type KursoExamAttempt = { at: string; score: number; units: Record<string, number> }

/** Progress in one Kurso (docs/decisoes/0016): kept on this device only. */
export type KursoProgress = {
  /** Finished steps, as "unit/lesson" ("u1/revisao" for a unit's review). */
  done: string[]
  /** Grade of each unit's review, 0 to 1. */
  scores: Record<string, number>
  /** The last step opened, for "Continuar". */
  position: string | null
  /** Active study time: page visible and used in the last 2 minutes. */
  seconds: number
  /** Newest first. */
  exam: KursoExamAttempt[]
  completedAt?: string
  certificate?: string
}

export const EMPTY_KURSO: KursoProgress = { done: [], scores: {}, position: null, seconds: 0, exam: [] }

/** "O meu plano": the career and path the person follows, and the steps they ticked (domain/plan.ts). */
export type Plan = { career: string; pathway: string; done: string[]; startedAt: string }

export type PublicPage = { slug: string; secret: string; card: PublicCard }

export type UserData = {
  version: 1
  profile: Profile | null
  /** What the person told the guide on their first visit. */
  discovery: Discovery | null
  /**
   * The areas the person wants to see (domain/relevance.ts): null before they were asked, [] when they
   * skipped ("Saltar": everything shows), otherwise their choice, edited in Definições.
   */
  interestAreas: MarketArea[] | null
  /** The statements of the test, 1–5, by question id. */
  answers: Record<string, Likert>
  /** The card picked in each situation of the test (ADR 0017): the interest it points to, by question id. */
  choices: Record<string, RiasecKey>
  assessmentCompletedAt: string | null
  skills: Record<string, SkillLevel>
  savedCareers: string[]
  /** Academies saved with the bookmark, by id. */
  savedAcademies: string[]
  /** Companies saved with the bookmark, by id: their news counts as "Para ti". */
  savedCompanies: string[]
  /** Deadlines starred with "Lembrar-me", by DeadlineItem id: they join "Só para mim" and the notifications. */
  remindedDeadlines: string[]
  visitedCareers: string[]
  targetCareer: string | null
  /** All the person's CVs; `activeCvId` is the one open in the editor. */
  cvs: CvDocument[]
  activeCvId: string | null
  /** The person's public page, while on; `secret` is what lets this device change or delete it. */
  publicPage: PublicPage | null
  compare: string[]
  /** Newest first, at most MAX_HISTORY. */
  history: HistoryEvent[]
  /** What the person searched for and opened (Pesquisa), newest first, at most MAX_SEARCHES. */
  searches: string[]
  /** Profile photo and cover, as small JPEG data URLs (they never leave the device). */
  photo: string | null
  cover: string | null
  /** When the notifications were last opened (ISO), so the bell knows what is new. */
  notificationsSeenAt: string | null
  /** Psychotechnical practice, newest first, at most MAX_PSYCHOTECH. */
  psychotech: PsychotechResult[]
  /** Access-exam practice, newest first, at most MAX_ACCESS_EXAMS. */
  accessExams: AccessExamResult[]
  /** Interview practice, newest first, at most MAX_INTERVIEWS. */
  interviews: InterviewResult[]
  /** The topics followed on Novidades; filled at the end of onboarding, null before. */
  subscriptions: Subscriptions | null
  /** Kursos progress, by course id. */
  kursos: Record<string, KursoProgress>
  /** Part 2 of the career test: languages, skills, experience, how and where they want to work. */
  strengths: Strengths
  plan: Plan | null
}

export const EMPTY_CV: CvData = {
  name: '',
  headline: '',
  contact: '',
  links: [],
  summary: '',
  experience: [],
  education: [],
  projects: [],
  certifications: [],
  skills: [],
  languages: [],
}

const INITIAL: UserData = {
  version: 1,
  profile: null,
  discovery: null,
  interestAreas: null,
  answers: {},
  choices: {},
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
  accessExams: [],
  interviews: [],
  subscriptions: null,
  kursos: {},
  strengths: EMPTY_STRENGTHS,
  plan: null,
}

export const MAX_COMPARE = 3
export const MAX_HISTORY = 100
export const MAX_SEARCHES = 6
const MAX_PSYCHOTECH = 30
const MAX_INTERVIEWS = 30
const MAX_ACCESS_EXAMS = 60
const KEY = 'kaye.user.v1'
const listeners = new Set<() => void>()
let state: UserData = load()

/** What devices saved when a person had a single CV. */
type LegacyCv = { cv?: Partial<CvData>; cvBasedOn?: string | null }

/** A device with the old single CV gets it as the first of the list, with the layout it had. */
function migrateCvs({ cv, cvBasedOn = null }: LegacyCv): CvDocument[] {
  const content = { ...EMPTY_CV, ...cv }
  if (!cvBasedOn && JSON.stringify(content) === JSON.stringify(EMPTY_CV)) return []
  const template = CV_EXAMPLES.find((example) => example.id === cvBasedOn)?.template ?? 'classico'
  return [{ id: newId(), title: '', cv: content, template, style: {}, basedOn: cvBasedOn }]
}

/** A function declaration, not a const: load() runs at import time, above this line. */
function withAllFields(document: CvDocument): CvDocument {
  return { ...document, cv: { ...EMPTY_CV, ...document.cv } }
}

function load(): UserData {
  try {
    const raw = localStorage.getItem(KEY)
    return fromSaved(raw ? (JSON.parse(raw) as Partial<UserData> & LegacyCv) : null)
  } catch {
    // Blocked storage or a corrupted value: start fresh rather than break the app.
    return INITIAL
  }
}

/** Saved data (this device's, or the account's) with every field the app expects today. */
function fromSaved(saved: (Partial<UserData> & LegacyCv) | null): UserData {
  if (saved?.version !== 1) return INITIAL
  const { cv, cvBasedOn, ...rest } = saved
  // CVs saved before a field existed get it empty, so old data keeps working.
  const cvs = (saved.cvs ?? migrateCvs({ cv, cvBasedOn })).map(withAllFields)
  return {
    ...INITIAL,
    ...rest,
    cvs,
    activeCvId: saved.activeCvId ?? cvs[0]?.id ?? null,
    strengths: withAllStrengths(saved.strengths),
    // Devices from before academies could be saved have none.
    savedAcademies: saved.savedAcademies ?? [],
    savedCompanies: saved.savedCompanies ?? [],
    // Devices from before "O meu plano" have none.
    plan: saved.plan ?? null,
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

/** Calls `listener` after every change (the account sync sends them to the server). */
export const subscribeUser = subscribe

/** What goes to the account: everything except the photo and the cover, which never leave the device. */
export function toAccount(user: UserData): Omit<UserData, 'photo' | 'cover'> {
  const { photo: _photo, cover: _cover, ...rest } = user
  return rest
}

/**
 * The account's copy replaces this device's (after a merge or another device's write). The photo and
 * the cover stay; the lists the app caps are cut to their size, since a merge joins two of them.
 */
export function replaceUser(data: Partial<UserData>) {
  // A copy from another version of the app is not understood: this device keeps its own.
  if (data.version !== 1) return
  update((current) => {
    const next = fromSaved(data)
    return {
      ...next,
      photo: current.photo,
      cover: current.cover,
      compare: next.compare.slice(0, MAX_COMPARE),
      history: next.history.slice(0, MAX_HISTORY),
      searches: next.searches.slice(0, MAX_SEARCHES),
      psychotech: next.psychotech.slice(0, MAX_PSYCHOTECH),
      accessExams: next.accessExams.slice(0, MAX_ACCESS_EXAMS),
      interviews: next.interviews.slice(0, MAX_INTERVIEWS),
    }
  })
}

/** Reloads from storage (tests, and after "apagar os meus dados"). */
export function reloadUser() {
  state = load()
  listeners.forEach((listener) => listener())
}

const toggle = (list: string[], item: string) =>
  list.includes(item) ? list.filter((entry) => entry !== item) : [...list, item]

/** The user with one more step in their history (removals and repeats are not steps). */
function logged(user: UserData, type: HistoryEvent['type'], ref?: string): UserData {
  const event: HistoryEvent = { type, at: new Date().toISOString(), ...(ref ? { ref } : {}) }
  return { ...user, history: [event, ...user.history].slice(0, MAX_HISTORY) }
}

/** The CV open in the editor. */
export function activeCv(user: UserData): CvDocument | null {
  return user.cvs.find((document) => document.id === user.activeCvId) ?? user.cvs[0] ?? null
}

/** A change to the open CV. */
function updateActive(change: (document: CvDocument) => CvDocument) {
  update((user) => {
    const active = activeCv(user)
    return {
      ...user,
      cvs: user.cvs.map((document) => (document === active ? change(document) : document)),
    }
  })
}

function blankCv(user: UserData): CvDocument {
  return {
    id: newId(),
    title: '',
    cv: { ...EMPTY_CV, name: user.profile?.name ?? '' },
    template: 'classico',
    style: {},
    basedOn: null,
  }
}

/** A change to the card of one CV. */
function updateCard(id: string, change: (card: CvCard) => CvCard) {
  update((user) => ({
    ...user,
    cvs: user.cvs.map((document) =>
      document.id === id ? { ...document, card: change(document.card ?? {}) } : document,
    ),
  }))
}

/** A change to the progress in one Kurso. */
function updateKurso(course: string, change: (progress: KursoProgress) => KursoProgress) {
  update((user) => ({
    ...user,
    kursos: { ...user.kursos, [course]: change(user.kursos[course] ?? EMPTY_KURSO) },
  }))
}

function withEducation(document: CvDocument, entry: Omit<CvEntry, 'id'>): CvDocument {
  return {
    ...document,
    cv: { ...document.cv, education: [{ id: newId(), ...entry }, ...document.cv.education] },
  }
}

function withNewCv(user: UserData, document: CvDocument): UserData {
  return { ...user, cvs: [document, ...user.cvs], activeCvId: document.id }
}

export const userActions = {
  /** The notifications were opened: what is dated until today stops being new. */
  seeNotifications: () => update((user) => ({ ...user, notificationsSeenAt: new Date().toISOString() })),

  saveProfile: (profile: Profile) =>
    update((user) => logged({ ...user, profile }, user.profile ? 'profileEdit' : 'profile')),

  /** The end of the first visit: the account, what the guide learned and the careers the person liked. */
  completeOnboarding: (profile: Profile, discovery: Discovery, liked: string[]) =>
    update((user) =>
      logged(
        {
          ...user,
          profile,
          discovery,
          interestAreas: discovery.areas,
          savedCareers: [...new Set([...user.savedCareers, ...liked])],
          subscriptions: user.subscriptions ?? { areas: discovery.areas, kinds: [...NEWS_KINDS] },
        },
        'profile',
      ),
    ),

  /** The areas the lists show by default (the entry screen, Definições); [] skips the question. */
  setInterestAreas: (interestAreas: MarketArea[]) => update((user) => ({ ...user, interestAreas })),

  /** The topics the person follows on Novidades (in the app only, until there is a server). */
  subscribe: (subscriptions: Subscriptions) => update((user) => ({ ...user, subscriptions })),

  answer: (questionId: string, value: Likert) =>
    update((user) => ({ ...user, answers: { ...user.answers, [questionId]: value } })),

  /** The card picked in a situation question. */
  choose: (questionId: string, dimension: RiasecKey) =>
    update((user) => ({ ...user, choices: { ...user.choices, [questionId]: dimension } })),

  completeAssessment: () =>
    update((user) => logged({ ...user, assessmentCompletedAt: new Date().toISOString() }, 'test')),

  restartAssessment: () =>
    update((user) => ({ ...user, answers: {}, choices: {}, assessmentCompletedAt: null })),

  /** An answer in part 2; with `step`, that step counts as done (answered or skipped). */
  saveStrengths: (change: Partial<Strengths>, step?: StrengthStep) =>
    update((user) => {
      const next = { ...user.strengths, ...change }
      const done = step && !next.done.includes(step) ? [...next.done, step] : next.done
      return { ...user, strengths: { ...next, done } }
    }),

  /** "Apagar as valências": part 2 only; the skills marked there stay, they belong to the fit too. */
  clearStrengths: () => update((user) => ({ ...user, strengths: EMPTY_STRENGTHS })),

  setSkill: (skillId: string, level: SkillLevel | null) =>
    update((user) => {
      const skills = { ...user.skills }
      if (level) skills[skillId] = level
      else delete skills[skillId]
      return { ...user, skills }
    }),

  toggleSaved: (slug: string) =>
    update((user) => {
      const next = { ...user, savedCareers: toggle(user.savedCareers, slug) }
      return user.savedCareers.includes(slug) ? next : logged(next, 'saved', slug)
    }),

  toggleSavedAcademy: (id: string) =>
    update((user) => ({ ...user, savedAcademies: toggle(user.savedAcademies, id) })),

  toggleSavedCompany: (id: string) =>
    update((user) => ({ ...user, savedCompanies: toggle(user.savedCompanies, id) })),

  toggleReminder: (id: string) =>
    update((user) => ({ ...user, remindedDeadlines: toggle(user.remindedDeadlines, id) })),

  visitCareer: (slug: string) =>
    update((user) =>
      user.visitedCareers.includes(slug)
        ? user
        : logged({ ...user, visitedCareers: [...user.visitedCareers, slug] }, 'visit', slug),
    ),

  setTarget: (slug: string | null) =>
    update((user) =>
      slug ? logged({ ...user, targetCareer: slug }, 'target', slug) : { ...user, targetCareer: null },
    ),

  /** The editor always has a CV to work on. */
  ensureCv: () => update((user) => (user.cvs.length > 0 ? user : withNewCv(user, blankCv(user)))),

  createCv: () => update((user) => withNewCv(user, blankCv(user))),

  /** Same content, model and style, as a CV of its own. */
  duplicateCv: (id: string, title: string) =>
    update((user) => {
      const source = user.cvs.find((document) => document.id === id)
      return source ? withNewCv(user, { ...source, id: newId(), title }) : user
    }),

  renameCv: (id: string, title: string) =>
    update((user) => ({
      ...user,
      cvs: user.cvs.map((document) => (document.id === id ? { ...document, title } : document)),
    })),

  deleteCv: (id: string) =>
    update((user) => {
      const cvs = user.cvs.filter((document) => document.id !== id)
      return { ...user, cvs, activeCvId: user.activeCvId === id ? (cvs[0]?.id ?? null) : user.activeCvId }
    }),

  openCv: (id: string) => update((user) => ({ ...user, activeCvId: id })),

  updateCv: (cv: CvData) => updateActive((document) => ({ ...document, cv })),

  setCvTemplate: (template: CvTemplate) => updateActive((document) => ({ ...document, template })),

  setCvStyle: (change: Partial<CvStyle>) =>
    updateActive((document) => ({ ...document, style: { ...document.style, ...change } })),

  setCvTarget: (target: CvTarget) => updateActive((document) => ({ ...document, target })),

  setCvCardModel: (id: string, model: CardModel) => updateCard(id, (card) => ({ ...card, model })),

  setCvCardStyle: (id: string, style: Partial<CardStyle>) =>
    updateCard(id, (card) => ({ ...card, style: { ...card.style, ...style } })),

  setCvCardDetails: (id: string, details: NonNullable<CvCard['details']>) =>
    updateCard(id, (card) => ({ ...card, details: { ...card.details, ...details } })),

  /** Back to the CV's data, or to the CV's look. */
  resetCvCard: (id: string, part: 'details' | 'style') => updateCard(id, (card) => ({ ...card, [part]: {} })),

  setPublicPage: (publicPage: PublicPage | null) => update((user) => ({ ...user, publicPage })),

  /** "Repor modelo": back to the template's look; the content stays. */
  resetCvStyle: () => updateActive((document) => ({ ...document, style: {} })),

  /** A new CV with the structure of a model, never its data (docs/arquitetura.md, 5.5). */
  startCvFrom: (example: CvExample) =>
    update((user) =>
      logged(
        withNewCv(user, {
          ...blankCv(user),
          title: example.cv.headline,
          template: example.template,
          basedOn: example.id,
          cv: {
            ...EMPTY_CV,
            name: user.profile?.name ?? '',
            experience: example.cv.experience.map(newEntry),
            education: example.cv.education.map(newEntry),
            projects: example.cv.projects.map(newEntry),
            certifications: example.cv.certifications.map(newEntry),
          },
        }),
        'cv',
        example.id,
      ),
    ),

  toggleCompare: (programId: string) =>
    update((user) => {
      if (user.compare.includes(programId)) return { ...user, compare: toggle(user.compare, programId) }
      return user.compare.length >= MAX_COMPARE
        ? user
        : logged({ ...user, compare: [...user.compare, programId] }, 'compare', programId)
    }),

  /** Keeps a search the person used; the same words again move to the top, whatever their case. */
  addSearch: (query: string) =>
    update((user) => {
      const search = query.trim().replace(/\s+/g, ' ')
      if (!search) return user
      const others = user.searches.filter((entry) => entry.toLowerCase() !== search.toLowerCase())
      return { ...user, searches: [search, ...others].slice(0, MAX_SEARCHES) }
    }),

  addPsychotech: (result: PsychotechResult) =>
    update((user) => ({ ...user, psychotech: [result, ...user.psychotech].slice(0, MAX_PSYCHOTECH) })),

  addAccessExam: (result: AccessExamResult) =>
    update((user) => ({ ...user, accessExams: [result, ...user.accessExams].slice(0, MAX_ACCESS_EXAMS) })),

  addInterview: (result: InterviewResult) =>
    update((user) => ({ ...user, interviews: [result, ...user.interviews].slice(0, MAX_INTERVIEWS) })),

  /** "Concluir e seguir": the step is done, with its grade when it is a unit review. */
  completeKursoStep: (course: string, step: string, score?: { unit: string; value: number }) =>
    updateKurso(course, (progress) => ({
      ...progress,
      done: progress.done.includes(step) ? progress.done : [...progress.done, step],
      scores: score ? { ...progress.scores, [score.unit]: score.value } : progress.scores,
    })),

  openKursoStep: (course: string, step: string) =>
    updateKurso(course, (progress) =>
      progress.position === step ? progress : { ...progress, position: step },
    ),

  addKursoTime: (course: string, seconds: number) =>
    updateKurso(course, (progress) => ({ ...progress, seconds: progress.seconds + seconds })),

  addKursoExam: (course: string, attempt: KursoExamAttempt, certificate?: string) =>
    updateKurso(course, (progress) => ({
      ...progress,
      exam: [attempt, ...progress.exam].slice(0, 20),
      ...(certificate && !progress.completedAt ? { completedAt: attempt.at, certificate } : {}),
    })),

  /** "Adicionar ao CV": a suggestion in the education of the open CV (one is made if there is none). */
  addCvEducation: (entry: Omit<CvEntry, 'id'>) =>
    update((user) => {
      const base = user.cvs.length > 0 ? user : withNewCv(user, blankCv(user))
      const active = activeCv(base)
      return {
        ...base,
        cvs: base.cvs.map((document) => (document === active ? withEducation(document, entry) : document)),
      }
    }),

  /** A new plan, or another career or path: what was ticked starts again. */
  startPlan: (career: string, pathway: string) =>
    update((user) => ({
      ...user,
      plan: { career, pathway, done: [], startedAt: new Date().toISOString().slice(0, 10) },
      targetCareer: career,
    })),

  togglePlanStep: (id: string) =>
    update((user) =>
      user.plan ? { ...user, plan: { ...user.plan, done: toggle(user.plan.done, id) } } : user,
    ),

  clearPlan: () => update((user) => ({ ...user, plan: null })),

  clearSearches: () => update((user) => ({ ...user, searches: [] })),

  setPhoto: (photo: string | null) => update((user) => ({ ...user, photo })),

  setCover: (cover: string | null) => update((user) => ({ ...user, cover })),

  /** "Apagar os meus dados": everything the app keeps about the person. */
  eraseAll: () => {
    // The public page lives on the server: without this, it would outlive the data that made it.
    if (state.publicPage)
      void deletePublicCard(state.publicPage.slug, state.publicPage.secret).catch(() => {})
    try {
      localStorage.removeItem(KEY)
    } catch {
      // Nothing stored, nothing to erase.
    }
    // The offline copies (code, photos seen): no personal data, but "erase everything" means everything.
    if (typeof caches !== 'undefined')
      void caches
        .keys()
        .then((names) => Promise.all(names.map((name) => caches.delete(name))))
        .catch(() => {})
    reloadUser()
  },
}
