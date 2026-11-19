import type { Academy, AcademyOffer, SourceLink } from '../types'
import { HEALTH_CAREERS } from './healthCareers'

// The middle-level health schools: the institutes created by the Ministry of Education's decrees (lex.ao) and the
// schools of the health technicians' network (RETS, Fiocruz). Enfermagem and Análises Clínicas are left out where
// they are suspended (Decreto Executivo n.º 01/25). Ownership stays null when the source does not state it.

const COURSE_CAREERS = {
  enfermagem: ['Técnico de Enfermagem', 'tecnico-medio-enfermagem'],
  analises: ['Técnico de Análises Clínicas', 'tecnico-analises-clinicas'],
  anatomia: ['Técnico de Anatomia Patológica', 'tecnico-anatomia-patologica'],
  cardiopneumologia: ['Técnico de Cardiopneumologia', 'cardiopneumologista'],
  estomatologia: ['Técnico de Estomatologia', 'tecnico-estomatologia'],
  farmacia: ['Técnico de Farmácia', 'tecnico-farmacia'],
  fisioterapia: ['Técnico de Fisioterapia', 'fisioterapeuta'],
  nutricao: ['Técnico de Nutrição e Dietética', 'nutricionista'],
  ortoprotesia: ['Técnico de Ortoprotesia', 'ortoprotesico'],
  ortoptica: ['Técnico de Ortóptica', 'ortoptista'],
  radiologia: ['Técnico de Radiologia', 'tecnico-radiologia'],
  ambiental: ['Técnico de Saúde Ambiental', 'tecnico-saude-ambiental'],
} as const

type HealthCourse = keyof typeof COURSE_CAREERS

const offer = (key: HealthCourse, recognition?: SourceLink): AcademyOffer => {
  const [name, career] = COURSE_CAREERS[key]
  const group = HEALTH_CAREERS.find((summary) => summary.slug === career)?.group
  return {
    course: { id: `tecnico-${key}`, name },
    name,
    level: 'medio_tecnico',
    ...(recognition ? { recognition } : {}),
    careers: [career],
    areas: group ? [group] : [],
  }
}

const decree = (label: string, path: string): SourceLink => ({
  label: `Decreto Executivo n.º ${label}`,
  url: `https://lex.ao/docs/ministerio-da-educacao/${path}/`,
})
const rets = (path: string): SourceLink => ({
  label: 'RETS, Fiocruz',
  url: `https://www.rets.epsjv.fiocruz.br/en/${path}`,
})

const SUSPENSION: SourceLink = {
  label: 'O País, 27/06/2025',
  url: 'https://www.opais.ao/sociedade/governo-suspende-cursos-tecnicos-de-enfermagem-e-analises-clinicas-em-todos-institutos-de-saude-durante-5-anos/',
}
const SUSPENDED = 'Enfermagem e Análises Clínicas estão suspensas por 5 anos nesta província desde 2025/26.'
const CONDITIONAL =
  'Nesta província, a matrícula em Enfermagem e Análises Clínicas depende de a escola cumprir as condições do Decreto Executivo n.º 01/25.'
const PREDICTED =
  'Os cursos indicados são os previstos para esta rede de escolas (Decreto Executivo Conjunto n.º 97/11): confirma com a escola os que abrem este ano.'

function institute(
  name: string,
  province: string,
  place: string,
  courses: HealthCourse[],
  source: SourceLink,
  notes: string,
): Academy {
  return {
    id: name
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, ''),
    name,
    type: 'instituto_medio',
    ownership: null,
    province,
    place,
    summary: `Instituto médio de saúde criado por decreto do Ministério da Educação. ${notes}`,
    offers: courses.map((course) => offer(course, source)),
    sources: [source],
  }
}

