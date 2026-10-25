// Shapes of the /api/v1 responses (docs/arquitetura.md, sections 4 and 6).
// The demo data source returns exactly these; the real API will too.

export const RIASEC_KEYS = ['R', 'I', 'A', 'S', 'E', 'C'] as const
export type RiasecKey = (typeof RIASEC_KEYS)[number]
/** Each dimension from 0 to 1. */
export type RiasecProfile = Record<RiasecKey, number>

export const CAREER_GROUPS = [
  'desenvolvimento',
  'dados',
  'infraestrutura',
  'seguranca',
  'telecomunicacoes',
  'design',
  'gestao',
  'educacao',
  'digital',
] as const
export type CareerGroup = (typeof CAREER_GROUPS)[number]

export type Demand = 'alta' | 'media' | 'baixa'

/** Highest level completed, in order. Médio técnico is the technical track of the same cycle. */
export const EDUCATION_LEVELS = [
  'primario',
  'i_ciclo',
  'ii_ciclo',
  'medio_tecnico',
  'licenciatura',
  'mestrado',
] as const
export type EducationLevel = (typeof EDUCATION_LEVELS)[number]

/** A range in months; `max` null means "or more". */
export type MonthRange = { min: number; max: number | null }

export type PathwayStepKind = 'academico' | 'formacao' | 'certificacao' | 'portfolio' | 'experiencia'

/**
 * How much a step counts in this path, from what employers actually ask:
 * essential (no way in without it), recommended (opens more doors), optional (helps, nobody asks).
 */
type StepNeed = 'essencial' | 'recomendado' | 'opcional'

export type PathwayStep = {
  kind: PathwayStepKind
  title: string
  description: string
  months: MonthRange | null
  need: StepNeed
  /** Academic steps only: the level this step gives. */
  level?: EducationLevel
  /** Training: it can be learnt alone (online courses, videos, documentation). */
  selfTaught?: boolean
  /** Training and certifications: whether employers ask for the paper, or only for the skill. */
  certificate?: 'exigido' | 'opcional'
}

export type Pathway = {
  id: string
  name: string
  summary: string
  steps: PathwayStep[]
  /** Total cost in Kz, cheapest and median course (docs/arquitetura.md, 4.2). */
  totalCost: { min: number; max: number } | null
}

type StageLevel = 'estagio' | 'junior' | 'pleno' | 'senior' | 'lideranca'

type CareerStage = {
  level: StageLevel
  title: string
  years: { min: number; max: number | null }
  responsibilities: string[]
}

export type Skill = { id: string; name: string; importance: 'essencial' | 'opcional' }

/** How well the person says they know a skill (user_skills). */
export type SkillLevel = 'aprender' | 'sei' | 'domino'

/** Aggregated from job postings; postings themselves are never shown. */
type EmployerAsks = {
  postings: number
  skills: { skillId: string; share: number }[]
  education: { label: string; share: number }[]
  experienceYearsMedian: number
  certifications: { name: string; share: number }[]
}

export type Market = {
  demand: Demand
  trendPct: number
  salary: { p25: number; p50: number; p75: number; basis: string } | null
  /** Median monthly salary at each career stage (example data). */
  salaryByStage: { level: StageLevel; median: number }[]
  /** Example job ads per month ("2026-05"), oldest first: the trend behind trendPct. */
  postingsByMonth: { month: string; count: number }[]
  hiringSectors: string[]
}

export type CareerSummary = {
  slug: string
  name: string
  group: CareerGroup
  summary: string
  riasec: RiasecProfile
  demand: Demand
  salaryMedian: number | null
  /** False while the career page is still being curated. */
  detailed: boolean
  /** Photo for the top of the career page; without one, the page shows the brand pattern. */
  image?: Photo
}

/**
 * A photo (a career, a course). The credit is what its licence asks for once the photo is published;
 * while the photos stay local the pages do not show it.
 */
export type Photo = {
  /** 800 px wide, for phones. */
  small: string
  /** 1600 px wide. */
  large: string
  alt: string
  credit: { author: string; license: string; url: string }
}

export type Career = CareerSummary & {
  description: string
  dayToDay: string[]
  workContext: { label: string; value: string }[]
  workStyles: string[]
  skills: Skill[]
  employerAsks: EmployerAsks | null
  pathways: Pathway[]
  stages: CareerStage[]
  market: Market
  cvGuide: CvGuide
}

export type Institution = {
  id: string
  name: string
  type: 'universidade' | 'instituto_medio' | 'centro_formacao' | 'online'
  ownership: 'publica' | 'privada'
  province: string
  /** Logo image; without one, the app shows the initials. */
  logo?: string
}

export type Schedule = 'diurno' | 'pos_laboral' | 'online'

/** A course in general ("Desenvolvimento Web"); each institution offers it as a Program. */
export type Course = { id: string; name: string }

/** One institution's offer of a course: its own name, length, price, schedule and score. */
export type Program = {
  id: string
  institution: Institution
  /** The course this is an offer of: several institutions can offer the same one. */
  course: Course
  name: string
  level: 'formacao_profissional' | 'medio_tecnico' | 'licenciatura' | 'certificacao'
  durationMonths: number
  schedule: Schedule[]
  /** Whole course, in Kz. */
  totalCost: number | null
  /** Officially recognised (MESCTI, MED or INEFOP). */
  recognized: boolean
  rating: { average: number; count: number } | null
  careers: string[]
  /** The course photo the institution publishes; the demo uses free photos. */
  image?: Photo
}

/** `id` keeps each entry stable while the person edits, reorders or removes others. */
export type CvEntry = { id: string; title: string; place: string; period: string; description: string }

export type CvData = {
  name: string
  headline: string
  contact: string
  /** GitHub, portfolio, personal site: what a recruiter opens first. */
  links: string[]
  summary: string
  experience: CvEntry[]
  education: CvEntry[]
  projects: CvEntry[]
  certifications: CvEntry[]
  skills: string[]
  languages: string[]
}

export type CvSection =
  'summary' | 'experience' | 'education' | 'projects' | 'certifications' | 'skills' | 'languages' | 'links'

/**
 * Known CV layouts. classico: one column, Harvard style, read without errors by hiring
 * software. moderno: two columns. europeu: labels on the left, Europass style.
 */
export type CvTemplate = 'classico' | 'moderno' | 'europeu'

/** The ideal CV for one path into a career (fictional person, docs/arquitetura.md, 5.5). */
export type CvExample = {
  id: string
  careerSlug: string
  /** The path it shows, one of the career's pathways. */
  pathwayId: string
  seniority: 'primeiro_emprego' | 'junior' | 'experiente'
  template: CvTemplate
  /** Why the CV works as a whole, in two or three sentences. */
  why: string
  cv: CvData
  /** Why each part works. */
  notes: Partial<Record<CvSection, string>>
}

/** What a CV for this career must show and avoid: the rules change a lot between areas. */
type CvGuide = { template: CvTemplate; include: string[]; avoid: string[] }

export type AssessmentQuestion = { id: string; dimension: RiasecKey; text: string }

/** An answer to an assessment statement, from 1 to 5. */
export type Likert = 1 | 2 | 3 | 4 | 5
