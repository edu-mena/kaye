import { KURSOS } from '../data/kursos'
import {
  type Admission,
  type Career,
  type CatalogCourse,
  type EducationLevel,
  type FreeCourse,
  GROUP_AREAS,
  type Internship,
  type Pathway,
  type Scholarship,
  type SkillLevel,
} from '../data/types'
import { bestCvCompleteness } from './cv'
import { isStepDone } from './education'
import { careerFit } from './fit'
import { internshipsFor } from './internships'
import { scholarshipsFor } from './scholarships'

// "O meu plano": a career and a path turned into steps the person ticks off. Everything is built
// from the catalogue on this device; the ids stay the same when the plan is rebuilt, so what was
// ticked survives new data.

export type PlanStepKind = 'study' | 'apply' | 'skill' | 'cv' | 'practice' | 'experience'

/** Text for the screen: a translation key and its values; `name` is a catalogue name, shown as is. */
export type PlanText = { key: string; values?: Record<string, string | number> }

/** What closes a step without the person ticking it. */
type AutoDone =
  { kind: 'cv' } | { kind: 'kurso'; id: string } | { kind: 'psychotech' } | { kind: 'interview' }

export type PlanStep = {
  id: string
  kind: PlanStepKind
  title: PlanText
  why: PlanText
  /** The page of the app (or an external site) where the step is done. */
  to: string
  /** ISO day: the last day to do it. */
  due?: string
  /** The id of the same date on /prazos (domain/deadlines.ts), for the reminder. */
  deadlineId?: string
  auto?: AutoDone
}

export type PlanPhase = 'study' | 'apply' | 'learn' | 'prepare'

export const PHASE_OF: Record<PlanStepKind, PlanPhase> = {
  study: 'study',
  apply: 'apply',
  skill: 'learn',
  cv: 'prepare',
  practice: 'prepare',
  experience: 'prepare',
}

export const PHASES: PlanPhase[] = ['study', 'apply', 'learn', 'prepare']

export type PlanSources = {
  courses: CatalogCourse[]
  admissions: Admission[]
  scholarships: Scholarship[]
  internships: Internship[]
  freeCourses: FreeCourse[]
}

export type PlanPerson = {
  education: EducationLevel | null
  province: string | null
  skills: Record<string, SkillLevel>
  /** When the plan started (ISO day): dates open then stay in the plan, missed if they pass. */
  since: string
}

const MAX_APPLY = 3
const MAX_SCHOLARSHIPS = 3
const MAX_INTERNSHIPS = 2
const MAX_ACADEMIES = 3

/** The Kurso that teaches a skill, by the words of its name. */
const KURSO_FOR: { id: string; words: RegExp }[] = [
  { id: 'english-a1', words: /ingl[eê]s|english/i },
  { id: 'gestao-projetos', words: /projec?to|scrum|[áa]gil|agile/i },
  { id: 'ciberseguranca', words: /ciber|cyber|seguran[çc]a (inform|digital|de redes)/i },
  { id: 'marketing-digital', words: /marketing|redes sociais|\bseo\b|publicidade/i },
  { id: 'programacao', words: /programa[çc][ãa]o|python|javascript|c[óo]digo|algoritm/i },
  { id: 'analise-dados', words: /dados|excel|\bsql\b|estat[íi]stic|power bi/i },
]

function kursoFor(skill: string): string | null {
  const written = new Set(KURSOS.map((course) => course.id))
  return KURSO_FOR.find((entry) => written.has(entry.id) && entry.words.test(skill))?.id ?? null
}

const words = (text: string) =>
  new Set(
    text
      .toLowerCase()
      .normalize('NFD')
      .replace(/\p{M}/gu, '')
      .split(/[^a-z0-9]+/)
      .filter((word) => word.length >= 4),
  )

/** A free course whose name shares a word with the skill, free certificate first. */
function freeCourseFor(skill: string, courses: FreeCourse[]): FreeCourse | null {
  const wanted = words(skill)
  const matching = courses.filter(
    (course) => course.certificate !== 'pago' && [...words(course.name)].some((word) => wanted.has(word)),
  )
  return (
    matching.toSorted((a, b) => Number(b.certificate === 'gratis') - Number(a.certificate === 'gratis'))[0] ??
    null
  )
}

/** The catalogue courses for an academic step: this career's, at the step's level. */
function coursesFor(career: Career, level: EducationLevel | undefined, courses: CatalogCourse[]) {
  return courses.filter(
    (course) =>
      course.careers.includes(career.slug) &&
      (level === undefined || course.levels.some((item) => item === level)),
  )
}

