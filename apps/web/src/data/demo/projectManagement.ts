import type {
  Academy,
  AcademyOffer,
  Career,
  CareerGroup,
  CareerSummary,
  Company,
  NewsItem,
  PathwayStep,
  Skill,
  SourceLink,
} from '../types'
import { riasec, summary } from './careerSummary'

// Project management (the Gestão de projectos group of the business area), from public sources:
// - the community and its partners: PMI Angola Chapter (pmiangola.org), created in 2017 (BFA, 2022), its protocol
//   with the Ordem dos Engenheiros de Angola (15/04/2025) and its memorandum with Selenium Digital Solutions (pti.ao);
// - the certifications and what they ask: the Project Management Institute (pmi.org), listed by PMI Angola;
// - the demand: the Angolan job sites in the last 12 months (25 project ads, no salary in any);
// - the salaries: no State table names these careers; the WageIndicator 2026 survey for the closest occupations;
// - the events: Project Summit Angola 2026 (projectsummit.ao, Economia & Mercado) and PMI Angola's conferences.

const PMI_ANGOLA_SITE: SourceLink = { label: 'PMI Angola Chapter', url: 'https://pmiangola.org/' }
const PMI_CERTIFICATIONS: SourceLink = {
  label: 'PMI Angola: as certificações do PMI',
  url: 'https://pmiangola.org/educacao/certificacoes/',
}
const WAGE = 'https://wageindicator.org/pt-ao/trabalho-em-angola/trabalho-e-salario/'

const GROUP: CareerGroup = 'gestao_projetos'

export const PROJECT_CAREERS: CareerSummary[] = [
  summary(
    'gestor-de-projectos',
    'Gestor de Projectos',
    GROUP,
    'Planeia e conduz projectos do início ao fim: âmbito, prazos, custos, riscos e a equipa.',
    riasec(0.25, 0.45, 0.2, 0.6, 0.9, 0.75),
    'media',
    null,
  ),
  summary(
    'coordenador-de-projectos',
    'Coordenador de Projectos',
    GROUP,
    'Apoia o gestor: actualiza o plano, acompanha as tarefas e prepara relatórios e reuniões.',
    riasec(0.2, 0.4, 0.15, 0.6, 0.6, 0.85),
    'media',
    null,
  ),
  summary(
    'planeador-de-projectos',
    'Planeador e Controlador de Projectos',
    GROUP,
    'Faz o cronograma e controla prazos e custos de obras e projectos industriais, com o Primavera P6 ou o MS Project.',
    riasec(0.3, 0.7, 0.1, 0.25, 0.4, 0.9),
    'media',
    null,
  ),
  summary(
    'gestor-de-programas-e-portfolio',
    'Gestor de Programas e Portefólio (PMO)',
    GROUP,
    'Coordena vários projectos ao mesmo tempo e ajuda a decidir em quais a organização investe.',
    riasec(0.15, 0.55, 0.15, 0.55, 0.9, 0.75),
    'baixa',
    null,
  ),
  summary(
    'scrum-master',
    'Scrum Master',
    GROUP,
    'Ajuda equipas ágeis a entregar em ciclos curtos e tira do caminho o que as atrasa.',
    riasec(0.15, 0.45, 0.3, 0.8, 0.6, 0.55),
    'media',
    null,
  ),
]

const detailed = (slug: string): CareerSummary => {
  const found = PROJECT_CAREERS.find((career) => career.slug === slug)
  if (!found) throw new Error(`Unknown project career ${slug}`)
  return { ...found, detailed: true }
}

const SECONDARY: PathwayStep = {
  kind: 'academico',
  level: 'ii_ciclo',
  title: 'Ensino médio concluído',
  need: 'essencial',
  description: '12.ª classe ou um curso médio técnico. Chega para a certificação CAPM.',
  months: null,
}

