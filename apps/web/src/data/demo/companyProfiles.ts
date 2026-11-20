import type { Company, CompanyFact, CompanyPerson, CompanyRole, SourceLink } from '../types'
import { CAREER_SUMMARIES } from './careers'
import { DIRECTORY } from './companyDirectory'

// What we know of each company beyond its card, by id (docs/recolha-de-dados.md, "Empresas", 13/11/2026):
// - activities: its lines of business, from the company itself or the press, with that source;
// - founded and employees: only with a source ("≈" only where the source says it);
// - roles: the posts it advertised, with the ad; without them the app reads them from its careers;
// - people: leadership and public spokespeople only, each post confirmed in an official source or the press.
//   The LinkedIn link only when a web search result's title shows the same name and company (never scraped).
//   No minors, no ordinary employees, no personal contacts. Without a source, the person stays out.
// Logos and covers: assets/companies/<id>-logo.webp and <id>-banner-800.webp, from scrapers/catalog/company_images.csv.

type Profile = Pick<
  Company,
  'activities' | 'activitiesSource' | 'founded' | 'employees' | 'socials' | 'roles' | 'people'
>

const VA = 'https://www.verangola.net/va'
const FORBES = 'https://forbesafricalusofona.com'

const fact = (value: string, source: SourceLink): CompanyFact => ({ value, source })
const person = (name: string, role: string, source: SourceLink, linkedin?: string): CompanyPerson => ({
  name,
  role,
  source,
  ...(linkedin ? { profile: { label: 'LinkedIn', url: linkedin } } : {}),
})
const role = (title: string, careers: string[], source?: SourceLink): CompanyRole => ({
  title,
  careers,
  ...(source ? { source } : {}),
})

const UNITEL_CALL: SourceLink = {
  label: 'beBee, candidatura espontânea da Unitel (2026)',
  url: 'https://bebee.com/ao/jobs/oportunidades-de-carreira-candidatura-espontanea-unitel-luanda--ss-ao-h4md4k',
}
const BAI_ADS: SourceLink = {
  label: 'Jobartis, anúncios do BAI',
  url: 'https://www.jobartis.com/vagas-emprego/BAI+(Banco+Angolano+de+Investimentos)',
}
const AFRICELL_2021: SourceLink = {
  label: 'Ver Angola, 2021',
  url: `${VA}/pt/022021/Telecomunicacoes/23946/Africell-abre-recrutamento-online-Há-vagas-para-técnicos-comerciais-e-gestores.htm`,
}
const ANGOLA_LNG_ADS: SourceLink = {
  label: 'Angorecruta: vagas da Angola LNG (Julho de 2026)',
  url: 'https://angorecruta.com/a-angola-lng-abre-vagas-de-emprego-em-diversas-areas/',
}

