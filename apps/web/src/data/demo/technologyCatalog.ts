import catalog from '../catalog/technology.json'
import { buildArea, type AreaData } from './areaCatalog'
import { CAREER_SUMMARIES } from './careers'

// Technology, from scrapers/catalog/technology.json (python -m catalog.technology): every higher education institution
// with computing, networks, telecommunications or electronics courses (MESCTI yearbook 2023-2024). The employers are
// in companies.ts, each with its source.

const SOFTWARE = [
  'desenvolvedor-backend',
  'desenvolvedor-frontend',
  'desenvolvedor-full-stack',
  'desenvolvedor-mobile',
  'engenheiro-de-qa',
  'engenheiro-de-dados',
  'engenheiro-devops',
  'administrador-de-base-de-dados',
  'administrador-de-sistemas',
  'analista-de-sistemas',
  'analista-de-ciberseguranca',
  'gestor-de-ti',
]
const MANAGEMENT = [
  'analista-de-sistemas',
  'analista-de-bi',
  'analista-de-dados',
  'administrador-de-base-de-dados',
  'gestor-de-projetos-de-ti',
  'product-manager',
  'comercial-de-ti',
  'gestor-de-ti',
]
const TELECOM = ['engenheiro-de-telecomunicacoes', 'tecnico-de-telecomunicacoes', 'administrador-de-redes']

export const TECHNOLOGY = buildArea(catalog as AreaData, {
  careers: CAREER_SUMMARIES,
  courses: 'tecnologia',
  courseCareers: [
    [
      /redes e administracao/,
      [
        'administrador-de-redes',
        'administrador-de-sistemas',
        'engenheiro-devops',
        'analista-de-ciberseguranca',
        'tecnico-de-suporte',
      ],
    ],
    [/telecomunica/, TELECOM],
    [/electr/, ['engenheiro-de-telecomunicacoes', 'tecnico-de-telecomunicacoes', 'tecnico-de-hardware']],
    [
      /ciencias da computacao/,
      [
        'cientista-de-dados',
        'engenheiro-de-dados',
        'analista-de-dados',
        'desenvolvedor-backend',
        'desenvolvedor-full-stack',
        'engenheiro-de-qa',
      ],
    ],
    [/gest/, MANAGEMENT],
    [/informatica/, SOFTWARE],
  ],
  employs: [],
  fallback: [],
  sector: 'tecnologia',
  source: catalog.sources.jobs,
  describe: () => '',
})
