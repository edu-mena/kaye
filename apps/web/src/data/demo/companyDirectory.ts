import type { Company, CompanyFact, CompanyInsight, CompanyQuote, SourceLink } from '../types'
import { kindOf, typical, type Kind } from './companyKinds'
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
    | 'insights'
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

/** The kind's posts and study, plus notes that a public source states about this company. */
const withInsights = (kind: Kind, notes: CompanyInsight[]) => {
  const base = typical(kind)
  return { ...base, insights: [...base.insights, ...notes] }
}

const TIS_NOTE: CompanyInsight = {
  title: 'Estágios e contratação',
  text: 'O programa de estágios ADN TIS integrou 165 estagiários desde 2017 e teve uma taxa de contratação de 77% entre 2017 e 2025. A edição de 2026 tem 30 estagiários e chega a Benguela, Namibe, Malanje e Uíge.',
  source: src(
    'Forbes África Lusófona, 12/07/2026',
    `${FORBES}/adn-tis-2026-integra-30-estagiarios-para-aproximar-jovens-angolanos-do-mercado-de-trabalho/`,
  ),
}
const BANCO_SOL_NOTE: CompanyInsight = {
  title: 'Momento do banco',
  text: 'O Banco Sol aprovou um plano de recapitalização e reestruturação (2025–2027) que pode reduzir até 30% dos trabalhadores. Enquanto durar, a entrada de recém-formados será mais difícil; o plano inclui formação para os colaboradores.',
  source: src(
    'Ver Angola, 04/2025',
    `${VA}/pt/042025/BancaSeguros/44244/Banco-Sol-vai-ser-recapitalizado-com-capitais-privados-e-reduzir-até-30-por-cento-de-trabalhadores.htm`,
  ),
}
const STANDARD_NOTE: CompanyInsight = {
  title: 'Banco cotado em bolsa',
  text: 'Em 2026 o Standard Bank de Angola entrou na bolsa (BODIVA). Uma empresa cotada pede mais rigor e transparência, e o banco tem um programa de graduados para recém-licenciados.',
  source: src(
    'Expansão, 09/2026',
    'https://expansao.co.ao/empresas/detalhe/ring-the-bell-standard-bank-angola-entra-oficialmente-na-bolsa-de-valores-75027.html',
  ),
}
const TAAG_NOTES: CompanyInsight[] = [
  {
    title: 'Formação de pilotos',
    text: 'A segunda edição do programa de formação inicial de pilotos cadetes vai beneficiar até 70 jovens angolanos, com possibilidade de integração nos quadros de pessoal navegante técnico. A selecção dos candidatos é conduzida pela Academia BAI.',
    source: src(
      'Ver Angola, 11/2025',
      `${VA}/pt/112025/Transportes/46646/TAAG-lança-nova-edição-de-programa-que-quer-formar-“próxima-geração-de-pilotos”.htm`,
    ),
  },
  {
    title: 'Estágios',
    text: 'A TAAG e a H2AIR formalizaram um protocolo de cooperação para a capacitação de estagiários (80, segundo o título da notícia).',
    source: src('Forbes África Lusófona, 21/03/2026', `${FORBES}/?p=170241`),
  },
]

/** The showcase companies and the other facts we could source, by company id. */
const DETAILS: Record<string, Extra> = {
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
    ...withInsights('banco', [STANDARD_NOTE]),
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
    ...withInsights('banco', [BANCO_SOL_NOTE]),
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
  taag: { ...withInsights('transporte', TAAG_NOTES) },
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
    ...withInsights('tecnologia', [TIS_NOTE]),
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
const DIRECTORY: Record<string, Extra> = Object.fromEntries(
  [...new Set([...Object.keys(LINKS), ...Object.keys(DETAILS)])].map((id) => [
    id,
    { ...LINKS[id], ...DETAILS[id] },
  ]),
)

/**
 * What we know about a company beyond its card: the collected facts over the kind's posts and study, plus what
 * its own card says (programmes, public vacancies, province).
 */
export function directoryFor(company: Company): Extra {
  const found = DIRECTORY[company.id] ?? {}
  const base: Extra = found.roles ? found : { ...typical(kindOf(company)), ...found }
  const own: CompanyInsight[] = company.programs.map((program) => ({
    title: 'Programa para jovens',
    text: `${program.name}: ${program.summary}`,
    source: program.source,
  }))
  if (company.careersSourced) {
    own.push({
      title: 'Vagas já anunciadas',
      text: 'A empresa já anunciou vagas publicamente para estas carreiras (ver as fontes). Candidata-te ao tipo de vaga que já abriu.',
    })
  }
  if (company.province !== 'Luanda') {
    own.push({
      title: 'Fora de Luanda',
      text: `Fica em ${company.province}: há menos vagas do que em Luanda, mas também menos concorrência. Mostra que podes ficar na província.`,
      estimated: true,
    })
  }
  return { ...base, insights: [...(base.insights ?? []), ...own] }
}
