import type { Career, PathwayStep, Skill } from '../types'
import { detailedHealthCareer as summaryOf } from './healthCareers'

// The full guides of the medical careers (the Medicina group, and the public health doctor of the Saúde pública
// group, who has the same career), from public sources:
// - the specialities and how long each internship takes, how one enters it and the foreign degrees: Regulamento sobre
//   o Internato Médico (Decreto Presidencial n.º 60/25, articles 9, 10, 40 and 41 and annex I);
// - the categories and what each promotion asks: Regime Jurídico da Carreira Médica (Decreto Presidencial n.º 186/18);
// - the base salary of each category: the 2026 table (Decreto Presidencial n.º 16/26);
// - the doctors in each internship and in the national health service: MINSA, Anuário Estatístico Sanitário 2023;
// - the 2026 public competitions: Despachos Conjuntos n.º 43/26 to 63/26 (2 963 places for doctors).
// Doctors are hired by public competition, not job ads: their guides have no ads, trend or employers' asks.

/** The medical career's 2026 base salaries, in Kz a month (Decreto Presidencial n.º 16/26). */
const SALARY = {
  general: 410_165,
  assistant: 506_674,
  /** Assistente Graduado, Grupos C and B (542 865 and 579 056). */
  graduate: 560_960,
  senior: 597_151,
  head: 615_247,
}

const MINSA = 'em 2023 havia'

const SECONDARY: PathwayStep = {
  kind: 'academico',
  level: 'ii_ciclo',
  title: 'Ensino médio concluído',
  need: 'essencial',
  description: '12.ª classe. Ciências Físicas e Biológicas dá a base para os exames de acesso a Medicina.',
  months: null,
}

const DEGREE: PathwayStep = {
  kind: 'academico',
  level: 'licenciatura',
  title: 'Licenciatura em Medicina',
  need: 'essencial',
  description: 'Seis anos numa faculdade de Medicina pública ou privada, com estágios nos hospitais.',
  months: { min: 72, max: 72 },
}

const ORDER: PathwayStep = {
  kind: 'certificacao',
  title: 'Carteira profissional da Ordem dos Médicos de Angola',
  need: 'essencial',
  certificate: 'exigido',
  description: 'Sem ela não se pode exercer nem concorrer ao internato de especialidade.',
  months: null,
}

const COMPETITION: PathwayStep = {
  kind: 'experiencia',
  title: 'Concurso público para Médico Geral',
  need: 'essencial',
  description:
    'O Estado abre vagas de Médico-Geral/Interno de Especialidade em todas as províncias: 2 963 em 2026. O vínculo ao Serviço Nacional de Saúde é o que o internato pede.',
  months: null,
}

function internship(speciality: string, years: number): PathwayStep {
  return {
    kind: 'formacao',
    title: `Internato de ${speciality}`,
    need: 'essencial',
    certificate: 'exigido',
    description: `${years} anos num hospital com idoneidade formativa, com um orientador, depois do exame de acesso do Instituto de Especialização em Saúde. No fim, presta-se serviço ao Estado durante o mesmo tempo.`,
    months: { min: years * 12, max: years * 12 },
  }
}

function abroad(speciality: string, years: number): PathwayStep[] {
  return [
    {
      kind: 'formacao',
      title: `Especialidade de ${speciality} no estrangeiro`,
      need: 'essencial',
      certificate: 'exigido',
      description:
        'Num hospital universitário de outro país, com o diploma de especialista no fim. Depende de uma bolsa ou de meios próprios.',
      months: { min: years * 12, max: (years + 1) * 12 },
    },
    {
      kind: 'certificacao',
      title: 'Equiparação do grau de especialista',
      need: 'essencial',
      certificate: 'exigido',
      description:
        'Pedida ao Instituto de Especialização em Saúde, que confirma que a formação equivale ao internato angolano.',
      months: null,
    },
  ]
}

/** The categories of the medical career, counting the years from the end of the degree. */
function stages(years: number, specialist: string): Career['stages'] {
  return [
    {
      level: 'estagio',
      title: 'Médico Interno de Especialidade',
      years: { min: 0, max: years },
      responsibilities: [
        'Faz o internato num hospital, com um orientador',
        'Faz urgências e as rotações do programa',
      ],
    },
    {
      level: 'junior',
      title: `${specialist} (Médico Assistente)`,
      years: { min: years, max: years + 4 },
      responsibilities: [
        'Responde pelos seus doentes',
        'Faz consultas, urgências e o trabalho da especialidade',
      ],
    },
    {
      level: 'pleno',
      title: 'Assistente Graduado (Grupos C e B)',
      years: { min: years + 4, max: years + 12 },
      responsibilities: ['Orienta internos de especialidade', 'Faz cursos de superação profissional'],
    },
    {
      level: 'senior',
      title: 'Assistente Graduado do Grupo A',
      years: { min: years + 12, max: years + 16 },
      responsibilities: ['Coordena equipas e casos difíceis', 'Forma os novos especialistas'],
    },
    {
      level: 'lideranca',
      title: 'Chefe de Serviço',
      years: { min: years + 16, max: null },
      responsibilities: [
        'Dirige um serviço hospitalar',
        'Responde pela qualidade e pela formação do serviço',
      ],
    },
  ]
}

