import africellLogo from '../../assets/companies/africell-logo.webp'
import angolaCablesLogo from '../../assets/companies/angola-cables-logo.webp'
import atlanticoBanner from '../../assets/companies/atlantico-banner-800.webp'
import atlanticoLogo from '../../assets/companies/atlantico-logo.webp'
import baiBanner from '../../assets/companies/bai-banner-800.webp'
import bfaBanner from '../../assets/companies/bfa-banner-800.webp'
import emisBanner from '../../assets/companies/emis-banner-800.webp'
import siemensBanner from '../../assets/companies/siemens-banner-800.webp'
import siemensLogo from '../../assets/companies/siemens-logo.webp'
import sonangolLogo from '../../assets/companies/sonangol-logo.webp'
import taagLogo from '../../assets/companies/taag-logo.webp'
import africellBanner from '../../assets/companies/africell-banner-800.webp'
import baiLogo from '../../assets/companies/bai-logo.svg'
import bicBanner from '../../assets/companies/banco-bic-banner-800.webp'
import bicLogo from '../../assets/companies/banco-bic-logo.svg'
import bfaLogo from '../../assets/companies/bfa-logo.svg'
import emisLogo from '../../assets/companies/emis-logo.svg'
import inovflowLogo from '../../assets/companies/inovflow-logo.webp'
import multitelBanner from '../../assets/companies/multitel-banner-800.webp'
import multitelLogo from '../../assets/companies/multitel-logo.webp'
import paratusBanner from '../../assets/companies/paratus-banner-800.webp'
import paratusLogo from '../../assets/companies/paratus-logo.webp'
import primaveraBanner from '../../assets/companies/primavera-banner-800.webp'
import primaveraLogo from '../../assets/companies/primavera-logo.svg'
import sonangolBanner from '../../assets/companies/sonangol-banner-800.webp'
import standardBankBanner from '../../assets/companies/standard-bank-banner-800.webp'
import taagBanner from '../../assets/companies/taag-banner-800.webp'
import tvCaboBanner from '../../assets/companies/tv-cabo-banner-800.webp'
import tvCaboLogo from '../../assets/companies/tv-cabo-logo.svg'
import unitelLogo from '../../assets/companies/unitel-logo.webp'
import zapLogo from '../../assets/companies/zap-logo.webp'
import type { Company, CompanySector, SourceLink } from '../types'
import { CAREER_SUMMARIES } from './careers'

// REAL companies: public facts only, each with its source (docs/recolha-de-dados.md, 25/10/2026).
// No salaries, vacancies or numbers that no source states. Logos and banners come from each
// company's official site and need its permission before the app goes public.
// From Wikimedia Commons instead: the logos of Angola Cables and Siemens (public domain), Africell
// (Lulucylulucy, CC BY-SA 4.0) and TAAG (TAAG, CC BY-SA 4.0); the photos of BAI (BAI, CC0), Siemens
// (Álvaro de la Paz Franco, CC0) and Atlântico (DiogoC300, CC BY-SA 4.0).

/** Editorial: the careers a sector usually hires for, when no source names them. */
const SECTOR_CAREERS: Record<CompanySector, string[]> = {
  telecomunicacoes: [
    'engenheiro-de-telecomunicacoes',
    'tecnico-de-telecomunicacoes',
    'administrador-de-redes',
  ],
  banca: [
    'analista-de-sistemas',
    'analista-de-ciberseguranca',
    'analista-de-dados',
    'desenvolvedor-backend',
    'desenvolvedor-mobile',
  ],
  tecnologia: ['analista-de-sistemas', 'desenvolvedor-backend', 'tecnico-de-suporte'],
  televisao: ['tecnico-de-telecomunicacoes', 'tecnico-de-suporte', 'gestor-de-marketing-digital'],
  energia: ['analista-de-dados', 'administrador-de-sistemas', 'analista-de-ciberseguranca'],
  industria: ['tecnico-de-hardware', 'analista-de-sistemas'],
  transportes: ['analista-de-sistemas', 'administrador-de-redes', 'tecnico-de-suporte'],
  saude: [
    'medico-clinica-geral',
    'enfermeiro',
    'tecnico-analises-clinicas',
    'tecnico-radiologia',
    'farmaceutico',
  ],
  seguros: ['tecnico-de-seguros', 'actuario', 'analista-de-risco', 'mediador-de-seguros'],
  consultoria: ['auditor', 'consultor-de-gestao', 'contabilista', 'tecnico-de-impostos'],
  estado: ['economista', 'analista-de-estudos-economicos', 'tecnico-de-impostos', 'tecnico-de-compliance'],
  justica: ['juiz', 'procurador', 'oficial-de-justica', 'jurista'],
  comunicacao: ['jornalista', 'editor-de-video', 'tecnico-de-relacoes-publicas'],
  educacao: ['professor-do-ensino-primario', 'professor-de-matematica', 'educador-de-infancia'],
  mineracao: ['engenheiro-de-minas', 'geologo', 'engenheiro-metalurgico'],
  agricultura: ['engenheiro-agronomo', 'tecnico-agropecuario', 'zootecnico'],
  turismo: ['gestor-hoteleiro', 'recepcionista-de-hotel', 'chefe-de-cozinha'],
  comercio: ['tecnico-comercial', 'gestor-de-loja', 'assistente-administrativo', 'tecnico-de-compras'],
}

