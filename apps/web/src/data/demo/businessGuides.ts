import type { Academy, AcademyOffer, Career, PathwayStep, Skill, SourceLink } from '../types'
import { BUSINESS_CAREERS } from './businessCareers'
import {
  certification,
  course,
  degree,
  firstJob,
  ladder,
  market as marketOf,
  NINTH_GRADE,
  skill,
  type TechSalary,
  universityRoute,
  technicalRoute,
  selfTaughtRoute,
  wage,
} from './technologyGuides'

// The business careers' full pages (ADR 0010), from public sources:
// - the demand: the job titles in the Angolan job ads of the last 12 months (scrapers/data/postings.jsonl);
// - the salaries: the WageIndicator 2026 survey for the same or the closest occupation, in the demand note;
// - the rules: ARSEG's Norma Regulamentar n.º 1/25 (insurance mediators). Where a body's rules were not found, the
//   guide names the body and says to confirm with it;
// - the schools: the Ministry of Education's decrees (lex.ao) and the news of the insurance academy.

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

const market = (postings: number, salary: TechSalary, sectors: string[]) =>
  marketOf(postings, salary, sectors, { name: 'gestão, finanças e comércio', total: 903 })

const SALARY = {
  accountant: wage(
    'contabilistas',
    'os contabilistas',
    'entre 237 219 e 787 022',
    'entre 334 340 e 1 183 703',
  ),
  bookkeeper: wage(
    'profissionais-assistentes-de-contabilidade',
    'os técnicos de contabilidade',
    'entre 165 277 e 694 074',
    'entre 238 247 e 1 206 987',
  ),
  analyst: wage(
    'analistas-financeiros',
    'os analistas financeiros',
    'entre 269 709 e 911 095',
    'entre 432 230 e 1 431 533',
  ),
  credit: wage(
    'oficiais-de-credito-e-dividas',
    'os oficiais de crédito',
    'entre 177 529 e 829 026',
    'entre 264 704 e 1 428 536',
  ),
  teller: wage(
    'caixas-de-bancos-e-outros-relacionados',
    'os caixas de banco',
    'entre 183 679 e 447 713',
    'entre 250 668 e 695 056',
  ),
  collector: wage(
    'cobradores-de-dividas-e-empregados-relacionados',
    'os cobradores de dívidas',
    'entre 183 679 e 447 713',
    'entre 250 668 e 695 056',
  ),
  actuary: wage(
    'matematicos-actuarios-e-estaticistas',
    'os matemáticos, actuários e estaticistas',
    'entre 332 590 e 1 003 463',
    'entre 515 704 e 1 608 957',
  ),
  insurance: wage(
    'representantes-de-seguros',
    'os representantes de seguros',
    'entre 183 438 e 652 181',
    'entre 285 029 e 1 143 054',
  ),
  manager: wage(
    'gestores-de-servicos-comerciais-e-administracao-e',
    'os directores administrativos e de serviços',
    'entre 190 481 e 635 322',
    'entre 304 068 e 952 160',
  ),
  consultant: wage(
    'analistas-de-gestao-e-corporacao',
    'os analistas de gestão',
    'entre 224 459 e 664 821',
    'entre 371 529 e 1 063 271',
  ),
  secretary: wage(
    'secretarias-executivas-e-administrativas',
    'os secretários executivos e administrativos',
    'entre 167 419 e 530 856',
    'entre 239 049 e 809 220',
  ),
  buyer: wage('compradores', 'os compradores', 'entre 183 438 e 652 181', 'entre 285 029 e 1 143 054'),
  hrManager: wage(
    'gerentes-de-recursos-humanos',
    'os directores de recursos humanos',
    'entre 204 973 e 667 627',
    'entre 365 051 e 1 099 056',
  ),
  hr: wage(
    'profissionais-em-pessoal-e-carreiras',
    'os especialistas em recursos humanos',
    'entre 248 599 e 685 301',
    'entre 358 638 e 1 027 956',
  ),
  payroll: wage(
    'funcionarios-de-pagamentos',
    'os empregados de pagamentos',
    'entre 216 105 e 629 333',
    'entre 287 009 e 999 852',
  ),
  sales: wage(
    'representantes-de-vendas-comerciais',
    'os representantes comerciais',
    'entre 183 438 e 652 181',
    'entre 285 029 e 1 143 054',
  ),
  salesManager: wage(
    'gerentes-de-vendas-e-marketing',
    'os directores de vendas e marketing',
    'entre 269 388 e 657 337',
    'entre 455 132 e 1 007 922',
  ),
  retail: wage(
    'gerentes-de-comercio-a-retalho-e-grossista',
    'os directores do comércio a retalho e por grosso',
    'entre 217 222 e 1 220 145',
    'entre 422 679 e 1 975 764',
  ),
  economist: wage('economistas', 'os economistas', 'entre 271 001 e 1 317 401', 'entre 407 570 e 2 082 004'),
}

const SCHOOL_DECREE = 'https://lex.ao/docs/ministerio-da-educacao'

const middle = (title: string): PathwayStep => ({
  kind: 'academico',
  level: 'medio_tecnico',
  title: `Ensino médio técnico em ${title}`,
  need: 'essencial',
  description:
    'Num instituto politécnico de gestão ou de administração. Termina na 13.ª classe, com estágio.',
  months: { min: 48, max: 48 },
})

const ACCOUNTING_DEGREE = degree(
  'Contabilidade e Gestão',
  'Ou Contabilidade e Auditoria, ou Gestão Financeira.',
)
const FINANCE_DEGREE = degree('Finanças', 'Ou Contabilidade e Finanças, Economia ou Gestão Bancária.')
const MANAGEMENT_DEGREE = degree('Gestão de Empresas', 'Ou Gestão e Administração, ou Economia.')
const HR_DEGREE = degree('Gestão de Recursos Humanos', 'Ou Psicologia do Trabalho ou Gestão de Empresas.')
const MARKETING_DEGREE = degree('Gestão Comercial e Marketing', 'Ou Gestão e Marketing.')
const ECONOMICS_DEGREE = degree('Economia', 'Dá a base de microeconomia, macroeconomia e estatística.')

const OCPCA = certification(
  'Inscrição na Ordem dos Contabilistas (OCPCA)',
  'A Ordem dos Contabilistas e Peritos Contabilistas de Angola organiza a profissão. Confirma com ela o que pede hoje para te inscreveres.',
)
const ACCA = certification(
  'Qualificação ACCA',
  'Uma qualificação internacional de contabilidade e finanças, muito valorizada pelas auditoras.',
)
const CIA = certification(
  'Certificação CIA',
  'A certificação internacional de auditores internos, do Institute of Internal Auditors.',
)
const CFA = certification(
  'Certificação CFA',
  'A referência internacional em análise de investimentos, com três níveis de exames.',
)
const IFBA_COURSE = course(
  'Curso no Instituto de Formação Bancária (IFBA)',
  'A escola da banca angolana, ligada à Associação Angolana de Bancos.',
  1,
  6,
)
const MEDIATOR_COURSE: PathwayStep = {
  kind: 'certificacao',
  title: 'Curso e provas de mediador de seguros',
  need: 'essencial',
  certificate: 'exigido',
  description:
    'O curso é obrigatório e aprovado pela ARSEG, e no fim há provas perante um júri com representantes do regulador (Norma Regulamentar n.º 1/25).',
  months: { min: 2, max: 6 },
}
const INTERNSHIP = firstJob(
  'Estágio profissional',
  'Muitas empresas contratam os estagiários que correm bem.',
)

const OFFICE: Career['workContext'] = [
  { label: 'Ambiente', value: 'Escritório' },
  { label: 'Horário', value: 'Normal, com picos nos fechos de mês e de ano' },
  { label: 'Equipa', value: 'Finanças, administração e direcção' },
  { label: 'Viagens', value: 'Raras' },
]
const BRANCH: Career['workContext'] = [
  { label: 'Ambiente', value: 'Agência bancária ou escritório' },
  { label: 'Horário', value: 'O horário do banco, com metas mensais' },
  { label: 'Equipa', value: 'A agência e as áreas centrais' },
  { label: 'Contacto', value: 'Fala com clientes todo o dia' },
]
const STREET: Career['workContext'] = [
  { label: 'Ambiente', value: 'Na rua, em lojas ou nos clientes' },
  { label: 'Horário', value: 'Normal, com metas para cumprir' },
  { label: 'Equipa', value: 'Comerciais e um supervisor' },
  { label: 'Viagens', value: 'Frequentes, dentro da zona ou da província' },
]
const SHOP: Career['workContext'] = [
  { label: 'Ambiente', value: 'Loja ou supermercado' },
  { label: 'Horário', value: 'Por turnos, com fins de semana e feriados' },
  { label: 'Equipa', value: 'Operadores, repositores e fornecedores' },
  { label: 'Pressão', value: 'Picos de clientes e controlo do stock' },
]