const DEGREE: PathwayStep = {
  kind: 'academico',
  level: 'licenciatura',
  title: 'Licenciatura em Engenharia, Gestão, Economia ou Informática',
  need: 'recomendado',
  description:
    'Não há uma licenciatura obrigatória: os gestores de projectos vêm da área do que gerem (obras, petróleo, tecnologia, banca). Com licenciatura, a PMP pede menos anos de experiência.',
  months: { min: 48, max: 60 },
}

const TOOLS: PathwayStep = {
  kind: 'formacao',
  title: 'Ferramentas de planeamento',
  need: 'recomendado',
  selfTaught: true,
  description:
    'MS Project ou Primavera P6 para cronogramas, Excel para custos e Jira ou Trello para equipas ágeis.',
  months: { min: 1, max: 3 },
}

const MEMBER: PathwayStep = {
  kind: 'certificacao',
  title: 'Membro do PMI Angola Chapter',
  need: 'opcional',
  certificate: 'opcional',
  description:
    'Os membros têm desconto nos exames de certificação do PMI, o PMBOK digital, eventos e voluntariado, e entram na comunidade de gestão de projectos do país.',
  months: null,
}

function experience(months: number, text: string): PathwayStep {
  return {
    kind: 'experiencia',
    title: 'Experiência em projectos',
    need: 'essencial',
    description: text,
    months: { min: months, max: null },
  }
}

/** The PMI certifications, as PMI states them (pmi.org) and PMI Angola lists them. */
const CERTIFICATION = {
  capm: {
    kind: 'certificacao',
    title: 'Certificação CAPM (PMI)',
    need: 'recomendado',
    certificate: 'opcional',
    description:
      'A primeira certificação do PMI: pede o ensino secundário e 23 horas de formação em gestão de projectos, e um exame. Mantém-se com 15 PDU de 3 em 3 anos.',
    months: { min: 1, max: 3 },
  },
  pmp: {
    kind: 'certificacao',
    title: 'Certificação PMP (PMI)',
    need: 'recomendado',
    certificate: 'opcional',
    description:
      'A mais conhecida: pede 36 meses a liderar projectos com licenciatura (60 meses só com o ensino secundário) e 35 horas de formação, ou a CAPM, e um exame. Mantém-se com 60 PDU de 3 em 3 anos.',
    months: { min: 2, max: 6 },
  },
  sp: {
    kind: 'certificacao',
    title: 'Certificação PMI-SP (planeamento)',
    need: 'opcional',
    certificate: 'opcional',
    description:
      'A certificação do PMI em planeamento e cronogramas, para quem já tem experiência a planear projectos.',
    months: { min: 2, max: 4 },
  },
  acp: {
    kind: 'certificacao',
    title: 'Certificação PMI-ACP ou Disciplined Agile Scrum Master',
    need: 'recomendado',
    certificate: 'opcional',
    description:
      'As certificações ágeis do PMI: a DASM para começar como scrum master, a PMI-ACP para quem já trabalha com métodos ágeis.',
    months: { min: 1, max: 4 },
  },
  pgmp: {
    kind: 'certificacao',
    title: 'Certificação PgMP ou PfMP (PMI)',
    need: 'opcional',
    certificate: 'opcional',
    description:
      'Para gerir programas (PgMP) ou portefólios (PfMP): pedem vários anos a gerir projectos e programas e uma avaliação do PMI.',
    months: { min: 3, max: 6 },
  },
} satisfies Record<string, PathwayStep>