type CompanyData = Omit<
  Company,
  'province' | 'careers' | 'careersSourced' | 'areas' | 'programs' | 'partners'
> &
  Partial<Pick<Company, 'province' | 'careers' | 'careersSourced' | 'programs' | 'partners'>>

const company = (data: CompanyData): Company => {
  const careers = data.careers ?? SECTOR_CAREERS[data.sector]
  const areas = CAREER_SUMMARIES.filter((career) => careers.includes(career.slug)).map(
    (career) => career.group,
  )
  return {
    province: 'Luanda',
    careersSourced: false,
    programs: [],
    partners: [],
    ...data,
    careers,
    areas: [...new Set(areas)],
  }
}

const VER_ANGOLA = 'https://www.verangola.net/va'
const site = (url: string): SourceLink => ({ label: 'Site oficial', url })
const OPERATORS_2020: SourceLink = {
  label: 'Ver Angola, 2020',
  url: `${VER_ANGOLA}/pt/032020/Telecomunicacoes/18963/Ministro-pede-“paciência”-para-Africell-cumprir-requisitos-do-concurso.htm`,
}
const BAI_CORE_2025: SourceLink = {
  label: 'Ver Angola, 2025',
  url: `${VER_ANGOLA}/pt/082025/BancaSeguros/45433/BAI-inicia-programa-de-transforma%C3%A7%C3%A3o-de-sistemas-de-informa%C3%A7%C3%A3o.htm`,
}
const ISPTEC_2012: SourceLink = {
  label: 'Baguete, 2012',
  url: 'https://baguete.com.br/public/noticias/brasileiros-implantam-instituto-tecnologico-em-angola',
}
const PRIMAVERA_2015: SourceLink = {
  label: 'Ver Angola, 2015',
  url: `${VER_ANGOLA}/pt/092015/Tecnologia/2268/Primavera-tecnológica-convida-desempregados-a-duas-semanas-de-formação-intensiva.htm`,
}

