import type { Career } from '../types'
import { graduate, technician, therapyGuide as guide } from './diagnosisTherapyCareer'

// The full guides of the public health technicians (the Saúde pública group; the public health doctor is with the
// doctors, in medicineGuides.ts), both in the diagnosis and therapy career (diagnosisTherapyCareer.ts). The students
// of each degree: MESCTI, Anuário Estatístico do Ensino Superior 2023-2024.

const PUBLIC_HEALTH = [
  'Serviços municipais e provinciais de saúde pública',
  'Direcção Nacional de Saúde Pública',
  'Centros de saúde',
  'Programas de saúde e organizações internacionais',
]

export const PUBLIC_HEALTH_GUIDES: Career[] = [
  guide({
    slug: 'tecnico-saude-ambiental',
    demand: 'media',
    level: 'technician',
    description:
      'Identifica e reduz os riscos para a saúde que vêm do ambiente: controla a água, o lixo, o saneamento e os alimentos, combate os mosquitos e os ratos e inspecciona mercados, escolas e restaurantes. Trabalha nos serviços de saúde pública dos municípios e das províncias e na vigilância sanitária. Forma-se no curso médio de Saúde Ambiental.',
    dayToDay: [
      'Colher e analisar amostras de água',
      'Inspeccionar mercados, restaurantes e escolas',
      'Organizar a luta contra os mosquitos e os ratos',
      'Acompanhar o saneamento e a recolha do lixo',
      'Fazer educação sanitária nos bairros',
    ],
    workContext: [
      { label: 'Ambiente', value: 'Trabalho de campo e serviços de saúde pública' },
      { label: 'Horário', value: '34 horas por semana no Estado' },
      { label: 'Equipa', value: 'Médicos de saúde pública e outros técnicos' },
      { label: 'Local', value: 'Bairros, mercados e escolas' },
    ],
    workStyles: [
      'Gostar de trabalho de campo',
      'Rigor',
      'Falar com as comunidades',
      'Firmeza nas inspecções',
      'Organização',
    ],
    skills: [
      { id: 'qualidade-agua', name: 'Controlo da qualidade da água', importance: 'essencial' },
      { id: 'vigilancia-sanitaria', name: 'Inspecção e vigilância sanitária', importance: 'essencial' },
      { id: 'controlo-vectores', name: 'Controlo de mosquitos e outros vectores', importance: 'essencial' },
      { id: 'seguranca-alimentar', name: 'Higiene e segurança alimentar', importance: 'essencial' },
      { id: 'educacao-sanitaria', name: 'Educação sanitária', importance: 'essencial' },
    ],
    pathways: [technician('Saúde Ambiental')],
    hiring: [...PUBLIC_HEALTH.slice(0, 2), 'Empresas de água, saneamento e alimentos'],
  }),
  guide({
    slug: 'tecnico-saude-publica',
    demand: 'media',
    description:
      'Organiza a prevenção nas comunidades, com vacinações, rastreios e campanhas contra a malária e a cólera, e recolhe e analisa os dados que mostram onde as doenças aparecem. Trabalha nos centros de saúde, nos serviços de saúde pública e em programas de saúde. No ano lectivo 2023/24, a licenciatura em Análises Clínicas e Saúde Pública tinha 5 789 estudantes, e 614 acabaram o curso.',
    dayToDay: [
      'Organizar campanhas de vacinação',
      'Recolher e analisar os dados das doenças',
      'Investigar casos e surtos com a equipa',
      'Fazer rastreios e educação para a saúde',
      'Fazer relatórios para o município e a província',
    ],
    workContext: [
      { label: 'Ambiente', value: 'Centros de saúde, serviços de saúde pública e comunidades' },
      { label: 'Horário', value: '34 horas por semana no Estado, com campanhas' },
      { label: 'Equipa', value: 'Médicos de saúde pública, enfermeiros e agentes comunitários' },
      { label: 'Local', value: 'Muito trabalho nas comunidades' },
    ],
    workStyles: [
      'Falar com as comunidades',
      'Gosto por números',
      'Organização',
      'Trabalhar em equipa',
      'Iniciativa',
    ],
    skills: [
      { id: 'epidemiologia', name: 'Epidemiologia e vigilância', importance: 'essencial' },
      { id: 'vacinacao', name: 'Calendário de vacinas', importance: 'essencial' },
      { id: 'analise-dados-saude', name: 'Análise de dados de saúde', importance: 'essencial' },
      { id: 'educacao-saude', name: 'Educação para a saúde', importance: 'essencial' },
      { id: 'dhis2', name: 'DHIS2 e sistemas de informação de saúde', importance: 'opcional' },
    ],
    pathways: [graduate('Análises Clínicas e Saúde Pública')],
    hiring: PUBLIC_HEALTH,
  }),
]
