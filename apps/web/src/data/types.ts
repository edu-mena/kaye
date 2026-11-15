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
  'gestao_projetos',
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
  // Education
  'ensino_primario',
  'ensino_secundario',
  'pedagogia',
  'ensino_superior',
  'desporto',
  // Engineering, oil and mining, agriculture, logistics, tourism
  'construcao_civil',
  'arquitectura',
  'engenharia_industrial',
  'engenharia_electrica',
  'petroleo_gas',
  'mecanica_offshore',
  'minas_geologia',
  'agricultura',
  'pecuaria',
  'pescas',
  'ambiente',
  'logistica',
  'transportes',
  'turismo',
  'beleza',
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
  gestao_projetos: 'business',
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
  ensino_primario: 'education',
  ensino_secundario: 'education',
  pedagogia: 'education',
  ensino_superior: 'education',
  desporto: 'education',
  construcao_civil: 'engineering',
  arquitectura: 'engineering',
  engenharia_industrial: 'engineering',
  engenharia_electrica: 'engineering',
  petroleo_gas: 'oil_mining',
  mecanica_offshore: 'oil_mining',
  minas_geologia: 'oil_mining',
  agricultura: 'agriculture',
  pecuaria: 'agriculture',
  pescas: 'agriculture',
  ambiente: 'agriculture',
  logistica: 'logistics',
  transportes: 'logistics',
  turismo: 'hospitality',
  beleza: 'hospitality',
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
  /** The cost and lengths are the Kayé team's estimate (data-to-collect-later). */
  estimated?: true
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
  /** Null for a career the job sites do not show (the State hires it by public competition): see demandNote. */
  trendPct: number | null
  /** What is known of the demand instead of the job ads, with its source. */
  demandNote?: {
    text: string
    source: SourceLink
    /** What a published salary survey says, when no State table names the career. */
    salary?: { text: string; source: SourceLink }
  }
  salary: { p25: number; p50: number; p75: number; basis: string } | null
  /** Median monthly salary at each career stage (example data, or the State's table for its careers). */
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
  /** In Kz a month: the median or, with `salaryKind` 'entrada', the State's base salary on entry. */
  salaryMedian: number | null
  /** 'entrada': a State career, whose salary is the category a person with the course's training enters. */
  salaryKind?: 'entrada'
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
  /** How people work on their own in this career in Angola; editorial and estimated (data/demo/selfEmployment.ts). */
  selfEmployment?: SelfEmployment
}

/** The least schooling a path asks: training only (up to the II ciclo), médio técnico, or a degree. */
export type EntryLevel = 'short' | 'technical' | 'degree'

/**
 * What the recommendation needs from each curated career, without the whole page
 * (GET /occupations?fields=traits): its skills, work styles, the easiest way in and where it is taught.
 */