export const HEALTH_SCHOOLS: Academy[] = [
  institute(
    'Instituto Técnico de Saúde do Huambo',
    'Huambo',
    'Huambo',
    ['fisioterapia', 'radiologia', 'farmacia', 'estomatologia', 'cardiopneumologia'],
    decree('193/24', '2024/decreto-executivo-n-o-193-24-de-01-de-novembro'),
    SUSPENDED,
  ),
  institute(
    'Instituto Técnico de Saúde do Kilamba n.º 2.010',
    'Luanda',
    'Belas, Luanda',
    ['estomatologia', 'farmacia', 'fisioterapia', 'nutricao', 'radiologia'],
    decree('194/24', '2024/decreto-executivo-n-o-194-24-de-01-de-novembro'),
    SUSPENDED,
  ),
  institute(
    'Instituto Técnico de Saúde BG n.º 1.081',
    'Benguela',
    'Benguela',
    ['fisioterapia', 'radiologia'],
    decree('200/24', '2024/decreto-executivo-n-o-200-24-de-05-de-novembro'),
    SUSPENDED,
  ),
  institute(
    'Instituto Técnico de Saúde Luís Ngongoyavo',
    'Bié',
    'Andulo, Bié',
    ['enfermagem', 'analises', 'farmacia', 'nutricao'],
    decree('265/23', '2023/decreto-executivo-n-o-265-23-de-20-de-dezembro'),
    CONDITIONAL,
  ),
  institute(
    'Instituto Técnico de Saúde Madre Teresa de Saldanha',
    'Luanda',
    'Viana, Luanda',
    ['farmacia', 'fisioterapia'],
    decree('6/23', '2023/decreto-executivo-n-o-6-23-de-09-de-janeiro'),
    SUSPENDED,
  ),
  institute(
    'Instituto Técnico de Saúde do Sequele n.º 4.105',
    'Luanda',
    'Cacuaco, Luanda',
    ['farmacia'],
    decree('363/22', '2022/decreto-executivo-n-o-363-22-de-15-de-agosto'),
    SUSPENDED,
  ),
  institute(
    'Instituto Técnico de Saúde do Uíge',
    'Uíge',
    'Uíge',
    ['farmacia', 'radiologia'],
    decree('325/25', '2025/decreto-executivo-n-o-325-25-de-05-de-fevereiro'),
    SUSPENDED,
  ),
  institute(
    'Instituto Técnico de Saúde n.º 5.146',
    'Luanda',
    'Zango 5, Viana, Luanda',
    ['farmacia', 'fisioterapia', 'radiologia', 'estomatologia', 'cardiopneumologia'],
    decree('214/20', '2020/decreto-executivo-n-o-214-20-de-17-de-julho'),
    SUSPENDED,
  ),
  {
    id: 'escola-de-formacao-de-tecnicos-de-saude-de-luanda',
    name: 'Escola de Formação de Técnicos de Saúde de Luanda',
    type: 'instituto_medio',
    ownership: 'publica',
    province: 'Luanda',
    place: 'Rua da Samba, 13, Maianga, Luanda',
    summary: `Escola pública de técnicos de saúde. Em Julho de 2025, a Ver Angola noticiou a Escola Técnica de Saúde de Luanda - IMS entre as impedidas de matricular: confirma antes de te inscreveres. ${SUSPENDED} ${PREDICTED}`,
    offers: (
      [
        'anatomia',
        'cardiopneumologia',
        'estomatologia',
        'farmacia',
        'fisioterapia',
        'nutricao',
        'ortoprotesia',
        'ortoptica',
        'radiologia',
        'ambiental',
      ] as const
    ).map((course) => offer(course)),
    sources: [
      rets('members/escola-de-formacao-de-tecnicos-de-saude-de-luanda'),
      SUSPENSION,
      {
        label: 'Ver Angola, Julho de 2025',
        url: 'https://www.verangola.net/va/pt/072025/Saude/44961/Sindicato-de-enfermeiros-concorda-com-encerramento-de-cursos-sem-condições-de-funcionamento.htm',
      },
    ],
  },
  {
    id: 'escola-de-formacao-de-tecnicos-de-saude-de-benguela',
    name: 'Escola de Formação de Técnicos de Saúde de Benguela',
    type: 'instituto_medio',
    ownership: 'publica',
    province: 'Benguela',
    place: 'Rua 10 de Fevereiro, 2, Benguela',
    website: 'https://www.facebook.com/EFTSBngla/',
    summary: `Antigo Instituto Médio de Saúde de Benguela. Entra-se por exame de conhecimentos gerais, português, biologia e química. Telefone: +244 27223843. Email: escolasaude2013@hotmail.com. ${SUSPENDED}`,
    offers: (['radiologia', 'estomatologia', 'fisioterapia'] as const).map((course) => offer(course)),
    sources: [rets('node/503'), SUSPENSION],
  },
  {
    id: 'escola-de-formacao-de-tecnicos-de-saude-da-lunda-norte',
    name: 'Escola de Formação de Técnicos de Saúde da Lunda Norte',
    type: 'instituto_medio',
    ownership: 'publica',
    province: 'Lunda Norte',
    place: 'Dundo, Lunda Norte',
    summary: `Escola pública de técnicos de saúde. Telefone: +244 923357180. ${CONDITIONAL} ${PREDICTED}`,
    offers: (['enfermagem', 'analises', 'farmacia'] as const).map((course) => offer(course)),
    sources: [rets('node/505'), SUSPENSION],
  },
  {
    id: 'escola-de-formacao-de-tecnicos-de-saude-do-bie',
    name: 'Escola de Formação de Técnicos de Saúde do Bié',
    type: 'instituto_medio',
    ownership: 'publica',
    province: 'Bié',
    place: 'Bié',
    summary: `Escola pública de técnicos de saúde. ${CONDITIONAL} ${PREDICTED}`,
    offers: (['enfermagem', 'analises', 'farmacia'] as const).map((course) => offer(course)),
    sources: [rets('node/507'), SUSPENSION],
  },
  {
    id: 'escola-de-formacao-de-tecnicos-de-saude-do-huambo',
    name: 'Escola de Formação de Técnicos de Saúde do Huambo',
    type: 'instituto_medio',
    ownership: 'publica',
    province: 'Huambo',
    place: 'Huambo',
    summary: `Escola pública de técnicos de saúde. ${SUSPENDED} ${PREDICTED}`,
    offers: (['farmacia', 'radiologia'] as const).map((course) => offer(course)),
    sources: [rets('node/514'), SUSPENSION],
  },
  {
    id: 'instituto-tecnico-de-saude-do-kalawenda',
    name: 'Instituto Técnico de Saúde do Kalawenda (ITS - Kalawenda)',
    type: 'instituto_medio',
    ownership: null,
    province: 'Luanda',
    place: 'Kalawenda, Cazenga, Luanda',
    summary: `Instituto médio de saúde. Telefone: +244 923508261. ${SUSPENDED} ${PREDICTED}`,
    offers: (['farmacia', 'radiologia'] as const).map((course) => offer(course)),
    sources: [rets('members/instituto-tecnico-de-saude-do-kalawenda-its-kalawenda'), SUSPENSION],
  },
]
