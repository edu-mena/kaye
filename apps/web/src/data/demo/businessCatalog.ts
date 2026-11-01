import catalog from '../catalog/business.json'
import { buildArea, type AreaData } from './areaCatalog'
import { BUSINESS_CAREERS } from './businessCareers'

// Management, finance and trade, from scrapers/catalog/business.json (python -m catalog.business): every higher
// education institution with the area's courses (MESCTI yearbook 2023-2024), the banking schools, and the
// employers: banks, insurers, auditors and the State's finance bodies (each with its source) and the companies
// with most job ads.

const BANK = [
  'gestor-de-clientes-bancario',
  'operador-de-caixa-bancario',
  'analista-de-credito',
  'analista-de-risco',
  'tecnico-de-compliance',
]
const CORPORATE = [
  'assistente-administrativo',
  'secretario-executivo',
  'tecnico-comercial',
  'gestor-comercial',
  'gestor-de-marketing',
  'gestor-de-empresas',
  'contabilista',
  'tecnico-de-contabilidade',
  'analista-financeiro',
  'controller-de-gestao',
  'tesoureiro',
  'auditor-interno',
  'tecnico-de-compras',
  'tecnico-de-recursos-humanos',
  'gestor-de-recursos-humanos',
  'tecnico-de-recrutamento',
  'tecnico-de-salarios',
]
const SUMMARIES: Record<string, string> = {
  retalho: 'Cadeia de supermercados em Angola.',
  banco: 'Banco comercial a operar em Angola.',
  banco_publico: 'Banco público, um dos seis bancos sistémicos do país segundo o BNA.',
  seguradora: 'Seguradora, entre as maiores do mercado segundo a ARSEG.',
  seguradora_publica: 'Seguradora pública, a maior do país segundo a ARSEG.',
  resseguradora: 'A primeira resseguradora nacional, registada na ARSEG.',
  auditora: 'Auditora e consultora, uma das quatro grandes do mundo, com escritório em Angola.',
  regulador: 'Entidade que regula ou organiza o sistema financeiro.',
  publico: 'Organismo público das finanças do Estado.',
}

export const BUSINESS = buildArea(catalog as AreaData, {
  careers: BUSINESS_CAREERS,
  courses: 'gestão, finanças e comércio',
  courseCareers: [
    [
      /recursos humanos e marketing/,
      ['tecnico-de-recursos-humanos', 'gestor-de-marketing', 'gestor-de-marketing-digital'],
    ],
    [
      /recursos humanos/,
      [
        'tecnico-de-recursos-humanos',
        'gestor-de-recursos-humanos',
        'tecnico-de-recrutamento',
        'tecnico-de-salarios',
      ],
    ],
    [/bancari|banca/, BANK],
    [/fiscal|auditoria/, ['contabilista', 'auditor', 'auditor-interno', 'tecnico-de-impostos']],
    [
      /contabil/,
      ['contabilista', 'tecnico-de-contabilidade', 'auditor', 'tecnico-de-impostos', 'tecnico-de-cobrancas'],
    ],
    [
      /financ/,
      [
        'analista-financeiro',
        'tesoureiro',
        'controller-de-gestao',
        'analista-de-investimentos',
        'tecnico-de-seguros',
        'actuario',
      ],
    ],
    [/^economia|economic/, ['economista', 'analista-de-estudos-economicos', 'analista-financeiro']],
    [
      /marketing|comercial/,
      [
        'tecnico-comercial',
        'gestor-comercial',
        'gestor-de-marketing',
        'gestor-de-marketing-digital',
        'gestor-de-loja',
      ],
    ],
    [/secretariado/, ['secretario-executivo', 'assistente-administrativo']],
    [
      /gestao|administracao|organizacao/,
      ['gestor-de-empresas', 'consultor-de-gestao', 'assistente-administrativo'],
    ],
  ],
  employs: [
    [
      /pep angola|shoprite|kero/,
      ['gestor-de-loja', 'tecnico-comercial', 'tecnico-de-compras', 'gestor-de-recursos-humanos'],
    ],
    [
      /africa global|wange/,
      [
        'tecnico-de-comercio-internacional',
        'tecnico-de-compras',
        'tecnico-comercial',
        'assistente-administrativo',
      ],
    ],
    [
      /banco|bank/,
      [
        ...BANK,
        'analista-financeiro',
        'auditor-interno',
        'tecnico-de-cobrancas',
        'analista-de-estudos-economicos',
        'gestor-de-programas-e-portfolio',
      ],
    ],
    [/segur|mulemba/, ['tecnico-de-seguros', 'actuario', 'mediador-de-seguros', 'analista-de-risco']],
    [/deloitte|pwc|ey angola|kpmg|audit|consult/, ['auditor', 'consultor-de-gestao', 'tecnico-de-impostos']],
    [/tributaria|ministerio das financas/, ['tecnico-de-impostos', 'economista', 'auditor', 'contabilista']],
    [
      /bna|bodiva|mercado de capitais|regulacao|soberano/,
      ['economista', 'analista-de-investimentos', 'analista-de-estudos-economicos', 'tecnico-de-compliance'],
    ],
  ],
  fallback: CORPORATE,
  sector: 'comercio',
  source: catalog.sources.jobs,
  describe: (employer) =>
    SUMMARIES[employer.kind] ??
    `Publicou ${employer.postings ?? 0} vagas de gestão, finanças e vendas nos sites de emprego angolanos.`,
})