const MANAGER_STAGES: Career['stages'] = [
  {
    level: 'estagio',
    title: 'Assistente de Projectos',
    years: { min: 0, max: 2 },
    responsibilities: ['Actualiza planos e actas', 'Acompanha tarefas e documentos'],
  },
  {
    level: 'junior',
    title: 'Coordenador de Projectos',
    years: { min: 2, max: 5 },
    responsibilities: [
      'Coordena um projecto pequeno ou uma parte de um grande',
      'Prepara relatórios para o gestor',
    ],
  },
  {
    level: 'pleno',
    title: 'Gestor de Projectos',
    years: { min: 5, max: 10 },
    responsibilities: [
      'Responde pelo prazo, pelo custo e pela qualidade',
      'Lidera a equipa e fala com o cliente',
    ],
  },
  {
    level: 'senior',
    title: 'Gestor de Programas',
    years: { min: 10, max: 15 },
    responsibilities: ['Coordena vários projectos ligados', 'Gere riscos e orçamentos maiores'],
  },
  {
    level: 'lideranca',
    title: 'Director de PMO ou de Portefólio',
    years: { min: 15, max: null },
    responsibilities: ['Define como a organização gere projectos', 'Escolhe em que projectos investir'],
  },
]

const COMMON_SKILLS: Skill[] = [
  { id: 'planeamento-cronogramas', name: 'Planeamento e cronogramas', importance: 'essencial' },
  { id: 'gestao-ambito', name: 'Gestão do âmbito', importance: 'essencial' },
  { id: 'gestao-custos-projecto', name: 'Gestão de custos e orçamento', importance: 'essencial' },
  { id: 'gestao-riscos-projecto', name: 'Gestão de riscos', importance: 'essencial' },
  {
    id: 'gestao-partes-interessadas',
    name: 'Comunicação com as partes interessadas',
    importance: 'essencial',
  },
  { id: 'lideranca-equipas', name: 'Liderança de equipas', importance: 'essencial' },
  { id: 'ingles-negocios', name: 'Inglês de trabalho', importance: 'opcional' },
]

const HIRING = [
  'Construção e engenharia',
  'Petróleo, gás e minas',
  'Banca, seguros e telecomunicações',
  'Organizações internacionais e de cooperação',
  'Consultoras',
]

const NOTE =
  'Nos últimos 12 meses, os sites de emprego angolanos publicaram 25 anúncios de gestão de projectos (gestores, coordenadores, planeadores e scrum masters), sobretudo de engenharia, construção, tecnologia e organizações de cooperação; nenhum dizia o salário. A comunidade da profissão é o PMI Angola Chapter, criado em 2017, com uma conferência anual e protocolos com a Ordem dos Engenheiros de Angola e a Selenium Digital Solutions.'

const MANAGER_SALARY = {
  text: 'Nenhuma tabela pública nomeia os gestores de projectos. O inquérito WageIndicator de 2026 dá, para a função mais próxima (directores de construção e engenharia civil), entre 221 581 e 1 563 228 Kz líquidos por mês no início da carreira e entre 365 165 e 2 322 648 Kz após 5 anos.',
  source: { label: 'WageIndicator, Angola 2026', url: `${WAGE}gerentes-de-construcao/` },
}

const IT_SALARY = {
  text: 'Nenhuma tabela pública nomeia os scrum masters. O inquérito WageIndicator de 2026 dá, para os directores de serviços de tecnologia, entre 221 581 e 1 563 228 Kz líquidos por mês no início da carreira e entre 365 165 e 2 322 648 Kz após 5 anos.',
  source: {
    label: 'WageIndicator, Angola 2026',
    url: `${WAGE}gerentes-de-tecnologia-de-informacao-e-comunicacao/`,
  },
}

function market(demand: Career['market']['demand'], salary?: typeof MANAGER_SALARY): Career['market'] {
  return {
    demand,
    trendPct: null,
    demandNote: { text: NOTE, source: PMI_ANGOLA_SITE, ...(salary ? { salary } : {}) },
    salary: null,
    salaryByStage: [],
    postingsByMonth: [],
    hiringSectors: HIRING,
  }
}

const CV_GUIDE: Career['cvGuide'] = {
  template: 'classico',
  include: [
    'As certificações (PMP, CAPM, PMI-ACP) com o número e a validade',
    'Os projectos que geriste, com o orçamento, a equipa e o resultado',
    'As ferramentas: MS Project, Primavera P6, Jira',
    'Os sectores em que trabalhaste',
  ],
  avoid: [
    'Listas de tarefas sem resultados',
    'Certificações caducadas sem o dizer',
    'Fotografias e dados pessoais que a candidatura não pede',
  ],
}

