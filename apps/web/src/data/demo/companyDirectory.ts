import type { Company, CompanyFact, CompanyQuote, SourceLink } from '../types'
import { LINKS } from './companyLinks'

// What we collected for the showcase companies and for the rest of the directory (docs/recolha-de-dados.md,
// "Empresas", 20/11/2026), merged over each company's card by `withProfiles` (companyProfiles.ts):
// - `LINKS` (companyLinks.ts): official site and own social pages, read from the site itself (never a group
//   page of a multinational);
// - `DETAILS`: description, lines of business, founding year, headquarters, public leaders and interview quotes,
//   each with its source; what no source states stays out;
// - `TYPICAL`: the posts a kind of business hires for, the typical requirements and the schools its people come
//   from. This is our reading from the type of business, not a statement by the company: `estimated: true`
//   (listed in the memory "data-to-collect-later").

export type Extra = Partial<
  Pick<
    Company,
    | 'summary'
    | 'website'
    | 'socials'
    | 'activities'
    | 'activitiesSource'
    | 'founded'
    | 'employees'
    | 'headquarters'
    | 'people'
    | 'quotes'
    | 'programs'
    | 'roles'
    | 'partners'
    | 'careers'
    | 'estimated'
  >
>

const fact = (value: string, source: SourceLink): CompanyFact => ({ value, source })
const src = (label: string, url: string): SourceLink => ({ label, url })
const wiki = (title: string, lang: 'pt' | 'en' = 'pt'): SourceLink =>
  src(
    `Wikipédia: ${decodeURIComponent(title).replace(/_/g, ' ')}`,
    `https://${lang}.wikipedia.org/wiki/${title}`,
  )
const site = (url: string): SourceLink => src('Site oficial', url)
const FORBES = 'https://forbesafricalusofona.com'
const VA = 'https://www.verangola.net/va'

type Kind =
  | 'banco'
  | 'telecom'
  | 'petroleo'
  | 'electricidade'
  | 'media'
  | 'mineracao'
  | 'comercio'
  | 'consultoria'
  | 'saude'
  | 'seguros'
  | 'transporte'
  | 'porto'
  | 'estado'
  | 'industria'
  | 'construcao'
  | 'hotelaria'

type Post = { title: string; careers: string[]; requirements: string[] }