const MARKET: Career['market'] = {
  demand: 'alta',
  trendPct: null,
  demandNote: {
    text: 'Os médicos entram no Estado por concurso público, não por anúncio. Em Maio de 2026, o Ministério da Saúde abriu 2 963 vagas de Médico-Geral/Interno de Especialidade, em todas as províncias (Despachos Conjuntos n.º 43/26 a 63/26); em 2023 trabalhavam 7 395 médicos no Serviço Nacional de Saúde.',
    source: {
      label: 'Um dos despachos: 439 vagas no Zaire (AngoLEX)',
      url: 'https://angolex.com/paginas/despachos/atribuicao-de-439a-vagas-para-medicos-no-concurso-publico-de-ingresso-externo-na-provincia-do-zaire-44a-26a.html',
    },
  },
  salary: null,
  salaryByStage: [
    { level: 'estagio', median: SALARY.general },
    { level: 'junior', median: SALARY.assistant },
    { level: 'pleno', median: SALARY.graduate },
    { level: 'senior', median: SALARY.senior },
    { level: 'lideranca', median: SALARY.head },
  ],
  postingsByMonth: [],
  hiringSectors: [
    'Hospitais e centros de saúde públicos',
    'Clínicas e hospitais privados',
    'Serviços de saúde das Forças Armadas e da Polícia',
    'Empresas com serviço médico próprio',
  ],
}

const CV_GUIDE: Career['cvGuide'] = {
  template: 'classico',
  include: [
    'O número da carteira profissional da Ordem dos Médicos, logo no topo',
    'O internato e os estágios, com o hospital, o serviço e a duração',
    'Cursos clínicos com certificado, como o suporte avançado de vida',
    'Trabalhos científicos, comunicações em congressos e línguas',
  ],
  avoid: [
    'Fotografias e dados pessoais que a candidatura não pede',
    'Competências sem dizer onde as praticaste',
    'Erros nas datas e nos nomes dos hospitais',
  ],
}

const COMMON_SKILLS: Skill[] = [
  { id: 'historia-clinica', name: 'História clínica e exame físico', importance: 'essencial' },
  { id: 'decisao-clinica', name: 'Diagnóstico e decisão clínica', importance: 'essencial' },
  { id: 'prescricao', name: 'Prescrição segura de medicamentos', importance: 'essencial' },
  { id: 'suporte-vida', name: 'Suporte básico e avançado de vida', importance: 'essencial' },
  { id: 'comunicacao-clinica', name: 'Comunicar com doentes e famílias', importance: 'essencial' },
]
const EXTRA_SKILLS: Skill[] = [
  { id: 'ingles-cientifico', name: 'Inglês científico', importance: 'opcional' },
  { id: 'investigacao-clinica', name: 'Investigação clínica', importance: 'opcional' },
]

type Spec = {
  slug: string
  /** The speciality as Decreto Presidencial n.º 60/25 names it, and its years of internship (annex I). */
  speciality: string
  years: number
  /** Doctors in this speciality's internship in 2023 (MINSA), when the yearbook counts them. */
  residents?: number
  /** What the doctor does and where; the guide adds the internship. */
  description: string
  dayToDay: string[]
  workContext: Career['workContext']
  workStyles: string[]
  /** The speciality's own skills; the guide adds the ones every doctor needs. */
  skills: Skill[]
}

function specialistGuide(spec: Spec): Career {
  const summary = summaryOf(spec.slug)
  return {
    ...summary,
    description: `${spec.description} A especialização faz-se no internato de ${spec.speciality}, com ${spec.years} anos${spec.residents ? `: ${MINSA} ${spec.residents} médicos nele` : ''}.`,
    dayToDay: spec.dayToDay,
    workContext: spec.workContext,
    workStyles: spec.workStyles,
    skills: [...COMMON_SKILLS, ...spec.skills, ...EXTRA_SKILLS],
    employerAsks: null,
    pathways: [
      {
        id: 'internato',
        name: 'Via do internato médico',
        summary:
          'A via normal: entras no Serviço Nacional de Saúde como Médico Geral e fazes a especialidade num hospital angolano.',
        steps: [SECONDARY, DEGREE, ORDER, COMPETITION, internship(spec.speciality, spec.years)],
        totalCost: null,
      },
      {
        id: 'estrangeiro',
        name: 'Especialização no estrangeiro',
        summary: 'Fazes a especialidade fora do país e pedes depois a equiparação do grau.',
        steps: [SECONDARY, DEGREE, ORDER, ...abroad(spec.speciality, spec.years)],
        totalCost: null,
      },
    ],
    stages: stages(spec.years, summary.name),
    market: { ...MARKET, demand: summary.demand },
    cvGuide: CV_GUIDE,
  }
}