type Guide = Pick<Career, 'description' | 'dayToDay' | 'workContext' | 'workStyles' | 'pathways'> & {
  slug: string
  skills: Skill[]
  stages?: Career['stages']
  market: Career['market']
}

function guide({ slug, skills, stages = MANAGER_STAGES, ...rest }: Guide): Career {
  return {
    ...detailed(slug),
    ...rest,
    skills: [...COMMON_SKILLS, ...skills],
    stages,
    employerAsks: null,
    cvGuide: CV_GUIDE,
  }
}

const WORK_CONTEXT: Career['workContext'] = [
  { label: 'Ambiente', value: 'Escritório, obra ou instalação, consoante o projecto' },
  { label: 'Horário', value: 'De dia, com picos perto das entregas' },
  { label: 'Equipa', value: 'Engenheiros, técnicos, fornecedores e o cliente' },
  { label: 'Pressão', value: 'Prazos e orçamentos para cumprir' },
]

export const PROJECT_GUIDES: Career[] = [
  guide({
    slug: 'gestor-de-projectos',
    description:
      'Leva um projecto do início ao fim, uma obra, uma plataforma, um sistema ou um programa social: define o que se vai entregar, faz o plano, junta a equipa, controla prazos, custos e riscos e presta contas ao cliente. Trabalha em construtoras, petrolíferas, bancos, operadoras, consultoras e organizações de cooperação. A certificação PMP, do Project Management Institute, é a mais conhecida no mundo; em Angola, a comunidade da profissão é o PMI Angola Chapter.',
    dayToDay: [
      'Planear o âmbito, o cronograma e o orçamento',
      'Reunir a equipa e distribuir o trabalho',
      'Acompanhar o avanço e corrigir desvios',
      'Gerir riscos, alterações e fornecedores',
      'Fazer relatórios e reuniões com o cliente',
    ],
    workContext: WORK_CONTEXT,
    workStyles: ['Organização', 'Liderança', 'Comunicação clara', 'Calma sob pressão', 'Negociação'],
    skills: [
      { id: 'ms-project-primavera', name: 'MS Project ou Primavera P6', importance: 'essencial' },
      { id: 'gestao-contratos', name: 'Gestão de contratos e fornecedores', importance: 'opcional' },
    ],
    pathways: [
      {
        id: 'pmi',
        name: 'Licenciatura, experiência e PMP',
        summary:
          'O caminho mais comum: uma licenciatura, alguns anos a coordenar projectos e a certificação PMP.',
        steps: [
          SECONDARY,
          DEGREE,
          TOOLS,
          experience(36, 'Três anos a liderar projectos, com licenciatura, para a PMP.'),
          CERTIFICATION.pmp,
          MEMBER,
        ],
        totalCost: null,
      },
      {
        id: 'capm',
        name: 'Começar pela CAPM',
        summary:
          'Sem experiência, a CAPM mostra que sabes o método e abre a porta como assistente ou coordenador.',
        steps: [
          SECONDARY,
          CERTIFICATION.capm,
          experience(24, 'Começa-se como assistente ou coordenador de projectos.'),
          CERTIFICATION.pmp,
        ],
        totalCost: null,
      },
    ],
    market: market('media', MANAGER_SALARY),
  }),
  guide({
    slug: 'coordenador-de-projectos',
    description:
      'Faz andar o dia a dia de um projecto: actualiza o plano, segue as tarefas de cada pessoa, organiza reuniões e documentos e avisa o gestor quando algo se atrasa. É a porta de entrada na gestão de projectos, em construtoras, petrolíferas, bancos e organizações de cooperação.',
    dayToDay: [
      'Actualizar o cronograma e a lista de tarefas',
      'Preparar reuniões e escrever as actas',
      'Seguir as entregas da equipa e dos fornecedores',
      'Organizar documentos e relatórios',
      'Avisar o gestor dos atrasos e dos riscos',
    ],
    workContext: WORK_CONTEXT,
    workStyles: ['Organização', 'Atenção ao detalhe', 'Comunicação', 'Iniciativa', 'Trabalhar em equipa'],
    skills: [
      { id: 'ms-project-primavera', name: 'MS Project ou Primavera P6', importance: 'opcional' },
      { id: 'excel-avancado', name: 'Excel avançado', importance: 'essencial' },
    ],
    pathways: [
      {
        id: 'capm',
        name: 'Ensino médio ou licenciatura e CAPM',
        summary: 'A CAPM e o domínio do Excel e de uma ferramenta de planeamento chegam para começar.',
        steps: [SECONDARY, DEGREE, TOOLS, CERTIFICATION.capm, MEMBER],
        totalCost: null,
      },
    ],
    market: market('media', MANAGER_SALARY),
  }),
  guide({
    slug: 'planeador-de-projectos',
    description:
      'Constrói o cronograma de projectos grandes, obras, plataformas e fábricas, com milhares de actividades, e controla todas as semanas o avanço, os prazos e os custos, para o gestor decidir a tempo. É uma função muito pedida nas petrolíferas, nas prestadoras de serviços e nas construtoras, quase sempre com o Primavera P6.',
    dayToDay: [
      'Montar o cronograma com as actividades e as dependências',
      'Medir o avanço físico e o valor ganho',
      'Actualizar prazos e custos todas as semanas',
      'Detectar o caminho crítico e os atrasos',
      'Preparar os relatórios de controlo para o cliente',
    ],
    workContext: WORK_CONTEXT,
    workStyles: ['Rigor', 'Gosto por números', 'Atenção ao detalhe', 'Organização', 'Persistência'],
    skills: [
      { id: 'primavera-p6', name: 'Primavera P6', importance: 'essencial' },
      { id: 'valor-ganho', name: 'Valor ganho (EVM)', importance: 'essencial' },
    ],
    pathways: [
      {
        id: 'engenharia',
        name: 'Engenharia e Primavera P6',
        summary: 'Uma licenciatura técnica, o domínio do Primavera P6 e experiência em obra ou projecto.',
        steps: [
          SECONDARY,
          DEGREE,
          TOOLS,
          experience(
            24,
            'Começa-se como planeador júnior, numa obra ou numa equipa de controlo de projectos.',
          ),
          CERTIFICATION.sp,
        ],
        totalCost: null,
      },
    ],
    stages: [
      {
        level: 'junior',
        title: 'Planeador Júnior',
        years: { min: 0, max: 3 },
        responsibilities: ['Actualiza o cronograma', 'Recolhe o avanço no terreno'],
      },
      {
        level: 'pleno',
        title: 'Planeador',
        years: { min: 3, max: 8 },
        responsibilities: [
          'Monta e controla o cronograma de um projecto',
          'Analisa atrasos e propõe recuperações',
        ],
      },
      {
        level: 'senior',
        title: 'Planeador Sénior ou Controlador de Projectos',
        years: { min: 8, max: 12 },
        responsibilities: ['Integra prazos e custos', 'Orienta os planeadores mais novos'],
      },
      {
        level: 'lideranca',
        title: 'Responsável de Controlo de Projectos',
        years: { min: 12, max: null },
        responsibilities: ['Define os métodos de controlo', 'Responde pelos relatórios ao cliente'],
      },
    ],
    market: market('media'),
  }),
  guide({
    slug: 'gestor-de-programas-e-portfolio',
    description:
      'Coordena vários projectos ligados entre si (um programa) ou todos os projectos de uma organização (um portefólio), num gabinete de gestão de projectos, o PMO: define métodos, acompanha os resultados e ajuda a direcção a escolher onde investir. É um passo de carreira para gestores de projectos com muitos anos de experiência.',
    dayToDay: [
      'Acompanhar o estado de todos os projectos',
      'Juntar os riscos e as dependências entre projectos',
      'Definir os métodos e os modelos de relatório',
      'Preparar as decisões de investimento para a direcção',
      'Formar e apoiar os gestores de projectos',
    ],
    workContext: [
      { label: 'Ambiente', value: 'Escritório, perto da direcção' },
      { label: 'Horário', value: 'De dia, com ciclos de relatórios' },
      { label: 'Equipa', value: 'Gestores de projectos e a administração' },
      { label: 'Responsabilidade', value: 'Orçamentos grandes e decisões de investimento' },
    ],
    workStyles: ['Visão de conjunto', 'Liderança', 'Negociação', 'Pensamento estratégico', 'Comunicação'],
    skills: [
      { id: 'governacao-projectos', name: 'Governação de projectos e PMO', importance: 'essencial' },
      { id: 'analise-investimentos', name: 'Análise de investimentos', importance: 'essencial' },
    ],
    pathways: [
      {
        id: 'carreira',
        name: 'Da gestão de projectos à de programas',
        summary: 'Depois de anos a gerir projectos com a PMP, a PgMP ou a PfMP.',
        steps: [
          DEGREE,
          experience(96, 'Vários anos a gerir projectos e, depois, programas.'),
          CERTIFICATION.pmp,
          CERTIFICATION.pgmp,
        ],
        totalCost: null,
      },
    ],
    market: market('baixa', MANAGER_SALARY),
  }),
  guide({
    slug: 'scrum-master',
    description:
      'Ajuda uma equipa ágil, quase sempre de tecnologia, a entregar trabalho útil em ciclos curtos (sprints): conduz as reuniões do método, protege a equipa das interrupções e tira do caminho o que a atrasa. Trabalha em bancos, operadoras, empresas de software e consultoras.',
    dayToDay: [
      'Conduzir o planeamento, a reunião diária e a retrospectiva',
      'Ajudar a ordenar o trabalho com o dono do produto',
      'Resolver os bloqueios da equipa',
      'Medir o ritmo da equipa e melhorá-lo',
      'Ensinar o método a quem chega',
    ],
    workContext: [
      { label: 'Ambiente', value: 'Escritório ou remoto, com equipas de tecnologia' },
      { label: 'Horário', value: 'De dia, ao ritmo dos sprints' },
      { label: 'Equipa', value: 'Programadores, designers e o dono do produto' },
      { label: 'Ferramentas', value: 'Jira, Trello e quadros de tarefas' },
    ],
    workStyles: ['Saber ouvir', 'Facilitar reuniões', 'Paciência', 'Resolver conflitos', 'Melhoria contínua'],
    skills: [
      { id: 'scrum-kanban', name: 'Scrum e Kanban', importance: 'essencial' },
      { id: 'jira', name: 'Jira ou Trello', importance: 'essencial' },
      { id: 'facilitacao', name: 'Facilitação de reuniões', importance: 'essencial' },
    ],
    pathways: [
      {
        id: 'agil',
        name: 'Tecnologia e certificação ágil',
        summary:
          'Um percurso em tecnologia ou gestão, experiência numa equipa ágil e uma certificação DASM ou PMI-ACP.',
        steps: [
          SECONDARY,
          DEGREE,
          TOOLS,
          experience(12, 'Trabalhar numa equipa ágil, como programador, analista ou coordenador.'),
          CERTIFICATION.acp,
          MEMBER,
        ],
        totalCost: null,
      },
    ],
    stages: [
      {
        level: 'junior',
        title: 'Scrum Master',
        years: { min: 0, max: 4 },
        responsibilities: ['Acompanha uma ou duas equipas', 'Conduz as cerimónias do método'],
      },
      {
        level: 'pleno',
        title: 'Scrum Master Sénior',
        years: { min: 4, max: 8 },
        responsibilities: ['Acompanha várias equipas', 'Ajuda a coordenar equipas entre si'],
      },
      {
        level: 'senior',
        title: 'Agile Coach',
        years: { min: 8, max: null },
        responsibilities: ['Leva o método a toda a organização', 'Forma scrum masters e gestores'],
      },
    ],
    market: market('media', IT_SALARY),
  }),
]

