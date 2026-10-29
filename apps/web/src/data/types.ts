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
  // Health
  'medicina',
  'enfermagem',
  'diagnostico',
  'farmacia',
  'reabilitacao',
  'saude_oral',
  'saude_publica',
  'saude_mental',
  // Management, finance and trade
  'contabilidade',
  'financas',
  'banca_seguros',
  'gestao_empresas',
  'recursos_humanos',
  'comercial',
  'economia',
  // Law, public administration and the social and human sciences
  'advocacia',
  'justica',
  'administracao_publica',
  'relacoes_internacionais',
  'investigacao_criminal',
  'psicologia',
  'ciencias_sociais',
  'humanidades',
  // Languages, communication and the arts, and the natural and exact sciences
  'comunicacao_social',
  'linguas',
  'artes',
  'ciencias_vida',
  'ciencias_exactas',
  // Sport and physical education (the yearbook's education courses)
  'desporto',
] as const
export type CareerGroup = (typeof CAREER_GROUPS)[number]

/** The area of each group: the catalogue grows one area at a time (technology first, then health). */
export const GROUP_AREAS: Record<CareerGroup, MarketArea> = {
  desenvolvimento: 'technology',
  dados: 'technology',
  infraestrutura: 'technology',
  seguranca: 'technology',
  telecomunicacoes: 'technology',
  design: 'technology',
  gestao: 'technology',
  educacao: 'technology',
  digital: 'technology',
  medicina: 'health',
  enfermagem: 'health',
  diagnostico: 'health',
  farmacia: 'health',
  reabilitacao: 'health',
  saude_oral: 'health',
  saude_publica: 'health',
  saude_mental: 'health',
  contabilidade: 'business',
  financas: 'business',
  banca_seguros: 'business',
  gestao_empresas: 'business',
  recursos_humanos: 'business',
  comercial: 'business',
  economia: 'business',
  advocacia: 'legal',
  justica: 'legal',
  administracao_publica: 'public',
  relacoes_internacionais: 'public',
  investigacao_criminal: 'public',
  psicologia: 'sciences',
  ciencias_sociais: 'sciences',
  humanidades: 'sciences',
  comunicacao_social: 'communication',
  linguas: 'communication',
  artes: 'communication',
  ciencias_vida: 'sciences',
  ciencias_exactas: 'sciences',
  desporto: 'education',
}

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
  /** 400 px wide, for cards. */
  thumb: string
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
  type: 'universidade' | 'instituto_superior' | 'instituto_medio' | 'centro_formacao' | 'online'
  ownership: 'publica' | 'privada'
  province: string
  /** Logo image; without one, the app shows the initials. */
  logo?: string
}

export type Schedule = 'diurno' | 'pos_laboral' | 'online'

/** A course in general ("Desenvolvimento Web"); each institution offers it as a Program. */
export type Course = { id: string; name: string }

/** Where a public fact was published, so anyone can check it. */
export type SourceLink = { label: string; url: string }

/** A course an academy is confirmed to offer (by a decree or the news); no length or price yet. */
export type AcademyOffer = {
  course: Course
  name: string
  level: Program['level'] | 'mestrado'
  faculty?: string
  /** The decree that created or approved the course. */
  recognition?: SourceLink
  /** Editorial: the careers the course prepares for, and their areas. */
  careers: string[]
  areas: CareerGroup[]
  /** Students and graduates of the course at this institution, and their academic year (official yearbook). */
  students?: number
  graduates?: number
  year?: string
}

/**
 * A real institution, with only what public sources confirm (docs/recolha-de-dados.md).
 * No prices, scores or numbers of our own: those stay with the fictional demo institutions.
 */
export type Academy = Omit<Institution, 'ownership'> & {
  /** null = still to confirm, and the screen says so. */
  ownership: Institution['ownership'] | null
  place: string
  summary: string
  offers: AcademyOffer[]
  /** The youngest age it takes, when a source says so. */
  minAge?: number
  /** A photo of the institution; without one, the card shows a dark band. */
  banner?: string
  /** The official site, when it answers. */
  website?: string
  sources: SourceLink[]
}

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

export const COMPANY_SECTORS = [
  'telecomunicacoes',
  'banca',
  'tecnologia',
  'televisao',
  'energia',
  'industria',
  'transportes',
  'saude',
  'seguros',
  'consultoria',
  'estado',
  'justica',
  'comunicacao',
  'comercio',
] as const
export type CompanySector = (typeof COMPANY_SECTORS)[number]

/** A programme for young people (internships, training, start-ups), with its source. */
type CompanyProgram = { name: string; summary: string; source: SourceLink }

/**
 * A real company, with only what public sources confirm (docs/recolha-de-dados.md). No salaries
 * or vacancies of our own.
 */
