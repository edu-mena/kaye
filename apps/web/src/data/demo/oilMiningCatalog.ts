import catalog from '../catalog/oil_mining.json'
import { buildArea, type AreaData } from './areaCatalog'
import { CAREER_SUMMARIES } from './careers'

// Oil, gas and mining, from scrapers/catalog/oil_mining.json (python -m catalog.oil_mining): every higher education
// institution with petroleum, mining, geology or metallurgy courses (MESCTI yearbook 2023-2024) and the employers: the
// oil and gas agency, the ministry, the geological institute and the diamond companies (each with its source) and the
// oil companies and service firms with most job ads.

const SUMMARIES: Record<string, string> = {
  agencia: 'Concede e fiscaliza os blocos de petróleo e gás e acompanha a produção das petrolíferas.',
  ministerio: 'Define a política do petróleo, do gás e dos minerais e fiscaliza o sector.',
  geologico: 'Faz a cartografia geológica do país e estuda onde há minérios e água no subsolo.',
  diamantes:
    'A empresa pública dos diamantes: pesquisa, explora e vende, com outras empresas, os diamantes de Angola.',
  mina: 'Explora a maior mina de diamantes de Angola, na Lunda Sul.',
  petrolifera: 'Produz petróleo e gás no mar de Angola.',
}

export const OIL_MINING = buildArea(catalog as AreaData, {
  careers: CAREER_SUMMARIES,
  courses: 'petróleo, minas e geologia',
  courseCareers: [
    [/refinacao/, ['engenheiro-de-processos-de-refinacao', 'operador-de-producao-petrolifera']],
    [/petroleo/, ['engenheiro-de-petroleos', 'engenheiro-de-perfuracao', 'operador-de-producao-petrolifera']],
    [/metalurg/, ['engenheiro-metalurgico']],
    [/geofisica/, ['geofisico', 'geologo']],
    [/minas/, ['engenheiro-de-minas', 'geologo']],
    [/geolog/, ['geologo', 'engenheiro-de-minas']],
  ],
  employs: [
    [
      /agencia nacional de petroleo/,
      ['engenheiro-de-petroleos', 'geologo', 'geofisico', 'engenheiro-de-minas'],
    ],
    [/recursos minerais/, ['engenheiro-de-petroleos', 'geologo', 'engenheiro-de-minas']],
    [/geologico/, ['geologo', 'geofisico']],
    [
      /endiama/,
      ['engenheiro-de-minas', 'geologo', 'engenheiro-metalurgico', 'tecnico-de-seguranca-no-trabalho'],
    ],
    [
      /catoca/,
      [
        'engenheiro-de-minas',
        'geologo',
        'engenheiro-metalurgico',
        'tecnico-de-seguranca-no-trabalho',
        'operador-de-maquinas-pesadas',
      ],
    ],
    [
      /halliburton|baker hughes/,
      [
        'engenheiro-de-perfuracao',
        'engenheiro-de-petroleos',
        'operador-de-producao-petrolifera',
        'mecanico-de-sonda',
        'tecnico-de-manutencao-mecanica',
      ],
    ],
  ],
  fallback: [
    'engenheiro-de-petroleos',
    'operador-de-producao-petrolifera',
    'tecnico-de-manutencao-mecanica',
    'tecnico-de-instrumentacao',
    'tecnico-de-seguranca-no-trabalho',
  ],
  sector: 'energia',
  source: catalog.sources.jobs,
  describe: (employer) =>
    SUMMARIES[employer.kind] ??
    `Publicou ${employer.postings ?? 0} vagas do sector petrolífero nos sites de emprego angolanos.`,
})
