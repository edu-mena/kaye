import type { Career, PathwayStep } from '../types'
import { detailedHealthCareer } from './healthCareers'

// What the full guides of the health careers share (ADR 0010): the school steps, the 2026 public competition of the
// Ministry of Health and the market of a career the State hires by competition, which the job sites do not show.

/** The 2026 public competition of the central hospitals (Despacho Conjunto n.º 42/26). */
const COMPETITION_2026 = {
  label: 'Despacho Conjunto n.º 42/26: as vagas do Ministério da Saúde (AngoLEX)',
  url: 'https://angolex.com/paginas/despachos/atribui-3037a-vagas-concurso-publico-ingresso-externo-ministerio-saude-servicos-superintendidos-42a-26a.html',
}

/** The Ministry of Health's 2023 yearbook. */
export const MINSA_2023 = {
  label: 'MINSA, Anuário Estatístico Sanitário 2023',
  url: 'https://www.ine.gov.ao/Arquivos/arquivosCarregados/Carregados/Publicacao_639110352357683245.pdf',
}

export const NINTH: PathwayStep = {
  kind: 'academico',
  level: 'i_ciclo',
  title: '9.ª classe concluída',
  need: 'essencial',
  description: 'Dá acesso ao ensino secundário técnico-profissional, onde estão os cursos médios de saúde.',
  months: null,
}

export const SECONDARY: PathwayStep = {
  kind: 'academico',
  level: 'ii_ciclo',
  title: 'Ensino médio concluído',
  need: 'essencial',
  description: '12.ª classe, de preferência em Ciências Físicas e Biológicas, ou um curso médio de saúde.',
  months: null,
}

export function degree(course: string): PathwayStep {
  return {
    kind: 'academico',
    level: 'licenciatura',
    title: `Licenciatura em ${course}`,
    need: 'essencial',
    description: 'Quatro a cinco anos numa escola superior pública ou privada, com estágios nos hospitais.',
    months: { min: 48, max: 60 },
  }
}

/**
 * A health course of the technical secondary school. Enfermagem and Análises Clínicas are suspended for five years
 * from 2025/2026 in ten provinces (Decreto Executivo n.º 01/25).
 */
export function technicalCourse(course: string, suspended = false): PathwayStep {
  const warning = suspended
    ? ' Atenção: desde 2025/2026, e durante 5 anos, não abre em Luanda e noutras nove províncias; nas restantes, só nas escolas com condições (Decreto Executivo n.º 01/25).'
    : ''
  return {
    kind: 'academico',
    level: 'medio_tecnico',
    title: `Curso médio técnico de ${course}`,
    need: 'essencial',
    description: `Quatro anos, da 10.ª à 13.ª classe, num instituto técnico de saúde, com estágios nos hospitais.${warning}`,
    months: { min: 48, max: 48 },
  }
}

/** The salary of each stage, in the stages' order. */
export function stageSalaries(...salaries: number[]): Career['market']['salaryByStage'] {
  const levels = ['junior', 'pleno', 'senior', 'lideranca'] as const
  return salaries.map((median, index) => ({ level: levels[index], median }))
}

/**
 * The market of a career the job sites do not show: no ads or trend, what is known of the demand instead (a text
 * about the 2026 places, whose source is the competition, or a text with its own source).
 */
export function stateMarket(
  demand: Career['market']['demand'],
  salaryByStage: Career['market']['salaryByStage'],
  note: string | NonNullable<Career['market']['demandNote']>,
  hiringSectors: string[],
) {
  return {
    demand,
    trendPct: null,
    demandNote: typeof note === 'string' ? { text: note, source: COMPETITION_2026 } : note,
    salary: null,
    salaryByStage,
    postingsByMonth: [],
    hiringSectors,
  } satisfies Career['market']
}

export const CV_AVOID = [
  'Fotografias e dados pessoais que a candidatura não pede',
  'Competências sem dizer onde as praticaste',
  'Erros nas datas e nos nomes dos hospitais',
]

type Parts = Omit<Career, keyof ReturnType<typeof detailedHealthCareer> | 'employerAsks'> & { slug: string }

/** A health career's full guide: its summary and its parts; the State hires by competition, so no employers' asks. */
export function healthGuide({ slug, ...parts }: Parts): Career {
  return { ...detailedHealthCareer(slug), ...parts, employerAsks: null }
}