const CAREERS_BY_CERTIFICATION: [string, string[]][] = [
  ['Project Management Professional (PMP)', ['gestor-de-projectos', 'gestor-de-projetos-de-ti']],
  ['Certified Associate in Project Management (CAPM)', ['coordenador-de-projectos', 'gestor-de-projectos']],
  ['Program Management Professional (PgMP)', ['gestor-de-programas-e-portfolio']],
  ['Portfolio Management Professional (PfMP)', ['gestor-de-programas-e-portfolio']],
  ['PMI Scheduling Professional (PMI-SP)', ['planeador-de-projectos']],
  ['PMI Risk Management Professional (PMI-RMP)', ['gestor-de-projectos', 'planeador-de-projectos']],
  ['PMI Agile Certified Practitioner (PMI-ACP)', ['scrum-master', 'gestor-de-projetos-de-ti']],
  ['Disciplined Agile Scrum Master (DASM)', ['scrum-master']],
  ['PMI Professional in Business Analysis (PMI-PBA)', ['analista-de-sistemas']],
]

const certification = ([name, careers]: [string, string[]]): AcademyOffer => ({
  course: {
    id: name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, ''),
    name,
  },
  name,
  level: 'certificacao',
  careers,
  areas: careers.includes('analista-de-sistemas') ? ['gestao'] : [GROUP],
  recognition: PMI_CERTIFICATIONS,
})