const GENERAL_PRACTITIONER: Career = {
  ...summaryOf('medico-clinica-geral'),
  description: `É o primeiro médico a quem as pessoas recorrem: faz consultas, trata as doenças mais comuns, acompanha os doentes crónicos e encaminha para o especialista quando é preciso. Trabalha sobretudo nos centros de saúde e nos hospitais municipais, e é a porta de entrada da maioria dos médicos no Serviço Nacional de Saúde. Pode especializar-se no internato de Medicina Geral e Familiar, com 3 anos: ${MINSA} 558 médicos nele.`,
  dayToDay: [
    'Fazer consultas a crianças, adultos e idosos',
    'Tratar malária, infecções respiratórias e diarreias, as doenças mais comuns',
    'Acompanhar doentes com hipertensão, diabetes e VIH',
    'Fazer turnos de urgência no hospital municipal',
    'Encaminhar para o especialista e explicar o tratamento às famílias',
  ],
  workContext: [
    { label: 'Ambiente', value: 'Centros de saúde e hospitais municipais' },
    { label: 'Horário', value: 'Consultas de dia e turnos de urgência' },
    { label: 'Equipa', value: 'Enfermeiros, técnicos de diagnóstico e outros médicos' },
    { label: 'Local', value: 'Muitas vagas fora das capitais de província' },
  ],
  workStyles: [
    'Gostar de pessoas de todas as idades',
    'Calma sob pressão',
    'Decidir com poucos meios',
    'Explicar de forma simples',
    'Vontade de aprender sempre',
  ],
  skills: [
    ...COMMON_SKILLS,
    { id: 'doencas-tropicais', name: 'Malária e doenças tropicais', importance: 'essencial' },
    { id: 'saude-materno-infantil', name: 'Saúde materno-infantil', importance: 'essencial' },
    { id: 'doencas-cronicas', name: 'Seguimento de doenças crónicas', importance: 'essencial' },
    { id: 'pequena-cirurgia', name: 'Pequena cirurgia', importance: 'opcional' },
    ...EXTRA_SKILLS,
  ],
  employerAsks: null,
  pathways: [
    {
      id: 'medico-geral',
      name: 'Médico Geral',
      summary:
        'O caminho mais curto: com a licenciatura e a carteira da Ordem, concorres ao Estado como Médico Geral.',
      steps: [SECONDARY, DEGREE, ORDER, COMPETITION],
      totalCost: null,
    },
    {
      id: 'internato',
      name: 'Especialista em Medicina Geral e Familiar',
      summary: 'Depois de entrares como Médico Geral, fazes o internato e passas a especialista.',
      steps: [SECONDARY, DEGREE, ORDER, COMPETITION, internship('Medicina Geral e Familiar', 3)],
      totalCost: null,
    },
  ],
  stages: [
    {
      level: 'estagio',
      title: 'Médico Geral',
      years: { min: 0, max: 3 },
      responsibilities: ['Faz consultas e urgências nos cuidados primários', 'Pede ajuda nos casos difíceis'],
    },
    ...stages(3, 'Especialista em Medicina Geral e Familiar').slice(1),
  ],
  market: MARKET,
  cvGuide: CV_GUIDE,
}