export type CareerTraits = {
  slug: string
  skills: Skill[]
  workStyles: string[]
  /** The path that asks the least schooling; null without paths. */
  entry: { level: EntryLevel; pathway: string } | null
  /** Provinces with an in-person course for it. */
  provinces: string[]
  /** Some course can be followed online, from anywhere. */
  online: boolean
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

/**
 * A course's plan of studies at one institution, as the decree that approved it lists it: the subjects of each
 * year or semester, in order.
 */
export type Curriculum = {
  periods: { label: string; subjects: string[] }[]
  source: SourceLink
}

/**
 * A monthly fee an institution or the press published. 'course': this course's own fee; 'average': the institution's
 * average across its licenciaturas (the middle of its cheapest and dearest), when no fee per course is published.
 */
export type PublishedFee = { monthly: number; basis: 'course' | 'average'; year: string; source: SourceLink }

/** A course an academy is confirmed to offer (by a decree or the news); no length yet. */
export type AcademyOffer = {
  course: Course
  name: string
  /** 'especialidade': a speciality or specialisation after a degree or a technical course. */
  level: Program['level'] | 'mestrado' | 'especialidade'
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
  /** The approved plan of studies, when its decree is published. */
  curriculum?: Curriculum
  /** The published fee; without one, the app estimates it (domain/fees.ts). */
  fee?: PublishedFee
}

/** A course across the institutions that offer it (GET /courses): the catalogue the Cursos page shows. */
export type CatalogCourse = Course & {
  levels: AcademyOffer['level'][]
  areas: MarketArea[]
  careers: string[]
  offers: { academy: Pick<Academy, 'id' | 'name' | 'type' | 'ownership' | 'province'>; offer: AcademyOffer }[]
  /** Students and graduates at every institution, in the yearbook's year. */
  students: number
  graduates: number
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
  /** Contacts the institution itself published (site or official pages); never guessed. */
  phone?: string
  email?: string
  address?: string
  /** A Google Maps search for the institution's name: never invented coordinates. */
  mapsUrl?: string
  /** Its official pages only. */
  social?: { facebook?: string; instagram?: string; linkedin?: string }
  /** The year it was founded or created, and where that is stated. */
  founded?: { year: number; source: SourceLink }
  /** Who recognises it (the ministry, by a decree), and where. */
  recognizedBy?: { name: string; source: SourceLink }
  /** When the Kayé team last checked these facts (ISO date). */
  checkedAt?: string
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
 * software. moderno: two columns. europeu: labels on the left, Europass style. retrato: photo
 * in a light band. colunas: header, then two columns. minimalista: only type and white space.
 * criativo: colour, shapes and photo. destaque: boxed summary and skills as chips.
 */
export type CvTemplate =
  'classico' | 'moderno' | 'europeu' | 'retrato' | 'colunas' | 'minimalista' | 'criativo' | 'destaque'

/** Fonts hosted in public/fonts/cv, one TTF for the screen and the PDF. */
export type CvFont = 'arimo' | 'inter' | 'montserrat' | 'lora' | 'merriweather'

/** none, tint or solid behind section titles, or outline around whole sections. */
export type CvBox = 'none' | 'tint' | 'solid' | 'outline'

export type CvSeparator = 'none' | 'thin' | 'thick' | 'dotted'

/** How one CV looks. Lengths in mm, font sizes in pt, colours as #rrggbb. */
export type CvStyle = {
  font: CvFont
  marginX: number
  marginY: number
  nameSize: number
  headingSize: number
  bodySize: number
  lineHeight: number
  /** From a section title to its content. */
  headingGap: number
  /** From an entry's title to its description. */
  entryGap: number
  sectionGap: number
  accent: string
  text: string
  muted: string
  box: CvBox
  separator: CvSeparator
  /** In the templates that have a photo. */
  photo: boolean
}

export const CV_DESTINATIONS = [
  'company',
  'multinational',
  'government',
  'ngo',
  'startup',
  'internship',
] as const
export type CvDestination = (typeof CV_DESTINATIONS)[number]

/** Where the person is sending a CV, for the advice. */
export type CvTarget = { area: MarketArea | null; career: string | null; destination: CvDestination | null }

export type CvStructureAdvice = 'oneColumn' | 'twoColumns' | 'labels'
export type CvColourAdvice = 'mono' | 'discreet' | 'strong'
export type CvPhotoAdvice = 'yes' | 'no' | 'optional'
export type CvLengthAdvice = 'one' | 'oneOrTwo' | 'long'

export const CARD_MODELS = [
  'claro',
  'faixa',
  'cheio',
  'foto',
  'moldura',
  'topo',
  'duo',
  'minimal',
  'arco',
  'pontos',
] as const
export type CardModel = (typeof CARD_MODELS)[number]

export type CardAlign = 'left' | 'center'

/** How a business card looks. Font sizes in pt. */
export type CardStyle = {
  font: CvFont
  accent: string
  text: string
  nameSize: number
  roleSize: number
  contactSize: number
  align: CardAlign
  photo: boolean
  qr: boolean
}

/** A CV's business card. It keeps only what changed: the rest comes from the CV, which it never alters. */
export type CvCard = {
  model?: CardModel
  /** `contacts` has one contact per line. */
  details?: { name?: string; headline?: string; contacts?: string }
  style?: Partial<CardStyle>
}

/** What a public page shows: only the fields the person ticked (docs/decisoes/0014). */
export type PublicCard = {
  name: string
  accent: string
  headline?: string
  photo?: string
  email?: string
  whatsapp?: string
  linkedin?: string
  portfolio?: string
}

/** One of the person's CVs. `style` keeps only what they changed; the template gives the rest. */
export type CvDocument = {
  id: string
  /** Empty until renamed: the screen shows "O meu CV" in the current language. */
  title: string
  cv: CvData
  template: CvTemplate
  style: Partial<CvStyle>
  /** The model CV it started from, for its tips. */
  basedOn: string | null
  target?: CvTarget
  card?: CvCard
}

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
  'educacao',
  'mineracao',
  'agricultura',
  'turismo',
  'comercio',
] as const
export type CompanySector = (typeof COMPANY_SECTORS)[number]

/** A programme for young people (internships, training, start-ups), with its source. */
type CompanyProgram = { name: string; summary: string; source: SourceLink }

/** A fact a source states ("1991", "≈ 3 000"): "≈" only when the source says it. */
export type CompanyFact = { value: string; source: SourceLink }

/** A post the company hires for or advertises, tied to the catalogue's careers; without a source, our reading. */
export type CompanyRole = { title: string; careers: string[]; source?: SourceLink }

/**
 * Someone who leads or speaks for the company, with the post confirmed in an official source. Never a minor,
 * never an ordinary employee, never a personal contact. The profile is their own, matched on name, company and post.
 */
export type CompanyPerson = {
  name: string
  role: string
  source: SourceLink
  profile?: { label: 'LinkedIn'; url: string }
  /** Only with a free licence; without one, the initials. */
  photo?: string
}

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
  /** Its lines of business (3 to 6), from the company or the press, with where they are stated. */
  activities?: string[]
  activitiesSource?: SourceLink
  founded?: CompanyFact
  employees?: CompanyFact
  /** Its own pages on social networks. */
  socials?: { facebook?: string; instagram?: string; linkedin?: string }
  /** The posts it hires for; without them, the app reads them from `careers`. */
  roles?: CompanyRole[]
  /** Its leadership and public spokespeople. */
  people?: CompanyPerson[]
}

