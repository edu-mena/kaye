import escola42Logo from '../../assets/academies/escola-42-luanda-logo.webp'
import inefopLogo from '../../assets/academies/inefop-logo.webp'
import isptecBanner from '../../assets/academies/isptec-banner-800.webp'
import isptecLogo from '../../assets/academies/isptec-logo.webp'
import itelBanner from '../../assets/academies/itel-banner-800.webp'
import itelLogo from '../../assets/academies/itel-logo.webp'
import uanBanner from '../../assets/academies/uan-banner-800.webp'
import uanLogo from '../../assets/academies/uan-logo.webp'
import ucanBanner from '../../assets/academies/ucan-banner-800.webp'
import ucanLogo from '../../assets/academies/ucan-logo.webp'
import ulaLogo from '../../assets/academies/ula-logo.webp'
import umaBanner from '../../assets/academies/uma-banner-800.webp'
import umaLogo from '../../assets/academies/uma-logo.webp'
import type { Academy, AcademyOffer, SourceLink } from '../types'
import { CAREER_SUMMARIES } from './careers'
import { COURSES } from './programs'

// Logos and banners come from each institution's official site (25/10/2026): they need the
// institution's permission before the app goes public (docs/recolha-de-dados.md).

// REAL institutions: public facts only, each with its source (docs/recolha-de-dados.md, 25/10/2026).
// Never add a price, a score or a number that no source states.
const ACADEMY_COURSES = {
  ...COURSES,
  'informatica-multimedia': 'Informática e Multimédia',
  'electronica-telecomunicacoes': 'Electrónica e Telecomunicações',
  'redes-computadores': 'Redes de Computadores',
  programacao: 'Programação',
} satisfies Record<string, string>

/** Editorial: the careers each course prepares for (docs/recolha-de-dados.md, "Curso → carreiras"). */
const COURSE_CAREERS: Record<keyof typeof ACADEMY_COURSES, string[]> = {
  'engenharia-informatica': [
    'desenvolvedor-backend',
    'desenvolvedor-full-stack',
    'engenheiro-de-dados',
    'engenheiro-devops',
    'analista-de-sistemas',
    'administrador-de-sistemas',
    'gestor-de-ti',
  ],
  'ciencias-computacao': ['cientista-de-dados', 'engenheiro-de-dados', 'desenvolvedor-backend'],
  'tecnico-informatica': ['tecnico-de-suporte', 'tecnico-de-hardware', 'administrador-de-redes'],
  'desenvolvimento-web': ['desenvolvedor-frontend', 'desenvolvedor-full-stack'],
  'analise-dados': ['analista-de-dados', 'analista-de-bi'],
  estatistica: ['analista-de-dados', 'cientista-de-dados'],
  'design-ui-ux': ['designer-ui-ux'],
  design: ['designer-grafico'],
  'informatica-multimedia': ['designer-grafico', 'designer-ui-ux', 'desenvolvedor-frontend'],
  'electronica-telecomunicacoes': ['tecnico-de-telecomunicacoes', 'engenheiro-de-telecomunicacoes'],
  'redes-computadores': ['administrador-de-redes', 'tecnico-de-suporte', 'analista-de-ciberseguranca'],
  programacao: [
    'desenvolvedor-backend',
    'desenvolvedor-frontend',
    'desenvolvedor-full-stack',
    'desenvolvedor-mobile',
  ],
}

const offer = (
  course: keyof typeof ACADEMY_COURSES,
  name: string,
  level: AcademyOffer['level'],
  extra: Pick<AcademyOffer, 'faculty' | 'recognition'> = {},
): AcademyOffer => {
  const careers = COURSE_CAREERS[course]
  const areas = CAREER_SUMMARIES.filter((career) => careers.includes(career.slug)).map(
    (career) => career.group,
  )
  return {
    course: { id: course, name: ACADEMY_COURSES[course] },
    name,
    level,
    ...extra,
    careers,
    areas: [...new Set(areas)],
  }
}

const LEX = 'https://lex.ao/docs/ministerio-do-ensino-superior'
const VER_ANGOLA = 'https://www.verangola.net/va/pt'
const BAGUETE: SourceLink = {
  label: 'Baguete, 2012',
  url: 'https://baguete.com.br/public/noticias/brasileiros-implantam-instituto-tecnologico-em-angola',
}
const ENG_INF = 'Engenharia Informática'
const ENGINEERING = 'Faculdade de Engenharia'