export const MEDICINE_GUIDES: Career[] = [
  GENERAL_PRACTITIONER,
  specialistGuide({
    slug: 'medico-pediatra',
    speciality: 'Pediatria',
    years: 3,
    residents: 446,
    description:
      'Cuida da saúde das crianças, do recém-nascido ao adolescente: trata as doenças, acompanha o crescimento e as vacinas e orienta os pais. Trabalha em hospitais pediátricos, nos serviços de pediatria dos hospitais provinciais e em clínicas.',
    dayToDay: [
      'Observar crianças doentes na consulta e na urgência',
      'Tratar malária, pneumonias, diarreias e desnutrição',
      'Acompanhar o crescimento, o desenvolvimento e as vacinas',
      'Cuidar de recém-nascidos prematuros ou doentes na neonatologia',
      'Explicar aos pais o tratamento e os cuidados em casa',
    ],
    workContext: [
      { label: 'Ambiente', value: 'Hospitais pediátricos, enfermarias e consultas' },
      { label: 'Horário', value: 'Consultas, enfermaria e urgências por turnos' },
      { label: 'Equipa', value: 'Enfermeiros de pediatria, nutricionistas e outros especialistas' },
      { label: 'Doentes', value: 'Crianças e as suas famílias' },
    ],
    workStyles: [
      'Paciência e carinho com crianças',
      'Calma com pais preocupados',
      'Atenção a sinais pequenos',
      'Decidir depressa nas urgências',
      'Trabalhar em equipa',
    ],
    skills: [
      { id: 'recem-nascido', name: 'Cuidados ao recém-nascido', importance: 'essencial' },
      { id: 'crescimento', name: 'Avaliação do crescimento e da nutrição', importance: 'essencial' },
      { id: 'vacinacao', name: 'Calendário de vacinas', importance: 'essencial' },
      { id: 'emergencia-pediatrica', name: 'Emergência pediátrica', importance: 'essencial' },
    ],
  }),
  specialistGuide({
    slug: 'medico-ginecologista-obstetra',
    speciality: 'Ginecologia e Obstetrícia',
    years: 4,
    residents: 373,
    description:
      'Acompanha a saúde da mulher em todas as idades, a gravidez e o parto, e opera quando é preciso, como nas cesarianas. Trabalha em maternidades, hospitais gerais e clínicas.',
    dayToDay: [
      'Fazer consultas de gravidez e ecografias',
      'Assistir partos e fazer cesarianas',
      'Tratar infecções, quistos e outras doenças ginecológicas',
      'Fazer o rastreio do cancro do colo do útero e da mama',
      'Aconselhar sobre planeamento familiar',
    ],
    workContext: [
      { label: 'Ambiente', value: 'Maternidades, blocos de partos e consultas' },
      { label: 'Horário', value: 'Urgências obstétricas a qualquer hora' },
      { label: 'Equipa', value: 'Enfermeiros parteiros, anestesistas e pediatras' },
      { label: 'Doentes', value: 'Mulheres e grávidas' },
    ],
    workStyles: [
      'Calma em emergências',
      'Respeito e discrição',
      'Decisão rápida',
      'Destreza manual',
      'Resistência física',
    ],
    skills: [
      { id: 'assistencia-parto', name: 'Assistência ao parto', importance: 'essencial' },
      { id: 'cesariana', name: 'Cesariana e cirurgia ginecológica', importance: 'essencial' },
      { id: 'ecografia-obstetrica', name: 'Ecografia obstétrica', importance: 'essencial' },
      { id: 'planeamento-familiar', name: 'Planeamento familiar', importance: 'opcional' },
    ],
  }),
  specialistGuide({
    slug: 'medico-internista',
    speciality: 'Medicina Interna',
    years: 4,
    residents: 230,
    description:
      'Trata os adultos com doenças que atingem vários órgãos ao mesmo tempo, como a hipertensão, a diabetes, a insuficiência renal ou o VIH. É o médico das enfermarias de medicina dos hospitais e quem junta as opiniões dos outros especialistas.',
    dayToDay: [
      'Fazer a visita aos doentes internados na enfermaria',
      'Pedir e interpretar análises e exames',
      'Ajustar o tratamento de doentes com várias doenças',
      'Ver doentes na urgência e decidir quem fica internado',
      'Discutir os casos difíceis com outros especialistas',
    ],
    workContext: [
      { label: 'Ambiente', value: 'Enfermarias, consultas e urgências hospitalares' },
      { label: 'Horário', value: 'Visita de manhã, consultas e turnos de urgência' },
      { label: 'Equipa', value: 'Enfermeiros, outros especialistas e internos' },
      { label: 'Doentes', value: 'Adultos e idosos' },
    ],
    workStyles: [
      'Raciocínio cuidadoso',
      'Gosto por resolver casos difíceis',
      'Paciência',
      'Organização',
      'Trabalhar com muitas especialidades',
    ],
    skills: [
      {
        id: 'interpretacao-exames',
        name: 'Interpretação de análises e exames de imagem',
        importance: 'essencial',
      },
      { id: 'doencas-cronicas', name: 'Seguimento de doenças crónicas', importance: 'essencial' },
      { id: 'doencas-infecciosas', name: 'VIH, tuberculose e outras infecções', importance: 'essencial' },
      { id: 'ecografia-clinica', name: 'Ecografia à cabeceira do doente', importance: 'opcional' },
    ],
  }),
  specialistGuide({
    slug: 'cirurgiao-geral',
    speciality: 'Cirurgia Geral',
    years: 4,
    residents: 212,
    description:
      'Opera doenças e lesões do abdómen, da pele e dos tecidos, como apendicites, hérnias, feridas e traumatismos. Trabalha nos blocos operatórios e nas urgências dos hospitais, onde é chamado a todas as urgências cirúrgicas.',
    dayToDay: [
      'Operar no bloco operatório, com a equipa de anestesia e de enfermagem',
      'Ver doentes na urgência e decidir se precisam de cirurgia',
      'Tratar feridas, abcessos e traumatismos',
      'Acompanhar os operados na enfermaria',
      'Fazer consultas antes e depois da cirurgia',
    ],
    workContext: [
      { label: 'Ambiente', value: 'Bloco operatório, urgência e enfermaria' },
      { label: 'Horário', value: 'Cirurgias programadas e urgências por turnos' },
      { label: 'Equipa', value: 'Anestesistas, enfermeiros de bloco e internos' },
      { label: 'Ritmo', value: 'Dias longos e decisões rápidas' },
    ],
    workStyles: [
      'Destreza manual',
      'Decidir sob pressão',
      'Resistência física',
      'Liderar a equipa no bloco',
      'Calma quando algo corre mal',
    ],
    skills: [
      { id: 'tecnica-cirurgica', name: 'Técnica cirúrgica e suturas', importance: 'essencial' },
      { id: 'cirurgia-urgencia', name: 'Cirurgia de urgência e trauma', importance: 'essencial' },
      { id: 'assepsia', name: 'Assepsia e segurança no bloco', importance: 'essencial' },
      { id: 'laparoscopia', name: 'Cirurgia laparoscópica', importance: 'opcional' },
    ],
  }),
  specialistGuide({
    slug: 'medico-intensivista',
    speciality: 'Medicina Intensiva',
    years: 3,
    residents: 162,
    description:
      'Trata os doentes em estado mais grave, que precisam de ventilador, de medicamentos para manter a tensão ou de vigilância contínua. Trabalha nas unidades de cuidados intensivos dos hospitais centrais e provinciais.',
    dayToDay: [
      'Vigiar doentes graves, ligados a ventiladores e monitores',
      'Pôr cateteres e entubar doentes',
      'Ajustar o tratamento hora a hora',
      'Receber doentes da urgência e do bloco operatório',
      'Falar com as famílias em momentos difíceis',
    ],
    workContext: [
      { label: 'Ambiente', value: 'Unidade de cuidados intensivos' },
      { label: 'Horário', value: 'Turnos, de dia e de noite' },
      { label: 'Equipa', value: 'Enfermeiros de cuidados intensivos e outros especialistas' },
      { label: 'Doentes', value: 'Doentes em estado crítico' },
    ],
    workStyles: [
      'Calma em situações graves',
      'Decisão rápida',
      'Atenção constante',
      'Resistência ao cansaço',
      'Empatia com as famílias',
    ],
    skills: [
      { id: 'ventilacao', name: 'Ventilação mecânica', importance: 'essencial' },
      { id: 'choque-sepsis', name: 'Tratamento do choque e da sépsis', importance: 'essencial' },
      { id: 'procedimentos-invasivos', name: 'Cateteres e entubação', importance: 'essencial' },
      { id: 'ecografia-clinica', name: 'Ecografia à cabeceira do doente', importance: 'opcional' },
    ],
  }),
  specialistGuide({
    slug: 'medico-ortopedista',
    speciality: 'Ortopedia e Traumatologia',
    years: 4,
    residents: 132,
    description:
      'Trata os ossos, as articulações, os músculos e os tendões: fracturas, entorses, deformações e o desgaste das articulações. Com os acidentes de viação, as urgências de traumatologia são grande parte do trabalho.',
    dayToDay: [
      'Tratar fracturas com gesso, tracção ou cirurgia',
      'Operar no bloco: placas, parafusos e próteses',
      'Ver vítimas de acidentes na urgência',
      'Ler radiografias e TACs',
      'Acompanhar a recuperação com os fisioterapeutas',
    ],
    workContext: [
      { label: 'Ambiente', value: 'Bloco operatório, urgência e consultas' },
      { label: 'Horário', value: 'Cirurgias programadas e urgências por turnos' },
      { label: 'Equipa', value: 'Fisioterapeutas, anestesistas e enfermeiros' },
      { label: 'Ritmo', value: 'Muito trabalho de urgência' },
    ],
    workStyles: [
      'Destreza manual',
      'Força e resistência física',
      'Visão em três dimensões',
      'Decisão rápida',
      'Trabalhar em equipa',
    ],
    skills: [
      { id: 'fracturas', name: 'Tratamento de fracturas', importance: 'essencial' },
      { id: 'leitura-imagem-ossea', name: 'Leitura de radiografias e TAC', importance: 'essencial' },
      { id: 'cirurgia-ortopedica', name: 'Cirurgia ortopédica', importance: 'essencial' },
      { id: 'artroscopia', name: 'Artroscopia', importance: 'opcional' },
    ],
  }),
  specialistGuide({
    slug: 'medico-radiologista',
    speciality: 'Imagiologia/Radiologia',
    years: 3,
    residents: 125,
    description:
      'Faz e lê os exames de imagem, como radiografias, ecografias, TACs e ressonâncias, e diz aos outros médicos o que mostram. Trabalha nos serviços de imagiologia dos hospitais e em clínicas de diagnóstico.',
    dayToDay: [
      'Ler radiografias, TACs e ressonâncias e escrever o relatório',
      'Fazer ecografias',
      'Discutir os exames com os médicos que os pediram',
      'Guiar biópsias e drenagens com a imagem',
      'Cuidar da protecção contra as radiações',
    ],
    workContext: [
      { label: 'Ambiente', value: 'Serviço de imagiologia, com menos contacto directo com doentes' },
      { label: 'Horário', value: 'Horário fixo e turnos de urgência' },
      { label: 'Equipa', value: 'Técnicos de radiologia e outros médicos' },
      { label: 'Tecnologia', value: 'Muito trabalho com equipamentos e computador' },
    ],
    workStyles: [
      'Atenção ao detalhe',
      'Concentração longa',
      'Raciocínio visual',
      'Gosto por tecnologia',
      'Escrever com clareza',
    ],
    skills: [
      { id: 'radiologia-convencional', name: 'Radiologia convencional', importance: 'essencial' },
      { id: 'ecografia', name: 'Ecografia', importance: 'essencial' },
      { id: 'tac-rm', name: 'TAC e ressonância magnética', importance: 'essencial' },
      { id: 'proteccao-radiologica', name: 'Protecção contra radiações', importance: 'essencial' },
    ],
  }),
  specialistGuide({
    slug: 'medico-anestesista',
    speciality: 'Anestesiologia e Reanimação',
    years: 4,
    residents: 106,
    description:
      'Adormece os doentes e alivia a dor nas cirurgias, vigiando a respiração e o coração do princípio ao fim. Trabalha nos blocos operatórios, nas salas de partos e na reanimação dos hospitais.',
    dayToDay: [
      'Avaliar o doente antes da cirurgia',
      'Fazer anestesias gerais e anestesias da coluna, como nas cesarianas',
      'Vigiar a respiração, a tensão e o coração durante a operação',
      'Tratar a dor depois da cirurgia',
      'Reanimar doentes graves na urgência',
    ],
    workContext: [
      { label: 'Ambiente', value: 'Bloco operatório, sala de partos e recobro' },
      { label: 'Horário', value: 'Cirurgias programadas e urgências por turnos' },
      { label: 'Equipa', value: 'Cirurgiões, obstetras e enfermeiros de anestesia' },
      { label: 'Ritmo', value: 'Atenção constante durante horas' },
    ],
    workStyles: [
      'Calma sob pressão',
      'Atenção constante',
      'Destreza manual',
      'Decisão rápida',
      'Trabalhar em equipa',
    ],
    skills: [
      { id: 'anestesia-geral', name: 'Anestesia geral', importance: 'essencial' },
      { id: 'anestesia-regional', name: 'Anestesia regional e da coluna', importance: 'essencial' },
      { id: 'via-aerea', name: 'Via aérea e entubação', importance: 'essencial' },
      { id: 'tratamento-dor', name: 'Tratamento da dor', importance: 'opcional' },
    ],
  }),
  specialistGuide({
    slug: 'medico-cardiologista',
    speciality: 'Cardiologia',
    years: 4,
    residents: 92,
    description:
      'Trata as doenças do coração e da circulação, como a hipertensão, a insuficiência cardíaca, as arritmias e as doenças das válvulas. Trabalha nas consultas e nos serviços de cardiologia dos hospitais centrais e em clínicas.',
    dayToDay: [
      'Fazer consultas a doentes com hipertensão e insuficiência cardíaca',
      'Fazer e ler electrocardiogramas e ecocardiogramas',
      'Tratar enfartes e arritmias na urgência',
      'Ajustar a medicação de doentes crónicos',
      'Preparar doentes para cirurgia cardíaca',
    ],
    workContext: [
      { label: 'Ambiente', value: 'Consultas, enfermaria e laboratório de exames' },
      { label: 'Horário', value: 'Consultas de dia e urgências' },
      { label: 'Equipa', value: 'Técnicos de cardiopneumologia, internistas e cirurgiões' },
      { label: 'Doentes', value: 'Sobretudo adultos e idosos' },
    ],
    workStyles: [
      'Raciocínio cuidadoso',
      'Gosto por tecnologia',
      'Calma nas urgências',
      'Paciência',
      'Vontade de aprender sempre',
    ],
    skills: [
      { id: 'electrocardiograma', name: 'Electrocardiograma', importance: 'essencial' },
      { id: 'ecocardiografia', name: 'Ecocardiografia', importance: 'essencial' },
      { id: 'insuficiencia-cardiaca', name: 'Hipertensão e insuficiência cardíaca', importance: 'essencial' },
      { id: 'cateterismo', name: 'Cateterismo cardíaco', importance: 'opcional' },
    ],
  }),
  specialistGuide({
    slug: 'medico-oftalmologista',
    speciality: 'Oftalmologia',
    years: 4,
    residents: 65,
    description:
      'Trata os olhos e a visão: receita óculos, trata infecções e glaucoma e opera cataratas e outras doenças. Trabalha em hospitais, centros oftalmológicos e clínicas privadas.',
    dayToDay: [
      'Examinar os olhos e medir a visão',
      'Operar cataratas',
      'Tratar o glaucoma e as infecções dos olhos',
      'Ver urgências por traumatismos nos olhos',
      'Acompanhar doentes com diabetes para proteger a visão',
    ],
    workContext: [
      { label: 'Ambiente', value: 'Consultas e bloco operatório' },
      { label: 'Horário', value: 'Sobretudo de dia, com poucas urgências' },
      { label: 'Equipa', value: 'Optometristas, enfermeiros e técnicos' },
      { label: 'Ritmo', value: 'Muitas consultas por dia' },
    ],
    workStyles: [
      'Precisão e mãos firmes',
      'Atenção ao detalhe',
      'Paciência',
      'Gosto por tecnologia',
      'Concentração',
    ],
    skills: [
      { id: 'exame-oftalmologico', name: 'Exame oftalmológico', importance: 'essencial' },
      { id: 'cirurgia-catarata', name: 'Cirurgia de catarata', importance: 'essencial' },
      { id: 'glaucoma', name: 'Glaucoma', importance: 'essencial' },
      { id: 'laser-oftalmologico', name: 'Laser oftalmológico', importance: 'opcional' },
    ],
  }),
  specialistGuide({
    slug: 'medico-psiquiatra',
    speciality: 'Psiquiatria',
    years: 3,
    residents: 14,
    description:
      'Trata as doenças mentais, como a depressão, a ansiedade, a esquizofrenia e as dependências, com conversa, medicamentos e acompanhamento. Trabalha em hospitais psiquiátricos, nos serviços de saúde mental dos hospitais gerais e em consultas.',
    dayToDay: [
      'Fazer consultas e ouvir com tempo',
      'Diagnosticar depressão, ansiedade, psicoses e dependências',
      'Receitar e ajustar medicamentos',
      'Ver urgências de crise na saúde mental',
      'Trabalhar com psicólogos, famílias e comunidades',
    ],
    workContext: [
      { label: 'Ambiente', value: 'Consultas e enfermarias de saúde mental' },
      { label: 'Horário', value: 'Sobretudo de dia, com urgências' },
      { label: 'Equipa', value: 'Psicólogos, enfermeiros e assistentes sociais' },
      { label: 'Doentes', value: 'Pessoas em sofrimento e as suas famílias' },
    ],
    workStyles: ['Saber ouvir', 'Empatia', 'Paciência', 'Calma perante crises', 'Respeito pela privacidade'],
    skills: [
      { id: 'entrevista-psiquiatrica', name: 'Entrevista psiquiátrica', importance: 'essencial' },
      { id: 'psicofarmacos', name: 'Psicofármacos', importance: 'essencial' },
      { id: 'intervencao-crise', name: 'Intervenção em crise', importance: 'essencial' },
      { id: 'psicoterapia', name: 'Psicoterapia', importance: 'opcional' },
    ],
  }),
  specialistGuide({
    slug: 'medico-neurologista',
    speciality: 'Neurologia',
    years: 4,
    residents: 38,
    description:
      'Trata as doenças do cérebro, da medula e dos nervos, como os AVC, a epilepsia, as dores de cabeça e as demências. Trabalha nos serviços de neurologia e de medicina dos hospitais centrais e em consultas.',
    dayToDay: [
      'Examinar a força, os reflexos e a sensibilidade',
      'Tratar doentes com AVC na urgência e na enfermaria',
      'Acompanhar doentes com epilepsia',
      'Ler TACs e ressonâncias do cérebro',
      'Pedir e interpretar electroencefalogramas',
    ],
    workContext: [
      { label: 'Ambiente', value: 'Consultas, enfermaria e urgências' },
      { label: 'Horário', value: 'Consultas de dia e urgências' },
      { label: 'Equipa', value: 'Internistas, neurocirurgiões e fisioterapeutas' },
      { label: 'Doentes', value: 'Sobretudo adultos e idosos' },
    ],
    workStyles: [
      'Raciocínio cuidadoso',
      'Paciência',
      'Atenção ao detalhe',
      'Explicar doenças difíceis',
      'Vontade de aprender sempre',
    ],
    skills: [
      { id: 'exame-neurologico', name: 'Exame neurológico', importance: 'essencial' },
      { id: 'avc', name: 'AVC agudo', importance: 'essencial' },
      { id: 'epilepsia', name: 'Epilepsia', importance: 'essencial' },
      { id: 'electroencefalograma', name: 'Electroencefalograma', importance: 'opcional' },
    ],
  }),
  specialistGuide({
    slug: 'medico-urologista',
    speciality: 'Urologia',
    years: 4,
    residents: 70,
    description:
      'Trata o aparelho urinário dos homens e das mulheres e o aparelho genital masculino: pedras nos rins, doenças da próstata, infecções e cancros. Faz consultas e opera, muitas vezes por endoscopia.',
    dayToDay: [
      'Fazer consultas de próstata, pedras e infecções urinárias',
      'Operar a próstata, os rins e a bexiga',
      'Fazer endoscopias das vias urinárias',
      'Ver urgências como a retenção urinária e as cólicas renais',
      'Rastrear o cancro da próstata',
    ],
    workContext: [
      { label: 'Ambiente', value: 'Consultas e bloco operatório' },
      { label: 'Horário', value: 'Cirurgias programadas e urgências' },
      { label: 'Equipa', value: 'Anestesistas, enfermeiros e técnicos' },
      { label: 'Doentes', value: 'Sobretudo homens adultos e idosos' },
    ],
    workStyles: ['Destreza manual', 'Discrição', 'Calma', 'Decisão', 'Trabalhar em equipa'],
    skills: [
      { id: 'cirurgia-urologica', name: 'Cirurgia urológica', importance: 'essencial' },
      { id: 'endoscopia-urologica', name: 'Endoscopia urológica', importance: 'essencial' },
      { id: 'doencas-prostata', name: 'Doenças da próstata', importance: 'essencial' },
      { id: 'ecografia', name: 'Ecografia', importance: 'opcional' },
    ],
  }),
  specialistGuide({
    slug: 'medico-otorrinolaringologista',
    speciality: 'Otorrinolaringologia',
    years: 4,
    residents: 59,
    description:
      'Trata o ouvido, o nariz, a garganta e o pescoço: infecções, surdez, amígdalas, sinusites e tumores. Faz consultas e cirurgias, em crianças e adultos.',
    dayToDay: [
      'Examinar ouvidos, nariz e garganta',
      'Tratar otites, sinusites e amigdalites',
      'Operar amígdalas, adenóides e ouvidos',
      'Avaliar a audição e a surdez',
      'Tirar corpos estranhos na urgência',
    ],
    workContext: [
      { label: 'Ambiente', value: 'Consultas e bloco operatório' },
      { label: 'Horário', value: 'Sobretudo de dia, com urgências' },
      { label: 'Equipa', value: 'Técnicos de audiologia, anestesistas e enfermeiros' },
      { label: 'Doentes', value: 'Crianças e adultos' },
    ],
    workStyles: [
      'Precisão e mãos firmes',
      'Atenção ao detalhe',
      'Paciência com crianças',
      'Calma',
      'Trabalhar em equipa',
    ],
    skills: [
      { id: 'exame-orl', name: 'Exame do ouvido, nariz e garganta', importance: 'essencial' },
      { id: 'cirurgia-orl', name: 'Cirurgia do ouvido, nariz e garganta', importance: 'essencial' },
      { id: 'audiologia', name: 'Avaliação da audição', importance: 'essencial' },
      { id: 'endoscopia-nasal', name: 'Endoscopia nasal', importance: 'opcional' },
    ],
  }),
  specialistGuide({
    slug: 'medico-dermatologista',
    speciality: 'Dermatologia',
    years: 4,
    residents: 42,
    description:
      'Trata a pele, o cabelo e as unhas: infecções, alergias, acne, manchas e cancros da pele. Faz consultas, pequenas cirurgias e tratamentos na clínica.',
    dayToDay: [
      'Examinar a pele e identificar as lesões',
      'Tratar micoses, eczemas, acne e alergias',
      'Tirar sinais e fazer biópsias',
      'Acompanhar as doenças da pele ligadas ao VIH e a lepra',
      'Proteger quem tem albinismo do cancro da pele',
    ],
    workContext: [
      { label: 'Ambiente', value: 'Consultas e pequena cirurgia' },
      { label: 'Horário', value: 'Sobretudo de dia, com poucas urgências' },
      { label: 'Equipa', value: 'Enfermeiros e outros especialistas' },
      { label: 'Doentes', value: 'Crianças e adultos' },
    ],
    workStyles: [
      'Olho para o detalhe',
      'Paciência',
      'Explicar tratamentos longos',
      'Destreza manual',
      'Empatia',
    ],
    skills: [
      { id: 'dermatoscopia', name: 'Dermatoscopia', importance: 'essencial' },
      { id: 'biopsia-pele', name: 'Biópsia e pequena cirurgia da pele', importance: 'essencial' },
      { id: 'dermatoses-tropicais', name: 'Doenças da pele tropicais', importance: 'essencial' },
      { id: 'dermatologia-estetica', name: 'Dermatologia estética', importance: 'opcional' },
    ],
  }),
  specialistGuide({
    slug: 'medico-saude-publica',
    speciality: 'Saúde Pública',
    years: 3,
    description:
      'Cuida da saúde de uma população inteira, não de um doente de cada vez: vigia as doenças e os surtos, organiza vacinações e campanhas e planeia os serviços de saúde. Trabalha na Direcção Nacional de Saúde Pública, nos gabinetes provinciais de saúde e nos centros de saúde; pode exercer os poderes de autoridade sanitária e dirigir um centro de saúde (Decreto Presidencial n.º 186/18, artigo 11.º).',
    dayToDay: [
      'Analisar os dados das doenças de notificação obrigatória',
      'Investigar e controlar surtos, como os de cólera e de sarampo',
      'Organizar campanhas de vacinação',
      'Inspeccionar e decidir como autoridade sanitária, quando designado',
      'Planear as actividades dos centros de saúde',
    ],
    workContext: [
      { label: 'Ambiente', value: 'Serviços de saúde pública, centros de saúde e trabalho de campo' },
      { label: 'Horário', value: 'De dia, com alertas quando há surtos' },
      { label: 'Equipa', value: 'Técnicos de saúde pública e ambiental, enfermeiros e estatísticos' },
      { label: 'Local', value: 'Muitas deslocações às comunidades' },
    ],
    workStyles: [
      'Pensar na população inteira',
      'Gosto por números',
      'Organização',
      'Falar com comunidades',
      'Calma em emergências',
    ],
    skills: [
      { id: 'epidemiologia', name: 'Epidemiologia e vigilância', importance: 'essencial' },
      { id: 'bioestatistica', name: 'Bioestatística', importance: 'essencial' },
      { id: 'investigacao-surtos', name: 'Investigação de surtos', importance: 'essencial' },
      { id: 'gestao-saude', name: 'Planeamento e gestão em saúde', importance: 'opcional' },
    ],
  }),
]