const PROFILES: Record<string, Profile> = {
  unitel: {
    activities: ['Rede móvel (voz e SMS)', 'Internet móvel', 'Telefone fixo'],
    activitiesSource: {
      label: 'Wikipédia: Unitel (Angola)',
      url: 'https://en.wikipedia.org/wiki/Unitel_(Angola)',
    },
    founded: fact('1998', {
      label: 'Wikipédia: Unitel (Angola)',
      url: 'https://en.wikipedia.org/wiki/Unitel_(Angola)',
    }),
    roles: [
      role('Tecnologia', ['tecnico-de-telecomunicacoes', 'engenheiro-de-telecomunicacoes'], UNITEL_CALL),
      role('Comercial e atendimento ao cliente', ['gestor-comercial', 'tecnico-comercial'], UNITEL_CALL),
      role('Compras', ['tecnico-de-compras'], UNITEL_CALL),
      role(
        'Marketing e comunicação',
        ['gestor-de-marketing', 'gestor-de-marketing-digital', 'assessor-de-comunicacao'],
        UNITEL_CALL,
      ),
      role('Jurídico', ['jurista'], UNITEL_CALL),
      role('Finanças e auditoria', ['analista-financeiro', 'auditor-interno'], UNITEL_CALL),
      role('Recursos humanos', ['tecnico-de-recursos-humanos'], UNITEL_CALL),
      role('Risco, fraude e segurança', ['analista-de-risco', 'analista-de-ciberseguranca'], UNITEL_CALL),
    ],
    people: [
      person('Aguinaldo Jaime', 'Presidente do Conselho de Administração', {
        label: 'Notícias ao Minuto / Lusa, 29/07/2026',
        url: 'https://www.noticiasaominuto.com/mundo/3029132/servicos-da-unitel-devem-ser-restabelecidos-ainda-hoje-diz-presidente',
      }),
    ],
  },
  africell: {
    roles: [
      role('Técnico de rede', ['tecnico-de-telecomunicacoes'], AFRICELL_2021),
      role('Comercial', ['comercial-de-ti'], AFRICELL_2021),
    ],
    people: [
      person(
        'Jorge Vazquez',
        'CEO da Africell Angola',
        {
          label: 'Africell, 29/07/2026',
          url: 'https://www.africell.com/news/angola-network-statement-july-2026/',
        },
        'https://www.linkedin.com/in/jorge-vazquez-38964648/',
      ),
    ],
  },
  'angola-cables': {
    activities: [
      'Cabos submarinos internacionais',
      'Interligação e trânsito de internet',
      'Cloud e cópias de segurança (Clouds2Africa, Backup2Africa)',
      'Apoio a pequenos operadores (ACeleraNet)',
    ],
    activitiesSource: {
      label: 'Ver Angola, 30/04/2026',
      url: `${VA}/en/042026/Technology/48642/Angola-Cables-CEO-receives-AICEP-Leadership-Award-2026.htm`,
    },
    socials: { linkedin: 'https://www.linkedin.com/company/angola-cables' },
    people: [
      person('Ângelo Gama', 'CEO (desde 2020)', {
        label: 'Ver Angola, 30/04/2026',
        url: `${VA}/en/042026/Technology/48642/Angola-Cables-CEO-receives-AICEP-Leadership-Award-2026.htm`,
      }),
    ],
  },
  bai: {
    founded: fact('1996', {
      label: 'Wikipédia: Banco Angolano de Investimentos',
      url: 'https://en.wikipedia.org/wiki/Banco_Angolano_de_Investimentos',
    }),
    roles: [
      role('Gestor de clientes', ['gestor-de-clientes-bancario'], BAI_ADS),
      role('Tesouraria', ['tesoureiro'], BAI_ADS),
      role('Cibersegurança', ['analista-de-ciberseguranca'], BAI_ADS),
      role('Compliance', ['tecnico-de-compliance'], BAI_ADS),
      role('Recursos humanos', ['tecnico-de-recursos-humanos'], BAI_ADS),
    ],
    people: [
      person('Juvelino Domingos', 'CEO', {
        label: 'Ver Angola, 04/11/2026',
        url: `${VA}/en/112026/BankingInsurance/50656/BAI-leads-bilateral-and-multilateral-meetings-at-the-Africa-Financial-Summit-2026.htm`,
      }),
    ],
  },
  bfa: {
    activities: [
      'Particulares',
      'Empresas',
      'Private Banking',
      'Pensões',
      'Mercado de capitais',
      'Gestão de activos',
    ],
    activitiesSource: { label: 'Site oficial', url: 'https://www.bfa.ao' },
    employees: fact('2 519 (fim de 2025)', {
      label: 'BFA, relatório de actividade 4T 2025',
      url: 'https://www.bfa.ao/media/7945/bfa-relato-rio-de-actividade-4t-2025.pdf',
    }),
    people: [
      person('Maria do Carmo Bernardo', 'Presidente do Conselho de Administração (proposta para 2026-2029)', {
        label: 'Forbes África Lusófona, 21/03/2026',
        url: `${FORBES}/?p=170292`,
      }),
      person('Luís Roberto Fernandes Gonçalves', 'Presidente da Comissão Executiva', {
        label: 'Forbes África Lusófona, 21/03/2026',
        url: `${FORBES}/?p=170292`,
      }),
    ],
  },
  'banco-bic': {
    people: [
      person('Hugo da Silva Teles', 'Presidente da Comissão Executiva', {
        label: 'Banco BIC, relatório e contas',
        url: 'https://www.bancobic.ao/dotAsset/9c433c8defa5c9cafb3d9c493329becb.pdf',
      }),
    ],
  },
  atlantico: {
    people: [
      person('Elpídio Neto', 'Presidente do Conselho de Administração', {
        label: 'Forbes África Lusófona, 31/03/2025',
        url: `${FORBES}/?p=153821`,
      }),
      person('Isabel Espírito Santo', 'Presidente da Comissão Executiva', {
        label: 'Forbes África Lusófona, 31/03/2025',
        url: `${FORBES}/?p=153821`,
      }),
    ],
  },
  'standard-bank': {
    people: [
      person('Luís Teles', 'CEO do Standard Bank de Angola', {
        label: 'Forbes África Lusófona, 05/03/2026',
        url: `${FORBES}/?p=169574`,
      }),
    ],
  },
  'banco-de-poupanca-e-credito-bpc': {
    people: [
      person('Cláudio Pinheiro', 'Presidente do Conselho de Administração', {
        label: 'Forbes África Lusófona: resultados de 2025',
        url: `${FORBES}/bpc-regista-um-resultado-liquido-de-4-mil-milhoes-de-kwanzas-em-2025/`,
      }),
    ],
  },
  sonangol: {
    activities: [
      'Prospecção e produção de petróleo e gás',
      'Transporte e comercialização',
      'Refinação',
      'Armazenagem e distribuição de combustíveis',
      'Petroquímica',
    ],
    activitiesSource: { label: 'Sonangol, Sobre nós', url: 'https://www.sonangol.co.ao/sobre-nos/' },
    founded: fact('1976', { label: 'Sonangol, Sobre nós', url: 'https://www.sonangol.co.ao/sobre-nos/' }),
    people: [
      person('Sebastião Gaspar Martins', 'Presidente do Conselho de Administração', {
        label: 'Forbes África Lusófona, 2026',
        url: `${FORBES}/sonangol-revela-que-galp-prepara-novo-investimento-em-angola/`,
      }),
    ],
  },
  taag: {
    founded: fact('1938', {
      label: 'Wikipédia: TAAG Angola Airlines',
      url: 'https://en.wikipedia.org/wiki/TAAG_Angola_Airlines',
    }),
    people: [
      person('Clóvis Rosa', 'Presidente do Conselho de Administração', {
        label: 'Forbes África Lusófona, 27/08/2026',
        url: `${FORBES}/?p=175653`,
      }),
      person(
        'Miguel Carneiro',
        'Presidente da Comissão Executiva',
        { label: 'Forbes África Lusófona, 27/08/2026', url: `${FORBES}/?p=175653` },
        'https://www.linkedin.com/in/miguel-carneiro-66901934/',
      ),
    ],
  },
  endiama: {
    people: [
      person('José Manuel Ganga Júnior', 'Presidente do Conselho de Administração', {
        label: 'Ver Angola, 23/04/2026',
        url: `${VA}/pt/042026/MateriasPrimas/48562/Sociedade-Mineira-do-Chiri-Endiama-e-Rio-Tinto-v%C3%A3o-explorar-diamantes-na-Lunda-Sul.htm`,
      }),
    ],
  },
  'sociedade-mineira-de-catoca': {
    people: [
      person('Pedro Inácio Velasco Galiano', 'Director-geral e CEO', {
        label: 'Forbes África Lusófona, 25/04/2026',
        url: `${FORBES}/?p=171564`,
      }),
    ],
  },
  totalenergies: {
    people: [
      person('Martin Deffontaines', 'Managing Director e Country Chair da TotalEnergies em Angola', {
        label: 'African Energy Week, 10/06/2026',
        url: 'https://aecweek.com/news/totalenergies-country-managers-join-aew-2026-large-scale-oil-projects-take-shape',
      }),
    ],
  },
  'azule-energy': {
    people: [
      person('Joe Murphy', 'CEO (desde 1 de Dezembro de 2025)', {
        label: 'Azule Energy, About us',
        url: 'https://www.azule-energy.com/about',
      }),
    ],
  },
  'angola-lng': {
    roles: [
      role('Engenharia de processos', ['engenheiro-de-processos-de-refinacao'], ANGOLA_LNG_ADS),
      role('Operação da fábrica', ['operador-de-producao-petrolifera'], ANGOLA_LNG_ADS),
      role('Manutenção mecânica', ['tecnico-de-manutencao-mecanica'], ANGOLA_LNG_ADS),
      role('Instrumentação', ['tecnico-de-instrumentacao'], ANGOLA_LNG_ADS),
    ],
  },
  'empresa-nacional-de-distribuicao-de-electricidade-ende': {
    people: [
      person('Pedro Buca', 'Presidente do Conselho de Administração', {
        label: 'ANGOP, 29/05/2026',
        url: 'https://angop.ao/noticias/economia/pca-da-ende-realca-progressos-no-sector-energetico/',
      }),
    ],
  },
}