/** The decree that created or approved a course: its official recognition. */
const decree = (label: string, path: string): SourceLink => ({
  label: `Decreto ${label}`,
  url: `${LEX}/${path}`,
})
const DECREE_480_17 = decree('480/17', '2017/decreto-executivo-n-o-480-17-de-02-de-outubro/')
const DECREE_499_15 = decree('499/15', '2015/decreto-executivo-n-o-499-15-de-27-de-julho/')
const DECREE_429_17 = decree('429/17', '2017/decreto-executivo-n-o-429-17-de-20-de-setembro/')
const DECREE_378_17 = decree('378/17', '2017/decreto-executivo-n-o-378-17-de-08-de-agosto/')

export const ACADEMIES: Academy[] = [
  {
    id: 'uan',
    website: 'https://uan.ao',
    logo: uanLogo,
    banner: uanBanner,
    name: 'Universidade Agostinho Neto',
    type: 'universidade',
    ownership: 'publica',
    province: 'Luanda',
    place: 'Luanda e Talatona',
    summary: 'A maior universidade pública do país. Em 2022 tinha cerca de 26 mil alunos e 51 licenciaturas.',
    offers: [
      offer('engenharia-informatica', ENG_INF, 'licenciatura', {
        faculty: ENGINEERING,
        recognition: DECREE_480_17,
      }),
    ],
    sources: [
      {
        label: 'Ver Angola, 2022',
        url: `${VER_ANGOLA}/092022/Educacao/32742/Universidade-Agostinho-Neto-tem-26-mil-alunos.htm`,
      },
      DECREE_480_17,
    ],
  },
  {
    id: 'isutic',
    name: 'ISUTIC',
    type: 'universidade',
    ownership: 'publica',
    province: 'Luanda',
    place: 'Luanda',
    summary:
      'Instituto Superior para as Tecnologias de Informação e Comunicação. Criado em 2009, faz parte da Universidade de Luanda desde 2020.',
    offers: [],
    sources: [{ label: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/University_of_Luanda' }],
  },
  {
    id: 'isptec',
    website: 'https://isptec.co.ao',
    logo: isptecLogo,
    banner: isptecBanner,
    name: 'ISPTEC',
    type: 'universidade',
    ownership: 'privada',
    province: 'Luanda',
    place: 'Luanda Sul',
    summary:
      'Instituto Superior Politécnico de Tecnologias e Ciências. Começou em 2012, numa parceria com a Sonangol, e tem um laboratório de automação da Siemens.',
    offers: [offer('engenharia-informatica', ENG_INF, 'licenciatura')],
    sources: [
      BAGUETE,
      {
        label: 'Ver Angola, 2017',
        url: `${VER_ANGOLA}/112017/CulturaEducacao/10156/Siemens-leva-tecnologia-inovadora-ao-ISPTEC-com-inauguração-de-laboratório-de-automação.htm`,
      },
    ],
  },
  {
    id: 'ucan',
    website: 'https://www.ucan.co.ao',
    logo: ucanLogo,
    banner: ucanBanner,
    name: 'Universidade Católica de Angola',
    type: 'universidade',
    ownership: 'privada',
    province: 'Luanda',
    place: 'Luanda',
    summary: 'Universidade privada de Luanda. O curso de Engenharia Informática tem este nome desde 2015.',
    offers: [offer('engenharia-informatica', ENG_INF, 'licenciatura', { recognition: DECREE_499_15 })],
    sources: [DECREE_499_15],
  },
  {
    id: 'uma',
    website: 'https://universidademetodista.ao',
    logo: umaLogo,
    banner: umaBanner,
    name: 'Universidade Metodista de Angola',
    type: 'universidade',
    ownership: 'privada',
    province: 'Luanda',
    place: 'Luanda',
    summary: 'Criada em 2007. Tem um mestrado em Engenharia Informática; a licenciatura está por confirmar.',
    offers: [
      offer('engenharia-informatica', `Mestrado em ${ENG_INF}`, 'mestrado', {
        faculty: ENGINEERING,
        recognition: DECREE_429_17,
      }),
    ],
    sources: [DECREE_429_17],
  },
  {
    id: 'ula',
    website: 'https://ula.co.ao',
    logo: ulaLogo,
    name: 'Universidade Lusíada de Angola',
    type: 'universidade',
    ownership: 'privada',
    province: 'Luanda',
    place: 'Mutamba, Luanda',
    summary:
      'Universidade privada, aberta pela Saber Angola. A licenciatura em Engenharia Informática é de 2017.',
    offers: [offer('engenharia-informatica', ENG_INF, 'licenciatura', { recognition: DECREE_378_17 })],
    sources: [DECREE_378_17],
  },
  {
    id: 'itel',
    website: 'https://itel.gov.ao',
    logo: itelLogo,
    banner: itelBanner,
    name: 'ITEL',
    type: 'instituto_medio',
    ownership: null,
    province: 'Luanda',
    place: 'Rangel, Luanda',
    summary:
      'Instituto de Telecomunicações, de nível médio. Formou cerca de 5000 técnicos em 40 anos; em 2023, 88 terminaram Informática.',
    offers: [
      offer('tecnico-informatica', 'Informática', 'medio_tecnico'),
      offer('informatica-multimedia', 'Informática e Sistemas de Multimédia', 'medio_tecnico'),
      offer('electronica-telecomunicacoes', 'Electrónica e Telecomunicações', 'medio_tecnico'),
    ],
    sources: [
      { label: 'AllAfrica, 2025', url: 'https://allafrica.com/stories/202508180604.html' },
      {
        label: 'ANGOP',
        url: 'https://angop.ao/en/noticias/economia/itel-lanca-para-o-mercado-de-emprego-216-novos-quadros',
      },
    ],
  },
  {
    id: 'cinfotec',
    name: 'CINFOTEC',
    type: 'centro_formacao',
    ownership: 'publica',
    province: 'Luanda',
    place: 'Talatona e Rangel, Luanda',
    summary:
      'Centro Integrado de Formação Tecnológica, do sistema do INEFOP. Criado em 2008, também dá cursos de TIC com certificação internacional.',
    offers: [offer('redes-computadores', 'Redes de Computadores', 'formacao_profissional')],
    sources: [
      {
        label: 'Ver Angola, 2015',
        url: `${VER_ANGOLA}/122015/CulturaEducacao/3235/Mais-de-dois-mil-jovens-terminam-formação-no-Cinfotec.htm`,
      },
      {
        label: 'Macau Daily Times',
        url: 'https://macaudailytimes.com.mo/china-back-training-centre-angola.html',
      },
    ],
  },
  {
    id: 'escola-42-luanda',
    website: 'https://42luanda.com',
    logo: escola42Logo,
    name: 'Escola 42 Luanda',
    type: 'centro_formacao',
    ownership: null,
    province: 'Luanda',
    place: 'Luanda',
    minAge: 17,
    summary:
      'Não pede estudos nem saber programar. A seleção faz-se com jogos de lógica e a "Piscina": 4 semanas, 10 horas por dia. Em 2026 tinha 300 alunos.',
    offers: [offer('programacao', 'Formação em programação', 'formacao_profissional')],
    sources: [
      {
        label: 'Governo de Angola',
        url: 'https://governo.gov.ao/noticias/1019/educacao-e-ensino/escola-42-luanda/mais-de-quatro-mil-candidatos-seleccionados-para-a-segunda-fase',
      },
      {
        label: 'Ver Angola, 2024',
        url: `${VER_ANGOLA}/052024/Educacao/40028/Primeira-turma-da-Escola-42-Luanda-arranca-com-mais-de-100-alunos.htm`,
      },
    ],
  },
  {
    id: 'inefop',
    website: 'https://inefop.gov.ao',
    logo: inefopLogo,
    name: 'INEFOP',
    type: 'centro_formacao',
    ownership: 'publica',
    province: 'Luanda',
    place: 'Todo o país',
    summary:
      'Instituto Nacional de Emprego e Formação Profissional. Tutela os centros de formação e os CINFOTEC.',
    offers: [],
    sources: [
      {
        label: 'Capacity4dev',
        url: 'https://capacity4dev.europa.eu/news/formadores-do-inefop-aperfeicoam-conhecimentos-tecnicos-e-pedagogicos-em-diferentes-areas-de-formacao_en',
      },
    ],
  },
  {
    id: 'utanga',
    name: 'Universidade Técnica de Angola',
    type: 'universidade',
    ownership: 'privada',
    province: 'Luanda',
    place: 'Capolo II, Kilamba Kiaxi',
    summary: 'Universidade Técnica de Angola (UTANGA), fundada em 2007. Cursos de tecnologia por confirmar.',
    offers: [],
    sources: [
      { label: 'Wikipedia', url: 'https://pt.wikipedia.org/wiki/Universidade_T%C3%A9cnica_de_Angola' },
    ],
  },
  {
    id: 'umn',
    name: 'Universidade Mandume ya Ndemufayo',
    type: 'universidade',
    ownership: 'publica',
    province: 'Huíla',
    place: 'Lubango',
    summary: 'Universidade pública do sul de Angola, no Lubango. Cursos de tecnologia por confirmar.',
    offers: [],
    sources: [{ label: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Mandume_ya_Ndemufayo_University' }],
  },
]
