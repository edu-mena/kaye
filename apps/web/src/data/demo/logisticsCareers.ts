import type { CareerSummary } from '../types'
import { entry, riasec, summary } from './careerSummary'

// Logistics and transport, the tenth area of the catalogue (scrapers/catalog/logistics.json): the professions behind
// the logistics and transport degrees (MESCTI yearbook 2023-2024) and the employers (the ministry, the civil aviation
// authority, the ports, the railway). Interest profiles approximate O*NET's. Demand reads the job ads. Salaries: the
// State's 2026 base salary on entry (Decreto Presidencial 16/26), only where a table names the career.

/** The civil aviation's inspectors on entry (Auditor/Inspector de Supervisão da Aviação Civil Assistente). */
const AVIATION_INSPECTOR = entry(361_910)

export const LOGISTICS_CAREERS: CareerSummary[] = [
  summary(
    'gestor-de-logistica',
    'Gestor de Logística',
    'logistica',
    'Organiza o caminho dos produtos, do fornecedor ao cliente: compras, armazéns, transportes e prazos. Trabalha em distribuidoras, fábricas, petrolíferas e transitários.',
    riasec(0.45, 0.55, 0.05, 0.35, 0.75, 0.85),
    'alta',
    null,
  ),
  summary(
    'tecnico-de-logistica',
    'Técnico de Logística e Armazém',
    'logistica',
    'Recebe, arruma e despacha a mercadoria e controla o stock do armazém. Trabalha em distribuidoras, supermercados, fábricas e bases logísticas.',
    riasec(0.75, 0.35, 0.05, 0.3, 0.35, 0.85),
    'alta',
    null,
  ),
  summary(
    'despachante-aduaneiro',
    'Despachante Aduaneiro',
    'logistica',
    'Trata dos papéis e dos impostos para a mercadoria entrar ou sair do país pela alfândega. Trabalha por conta própria ou em transitários, nos portos e aeroportos.',
    riasec(0.2, 0.45, 0.05, 0.4, 0.6, 0.9),
    'baixa',
    null,
  ),
  summary(
    'tecnico-de-transportes',
    'Técnico de Transportes e Frota',
    'transportes',
    'Planeia as rotas, os horários e a manutenção dos camiões, autocarros ou comboios de uma empresa. Trabalha em transportadoras, distribuidoras e empresas públicas de transportes.',
    riasec(0.55, 0.45, 0.05, 0.35, 0.55, 0.8),
    'media',
    null,
  ),
  summary(
    'engenheiro-de-transportes',
    'Engenheiro de Transportes',
    'transportes',
    'Planeia estradas, linhas de comboio, portos e redes de transporte público. Trabalha no Ministério dos Transportes, em consultoras e nas empresas de caminho-de-ferro.',
    riasec(0.6, 0.8, 0.15, 0.3, 0.5, 0.65),
    'baixa',
    null,
  ),
  summary(
    'gestor-portuario',
    'Técnico de Operações Portuárias',
    'transportes',
    'Organiza a chegada dos navios e a carga e descarga dos contentores no porto. Trabalha nos portos de Luanda, do Lobito e do Namibe e nos terminais privados.',
    riasec(0.6, 0.45, 0.05, 0.35, 0.6, 0.75),
    'media',
    null,
  ),
  summary(
    'inspector-de-aviacao-civil',
    'Inspector da Aviação Civil',
    'transportes',
    'Fiscaliza as companhias aéreas, os aeroportos e os aviões para que voem em segurança e segundo as regras. Trabalha na Autoridade Nacional da Aviação Civil.',
    riasec(0.45, 0.7, 0.05, 0.3, 0.45, 0.85),
    'baixa',
    AVIATION_INSPECTOR,
  ),
]
