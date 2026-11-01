import type { Course, Institution, Program, Schedule } from '../types'
import { PROGRAM_IMAGES } from './images'

// DEMO DATA. Institutions are fictional on purpose ("Exemplo"): a ranking with
// invented numbers must never carry a real institution's name.
const INSTITUTIONS = {
  uprivada: {
    id: 'uprivada',
    name: 'Universidade Exemplo',
    type: 'universidade',
    ownership: 'privada',
    province: 'Luanda',
  },
  upublica: {
    id: 'upublica',
    name: 'Universidade Pública Exemplo',
    type: 'universidade',
    ownership: 'publica',
    province: 'Luanda',
  },
  instituto: {
    id: 'instituto',
    name: 'Instituto Médio Politécnico Exemplo',
    type: 'instituto_medio',
    ownership: 'publica',
    province: 'Luanda',
  },
  academia: {
    id: 'academia',
    name: 'Academia Digital Exemplo',
    type: 'centro_formacao',
    ownership: 'privada',
    province: 'Luanda',
  },
  centro: {
    id: 'centro',
    name: 'Centro de Formação Exemplo',
    type: 'centro_formacao',
    ownership: 'privada',
    province: 'Luanda',
  },
  benguela: {
    id: 'benguela',
    name: 'Centro de Formação Exemplo Benguela',
    type: 'centro_formacao',
    ownership: 'privada',
    province: 'Benguela',
  },
  online: {
    id: 'online',
    name: 'Escola Online Exemplo',
    type: 'online',
    ownership: 'privada',
    province: 'Online',
  },
} satisfies Record<string, Institution>

// The courses in general. Each row below is one institution's offer of one of them.
export const COURSES = {
  'engenharia-informatica': 'Engenharia Informática',
  'ciencias-computacao': 'Ciências da Computação',
  'tecnico-informatica': 'Técnico de Informática',
  'desenvolvimento-web': 'Desenvolvimento Web',
  'analise-dados': 'Análise de Dados',
  estatistica: 'Estatística',
  'design-ui-ux': 'Design UI/UX',
  design: 'Design',
} satisfies Record<string, string>

type Row = [
  id: string,
  institution: keyof typeof INSTITUTIONS,
  name: string,
  level: Program['level'],
  months: number,
  schedule: Schedule[],
  cost: number,
  recognized: boolean,
  rating: [number, number] | null,
  careers: string[],
  course: keyof typeof COURSES,
]

const ROWS: Row[] = []

export const PROGRAMS: Program[] = ROWS.map(
  ([id, institution, name, level, months, schedule, cost, recognized, rating, careers, course]) => {
    const program: Program = {
      id,
      institution: INSTITUTIONS[institution],
      course: { id: course, name: COURSES[course] } satisfies Course,
      name,
      level,
      durationMonths: months,
      schedule,
      totalCost: cost,
      recognized,
      rating: rating ? { average: rating[0], count: rating[1] } : null,
      careers,
    }
    const image = PROGRAM_IMAGES[id]
    if (image) program.image = image
    return program
  },
)