export type InternshipKind = 'trainee' | 'estagio_profissional' | 'estagio_curricular' | 'programa_publico'
export type InternshipAudience = 'finalista' | 'recem_formado' | 'medio_tecnico' | 'licenciado'

/** A real internship or trainee programme a young Angolan can apply to, with its public source. */
export type Internship = {
  id: string
  name: string
  provider: string
  /** The provider's id in COMPANIES, when it is one. */
  companyId?: string
  kind: InternshipKind
  /** Empty: open to any area. */
  areas: MarketArea[]
  /** Empty: the source names no schooling level. */
  audience: InternshipAudience[]
  minAge?: number
  maxAge?: number
  /** null: no source says. */
  paid: boolean | null
  durationMonths?: number
  province?: string
  requirements: string[]
  /** Last day to apply (ISO), only when published for 2026/27; otherwise null. */
  deadline: string | null
  recurring: boolean
  url: string
  sources: SourceLink[]
  checkedAt: string
}

/** null: no source says what the course gives at the end. */
type FreeCourseCertificate = 'gratis' | 'pago' | 'nenhum' | null

/** A free, good online course to start a career without paying, with what it gives at the end and its source. */
export type FreeCourse = {
  id: string
  name: string
  provider: string
  languages: ('pt' | 'en' | 'fr')[]
  careerSlugs: string[]
  areas: MarketArea[]
  /** Only when the provider publishes it. */
  hours?: number
  certificate: FreeCourseCertificate
  /** What the certificate is (e.g. "badge Credly"), only with a source. */
  credential?: string
  /** What the certificate costs, in US dollars, before tax; only when the provider publishes one price. */
  priceUsd?: number
  level: 'iniciante' | 'intermedio' | 'avancado'
  url: string
  sources: SourceLink[]
  checkedAt: string
}