const CV: Career['cvGuide'] = {
  template: 'europeu',
  include: [
    'Resultados com números: o que fizeste, para quem e o que mudou',
    'Os programas que usas (Excel, Primavera, SAP)',
    'As certificações, com o ano',
    'As línguas, sobretudo o inglês de trabalho',
  ],
  avoid: [
    'Listas de tarefas sem resultados',
    'Dados de clientes ou da empresa anterior',
    'Fotografia, a não ser que a vaga a peça',
  ],
}

const ANY_SECTOR = ['Comércio e distribuição', 'Indústria', 'Banca e seguros', 'Consultoras']
const FINANCE_SECTORS = ['Banca e seguros', 'Petróleo e energia', 'Indústria', 'Auditoras e consultoras']
const BANKS = ['Bancos comerciais', 'Bancos públicos', 'Microcrédito']
const INSURERS = ['Seguradoras', 'Resseguradoras', 'Mediadoras e corretoras']
const ECONOMY_SECTORS = ['Banco Nacional de Angola', 'Banca', 'Ministério das Finanças', 'Consultoras']

const EXCEL = skill('excel', 'Excel avançado')
const ACCOUNTS = skill('contabilidade-geral', 'Contabilidade geral')
const TAX = skill('fiscalidade-angola', 'Fiscalidade angolana')
const ERP = skill('erp', 'Programas de gestão (Primavera ou SAP)', 'opcional')
const ENGLISH = skill('ingles-negocios', 'Inglês de trabalho', 'opcional')
const NEGOTIATION = skill('negociacao', 'Negociação')
const COMMUNICATION = skill('comunicacao', 'Comunicação com as pessoas')
const BANKING = skill('produtos-bancarios', 'Produtos bancários')

const university = (steps: PathwayStep[]) =>
  universityRoute('A via mais pedida pelas empresas grandes.', steps)
const technical = (title: string, steps: PathwayStep[]) =>
  technicalRoute('Entras mais cedo no trabalho e podes continuar a estudar depois.', [
    middle(title),
    ...steps,
  ])
const startOnTheJob = (title: string, description: string, steps: PathwayStep[] = []) =>
  selfTaughtRoute('A experiência conta muito nesta profissão.', [firstJob(title, description), ...steps])

type Entry = Omit<Guide, 'workContext' | 'employerAsks' | 'market' | 'cvGuide' | 'workStyles'> & {
  workContext?: Career['workContext']
  workStyles: string[]
  skillList?: Skill[]
  postings: number
  salary: TechSalary
  sectors: string[]
}

const guide = ({ postings, salary, sectors, workContext = OFFICE, ...entry }: Entry): Guide => ({
  ...entry,
  workContext,
  employerAsks: null,
  market: market(postings, salary, sectors),
  cvGuide: CV,
})

