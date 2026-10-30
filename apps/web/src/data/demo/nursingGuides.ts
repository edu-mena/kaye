import type { Career, Pathway, PathwayStep, Skill } from '../types'
import { detailedHealthCareer as summaryOf } from './healthCareers'

// The full guides of the nursing careers (the Enfermagem group), from public sources:
// - the categories, how one enters and is promoted, the working time: Regime Jurídico da Carreira de Enfermagem
//   (Decreto Presidencial n.º 187/18, articles 4, 5, 11, 12 and 14);
// - the speciality for graduates: Regulamento sobre a Formação Especializada em Enfermagem (Decreto Presidencial
//   n.º 212/23, articles 8, 9 and 38); two years (MINSA, March 2025) and 4 800 places announced in September 2026;
// - who registers where: Estatuto da Ordem dos Enfermeiros (Decreto Presidencial n.º 179/10, articles 60 to 62);
// - the base salary of each category: the 2026 table (Decreto Presidencial n.º 16/26);
// - the nurses and the specialities in training: MINSA, Anuário Estatístico Sanitário 2023 (tables 70, 153 and 156);
// - the 2026 public competition: Despacho Conjunto n.º 42/26 (944 nurses and 95 technicians in the central hospitals);
// - the technical course suspended for five years: Decreto Executivo n.º 01/25.
// Nurses are hired by public competition, not job ads: their guides have no ads, trend or employers' asks.

/** The nursing career's 2026 base salaries, in Kz a month (Decreto Presidencial n.º 16/26). */
const SALARY = {
  technician: [144_764, 156_828, 168_891],
  specialisedTechnician: [180_955, 205_082, 211_114],
  nurse: [361_910, 410_165, 458_419],
  specialist: [506_674, 542_865, 579_056],
}

const DESPACHO = {
  label: 'Despacho Conjunto n.º 42/26: as vagas do Ministério da Saúde (AngoLEX)',
  url: 'https://angolex.com/paginas/despachos/atribui-3037a-vagas-concurso-publico-ingresso-externo-ministerio-saude-servicos-superintendidos-42a-26a.html',
}

const NINTH: PathwayStep = {
  kind: 'academico',
  level: 'i_ciclo',
  title: '9.ª classe concluída',
  need: 'essencial',
  description: 'Dá acesso ao ensino secundário técnico-profissional, onde está o curso médio de Enfermagem.',
  months: null,
}

const TECHNICAL_COURSE: PathwayStep = {
  kind: 'academico',
  level: 'medio_tecnico',
  title: 'Curso médio técnico de Enfermagem',
  need: 'essencial',
  description:
    'Quatro anos, da 10.ª à 13.ª classe, num instituto técnico de saúde, com estágios nos hospitais. Atenção: desde 2025/2026, e durante 5 anos, não abre em Luanda e noutras nove províncias; nas restantes, só nas escolas com condições (Decreto Executivo n.º 01/25).',
  months: { min: 48, max: 48 },
}

const COUNCIL: PathwayStep = {
  kind: 'certificacao',
  title: 'Inscrição no Conselho Geral de Enfermagem',
  need: 'essencial',
  certificate: 'exigido',
  description: 'Os técnicos de enfermagem só podem exercer depois de inscritos.',
  months: null,
}

const TECHNICAL_COMPETITION: PathwayStep = {
  kind: 'experiencia',
  title: 'Concurso público para Técnico Médio de Enfermagem',
  need: 'essencial',
  description:
    'Entras no Estado como Técnico Médio de Enfermagem de 3.ª Classe. Em 2026, os hospitais centrais abriram 95 vagas.',
  months: null,
}

const SECONDARY: PathwayStep = {
  kind: 'academico',
  level: 'ii_ciclo',
  title: 'Ensino médio concluído',
  need: 'essencial',
  description:
    '12.ª classe, de preferência em Ciências Físicas e Biológicas, ou o curso médio de Enfermagem.',
  months: null,
}

const DEGREE: PathwayStep = {
  kind: 'academico',
  level: 'licenciatura',
  title: 'Licenciatura em Enfermagem',
  need: 'essencial',
  description: 'Quatro a cinco anos numa escola superior pública ou privada, com estágios nos hospitais.',
  months: { min: 48, max: 60 },
}

