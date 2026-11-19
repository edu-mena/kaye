import type { Career } from '../types'
import { graduate, therapyGuide } from './diagnosisTherapyCareer'
import { MINSA_2023 } from './healthGuideParts'

// The full guide of the clinical psychologist (the Saúde mental group; the psychiatrist is with the doctors), in the
// diagnosis and therapy career (diagnosisTherapyCareer.ts). The mental health programme and the consultations of the
// Luanda psychiatric hospital: MINSA, Anuário Estatístico Sanitário 2023 (tables 108 and 113); the students: MESCTI,
// Anuário Estatístico do Ensino Superior 2023-2024.

export const MENTAL_HEALTH_GUIDES: Career[] = [
  therapyGuide({
    slug: 'psicologo-clinico',
    demand: 'media',
    description:
      'Avalia e acompanha pessoas em sofrimento psicológico, como a depressão, a ansiedade, os traumas e as dependências, com entrevistas, testes e psicoterapia. Trabalha em hospitais psiquiátricos e gerais, centros de saúde, clínicas e escolas. No ano lectivo 2023/24 havia 3 440 estudantes de Psicologia Clínica, o quarto curso de saúde com mais alunos.',
    dayToDay: [
      'Fazer entrevistas e avaliar cada pessoa',
      'Aplicar testes psicológicos',
      'Fazer sessões de psicoterapia',
      'Apoiar pessoas em crise e as suas famílias',
      'Trabalhar com psiquiatras e assistentes sociais',
    ],
    workContext: [
      { label: 'Ambiente', value: 'Consultas em hospitais, centros de saúde e clínicas' },
      { label: 'Horário', value: '34 horas por semana no Estado' },
      { label: 'Equipa', value: 'Psiquiatras, enfermeiros e assistentes sociais' },
      { label: 'Pessoas', value: 'Crianças, adultos e famílias em sofrimento' },
    ],
    workStyles: ['Saber ouvir', 'Empatia', 'Discrição', 'Paciência', 'Equilíbrio emocional'],
    skills: [
      { id: 'entrevista-clinica', name: 'Entrevista clínica', importance: 'essencial' },
      { id: 'avaliacao-psicologica', name: 'Avaliação e testes psicológicos', importance: 'essencial' },
      { id: 'psicoterapia', name: 'Psicoterapia', importance: 'essencial' },
      { id: 'intervencao-crise', name: 'Intervenção em crise', importance: 'essencial' },
      { id: 'saude-mental-infantil', name: 'Saúde mental infantil', importance: 'opcional' },
    ],
    pathways: [graduate('Psicologia Clínica')],
    hiring: [
      'Hospitais psiquiátricos e gerais',
      'Centros de saúde',
      'Clínicas e consultórios privados',
      'Escolas e organizações sociais',
    ],
    note: {
      text: 'Os psicólogos clínicos entram no Estado por concurso, como técnicos superiores de diagnóstico e terapêutica, e quase não aparecem nos sites de emprego. Em 2023, o Programa de Saúde Mental registou 73 288 atendimentos, entre urgências, consultas e internamentos, e o Hospital Psiquiátrico de Luanda fez 3 999 consultas de psicologia clínica.',
      source: MINSA_2023,
    },
  }),
]
