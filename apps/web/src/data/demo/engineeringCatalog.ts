import catalog from '../catalog/engineering.json'
import { buildArea, type AreaData } from './areaCatalog'
import { CAREER_SUMMARIES } from './careers'

// Engineering and construction, from scrapers/catalog/engineering.json (python -m catalog.engineering): every higher
// education institution with engineering or architecture courses (MESCTI yearbook 2023-2024) and the employers: the
// ministries, the engineering laboratory, the electricity companies and the builders (each with its source) and those
// with most job ads.

const SUMMARIES: Record<string, string> = {
  obras_publicas:
    'Planeia e fiscaliza as obras públicas, o urbanismo e a habitação: estradas, pontes e edifícios do Estado.',
  energia_aguas:
    'Dirige a produção e a distribuição de electricidade e o abastecimento de água em todo o país.',
  laboratorio:
    'Ensaia os solos e os materiais das obras e estuda as estruturas, para o Estado e para as construtoras.',
  distribuicao:
    'Leva a electricidade às casas e às empresas: as redes, os contadores e as ligações, em todas as províncias.',
  producao: 'Produz a electricidade do país nas barragens e nas centrais térmicas e solares.',
  construtora: 'Constrói estradas, pontes, edifícios e infra-estruturas em Angola.',
}

export const ENGINEERING = buildArea(catalog as AreaData, {
  careers: CAREER_SUMMARIES,
  courses: 'engenharia e arquitectura',
  courseCareers: [
    [/urbanismo|planeamento/, ['arquitecto', 'urbanista', 'desenhador-projectista']],
    [/arquitectura/, ['arquitecto', 'desenhador-projectista']],
    [/hidraulica|recursos hidricos|saneamento/, ['engenheiro-hidraulico']],
    [/geografica/, ['topografo', 'engenheiro-civil']],
    [
      /construc|civil|fortificacoes/,
      ['engenheiro-civil', 'tecnico-de-obras', 'medidor-orcamentista', 'topografo'],
    ],
    [/mecatronica/, ['engenheiro-mecatronico', 'engenheiro-de-manutencao']],
    [/electromecanica/, ['engenheiro-de-manutencao', 'engenheiro-electrotecnico', 'tecnico-electricista']],
    [
      /electrotecnica|electrica|electricos/,
      ['engenheiro-electrotecnico', 'tecnico-electricista', 'engenheiro-de-energias-renovaveis'],
    ],
    [/energetica/, ['engenheiro-de-energias-renovaveis', 'engenheiro-electrotecnico']],
    [
      /quimica/,
      ['engenheiro-quimico', 'engenheiro-de-processos-de-refinacao', 'tecnico-de-seguranca-no-trabalho'],
    ],
    [/naval/, ['engenheiro-mecanico', 'engenheiro-de-manutencao']],
    [/mecanica/, ['engenheiro-mecanico', 'engenheiro-de-manutencao', 'engenheiro-de-producao-industrial']],
    [
      /industrial|producao|manutencao/,
      ['engenheiro-de-producao-industrial', 'engenheiro-de-manutencao', 'tecnico-de-seguranca-no-trabalho'],
    ],
  ],
  employs: [
    [/obras publicas/, ['engenheiro-civil', 'arquitecto', 'urbanista', 'topografo']],
    [
      /energia e aguas/,
      ['engenheiro-electrotecnico', 'engenheiro-hidraulico', 'engenheiro-de-energias-renovaveis'],
    ],
    [/laboratorio de engenharia/, ['engenheiro-civil', 'tecnico-de-obras', 'engenheiro-quimico']],
    [/electricidade/, ['engenheiro-electrotecnico', 'tecnico-electricista', 'engenheiro-de-manutencao']],
  ],
  fallback: [
    'engenheiro-civil',
    'tecnico-de-obras',
    'medidor-orcamentista',
    'tecnico-de-seguranca-no-trabalho',
  ],
  sector: 'industria',
  source: catalog.sources.jobs,
  describe: (employer) =>
    SUMMARIES[employer.kind] ??
    `Publicou ${employer.postings ?? 0} vagas de engenharia e construção nos sites de emprego angolanos.`,
})
