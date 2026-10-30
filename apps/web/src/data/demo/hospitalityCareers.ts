import type { CareerSummary } from '../types'
import { riasec, summary } from './careerSummary'

// Tourism and hospitality, the eleventh area of the catalogue (scrapers/catalog/hospitality.json): the professions
// behind the tourism and hotel management degrees (MESCTI yearbook 2023-2024) and the employers (the ministry, the
// hotels). Interest profiles approximate O*NET's. Demand reads the job ads. No salaries: no public table.

export const HOSPITALITY_CAREERS: CareerSummary[] = [
  summary(
    'gestor-hoteleiro',
    'Gestor Hoteleiro',
    'turismo',
    'Dirige um hotel ou um dos seus departamentos: a recepção, os quartos, a restauração e as contas. Começa muitas vezes na recepção ou como supervisor.',
    riasec(0.25, 0.35, 0.2, 0.7, 0.85, 0.65),
    'media',
    null,
  ),
  summary(
    'recepcionista-de-hotel',
    'Recepcionista de Hotel',
    'turismo',
    'Recebe os hóspedes, faz as entradas e as saídas e resolve o que precisam durante a estadia. Trabalha em hotéis, resorts e alojamentos, por turnos.',
    riasec(0.15, 0.2, 0.15, 0.85, 0.55, 0.65),
    'alta',
    null,
  ),
  summary(
    'tecnico-de-turismo',
    'Técnico de Turismo e Viagens',
    'turismo',
    'Vende viagens e pacotes turísticos, emite bilhetes e organiza estadias. Trabalha em agências de viagens, companhias aéreas e operadores turísticos.',
    riasec(0.15, 0.3, 0.3, 0.75, 0.7, 0.65),
    'baixa',
    null,
  ),
  summary(
    'guia-turistico',
    'Guia Turístico',
    'turismo',
    'Acompanha os visitantes e mostra-lhes a história, a natureza e a cultura de Angola, muitas vezes noutra língua. Trabalha por conta própria ou para operadores turísticos.',
    riasec(0.35, 0.4, 0.45, 0.85, 0.6, 0.25),
    'baixa',
    null,
  ),
  summary(
    'chefe-de-cozinha',
    'Chefe de Cozinha',
    'turismo',
    'Cria os pratos e dirige a cozinha de um restaurante ou hotel: a equipa, as compras e a higiene. É das profissões com mais anúncios em hotelaria.',
    riasec(0.75, 0.25, 0.7, 0.4, 0.6, 0.45),
    'alta',
    null,
  ),
  summary(
    'gestor-de-restauracao',
    'Gestor de Restauração',
    'turismo',
    'Gere um restaurante, bar ou serviço de catering: a equipa, os fornecedores, as contas e o atendimento. Trabalha em restaurantes, hotéis e empresas de catering.',
    riasec(0.35, 0.3, 0.25, 0.65, 0.85, 0.6),
    'baixa',
    null,
  ),
]
