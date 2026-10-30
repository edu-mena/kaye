import catalog from '../catalog/agriculture.json'
import { buildArea, type AreaData } from './areaCatalog'
import { CAREER_SUMMARIES } from './careers'

// Agriculture, fisheries and the environment, from scrapers/catalog/agriculture.json (python -m catalog.agriculture):
// every higher education institution with agronomy, forestry, veterinary, fisheries or environment courses (MESCTI
// yearbook 2023-2024) and the employers: the ministries, the agrarian and forestry institutes, the weather service
// and the agro-industry, each with its source.

const SUMMARIES: Record<string, string> = {
  agricultura: 'Define a política da agricultura, da pecuária e das florestas e apoia os produtores.',
  pescas: 'Gere a pesca, a aquicultura e os recursos do mar e fiscaliza as capturas.',
  desenvolvimento_agrario:
    'Apoia os agricultores familiares com extensão rural, sementes e formação, em todo o país.',
  florestal: 'Gere as florestas do país: o licenciamento do corte, a replantação e a fiscalização.',
  meteorologia: 'O serviço nacional de meteorologia: observa o tempo e o clima e faz as previsões.',
  agroindustria: 'Cultiva cana-de-açúcar e produz açúcar, etanol e electricidade, em Malanje.',
}

export const AGRICULTURE = buildArea(catalog as AreaData, {
  careers: CAREER_SUMMARIES,
  courses: 'agricultura, pescas e ambiente',
  courseCareers: [
    [/agro.alimentar/, ['engenheiro-agroalimentar', 'tecnico-de-qualidade-alimentar']],
    [
      /pescado|aquicultura|recursos marinhos/,
      ['tecnico-de-aquicultura', 'tecnico-de-pescas', 'biologo-marinho'],
    ],
    [/biologia marinha/, ['biologo-marinho', 'oceanografo', 'tecnico-de-aquicultura']],
    [/veterinaria/, ['medico-veterinario']],
    [/zootecnia|agropecuaria/, ['zootecnico', 'tecnico-agropecuario']],
    [/florestal/, ['engenheiro-florestal', 'tecnico-de-conservacao-da-natureza']],
    [/ambiente|recursos naturais/, ['engenheiro-do-ambiente', 'tecnico-de-ambiente']],
    [/gestao|economia/, ['gestor-de-empresas-agricolas', 'economista']],
    [/agronom|agraria/, ['engenheiro-agronomo', 'tecnico-agropecuario']],
  ],
  employs: [
    [
      /agricultura|desenvolvimento agrario/,
      ['engenheiro-agronomo', 'tecnico-agropecuario', 'medico-veterinario'],
    ],
    [/pescas/, ['tecnico-de-pescas', 'tecnico-de-aquicultura', 'biologo-marinho']],
    [/florestal/, ['engenheiro-florestal', 'tecnico-de-conservacao-da-natureza']],
    [/meteorologia/, ['meteorologista', 'fisico']],
    [/bioenergia/, ['engenheiro-agronomo', 'tecnico-agropecuario', 'engenheiro-quimico']],
  ],
  fallback: ['engenheiro-agronomo', 'tecnico-agropecuario'],
  sector: 'agricultura',
  source: catalog.sources.jobs,
  describe: (employer) => SUMMARIES[employer.kind] ?? '',
})