export const BUSINESS_GUIDES: Guide[] = [
  guide({
    slug: 'contabilista',
    description:
      'Regista tudo o que entra e sai de uma empresa, fecha as contas e prepara os impostos, para a direcção saber como está o negócio. Quase todas as empresas precisam de um, e é das profissões de gestão com mais anúncios em Angola.',
    dayToDay: [
      'Registar facturas, pagamentos e salários',
      'Reconciliar as contas bancárias',
      'Fechar as contas do mês e do ano',
      'Preparar as declarações de impostos',
      'Explicar os números à direcção',
    ],
    workStyles: ['Rigor', 'Organização', 'Honestidade', 'Discrição', 'Cumprir prazos'],
    skills: [
      ACCOUNTS,
      TAX,
      EXCEL,
      skill('demonstracoes-financeiras', 'Demonstrações financeiras'),
      ERP,
      ENGLISH,
    ],
    pathways: [
      university([ACCOUNTING_DEGREE, INTERNSHIP, OCPCA]),
      technical('Contabilidade e Gestão', [
        firstJob('Primeiro emprego como técnico', 'Depois podes tirar a licenciatura.'),
      ]),
    ],
    stages: ladder('Contabilista', 'Director Financeiro', [
      ['Lança documentos', 'Reconcilia contas'],
      ['Fecha as contas', 'Prepara os impostos'],
      ['Responde pelas contas da empresa', 'Orienta a equipa'],
      ['Dirige as finanças', 'Fala com a administração'],
    ]),
    postings: 40,
    salary: SALARY.accountant,
    sectors: ANY_SECTOR,
  }),
  guide({
    slug: 'tecnico-de-contabilidade',
    description:
      'Faz o trabalho diário da contabilidade: lança facturas, organiza documentos e ajuda a fechar as contas. É uma das melhores portas de entrada para quem tem o curso médio, com muitos anúncios em todo o tipo de empresas.',
    dayToDay: [
      'Lançar facturas e recibos',
      'Organizar e arquivar documentos',
      'Controlar o que os clientes devem',
      'Ajudar a preparar os impostos',
      'Apoiar o contabilista no fecho do mês',
    ],
    workStyles: ['Atenção ao detalhe', 'Organização', 'Honestidade', 'Paciência', 'Trabalhar em equipa'],
    skills: [ACCOUNTS, EXCEL, skill('facturacao', 'Facturação'), TAX, ERP],
    pathways: [
      technical('Contabilidade e Gestão', [
        firstJob('Primeiro emprego', 'Muitas empresas pedem o curso médio.'),
      ]),
      university([ACCOUNTING_DEGREE, INTERNSHIP]),
    ],
    stages: ladder('Técnico de Contabilidade', 'Contabilista', [
      ['Lança documentos', 'Arquiva'],
      ['Trata de uma área das contas', 'Apoia os impostos'],
      ['Fecha as contas com o contabilista', 'Ajuda os mais novos'],
      ['Responde pela contabilidade', 'Fala com os auditores'],
    ]),
    postings: 31,
    salary: SALARY.bookkeeper,
    sectors: ANY_SECTOR,
  }),
  guide({
    slug: 'auditor',
    description:
      'Verifica de fora se as contas de uma empresa ou de um banco estão certas e dá a sua opinião. Trabalha em auditoras, como as quatro grandes com escritório em Angola, e passa por muitas empresas e sectores.',
    dayToDay: [
      'Planear a auditoria de um cliente',
      'Testar as contas e os documentos',
      'Falar com a equipa do cliente',
      'Escrever o que encontrou',
      'Apresentar as conclusões',
    ],
    workContext: [
      { label: 'Ambiente', value: 'Escritório e empresas dos clientes' },
      { label: 'Horário', value: 'Exigente na época de fecho de contas' },
      { label: 'Equipa', value: 'Equipas de auditores por cliente' },
      { label: 'Viagens', value: 'Frequentes' },
    ],
    workStyles: ['Espírito crítico', 'Independência', 'Rigor', 'Discrição', 'Comunicação'],
    skills: [
      ACCOUNTS,
      skill('normas-auditoria', 'Normas de auditoria'),
      skill('ifrs', 'Normas IFRS'),
      EXCEL,
      ENGLISH,
    ],
    pathways: [university([ACCOUNTING_DEGREE, INTERNSHIP, ACCA, OCPCA])],
    stages: ladder('Auditor', 'Partner', [
      ['Faz testes às contas', 'Prepara documentos de trabalho'],
      ['Coordena uma área do trabalho', 'Fala com o cliente'],
      ['Gere as auditorias', 'Orienta as equipas'],
      ['Responde pela opinião', 'Traz novos clientes'],
    ]),
    postings: 3,
    salary: SALARY.accountant,
    sectors: ['Auditoras', 'Banca e seguros', 'Petróleo e energia', 'Consultoras'],
  }),
  guide({
    slug: 'auditor-interno',
    description:
      'Trabalha dentro de uma empresa ou banco e verifica se as regras são cumpridas e se há riscos de erro ou fraude. Responde à administração, não às áreas que audita.',
    dayToDay: [
      'Planear as auditorias do ano',
      'Testar processos e controlos',
      'Entrevistar as equipas',
      'Escrever recomendações',
      'Confirmar que foram seguidas',
    ],
    workStyles: ['Independência', 'Espírito crítico', 'Discrição', 'Rigor', 'Comunicação'],
    skills: [
      skill('controlo-interno', 'Controlo interno'),
      skill('gestao-riscos', 'Gestão de riscos'),
      ACCOUNTS,
      EXCEL,
      ENGLISH,
    ],
    pathways: [
      university([
        ACCOUNTING_DEGREE,
        firstJob('Experiência em auditoria ou contabilidade', 'Vários anos antes.'),
        CIA,
      ]),
    ],
    stages: ladder('Auditor Interno', 'Director de Auditoria Interna', [
      ['Testa controlos', 'Apoia as auditorias'],
      ['Conduz uma auditoria', 'Escreve recomendações'],
      ['Planeia o trabalho', 'Orienta a equipa'],
      ['Responde perante a administração', 'Define o plano de auditoria'],
    ]),
    postings: 4,
    salary: SALARY.accountant,
    sectors: FINANCE_SECTORS,
  }),
  guide({
    slug: 'tecnico-de-impostos',
    description:
      'Garante que uma empresa paga os impostos certos a tempo e fala com a Administração Geral Tributária (AGT). Acompanha as regras novas, como as do IVA, e trabalha em empresas, consultoras e na própria AGT.',
    dayToDay: [
      'Calcular os impostos',
      'Preparar e entregar declarações',
      'Acompanhar as mudanças na lei',
      'Responder a inspecções',
      'Aconselhar as equipas',
    ],
    workStyles: ['Rigor', 'Actualização constante', 'Cumprir prazos', 'Discrição', 'Atenção ao detalhe'],
    skills: [TAX, ACCOUNTS, skill('iva', 'IVA'), EXCEL, ERP],
    pathways: [university([ACCOUNTING_DEGREE, INTERNSHIP])],
    stages: ladder('Técnico de Impostos', 'Responsável Fiscal', [
      ['Prepara declarações', 'Organiza documentos'],
      ['Responde pelos impostos de uma empresa', 'Trata com a AGT'],
      ['Aconselha em casos difíceis', 'Orienta a equipa'],
      ['Define a política fiscal', 'Responde perante a direcção'],
    ]),
    postings: 13,
    salary: SALARY.accountant,
    sectors: ['Consultoras', 'Administração Geral Tributária', 'Indústria', 'Comércio e distribuição'],
  }),
  guide({
    slug: 'analista-financeiro',
    description:
      'Analisa os números de uma empresa para ajudar a decidir: onde cortar, onde investir, se um projecto compensa. Prepara orçamentos, previsões e relatórios para a direcção.',
    dayToDay: [
      'Preparar orçamentos e previsões',
      'Comparar o previsto com o real',
      'Analisar custos e margens',
      'Avaliar investimentos',
      'Apresentar conclusões à direcção',
    ],
    workStyles: ['Raciocínio com números', 'Pensamento crítico', 'Organização', 'Comunicação', 'Rigor'],
    skills: [
      EXCEL,
      skill('modelos-financeiros', 'Modelos financeiros'),
      skill('orcamentos', 'Orçamentos'),
      ACCOUNTS,
      ERP,
      ENGLISH,
    ],
    pathways: [university([FINANCE_DEGREE, INTERNSHIP, ACCA])],
    stages: ladder('Analista Financeiro', 'Director Financeiro', [
      ['Prepara relatórios', 'Reúne dados'],
      ['Faz orçamentos e análises', 'Fala com as equipas'],
      ['Conduz análises de investimento', 'Orienta os analistas'],
      ['Dirige as finanças', 'Decide com a administração'],
    ]),
    postings: 4,
    salary: SALARY.analyst,
    sectors: FINANCE_SECTORS,
  }),
  guide({
    slug: 'controller-de-gestao',
    description:
      'Acompanha todos os meses se a empresa está a cumprir o orçamento, explica os desvios e ajuda os responsáveis a corrigir o rumo. É um cargo a que se chega depois de experiência em contabilidade ou finanças.',
    dayToDay: [
      'Fazer o relatório mensal de gestão',
      'Explicar desvios ao orçamento',
      'Acompanhar custos por área',
      'Preparar o orçamento do ano',
      'Melhorar os indicadores',
    ],
    workStyles: ['Rigor', 'Visão do negócio', 'Comunicação', 'Decisão', 'Organização'],
    skills: [
      EXCEL,
      skill('contabilidade-gestao', 'Contabilidade de gestão'),
      skill('orcamentos', 'Orçamentos'),
      skill('indicadores', 'Indicadores de gestão'),
      ERP,
    ],
    pathways: [university([FINANCE_DEGREE, firstJob('Experiência em finanças', 'Vários anos antes.'), ACCA])],
    stages: ladder('Controller de Gestão', 'Director Financeiro', [
      ['Prepara relatórios', 'Apoia o orçamento'],
      ['Responde por uma área', 'Explica desvios'],
      ['Responde pela empresa', 'Orienta a equipa'],
      ['Dirige as finanças', 'Decide com a administração'],
    ]),
    postings: 9,
    salary: SALARY.analyst,
    sectors: ['Indústria', 'Comércio e distribuição', 'Petróleo e energia', 'Grupos de empresas'],
  }),
  guide({
    slug: 'tesoureiro',
    description:
      'Controla o dinheiro de uma empresa: o que entra, o que sai e o que há no banco, para nunca faltar para os salários e fornecedores. Em Angola, gerir pagamentos em moeda estrangeira faz parte do trabalho em muitas empresas.',
    dayToDay: [
      'Ver os saldos do dia',
      'Preparar os pagamentos',
      'Prever as entradas e saídas',
      'Falar com os bancos',
      'Controlar as cobranças',
    ],
    workStyles: ['Honestidade', 'Rigor', 'Organização', 'Calma sob pressão', 'Discrição'],
    skills: [
      skill('tesouraria', 'Gestão de tesouraria'),
      skill('previsao-caixa', 'Previsões de caixa'),
      EXCEL,
      skill('relacao-bancos', 'Relação com os bancos'),
      ERP,
    ],
    pathways: [
      university([FINANCE_DEGREE, INTERNSHIP]),
      technical('Finanças', [
        firstJob('Primeiro emprego na contabilidade', 'Muitos tesoureiros começaram aqui.'),
      ]),
    ],
    stages: ladder('Tesoureiro', 'Director Financeiro', [
      ['Faz pagamentos', 'Reconcilia contas'],
      ['Prevê o dinheiro do mês', 'Fala com os bancos'],
      ['Gere a tesouraria de um grupo', 'Negocia com os bancos'],
      ['Dirige as finanças', 'Decide com a administração'],
    ]),
    postings: 9,
    salary: SALARY.analyst,
    sectors: ANY_SECTOR,
  }),
  guide({
    slug: 'analista-de-investimentos',
    description:
      'Estuda empresas, títulos e mercados para decidir onde aplicar dinheiro. Em Angola trabalha em bancos, gestoras de activos, no Fundo Soberano e nos organismos do mercado de capitais, que ainda é pequeno.',
    dayToDay: [
      'Analisar empresas e títulos',
      'Acompanhar a BODIVA e os mercados',
      'Construir modelos de avaliação',
      'Escrever recomendações',
      'Acompanhar as carteiras',
    ],
    workStyles: ['Raciocínio com números', 'Curiosidade', 'Pensamento crítico', 'Disciplina', 'Ética'],
    skills: [
      skill('avaliacao-empresas', 'Avaliação de empresas'),
      skill('modelos-financeiros', 'Modelos financeiros'),
      EXCEL,
      skill('mercados', 'Mercados financeiros'),
      ENGLISH,
    ],
    pathways: [university([FINANCE_DEGREE, INTERNSHIP, CFA])],
    stages: ladder('Analista de Investimentos', 'Director de Investimentos', [
      ['Reúne dados', 'Apoia análises'],
      ['Cobre empresas e títulos', 'Faz recomendações'],
      ['Gere carteiras', 'Orienta os analistas'],
      ['Define a estratégia', 'Responde pelos resultados'],
    ]),
    postings: 0,
    salary: SALARY.analyst,
    sectors: ['Bancos', 'Gestoras de activos', 'Fundo Soberano', 'Mercado de capitais'],
  }),
  guide({
    slug: 'tecnico-de-cobrancas',
    description:
      'Fala com clientes que têm dívidas e combina como vão pagar. Trabalha em bancos, operadoras e empresas de crédito ou de venda a prestações. Exige firmeza e respeito pelas pessoas.',
    dayToDay: [
      'Ver a lista de pagamentos em atraso',
      'Telefonar e visitar clientes',
      'Negociar planos de pagamento',
      'Registar os acordos',
      'Passar os casos difíceis à área jurídica',
    ],
    workContext: STREET,
    workStyles: ['Firmeza', 'Respeito pelas pessoas', 'Persistência', 'Organização', 'Calma'],
    skills: [
      skill('negociacao-dividas', 'Negociação de dívidas'),
      COMMUNICATION,
      skill('registos', 'Registo de contactos'),
      EXCEL,
    ],
    pathways: [
      technical('Contabilidade e Gestão', [
        firstJob('Primeiro emprego', 'Muitas empresas ensinam o trabalho.'),
      ]),
      startOnTheJob('Atendimento ao cliente', 'É uma boa experiência para começar.'),
    ],
    stages: ladder('Técnico de Cobranças', 'Responsável de Cobranças', [
      ['Faz contactos', 'Regista acordos'],
      ['Trata de casos mais difíceis', 'Negocia planos'],
      ['Trata dos grandes clientes', 'Ajuda os colegas'],
      ['Gere a equipa', 'Responde pelas metas'],
    ]),
    postings: 2,
    salary: SALARY.collector,
    sectors: ['Banca e microcrédito', 'Telecomunicações', 'Comércio', 'Empresas de cobrança'],
  }),
  guide({
    slug: 'gestor-de-clientes-bancario',
    description:
      'É a cara do banco para um grupo de clientes: conhece o seu negócio, propõe contas, crédito e seguros e resolve o que precisam. Trabalha em agências e tem metas para cumprir.',
    dayToDay: [
      'Falar com os clientes da sua carteira',
      'Propor produtos do banco',
      'Preparar pedidos de crédito',
      'Resolver problemas',
      'Acompanhar as metas',
    ],
    workContext: BRANCH,
    workStyles: ['Gostar de pessoas', 'Confiança', 'Persistência', 'Organização', 'Boa apresentação'],
    skills: [
      BANKING,
      NEGOTIATION,
      COMMUNICATION,
      skill('analise-credito', 'Análise de crédito'),
      skill('prevencao-branqueamento', 'Prevenção do branqueamento de capitais'),
    ],
    pathways: [university([FINANCE_DEGREE, IFBA_COURSE, INTERNSHIP])],
    stages: ladder('Gestor de Clientes', 'Director de Agência', [
      ['Apoia a agência', 'Atende clientes'],
      ['Gere uma carteira', 'Cumpre metas'],
      ['Gere grandes clientes', 'Orienta colegas'],
      ['Dirige a agência', 'Responde pelos resultados'],
    ]),
    postings: 7,
    salary: SALARY.credit,
    sectors: BANKS,
  }),
  guide({
    slug: 'operador-de-caixa-bancario',
    description:
      'Atende quem vai à agência: depósitos, levantamentos e transferências. Lida com dinheiro todos os dias, por isso a atenção e a honestidade são tudo. Costuma ser a primeira função em banca.',
    dayToDay: [
      'Atender clientes ao balcão',
      'Fazer depósitos e levantamentos',
      'Conferir a identificação',
      'Fechar a caixa do dia',
      'Encaminhar clientes para outros serviços',
    ],
    workContext: BRANCH,
    workStyles: ['Honestidade', 'Atenção ao detalhe', 'Simpatia', 'Calma', 'Rapidez'],
    skills: [
      skill('manuseamento-numerario', 'Manuseamento de dinheiro'),
      BANKING,
      skill('atendimento', 'Atendimento às pessoas'),
      skill('prevencao-branqueamento', 'Prevenção do branqueamento de capitais'),
    ],
    pathways: [
      technical('Finanças', [
        IFBA_COURSE,
        firstJob('Primeiro emprego', 'Os bancos recrutam sobretudo por concurso interno e candidaturas.'),
      ]),
      university([FINANCE_DEGREE, IFBA_COURSE]),
    ],
    stages: ladder('Operador de Caixa', 'Gestor de Agência', [
      ['Aprende ao balcão', 'Faz operações simples'],
      ['Trata de todas as operações', 'Fecha a caixa'],
      ['Supervisiona a caixa', 'Ajuda os colegas'],
      ['Gere a agência', 'Responde pelos resultados'],
    ]),
    postings: 0,
    salary: SALARY.teller,
    sectors: BANKS,
  }),
  guide({
    slug: 'analista-de-credito',
    description:
      'Decide se uma pessoa ou empresa pode pagar o empréstimo que pede. Analisa rendimentos, contas e garantias e faz uma recomendação. Trabalha em bancos e empresas de microcrédito.',
    dayToDay: [
      'Analisar pedidos de crédito',
      'Estudar contas e rendimentos',
      'Avaliar garantias',
      'Escrever pareceres',
      'Acompanhar créditos em risco',
    ],
    workContext: BRANCH,
    workStyles: ['Rigor', 'Independência', 'Pensamento crítico', 'Discrição', 'Raciocínio com números'],
    skills: [
      skill('analise-credito', 'Análise de crédito'),
      skill('analise-financeira', 'Análise de demonstrações financeiras'),
      EXCEL,
      BANKING,
    ],
    pathways: [university([FINANCE_DEGREE, IFBA_COURSE, INTERNSHIP])],
    stages: ladder('Analista de Crédito', 'Director de Crédito', [
      ['Prepara processos', 'Analisa casos simples'],
      ['Analisa empresas', 'Escreve pareceres'],
      ['Trata de grandes créditos', 'Orienta a equipa'],
      ['Define a política de crédito', 'Responde pela carteira'],
    ]),
    postings: 4,
    salary: SALARY.credit,
    sectors: BANKS,
  }),
  guide({
    slug: 'analista-de-risco',
    description:
      'Mede o que pode correr mal num banco ou seguradora: clientes que não pagam, câmbio, fraude ou falhas nos sistemas. Usa dados e modelos e propõe limites.',
    dayToDay: [
      'Medir os riscos da carteira',
      'Fazer testes de esforço',
      'Preparar relatórios para o regulador',
      'Propor limites',
      'Acompanhar os alertas',
    ],
    workStyles: ['Pensamento crítico', 'Raciocínio com números', 'Independência', 'Rigor', 'Comunicação'],
    skills: [
      skill('gestao-riscos', 'Gestão de riscos'),
      skill('estatistica', 'Estatística'),
      EXCEL,
      skill('regulacao-bancaria', 'Regras do BNA'),
      ENGLISH,
    ],
    pathways: [
      university([
        FINANCE_DEGREE,
        INTERNSHIP,
        certification('Certificação FRM', 'A certificação internacional de gestores de risco financeiro.'),
      ]),
    ],
    stages: ladder('Analista de Risco', 'Director de Risco', [
      ['Reúne dados', 'Faz relatórios'],
      ['Mede riscos', 'Propõe limites'],
      ['Desenha modelos', 'Orienta a equipa'],
      ['Define a política de risco', 'Responde perante a administração'],
    ]),
    postings: 1,
    salary: SALARY.analyst,
    sectors: ['Bancos', 'Seguradoras', 'Banco Nacional de Angola', 'Consultoras'],
  }),
  guide({
    slug: 'tecnico-de-compliance',
    description:
      'Garante que um banco ou empresa cumpre as leis e as regras, sobretudo contra o branqueamento de capitais. Verifica clientes e operações suspeitas e fala com o regulador.',
    dayToDay: [
      'Verificar clientes e operações',
      'Acompanhar as regras novas',
      'Analisar alertas',
      'Formar as equipas',
      'Reportar às autoridades',
    ],
    workStyles: ['Integridade', 'Rigor', 'Discrição', 'Firmeza', 'Atenção ao detalhe'],
    skills: [
      skill('prevencao-branqueamento', 'Prevenção do branqueamento de capitais'),
      skill('regulacao-bancaria', 'Regras do BNA'),
      skill('analise-risco-clientes', 'Análise de clientes'),
      ENGLISH,
    ],
    pathways: [
      university([
        degree('Direito', 'Ou Economia, Finanças ou Gestão.'),
        INTERNSHIP,
        certification(
          'Certificação CAMS',
          'A certificação internacional de prevenção do branqueamento de capitais.',
        ),
      ]),
    ],
    stages: ladder('Técnico de Compliance', 'Director de Compliance', [
      ['Verifica clientes', 'Trata alertas'],
      ['Investiga casos', 'Forma equipas'],
      ['Escreve as políticas', 'Orienta a equipa'],
      ['Responde perante a administração', 'Fala com o regulador'],
    ]),
    postings: 4,
    salary: SALARY.analyst,
    sectors: ['Bancos', 'Seguradoras', 'Petróleo e energia', 'Consultoras'],
  }),
  guide({
    slug: 'actuario',
    description:
      'Usa matemática e estatística para calcular quanto deve custar um seguro e quanto uma seguradora tem de guardar para pagar o que promete. É uma profissão rara em Angola, procurada por seguradoras, resseguradoras e fundos de pensões.',
    dayToDay: [
      'Calcular os preços dos seguros',
      'Estimar o que a seguradora terá de pagar',
      'Analisar dados de sinistros',
      'Preparar relatórios para a ARSEG',
      'Avaliar fundos de pensões',
    ],
    workStyles: ['Raciocínio com números', 'Rigor', 'Paciência', 'Independência', 'Comunicação'],
    skills: [
      skill('matematica-actuarial', 'Matemática actuarial'),
      skill('estatistica', 'Estatística'),
      skill('python', 'Python ou R', 'opcional'),
      EXCEL,
    ],
    pathways: [
      universityRoute('A via habitual: é uma profissão de muita matemática.', [
        degree(
          'Matemática',
          'Ou Estatística, Economia ou Finanças. A especialização em ciências actuariais costuma fazer-se depois, muitas vezes no estrangeiro.',
        ),
        firstJob('Primeiro emprego numa seguradora', 'Aprende-se muito com um actuário mais velho.'),
      ]),
    ],
    stages: ladder('Actuário', 'Actuário Responsável', [
      ['Prepara dados', 'Faz cálculos'],
      ['Calcula preços e provisões', 'Prepara relatórios'],
      ['Valida os modelos', 'Orienta a equipa'],
      ['Responde perante a ARSEG', 'Aconselha a administração'],
    ]),
    postings: 0,
    salary: SALARY.actuary,
    sectors: INSURERS,
  }),
  guide({
    slug: 'tecnico-de-seguros',
    description:
      'Trata do dia a dia de uma seguradora: faz apólices, analisa pedidos e acompanha sinistros, por exemplo um acidente de carro. Trabalha em seguradoras e mediadoras.',
    dayToDay: [
      'Emitir e renovar apólices',
      'Analisar o risco de um pedido',
      'Acompanhar sinistros',
      'Atender clientes e mediadores',
      'Preparar relatórios',
    ],
    workStyles: ['Rigor', 'Atendimento', 'Organização', 'Honestidade', 'Paciência'],
    skills: [
      skill('produtos-seguros', 'Produtos de seguros'),
      skill('gestao-sinistros', 'Gestão de sinistros'),
      EXCEL,
      COMMUNICATION,
    ],
    pathways: [
      university([degree('Finanças', 'Ou Gestão de Empresas ou Economia.'), MEDIATOR_COURSE, INTERNSHIP]),
    ],
    stages: ladder('Técnico de Seguros', 'Responsável de Área', [
      ['Faz apólices simples', 'Atende clientes'],
      ['Analisa riscos', 'Acompanha sinistros'],
      ['Trata de casos difíceis', 'Ajuda os colegas'],
      ['Gere uma área', 'Responde pelos resultados'],
    ]),
    postings: 4,
    salary: SALARY.insurance,
    sectors: INSURERS,
  }),
  guide({
    slug: 'mediador-de-seguros',
    description:
      'Vende seguros a pessoas e empresas e ajuda-as quando precisam deles. Pode trabalhar por conta própria, ganhando comissões. Para exercer, é preciso o curso aprovado pela ARSEG e passar nas provas.',
    dayToDay: [
      'Procurar clientes',
      'Perceber o que precisam',
      'Comparar seguros e propor',
      'Tratar das renovações',
      'Ajudar nos sinistros',
    ],
    workContext: STREET,
    workStyles: ['Gostar de pessoas', 'Persistência', 'Confiança', 'Organização', 'Autonomia'],
    skills: [
      skill('produtos-seguros', 'Produtos de seguros'),
      skill('vendas', 'Vendas'),
      COMMUNICATION,
      skill('carteira-clientes', 'Gestão de uma carteira de clientes'),
    ],
    pathways: [
      {
        ...technicalRoute('O caminho que a lei pede: curso, provas e registo.', [
          { ...middle('Gestão ou Contabilidade'), need: 'recomendado' },
          MEDIATOR_COURSE,
          firstJob('Primeiros clientes', 'Muitos começam a trabalhar com uma seguradora ou mediadora.'),
        ]),
        steps: [
          NINTH_GRADE,
          { ...middle('Gestão ou Contabilidade'), need: 'recomendado' },
          MEDIATOR_COURSE,
          firstJob('Primeiros clientes', 'Muitos começam a trabalhar com uma seguradora ou mediadora.'),
        ],
      },
    ],
    stages: ladder('Mediador de Seguros', 'Dono de uma Mediadora', [
      ['Aprende os produtos', 'Conquista os primeiros clientes'],
      ['Gere uma carteira', 'Trata das renovações'],
      ['Trata de grandes clientes', 'Forma uma equipa'],
      ['Gere uma mediadora', 'Responde perante a ARSEG'],
    ]),
    postings: 0,
    salary: SALARY.insurance,
    sectors: ['Conta própria', 'Mediadoras e corretoras', 'Seguradoras'],
  }),
  guide({
    slug: 'gestor-de-empresas',
    description:
      'Dirige uma empresa ou uma área: define objectivos, gere pessoas, dinheiro e operações e responde pelos resultados. Não é um lugar de início de carreira, mas muitos gerem o próprio negócio cedo.',
    dayToDay: [
      'Definir objectivos',
      'Acompanhar vendas, custos e pessoas',
      'Decidir investimentos',
      'Resolver problemas com clientes e fornecedores',
      'Prestar contas aos donos',
    ],
    workStyles: ['Liderança', 'Decisão', 'Visão do negócio', 'Comunicação', 'Responsabilidade'],
    skills: [
      skill('gestao-equipas', 'Gestão de equipas'),
      skill('financas-gestao', 'Finanças para gestores'),
      skill('estrategia', 'Estratégia'),
      NEGOTIATION,
      ENGLISH,
    ],
    pathways: [
      university([
        MANAGEMENT_DEGREE,
        firstJob('Vários anos de experiência', 'Numa área da empresa, antes de a gerir.'),
      ]),
      startOnTheJob('Criar o próprio negócio', 'Muitos gestores começam com uma pequena empresa.'),
    ],
    stages: ladder('Gestor', 'Director Geral', [
      ['Coordena uma pequena equipa', 'Acompanha indicadores'],
      ['Gere uma área', 'Responde pelos resultados'],
      ['Gere várias áreas', 'Orienta outros gestores'],
      ['Dirige a empresa', 'Responde perante os donos'],
    ]),
    postings: 3,
    salary: SALARY.manager,
    sectors: ANY_SECTOR,
  }),
  guide({
    slug: 'consultor-de-gestao',
    description:
      'Ajuda empresas e organismos a resolver problemas: reorganizar, cortar custos, entrar num mercado. Trabalha em consultoras, por projectos, e vê muitos sectores em pouco tempo.',
    dayToDay: [
      'Perceber o problema do cliente',
      'Recolher e analisar dados',
      'Entrevistar equipas',
      'Preparar recomendações',
      'Apresentar ao cliente',
    ],
    workContext: [
      { label: 'Ambiente', value: 'Escritório e empresas dos clientes' },
      { label: 'Horário', value: 'Exigente perto das entregas' },
      { label: 'Equipa', value: 'Consultores, por projecto' },
      { label: 'Viagens', value: 'Frequentes' },
    ],
    workStyles: [
      'Resolver problemas',
      'Comunicação clara',
      'Pensamento crítico',
      'Adaptação',
      'Trabalhar em equipa',
    ],
    skills: [
      skill('analise-problemas', 'Análise de problemas'),
      EXCEL,
      skill('apresentacoes', 'Apresentações'),
      skill('estrategia', 'Estratégia'),
      ENGLISH,
    ],
    pathways: [university([MANAGEMENT_DEGREE, INTERNSHIP])],
    stages: ladder('Consultor', 'Partner', [
      ['Faz análises', 'Prepara apresentações'],
      ['Responde por uma parte do projecto', 'Fala com o cliente'],
      ['Gere projectos', 'Orienta consultores'],
      ['Traz clientes', 'Dirige a prática'],
    ]),
    postings: 1,
    salary: SALARY.consultant,
    sectors: ['Consultoras', 'Banca', 'Organizações de cooperação', 'Estado'],
  }),
  guide({
    slug: 'assistente-administrativo',
    description:
      'Mantém um escritório a funcionar: documentos, agenda, atendimento, compras simples e apoio às equipas. É a profissão de gestão mais anunciada depois das vendas e uma boa porta de entrada.',
    dayToDay: [
      'Organizar e arquivar documentos',
      'Atender telefonemas e visitas',
      'Tratar de correspondência',
      'Preparar relatórios simples',
      'Apoiar as compras e os pagamentos',
    ],
    workStyles: ['Organização', 'Discrição', 'Simpatia', 'Atenção ao detalhe', 'Iniciativa'],
    skills: [
      skill('office', 'Word e Excel'),
      skill('arquivo', 'Organização de documentos'),
      COMMUNICATION,
      ENGLISH,
    ],
    pathways: [
      technical('Gestão Empresarial', [firstJob('Primeiro emprego', 'Muitas empresas pedem o curso médio.')]),
      startOnTheJob('Primeiro emprego como recepcionista ou auxiliar', 'Boa forma de entrar numa empresa.'),
    ],
    stages: ladder('Assistente Administrativo', 'Responsável Administrativo', [
      ['Arquiva e atende', 'Aprende os processos'],
      ['Trata de uma área', 'Apoia a direcção'],
      ['Coordena o escritório', 'Ajuda os colegas'],
      ['Gere a administração', 'Responde pelos processos'],
    ]),
    postings: 84,
    salary: SALARY.secretary,
    sectors: ANY_SECTOR,
  }),
  guide({
    slug: 'secretario-executivo',
    description:
      'É o braço direito de um director: gere a agenda, prepara reuniões, filtra pedidos e trata de documentos importantes. Muitas vezes pede línguas. Trabalha em grandes empresas, embaixadas e organismos.',
    dayToDay: [
      'Gerir a agenda e as viagens',
      'Preparar reuniões e actas',
      'Filtrar telefonemas e emails',
      'Redigir documentos',
      'Acompanhar pendências',
    ],
    workStyles: ['Discrição', 'Organização', 'Iniciativa', 'Boa escrita', 'Calma sob pressão'],
    skills: [
      skill('agenda', 'Gestão de agendas'),
      skill('redaccao', 'Redacção'),
      skill('office', 'Word e Excel'),
      skill('ingles-negocios', 'Inglês de trabalho'),
    ],
    pathways: [
      university([degree('Secretariado', 'Ou Línguas e Administração ou Gestão.'), INTERNSHIP]),
      technical('Gestão Empresarial', [firstJob('Primeiro emprego', 'Muitos começam como assistentes.')]),
    ],
    stages: ladder('Secretário Executivo', 'Chefe de Gabinete', [
      ['Apoia um departamento', 'Trata da agenda'],
      ['Apoia um director', 'Prepara reuniões'],
      ['Apoia a administração', 'Coordena secretários'],
      ['Gere o gabinete', 'Responde pela agenda da direcção'],
    ]),
    postings: 21,
    salary: SALARY.secretary,
    sectors: ['Grandes empresas', 'Embaixadas', 'Organizações internacionais', 'Estado'],
  }),
  guide({
    slug: 'tecnico-de-compras',
    description:
      'Compra o que uma empresa precisa: compara fornecedores, negocia preços e garante que chega a tempo. Com tanta coisa importada, em Angola o trabalho também passa por prazos longos e câmbio.',
    dayToDay: [
      'Receber pedidos',
      'Pedir propostas a fornecedores',
      'Negociar preços e prazos',
      'Emitir encomendas',
      'Acompanhar entregas',
    ],
    workStyles: ['Negociação', 'Honestidade', 'Organização', 'Atenção ao detalhe', 'Persistência'],
    skills: [NEGOTIATION, skill('gestao-fornecedores', 'Gestão de fornecedores'), EXCEL, ERP, ENGLISH],
    pathways: [
      university([MANAGEMENT_DEGREE, INTERNSHIP]),
      technical('Gestão Empresarial', [
        firstJob('Primeiro emprego em armazém ou compras', 'Muitos começam aqui.'),
      ]),
    ],
    stages: ladder('Técnico de Compras', 'Director de Compras', [
      ['Pede propostas', 'Faz encomendas'],
      ['Negocia com fornecedores', 'Acompanha entregas'],
      ['Negocia contratos grandes', 'Orienta a equipa'],
      ['Define a estratégia de compras', 'Responde pelos custos'],
    ]),
    postings: 25,
    salary: SALARY.buyer,
    sectors: ['Indústria', 'Construção', 'Comércio e distribuição', 'Petróleo e energia'],
  }),
  guide({
    slug: 'tecnico-de-recursos-humanos',
    description:
      'Trata do dia a dia das pessoas de uma empresa: contratos, férias, faltas, formação e dúvidas. Precisa de conhecer a Lei Geral do Trabalho. Há muitos anúncios em Angola, em todo o tipo de empresas.',
    dayToDay: [
      'Fazer contratos e processos',
      'Controlar faltas e férias',
      'Organizar formações',
      'Apoiar o recrutamento',
      'Tirar dúvidas dos trabalhadores',
    ],
    workStyles: ['Discrição', 'Ouvir', 'Organização', 'Imparcialidade', 'Simpatia'],
    skills: [
      skill('lei-trabalho', 'Lei Geral do Trabalho'),
      skill('processos-pessoal', 'Processos de pessoal'),
      EXCEL,
      COMMUNICATION,
    ],
    pathways: [
      university([HR_DEGREE, INTERNSHIP]),
      technical('Gestão Empresarial', [
        firstJob('Primeiro emprego administrativo', 'Depois podes especializar-te em pessoas.'),
      ]),
    ],
    stages: ladder('Técnico de Recursos Humanos', 'Gestor de Recursos Humanos', [
      ['Organiza processos', 'Apoia a equipa'],
      ['Trata de uma área', 'Atende os trabalhadores'],
      ['Conduz projectos', 'Ajuda os mais novos'],
      ['Gere os recursos humanos', 'Fala com a direcção'],
    ]),
    postings: 32,
    salary: SALARY.hr,
    sectors: ANY_SECTOR,
  }),
  guide({
    slug: 'gestor-de-recursos-humanos',
    description:
      'Define como uma empresa contrata, paga, forma e avalia as pessoas, e aconselha a direcção. Em Angola também acompanha a angolanização dos quadros em empresas com expatriados.',
    dayToDay: [
      'Planear as equipas',
      'Definir salários e benefícios',
      'Conduzir a avaliação',
      'Resolver conflitos',
      'Aconselhar a direcção',
    ],
    workStyles: ['Liderança', 'Ouvir', 'Imparcialidade', 'Discrição', 'Visão do negócio'],
    skills: [
      skill('lei-trabalho', 'Lei Geral do Trabalho'),
      skill('gestao-desempenho', 'Gestão do desempenho'),
      skill('compensacao', 'Salários e benefícios'),
      skill('lideranca-equipas', 'Liderança de equipas'),
      ENGLISH,
    ],
    pathways: [university([HR_DEGREE, firstJob('Experiência em recursos humanos', 'Vários anos antes.')])],
    stages: ladder('Gestor de Recursos Humanos', 'Director de Recursos Humanos', [
      ['Coordena uma área', 'Apoia a direcção'],
      ['Gere uma equipa', 'Trata dos processos da empresa'],
      ['Define as políticas', 'Orienta os gestores'],
      ['Dirige as pessoas', 'Senta-se com a administração'],
    ]),
    postings: 12,
    salary: SALARY.hrManager,
    sectors: ['Indústria', 'Construção', 'Petróleo e energia', 'Banca e seguros'],
  }),
  guide({
    slug: 'tecnico-de-recrutamento',
    description:
      'Encontra as pessoas certas para cada vaga: publica anúncios, lê CV, faz entrevistas e apresenta candidatos. Trabalha em empresas e em agências de recrutamento.',
    dayToDay: [
      'Perceber o que a vaga pede',
      'Publicar anúncios',
      'Ler CV',
      'Fazer entrevistas',
      'Dar resposta aos candidatos',
    ],
    workStyles: ['Gostar de pessoas', 'Imparcialidade', 'Organização', 'Boa conversa', 'Discrição'],
    skills: [
      skill('entrevistas', 'Entrevistas'),
      skill('selecao', 'Selecção de candidatos'),
      COMMUNICATION,
      EXCEL,
    ],
    pathways: [university([HR_DEGREE, INTERNSHIP])],
    stages: ladder('Técnico de Recrutamento', 'Responsável de Recrutamento', [
      ['Lê CV', 'Marca entrevistas'],
      ['Conduz recrutamentos', 'Fala com as chefias'],
      ['Trata de vagas difíceis', 'Orienta a equipa'],
      ['Define a estratégia', 'Responde pelos prazos'],
    ]),
    postings: 7,
    salary: SALARY.hr,
    sectors: ['Agências de recrutamento', 'Indústria', 'Banca', 'Construção'],
  }),
  guide({
    slug: 'tecnico-de-salarios',
    description:
      'Calcula os salários de cada mês: horas, faltas, subsídios, descontos, imposto e segurança social. Um erro chega ao bolso de alguém, por isso exige muito rigor.',
    dayToDay: [
      'Recolher faltas e horas',
      'Calcular salários',
      'Calcular IRT e INSS',
      'Preparar os pagamentos',
      'Tirar dúvidas dos trabalhadores',
    ],
    workStyles: ['Rigor', 'Discrição', 'Cumprir prazos', 'Organização', 'Paciência'],
    skills: [
      skill('processamento-salarios', 'Processamento de salários'),
      skill('lei-trabalho', 'Lei Geral do Trabalho'),
      EXCEL,
      ERP,
    ],
    pathways: [
      technical('Contabilidade e Gestão', [
        firstJob('Primeiro emprego', 'Em recursos humanos ou contabilidade.'),
      ]),
      university([HR_DEGREE, INTERNSHIP]),
    ],
    stages: ladder('Técnico de Salários', 'Responsável de Salários', [
      ['Recolhe dados', 'Confere cálculos'],
      ['Processa os salários', 'Entrega declarações'],
      ['Trata de grandes empresas', 'Orienta os colegas'],
      ['Gere a equipa', 'Responde pelos prazos'],
    ]),
    postings: 3,
    salary: SALARY.payroll,
    sectors: ANY_SECTOR,
  }),
  guide({
    slug: 'tecnico-comercial',
    description:
      'Visita clientes, apresenta produtos e fecha vendas. É, de longe, a profissão com mais anúncios na área em Angola, em quase todos os sectores, e aceita muitas vezes quem está a começar.',
    dayToDay: [
      'Procurar novos clientes',
      'Visitar clientes',
      'Apresentar produtos',
      'Fazer propostas e fechar vendas',
      'Acompanhar as metas',
    ],
    workContext: STREET,
    workStyles: ['Gostar de pessoas', 'Persistência', 'Boa apresentação', 'Organização', 'Autonomia'],
    skills: [
      skill('vendas', 'Vendas'),
      NEGOTIATION,
      COMMUNICATION,
      skill('carteira-clientes', 'Gestão de uma carteira de clientes'),
      skill('carta-conducao', 'Carta de condução', 'opcional'),
    ],
    pathways: [
      technical('Gestão Comercial e Marketing', [
        firstJob('Primeiro emprego', 'Comissões e metas fazem parte.'),
      ]),
      startOnTheJob('Primeiro emprego em vendas', 'Muitas empresas ensinam o produto.'),
    ],
    stages: ladder('Técnico Comercial', 'Gestor Comercial', [
      ['Aprende os produtos', 'Visita clientes'],
      ['Gere uma carteira', 'Cumpre metas'],
      ['Trata de grandes clientes', 'Ajuda os colegas'],
      ['Lidera a equipa', 'Responde pelas vendas'],
    ]),
    postings: 147,
    salary: SALARY.sales,
    sectors: ['Comércio e distribuição', 'Indústria', 'Telecomunicações', 'Seguros'],
  }),
  guide({
    slug: 'gestor-comercial',
    description:
      'Lidera a equipa de vendas: define metas, divide zonas, acompanha os grandes clientes e responde pelas vendas. Chega-se aqui depois de provas dadas como comercial.',
    dayToDay: [
      'Definir metas',
      'Acompanhar a equipa',
      'Visitar grandes clientes',
      'Negociar contratos',
      'Fazer relatórios',
    ],
    workContext: STREET,
    workStyles: ['Liderança', 'Negociação', 'Persistência', 'Visão do negócio', 'Comunicação'],
    skills: [
      skill('gestao-equipas', 'Gestão de equipas'),
      skill('vendas', 'Vendas'),
      NEGOTIATION,
      skill('previsao-vendas', 'Previsões de vendas'),
      EXCEL,
    ],
    pathways: [university([MARKETING_DEGREE, firstJob('Experiência como comercial', 'Vários anos antes.')])],
    stages: ladder('Gestor Comercial', 'Director Comercial', [
      ['Coordena uma zona', 'Acompanha comerciais'],
      ['Gere uma equipa', 'Responde pelas metas'],
      ['Gere várias equipas', 'Trata de grandes contratos'],
      ['Dirige as vendas', 'Senta-se com a administração'],
    ]),
    postings: 20,
    salary: SALARY.salesManager,
    sectors: ['Comércio e distribuição', 'Indústria', 'Telecomunicações', 'Banca e seguros'],
  }),
  guide({
    slug: 'gestor-de-marketing',
    description:
      'Decide como uma marca se apresenta: campanhas, preços, promoções e o que dizer a quem. Trabalha com agências, vendas e redes sociais, e mede o que resultou.',
    dayToDay: [
      'Perceber o mercado e os clientes',
      'Planear campanhas',
      'Trabalhar com agências',
      'Gerir o orçamento',
      'Medir os resultados',
    ],
    workStyles: ['Criatividade', 'Decidir com dados', 'Comunicação', 'Curiosidade', 'Organização'],
    skills: [
      skill('plano-marketing', 'Plano de marketing'),
      skill('estudos-mercado', 'Estudos de mercado'),
      skill('marketing-digital', 'Marketing digital'),
      EXCEL,
      ENGLISH,
    ],
    pathways: [university([MARKETING_DEGREE, INTERNSHIP])],
    stages: ladder('Gestor de Marketing', 'Director de Marketing', [
      ['Apoia campanhas', 'Faz relatórios'],
      ['Gere campanhas', 'Trata com agências'],
      ['Define a estratégia de uma marca', 'Orienta a equipa'],
      ['Dirige o marketing', 'Responde pelos resultados'],
    ]),
    postings: 39,
    salary: SALARY.salesManager,
    sectors: ['Comércio e distribuição', 'Bebidas e alimentar', 'Telecomunicações', 'Banca'],
  }),
  guide({
    slug: 'gestor-de-loja',
    description:
      'Gere uma loja ou supermercado: pessoas, stock, caixa, limpeza e atendimento. Trabalha quando os outros compram. Muitos começam como operadores de caixa e sobem por mérito.',
    dayToDay: [
      'Abrir e fechar a loja',
      'Organizar os turnos',
      'Controlar o stock e fazer encomendas',
      'Resolver problemas de clientes',
      'Acompanhar as vendas do dia',
    ],
    workContext: SHOP,
    workStyles: ['Liderança', 'Organização', 'Resistência', 'Simpatia', 'Honestidade'],
    skills: [
      skill('gestao-equipas', 'Gestão de equipas'),
      skill('gestao-stock', 'Gestão de stock'),
      skill('atendimento', 'Atendimento às pessoas'),
      EXCEL,
    ],
    pathways: [
      startOnTheJob('Operador de caixa ou repositor', 'Muitos gestores começaram aqui.', [
        firstJob('Supervisor de loja', 'O passo seguinte, antes de gerir uma loja.'),
      ]),
      technical('Gestão Comercial e Marketing', [
        firstJob('Primeiro emprego em loja', 'Sobe-se com resultados.'),
      ]),
    ],
    stages: ladder('Supervisor de Loja', 'Gestor de Várias Lojas', [
      ['Orienta um turno', 'Trata da caixa'],
      ['Gere uma loja', 'Responde pelas vendas'],
      ['Gere uma loja grande', 'Forma supervisores'],
      ['Gere várias lojas', 'Responde pela zona'],
    ]),
    postings: 7,
    salary: SALARY.retail,
    sectors: ['Supermercados', 'Lojas de roupa e calçado', 'Bombas de combustível', 'Conta própria'],
  }),
  guide({
    slug: 'tecnico-de-comercio-internacional',
    description:
      'Trata das importações e exportações de uma empresa: encomendas, transporte, documentos, câmbios e alfândega. Em Angola, onde muito do que se consome vem de fora, é uma função importante.',
    dayToDay: [
      'Falar com fornecedores estrangeiros',
      'Tratar dos documentos',
      'Combinar transporte e seguros',
      'Acompanhar a alfândega',
      'Controlar prazos e custos',
    ],
    workStyles: ['Organização', 'Atenção ao detalhe', 'Línguas', 'Persistência', 'Negociação'],
    skills: [
      skill('incoterms', 'Incoterms'),
      skill('documentos-aduaneiros', 'Documentos aduaneiros'),
      skill('cambio', 'Pagamentos ao estrangeiro'),
      skill('ingles-negocios', 'Inglês de trabalho'),
    ],
    pathways: [
      university([degree('Comércio Internacional', 'Ou Gestão Comercial ou Logística.'), INTERNSHIP]),
      technical('Gestão Comercial e Marketing', [
        firstJob('Primeiro emprego num importador', 'Aprende-se fazendo.'),
      ]),
    ],
    stages: ladder('Técnico de Comércio Internacional', 'Responsável de Importações', [
      ['Trata de documentos', 'Acompanha encomendas'],
      ['Gere importações', 'Fala com fornecedores'],
      ['Negocia contratos', 'Orienta a equipa'],
      ['Define a estratégia', 'Responde pelos custos'],
    ]),
    postings: 9,
    salary: SALARY.buyer,
    sectors: ['Importadores', 'Comércio e distribuição', 'Indústria', 'Logística'],
  }),
  guide({
    slug: 'economista',
    description:
      'Estuda como funcionam a produção, os preços e o emprego e explica o que está a acontecer à economia. Trabalha no Banco Nacional de Angola, no Ministério das Finanças, em bancos, consultoras e organizações internacionais.',
    dayToDay: [
      'Recolher e analisar dados',
      'Fazer previsões',
      'Escrever relatórios',
      'Avaliar políticas',
      'Explicar conclusões',
    ],
    workStyles: ['Pensamento crítico', 'Raciocínio com números', 'Boa escrita', 'Curiosidade', 'Rigor'],
    skills: [
      skill('macroeconomia', 'Macroeconomia'),
      skill('estatistica', 'Estatística'),
      EXCEL,
      skill('econometria', 'Econometria', 'opcional'),
      ENGLISH,
    ],
    pathways: [university([ECONOMICS_DEGREE, INTERNSHIP])],
    stages: ladder('Economista', 'Economista-Chefe', [
      ['Reúne dados', 'Apoia estudos'],
      ['Conduz análises', 'Escreve relatórios'],
      ['Faz previsões', 'Orienta a equipa'],
      ['Dirige os estudos', 'Aconselha a administração'],
    ]),
    postings: 0,
    salary: SALARY.economist,
    sectors: ECONOMY_SECTORS,
  }),
  guide({
    slug: 'analista-de-estudos-economicos',
    description:
      'Acompanha a inflação, o câmbio, o petróleo e o crescimento e escreve relatórios para quem decide. Trabalha sobretudo em bancos, no BNA e em consultoras.',
    dayToDay: [
      'Actualizar os dados da economia',
      'Escrever notas e relatórios',
      'Fazer previsões',
      'Explicar o que muda para o negócio',
      'Apresentar às direcções',
    ],
    workStyles: ['Boa escrita', 'Rigor', 'Curiosidade', 'Pensamento crítico', 'Organização'],
    skills: [
      skill('macroeconomia', 'Macroeconomia'),
      EXCEL,
      skill('redaccao', 'Redacção'),
      skill('previsao', 'Previsões'),
      ENGLISH,
    ],
    pathways: [university([ECONOMICS_DEGREE, INTERNSHIP])],
    stages: ladder('Analista de Estudos Económicos', 'Director de Estudos', [
      ['Actualiza dados', 'Apoia relatórios'],
      ['Escreve relatórios', 'Faz previsões'],
      ['Define os temas', 'Orienta a equipa'],
      ['Dirige os estudos', 'Fala com a administração'],
    ]),
    postings: 0,
    salary: SALARY.economist,
    sectors: ECONOMY_SECTORS,
  }),
]