type ScholarshipKind = 'estado' | 'empresa' | 'fundacao' | 'governo_estrangeiro' | 'universidade'
type ScholarshipCover = 'propina' | 'subsidio' | 'viagem' | 'alojamento'

/** A real scholarship a young Angolan can apply for, with its public source. */
export type Scholarship = {
  id: string
  name: string
  provider: string
  /** The provider's id in COMPANIES, when it is one. */
  companyId?: string
  kind: ScholarshipKind
  destination: 'angola' | 'exterior'
  levels: AcademyOffer['level'][]
  /** Empty: open to any area. */
  areas: MarketArea[]
  /** Only what a source says it covers. */
  covers: ScholarshipCover[]
  minAge?: number
  maxAge?: number
  requirements: string[]
  /** Last day to apply (ISO), only when published for 2026/27; otherwise null. */
  deadline: string | null
  recurring: boolean
  url: string
  sources: SourceLink[]
  checkedAt: string
}

/** Access to higher education in 2026/27: one institution's access exam, or the MESCTI national calendar. */
export type Admission = {
  id: string
  /** null: the national calendar (MESCTI). */
  academyId: string | null
  /** CatalogCourse ids; omitted, every course of the institution. */
  courseIds?: string[]
  year: '2026/27'
  /** ISO dates; null when no source gives them. */
  registration: { start: string | null; end: string | null }
  /** ISO dates, one per exam day. */
  examDates: string[]
  /** The subjects of the exam; empty when no source gives them. */
  subjects: string[]
  vacancies?: number
  /** 0–20, the grade of the last candidate admitted, only with a source. */
  minGrade?: { value: number; year: string }
  /** Registration fee in kwanzas (one option). */
  fee?: number
  requirements: string[]
  url: string
  sources: SourceLink[]
  checkedAt: string
}

export const NEWS_KINDS = ['kaye', 'eventos', 'cursos', 'empresas', 'analise'] as const
export type NewsKind = (typeof NEWS_KINDS)[number]

/** The topics the person follows on Novidades: shown first there and sent to Notificações. */
export type Subscriptions = { areas: MarketArea[]; kinds: NewsKind[] }

const EVENT_FORMATS = ['conferencia', 'palestra', 'networking', 'workshop', 'feira', 'hackathon'] as const
type EventFormat = (typeof EVENT_FORMATS)[number]

/** A talk, conference, networking or fair open to the public (Novidades, "Eventos"). */
export type NewsEvent = {
  /** First and last day, "2026-11-14"; `ends` only when it lasts more than one day. */
  starts: string
  ends?: string
  /** "09h00", "08h00–15h00", as the organiser publishes it. */
  time?: string
  venue: string
  city: string
  formats: EventFormat[]
  /** Whether it costs anything to get in, and the cheapest ticket as published. */
  free: boolean
  price?: string
  organizer?: string
  /** Where to sign up or buy the ticket. */
  register?: SourceLink
  /** Something on the date or the details is not confirmed by the organiser. */
  unconfirmed?: boolean
}

/** Novidades: what changed in Kayé, and what institutions and companies did. */
export type NewsItem = {
  id: string
  /** Day it happened (or, for a published fact, the day it reached Kayé): "2026-10-27". */
  date: string
  kind: NewsKind
  title: string
  summary: string
  /** Paragraphs shown when the piece is opened, on Novidades. */
  body?: string[]
  /** Illustrative: never a portrait of the people in the piece. */
  image?: Photo
  /** The page of the app it is about. */
  to?: string
  /** Where a fact about an institution or a company was published. */
  source?: SourceLink
  /** Made up for the demonstration, about an "Exemplo" institution. */
  example?: boolean
  /** The careers it is about: "Para ti" when one of them is saved or the destination. */
  careers?: string[]
  /** The companies it is about (their ids): "Para ti" when one of them is saved. */
  companies?: string[]
  /** For "eventos": when, where and how to get in. */
  event?: NewsEvent
}