const ORDER: PathwayStep = {
  kind: 'certificacao',
  title: 'Carteira profissional da Ordem dos Enfermeiros de Angola',
  need: 'essencial',
  certificate: 'exigido',
  description: 'Sem ela não se pode exercer nem concorrer à especialização.',
  months: null,
}

const COMPETITION: PathwayStep = {
  kind: 'experiencia',
  title: 'Concurso público para Enfermeiro',
  need: 'essencial',
  description:
    'Entras no Estado como Enfermeiro de 3.ª Classe: em 2026, só os hospitais centrais abriram 944 vagas. O vínculo ao Serviço Nacional de Saúde é o que a especialização pede.',
  months: null,
}

function speciality(area: string): PathwayStep {
  return {
    kind: 'formacao',
    title: `Especialização em ${area}`,
    need: 'essencial',
    certificate: 'exigido',
    description:
      'Dois anos, depois do exame de acesso do Instituto de Especialização em Saúde; pede a carteira da Ordem e até 45 anos de idade. Em Setembro de 2026, o Ministério da Saúde anunciou 4 800 vagas. Feita no estrangeiro, pede-se a equiparação.',
    months: { min: 24, max: 24 },
  }
}

/** The way in for a technician with a post-secondary speciality. */
function postSecondary(area: string): Pathway {
  return {
    id: 'pos-medio',
    name: 'Curso médio e especialização pós-média',
    summary: `Fazes o curso médio de Enfermagem e a especialização pós-média em ${area}, e entras como técnico especializado.`,
    steps: [
      NINTH,
      TECHNICAL_COURSE,
      COUNCIL,
      {
        kind: 'formacao',
        title: `Especialização pós-média em ${area}`,
        need: 'essencial',
        certificate: 'exigido',
        description:
          'Curso do Ministério da Saúde, dado em institutos técnicos de saúde e hospitais. Em Setembro de 2026, o Ministério anunciou 2 565 vagas em cursos pós-médios.',
        months: null,
      },
      {
        kind: 'experiencia',
        title: 'Concurso público para Técnico Médio de Enfermagem Especializado',
        need: 'essencial',
        description:
          'Entras como Técnico Médio de Enfermagem Especializado de 3.ª Classe: 180 955 Kz por mês em 2026.',
        months: null,
      },
    ],
    totalCost: null,
  }
}

/** The graduate's way in, with the speciality the career asks for. */
function graduate(area: string, name: string): Pathway {
  return {
    id: 'licenciatura',
    name,
    summary: `Com a licenciatura, entras no Estado como Enfermeiro e fazes depois a especialização em ${area}.`,
    steps: [SECONDARY, DEGREE, ORDER, COMPETITION, speciality(area)],
    totalCost: null,
  }
}

/** A nurse's categories, four years each at least (articles 4 and 12), counting from entry. */
function nurseStages(specialist: string): Career['stages'] {
  return [
    {
      level: 'junior',
      title: 'Enfermeiro de 3.ª Classe',
      years: { min: 0, max: 4 },
      responsibilities: [
        'Presta cuidados por turnos, com colegas mais experientes',
        'Ganha prática no serviço onde se quer especializar',
      ],
    },
    {
      level: 'pleno',
      title: `${specialist} (Enfermeiro Especializado de 3.ª Classe)`,
      years: { min: 4, max: 8 },
      responsibilities: [
        'Presta os cuidados mais complexos e actua nas situações de crise',
        'Decide as prioridades nas urgências',
      ],
    },
    {
      level: 'senior',
      title: 'Enfermeiro Especializado de 2.ª Classe',
      years: { min: 8, max: 12 },
      responsibilities: ['Forma os enfermeiros da unidade', 'Faz e participa em trabalhos de investigação'],
    },
    {
      level: 'lideranca',
      title: 'Enfermeiro Especializado de 1.ª Classe',
      years: { min: 12, max: null },
      responsibilities: [
        'Responde pela enfermagem da sua área na equipa',
        'Dá parecer sobre equipamentos, pessoal e organização da unidade',
      ],
    },
  ]
}

function stageSalaries(...salaries: number[]): Career['market']['salaryByStage'] {
  const levels = ['junior', 'pleno', 'senior', 'lideranca'] as const
  return salaries.map((median, index) => ({ level: levels[index], median }))
}