/** The chapter: its members prepare the PMI certifications with discounts; the exams are the PMI's. */
export const PMI_ANGOLA: Academy = {
  id: 'pmi-angola-chapter',
  name: 'PMI Angola Chapter',
  type: 'centro_formacao',
  ownership: 'privada',
  province: 'Luanda',
  place: 'Luanda',
  website: 'https://pmiangola.org',
  summary:
    'Associação de gestão de projectos sem fins lucrativos, criada em 2017: o capítulo angolano do Project Management Institute (PMI). Organiza a conferência anual, masterclasses e encontros, tem voluntariado e acção social, e os membros têm desconto nos exames das certificações do PMI. Assinou protocolos com a Ordem dos Engenheiros de Angola (2025) e a Selenium Digital Solutions; o BFA patrocinou a 6.ª conferência, em 2022.',
  offers: CAREERS_BY_CERTIFICATION.map(certification),
  sources: [
    PMI_ANGOLA_SITE,
    PMI_CERTIFICATIONS,
    {
      label: 'BFA: 6.ª Conferência Anual do PMI Angola (2022)',
      url: 'https://bfa.ao/en/bfa/current-news/news/6th-pmi-angola-chapter-conference/',
    },
    {
      label: 'Ordem dos Engenheiros de Angola: protocolo com o PMI Angola (2025)',
      url: 'https://ordemengenheiros.ao/o-e-a/73kwa5ds92kufk17vsgyp30h9k5o7q',
    },
  ],
}