/** Figuras da semana: a real person worth following, with a role confirmed in a public source. */
export type Figure = {
  id: string
  name: string
  role: string
  /** One sentence: why they inspire. */
  why: string
  careers: string[]
  /** Their own verified public profile. */
  follow: { label: string; url: string }
  source: SourceLink
  /** Only with a free licence; without one, the app shows the initials. */
  photo?: string
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
  /** Candidates, first-year students and all students of the same academic year (Quadro 1.2), and the places
   * offered, public and private (Quadro 1.3). */
  access: { candidates: number; firstTime: number; enrolled: number; places: number }
  source: SourceLink
  /** Graduates of the year and students now ("enrolled"): the graduates of the coming years. */
  areas: {
    area: MarketArea
    graduates: number
    enrolled: number
    /** Candidates to its courses and those admitted (Quadro 4.4): the yearbook has no places per course. */
    candidates: number
    admitted: number
    courses: { name: string; graduates: number; enrolled: number }[]
  }[]
  /** Graduates per province, public and private (Quadros 2.8 and 2.9). */
  provinces: { province: string; graduates: number }[]
  series: { year: string; graduates: number; source: SourceLink }[]
}

/** "Como cheguei aqui": a professional's path into a career, in a few sentences, and one tip. */
export type Testimonial = {
  id: string
  careerSlug: string
  /** Only as published, and then `source` says where; examples have none. */
  name?: string
  role: string
  place?: string
  years?: number
  /** 2–4 sentences, at most 350 characters. */
  path: string
  /** At most 140 characters. */
  tip: string
  companyId?: string
  /** Made up for the demonstration, coherent with the career's guide: never a real person. */
  example?: true
} & ({ name: string; source: SourceLink } | { name?: undefined; source?: SourceLink })

type SupportProgramKind = 'credito' | 'kit' | 'formacao' | 'registo' | 'incubadora'

/** A real public or partner programme that helps someone start on their own, with its source (2025–2026). */
export type SupportProgram = {
  id: string
  name: string
  provider: string
  kind: SupportProgramKind
  /** Who it is for, in a few words. */
  audience: string
  minAge?: number
  url: string
  sources: SourceLink[]
  checkedAt: string
}

/** Working on one's own in a career: plausible editorial content, always estimated (see data-to-collect-later). */
export type SelfEmployment = {
  fit: 'comum' | 'possivel' | 'raro'
  /** How people do it in Angola (≤ 300 characters). */
  how: string
  /** What it costs to start, in Kz. */
  startCost?: { min: number; max: number; estimated: true }
  firstSteps: string[]
  formalise: string[]
  /** Ids in SUPPORT_PROGRAMS. */
  programIds: string[]
  estimated: true
}

/**
 * "O meu dia como…": a 60–90 s video recorded by Kayé with a professional (docs/videos.md). Only with written
 * consent (`consentAt`), never a minor. It opens on the platform: no iframes, the CSP stays as it is.
 */
export type VideoStory = {
  id: string
  careerSlug: string
  name: string
  role: string
  company?: string
  title: string
  url: string
  platform: 'youtube' | 'tiktok' | 'instagram'
  durationSeconds: number
  /** File name in assets/videos/; the cover is never loaded from outside. */
  thumbnail?: string
  /** ISO date of the signed consent. */
  consentAt: string
  /** ISO date. */
  recordedAt: string
}

/** A volunteer approved by Kayé to talk with young people about their career (docs/mentores.md). */
export type Mentor = {
  id: string
  name: string
  role: string
  company?: string
  /** Career slugs. */
  careers: string[]
  /** At most 280 characters. */
  bio: string
  /** ISO codes: 'pt', 'en', 'fr', 'umb', 'kmb'… */
  languages: string[]
  /** File name in assets/mentors/. */
  photo?: string
  /** ISO date of the signed consent. */
  consentAt: string
  /** Minors only see 'grupo'. */
  availability: 'grupo' | 'individual'
}