const HIRING: string[] = [
  'Hospitais, centros e postos de saúde públicos',
  'Clínicas e hospitais privados',
  'Serviços de saúde das Forças Armadas e da Polícia',
  'Empresas com posto médico próprio',
  'Organizações de saúde comunitária',
]

const NURSES_NOTE =
  'Os enfermeiros entram no Estado por concurso público e quase não aparecem nos sites de emprego. Em Maio de 2026, o Ministério da Saúde abriu 944 vagas de Enfermeiro de 3.ª Classe e 95 de Técnico Médio de Enfermagem só nos hospitais centrais (Despacho Conjunto n.º 42/26). Em 2023, os 49 283 profissionais de enfermagem eram quase metade de quem trabalhava no Serviço Nacional de Saúde.'

function market(
  demand: Career['market']['demand'],
  salaryByStage: Career['market']['salaryByStage'],
  note = NURSES_NOTE,
) {
  return {
    demand,
    trendPct: null,
    demandNote: { text: note, source: DESPACHO },
    salary: null,
    salaryByStage,
    postingsByMonth: [],
    hiringSectors: HIRING,
  } satisfies Career['market']
}

const CV_GUIDE: Career['cvGuide'] = {
  template: 'classico',
  include: [
    'O número da carteira da Ordem dos Enfermeiros, ou da inscrição no Conselho Geral de Enfermagem, logo no topo',
    'Os estágios e os serviços onde trabalhaste, com o hospital e a duração',
    'Cursos com certificado, como o suporte básico de vida',
    'A especialização, com a escola e o ano',
  ],
  avoid: [
    'Fotografias e dados pessoais que a candidatura não pede',
    'Competências sem dizer onde as praticaste',
    'Erros nas datas e nos nomes dos hospitais',
  ],
}

const COMMON_SKILLS: Skill[] = [
  { id: 'sinais-vitais', name: 'Avaliação dos sinais vitais', importance: 'essencial' },
  {
    id: 'administracao-medicacao',
    name: 'Preparação e administração de medicamentos',
    importance: 'essencial',
  },
  { id: 'tratamento-feridas', name: 'Pensos e tratamento de feridas', importance: 'essencial' },
  { id: 'controlo-infeccao', name: 'Prevenção e controlo de infecções', importance: 'essencial' },
  { id: 'suporte-basico-vida', name: 'Suporte básico de vida', importance: 'essencial' },
  { id: 'registos-enfermagem', name: 'Registos de enfermagem', importance: 'essencial' },
]
const EXTRA_SKILLS: Skill[] = [{ id: 'ingles-cientifico', name: 'Inglês científico', importance: 'opcional' }]

type Guide = Pick<Career, 'description' | 'dayToDay' | 'workContext' | 'workStyles'> & {
  slug: string
  /** The career's own skills; the guide adds the ones every nurse needs. */
  skills: Skill[]
  pathways: Pathway[]
  stages: Career['stages']
  market: Career['market']
}

function guide({ slug, skills, ...rest }: Guide): Career {
  return {
    ...summaryOf(slug),
    ...rest,
    skills: [...COMMON_SKILLS, ...skills, ...EXTRA_SKILLS],
    employerAsks: null,
    cvGuide: CV_GUIDE,
  }
}

