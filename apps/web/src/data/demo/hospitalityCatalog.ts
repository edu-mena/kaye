import catalog from '../catalog/hospitality.json'
import { buildArea, type AreaData } from './areaCatalog'
import { CAREER_SUMMARIES } from './careers'

// Tourism and hospitality, from scrapers/catalog/hospitality.json (python -m catalog.hospitality): every higher
// education institution with tourism or hotel management courses (MESCTI yearbook 2023-2024) and the employers: the
// ministry and a hotel group (each with its source) and the hotels with most job ads.

const SUMMARIES: Record<string, string> = {
  ministerio:
    'Define a política do turismo, licencia e fiscaliza os hotéis e as agências e promove Angola como destino.',
  hotel: 'Grupo hoteleiro com hotéis em Luanda, entre eles o Epic Sana.',
}

export const HOSPITALITY = buildArea(catalog as AreaData, {
  careers: CAREER_SUMMARIES,
  courses: 'turismo e hotelaria',
  courseCareers: [
    [/hotel/, ['gestor-hoteleiro', 'recepcionista-de-hotel', 'gestor-de-restauracao']],
    [/turismo/, ['tecnico-de-turismo', 'guia-turistico', 'gestor-hoteleiro']],
  ],
  employs: [
    [/ministerio do turismo/, ['tecnico-de-turismo', 'guia-turistico']],
    [/hotel/, ['gestor-hoteleiro', 'recepcionista-de-hotel', 'chefe-de-cozinha', 'gestor-de-restauracao']],
  ],
  fallback: ['gestor-hoteleiro', 'recepcionista-de-hotel', 'chefe-de-cozinha'],
  sector: 'turismo',
  source: catalog.sources.jobs,
  describe: (employer) =>
    SUMMARIES[employer.kind] ??
    `Publicou ${employer.postings ?? 0} vagas de hotelaria nos sites de emprego angolanos.`,
})