const TYPICAL: Record<Kind, { posts: Post[]; partners: string[] }> = {
  banco: {
    posts: [
      {
        title: 'Gestor de clientes',
        careers: ['gestor-de-clientes-bancario'],
        requirements: [
          'Licenciatura em Economia, Gestão ou Finanças',
          'Gosto por vender e falar com pessoas',
        ],
      },
      {
        title: 'Atendimento e caixa',
        careers: ['operador-de-caixa-bancario'],
        requirements: ['Ensino médio em Contabilidade, Economia ou Administração', 'Rigor com dinheiro'],
      },
      {
        title: 'Crédito e risco',
        careers: ['analista-de-credito', 'analista-de-risco'],
        requirements: ['Licenciatura em Economia, Finanças ou Matemática', 'Domínio de Excel'],
      },
      {
        title: 'Compliance e auditoria',
        careers: ['tecnico-de-compliance', 'auditor-interno'],
        requirements: [
          'Licenciatura em Direito, Economia ou Contabilidade',
          'Conhecimento das regras do BNA',
        ],
      },
      {
        title: 'Tesouraria e contabilidade',
        careers: ['tesoureiro', 'contabilista'],
        requirements: ['Licenciatura em Contabilidade, Finanças ou Economia'],
      },
      {
        title: 'Tecnologia e segurança',
        careers: ['desenvolvedor-backend', 'analista-de-ciberseguranca', 'administrador-de-redes'],
        requirements: ['Licenciatura em Engenharia Informática ou afins', 'Certificações são uma mais-valia'],
      },
      {
        title: 'Recursos humanos e marketing',
        careers: ['tecnico-de-recursos-humanos', 'gestor-de-marketing'],
        requirements: ['Licenciatura em Gestão, Psicologia ou Marketing'],
      },
    ],
    partners: [
      'uan',
      'ucan',
      'isptec',
      'isutic',
      'instituto-medio-de-economia-de-luanda',
      'instituto-medio-comercial-de-luanda',
      'academia-de-seguros-e-fundos-de-pensoes',
    ],
  },
  telecom: {
    posts: [
      {
        title: 'Redes e telecomunicações',
        careers: ['engenheiro-de-telecomunicacoes', 'tecnico-de-telecomunicacoes'],
        requirements: [
          'Engenharia de Telecomunicações ou Electrotécnica',
          'Disponibilidade para trabalho de campo',
        ],
      },
      {
        title: 'Sistemas e desenvolvimento',
        careers: ['desenvolvedor-backend', 'administrador-de-sistemas', 'analista-de-dados'],
        requirements: ['Engenharia Informática ou afins', 'Portfólio de projectos'],
      },
      {
        title: 'Vendas e clientes',
        careers: ['gestor-comercial', 'tecnico-comercial'],
        requirements: ['Ensino médio ou licenciatura em Gestão ou Marketing', 'Boa comunicação'],
      },
      {
        title: 'Marketing digital',
        careers: ['gestor-de-marketing-digital', 'gestor-de-redes-sociais'],
        requirements: ['Licenciatura em Marketing ou Comunicação'],
      },
      {
        title: 'Segurança e finanças',
        careers: ['analista-de-ciberseguranca', 'analista-financeiro'],
        requirements: ['Licenciatura na área', 'Certificações de segurança ou finanças valorizadas'],
      },
    ],
    partners: ['isptec', 'isutic', 'itel', 'uan', 'ucan', 'cinfotec'],
  },
  petroleo: {
    posts: [
      {
        title: 'Engenharia de petróleos e perfuração',
        careers: ['engenheiro-de-petroleos', 'engenheiro-de-perfuracao'],
        requirements: [
          'Licenciatura em Engenharia de Petróleos ou Química',
          'Inglês técnico',
          'Cursos de segurança offshore',
        ],
      },
      {
        title: 'Geociências',
        careers: ['geologo', 'geofisico'],
        requirements: ['Licenciatura em Geologia ou Geofísica', 'Inglês técnico'],
      },
      {
        title: 'Operação e manutenção',
        careers: ['operador-de-producao-petrolifera', 'engenheiro-mecanico', 'tecnico-de-instrumentacao'],
        requirements: [
          'Ensino médio técnico ou licenciatura em Mecânica ou Electrotecnia',
          'Certificados de segurança (BOSIET)',
        ],
      },
      {
        title: 'Segurança, saúde e ambiente',
        careers: ['tecnico-de-seguranca-no-trabalho', 'engenheiro-do-ambiente'],
        requirements: ['Formação em HSE ou Engenharia'],
      },
      {
        title: 'Finanças, jurídico e compras',
        careers: ['analista-financeiro', 'jurista', 'tecnico-de-procurement'],
        requirements: ['Licenciatura em Economia, Direito ou Gestão', 'Inglês'],
      },
    ],
    partners: [
      'instituto-nacional-de-petroleos',
      'uan',
      'isptec',
      'ucan',
      'academia-petroangola',
      'centro-de-formacao-maritima-de-angola',
      'instituto-profissional-de-gestao-de-petroleo',
    ],
  },
  electricidade: {
    posts: [
      {
        title: 'Engenharia electrotécnica',
        careers: ['engenheiro-electrotecnico', 'engenheiro-de-energias-renovaveis'],
        requirements: ['Licenciatura em Engenharia Electrotécnica ou Energias', 'Carta de condução'],
      },
      {
        title: 'Electricistas e manutenção',
        careers: ['tecnico-electricista', 'tecnico-de-manutencao-mecanica', 'engenheiro-de-manutencao'],
        requirements: [
          'Ensino médio técnico em Electricidade ou Mecânica',
          'Formação em segurança eléctrica',
        ],
      },
      {
        title: 'Clientes e cobranças',
        careers: ['tecnico-comercial', 'tecnico-de-cobrancas'],
        requirements: ['Ensino médio ou licenciatura em Gestão ou Economia'],
      },
      {
        title: 'Segurança e finanças',
        careers: ['tecnico-de-seguranca-no-trabalho', 'analista-financeiro'],
        requirements: ['Formação na área'],
      },
    ],
    partners: [
      'isptec',
      'uan',
      'instituto-medio-industrial-de-luanda',
      'instituto-medio-politecnico-industrial-de-luanda',
      'inefop',
    ],
  },
  media: {
    posts: [
      {
        title: 'Jornalismo',
        careers: ['jornalista', 'editor-de-video'],
        requirements: ['Licenciatura em Comunicação Social ou Jornalismo', 'Portfólio de peças'],
      },
      {
        title: 'Produção e realização',
        careers: ['realizador', 'tecnico-de-relacoes-publicas'],
        requirements: ['Formação em Audiovisual ou Comunicação'],
      },
      {
        title: 'Digital e design',
        careers: ['gestor-de-redes-sociais', 'designer-grafico'],
        requirements: ['Portfólio digital', 'Domínio de ferramentas de edição'],
      },
      {
        title: 'Técnico de emissão',
        careers: ['tecnico-de-telecomunicacoes'],
        requirements: ['Ensino médio técnico em Electrónica ou Telecomunicações'],
      },
    ],
    partners: [
      'centro-de-formacao-de-jornalistas-cefojor',
      'isutic',
      'uan',
      'ucan',
      'instituto-superior-de-artes',
    ],
  },
  mineracao: {
    posts: [
      {
        title: 'Geologia e minas',
        careers: ['geologo', 'engenheiro-de-minas'],
        requirements: [
          'Licenciatura em Geologia ou Engenharia de Minas',
          'Disponibilidade para viver na mina',
        ],
      },
      {
        title: 'Processamento e metalurgia',
        careers: ['engenheiro-metalurgico', 'engenheiro-mecanico', 'engenheiro-de-manutencao'],
        requirements: ['Licenciatura em Engenharia', 'Formação em segurança industrial'],
      },
      {
        title: 'Operação de máquinas',
        careers: ['operador-de-maquinas-pesadas', 'tecnico-de-manutencao-mecanica'],
        requirements: ['Ensino médio técnico', 'Certificado de operador'],
      },
      {
        title: 'Apoio e gestão',
        careers: ['tecnico-de-seguranca-no-trabalho', 'contabilista', 'tecnico-de-recursos-humanos'],
        requirements: ['Formação na área'],
      },
    ],
    partners: ['uan', 'isptec', 'ucan', 'inefop'],
  },
  comercio: {
    posts: [
      {
        title: 'Gestão de loja',
        careers: ['gestor-de-loja', 'tecnico-comercial'],
        requirements: ['Ensino médio ou licenciatura em Gestão', 'Experiência de atendimento é valorizada'],
      },
      {
        title: 'Compras e logística',
        careers: ['tecnico-de-compras', 'gestor-de-logistica', 'tecnico-de-logistica'],
        requirements: ['Formação em Logística ou Gestão', 'Excel'],
      },
      {
        title: 'Finanças e pessoas',
        careers: ['contabilista', 'tecnico-de-recursos-humanos'],
        requirements: ['Licenciatura na área'],
      },
      {
        title: 'Marketing',
        careers: ['gestor-de-marketing'],
        requirements: ['Licenciatura em Marketing ou Gestão'],
      },
    ],
    partners: ['instituto-medio-comercial-de-luanda', 'uan', 'ucan', 'inefop'],
  },
  consultoria: {
    posts: [
      {
        title: 'Auditoria',
        careers: ['auditor', 'contabilista'],
        requirements: ['Licenciatura em Contabilidade, Auditoria ou Finanças', 'Média alta e inglês'],
      },
      {
        title: 'Consultoria e finanças',
        careers: ['consultor-de-gestao', 'analista-financeiro'],
        requirements: ['Licenciatura em Gestão ou Economia', 'Excel e apresentação'],
      },
      {
        title: 'Fiscalidade e jurídico',
        careers: ['tecnico-de-impostos', 'jurista'],
        requirements: ['Licenciatura em Direito, Economia ou Contabilidade'],
      },
      {
        title: 'Tecnologia e dados',
        careers: ['analista-de-dados', 'analista-de-ciberseguranca'],
        requirements: ['Engenharia Informática ou afins'],
      },
    ],
    partners: ['uan', 'ucan', 'isptec', 'pwc-academy-angola'],
  },
  saude: {
    posts: [
      {
        title: 'Medicina',
        careers: ['medico-clinica-geral', 'medico-pediatra', 'cirurgiao-geral'],
        requirements: ['Licenciatura em Medicina', 'Inscrição na Ordem dos Médicos'],
      },
      {
        title: 'Enfermagem',
        careers: ['enfermeiro', 'tecnico-medio-enfermagem'],
        requirements: ['Licenciatura ou curso médio de Enfermagem', 'Inscrição na Ordem dos Enfermeiros'],
      },
      {
        title: 'Diagnóstico e farmácia',
        careers: ['tecnico-analises-clinicas', 'tecnico-radiologia', 'farmaceutico'],
        requirements: ['Formação técnica ou licenciatura na área'],
      },
      {
        title: 'Reabilitação e nutrição',
        careers: ['fisioterapeuta', 'nutricionista'],
        requirements: ['Licenciatura na área'],
      },
      {
        title: 'Administração',
        careers: ['contabilista', 'tecnico-de-recursos-humanos'],
        requirements: ['Formação em Gestão ou Contabilidade'],
      },
    ],
    partners: [
      'escola-de-formacao-de-tecnicos-de-saude-de-luanda',
      'instituto-de-especializacao-em-saude',
      'uan',
      'ucan',
    ],
  },
  seguros: {
    posts: [
      {
        title: 'Seguros e mediação',
        careers: ['tecnico-de-seguros', 'mediador-de-seguros'],
        requirements: ['Ensino médio ou licenciatura em Gestão, Economia ou Direito', 'Formação em seguros'],
      },
      {
        title: 'Actuariado e risco',
        careers: ['actuario', 'analista-de-risco'],
        requirements: ['Licenciatura em Matemática, Estatística ou Economia'],
      },
      {
        title: 'Jurídico e contabilidade',
        careers: ['jurista', 'contabilista'],
        requirements: ['Licenciatura na área'],
      },
      {
        title: 'Comercial',
        careers: ['tecnico-comercial', 'gestor-comercial'],
        requirements: ['Gosto por vender e acompanhar clientes'],
      },
    ],
    partners: ['academia-de-seguros-e-fundos-de-pensoes', 'uan', 'ucan', 'isptec'],
  },
  transporte: {
    posts: [
      {
        title: 'Operações e transportes',
        careers: ['tecnico-de-transportes', 'engenheiro-de-transportes'],
        requirements: ['Licenciatura em Engenharia ou Gestão de Transportes'],
      },
      {
        title: 'Aviação e segurança',
        careers: ['inspector-de-aviacao-civil', 'tecnico-de-seguranca-no-trabalho'],
        requirements: ['Formação aeronáutica ou em segurança', 'Inglês'],
      },
      {
        title: 'Manutenção',
        careers: ['engenheiro-de-manutencao', 'tecnico-de-manutencao-mecanica'],
        requirements: ['Ensino médio técnico ou licenciatura em Mecânica'],
      },
      {
        title: 'Comercial e finanças',
        careers: ['tecnico-comercial', 'contabilista'],
        requirements: ['Formação na área'],
      },
    ],
    partners: ['isptec', 'uan', 'ucan', 'instituto-medio-industrial-de-luanda'],
  },
  porto: {
    posts: [
      {
        title: 'Gestão portuária',
        careers: ['gestor-portuario', 'despachante-aduaneiro'],
        requirements: ['Licenciatura em Gestão, Logística ou Transportes'],
      },
      {
        title: 'Logística',
        careers: ['gestor-de-logistica', 'tecnico-de-logistica'],
        requirements: ['Formação em Logística'],
      },
      {
        title: 'Obras e equipamentos',
        careers: ['engenheiro-civil', 'operador-de-maquinas-pesadas', 'rigger-e-operador-de-grua'],
        requirements: ['Engenharia Civil ou curso técnico', 'Certificado de operador'],
      },
      {
        title: 'Segurança e finanças',
        careers: ['tecnico-de-seguranca-no-trabalho', 'analista-financeiro'],
        requirements: ['Formação na área'],
      },
    ],
    partners: ['centro-de-formacao-maritima-de-angola', 'uan', 'isptec', 'ucan'],
  },
  estado: {
    posts: [
      {
        title: 'Economia e estudos',
        careers: ['economista', 'analista-de-estudos-economicos'],
        requirements: ['Licenciatura em Economia', 'Concurso público ou processo de selecção'],
      },
      {
        title: 'Finanças e impostos',
        careers: ['tecnico-de-impostos', 'auditor-interno', 'analista-financeiro'],
        requirements: ['Licenciatura em Contabilidade, Finanças ou Direito'],
      },
      {
        title: 'Administração pública e jurídico',
        careers: ['tecnico-superior-de-administracao-publica', 'jurista'],
        requirements: ['Licenciatura em Direito, Administração Pública ou Gestão'],
      },
      {
        title: 'Informática',
        careers: ['analista-de-sistemas', 'analista-de-ciberseguranca'],
        requirements: ['Engenharia Informática ou afins'],
      },
    ],
    partners: ['escola-nacional-de-administracao-e-politicas-publicas-enapp', 'uan', 'ucan', 'isptec'],
  },
  industria: {
    posts: [
      {
        title: 'Produção e qualidade',
        careers: [
          'engenheiro-de-producao-industrial',
          'tecnico-de-qualidade-alimentar',
          'engenheiro-quimico',
        ],
        requirements: ['Licenciatura em Engenharia Industrial, Química ou Alimentar'],
      },
      {
        title: 'Manutenção',
        careers: ['engenheiro-de-manutencao', 'tecnico-de-manutencao-mecanica', 'tecnico-electricista'],
        requirements: ['Ensino médio técnico ou licenciatura em Mecânica ou Electricidade'],
      },
      {
        title: 'Logística e comercial',
        careers: ['gestor-de-logistica', 'gestor-comercial'],
        requirements: ['Licenciatura em Gestão ou Logística'],
      },
      {
        title: 'Segurança e finanças',
        careers: ['tecnico-de-seguranca-no-trabalho', 'contabilista'],
        requirements: ['Formação na área'],
      },
    ],
    partners: ['isptec', 'uan', 'instituto-medio-industrial-de-luanda', 'inefop'],
  },
  construcao: {
    posts: [
      {
        title: 'Engenharia civil e obras',
        careers: ['engenheiro-civil', 'tecnico-de-obras', 'topografo'],
        requirements: [
          'Licenciatura em Engenharia Civil ou curso técnico de Construção',
          'Disponibilidade para obra',
        ],
      },
      {
        title: 'Orçamentos e projecto',
        careers: ['medidor-orcamentista', 'arquitecto', 'gestor-de-projectos'],
        requirements: ['Licenciatura em Engenharia, Arquitectura ou Gestão', 'AutoCAD e Excel'],
      },
      {
        title: 'Electricidade e segurança',
        careers: ['engenheiro-electrotecnico', 'tecnico-de-seguranca-no-trabalho'],
        requirements: ['Formação na área'],
      },
    ],
    partners: ['uan', 'isptec', 'ucan', 'instituto-medio-politecnico-industrial-de-luanda'],
  },
  hotelaria: {
    posts: [
      {
        title: 'Gestão hoteleira',
        careers: ['gestor-hoteleiro', 'recepcionista-de-hotel'],
        requirements: ['Curso de Hotelaria ou Turismo', 'Inglês e simpatia ao balcão'],
      },
      {
        title: 'Cozinha e restauração',
        careers: ['chefe-de-cozinha', 'cozinheiro', 'gestor-de-restauracao'],
        requirements: ['Escola de hotelaria e experiência de cozinha'],
      },
      {
        title: 'Turismo',
        careers: ['tecnico-de-turismo', 'guia-turistico'],
        requirements: ['Formação em Turismo e línguas'],
      },
    ],
    partners: [
      'escola-de-hotelaria-e-restauracao-de-talatona',
      'escola-de-hotelaria-e-turismo-de-cabinda',
      'uan',
    ],
  },
}