const SELENIUM_SOURCE: SourceLink = {
  label: 'Portal de TI: memorando com o PMI Angola',
  url: 'https://pti.ao/selenium-digital-solutions-e-pmi-angola-chapter-firmam-parceria-para-certificacao-e-capacitacao-profissional/',
}

/** The companies with a public partnership with PMI Angola. */
export const PROJECT_COMPANIES: Company[] = [
  {
    id: 'selenium-digital-solutions',
    name: 'Selenium Digital Solutions',
    sector: 'tecnologia',
    province: 'Luanda',
    place: 'Luanda',
    summary:
      'Empresa angolana de serviços tecnológicos: automação, cibersegurança, dados e inteligência artificial. Assinou com o PMI Angola Chapter um memorando de dois anos para formar e certificar os seus profissionais em gestão de projectos.',
    careers: ['gestor-de-projectos', 'scrum-master', 'gestor-de-projetos-de-ti'],
    careersSourced: false,
    areas: [GROUP, 'gestao'],
    programs: [],
    partners: [PMI_ANGOLA.id],
    sources: [SELENIUM_SOURCE],
  },
  {
    id: 'pinto-e-cruz-angola',
    name: 'Pinto & Cruz Angola',
    sector: 'industria',
    province: 'Luanda',
    place: 'Luanda',
    summary:
      'Empresa de engenharia e instalações técnicas. Foi patrocinadora da X Conferência Anual do PMI Angola Chapter, segundo a página do PMI Angola.',
    careers: ['gestor-de-projectos', 'planeador-de-projectos', 'coordenador-de-projectos'],
    careersSourced: false,
    areas: [GROUP],
    programs: [],
    partners: [PMI_ANGOLA.id],
    sources: [{ label: 'PMI Angola Chapter (Facebook)', url: 'https://www.facebook.com/pmiangola/' }],
  },
]