const FILES = import.meta.glob<string>('../../assets/companies/*-{logo,banner-800}.webp', {
  eager: true,
  import: 'default',
})

const MIN_SUMMARY = 60
const union = <T>(...lists: (T[] | undefined)[]): T[] => [...new Set(lists.flatMap((list) => list ?? []))]

/**
 * The card first, the directory's collected facts over it (companyDirectory.ts) and, over both, the sourced
 * profile above: a figure or a leader that a source states is never replaced by our reading of the business.
 */
function complete(company: Company): Company {
  const found = DIRECTORY[company.id] ?? {}
  const profile: Partial<Company> = PROFILES[company.id] ?? {}
  const careers = company.careersSourced ? company.careers : union(company.careers, found.careers)
  const own = profile.roles ?? []
  const roles = [
    ...own,
    ...(found.roles ?? []).filter((post) => !own.some((role) => role.title === post.title)),
  ]
  const names = new Set((profile.people ?? []).map((person) => person.name))
  const people = [
    ...(profile.people ?? []),
    ...(found.people ?? []).filter((person) => !names.has(person.name)),
  ]
  const website = company.website ?? found.website
  return {
    ...company,
    summary: company.summary.length >= MIN_SUMMARY ? company.summary : (found.summary ?? company.summary),
    ...(website ? { website } : {}),
    ...(found.activities ? { activities: found.activities, activitiesSource: found.activitiesSource } : {}),
    ...(found.founded ? { founded: found.founded } : {}),
    ...(found.employees ? { employees: found.employees } : {}),
    ...(found.headquarters ? { headquarters: found.headquarters } : {}),
    ...profile,
    ...(found.socials || profile.socials ? { socials: { ...found.socials, ...profile.socials } } : {}),
    careers,
    areas: [
      ...new Set(
        CAREER_SUMMARIES.filter((career) => careers.includes(career.slug)).map((career) => career.group),
      ),
    ],
    programs: [...company.programs, ...(found.programs ?? [])],
    partners: union(company.partners, found.partners),
    ...(roles.length ? { roles } : {}),
    ...(people.length ? { people } : {}),
    ...(found.quotes ? { quotes: found.quotes } : {}),
    ...(found.estimated ? { estimated: true } : {}),
  }
}

/** Each company with its profile and, when it has none yet, the logo and cover found for it. */
export function withProfiles(companies: Company[]): Company[] {
  return companies.map((card) => {
    const company = complete(card)
    const logo = company.logo ?? FILES[`../../assets/companies/${company.id}-logo.webp`]
    const banner = company.banner ?? FILES[`../../assets/companies/${company.id}-banner-800.webp`]
    return {
      ...company,
      ...(logo ? { logo } : {}),
      ...(banner ? { banner } : {}),
    }
  })
}
