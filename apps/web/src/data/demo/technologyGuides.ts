import type { Career, Demand, PathwayStep, Skill, SourceLink } from '../types'

// The technology careers' full pages (ADR 0010), from public sources:
// - the demand: the Angolan job sites between 29/10/2025 and 28/10/2026 (market/jobs.json);
// - the salaries: no State table names these careers, and the ads almost never state one: the WageIndicator 2026
//   survey for the closest occupation, in the demand note. Nothing here is a median of ours;
// - the certifications: the ones their issuers publish (Cisco, CompTIA, ISTQB, Microsoft, AWS, Google).
// What the careers' summaries used to say about salaries and demand was illustrative and is gone.

type Guide = Pick<
  Career,
  | 'description'
  | 'dayToDay'
  | 'workContext'
  | 'workStyles'
  | 'skills'
  | 'employerAsks'
  | 'pathways'
  | 'stages'
  | 'market'
  | 'cvGuide'
> & { slug: string }

const WAGE = 'https://wageindicator.org/pt-ao/trabalho-em-angola/trabalho-e-salario/'
const ADS: SourceLink = {
  label: 'Anúncios de emprego (Jobartis, AngoEmprego e outros)',
  url: 'https://www.jobartis.com',
}

export type TechSalary = NonNullable<NonNullable<Career['market']['demandNote']>['salary']>

export const wage = (page: string, occupation: string, start: string, after: string): TechSalary => ({
  text: `Nenhuma tabela pública nomeia esta profissão. O inquérito WageIndicator de 2026 dá, para ${occupation}, ${start} Kz líquidos por mês no início da carreira e ${after} Kz após 5 anos.`,
  source: { label: 'WageIndicator, Angola 2026', url: `${WAGE}${page}/` },
})

export const SALARY = {
  software: wage(
    'desenvolventes-de-software',
    'os programadores de software',
    'entre 277 837 e 879 126',
    'entre 440 058 e 1 301 278',
  ),
  systems: wage(
    'analistas-de-sistemas',
    'os analistas de sistemas',
    'entre 361 355 e 1 006 844',
    'entre 491 120 e 1 378 787',
  ),
  database: wage(
    'desenhadores-e-administradores-de-bases-de-dados',
    'os especialistas de bases de dados',
    'entre 346 595 e 894 631',
    'entre 551 958 e 1 393 847',
  ),
  admin: wage(
    'administradores-de-sistemas',
    'os administradores de sistemas',
    'entre 346 595 e 894 631',
    'entre 551 958 e 1 393 847',
  ),
  networks: wage(
    'profissionais-em-redes-de-informatica',
    'os especialistas de redes informáticas',
    'entre 346 595 e 894 631',
    'entre 551 958 e 1 393 847',
  ),
  closestData: wage(
    'profissionais-de-redes-e-bases-de-dados-e-todos-os',
    'a função mais próxima (outros especialistas de bases de dados e redes)',
    'entre 346 595 e 894 631',
    'entre 551 958 e 1 393 847',
  ),
  support: wage(
    'tecnicos-de-apoio-ao-utente-de-sistemas-de',
    'os técnicos de apoio aos utilizadores',
    'entre 188 195 e 710 760',
    'entre 254 123 e 1 128 258',
  ),
  telecomTechnician: wage(
    'tecnicos-de-engenharia-de-telecomunicacoes',
    'os técnicos de telecomunicações',
    'entre 232 680 e 671 601',
    'entre 324 168 e 1 038 410',
  ),
  telecomEngineer: wage(
    'engenheiros-de-telecomunicacoes',
    'os engenheiros de telecomunicações',
    'entre 520 265 e 1 405 789',
    'entre 831 126 e 2 200 610',
  ),
  design: wage(
    'desenhadores-graficos-e-de-multimedia',
    'os designers gráficos e de multimédia',
    'entre 91 345 e 575 249',
    'entre 169 509 e 1 075 198',
  ),
  manager: wage(
    'gerentes-de-tecnologia-de-informacao-e-comunicacao',
    'os directores de serviços de tecnologia',
    'entre 221 581 e 1 563 228',
    'entre 365 165 e 2 322 648',
  ),
  sales: wage(
    'profissionais-em-vendas-de-tecnologia-de',
    'os especialistas em vendas de tecnologias',
    'entre 249 209 e 831 420',
    'entre 385 535 e 1 337 979',
  ),
  trainer: wage(
    'instrutores-em-tecnologia-de-informacao',
    'os formadores de tecnologias da informação',
    'entre 263 233 e 869 657',
    'entre 418 092 e 1 429 876',
  ),
  marketing: wage(
    'profissionais-em-marketing-e-publicidade',
    'os especialistas em marketing e publicidade',
    'entre 249 209 e 831 420',
    'entre 385 535 e 1 337 979',
  ),
}

const demandOf = (postings: number): Demand => (postings >= 10 ? 'alta' : postings >= 3 ? 'media' : 'baixa')

export function market(
  postings: number,
  salary: TechSalary,
  hiringSectors: string[],
  area = { name: 'tecnologia', total: 186 },
): Career['market'] {
  const count =
    postings === 0
      ? 'nenhum anúncio classificado nesta profissão'
      : postings === 1
        ? 'um anúncio classificado nesta profissão'
        : `${postings} anúncios classificados nesta profissão`
  return {
    demand: demandOf(postings),
    trendPct: null,
    demandNote: {
      text: `Nos últimos 12 meses, os sites de emprego angolanos publicaram ${count}, entre os ${area.total} da área de ${area.name}. Os títulos variam muito de anúncio para anúncio, por isso este número é um mínimo.`,
      source: ADS,
      salary,
    },
    salary: null,
    salaryByStage: [],
    postingsByMonth: [],
    hiringSectors,
  }
}

const SECONDARY: PathwayStep = {
  kind: 'academico',
  level: 'ii_ciclo',
  title: 'Ensino médio concluído',
  need: 'essencial',
  description: '12.ª classe. Ciências Físicas e Biológicas ou Económicas e Jurídicas abrem mais portas.',
  months: null,
}
export const NINTH_GRADE: PathwayStep = {
  kind: 'academico',
  level: 'i_ciclo',
  title: '9.ª classe concluída',
  need: 'essencial',
  description: 'É o que pede a entrada no ensino médio técnico.',
  months: null,
}

export const degree = (title: string, description: string): PathwayStep => ({
  kind: 'academico',
  level: 'licenciatura',
  title: `Licenciatura em ${title}`,
  need: 'recomendado',
  description,
  months: { min: 48, max: 60 },
})
const technical = (title: string): PathwayStep => ({
  kind: 'academico',
  level: 'medio_tecnico',
  title: `Ensino médio técnico em ${title}`,
  need: 'essencial',
  description: 'Num instituto médio politécnico ou de telecomunicações. Termina na 13.ª classe, com estágio.',
  months: { min: 48, max: 48 },
})
export const course = (title: string, description: string, min = 3, max = 9): PathwayStep => ({
  kind: 'formacao',
  title,
  need: 'recomendado',
  selfTaught: true,
  certificate: 'opcional',
  description,
  months: { min, max },
})
export const certification = (title: string, description: string): PathwayStep => ({
  kind: 'certificacao',
  title,
  need: 'opcional',
  certificate: 'opcional',
  description,
  months: { min: 1, max: 4 },
})
const projects = (description: string): PathwayStep => ({
  kind: 'portfolio',
  title: '3 projectos publicados',
  need: 'essencial',
  description,
  months: { min: 3, max: 6 },
})
export const firstJob = (title: string, description: string): PathwayStep => ({
  kind: 'experiencia',
  title,
  need: 'recomendado',
  description,
  months: { min: 6, max: 24 },
})

const INFORMATICS = degree(
  'Engenharia Informática',
  'Ou Ciências da Computação. Dá a base de programação, algoritmos, redes e bases de dados.',
)
const INFORMATICS_MANAGEMENT = degree(
  'Informática de Gestão',
  'Ou Engenharia Informática. Junta a tecnologia à forma como uma empresa funciona.',
)
const TELECOM = degree(
  'Engenharia de Telecomunicações',
  'Ou Engenharia Electrónica e Telecomunicações. Dá a base de sinais, redes e rádio.',
)
const INTERNSHIP = firstJob(
  'Estágio profissional',
  'Muitas empresas contratam os estagiários que correm bem.',
)