/** The academies that teach these courses, the person's province first. */
function academiesFor(courses: CatalogCourse[], province: string | null): string[] {
  const offers = courses.flatMap((course) => course.offers.map(({ academy }) => academy))
  const unique = [...new Map(offers.map((academy) => [academy.id, academy])).values()]
  return unique
    .toSorted((a, b) => Number(b.province === province) - Number(a.province === province))
    .map((academy) => academy.name)
}

function studySteps(career: Career, pathway: Pathway, person: PlanPerson, sources: PlanSources) {
  return pathway.steps.flatMap((step, index): PlanStep[] => {
    if (step.kind !== 'academico' || isStepDone(step, person.education)) return []
    const courses = coursesFor(career, step.level, sources.courses)
    const academies = academiesFor(courses, person.province)
    const only = courses.length === 1 ? courses[0] : undefined
    return [
      {
        id: `study-${index}`,
        kind: 'study',
        title: { key: 'name', values: { name: step.title } },
        why:
          academies.length > 0
            ? {
                key: 'plan.whyStudy',
                values: { list: academies.slice(0, MAX_ACADEMIES).join(', '), count: academies.length },
              }
            : { key: 'plan.whyStudyNone' },
        to: only ? `/cursos/curso/${only.id}` : `/cursos?carreira=${career.slug}`,
      },
    ]
  })
}

/** The closing day of an access record: applications, or else the last exam; with its id on /prazos. */
function admissionDue(admission: Admission): { due: string; deadlineId: string } | null {
  if (admission.registration.end)
    return { due: admission.registration.end, deadlineId: `${admission.id}-acesso` }
  const last = admission.examDates.length - 1
  const exam = admission.examDates[last]
  return exam ? { due: exam, deadlineId: `${admission.id}-exame-${last}` } : null
}

function applySteps(
  career: Career,
  pathway: Pathway,
  person: PlanPerson,
  sources: PlanSources,
  today: string,
) {
  const from = person.since < today ? person.since : today
  const levels = pathway.steps
    .filter((step) => step.kind === 'academico' && !isStepDone(step, person.education))
    .flatMap((step) => (step.level === 'licenciatura' || step.level === 'medio_tecnico' ? [step.level] : []))
  if (levels.length === 0) return []
  const courses = levels.flatMap((level) => coursesFor(career, level, sources.courses))
  const teaching = new Map(
    courses.flatMap((course) => course.offers.map(({ academy }) => [academy.id, academy])),
  )
  const courseIds = new Set(courses.map((course) => course.id))

  const admissions = sources.admissions.flatMap((admission): PlanStep[] => {
    const covers =
      admission.academyId === null ||
      (teaching.has(admission.academyId) &&
        (admission.courseIds === undefined || admission.courseIds.some((id) => courseIds.has(id))))
    const closing = admissionDue(admission)
    if (!covers || !closing || closing.due < from) return []
    const academy = admission.academyId ? teaching.get(admission.academyId) : undefined
    return [
      {
        id: `apply-${admission.id}`,
        kind: 'apply',
        title: academy
          ? { key: 'plan.applyAcademy', values: { name: academy.name } }
          : { key: 'plan.applyNational' },
        why: { key: 'plan.whyApply' },
        to: academy ? `/academias/${academy.id}` : admission.url,
        ...closing,
      },
    ]
  })

  const scholarships = scholarshipsFor(
    sources.scholarships,
    { areas: [GROUP_AREAS[career.group]], levels },
    today,
  )
    .filter((scholarship) => scholarship.deadline !== null && scholarship.deadline >= from)
    .slice(0, MAX_SCHOLARSHIPS)
    .map((scholarship): PlanStep => ({
      id: `apply-bolsa-${scholarship.id}`,
      kind: 'apply',
      title: { key: 'plan.applyScholarship', values: { name: scholarship.name } },
      why: { key: 'plan.whyScholarship', values: { provider: scholarship.provider } },
      to: '/oportunidades?tab=bolsas',
      due: scholarship.deadline ?? undefined,
      deadlineId: scholarship.id,
    }))

  return [...admissions.toSorted(byDue).slice(0, MAX_APPLY), ...scholarships]
}

function skillSteps(career: Career, person: PlanPerson, sources: PlanSources): PlanStep[] {
  const fit = careerFit(career, { profile: null, education: person.education, skills: person.skills })
  return fit.skills.missing.map((skill): PlanStep => {
    const kurso = kursoFor(skill.name)
    if (kurso) {
      const title = KURSOS.find((course) => course.id === kurso)?.title ?? kurso
      return {
        id: `skill-${skill.id}`,
        kind: 'skill',
        title: { key: 'plan.learnSkill', values: { name: skill.name } },
        why: { key: 'plan.whyKurso', values: { course: title } },
        to: `/kursos/${kurso}`,
        auto: { kind: 'kurso', id: kurso },
      }
    }
    const free = freeCourseFor(skill.name, sources.freeCourses)
    return {
      id: `skill-${skill.id}`,
      kind: 'skill',
      title: { key: 'plan.learnSkill', values: { name: skill.name } },
      why: free
        ? { key: 'plan.whyFreeCourse', values: { course: free.name, provider: free.provider } }
        : { key: 'plan.whySkill' },
      to: free ? free.url : `/carreiras/${career.slug}?secao=study`,
    }
  })
}