export const NURSING_GUIDES: Career[] = [
  guide({
    slug: 'enfermeiro',
    description:
      'Cuida dos doentes de dia e de noite: avalia o estado de cada um, dá a medicação e os tratamentos, vigia os sinais de alarme e ensina o doente e a família a cuidar-se. Trabalha em hospitais, centros e postos de saúde e clínicas. É a profissão com mais gente no Serviço Nacional de Saúde: em 2023 eram 49 283 profissionais de enfermagem.',
    dayToDay: [
      'Receber o turno e ver o estado de cada doente',
      'Medir os sinais vitais e registar tudo no processo',
      'Dar a medicação e fazer pensos, injecções e soros',
      'Vacinar e fazer consultas de enfermagem no centro de saúde',
      'Ensinar o doente e a família a cuidar-se em casa',
    ],
    workContext: [
      { label: 'Ambiente', value: 'Enfermarias, urgências, centros e postos de saúde' },
      { label: 'Horário', value: 'Turnos de dia e de noite; 36 horas por semana no Estado' },
      { label: 'Equipa', value: 'Médicos, técnicos de enfermagem e de diagnóstico' },
      { label: 'Local', value: 'Em todas as províncias, das cidades aos postos de saúde' },
    ],
    workStyles: [
      'Gostar de cuidar de pessoas',
      'Calma sob pressão',
      'Organização no turno',
      'Atenção ao detalhe',
      'Resistência física',
    ],
    skills: [
      { id: 'consulta-enfermagem', name: 'Consulta de enfermagem', importance: 'essencial' },
      { id: 'vacinacao', name: 'Calendário de vacinas', importance: 'essencial' },
      { id: 'educacao-saude', name: 'Educação para a saúde', importance: 'opcional' },
    ],
    pathways: [
      {
        id: 'licenciatura',
        name: 'Licenciatura em Enfermagem',
        summary: 'O caminho principal: a licenciatura, a carteira da Ordem e o concurso para Enfermeiro.',
        steps: [SECONDARY, DEGREE, ORDER, COMPETITION],
        totalCost: null,
      },
      {
        id: 'curso-medio',
        name: 'Do curso médio à licenciatura',
        summary: 'Começas como técnico de enfermagem e, com a licenciatura, passas a Enfermeiro.',
        steps: [NINTH, TECHNICAL_COURSE, COUNCIL, TECHNICAL_COMPETITION, DEGREE, ORDER, COMPETITION],
        totalCost: null,
      },
    ],
    stages: [
      {
        level: 'junior',
        title: 'Enfermeiro de 3.ª Classe',
        years: { min: 0, max: 4 },
        responsibilities: ['Presta cuidados por turnos', 'Orienta os técnicos e os estagiários do turno'],
      },
      {
        level: 'pleno',
        title: 'Enfermeiro de 2.ª Classe',
        years: { min: 4, max: 8 },
        responsibilities: ['Faz consultas de enfermagem', 'Coordena os cuidados de doentes mais complexos'],
      },
      {
        level: 'senior',
        title: 'Enfermeiro de 1.ª Classe',
        years: { min: 8, max: 12 },
        responsibilities: ['Pode gerir a enfermagem de um serviço', 'Avalia e forma a equipa'],
      },
      {
        level: 'lideranca',
        title: 'Enfermeiro Especializado, com uma especialização',
        years: { min: 12, max: null },
        responsibilities: ['Presta os cuidados mais diferenciados', 'Responde pela formação da equipa'],
      },
    ],
    market: market('alta', stageSalaries(...SALARY.nurse, SALARY.specialist[0])),
  }),
  guide({
    slug: 'tecnico-medio-enfermagem',
    description:
      'Presta cuidados de enfermagem com o curso médio: vigia os doentes, dá a medicação que o médico receitou, faz pensos e primeiros socorros e apoia o enfermeiro. Trabalha em hospitais, centros e postos de saúde. Atenção: desde 2025/2026, e durante 5 anos, o curso médio de Enfermagem não abre em Luanda e noutras nove províncias, e o Estado contrata sobretudo licenciados.',
    dayToDay: [
      'Medir a tensão, a temperatura e o pulso dos doentes',
      'Dar a medicação receitada e preparar soros',
      'Fazer pensos, injecções e curativos',
      'Prestar os primeiros socorros na urgência',
      'Registar os cuidados e avisar o enfermeiro ou o médico do que muda',
    ],
    workContext: [
      { label: 'Ambiente', value: 'Enfermarias, bancos de urgência, centros e postos de saúde' },
      { label: 'Horário', value: 'Turnos de dia e de noite' },
      { label: 'Equipa', value: 'Enfermeiros, médicos e auxiliares' },
      { label: 'Local', value: 'Em todas as províncias' },
    ],
    workStyles: [
      'Gostar de cuidar de pessoas',
      'Calma em emergências',
      'Seguir rotinas e protocolos',
      'Atenção ao detalhe',
      'Resistência física',
    ],
    skills: [{ id: 'primeiros-socorros', name: 'Primeiros socorros', importance: 'essencial' }],
    pathways: [
      {
        id: 'curso-medio',
        name: 'Curso médio de Enfermagem',
        summary: 'Fazes o curso médio a seguir à 9.ª classe e concorres a Técnico Médio de Enfermagem.',
        steps: [NINTH, TECHNICAL_COURSE, COUNCIL, TECHNICAL_COMPETITION],
        totalCost: null,
      },
      postSecondary('Parteira, Pediatria, Cuidados Intensivos ou outra área'),
    ],
    stages: [
      {
        level: 'junior',
        title: 'Técnico Médio de Enfermagem de 3.ª Classe',
        years: { min: 0, max: 4 },
        responsibilities: ['Presta cuidados por turnos', 'Dá a medicação receitada e faz os registos'],
      },
      {
        level: 'pleno',
        title: 'Técnico Médio de Enfermagem de 2.ª Classe',
        years: { min: 4, max: 8 },
        responsibilities: ['Participa na programação dos cuidados', 'Orienta os auxiliares de enfermagem'],
      },
      {
        level: 'senior',
        title: 'Técnico Médio de Enfermagem de 1.ª Classe',
        years: { min: 8, max: null },
        responsibilities: ['Apoia a formação dos colegas', 'Pode fazer uma especialização pós-média'],
      },
    ],
    market: market(
      'media',
      stageSalaries(...SALARY.technician),
      'Os técnicos de enfermagem entram no Estado por concurso público. Em Maio de 2026, os hospitais centrais abriram 95 vagas de Técnico Médio de Enfermagem e 944 de Enfermeiro licenciado (Despacho Conjunto n.º 42/26): o Estado contrata sobretudo licenciados e, desde 2018, já não admite bacharéis nem auxiliares de enfermagem.',
    ),
  }),
  guide({
    slug: 'parteira',
    description:
      'Acompanha a mulher na gravidez, no parto e depois dele: faz consultas pré-natais, assiste partos normais, cuida do recém-nascido e chama o médico quando há complicações. Trabalha em maternidades, centros materno-infantis e centros de saúde. É a especialização pós-média com mais alunos: em 2023 havia 360 técnicos a formar-se como parteiras.',
    dayToDay: [
      'Fazer consultas pré-natais e seguir a evolução da gravidez',
      'Assistir partos normais na sala de partos',
      'Cuidar do recém-nascido nos primeiros minutos',
      'Vigiar a mãe depois do parto e apoiar a amamentação',
      'Reconhecer complicações e chamar o obstetra',
    ],
    workContext: [
      { label: 'Ambiente', value: 'Maternidades, salas de partos e centros materno-infantis' },
      { label: 'Horário', value: 'Partos a qualquer hora, por turnos' },
      { label: 'Equipa', value: 'Obstetras, pediatras e enfermeiros' },
      { label: 'Doentes', value: 'Grávidas, mães e recém-nascidos' },
    ],
    workStyles: [
      'Calma em emergências',
      'Carinho e respeito',
      'Decisão rápida',
      'Resistência física',
      'Discrição',
    ],
    skills: [
      { id: 'consultas-pre-natais', name: 'Consultas pré-natais', importance: 'essencial' },
      { id: 'assistencia-parto', name: 'Assistência ao parto', importance: 'essencial' },
      { id: 'recem-nascido', name: 'Cuidados ao recém-nascido', importance: 'essencial' },
      { id: 'reanimacao-neonatal', name: 'Reanimação neonatal', importance: 'essencial' },
    ],
    pathways: [
      graduate('Saúde Materna e Neonatal', 'Enfermeiro especialista em saúde materna'),
      postSecondary('Parteira'),
    ],
    stages: nurseStages('Enfermeiro Especialista em Saúde Materna'),
    market: market('alta', stageSalaries(SALARY.nurse[0], ...SALARY.specialist)),
  }),
  guide({
    slug: 'enfermeiro-cuidados-intensivos',
    description:
      'Cuida dos doentes mais graves, ligados a ventiladores, monitores e bombas de medicação, e é o primeiro a ver quando algo muda. Trabalha nas unidades de cuidados intensivos dos hospitais centrais e provinciais e de algumas clínicas. Chega-se lá com a especialização em Cuidados Intensivos: em 2023 havia 186 técnicos na especialização pós-média e 18 enfermeiros licenciados na especialização.',
    dayToDay: [
      'Vigiar os monitores e os ventiladores, hora a hora',
      'Preparar e dar medicação em bombas e perfusões',
      'Aspirar, posicionar e cuidar de doentes que não se mexem',
      'Agir de imediato numa paragem cardíaca',
      'Apoiar as famílias nas horas difíceis',
    ],
    workContext: [
      { label: 'Ambiente', value: 'Unidade de cuidados intensivos' },
      { label: 'Horário', value: 'Turnos de dia e de noite' },
      { label: 'Equipa', value: 'Médicos intensivistas e outros enfermeiros' },
      { label: 'Tecnologia', value: 'Ventiladores, monitores e bombas de perfusão' },
    ],
    workStyles: [
      'Calma em situações graves',
      'Atenção constante',
      'Decisão rápida',
      'Resistência ao cansaço',
      'Empatia com as famílias',
    ],
    skills: [
      { id: 'ventilacao', name: 'Ventilação mecânica', importance: 'essencial' },
      { id: 'doente-critico', name: 'Monitorização do doente crítico', importance: 'essencial' },
      { id: 'perfusoes', name: 'Bombas e perfusões de medicamentos', importance: 'essencial' },
      { id: 'suporte-avancado-vida', name: 'Suporte avançado de vida', importance: 'essencial' },
    ],
    pathways: [
      graduate('Cuidados Intensivos', 'Enfermeiro especialista em cuidados intensivos'),
      postSecondary('Cuidados Intensivos'),
    ],
    stages: nurseStages('Enfermeiro Especialista em Cuidados Intensivos'),
    market: market('media', stageSalaries(SALARY.nurse[0], ...SALARY.specialist)),
  }),
  guide({
    slug: 'instrumentista-cirurgico',
    description:
      'Prepara os instrumentos e o material esterilizado, passa-os ao cirurgião durante a operação e conta tudo no fim, para nada ficar dentro do doente. Trabalha nos blocos operatórios dos hospitais e das clínicas. Forma-se sobretudo na especialização pós-média de Instrumentação Cirúrgica: em 2023 havia 194 técnicos nela.',
    dayToDay: [
      'Preparar a sala e o material esterilizado antes da cirurgia',
      'Passar os instrumentos ao cirurgião durante a operação',
      'Contar compressas, agulhas e instrumentos no início e no fim',
      'Manter o campo operatório estéril',
      'Enviar o material para a esterilização e repor a sala',
    ],
    workContext: [
      { label: 'Ambiente', value: 'Bloco operatório' },
      { label: 'Horário', value: 'Cirurgias programadas e urgências por turnos' },
      { label: 'Equipa', value: 'Cirurgiões, anestesistas e enfermeiros circulantes' },
      { label: 'Ritmo', value: 'Muitas horas de pé, com atenção constante' },
    ],
    workStyles: [
      'Destreza manual',
      'Atenção ao detalhe',
      'Antecipar o que o cirurgião precisa',
      'Calma sob pressão',
      'Resistência física',
    ],
    skills: [
      { id: 'instrumentacao', name: 'Instrumentação cirúrgica', importance: 'essencial' },
      { id: 'assepsia', name: 'Assepsia e segurança no bloco', importance: 'essencial' },
      { id: 'esterilizacao', name: 'Esterilização de material', importance: 'essencial' },
      { id: 'contagem-cirurgica', name: 'Contagem de compressas e instrumentos', importance: 'essencial' },
    ],
    pathways: [
      postSecondary('Instrumentação Cirúrgica'),
      graduate('Enfermagem Médico-Cirúrgica', 'Enfermeiro de bloco operatório'),
    ],
    stages: [
      {
        level: 'junior',
        title: 'Técnico Médio de Enfermagem Especializado de 3.ª Classe',
        years: { min: 0, max: 4 },
        responsibilities: [
          'Instrumenta as cirurgias com um colega mais experiente',
          'Prepara e conta o material',
        ],
      },
      {
        level: 'pleno',
        title: 'Técnico Médio de Enfermagem Especializado de 2.ª Classe',
        years: { min: 4, max: 8 },
        responsibilities: [
          'Instrumenta cirurgias mais complexas',
          'Dá parecer sobre o material e os equipamentos',
        ],
      },
      {
        level: 'senior',
        title: 'Técnico Médio de Enfermagem Especializado de 1.ª Classe',
        years: { min: 8, max: null },
        responsibilities: ['Organiza o trabalho do bloco', 'Forma os novos instrumentistas'],
      },
    ],
    market: market('media', stageSalaries(...SALARY.specialisedTechnician)),
  }),
]