export const universityRoute = (summary: string, steps: PathwayStep[]): Career['pathways'][number] => ({
  id: 'universitaria',
  name: 'Via universitária',
  summary,
  // The university route is the way in through the degree: a licenciatura or mestrado on it is required, even where
  // `degree()` says "recomendado" (that default is for the routes that have a job without it). Otherwise a career
  // whose only route is this one reads as "no degree needed" in "Sem universidade" and in the recommendations.
  steps: [
    SECONDARY,
    ...steps.map((step) =>
      step.kind === 'academico' && (step.level === 'licenciatura' || step.level === 'mestrado')
        ? { ...step, need: 'essencial' as const }
        : step,
    ),
  ],
  totalCost: null,
})
export const technicalRoute = (summary: string, steps: PathwayStep[]): Career['pathways'][number] => ({
  id: 'tecnica',
  name: 'Via técnica',
  summary,
  steps: [NINTH_GRADE, ...steps],
  totalCost: null,
})
export const selfTaughtRoute = (summary: string, steps: PathwayStep[]): Career['pathways'][number] => ({
  id: 'autodidata',
  name: 'Via autodidata',
  summary,
  steps: [{ ...SECONDARY, need: 'recomendado' }, ...steps],
  totalCost: null,
})

export function ladder(
  title: string,
  lead: string,
  duties: [string[], string[], string[], string[]],
): Career['stages'] {
  const [junior, full, senior, leader] = duties
  return [
    { level: 'junior', title: `${title} Júnior`, years: { min: 0, max: 2 }, responsibilities: junior },
    { level: 'pleno', title, years: { min: 2, max: 5 }, responsibilities: full },
    { level: 'senior', title: `${title} Sénior`, years: { min: 5, max: null }, responsibilities: senior },
    { level: 'lideranca', title: lead, years: { min: 8, max: null }, responsibilities: leader },
  ]
}

const OFFICE: Career['workContext'] = [
  { label: 'Ambiente', value: 'Escritório, híbrido ou remoto' },
  { label: 'Horário', value: 'Normal, com picos antes das entregas' },
  { label: 'Equipa', value: 'Produto, design e outros técnicos' },
  { label: 'Viagens', value: 'Raras' },
]
const OPERATIONS: Career['workContext'] = [
  { label: 'Ambiente', value: 'Escritório e salas de servidores' },
  { label: 'Horário', value: 'Normal, com turnos ou prevenção em muitas empresas' },
  { label: 'Equipa', value: 'Sistemas, redes e segurança' },
  { label: 'Pressão', value: 'Quando um sistema pára, é para já' },
]
const FIELD: Career['workContext'] = [
  { label: 'Ambiente', value: 'No terreno, em empresas, torres e centrais' },
  { label: 'Horário', value: 'Turnos e chamadas de avaria' },
  { label: 'Equipa', value: 'Técnicos e um supervisor' },
  { label: 'Viagens', value: 'Frequentes, às vezes para outras províncias' },
]
const BUSINESS: Career['workContext'] = [
  { label: 'Ambiente', value: 'Escritório, com reuniões com clientes e equipas' },
  { label: 'Horário', value: 'Normal, com picos perto dos prazos' },
  { label: 'Equipa', value: 'Tecnologia, negócio e fornecedores' },
  { label: 'Viagens', value: 'Algumas' },
]

const CV_TECHNICAL: Career['cvGuide'] = {
  template: 'classico',
  include: [
    'Links do GitHub e de projectos publicados, logo no topo',
    'Cada experiência com a função, a empresa, a duração e um resultado',
    'As ferramentas que usaste, cada uma com um exemplo',
    'As certificações, com o ano',
  ],
  avoid: [
    'Barras de nível e ícones',
    'Listas de tecnologias que nunca usaste num projecto',
    'Fotografia, a não ser que a vaga a peça',
  ],
}
const CV_BUSINESS: Career['cvGuide'] = {
  template: 'europeu',
  include: [
    'Resultados com números: o que entregaste, para quem e o que mudou',
    'Os sectores e os sistemas com que trabalhaste',
    'As certificações, com o ano',
    'As línguas, sobretudo o inglês de trabalho',
  ],
  avoid: [
    'Listas de tarefas sem resultados',
    'Jargão que quem recruta não percebe',
    'Fotografia, a não ser que a vaga a peça',
  ],
}

const SOFTWARE_SECTORS = ['Banca', 'Telecomunicações', 'Empresas de software', 'Startups']
const OPERATIONS_SECTORS = ['Banca', 'Telecomunicações', 'Petróleo e energia', 'Administração pública']
const DATA_SECTORS = ['Banca', 'Seguros', 'Telecomunicações', 'Retalho']
const TELECOM_SECTORS = [
  'Operadoras',
  'Fornecedores de internet',
  'Televisão por cabo',
  'Empresas instaladoras',
]

export const skill = (id: string, name: string, importance: Skill['importance'] = 'essencial'): Skill => ({
  id,
  name,
  importance,
})

const programmingRoutes = (focus: string, project: string): Career['pathways'] => [
  universityRoute('A mais pedida pelas empresas grandes. Mais longa e mais cara.', [
    INFORMATICS,
    projects(project),
    INTERNSHIP,
  ]),
  technicalRoute('Mais rápida e mais barata: entras no mercado mais cedo.', [
    technical('Informática'),
    course(`Curso de ${focus}`, 'Num centro de formação ou com cursos online, com projectos reais.'),
    projects(project),
    firstJob(
      'Primeiro emprego júnior ou freelance',
      'Trabalhos para negócios locais contam como experiência.',
    ),
  ]),
  selfTaughtRoute('Aprendes com cursos online e muita prática. O que conta é mostrar o que sabes fazer.', [
    course(`Aprender ${focus}`, 'Com cursos gratuitos, vídeos e a documentação oficial.', 6, 12),
    projects(project),
    firstJob('Freelance ou estágio', 'Trabalhos para negócios locais e associações contam como experiência.'),
  ]),
]

const operationsRoutes = (specialist: PathwayStep, proof: PathwayStep): Career['pathways'] => [
  universityRoute('A mais pedida por bancos, operadoras e petrolíferas.', [INFORMATICS, specialist, proof]),
  technicalRoute('Entras por uma função técnica e sobes com certificações e experiência.', [
    technical('Informática'),
    firstJob('Primeiro emprego em suporte ou redes', 'É por aqui que muitos começam a ganhar experiência.'),
    specialist,
    proof,
  ]),
]

const CCNA = certification(
  'Certificação CCNA (Cisco)',
  'A certificação de redes mais conhecida: mostra que sabes configurar e resolver problemas numa rede.',
)
const SECURITY_PLUS = certification(
  'Certificação Security+ (CompTIA)',
  'Uma certificação de entrada em cibersegurança, reconhecida em todo o mundo.',
)
const A_PLUS = certification(
  'Certificação A+ (CompTIA)',
  'A certificação de entrada em suporte e hardware, reconhecida em todo o mundo.',
)
const CLOUD = certification(
  'Certificação de cloud (AWS ou Azure)',
  'As certificações de arquitectura e administração dos grandes fornecedores de cloud.',
)
const POWER_BI = certification(
  'Certificação PL-300 (Microsoft)',
  'A certificação da Microsoft para analistas de dados que usam o Power BI.',
)
const ISTQB = certification(
  'Certificação ISTQB Foundation',
  'A certificação internacional de entrada para quem faz testes de software.',
)
const GOOGLE_ADS = certification(
  'Certificações do Google Ads e da Meta',
  'Gratuitas ou baratas, mostram que sabes gerir campanhas.',
)
const PMP = certification(
  'Certificação CAPM ou PMP (PMI)',
  'As certificações de gestão de projectos do PMI, com uma comunidade própria em Angola (PMI Angola Chapter).',
)
const SCRUM = certification(
  'Certificação de Product Owner ou Scrum',
  'Mostra que conheces os métodos ágeis com que se fazem produtos digitais.',
)

