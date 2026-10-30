import type { Career, Pathway, PathwayStep } from '../types'
import {
  CV_AVOID,
  degree,
  healthGuide,
  NINTH,
  SECONDARY,
  stageSalaries,
  stateMarket,
  technicalCourse,
} from './healthGuideParts'

// The career of the professionals of diagnosis and therapy, which the guides of the diagnosis, pharmacy,
// rehabilitation, oral health, public health and mental health groups share (ADR 0010):
// - the professions, the categories, how one enters and is promoted, the working time: Regime Jurídico da Carreira dos
//   Profissionais de Diagnóstico e Terapêutica (Decreto Presidencial n.º 188/18, articles 5, 7 to 11 and annex);
// - the base salary of each category: the 2026 table (Decreto Presidencial n.º 16/26);
// - the 2026 public competition: Despacho Conjunto n.º 42/26 (588 places with a degree, none without);
// - the technicians in the national health service: MINSA, Anuário Estatístico Sanitário 2023 (10 273);
// - about 400 places of speciality for these technicians, announced in September 2026 (Ver Angola).
// Few job ads (under ten a year for each): like the nurses, their guides show the State's places instead.

/** The career's 2026 base salaries, in Kz a month (Decreto Presidencial n.º 16/26). */
const SALARY = {
  /** Técnico Superior de 2.ª Classe, de 1.ª Classe and Principal, then Técnico Especialista de 2.ª Classe. */
  graduate: [361_910, 410_165, 458_419, 506_674],
  /** Técnico Médio de 2.ª and 1.ª Classe, then Técnico Médio Especializado de 3.ª Classe. */
  technician: [156_828, 168_891, 180_955],
}

const COMPETITION: PathwayStep = {
  kind: 'experiencia',
  title: 'Concurso público para Técnico Superior de Diagnóstico e Terapêutica',
  need: 'essencial',
  description:
    'Entras no Estado como Técnico Superior de 2.ª Classe: em 2026, só os hospitais centrais abriram 588 vagas, e nenhuma para quem tem só o curso médio.',
  months: null,
}

const TECHNICAL_COMPETITION: PathwayStep = {
  kind: 'experiencia',
  title: 'Concurso público para Técnico Médio de Diagnóstico e Terapêutica',
  need: 'essencial',
  description:
    'Entras no Estado como Técnico Médio de 2.ª Classe. Em 2026, os hospitais centrais não abriram vagas para técnicos médios.',
  months: null,
}

const SPECIALITY: PathwayStep = {
  kind: 'formacao',
  title: 'Curso de especialidade',
  need: 'opcional',
  description:
    'Dá entrada como Técnico Especialista de Diagnóstico e Terapêutica (506 674 Kz em 2026). Em Setembro de 2026, o Ministério da Saúde anunciou cerca de 400 vagas de especialização para estes técnicos.',
  months: null,
}

/** The way the State hires: the degree, then what the profession asks after it (`after`), then the competition. */
export function graduate(course: string, after: PathwayStep[] = []): Pathway {
  return {
    id: 'licenciatura',
    name: `Licenciatura em ${course}`,
    summary: 'O caminho por onde o Estado contrata: a licenciatura e o concurso para Técnico Superior.',
    steps: [SECONDARY, degree(course), ...after, COMPETITION, SPECIALITY],
    totalCost: null,
  }
}

export function technician(course: string, suspended = false): Pathway {
  return {
    id: 'curso-medio',
    name: `Curso médio de ${course}`,
    summary: 'Fazes o curso médio a seguir à 9.ª classe e concorres a Técnico Médio, quando houver vagas.',
    steps: [NINTH, technicalCourse(course, suspended), TECHNICAL_COMPETITION],
    totalCost: null,
  }
}

/** The categories, four years each at least (article 9), counting from entry. */
const STAGES: Record<keyof typeof SALARY, Career['stages']> = {
  graduate: [
    {
      level: 'junior',
      title: 'Técnico Superior de Diagnóstico e Terapêutica de 2.ª Classe',
      years: { min: 0, max: 4 },
      responsibilities: [
        'Faz o trabalho técnico da profissão',
        'Garante a qualidade e a segurança do que faz',
      ],
    },
    {
      level: 'pleno',
      title: 'Técnico Superior de 1.ª Classe',
      years: { min: 4, max: 8 },
      responsibilities: ['Orienta os técnicos novos', 'Escolhe e controla os métodos de trabalho'],
    },
    {
      level: 'senior',
      title: 'Técnico Superior Principal',
      years: { min: 8, max: 12 },
      responsibilities: ['Participa no planeamento do serviço', 'Faz estudos e dá pareceres técnicos'],
    },
    {
      level: 'lideranca',
      title: 'Técnico Especialista, com uma especialidade',
      years: { min: 12, max: null },
      responsibilities: ['Responde pelas técnicas mais diferenciadas', 'Forma os colegas da área'],
    },
  ],
  technician: [
    {
      level: 'junior',
      title: 'Técnico Médio de Diagnóstico e Terapêutica de 2.ª Classe',
      years: { min: 0, max: 4 },
      responsibilities: ['Faz o trabalho técnico de rotina', 'Regista o que faz e cuida do material'],
    },
    {
      level: 'pleno',
      title: 'Técnico Médio de 1.ª Classe',
      years: { min: 4, max: 8 },
      responsibilities: ['Faz técnicas mais complexas', 'Acompanha os técnicos novos e os auxiliares'],
    },
    {
      level: 'senior',
      title: 'Técnico Médio Especializado, com uma especialização',
      years: { min: 8, max: null },
      responsibilities: ['Responde pelas técnicas da sua especialização', 'Propõe formação e novos métodos'],
    },
  ],
}

const NOTE =
  'Estes técnicos entram no Estado por concurso público e quase não aparecem nos sites de emprego. Em Maio de 2026, os hospitais centrais abriram 588 vagas de Técnico Superior de Diagnóstico e Terapêutica e nenhuma de Técnico Médio (Despacho Conjunto n.º 42/26). Em 2023 trabalhavam 10 273 técnicos de diagnóstico e terapêutica no Serviço Nacional de Saúde.'

const HIRING = [
  'Hospitais e centros de saúde públicos',
  'Clínicas e hospitais privados',
  'Laboratórios e centros de diagnóstico privados',
  'Serviços de saúde das Forças Armadas e da Polícia',
]

const CV_GUIDE: Career['cvGuide'] = {
  template: 'classico',
  include: [
    'O número de inscrição na Ordem, nas profissões que a têm, logo no topo',
    'Os estágios, com o hospital, o serviço e a duração',
    'As técnicas e os equipamentos que sabes usar',
    'A especialidade, com a escola e o ano',
  ],
  avoid: CV_AVOID,
}

type Guide = Omit<Parameters<typeof healthGuide>[0], 'cvGuide' | 'market' | 'stages'> & {
  demand: Career['market']['demand']
  /** The degree's ladder and salaries (the default), or those of the technical course. */
  level?: keyof typeof SALARY
  hiring?: string[]
  /** What is known of the demand; the 2026 places by default. */
  note?: Parameters<typeof stateMarket>[2]
}

/** A guide of a profession of this career. */
export function therapyGuide({
  demand,
  level = 'graduate',
  hiring = HIRING,
  note = NOTE,
  ...rest
}: Guide): Career {
  return healthGuide({
    ...rest,
    stages: STAGES[level],
    market: stateMarket(demand, stageSalaries(...SALARY[level]), note, hiring),
    cvGuide: CV_GUIDE,
  })
}
