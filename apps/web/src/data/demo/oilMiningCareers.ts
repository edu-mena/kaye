import type { CareerSummary } from '../types'
import { riasec, summary } from './careerSummary'

// Oil, gas and mining, the eighth area of the catalogue (scrapers/catalog/oil_mining.json): the professions behind the
// petroleum, mining, geology and metallurgy degrees (MESCTI yearbook 2023-2024) and the employers (the oil and gas
// agency, the diamond companies, the oil companies and service firms of the job ads). Interest profiles approximate
// O*NET's. Demand reads the job ads. No salaries: the companies publish none and no State table names these careers.

export const OIL_MINING_CAREERS: CareerSummary[] = [
  summary(
    'engenheiro-de-petroleos',
    'Engenheiro de Petróleos',
    'petroleo_gas',
    'Estuda os reservatórios e planeia como tirar deles o petróleo e o gás. Trabalha nas petrolíferas, na ANPG e nas empresas de serviços, muitas vezes no mar.',
    riasec(0.7, 0.9, 0.15, 0.15, 0.45, 0.6),
    'alta',
    null,
  ),
  summary(
    'engenheiro-de-perfuracao',
    'Engenheiro de Perfuração',
    'petroleo_gas',
    'Planeia e acompanha a perfuração dos poços, em terra e no mar. Trabalha em plataformas e nas empresas de serviços petrolíferos, por turnos.',
    riasec(0.8, 0.8, 0.1, 0.2, 0.45, 0.55),
    'media',
    null,
  ),
  summary(
    'engenheiro-de-processos-de-refinacao',
    'Engenheiro de Refinação',
    'petroleo_gas',
    'Controla os processos que transformam o petróleo em gasolina, gasóleo e gás. Trabalha na refinaria de Luanda e nas novas refinarias do país.',
    riasec(0.65, 0.85, 0.1, 0.15, 0.4, 0.7),
    'baixa',
    null,
  ),
  summary(
    'operador-de-producao-petrolifera',
    'Operador de Produção Petrolífera',
    'petroleo_gas',
    'Opera e vigia os equipamentos que separam e bombeiam o petróleo nas plataformas. Trabalha no mar, em turnos de várias semanas.',
    riasec(0.9, 0.5, 0.05, 0.2, 0.3, 0.65),
    'alta',
    null,
  ),
  summary(
    'engenheiro-de-minas',
    'Engenheiro de Minas',
    'minas_geologia',
    'Planeia e dirige a extracção de diamantes e outros minérios, com segurança. Trabalha nas minas das Lundas, como Catoca, noutras explorações e no Estado.',
    riasec(0.8, 0.8, 0.1, 0.2, 0.5, 0.55),
    'media',
    null,
  ),
  summary(
    'geologo',
    'Geólogo',
    'minas_geologia',
    'Estuda as rochas e o subsolo para encontrar minérios, petróleo e água. Trabalha no campo e no laboratório, em minas, petrolíferas e no Instituto Geológico.',
    riasec(0.7, 0.9, 0.2, 0.15, 0.3, 0.5),
    'media',
    null,
  ),
  summary(
    'geofisico',
    'Geofísico',
    'minas_geologia',
    'Usa medições sísmicas, magnéticas e da gravidade para ver o subsolo sem o escavar. Trabalha na pesquisa de petróleo e de minérios.',
    riasec(0.6, 0.95, 0.15, 0.1, 0.3, 0.55),
    'baixa',
    null,
  ),
  summary(
    'engenheiro-metalurgico',
    'Engenheiro Metalúrgico e de Materiais',
    'minas_geologia',
    'Transforma os minérios em metais e escolhe e testa os materiais de estruturas e equipamentos. Trabalha em siderurgias, minas, petrolíferas e na indústria.',
    riasec(0.75, 0.85, 0.15, 0.1, 0.35, 0.6),
    'media',
    null,
  ),
]