export const TECH_GUIDES: Guide[] = [
  {
    slug: 'desenvolvedor-backend',
    description:
      'Programa a parte que ninguém vê: os servidores, as regras do negócio, as bases de dados e as APIs que dão dados às apps e aos sites. Quando uma transferência bancária ou um carregamento funciona, há código backend por trás. Em Angola trabalha em bancos, operadoras e empresas de software.',
    dayToDay: [
      'Escrever APIs e regras de negócio',
      'Desenhar tabelas e consultas de bases de dados',
      'Proteger os dados e as contas das pessoas',
      'Escrever testes automáticos e rever o código dos colegas',
      'Investigar erros em produção',
    ],
    workContext: OFFICE,
    workStyles: [
      'Raciocínio lógico',
      'Rigor',
      'Persistência',
      'Vontade de aprender sempre',
      'Trabalhar em equipa',
    ],
    skills: [
      skill('programacao-backend', 'Uma linguagem de servidor (PHP, Java, C#, Python ou Node.js)'),
      skill('sql', 'SQL'),
      skill('apis-rest', 'Criar APIs REST'),
      skill('git', 'Git'),
      skill('seguranca-web', 'Segurança de aplicações web'),
      skill('docker', 'Docker', 'opcional'),
      skill('testes-automaticos', 'Testes automáticos', 'opcional'),
    ],
    employerAsks: null,
    pathways: programmingRoutes(
      'programação de servidores',
      'Uma API com autenticação, uma app com base de dados e um contributo num projecto de equipa.',
    ),
    stages: ladder('Desenvolvedor Backend', 'Líder Técnico', [
      ['Corrige erros', 'Faz pequenas funcionalidades com revisão'],
      ['Constrói funcionalidades inteiras', 'Ajuda os júniores'],
      ['Desenha a arquitectura dos serviços', 'Responde pela segurança e pelo desempenho'],
      ['Orienta a equipa', 'Escolhe as tecnologias com o negócio'],
    ]),
    market: market(1, SALARY.software, SOFTWARE_SECTORS),
    cvGuide: CV_TECHNICAL,
  },
  {
    slug: 'desenvolvedor-full-stack',
    description:
      'Faz o produto inteiro: os ecrãs que as pessoas usam e o servidor por trás deles. É muito procurado em empresas pequenas e startups, onde poucas pessoas fazem tudo. Nos anúncios angolanos aparece em empresas de software e consultoras.',
    dayToDay: [
      'Construir ecrãs e ligá-los à API',
      'Programar as regras e a base de dados',
      'Publicar novas versões do produto',
      'Falar com quem usa o produto para perceber o que falta',
      'Corrigir erros em qualquer parte do sistema',
    ],
    workContext: OFFICE,
    workStyles: [
      'Autonomia',
      'Curiosidade',
      'Resolver problemas',
      'Organização',
      'Explicar a quem não é técnico',
    ],
    skills: [
      skill('javascript', 'JavaScript'),
      skill('react', 'React ou outro framework de frontend'),
      skill('programacao-backend', 'Uma linguagem de servidor (PHP, Node.js, Java ou Python)'),
      skill('sql', 'SQL'),
      skill('git', 'Git'),
      skill('docker', 'Docker', 'opcional'),
      skill('cloud', 'Publicar em cloud', 'opcional'),
    ],
    employerAsks: null,
    pathways: programmingRoutes(
      'desenvolvimento web completo',
      'Um produto completo, com ecrãs, servidor e base de dados, publicado e com o código no GitHub.',
    ),
    stages: ladder('Desenvolvedor Full-stack', 'Líder Técnico', [
      ['Faz funcionalidades simples com ajuda', 'Corrige erros'],
      ['Entrega funcionalidades de ponta a ponta', 'Publica novas versões'],
      ['Desenha a arquitectura do produto', 'Orienta os mais novos'],
      ['Lidera a equipa técnica', 'Decide o que construir com o negócio'],
    ]),
    market: market(4, SALARY.software, SOFTWARE_SECTORS),
    cvGuide: CV_TECHNICAL,
  },
  {
    slug: 'desenvolvedor-mobile',
    description:
      'Cria as apps do telemóvel, como as dos bancos e das operadoras, para Android e iPhone. Tem de pensar em quem tem um telemóvel simples, pouca bateria e dados móveis caros. Em Angola, o Android é quase sempre a prioridade.',
    dayToDay: [
      'Construir ecrãs e navegação da app',
      'Ligar a app à API',
      'Fazer a app funcionar com pouca internet',
      'Testar em vários telemóveis',
      'Publicar na Google Play e na App Store',
    ],
    workContext: OFFICE,
    workStyles: [
      'Atenção ao detalhe',
      'Paciência',
      'Sentido estético',
      'Vontade de aprender',
      'Trabalhar em equipa',
    ],
    skills: [
      skill('flutter-react-native', 'Flutter ou React Native'),
      skill('android-kotlin', 'Android com Kotlin', 'opcional'),
      skill('ios-swift', 'iOS com Swift', 'opcional'),
      skill('apis-rest', 'Consumir APIs REST'),
      skill('git', 'Git'),
      skill('publicar-apps', 'Publicar nas lojas de apps'),
    ],
    employerAsks: null,
    pathways: programmingRoutes(
      'desenvolvimento de apps',
      'Três apps a funcionar, de preferência publicadas na Google Play.',
    ),
    stages: ladder('Desenvolvedor Mobile', 'Líder Técnico', [
      ['Faz ecrãs simples', 'Corrige erros com revisão'],
      ['Constrói funcionalidades inteiras', 'Publica versões'],
      ['Define a arquitectura da app', 'Responde pelo desempenho'],
      ['Orienta a equipa', 'Decide a tecnologia com o produto'],
    ]),
    market: market(2, SALARY.software, SOFTWARE_SECTORS),
    cvGuide: CV_TECHNICAL,
  },
  {
    slug: 'engenheiro-de-qa',
    description:
      'Garante que um produto funciona antes de chegar às pessoas: procura erros, escreve casos de teste e automatiza-os. Pensa no que pode correr mal. Em Angola a função ainda é pouco comum e existe sobretudo em banca e em empresas de software.',
    dayToDay: [
      'Ler o que uma funcionalidade deve fazer e escrever casos de teste',
      'Testar à mão os caminhos mais importantes',
      'Automatizar testes',
      'Registar erros de forma clara para quem programa',
      'Confirmar que os erros ficaram resolvidos',
    ],
    workContext: OFFICE,
    workStyles: ['Atenção ao detalhe', 'Espírito crítico', 'Organização', 'Comunicação clara', 'Paciência'],
    skills: [
      skill('casos-teste', 'Escrever casos de teste'),
      skill('registo-erros', 'Registar erros (Jira ou semelhante)'),
      skill('testes-automaticos', 'Testes automáticos (Selenium, Cypress ou Playwright)'),
      skill('testes-api', 'Testar APIs (Postman)'),
      skill('sql', 'SQL básico'),
      skill('testes-carga', 'Testes de carga', 'opcional'),
    ],
    employerAsks: null,
    pathways: [
      universityRoute('A forma mais comum de entrar em bancos e empresas de software.', [
        INFORMATICS,
        ISTQB,
        INTERNSHIP,
      ]),
      technicalRoute('Começas a testar à mão e aprendes a automatizar.', [
        technical('Informática'),
        course('Curso de testes de software', 'Com cursos online e prática em projectos abertos.'),
        ISTQB,
        firstJob('Primeiro emprego como analista de testes', 'Testar à mão é a porta de entrada.'),
      ]),
    ],
    stages: ladder('Engenheiro de QA', 'Responsável de Qualidade', [
      ['Executa testes à mão', 'Regista erros'],
      ['Desenha os testes de uma funcionalidade', 'Automatiza os principais'],
      ['Define a estratégia de testes', 'Orienta a equipa'],
      ['Responde pela qualidade dos produtos', 'Define os processos'],
    ]),
    market: market(0, SALARY.software, SOFTWARE_SECTORS),
    cvGuide: CV_TECHNICAL,
  },
  {
    slug: 'analista-de-bi',
    description:
      'Constrói os painéis e relatórios que os gestores abrem todos os dias para ver como vai o negócio: vendas, clientes, custos. Junta dados de vários sistemas num só lugar e garante que os números batem certo. Em Angola aparece na banca, nos seguros, nas telecomunicações e no retalho.',
    dayToDay: [
      'Falar com as equipas para perceber o que querem medir',
      'Escrever consultas em SQL',
      'Construir painéis no Power BI',
      'Verificar se os números batem certo',
      'Ensinar as equipas a usar os painéis',
    ],
    workContext: BUSINESS,
    workStyles: ['Rigor com os números', 'Comunicação', 'Curiosidade', 'Organização', 'Sentido do negócio'],
    skills: [
      skill('sql', 'SQL'),
      skill('power-bi', 'Power BI ou Tableau'),
      skill('excel', 'Excel avançado'),
      skill('modelacao-dados', 'Modelação de dados'),
      skill('visualizacao', 'Visualização de dados'),
      skill('python', 'Python', 'opcional'),
    ],
    employerAsks: null,
    pathways: [
      universityRoute('A forma mais comum de entrar em bancos, seguradoras e operadoras.', [
        INFORMATICS_MANAGEMENT,
        course('SQL e Power BI', 'Com cursos online e dados públicos (INE, BNA).'),
        POWER_BI,
        INTERNSHIP,
      ]),
      selfTaughtRoute('Vem de outra área? O Excel e o SQL abrem a porta.', [
        course('Excel, SQL e Power BI', 'Com cursos online e muita prática.', 6, 12),
        projects('Três painéis com dados públicos angolanos, publicados.'),
        POWER_BI,
      ]),
    ],
    stages: ladder('Analista de BI', 'Responsável de BI', [
      ['Actualiza relatórios', 'Corrige painéis com ajuda'],
      ['Constrói painéis completos', 'Fala com as equipas de negócio'],
      ['Desenha o modelo de dados', 'Orienta os analistas'],
      ['Define o que a empresa mede', 'Responde pela qualidade dos dados'],
    ]),
    market: market(1, SALARY.closestData, DATA_SECTORS),
    cvGuide: CV_BUSINESS,
  },
  {
    slug: 'cientista-de-dados',
    description:
      'Usa estatística e programação para prever o que vai acontecer: que cliente vai deixar de pagar, que produto vai faltar, onde há fraude. Treina modelos e explica se podem ser confiados. Em Angola a função é rara e surge sobretudo em banca, telecomunicações e petróleo.',
    dayToDay: [
      'Perceber que pergunta do negócio vale a pena responder',
      'Limpar e explorar os dados',
      'Treinar e comparar modelos',
      'Medir se o modelo funciona de verdade',
      'Explicar os resultados a quem decide',
    ],
    workContext: BUSINESS,
    workStyles: [
      'Pensamento crítico',
      'Curiosidade',
      'Rigor',
      'Paciência',
      'Explicar coisas difíceis com simplicidade',
    ],
    skills: [
      skill('python', 'Python'),
      skill('estatistica', 'Estatística'),
      skill('machine-learning', 'Aprendizagem automática'),
      skill('sql', 'SQL'),
      skill('visualizacao', 'Visualização de dados'),
      skill('cloud', 'Cloud', 'opcional'),
    ],
    employerAsks: null,
    pathways: [
      universityRoute('É a via habitual: a função pede muita matemática.', [
        degree(
          'Ciências da Computação',
          'Ou Estatística, Matemática ou Engenharia Informática. O que conta é a base de matemática e programação.',
        ),
        course('Python e aprendizagem automática', 'Com cursos online e competições de dados.', 6, 12),
        projects('Três análises completas, com o código e as conclusões publicadas.'),
        INTERNSHIP,
      ]),
    ],
    stages: ladder('Cientista de Dados', 'Responsável de Ciência de Dados', [
      ['Explora dados', 'Treina modelos simples com ajuda'],
      ['Conduz um projecto de ponta a ponta', 'Mede o resultado no negócio'],
      ['Escolhe os métodos', 'Orienta os mais novos'],
      ['Decide onde a empresa usa modelos', 'Responde pelo seu uso responsável'],
    ]),
    market: market(0, SALARY.closestData, DATA_SECTORS),
    cvGuide: CV_TECHNICAL,
  },
  {
    slug: 'engenheiro-de-dados',
    description:
      'Constrói os canais por onde os dados passam: recolhe-os dos sistemas da empresa, limpa-os e guarda-os para analistas e cientistas os usarem. Sem este trabalho, os relatórios ficam errados ou atrasados. Existe em empresas com muitos dados, como bancos e operadoras.',
    dayToDay: [
      'Construir processos que copiam e transformam dados',
      'Manter o armazém de dados',
      'Vigiar se os processos correram bem',
      'Optimizar consultas lentas',
      'Ajudar os analistas a encontrar os dados',
    ],
    workContext: OPERATIONS,
    workStyles: ['Rigor', 'Raciocínio lógico', 'Organização', 'Persistência', 'Trabalhar em equipa'],
    skills: [
      skill('sql', 'SQL avançado'),
      skill('python', 'Python'),
      skill('etl', 'Processos de dados (ETL)'),
      skill('armazem-dados', 'Armazéns de dados'),
      skill('cloud', 'Cloud', 'opcional'),
      skill('spark', 'Spark', 'opcional'),
    ],
    employerAsks: null,
    pathways: [
      universityRoute('A forma mais comum de chegar a esta função.', [
        INFORMATICS,
        firstJob('Experiência em bases de dados ou desenvolvimento', 'Quase ninguém começa logo aqui.'),
        CLOUD,
      ]),
    ],
    stages: ladder('Engenheiro de Dados', 'Responsável de Plataforma de Dados', [
      ['Mantém processos existentes', 'Corrige falhas'],
      ['Constrói novos processos', 'Melhora o desempenho'],
      ['Desenha a plataforma', 'Orienta a equipa'],
      ['Define a estratégia de dados', 'Responde pelos custos e pela segurança'],
    ]),
    market: market(0, SALARY.closestData, DATA_SECTORS),
    cvGuide: CV_TECHNICAL,
  },
  {
    slug: 'administrador-de-base-de-dados',
    description:
      'Cuida das bases de dados de uma empresa: mantém-nas rápidas, seguras e com cópias que funcionam. Se perder os dados de um banco, o banco pára. Nos anúncios angolanos aparece como DBA, muitas vezes com Oracle ou SQL Server.',
    dayToDay: [
      'Vigiar o desempenho das bases de dados',
      'Fazer e testar cópias de segurança',
      'Gerir quem tem acesso a quê',
      'Instalar actualizações',
      'Optimizar consultas lentas',
    ],
    workContext: OPERATIONS,
    workStyles: ['Rigor', 'Calma sob pressão', 'Responsabilidade', 'Organização', 'Discrição'],
    skills: [
      skill('sql', 'SQL avançado'),
      skill('oracle-sql-server', 'Oracle, SQL Server, MySQL ou PostgreSQL'),
      skill('copias-seguranca', 'Cópias de segurança e recuperação'),
      skill('optimizacao', 'Optimização de consultas'),
      skill('linux', 'Linux', 'opcional'),
      skill('cloud', 'Cloud', 'opcional'),
    ],
    employerAsks: null,
    pathways: operationsRoutes(
      course('Administração de bases de dados', 'Oracle, SQL Server ou PostgreSQL, com prática.'),
      certification(
        'Certificação Oracle ou Microsoft',
        'As certificações de quem faz os sistemas de base de dados mais usados nas empresas.',
      ),
    ),
    stages: ladder('Administrador de Base de Dados', 'Responsável de Dados', [
      ['Vigia e faz cópias', 'Executa tarefas com supervisão'],
      ['Gere bases de dados em produção', 'Resolve problemas de desempenho'],
      ['Desenha a recuperação em caso de desastre', 'Orienta a equipa'],
      ['Define as regras dos dados', 'Responde pela sua segurança'],
    ]),
    market: market(6, SALARY.database, OPERATIONS_SECTORS),
    cvGuide: CV_TECHNICAL,
  },
  {
    slug: 'administrador-de-sistemas',
    description:
      'Mantém os servidores e os sistemas de uma empresa a funcionar: contas, email, cópias, actualizações. Quando tudo corre bem, ninguém repara; quando falha, é quem resolve. Trabalha em bancos, operadoras, petrolíferas e no Estado.',
    dayToDay: [
      'Instalar e configurar servidores',
      'Gerir utilizadores e permissões',
      'Vigiar o estado dos sistemas',
      'Fazer cópias de segurança',
      'Resolver avarias',
    ],
    workContext: OPERATIONS,
    workStyles: ['Responsabilidade', 'Calma sob pressão', 'Organização', 'Raciocínio lógico', 'Discrição'],
    skills: [
      skill('linux', 'Linux'),
      skill('windows-server', 'Windows Server'),
      skill('redes', 'Redes'),
      skill('virtualizacao', 'Virtualização'),
      skill('scripts', 'Scripts (Bash ou PowerShell)'),
      skill('cloud', 'Cloud', 'opcional'),
    ],
    employerAsks: null,
    pathways: operationsRoutes(
      course('Administração de Linux e Windows Server', 'Com cursos online e um laboratório em casa.'),
      CLOUD,
    ),
    stages: ladder('Administrador de Sistemas', 'Responsável de Infra-estrutura', [
      ['Faz tarefas de rotina', 'Atende pedidos'],
      ['Gere servidores em produção', 'Resolve avarias'],
      ['Desenha a infra-estrutura', 'Orienta a equipa'],
      ['Define a estratégia e o orçamento', 'Responde pela disponibilidade'],
    ]),
    market: market(1, SALARY.admin, OPERATIONS_SECTORS),
    cvGuide: CV_TECHNICAL,
  },
  {
    slug: 'administrador-de-redes',
    description:
      'Liga os computadores, escritórios e agências de uma empresa à rede e à internet, e mantém tudo seguro. Configura routers, switches, firewalls e Wi-Fi. É das profissões de tecnologia com mais anúncios em Angola.',
    dayToDay: [
      'Configurar routers, switches e firewalls',
      'Vigiar o estado da rede',
      'Resolver quebras de ligação',
      'Ligar novas agências e escritórios',
      'Documentar a rede',
    ],
    workContext: OPERATIONS,
    workStyles: [
      'Raciocínio lógico',
      'Calma sob pressão',
      'Organização',
      'Persistência',
      'Trabalhar em equipa',
    ],
    skills: [
      skill('redes-tcp-ip', 'Redes TCP/IP'),
      skill('routing-switching', 'Routing e switching'),
      skill('firewalls', 'Firewalls'),
      skill('wifi', 'Wi-Fi'),
      skill('vpn', 'VPN'),
      skill('linux', 'Linux', 'opcional'),
    ],
    employerAsks: null,
    pathways: [
      universityRoute('A mais pedida por operadoras e bancos.', [
        degree(
          'Engenharia de Redes e Telecomunicações',
          'Ou Engenharia Informática ou Redes e Administração de Sistemas.',
        ),
        CCNA,
        INTERNSHIP,
      ]),
      technicalRoute('Entras como técnico e sobes com o CCNA e a experiência.', [
        technical('Informática ou Telecomunicações'),
        course('Curso de redes', 'Num centro de formação ou na Cisco Networking Academy.'),
        CCNA,
        firstJob(
          'Primeiro emprego em redes ou suporte',
          'A prática com equipamento real é o que mais conta.',
        ),
      ]),
    ],
    stages: ladder('Administrador de Redes', 'Responsável de Redes', [
      ['Faz ligações simples', 'Vigia alarmes'],
      ['Gere a rede de uma empresa', 'Resolve avarias'],
      ['Desenha redes novas', 'Orienta a equipa'],
      ['Define a estratégia e os fornecedores', 'Responde pela disponibilidade'],
    ]),
    market: market(12, SALARY.networks, OPERATIONS_SECTORS),
    cvGuide: CV_TECHNICAL,
  },
  {
    slug: 'engenheiro-devops',
    description:
      'Faz com que o software passe do computador do programador para os utilizadores de forma rápida e segura. Automatiza testes e publicações e gere a infra-estrutura na cloud. Quase ninguém começa aqui: vem-se do desenvolvimento ou da administração de sistemas.',
    dayToDay: [
      'Automatizar a publicação do software',
      'Gerir servidores e serviços na cloud',
      'Vigiar o desempenho e as falhas',
      'Escrever infra-estrutura como código',
      'Ajudar os programadores a publicar com segurança',
    ],
    workContext: OPERATIONS,
    workStyles: [
      'Automatizar o que se repete',
      'Raciocínio lógico',
      'Responsabilidade',
      'Curiosidade',
      'Comunicação',
    ],
    skills: [
      skill('linux', 'Linux'),
      skill('docker', 'Docker'),
      skill('ci-cd', 'Integração contínua (CI/CD)'),
      skill('cloud', 'Cloud (AWS ou Azure)'),
      skill('scripts', 'Scripts'),
      skill('kubernetes', 'Kubernetes', 'opcional'),
      skill('terraform', 'Terraform', 'opcional'),
    ],
    employerAsks: null,
    pathways: [
      universityRoute('A via mais comum, depois de alguns anos noutra função técnica.', [
        INFORMATICS,
        firstJob('Experiência em desenvolvimento ou sistemas', 'É a base desta função.'),
        CLOUD,
      ]),
    ],
    stages: ladder('Engenheiro DevOps', 'Responsável de Plataforma', [
      ['Mantém automatizações existentes', 'Aprende a cloud da empresa'],
      ['Automatiza publicações', 'Responde a incidentes'],
      ['Desenha a plataforma', 'Orienta as equipas'],
      ['Define a estratégia de plataforma', 'Controla os custos da cloud'],
    ]),
    market: market(2, SALARY.closestData, SOFTWARE_SECTORS),
    cvGuide: CV_TECHNICAL,
  },
  {
    slug: 'tecnico-de-suporte',
    description:
      'Ajuda as pessoas de uma empresa quando o computador, o email ou um programa não funciona, ao vivo, por telefone ou à distância. É a profissão de tecnologia com mais anúncios em Angola e uma das melhores portas de entrada.',
    dayToDay: [
      'Atender pedidos de ajuda',
      'Instalar e configurar computadores e programas',
      'Resolver problemas de impressoras, email e rede',
      'Registar cada pedido',
      'Explicar às pessoas como evitar o problema',
    ],
    workContext: [
      { label: 'Ambiente', value: 'Escritório, com deslocações aos colegas e às agências' },
      { label: 'Horário', value: 'Normal, às vezes por turnos' },
      { label: 'Equipa', value: 'Outros técnicos e um supervisor' },
      { label: 'Contacto', value: 'Fala com pessoas todo o dia' },
    ],
    workStyles: ['Paciência', 'Simpatia', 'Resolver problemas', 'Organização', 'Explicar com simplicidade'],
    skills: [
      skill('windows', 'Windows e Office'),
      skill('hardware-basico', 'Hardware básico'),
      skill('redes-basicas', 'Redes básicas'),
      skill('atendimento', 'Atendimento às pessoas'),
      skill('active-directory', 'Active Directory', 'opcional'),
      skill('ingles-tecnico', 'Inglês técnico', 'opcional'),
    ],
    employerAsks: null,
    pathways: [
      technicalRoute('O caminho mais directo: muitos anúncios pedem o ensino médio técnico.', [
        technical('Informática'),
        A_PLUS,
        firstJob('Primeiro emprego em suporte', 'Depois podes crescer para redes, sistemas ou segurança.'),
      ]),
      selfTaughtRoute('Um curso curto e a prática também abrem a porta.', [
        course('Curso de informática e manutenção', 'Num centro de formação reconhecido pelo INEFOP.'),
        A_PLUS,
        firstJob('Primeiro emprego ou estágio', 'A experiência em atendimento também conta.'),
      ]),
    ],
    stages: ladder('Técnico de Suporte', 'Responsável de Suporte', [
      ['Atende pedidos simples', 'Instala computadores'],
      ['Resolve casos difíceis', 'Ajuda os colegas'],
      ['Trata do que os outros não resolvem', 'Escreve procedimentos'],
      ['Gere a equipa', 'Responde pelos tempos de resposta'],
    ]),
    market: market(25, SALARY.support, [
      'Banca',
      'Telecomunicações',
      'Empresas de serviços',
      'Administração pública',
    ]),
    cvGuide: CV_TECHNICAL,
  },
  {
    slug: 'tecnico-de-hardware',
    description:
      'Monta, repara e mantém computadores, impressoras e outros equipamentos. Trabalha em lojas e oficinas, em empresas de manutenção e nas equipas de informática de empresas grandes, ou por conta própria, com clientes que confiam nele.',
    dayToDay: [
      'Diagnosticar avarias',
      'Trocar peças e montar computadores',
      'Instalar sistemas e recuperar dados',
      'Manter impressoras e outros equipamentos',
      'Explicar ao cliente o que aconteceu',
    ],
    workContext: [
      { label: 'Ambiente', value: 'Oficina, loja ou nas empresas dos clientes' },
      { label: 'Horário', value: 'Normal' },
      { label: 'Equipa', value: 'Pequena, ou por conta própria' },
      { label: 'Viagens', value: 'Deslocações aos clientes' },
    ],
    workStyles: [
      'Trabalhar com as mãos',
      'Paciência',
      'Honestidade',
      'Atenção ao detalhe',
      'Resolver problemas',
    ],
    skills: [
      skill('montagem-pc', 'Montagem e reparação de computadores'),
      skill('diagnostico-avarias', 'Diagnóstico de avarias'),
      skill('sistemas-operativos', 'Instalar sistemas operativos'),
      skill('impressoras', 'Impressoras', 'opcional'),
      skill('electronica-basica', 'Electrónica básica', 'opcional'),
    ],
    employerAsks: null,
    pathways: [
      technicalRoute('A via mais completa, com base de electrónica e informática.', [
        technical('Informática'),
        A_PLUS,
        firstJob('Primeiro emprego numa oficina ou empresa', 'A prática é o que mais ensina.'),
      ]),
      selfTaughtRoute('Um curso prático chega para começar e até para trabalhar por conta própria.', [
        course(
          'Curso de manutenção de computadores',
          'Num centro de formação reconhecido pelo INEFOP.',
          3,
          6,
        ),
        firstJob('Oficina ou clientes próprios', 'Quem repara bem ganha clientes pelo boca-a-boca.'),
      ]),
    ],
    stages: ladder('Técnico de Hardware', 'Responsável de Oficina ou dono de negócio', [
      ['Limpa e monta computadores', 'Aprende com um técnico'],
      ['Diagnostica e repara sozinho', 'Atende clientes'],
      ['Trata das avarias difíceis', 'Ensina os mais novos'],
      ['Gere a oficina', 'Responde pelos clientes e pelas contas'],
    ]),
    market: market(7, SALARY.support, ['Lojas e oficinas', 'Empresas de serviços', 'Banca', 'Conta própria']),
    cvGuide: CV_TECHNICAL,
  },
  {
    slug: 'analista-de-ciberseguranca',
    description:
      'Protege os sistemas e os dados de uma empresa contra ataques: vigia alertas, procura falhas e responde a incidentes. É uma função crítica na banca e nas operadoras. Quase sempre chega-se a ela depois de experiência em redes ou sistemas.',
    dayToDay: [
      'Vigiar alertas de segurança',
      'Investigar actividade suspeita',
      'Procurar falhas nos sistemas',
      'Responder a incidentes',
      'Ensinar os colegas a evitar burlas',
    ],
    workContext: OPERATIONS,
    workStyles: ['Pensamento crítico', 'Discrição', 'Calma sob pressão', 'Curiosidade', 'Ética'],
    skills: [
      skill('redes-tcp-ip', 'Redes'),
      skill('linux', 'Linux'),
      skill('siem', 'Ferramentas de vigilância (SIEM)'),
      skill('resposta-incidentes', 'Resposta a incidentes'),
      skill('testes-intrusao', 'Testes de intrusão', 'opcional'),
      skill('iso-27001', 'ISO 27001', 'opcional'),
    ],
    employerAsks: null,
    pathways: operationsRoutes(SECURITY_PLUS, CCNA),
    stages: ladder('Analista de Cibersegurança', 'Responsável de Segurança (CISO)', [
      ['Vigia alertas', 'Escala o que é sério'],
      ['Investiga incidentes', 'Testa os sistemas'],
      ['Conduz a resposta', 'Desenha as defesas'],
      ['Define a política de segurança', 'Responde perante a administração'],
    ]),
    market: market(1, SALARY.closestData, [
      'Banca',
      'Telecomunicações',
      'Consultoras',
      'Administração pública',
    ]),
    cvGuide: CV_TECHNICAL,
  },
  {
    slug: 'tecnico-de-telecomunicacoes',
    description:
      'Instala e repara o que leva internet e telefone às pessoas: antenas, fibra óptica e equipamentos de rede. Trabalha muito no terreno, às vezes em altura e noutras províncias, para operadoras e empresas instaladoras.',
    dayToDay: [
      'Instalar fibra e antenas',
      'Reparar avarias',
      'Medir a qualidade do sinal',
      'Fazer manutenção de equipamentos',
      'Registar o trabalho feito',
    ],
    workContext: FIELD,
    workStyles: [
      'Trabalhar com as mãos',
      'Segurança em primeiro lugar',
      'Resistência física',
      'Atenção ao detalhe',
      'Trabalhar em equipa',
    ],
    skills: [
      skill('fibra-optica', 'Fibra óptica'),
      skill('antenas', 'Antenas e rádio'),
      skill('electricidade', 'Electricidade básica'),
      skill('medicoes', 'Medições de sinal'),
      skill('trabalho-altura', 'Trabalho em altura', 'opcional'),
      skill('carta-conducao', 'Carta de condução', 'opcional'),
    ],
    employerAsks: null,
    pathways: [
      technicalRoute('O caminho natural para esta profissão.', [
        technical('Electrónica e Telecomunicações'),
        course('Curso de fibra óptica', 'Muito valorizado pelas empresas instaladoras.', 1, 3),
        firstJob(
          'Primeiro emprego numa instaladora ou operadora',
          'A prática no terreno é o que mais conta.',
        ),
      ]),
    ],
    stages: ladder('Técnico de Telecomunicações', 'Supervisor de Equipa', [
      ['Ajuda em instalações', 'Aprende com a equipa'],
      ['Instala e repara sozinho', 'Faz medições'],
      ['Trata das avarias difíceis', 'Ensina os mais novos'],
      ['Coordena as equipas no terreno', 'Responde pelos prazos'],
    ]),
    market: market(2, SALARY.telecomTechnician, TELECOM_SECTORS),
    cvGuide: CV_TECHNICAL,
  },
  {
    slug: 'engenheiro-de-telecomunicacoes',
    description:
      'Desenha e melhora as redes que levam voz e internet ao país: rádio, fibra e cabos submarinos. Planeia onde pôr cada antena e como aguentar mais tráfego. Trabalha nas operadoras, nos fornecedores de internet e nas empresas de equipamentos.',
    dayToDay: [
      'Planear a cobertura e a capacidade da rede',
      'Analisar a qualidade do serviço',
      'Configurar equipamentos de núcleo',
      'Coordenar equipas e fornecedores',
      'Testar novas tecnologias',
    ],
    workContext: BUSINESS,
    workStyles: ['Raciocínio lógico', 'Rigor', 'Liderança', 'Resolver problemas', 'Inglês técnico'],
    skills: [
      skill('radio', 'Redes de rádio (4G e 5G)'),
      skill('fibra-optica', 'Transmissão e fibra óptica'),
      skill('redes-tcp-ip', 'Redes IP'),
      skill('planeamento-rede', 'Planeamento de redes'),
      skill('ingles-tecnico', 'Inglês técnico'),
    ],
    employerAsks: null,
    pathways: [
      universityRoute('A licenciatura é o caminho normal desta profissão.', [TELECOM, CCNA, INTERNSHIP]),
    ],
    stages: ladder('Engenheiro de Telecomunicações', 'Director de Rede', [
      ['Apoia projectos', 'Analisa a qualidade'],
      ['Responde por uma parte da rede', 'Coordena fornecedores'],
      ['Desenha a rede', 'Orienta os engenheiros'],
      ['Define a estratégia de rede', 'Responde pelos investimentos'],
    ]),
    market: market(0, SALARY.telecomEngineer, TELECOM_SECTORS),
    cvGuide: CV_TECHNICAL,
  },
  {
    slug: 'designer-grafico',
    description:
      'Cria o que comunica uma marca: logótipos, cartazes, publicações para redes sociais e vídeos curtos. Nos anúncios angolanos é das profissões criativas mais pedidas, em agências, empresas e por conta própria.',
    dayToDay: [
      'Falar com o cliente sobre o que quer comunicar',
      'Criar logótipos, cartazes e publicações',
      'Editar imagens e vídeos curtos',
      'Preparar ficheiros para impressão',
      'Rever o trabalho com o cliente',
    ],
    workContext: OFFICE,
    workStyles: [
      'Criatividade',
      'Sentido estético',
      'Atenção ao detalhe',
      'Ouvir o cliente',
      'Cumprir prazos',
    ],
    skills: [
      skill('photoshop', 'Photoshop'),
      skill('illustrator', 'Illustrator'),
      skill('indesign', 'InDesign', 'opcional'),
      skill('edicao-video', 'Edição de vídeo', 'opcional'),
      skill('tipografia', 'Tipografia e cor'),
      skill('canva', 'Canva', 'opcional'),
    ],
    employerAsks: null,
    pathways: [
      universityRoute('Dá base artística e abre portas nas agências maiores.', [
        degree('Design', 'Ou Artes Visuais. Dá a base de desenho, cor e composição.'),
        projects('Três trabalhos completos: uma marca, uma campanha e um cartaz.'),
        INTERNSHIP,
      ]),
      technicalRoute('Entras mais cedo, com um portfólio.', [
        technical('Informática e Multimédia'),
        projects('Três trabalhos reais, mesmo que para negócios do teu bairro.'),
        firstJob('Primeiro emprego ou freelance', 'Muitos designers começam por conta própria.'),
      ]),
      selfTaughtRoute('O portfólio vale mais do que o diploma.', [
        course('Photoshop e Illustrator', 'Com cursos online e muita prática.', 6, 12),
        projects('Três trabalhos reais, publicados no Behance ou no Instagram.'),
        firstJob('Freelance', 'Começa por negócios locais.'),
      ]),
    ],
    stages: ladder('Designer Gráfico', 'Director de Arte', [
      ['Faz adaptações', 'Prepara ficheiros'],
      ['Cria peças completas', 'Fala com os clientes'],
      ['Define o estilo de uma marca', 'Orienta os mais novos'],
      ['Dirige a criatividade', 'Responde pelas campanhas'],
    ]),
    market: market(15, SALARY.design, ['Agências', 'Comércio', 'Comunicação social', 'Conta própria']),
    cvGuide: {
      template: 'classico',
      include: [
        'O link do portfólio, logo no topo',
        'Os clientes e as marcas para quem trabalhaste',
        'As ferramentas que dominas',
        'Um CV bem arrumado: já é uma prova do teu trabalho',
      ],
      avoid: [
        'Trabalhos copiados de outros',
        'Excesso de cores e efeitos',
        'Portfólios sem explicar o teu papel',
      ],
    },
  },
  {
    slug: 'analista-de-sistemas',
    description:
      'Faz a ponte entre quem precisa de um sistema e quem o programa: percebe o que o negócio quer, escreve-o de forma clara e confirma que o resultado serve. Em Angola é muito usada para implantar sistemas de gestão, por exemplo na banca.',
    dayToDay: [
      'Reunir com as equipas para perceber o que precisam',
      'Escrever requisitos',
      'Desenhar processos',
      'Acompanhar os programadores',
      'Testar e formar quem vai usar o sistema',
    ],
    workContext: BUSINESS,
    workStyles: ['Ouvir', 'Comunicação clara', 'Raciocínio lógico', 'Organização', 'Sentido do negócio'],
    skills: [
      skill('requisitos', 'Levantamento de requisitos'),
      skill('modelacao-processos', 'Modelação de processos'),
      skill('sql', 'SQL básico'),
      skill('erp', 'Sistemas de gestão (ERP)', 'opcional'),
      skill('jira', 'Jira', 'opcional'),
    ],
    employerAsks: null,
    pathways: [
      universityRoute('A via habitual.', [
        INFORMATICS_MANAGEMENT,
        firstJob(
          'Experiência em suporte ou desenvolvimento',
          'Ajuda a perceber como os sistemas são feitos.',
        ),
      ]),
    ],
    stages: ladder('Analista de Sistemas', 'Responsável de Sistemas de Informação', [
      ['Documenta processos', 'Apoia testes'],
      ['Conduz o levantamento de um projecto', 'Forma utilizadores'],
      ['Desenha soluções', 'Orienta analistas'],
      ['Define o mapa de sistemas', 'Responde perante a administração'],
    ]),
    market: market(3, SALARY.systems, ['Banca', 'Empresas de software', 'Telecomunicações', 'Consultoras']),
    cvGuide: CV_BUSINESS,
  },
  {
    slug: 'gestor-de-projetos-de-ti',
    description:
      'Organiza pessoas, prazos e orçamentos para entregar um sistema, uma app ou uma nova rede. Fala com o cliente e com os técnicos, e tira do caminho o que atrasa a equipa. Costuma vir de uma função técnica ou de análise.',
    dayToDay: [
      'Planear o âmbito, o prazo e o orçamento',
      'Acompanhar a equipa',
      'Gerir riscos e fornecedores',
      'Fazer relatórios para o cliente',
      'Resolver o que bloqueia o projecto',
    ],
    workContext: BUSINESS,
    workStyles: ['Organização', 'Liderança', 'Comunicação clara', 'Calma sob pressão', 'Negociação'],
    skills: [
      skill('gestao-projetos', 'Gestão de projectos'),
      skill('metodos-ageis', 'Métodos ágeis'),
      skill('gestao-riscos-projecto', 'Gestão de riscos'),
      skill('gestao-fornecedores', 'Gestão de fornecedores'),
      skill('jira', 'Jira ou MS Project'),
      skill('ingles-negocios', 'Inglês de trabalho', 'opcional'),
    ],
    employerAsks: null,
    pathways: [
      universityRoute('Uma base técnica, experiência e uma certificação.', [
        INFORMATICS,
        firstJob('Experiência técnica ou de análise', 'Vários anos antes de gerir projectos.'),
        PMP,
      ]),
    ],
    stages: ladder('Gestor de Projetos de TI', 'Director de PMO', [
      ['Apoia o gestor', 'Actualiza planos'],
      ['Gere um projecto', 'Fala com o cliente'],
      ['Gere projectos grandes', 'Orienta outros gestores'],
      ['Define como se gerem projectos', 'Responde pelo portefólio'],
    ]),
    market: market(2, SALARY.manager, ['Banca', 'Telecomunicações', 'Consultoras', 'Empresas de software']),
    cvGuide: CV_BUSINESS,
  },
  {
    slug: 'product-manager',
    description:
      'Decide o que um produto digital deve fazer e porquê: fala com utilizadores, olha para os dados e escolhe o que a equipa constrói a seguir. Em Angola a função é recente e surge em bancos com apps, operadoras e startups.',
    dayToDay: [
      'Falar com utilizadores',
      'Analisar dados de uso',
      'Decidir as prioridades',
      'Escrever o que a equipa vai construir',
      'Medir se a mudança resultou',
    ],
    workContext: BUSINESS,
    workStyles: ['Empatia', 'Decidir com dados', 'Comunicação', 'Liderar sem mandar', 'Curiosidade'],
    skills: [
      skill('descoberta-produto', 'Falar com utilizadores'),
      skill('prioritizacao', 'Definir prioridades'),
      skill('analise-dados', 'Análise de dados'),
      skill('metodos-ageis', 'Métodos ágeis'),
      skill('sql', 'SQL básico', 'opcional'),
      skill('figma', 'Figma', 'opcional'),
    ],
    employerAsks: null,
    pathways: [
      universityRoute('Não há um curso próprio: vem-se da tecnologia, do design ou do negócio.', [
        INFORMATICS_MANAGEMENT,
        firstJob(
          'Experiência em análise, design ou desenvolvimento',
          'Numa equipa que faz um produto digital.',
        ),
        SCRUM,
      ]),
    ],
    stages: ladder('Product Manager', 'Director de Produto', [
      ['Apoia um produto', 'Analisa dados'],
      ['Responde por um produto', 'Decide as prioridades'],
      ['Responde por vários produtos', 'Orienta outros'],
      ['Define a estratégia de produto', 'Responde perante a administração'],
    ]),
    market: market(0, SALARY.manager, ['Banca', 'Telecomunicações', 'Startups', 'Empresas de software']),
    cvGuide: CV_BUSINESS,
  },
  {
    slug: 'gestor-de-ti',
    description:
      'Dirige a tecnologia de uma empresa: as pessoas, os sistemas, os fornecedores e o orçamento. Decide em que investir e responde quando algo falha. É um lugar a que se chega depois de muitos anos em funções técnicas.',
    dayToDay: [
      'Gerir a equipa de tecnologia',
      'Decidir investimentos',
      'Negociar com fornecedores',
      'Acompanhar a segurança e a disponibilidade',
      'Prestar contas à administração',
    ],
    workContext: BUSINESS,
    workStyles: ['Liderança', 'Visão do negócio', 'Decisão', 'Negociação', 'Comunicação'],
    skills: [
      skill('lideranca-equipas', 'Liderança de equipas'),
      skill('orcamentos', 'Gestão de orçamentos'),
      skill('gestao-fornecedores', 'Gestão de fornecedores'),
      skill('seguranca-informacao', 'Segurança da informação'),
      skill('itil', 'ITIL', 'opcional'),
    ],
    employerAsks: null,
    pathways: [
      universityRoute('Uma licenciatura técnica, muitos anos de experiência e gestão.', [
        INFORMATICS,
        firstJob('Vários anos em funções técnicas', 'E depois a liderar uma equipa.'),
        certification('Certificação ITIL', 'A referência para gerir serviços de tecnologia.'),
      ]),
    ],
    stages: ladder('Coordenador de TI', 'Director de TI (CIO)', [
      ['Coordena uma pequena equipa', 'Acompanha pedidos'],
      ['Gere uma área de tecnologia', 'Negocia com fornecedores'],
      ['Gere toda a tecnologia de uma empresa', 'Faz o orçamento'],
      ['Define a estratégia de tecnologia', 'Senta-se com a administração'],
    ]),
    market: market(1, SALARY.manager, [
      'Banca',
      'Telecomunicações',
      'Petróleo e energia',
      'Administração pública',
    ]),
    cvGuide: CV_BUSINESS,
  },
  {
    slug: 'comercial-de-ti',
    description:
      'Vende soluções de tecnologia a empresas: software, equipamentos, internet, serviços. Precisa de perceber o suficiente para falar com técnicos e de saber negociar. Trabalha para operadoras, empresas de software e revendedores.',
    dayToDay: [
      'Procurar novos clientes',
      'Perceber o que cada cliente precisa',
      'Preparar propostas',
      'Negociar preços e contratos',
      'Acompanhar os clientes depois da venda',
    ],
    workContext: BUSINESS,
    workStyles: [
      'Gostar de falar com pessoas',
      'Persistência',
      'Negociação',
      'Organização',
      'Boa apresentação',
    ],
    skills: [
      skill('vendas-b2b', 'Vendas a empresas'),
      skill('negociacao', 'Negociação'),
      skill('carteira-clientes', 'Gestão de uma carteira de clientes'),
      skill('conhecimento-tecnico', 'Conhecimento dos produtos de tecnologia'),
      skill('crm', 'CRM', 'opcional'),
    ],
    employerAsks: null,
    pathways: [
      universityRoute('Junta a gestão à tecnologia.', [
        INFORMATICS_MANAGEMENT,
        firstJob('Primeiro emprego comercial', 'Num revendedor, numa operadora ou numa empresa de software.'),
      ]),
      technicalRoute('Entras pelo suporte ou por uma loja e passas às vendas.', [
        technical('Informática'),
        firstJob('Suporte, loja ou vendas', 'Conhecer o produto é a tua vantagem.'),
      ]),
    ],
    stages: ladder('Comercial de TI', 'Director Comercial', [
      ['Procura clientes', 'Apoia propostas'],
      ['Gere uma carteira de clientes', 'Negocia contratos'],
      ['Gere grandes clientes', 'Orienta a equipa'],
      ['Define a estratégia comercial', 'Responde pelas metas'],
    ]),
    market: market(0, SALARY.sales, [
      'Operadoras',
      'Empresas de software',
      'Revendedores',
      'Fornecedores de internet',
    ]),
    cvGuide: CV_BUSINESS,
  },
  {
    slug: 'formador-de-tic',
    description:
      'Ensina tecnologia a jovens e adultos: informática básica, programação, redes ou programas de gestão. Trabalha em centros de formação, escolas e empresas de software que formam os seus clientes. Precisa de saber fazer e de saber explicar.',
    dayToDay: [
      'Preparar aulas e exercícios',
      'Dar aulas presenciais ou online',
      'Acompanhar quem tem dificuldades',
      'Avaliar os formandos',
      'Actualizar os materiais',
    ],
    workContext: [
      { label: 'Ambiente', value: 'Salas de formação e laboratórios' },
      { label: 'Horário', value: 'Muitas vezes pós-laboral e ao sábado' },
      { label: 'Equipa', value: 'Outros formadores e a coordenação' },
      { label: 'Contacto', value: 'Grupos de jovens e adultos' },
    ],
    workStyles: [
      'Paciência',
      'Explicar com simplicidade',
      'Gosto por ensinar',
      'Organização',
      'Vontade de aprender',
    ],
    skills: [
      skill('conhecimento-tic', 'A tecnologia que ensina'),
      skill('pedagogia', 'Pedagogia'),
      skill('apresentacao', 'Comunicação e apresentação'),
      skill('plataformas-ensino', 'Plataformas de ensino online', 'opcional'),
    ],
    employerAsks: null,
    pathways: [
      universityRoute('Dá a base técnica; a pedagógica pode vir do curso de ensino.', [
        degree('Ensino da Informática', 'Ou Engenharia Informática ou Informática Educativa.'),
        course('Formação de formadores', 'Num centro de formação reconhecido pelo INEFOP.', 1, 3),
      ]),
      technicalRoute('Quem já domina uma ferramenta pode ensiná-la.', [
        technical('Informática'),
        course('Formação de formadores', 'Num centro de formação reconhecido pelo INEFOP.', 1, 3),
        firstJob('Monitor num centro de formação', 'É assim que muitos começam.'),
      ]),
    ],
    stages: ladder('Formador de TIC', 'Coordenador de Formação', [
      ['Apoia aulas', 'Prepara exercícios'],
      ['Dá cursos completos', 'Avalia formandos'],
      ['Cria cursos novos', 'Forma outros formadores'],
      ['Coordena a formação', 'Responde pela qualidade'],
    ]),
    market: market(0, SALARY.trainer, [
      'Centros de formação',
      'Escolas',
      'Empresas de software',
      'Conta própria',
    ]),
    cvGuide: CV_TECHNICAL,
  },
  {
    slug: 'gestor-de-marketing-digital',
    description:
      'Faz uma marca crescer na internet: redes sociais, anúncios, site e email. Mede o que resulta e muda o que não resulta. É a profissão digital com mais anúncios em Angola, em empresas de todos os sectores e agências.',
    dayToDay: [
      'Planear campanhas',
      'Gerir anúncios no Google, Facebook e Instagram',
      'Criar conteúdos com a equipa',
      'Medir os resultados',
      'Fazer relatórios para a direcção',
    ],
    workContext: BUSINESS,
    workStyles: ['Criatividade', 'Decidir com dados', 'Comunicação', 'Curiosidade', 'Cumprir prazos'],
    skills: [
      skill('redes-sociais', 'Gestão de redes sociais'),
      skill('anuncios-online', 'Anúncios online'),
      skill('analitica-web', 'Google Analytics'),
      skill('escrita', 'Escrita'),
      skill('seo', 'SEO', 'opcional'),
      skill('canva', 'Canva', 'opcional'),
    ],
    employerAsks: null,
    pathways: [
      universityRoute('Dá a base de gestão e de marketing.', [
        degree('Gestão Comercial e Marketing', 'Ou Comunicação Social.'),
        GOOGLE_ADS,
        INTERNSHIP,
      ]),
      selfTaughtRoute('Muitos aprendem a fazer e mostram resultados.', [
        course('Marketing digital', 'Com cursos online gratuitos do Google e da Meta.', 3, 6),
        GOOGLE_ADS,
        projects('Três campanhas reais, com os resultados, mesmo que para negócios locais.'),
      ]),
    ],
    stages: ladder('Gestor de Marketing Digital', 'Director de Marketing', [
      ['Publica conteúdos', 'Faz relatórios'],
      ['Gere campanhas', 'Gere o orçamento de anúncios'],
      ['Define a estratégia digital', 'Orienta a equipa'],
      ['Dirige o marketing', 'Responde pelos resultados'],
    ]),
    market: market(15, SALARY.marketing, ['Comércio', 'Agências', 'Banca', 'Telecomunicações']),
    cvGuide: CV_BUSINESS,
  },
]
