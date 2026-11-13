import {
  type Career,
  type CareerSummary,
  type Company,
  type CompanyRole,
  type CompanySector,
  EDUCATION_LEVELS,
  type EducationLevel,
  type SourceLink,
} from '../data/types'

/** How a company usually takes people in, step by step. */
type HiringStep = 'programa' | 'portal' | 'concurso' | 'provas' | 'perfil' | 'tecnica' | 'entrevista'

/**
 * What it takes to work as a career at one company, estimated from the career's own data (skills, paths,
 * stages) and the company's sector and programmes, except what the company published: the experience its job ad
 * asked for and how it selects (docs: data to collect later).
 */
export type CompanyNeeds = {
  skills: string[]
  education: { level: EducationLevel; title: string } | null
  certifications: string[]
  /** Years before getting in; 0 also when an internship programme is the door. */
  experienceYears: number
  hiring: HiringStep[]
  /** A task from the company's own job ad. */
  duty?: string
  /** Where the experience and the hiring steps were published; without one, they are estimated. */
  published: { experience?: SourceLink; hiring?: SourceLink }
  /** Skills and education are always estimated. */
  estimated: true
}

type PublishedNeeds = {
  hiring?: { steps: HiringStep[]; source: SourceLink }
  careers?: Record<string, { experienceYears: number; duty: string; source: SourceLink }>
}

const BAI_ADS: SourceLink = {
  label: 'Jobartis, anúncios do BAI',
  url: 'https://www.jobartis.com/vagas-emprego/BAI+(Banco+Angolano+de+Investimentos)',
}

/** What companies published (collected 05/11/2026), by company id. */
const PUBLISHED: Record<string, PublishedNeeds> = {
  bai: {
    careers: {
      'analista-de-ciberseguranca': {
        experienceYears: 5,
        duty: 'Avaliar vulnerabilidades de segurança em sistemas internos, aplicações web e dispositivos móveis.',
        source: BAI_ADS,
      },
      'tecnico-de-compliance': {
        experienceYears: 5,
        duty: 'Reunir, validar e analisar a informação para relatórios ou pareceres.',
        source: BAI_ADS,
      },
      'tecnico-de-recursos-humanos': {
        experienceYears: 3,
        duty: 'Gerir os seguros de acidentes de trabalho, doenças profissionais e saúde.',
        source: BAI_ADS,
      },
    },
  },
  bfa: {
    // The Futuro BFA trainee programme: application, screening, knowledge tests, behavioural profile, interview.
    hiring: {
      steps: ['programa', 'portal', 'provas', 'perfil', 'entrevista'],
      source: {
        label: 'BFA, Futuro BFA',
        url: 'https://careers.bfa.ao/lp/%23Futuro%20BFA/dfd879f1e9b8e653/?locale=pt_PT',
      },
    },
  },
}

/** Large, formal employers: they ask for the degree and some experience, and test before they interview. */
const FORMAL = new Set<CompanySector>([
  'banca',
  'seguros',
  'energia',
  'mineracao',
  'telecomunicacoes',
  'estado',
  'justica',
  'saude',
  'consultoria',
])

const PUBLIC = new Set<CompanySector>(['estado', 'justica'])
const TECHNICAL = new Set<CompanySector>(['tecnologia', 'consultoria', 'telecomunicacoes'])

export function companyNeeds(company: Company, career: Career): CompanyNeeds {
  const formal = FORMAL.has(company.sector)
  const essential = career.skills.filter((skill) => skill.importance === 'essencial')
  const steps = career.pathways.flatMap((pathway) => pathway.steps)
  const academic = steps.flatMap((step) =>
    step.kind === 'academico' && step.level ? [{ level: step.level, title: step.title }] : [],
  )
  // A formal employer asks for the most common degree (licenciatura when a path has one); the rest take the
  // shortest academic path.
  const byLevel = academic.toSorted((a, b) => rank(a.level) - rank(b.level))
  const education =
    (formal ? (academic.find((step) => step.level === 'licenciatura') ?? byLevel.at(-1)) : byLevel[0]) ?? null
  const certifications = [
    ...new Set(
      steps
        .filter((step) => step.kind === 'certificacao' && step.need !== 'opcional')
        .map((step) => step.title),
    ),
  ]
  const junior = career.stages.find((stage) => stage.level === 'junior')?.years.min ?? 0
  const programme = company.programs.length > 0
  const published = PUBLISHED[company.id]
  const ad = published?.careers?.[career.slug]
  return {
    skills: (essential.length > 0 ? essential : career.skills).slice(0, 6).map((skill) => skill.name),
    education,
    certifications: certifications.slice(0, 3),
    experienceYears: ad ? ad.experienceYears : programme ? 0 : formal ? Math.max(1, junior) : junior,
    hiring: published?.hiring?.steps ?? hiring(company.sector, programme),
    ...(ad ? { duty: ad.duty } : {}),
    published: {
      ...(ad ? { experience: ad.source } : {}),
      ...(published?.hiring ? { hiring: published.hiring.source } : {}),
    },
    estimated: true,
  }
}

function hiring(sector: CompanySector, programme: boolean): HiringStep[] {
  const steps: HiringStep[] = PUBLIC.has(sector)
    ? ['concurso', 'provas', 'entrevista']
    : TECHNICAL.has(sector)
      ? ['portal', 'tecnica', 'entrevista']
      : FORMAL.has(sector)
        ? ['portal', 'provas', 'entrevista']
        : ['portal', 'entrevista']
  return programme ? ['programa', ...steps] : steps
}

function rank(level: EducationLevel): number {
  return EDUCATION_LEVELS.indexOf(level)
}

/**
 * The posts a company hires for: the ones it advertised, each with its ad; without them, one per career it hires
 * for, read from those careers (the screen says whether a public source names them or it is our reading).
 */
export function companyRoles(company: Company, careers: readonly CareerSummary[]): CompanyRole[] {
  if (company.roles && company.roles.length > 0) return company.roles
  return careers.map((career) => ({ title: career.name, careers: [career.slug] }))
}