/** The posts, careers and schools of a kind of business, flagged as our reading. */
const typical = (kind: Kind): Extra => {
  const { posts, partners } = TYPICAL[kind]
  return {
    roles: posts.map((post) => ({ ...post, estimated: true })),
    careers: [...new Set(posts.flatMap((post) => post.careers))],
    partners,
    estimated: true,
  }
}

const quote = (q: CompanyQuote): CompanyQuote => q

const ACADEMIA_BAI_QUOTE = quote({
  text: 'Os líderes do futuro não podem descurar as competências técnicas',
  speaker: "Noelma Viegas d'Abreu",
  role: 'CEO da Academia BAI',
  date: '2026-11-17',
  outlet: 'Forbes África Lusófona',
  url: `${FORBES}/os-lideres-do-futuro-terao-de-aliar-visao-estrategica-integridade-e-capacidade-de-ouvir-as-pessoas/`,
  topic: 'competencias',
})
const ACCESS_QUOTE = quote({
  text: 'Estes jovens continuam a beneficiar de um percurso de capacitação contínua',
  speaker: 'Ricardo Ferreira',
  role: 'Presidente da Comissão Executiva do Access Bank Angola',
  date: '2025-08-11',
  outlet: 'Forbes África Lusófona',
  url: `${FORBES}/access-bank-angola-lanca-programa-de-recem-licenciados/`,
  topic: 'estagios',
})
const STANDARD_QUOTE = quote({
  text: 'Pretendemos fazer do Standard Bank de Angola um líder no desenvolvimento de jovens licenciados',
  speaker: 'Alexandre Sambo',
  role: 'Direcção de Capital Humano do Standard Bank de Angola',
  date: '2017-10-18',
  outlet: 'Expansão',
  url: 'https://expansao.co.ao/gestao/detalhe/standard-bank-aposta-no-enquadramento-de-recem-formados-51510.html',
  topic: 'contratacao',
})
const TIS_QUOTES = [
  quote({
    text: 'Todos nós somos profissionais porque alguém nos deu uma oportunidade.',
    speaker: 'William de Oliveira',
    role: 'CEO da TIS',
    date: '2026-07-12',
    outlet: 'Forbes África Lusófona',
    url: `${FORBES}/adn-tis-2026-integra-30-estagiarios-para-aproximar-jovens-angolanos-do-mercado-de-trabalho/`,
    topic: 'estagios',
  }),
  quote({
    text: 'A ideia do ADN TIS é dar a estes jovens a oportunidade de se mostrarem ao mercado de trabalho',
    speaker: 'William de Oliveira',
    role: 'CEO da TIS',
    date: '2026-07-12',
    outlet: 'Forbes África Lusófona',
    url: `${FORBES}/adn-tis-2026-integra-30-estagiarios-para-aproximar-jovens-angolanos-do-mercado-de-trabalho/`,
    topic: 'estagios',
  }),
]