export const COMPANIES: Company[] = [
  company({
    id: 'unitel',
    name: 'Unitel',
    sector: 'telecomunicacoes',
    place: 'Luanda',
    logo: unitelLogo,
    website: 'https://unitel.ao',
    summary: 'Operadora de telemóvel. Em 2020 era a líder do mercado, com cerca de 80% dos clientes.',
    sources: [OPERATORS_2020, site('https://unitel.ao')],
  }),
  company({
    id: 'movicel',
    name: 'Movicel',
    sector: 'telecomunicacoes',
    place: 'Luanda',
    summary: 'Operadora de telemóvel. Em 2020 tinha cerca de 20% do mercado.',
    sources: [OPERATORS_2020],
  }),
  company({
    id: 'angola-telecom',
    name: 'Angola Telecom',
    sector: 'telecomunicacoes',
    place: 'Luanda',
    summary: 'Operadora de telecomunicações do Estado, em privatização (dado de 2020).',
    sources: [OPERATORS_2020],
  }),
  company({
    id: 'africell',
    logo: africellLogo,
    name: 'Africell Angola',
    sector: 'telecomunicacoes',
    place: 'Luanda',
    banner: africellBanner,
    website: 'https://www.africell.ao',
    summary:
      'A quarta operadora de telemóvel do país. Em 2021 recrutou para áreas técnicas, comerciais, de gestão e de mobile money, com CV obrigatório.',
    careers: ['tecnico-de-telecomunicacoes', 'comercial-de-ti'],
    careersSourced: true,
    sources: [
      {
        label: 'Ver Angola, 2021',
        url: `${VER_ANGOLA}/pt/022021/Telecomunicacoes/23946/Africell-abre-recrutamento-online-Há-vagas-para-técnicos-comerciais-e-gestores.htm`,
      },
      site('https://www.africell.ao'),
    ],
  }),
  company({
    id: 'angola-cables',
    logo: angolaCablesLogo,
    name: 'Angola Cables',
    sector: 'telecomunicacoes',
    place: 'Luanda',
    website: 'https://www.angolacables.co.ao',
    summary: 'Cabos submarinos e ligações de internet entre continentes.',
    careers: ['engenheiro-de-telecomunicacoes', 'administrador-de-redes'],
    programs: [
      {
        name: 'AceleraNet',
        summary:
          'Para startups de fornecimento de internet, de preferência fora de Luanda. A 2.ª edição selecionou 27.',
        source: { label: 'Forbes África Lusófona', url: 'https://forbesafricalusofona.com/?p=107728' },
      },
    ],
    sources: [{ label: 'Forbes África Lusófona', url: 'https://forbesafricalusofona.com/?p=107728' }],
  }),
  company({
    id: 'multitel',
    name: 'Multitel',
    sector: 'telecomunicacoes',
    place: 'Luanda',
    logo: multitelLogo,
    banner: multitelBanner,
    website: 'https://www.multitel.co.ao',
    summary: 'Fornecedor de internet e de serviços de telecomunicações.',
    sources: [site('https://www.multitel.co.ao')],
  }),
  company({
    id: 'paratus',
    name: 'Paratus Angola',
    sector: 'telecomunicacoes',
    place: 'Luanda',
    logo: paratusLogo,
    banner: paratusBanner,
    website: 'https://paratus.africa',
    summary: 'Grupo de telecomunicações da África Austral: fibra, satélite e centros de dados.',
    sources: [site('https://paratus.africa')],
  }),
  company({
    id: 'bai',
    banner: baiBanner,
    name: 'Banco BAI',
    sector: 'banca',
    place: 'Luanda',
    logo: baiLogo,
    website: 'https://www.bancobai.ao',
    summary:
      'Banco angolano. Desde agosto de 2025 troca o sistema central do banco (plataforma Essence, da Finastra), com a Innovation Makers.',
    careers: ['analista-de-sistemas', 'administrador-de-base-de-dados', 'gestor-de-projetos-de-ti'],
    programs: [
      {
        name: 'Programa de estágios',
        summary:
          'Estágios pagos, todos os anos, para recém-licenciados angolanos (a fonte é da edição de 2022).',
        source: { label: 'Banco BAI', url: 'https://bancobai.ao/en/about-us/press/news/programa-de-estagio' },
      },
    ],
    sources: [
      BAI_CORE_2025,
      {
        label: 'Ver Angola, 2026',
        url: `${VER_ANGOLA}/pt/062026/BancaSeguros/49113/BAI-reforça-compromisso-com-a-inovação-e-o-desenvolvimento-tecnológico-no-Angotic-2026.htm`,
      },
    ],
  }),
  company({
    id: 'bfa',
    banner: bfaBanner,
    name: 'BFA, Banco de Fomento Angola',
    sector: 'banca',
    place: 'Luanda',
    logo: bfaLogo,
    website: 'https://www.bfa.ao',
    summary:
      'Banco angolano. Abre contas de forma totalmente digital nos balcões e investe em cibersegurança.',
    careers: ['analista-de-ciberseguranca'],
    careersSourced: true,
    sources: [
      { label: 'BFA, apresentação', url: 'https://bfa.ao/media/5265/bfa-apresentacao-institucional.pdf' },
      { label: 'RTP África', url: 'https://rtpafrica.rtp.pt/?p=31654' },
    ],
  }),
  company({
    id: 'banco-bic',
    name: 'Banco BIC',
    sector: 'banca',
    place: 'Luanda',
    logo: bicLogo,
    banner: bicBanner,
    website: 'https://www.bancobic.ao',
    summary: 'Banco comercial angolano.',
    sources: [site('https://www.bancobic.ao')],
  }),
  company({
    id: 'standard-bank',
    name: 'Standard Bank Angola',
    sector: 'banca',
    place: 'Luanda',
    banner: standardBankBanner,
    website: 'https://www.standardbank.co.ao',
    summary: 'Banco do grupo sul-africano Standard Bank.',
    sources: [site('https://www.standardbank.co.ao')],
  }),
  company({
    id: 'atlantico',
    banner: atlanticoBanner,
    name: 'Banco Millennium Atlântico',
    sector: 'banca',
    place: 'Luanda',
    logo: atlanticoLogo,
    website: 'https://www.atlantico.ao',
    summary: 'Banco comercial angolano.',
    sources: [site('https://www.atlantico.ao')],
  }),
  company({
    id: 'banco-sol',
    name: 'Banco Sol',
    sector: 'banca',
    place: 'Luanda',
    website: 'https://www.bancosol.ao',
    summary: 'Banco comercial angolano.',
    sources: [site('https://www.bancosol.ao')],
  }),
  company({
    id: 'emis',
    banner: emisBanner,
    name: 'EMIS',
    sector: 'tecnologia',
    place: 'Luanda',
    logo: emisLogo,
    website: 'https://emis.ao',
    summary: 'Empresa Interbancária de Serviços: gere a rede Multicaixa, que liga os bancos angolanos.',
    careers: [
      'desenvolvedor-backend',
      'analista-de-ciberseguranca',
      'administrador-de-sistemas',
      'engenheiro-devops',
    ],
    sources: [site('https://emis.ao')],
  }),
  company({
    id: 'innovation-makers',
    name: 'Innovation Makers',
    sector: 'tecnologia',
    place: 'Luanda',
    summary: 'Integração de sistemas. É a parceira local do BAI na troca do sistema central do banco.',
    careers: ['analista-de-sistemas', 'administrador-de-base-de-dados', 'engenheiro-de-dados'],
    sources: [BAI_CORE_2025],
  }),
  company({
    id: 'inovflow',
    name: 'Inovflow',
    sector: 'tecnologia',
    place: 'Talatona, Luanda',
    logo: inovflowLogo,
    website: 'https://www.inovflow.pt',
    summary:
      'Tecnológica portuguesa de software de gestão (parceira da Cegid). Abriu escritório em Talatona em setembro de 2025, com 13 pessoas.',
    careers: ['analista-de-sistemas', 'tecnico-de-suporte', 'formador-de-tic'],
    sources: [
      {
        label: 'Ver Angola, 2025',
        url: `${VER_ANGOLA}/en/092025/Technology/45820/Portuguese-technology-company-Inovflow-enters-the-Angolan-market.htm`,
      },
      site('https://www.inovflow.pt'),
    ],
  }),
  company({
    id: 'primavera',
    name: 'Cegid Primavera',
    sector: 'tecnologia',
    place: 'Luanda',
    logo: primaveraLogo,
    banner: primaveraBanner,
    website: 'https://pt.primaverabss.com',
    summary: 'Software de gestão (ERP, faturação, recursos humanos) para pequenas e grandes empresas.',
    careers: ['analista-de-sistemas', 'tecnico-de-suporte', 'formador-de-tic'],
    programs: [
      {
        name: 'Formação intensiva',
        summary:
          'Em 2015 deu duas semanas de formação em Luanda a desempregados, por falta de gente qualificada no seu software.',
        source: PRIMAVERA_2015,
      },
    ],
    sources: [PRIMAVERA_2015, site('https://pt.primaverabss.com')],
  }),
  company({
    id: 'tv-cabo',
    name: 'TV Cabo Angola',
    sector: 'televisao',
    place: 'Luanda',
    logo: tvCaboLogo,
    banner: tvCaboBanner,
    website: 'https://tvcabo.ao',
    summary: 'Televisão por cabo e internet por fibra para casas e empresas.',
    sources: [site('https://tvcabo.ao')],
  }),
  company({
    id: 'zap',
    name: 'ZAP',
    sector: 'televisao',
    place: 'Luanda',
    logo: zapLogo,
    website: 'https://www.zap.co.ao',
    summary: 'Televisão por satélite. Diz ser o maior operador do género em Angola.',
    sources: [site('https://www.zap.co.ao')],
  }),
  company({
    id: 'sonangol',
    logo: sonangolLogo,
    logoOnDark: true,
    name: 'Sonangol',
    sector: 'energia',
    place: 'Luanda',
    banner: sonangolBanner,
    website: 'https://www.sonangol.co.ao',
    summary: 'Sociedade Nacional de Combustíveis de Angola. Foi parceira na criação do ISPTEC.',
    partners: ['isptec'],
    sources: [ISPTEC_2012, site('https://www.sonangol.co.ao')],
  }),
  company({
    id: 'siemens',
    logo: siemensLogo,
    banner: siemensBanner,
    name: 'Siemens',
    sector: 'industria',
    place: 'Luanda',
    summary: 'Engenharia e automação. Montou um laboratório de automação no ISPTEC em 2017.',
    partners: ['isptec'],
    sources: [
      {
        label: 'Ver Angola, 2017',
        url: `${VER_ANGOLA}/pt/112017/CulturaEducacao/10156/Siemens-leva-tecnologia-inovadora-ao-ISPTEC-com-inauguração-de-laboratório-de-automação.htm`,
      },
    ],
  }),
  company({
    id: 'taag',
    logo: taagLogo,
    name: 'TAAG Angola Airlines',
    sector: 'transportes',
    place: 'Luanda',
    banner: taagBanner,
    website: 'https://flytaag.com',
    summary:
      'Companhia aérea angolana. Segundo o site, voa para mais de 35 destinos em África, Europa, América e Ásia.',
    sources: [site('https://flytaag.com')],
  }),
]