const groupOf = (slug: string) => BUSINESS_CAREERS.find((career) => career.slug === slug)?.group

const offer = (
  name: string,
  careers: string[],
  recognition: SourceLink,
  level: AcademyOffer['level'] = 'medio_tecnico',
): AcademyOffer => ({
  course: {
    id: `tecnico-${name
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')}`,
    name,
  },
  name,
  level,
  recognition,
  careers,
  areas: [...new Set(careers.map((career) => groupOf(career) ?? 'infraestrutura'))],
})

const ACCOUNTING = ['tecnico-de-contabilidade', 'tecnico-de-cobrancas', 'tecnico-de-salarios']
const MANAGEMENT = [
  'assistente-administrativo',
  'tecnico-de-compras',
  'tecnico-de-recursos-humanos',
  'secretario-executivo',
]
const TRADE = ['tecnico-comercial', 'gestor-de-loja', 'tecnico-de-comercio-internacional']
const FINANCE = ['tesoureiro', 'operador-de-caixa-bancario', 'tecnico-de-cobrancas']
const COMPUTING = ['tecnico-de-suporte', 'tecnico-de-hardware']

const decree = (label: string, path: string): SourceLink => ({
  label: `Decreto Executivo n.º ${label}`,
  url: `${SCHOOL_DECREE}/${path}/`,
})
const school = (
  id: string,
  name: string,
  province: string,
  place: string,
  source: SourceLink,
  courses: [string, string[]][],
): Academy => ({
  id,
  name,
  type: 'instituto_medio',
  ownership: null,
  province,
  place,
  summary: 'Instituto médio de gestão criado por decreto do Ministério da Educação.',
  offers: courses.map(([courseName, careers]) => offer(courseName, careers, source)),
  sources: [source],
})