const MACAIA_URL =
  'https://expansao.co.ao/grande-entrevista/detalhe/neste-momento-ha-uma-consciencia-da-parte-dos-accionistas-que-o-banco-vai-precisar-de-um-aumento-de-capital-64520.html'
const MACAIA_QUOTES = [
  quote({
    text: '… é nossa intenção dedicar e desenvolver competências ao nosso capital humano, o activo mais importante de qualquer organização.',
    speaker: 'Osvaldo de Lemos Macaia',
    role: 'Presidente da Comissão Executiva do Banco Sol',
    date: '2025-03-18',
    outlet: 'Expansão',
    url: MACAIA_URL,
    topic: 'planos',
  }),
  quote({
    text: '… o plano também prevê um plano de formação para os colaboradores do banco.',
    speaker: 'Osvaldo de Lemos Macaia',
    role: 'Presidente da Comissão Executiva do Banco Sol',
    date: '2025-03-18',
    outlet: 'Expansão',
    url: MACAIA_URL,
    topic: 'competencias',
  }),
]

const ANGOLA = 'Luanda'

/** The showcase companies and the other facts we could source, by company id. */
export const DETAILS: Record<string, Extra> = {
  // Telecommunications and television
  unitel: { ...typical('telecom') },
  movicel: {
    ...typical('telecom'),
    summary:
      'Operadora angolana de telefonia móvel, fixa e internet móvel, criada em 2003 como filial da Angola Telecom.',
    activities: ['Telefonia móvel (2G, 3G e 4G)', 'Telefonia fixa', 'Internet móvel'],
    activitiesSource: wiki('Movicel', 'en'),
    founded: fact('2003', wiki('Movicel', 'en')),
    employees: fact('≈ 1 500 (2019)', wiki('Movicel', 'en')),
    headquarters: fact(ANGOLA, wiki('Movicel', 'en')),
  },
  'angola-telecom': {
    ...typical('telecom'),
    summary:
      'Empresa pública de telecomunicações e multimédia de Angola, nascida em 1992 da fusão da ENATEL com a EPTEL.',
    founded: fact('1992', wiki('Angola_Telecom')),
  },
  africell: { ...typical('telecom') },
  'angola-cables': {
    ...typical('telecom'),
    summary:
      'Opera cabos submarinos de fibra óptica que ligam Angola a outros continentes e vende capacidade de internet a operadores.',
  },
  multitel: {
    ...typical('telecom'),
    summary:
      'Fornecedor angolano de internet e de serviços de telecomunicações para empresas e particulares.',
  },
  paratus: { ...typical('telecom') },
  'tv-cabo': {
    ...typical('telecom'),
    summary: 'Operador angolano de televisão por cabo e satélite, do grupo Visabeira.',
    activities: ['Televisão por subscrição'],
    activitiesSource: wiki('TV_Cabo'),
  },
  zap: { ...typical('telecom') },

  // Banks
  bai: { ...typical('banco'), quotes: [ACADEMIA_BAI_QUOTE] },
  bfa: { ...typical('banco') },
  'banco-bic': {
    ...typical('banco'),
    summary: 'Banco comercial angolano de capitais privados, com serviços para particulares e empresas.',
  },
  atlantico: {
    ...typical('banco'),
    summary:
      'Banco comercial angolano, conhecido também como Banco Millennium Atlântico, com serviços para particulares e empresas.',
  },
  'standard-bank': {
    summary:
      'Banco do grupo sul-africano Standard Bank, com serviços para particulares, empresas e grandes empresas. Em 2026 passou a estar cotado na bolsa (BODIVA).',
    ...typical('banco'),
    activities: ['Particulares', 'Empresas', 'Grandes empresas (banca de investimento, tesouraria)'],
    activitiesSource: site('https://www.standardbank.co.ao'),
    headquarters: fact(
      'Inara Business Park & Gardens, Torre 1, Via A2, Talatona, Luanda',
      site('https://www.standardbank.co.ao'),
    ),
    people: [
      {
        name: 'Luís Teles',
        role: 'Presidente da Comissão Executiva',
        source: src(
          'Expansão: Standard Bank Angola entra na bolsa (09/2026)',
          'https://expansao.co.ao/empresas/detalhe/ring-the-bell-standard-bank-angola-entra-oficialmente-na-bolsa-de-valores-75027.html',
        ),
      },
    ],
    quotes: [STANDARD_QUOTE],
  },
  bci: {
    ...typical('banco'),
    summary:
      'Banco privado angolano com sede em Luanda e agências em todo o país. Pertence, desde Outubro de 2021, ao grupo Carrinho.',
    headquarters: fact(ANGOLA, wiki('Banco_de_Com%C3%A9rcio_e_Ind%C3%BAstria')),
  },
  'banco-sol': {
    ...typical('banco'),
    quotes: MACAIA_QUOTES,
    summary:
      'Banco angolano de retalho e empresas, com um balcão dedicado ao petróleo e à mineração (Oil & Mining Desk). Em 2025 aprovou um plano de recapitalização e reestruturação.',
    activities: ['Particulares', 'Empresas e Oil & Mining Desk', 'Private banking', 'Premium'],
    activitiesSource: site('https://www.bancosol.ao'),
    headquarters: fact(
      'Gaveto da Rua Frederico Welwitsch n.º 47 com a Rua Lourenço Mendes da Conceição n.º 7, Luanda',
      site('https://www.bancosol.ao'),
    ),
    people: [
      {
        name: 'António André Lopes',
        role: 'Presidente do Conselho de Administração',
        source: src(
          'Ver Angola, 04/2025',
          `${VA}/pt/042025/BancaSeguros/44244/Banco-Sol-vai-ser-recapitalizado-com-capitais-privados-e-reduzir-até-30-por-cento-de-trabalhadores.htm`,
        ),
      },
      {
        name: 'Osvaldo de Lemos Macaia',
        role: 'Presidente da Comissão Executiva',
        source: src('Forbes África Lusófona, 2026', `${FORBES}/?p=176025`),
      },
    ],
  },
  'banco-de-poupanca-e-credito-bpc': {
    ...typical('banco'),
    summary:
      'Banco público angolano, o mais antigo do país: nasceu em 1956 como Banco Comercial de Angola. Trabalha sobretudo o retalho e as pequenas e médias empresas.',
    activities: ['Poupança', 'Crédito', 'Contas', 'Cartões', 'Serviços (BPC Net, SMS Banking, câmbios)'],
    activitiesSource: site('https://www.bpc.ao'),
    founded: fact('1956', wiki('Banco_de_Poupan%C3%A7a_e_Cr%C3%A9dito', 'en')),
    employees: fact('4 820 (2020)', wiki('Banco_de_Poupan%C3%A7a_e_Cr%C3%A9dito', 'en')),
    headquarters: fact('Largo Saydi Mingas, Edifício Sede, Luanda', site('https://www.bpc.ao')),
    people: [
      {
        name: 'Cláudio Pinheiro Pinto Macedo',
        role: 'Presidente do Conselho de Administração e da Comissão Executiva (mandato 2022/2026)',
        source: src(
          'Ver Angola, 10/2022',
          `${VA}/pt/102022/BancaSeguros/33057/BPC-tem-novo-conselho-de-administração.htm`,
        ),
      },
    ],
  },
  'access-bank-angola': {
    summary:
      'Banco comercial a operar em Angola, do grupo bancário nigeriano Access Bank, com um programa próprio para recém-licenciados.',
    ...typical('banco'),
    programs: [
      {
        name: 'Programa de Recém-Licenciados',
        summary:
          'Três meses de formação prática na sede do Access Bank em Lagos (Nigéria) e três meses de formação técnica e comportamental na Banking School of Excellence.',
        source: src(
          'Forbes África Lusófona, 11/08/2025',
          `${FORBES}/access-bank-angola-lanca-programa-de-recem-licenciados/`,
        ),
      },
    ],
    people: [
      {
        name: 'Ricardo Ferreira',
        role: 'Presidente da Comissão Executiva',
        source: src(
          'Forbes África Lusófona, 11/08/2025',
          `${FORBES}/access-bank-angola-lanca-programa-de-recem-licenciados/`,
        ),
      },
    ],
    quotes: [ACCESS_QUOTE],
  },
  'banco-nacional-de-angola-bna': {
    ...typical('estado'),
    summary:
      'Banco central de Angola: o único responsável pela política monetária e o supervisor de todos os bancos do país.',
    activities: ['Política monetária', 'Supervisão da banca'],
    activitiesSource: wiki('Banco_Nacional_de_Angola'),
    founded: fact('1926 (como Banco de Angola)', wiki('Banco_Nacional_de_Angola')),
    headquarters: fact('Avenida 4 de Fevereiro, Luanda', wiki('Banco_Nacional_de_Angola')),
  },

  // Oil, gas and energy
  sonangol: { ...typical('petroleo') },
  'azule-energy': {
    ...typical('petroleo'),
    summary:
      'Empresa angolana de petróleo e gás formada em 2022 pela BP e pela Eni, que juntaram nela os seus interesses em Angola.',
    activities: ['Exploração e produção de petróleo e gás'],
    activitiesSource: site('https://www.azule-energy.com'),
    founded: fact('2022', site('https://www.azule-energy.com')),
    employees: fact(
      'mais de 900',
      src('Azule Energy, carreiras', 'https://www.azule-energy.com/en/careers/'),
    ),
    headquarters: fact(ANGOLA, site('https://www.azule-energy.com')),
    people: [
      {
        name: 'Joe Murphy',
        role: 'CEO (desde 1 de Dezembro de 2025)',
        source: src(
          'Azule Energy, comunicado de imprensa (12/2025)',
          'https://www.azule-energy.com/wp-content/uploads/2025/12/Press-Release-New-CEO-_-00125-revised-and-APPROVED_compressed.pdf',
        ),
      },
    ],
  },
  chevron: { ...typical('petroleo') },
  totalenergies: { ...typical('petroleo') },
  halliburton: { ...typical('petroleo') },
  'baker-hughes': { ...typical('petroleo') },
  'angola-lng': { ...typical('petroleo') },
  'empresa-nacional-de-distribuicao-de-electricidade-ende': {
    ...typical('electricidade'),
    summary:
      'Empresa pública que distribui electricidade em Angola e colabora na transmissão e na geração. É tutelada pelo Ministério da Energia e Águas.',
    activities: ['Distribuição de electricidade'],
    activitiesSource: wiki('Empresa_Nacional_de_Distribui%C3%A7%C3%A3o_de_Electricidade'),
  },
  'empresa-publica-de-producao-de-electricidade-prodel': {
    ...typical('electricidade'),
    summary:
      'Empresa pública que produz electricidade em Angola e colabora na transmissão e na distribuição. É tutelada pelo Ministério da Energia e Águas.',
    activities: ['Geração de electricidade'],
    activitiesSource: wiki('Empresa_P%C3%BAblica_de_Produ%C3%A7%C3%A3o_de_Electricidade'),
    people: [
      {
        name: 'Pedro Eduardo Manuel Afonso',
        role: 'Presidente do Conselho de Administração (nomeado em Abril de 2023)',
        source: src(
          'Ver Angola, 04/2023',
          `${VA}/pt/042023/Energia/35303/EPAL-e-PRODEL-têm-novos-conselhos-de-administração.htm`,
        ),
      },
    ],
  },

  // Transport
  taag: { ...typical('transporte') },
  'porto-de-luanda': {
    ...typical('porto'),
    summary:
      'Principal porto de Luanda, ligado ao centro da cidade e administrado pela empresa pública Porto de Luanda E.P.',
    headquarters: fact(ANGOLA, wiki('Porto_de_Luanda')),
  },
  'caminho-de-ferro-de-benguela-cfb': {
    ...typical('transporte'),
    summary:
      'A linha ferroviária mais importante de Angola: atravessa o país de oeste a leste, do porto do Lobito até à fronteira com a RD Congo.',
    activities: ['Transporte ferroviário de carga e passageiros'],
    activitiesSource: wiki('Caminho_de_Ferro_de_Benguela'),
  },

  // Mining and industry
  endiama: { ...typical('mineracao') },
  'sociedade-mineira-de-catoca': {
    ...typical('mineracao'),
    summary:
      'A maior empresa de diamantes de Angola, na mina de Catoca (Lunda Sul), uma das maiores minas a céu aberto do mundo. Os accionistas são a Endiama e a Taadeen Investment, do fundo soberano de Omã.',
    activities: ['Prospecção, exploração, recuperação e comercialização de diamantes'],
    activitiesSource: site('https://www.catoca.com'),
    founded: fact('1996 (início da operação)', wiki('Mina_de_diamantes_Catoca')),
    employees: fact('mais de 3 300', wiki('Mina_de_diamantes_Catoca')),
    headquarters: fact(
      'Mina de Catoca, Saurimo (Lunda Sul), e Talatona, Luanda',
      site('https://www.catoca.com'),
    ),
  },
  refriango: {
    ...typical('industria'),
    summary:
      'Empresa angolana especializada na produção e distribuição de refrigerantes, sumos, água e outras bebidas, com marcas como Blue, Pure e Nutry.',
    activities: ['Refrigerantes', 'Sumos', 'Água', 'Bebidas energéticas e alcoólicas'],
    activitiesSource: site('https://www.refriango.com'),
    headquarters: fact(
      'Edifício Nuvi, Rua D. Eduardo André Muaca, Lote C4, Bairro Palanca, Luanda',
      site('https://www.refriango.com'),
    ),
  },
  'grupo-castel': { ...typical('industria') },
  'mota-engil-angola': { ...typical('construcao') },
  'teixeira-duarte': { ...typical('construcao') },

  // Trade, insurance, consulting, health, hotels
  'shoprite-angola': {
    ...typical('comercio'),
    summary: 'Cadeia de supermercados do grupo sul-africano Shoprite a operar em Angola.',
  },
  kero: {
    ...typical('comercio'),
    summary:
      'Empresa angolana de distribuição moderna, só com capitais angolanos, que vende produtos alimentares e não alimentares. Abriu o primeiro hipermercado em Dezembro de 2010.',
    founded: fact('2010', wiki('Hipermercados_Kero')),
  },
  'ensa-seguros': {
    summary:
      'Seguradora pública, a maior do país segundo a ARSEG. Vende seguros de saúde, automóvel, vida, casa, agro negócios e acidentes de trabalho, entre outros.',
    ...typical('seguros'),
    activities: [
      'Saúde',
      'Automóvel',
      'Vida',
      'Casa',
      'Agro negócios',
      'Fundo de pensões',
      'Acidentes de trabalho',
    ],
    activitiesSource: site('https://www.ensa.co.ao'),
    headquarters: fact(
      'Loanda Towers, Rua Gamal Abdel Nasser, Torres A e B, Ingombota, Luanda',
      site('https://www.ensa.co.ao'),
    ),
  },
  'fidelidade-angola': { ...typical('seguros') },
  'deloitte-angola': { ...typical('consultoria') },
  'pwc-angola': { ...typical('consultoria') },
  'ey-angola': { ...typical('consultoria') },
  'kpmg-angola': { ...typical('consultoria') },
  'clinica-girassol': {
    ...typical('saude'),
    summary: 'Clínica privada de saúde em Luanda, com consultas, exames e urgências.',
  },
  'clinica-sagrada-esperanca': {
    ...typical('saude'),
    summary: 'Clínica privada de saúde em Luanda, com consultas, exames e urgências.',
  },
  'sana-hotels': { ...typical('hotelaria') },

  // Media
  'televisao-publica-de-angola-tpa': {
    ...typical('media'),
    summary:
      'Televisão pública de Angola. Nasceu em 1973 como Radiotelevisão Portuguesa de Angola e tem hoje a TPA 1, a TPA 2 e a TPA Notícias.',
    activities: ['TPA 1', 'TPA 2', 'TPA Notícias'],
    activitiesSource: wiki('Televis%C3%A3o_P%C3%BAblica_de_Angola', 'en'),
    founded: fact('1973', wiki('Televis%C3%A3o_P%C3%BAblica_de_Angola', 'en')),
    headquarters: fact(ANGOLA, wiki('Televis%C3%A3o_P%C3%BAblica_de_Angola', 'en')),
  },
  'jornal-de-angola-edicoes-novembro': {
    ...typical('media'),
    founded: fact('1975', wiki('Jornal_de_Angola', 'en')),
    headquarters: fact(ANGOLA, wiki('Jornal_de_Angola', 'en')),
  },
  'radio-nacional-de-angola-rna': {
    ...typical('media'),
    summary:
      'Rádio pública de Angola, com estações em Luanda, uma em cada província e um serviço internacional.',
    activities: ['Estações de Luanda', '18 estações regionais', 'Serviço Internacional'],
    activitiesSource: wiki('R%C3%A1dio_Nacional_de_Angola'),
    headquarters: fact(ANGOLA, wiki('R%C3%A1dio_Nacional_de_Angola')),
    people: [
      {
        name: 'António Sebastião Lino',
        role: 'Presidente do Conselho de Administração',
        source: src(
          'Ver Angola, 01/2026',
          `${VA}/pt/012026/Telecomunicacoes/47382/Sebastião-Lino-passa-a-liderar-Conselho-de-Administração-da-RNA.htm`,
        ),
      },
    ],
  },
  'agencia-angola-press-angop': { ...typical('media') },

  // State
  'administracao-geral-tributaria-agt': {
    summary: 'Organismo do Estado que cobra os impostos em Angola.',
    ...typical('estado'),
    people: [
      {
        name: 'Leonildo Manuel',
        role: 'Presidente do Conselho de Administração',
        source: src(
          'Expansão: Leonildo Manuel é o novo PCA da AGT',
          'https://expansao.co.ao/angola/detalhe/leonildo-manuel-e-o-novo-pca-da-agt-74610.html',
        ),
      },
    ],
  },
  'instituto-nacional-de-emprego-e-formacao-profissional-inefop': { ...typical('estado') },

  // Technology
  'tis-tech-angola': {
    ...typical('telecom'),
    people: [
      {
        name: 'William de Oliveira',
        role: 'CEO',
        source: src(
          'Forbes África Lusófona, 12/07/2026',
          `${FORBES}/adn-tis-2026-integra-30-estagiarios-para-aproximar-jovens-angolanos-do-mercado-de-trabalho/`,
        ),
      },
    ],
    quotes: TIS_QUOTES,
  },
}

/** The links (site and socials) merged under the details: a detail wins over a link for the same key. */
export const DIRECTORY: Record<string, Extra> = Object.fromEntries(
  [...new Set([...Object.keys(LINKS), ...Object.keys(DETAILS)])].map((id) => [
    id,
    { ...LINKS[id], ...DETAILS[id] },
  ]),
)