function experienceSteps(career: Career, person: PlanPerson, sources: PlanSources, today: string) {
  const from = person.since < today ? person.since : today
  return internshipsFor(sources.internships, [GROUP_AREAS[career.group]], today)
    .filter(
      (internship) => internship.recurring || (internship.deadline !== null && internship.deadline >= from),
    )
    .slice(0, MAX_INTERNSHIPS)
    .map((internship): PlanStep => ({
      id: `experience-${internship.id}`,
      kind: 'experience',
      title: { key: 'plan.internship', values: { name: internship.name } },
      why: { key: 'plan.whyInternship', values: { provider: internship.provider } },
      to: '/oportunidades?tab=estagios',
      due: internship.deadline ?? undefined,
      deadlineId: internship.deadline ? internship.id : undefined,
    }))
}

const byDue = (a: PlanStep, b: PlanStep) => (a.due ?? '9999').localeCompare(b.due ?? '9999')

/** Every step of the plan, in order: study, apply, learn, then CV, practice and experience. */
export function buildPlan(
  career: Career,
  pathway: Pathway,
  person: PlanPerson,
  sources: PlanSources,
  today: string,
): PlanStep[] {
  return [
    ...studySteps(career, pathway, person, sources),
    ...applySteps(career, pathway, person, sources, today),
    ...skillSteps(career, person, sources),
    {
      id: 'cv',
      kind: 'cv',
      title: { key: 'plan.cvTitle' },
      why: { key: 'plan.whyCv' },
      to: '/cv',
      auto: { kind: 'cv' },
    },
    {
      id: 'practice-psychotech',
      kind: 'practice',
      title: { key: 'plan.psychotechTitle' },
      why: { key: 'plan.whyPsychotech' },
      to: '/treino',
      auto: { kind: 'psychotech' },
    },
    {
      id: 'practice-interview',
      kind: 'practice',
      title: { key: 'plan.interviewTitle' },
      why: { key: 'plan.whyInterview' },
      to: `/entrevistas?carreira=${career.slug}`,
      auto: { kind: 'interview' },
    },
    ...experienceSteps(career, person, sources, today),
  ]
}

export type StepStatus = 'done' | 'missed' | 'todo'

/** What the app knows the person did since the plan started. */
export type PlanEvidence = {
  done: string[]
  cvComplete: boolean
  kursosDone: Set<string>
  psychotech: boolean
  interview: boolean
}

export function evidenceOf(
  user: {
    cvs: Parameters<typeof bestCvCompleteness>[0]
    kursos: Record<string, { completedAt?: string }>
    psychotech: { at: string }[]
    interviews: { at: string }[]
  },
  plan: { done: string[]; startedAt: string },
): PlanEvidence {
  return {
    done: plan.done,
    cvComplete: bestCvCompleteness(user.cvs) === 1,
    kursosDone: new Set(Object.keys(user.kursos).filter((id) => user.kursos[id]?.completedAt)),
    psychotech: user.psychotech.some((result) => result.at >= plan.startedAt),
    interview: user.interviews.some((result) => result.at >= plan.startedAt),
  }
}

/** Whether the app closed the step on its own. */
function autoDone(step: PlanStep, evidence: PlanEvidence): boolean {
  switch (step.auto?.kind) {
    case 'cv':
      return evidence.cvComplete
    case 'kurso':
      return evidence.kursosDone.has(step.auto.id)
    case 'psychotech':
      return evidence.psychotech
    case 'interview':
      return evidence.interview
    default:
      return false
  }
}

/** Done (ticked or closed by the app), missed (its day passed first), or still to do. */
export function stepStatus(step: PlanStep, evidence: PlanEvidence, today: string): StepStatus {
  if (evidence.done.includes(step.id) || autoDone(step, evidence)) return 'done'
  return step.due !== undefined && step.due < today ? 'missed' : 'todo'
}

/** "Esta semana": up to three steps still to do, the nearest day first, then the plan's order. */
export function nextSteps<T extends { step: PlanStep; status: StepStatus }>(steps: T[], count = 3): T[] {
  const todo = steps.filter((item) => item.status === 'todo')
  const dated = todo.filter((item) => item.step.due !== undefined).toSorted((a, b) => byDue(a.step, b.step))
  return [...dated, ...todo.filter((item) => item.step.due === undefined)].slice(0, count)
}
