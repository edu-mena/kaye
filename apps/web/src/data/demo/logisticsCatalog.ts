import catalog from '../catalog/logistics.json'
import { buildArea, type AreaData } from './areaCatalog'
import { CAREER_SUMMARIES } from './careers'

// Logistics and transport, from scrapers/catalog/logistics.json (python -m catalog.logistics): every higher education
// institution with logistics or transport courses (MESCTI yearbook 2023-2024) and the employers: the ministry, the civil
// aviation authority, the ports and the railway, each with its source.

const SUMMARIES: Record<string, string> = {
  ministerio:
    'Define a política dos transportes por estrada, caminho-de-ferro, mar e ar e tutela as empresas públicas do sector.',
  aviacao: 'Regula e fiscaliza a aviação civil: as companhias aéreas, os aeroportos, os pilotos e os aviões.',
  porto: 'Recebe os navios e movimenta os contentores e a carga que entram e saem do país.',
  caminho_de_ferro:
    'Transporta passageiros e mercadorias entre o Lobito e o interior, até à fronteira leste.',
}

export const LOGISTICS = buildArea(catalog as AreaData, {
  careers: CAREER_SUMMARIES,
  courses: 'logística e transportes',
  courseCareers: [
    [/engenharia/, ['engenheiro-de-transportes', 'gestor-de-logistica']],
    [
      /logistica/,
      ['gestor-de-logistica', 'tecnico-de-logistica', 'tecnico-de-transportes', 'despachante-aduaneiro'],
    ],
  ],
  employs: [
    [
      /ministerio dos transportes/,
      ['tecnico-de-transportes', 'engenheiro-de-transportes', 'inspector-de-aviacao-civil'],
    ],
    [/aviacao civil/, ['inspector-de-aviacao-civil']],
    [/porto/, ['gestor-portuario', 'tecnico-de-logistica', 'despachante-aduaneiro']],
    [/caminho de ferro/, ['tecnico-de-transportes', 'engenheiro-de-transportes', 'engenheiro-mecanico']],
  ],
  fallback: ['gestor-de-logistica', 'tecnico-de-logistica'],
  sector: 'transportes',
  source: catalog.sources.jobs,
  describe: (employer) => SUMMARIES[employer.kind] ?? '',
})