const PROJECT_SLUGS = PROJECT_CAREERS.map((career) => career.slug)

export const PROJECT_NEWS: NewsItem[] = [
  {
    id: 'project-summit-angola-2026',
    date: '2026-10-01',
    kind: 'empresas',
    title: 'Project Summit Angola 2026: projectos na agricultura',
    summary:
      'A segunda edição, a 1 de Outubro no Hotel Epic Sana, em Luanda, juntou gestores de projectos, empresas, bancos e instituições públicas (estavam previstas cerca de 300 pessoas) para debater como financiar, executar e acompanhar projectos agrícolas, do campo ao mercado. Organização da Nodix Consulting.',
    to: '/carreiras/gestor-de-projectos',
    source: {
      label: 'Economia & Mercado',
      url: 'https://economiaemercado.com/artigo/project-summit-angola-2026-debate-financiamento-inovacao-e-sustentabilidade-na-agricultura',
    },
    careers: PROJECT_SLUGS,
  },
  {
    id: 'pmi-angola-selenium',
    date: '2026-10-30',
    kind: 'cursos',
    title: 'PMI Angola e Selenium assinam memorando para certificar gestores de projectos',
    summary:
      'O PMI Angola Chapter e a Selenium Digital Solutions vão formar e certificar profissionais de gestão de projectos e fazer eventos juntos, durante dois anos.',
    to: `/academias/${PMI_ANGOLA.id}`,
    source: SELENIUM_SOURCE,
    careers: PROJECT_SLUGS,
  },
  {
    id: 'pmi-angola-ix-conferencia',
    date: '2025-12-08',
    kind: 'cursos',
    title: 'IX Conferência Anual do PMI Angola: megaprojectos',
    summary:
      'A 8 e 9 de Dezembro, no Hotel Epic Sana, em Luanda, sobre a gestão de megaprojectos em ambientes de transformação.',
    to: `/academias/${PMI_ANGOLA.id}`,
    source: {
      label: 'Ver Angola',
      url: 'https://www.verangola.net/va/pt/122025/eventos/47018/IX-Confer%C3%AAncia-Anual-do-PMI-Angola-Confer%C3%AAncias.htm',
    },
    careers: PROJECT_SLUGS,
  },
  {
    id: 'pmi-angola-ordem-engenheiros',
    date: '2025-04-15',
    kind: 'cursos',
    title: 'Ordem dos Engenheiros e PMI Angola assinam protocolo',
    summary:
      'Assinado em Luanda, na reunião anual dos presidentes dos capítulos do PMI da África Subsaariana, para explorar oportunidades entre as duas associações.',
    to: `/academias/${PMI_ANGOLA.id}`,
    source: {
      label: 'Ordem dos Engenheiros de Angola',
      url: 'https://ordemengenheiros.ao/o-e-a/73kwa5ds92kufk17vsgyp30h9k5o7q',
    },
    careers: PROJECT_SLUGS,
  },
]