export type Company = {
  id: string
  name: string
  sector: CompanySector
  province: string
  place: string
  summary: string
  logo?: string
  /** A white logo, shown on black. */
  logoOnDark?: boolean
  banner?: string
  website?: string
  /** The careers it hires for; `careersSourced` says a public source states it, else it is our reading. */
  careers: string[]
  careersSourced: boolean
  /** The areas of those careers. */
  areas: CareerGroup[]
  programs: CompanyProgram[]
  /** Academies it works with (their ids). */
  partners: string[]
  sources: SourceLink[]
}

export type NewsKind = 'kaye' | 'cursos' | 'empresas'

/** Novidades: what changed in Kayé, and what institutions and companies did. */
export type NewsItem = {
  id: string
  /** Day it happened (or, for a published fact, the day it reached Kayé): "2026-10-27". */
  date: string
  kind: NewsKind
  title: string
  summary: string
  /** The page of the app it is about. */
  to?: string
  /** Where a fact about an institution or a company was published. */
  source?: SourceLink
  /** Made up for the demonstration, about an "Exemplo" institution. */
  example?: boolean
  /** The careers it is about: "Para ti" when one of them is saved or the destination. */
  careers?: string[]
}

/** The areas of the Mercado overview, shared by job posts and graduates (scrapers/areas.py). */
export const MARKET_AREAS = [
  'technology',
  'engineering',
  'oil_mining',
  'health',
  'education',
  'business',
  'legal',
  'public',
  'communication',
  'agriculture',
  'hospitality',
  'logistics',
  'sciences',
] as const
export type MarketArea = (typeof MARKET_AREAS)[number]

/** The minimum experience a post asks for: none, 1 to 2 years, 3 to 5, 6 or more. */
type ExperienceBand = 'none' | 'junior' | 'mid' | 'senior'

/** What Angolan job sites published in the last 12 months, counted (scrapers/jobs/summarize.py). */
export type JobMarket = {
  /** The newest post and the start of the 12 months. */
  updated: string
  from: string
  postings: number
  months: { month: string; postings: number }[]
  /** The same 12 months in blocks of 3 (`month` is the first), steadier than months with estimated dates. */
  blocks: { month: string; postings: number }[]
  areas: { area: MarketArea | 'other'; postings: number }[]
  provinces: { province: string; postings: number }[]
  /** The employers with most posts, without the recruitment agencies, which are counted apart. */
  companies: { name: string; postings: number }[]
  agencies: { postings: number; names: string[] }
  /** What the posts ask for; each share counts only the posts that say it. */
  asks: {
    /** Posts whose text was read for the education. */
    read: number
    education: { level: EducationLevel; postings: number }[]
    /** The area of the course a post names ("Licenciatura em Contabilidade"). */
    fields: { area: MarketArea; postings: number }[]
    experience: { band: ExperienceBand; postings: number }[]
  }
  careers: { slug: string; postings: number }[]
  /** Public competitions opened in the period, each counted once however many sites announced it. */
  public: {
    competitions: number
    /** Posts announced, and how many competitions said how many. */
    openings: number
    withOpenings: number
    bodies: { name: string; competitions: number; openings: number }[]
    /** From the title ("professores") or the body (Ministério da Saúde); public administration otherwise. */
    areas: { area: MarketArea; competitions: number; openings: number }[]
    provinces: { province: string; postings: number }[]
    /** The competitions confirmed by dispatches of the Diário da República (their numbers replace the news'). */
    official: {
      openings: number
      dispatches: number
      competitions: { body: string; area: MarketArea; openings: number; dispatches: number; date: string }[]
      source: { name: string; url: string }
    }
  }
  sources: { id: string; name: string; url: string; postings: number; since: string }[]
}

/** Unemployment by age and the young who neither work nor study (scrapers/employment/iea.py); rates 0 to 1. */
export type EmploymentStats = {
  year: number
  source: SourceLink
  unemployment: number
  /** `to` null: "65 or more". */
  ages: { from: number; to: number | null; rate: number }[]
  /** The young (15 to 24): in towns, in the country, and those who neither work, study nor train. */
  youth: { unemployment: number; urban: number; rural: number; neitherWorkNorStudy: number }
}

/** Graduates per course and area, from the official yearbooks (scrapers/education/anuario.py). */
export type EducationStats = {
  /** The academic year of the numbers: "2023/24". */
  year: string
  total: number
  /** Candidates, first-year students and all students of the same academic year (Quadro 1.2). */
  access: { candidates: number; firstTime: number; enrolled: number }
  source: SourceLink
  /** Graduates of the year and students now ("enrolled"): the graduates of the coming years. */
  areas: {
    area: MarketArea
    graduates: number
    enrolled: number
    courses: { name: string; graduates: number; enrolled: number }[]
  }[]
  series: { year: string; graduates: number; source: SourceLink }[]
}