const MAIOMBE = decree('227/22', '2022/decreto-executivo-n-o-227-22-de-07-de-junho')
const TOCOISTA = decree('239/22', '2022/decreto-executivo-n-o-239-22-de-22-de-junho')
const RAMIROS = decree('230/23', '2023/decreto-executivo-n-o-230-23-de-24-de-outubro')
const KITUMA = decree('327/25', '2025/decreto-executivo-n-o-327-25-de-05-de-fevereiro')
const INSURANCE_ACADEMY: SourceLink = {
  label: 'Expansão: a Academia de Seguros forma 840 mediadores em sete províncias',
  url: 'https://expansao.co.ao/empresas/detalhe/academia-de-seguros-forma-840-mediadores-em-sete-provincias-63710.html',
}

export const BUSINESS_SCHOOLS: Academy[] = [
  school(
    'instituto-politecnico-maiombe',
    'Instituto Politécnico Maiombe n.º 4.023',
    'Luanda',
    'Cacuaco, Luanda',
    MAIOMBE,
    [
      ['Gestão Empresarial', MANAGEMENT],
      ['Contabilidade e Gestão', ACCOUNTING],
      ['Informática', COMPUTING],
      ['Informática e Gestão', COMPUTING],
    ],
  ),
  school(
    'instituto-politecnico-de-administracao-e-gestao-tocoista',
    'Instituto Politécnico de Administração e Gestão - Tocoísta',
    'Uíge',
    'Maquela do Zombo, Uíge',
    TOCOISTA,
    [
      ['Contabilidade de Gestão', ACCOUNTING],
      ['Informática de Gestão', COMPUTING],
    ],
  ),
  school(
    'instituto-politecnico-dos-ramiros',
    'Instituto Politécnico de Administração e Serviços dos Ramiros n.º 2.066 - Kundi Paihama',
    'Luanda',
    'Belas, Luanda',
    RAMIROS,
    [
      ['Contabilidade e Gestão', ACCOUNTING],
      ['Gestão Comercial e Marketing', TRADE],
      ['Finanças', FINANCE],
      ['Informática de Gestão', COMPUTING],
    ],
  ),
  school('instituto-politecnico-do-kituma', 'Instituto Politécnico do Kituma', 'Uíge', 'Uíge', KITUMA, [
    ['Comércio', TRADE],
    ['Contabilidade e Gestão', ACCOUNTING],
    ['Finanças', FINANCE],
    ['Informática e Gestão', COMPUTING],
  ]),
  {
    id: 'academia-de-seguros-e-fundos-de-pensoes',
    name: 'Academia de Seguros e Fundos de Pensões',
    type: 'centro_formacao',
    ownership: null,
    province: 'Luanda',
    place: 'Luanda',
    summary:
      'Forma mediadores de seguros: 840 em sete províncias (Luanda, Huíla, Uíge, Huambo, Lunda Sul, Benguela e Namibe), com exame final perante um júri presidido pela ARSEG.',
    offers: [
      offer(
        'Mediação de Seguros',
        ['mediador-de-seguros', 'tecnico-de-seguros'],
        INSURANCE_ACADEMY,
        'formacao_profissional',
      ),
    ],
    sources: [INSURANCE_ACADEMY],
  },
]
