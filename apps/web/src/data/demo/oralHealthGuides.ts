import type { Career } from '../types'
import { technician, therapyGuide } from './diagnosisTherapyCareer'
import { CV_AVOID, degree, healthGuide, MINSA_2023, SECONDARY, stateMarket } from './healthGuideParts'

// The full guides of the oral health careers (the Saúde oral group). The stomatology technician is in the diagnosis
// and therapy career (diagnosisTherapyCareer.ts); no State table names the dentist, so the guide has no salary. The
// stomatology consultations: MINSA, Anuário Estatístico Sanitário 2023 (table 72); the students: MESCTI, Anuário
// Estatístico do Ensino Superior 2023-2024.

export const ORAL_HEALTH_GUIDES: Career[] = [
  healthGuide({
    slug: 'medico-dentista',
    description:
      'Previne e trata os problemas dos dentes e da boca: cáries, infecções das gengivas e dentes partidos ou perdidos. Faz consultas, tratamentos, extracções e próteses e ensina a cuidar da boca. Trabalha em clínicas dentárias, hospitais e centros de saúde. No ano lectivo 2023/24 havia 3 363 estudantes em Medicina Dentária e Odontologia.',
    dayToDay: [
      'Examinar a boca e fazer o diagnóstico',
      'Tratar cáries e fazer restaurações',
      'Tirar dentes e tratar infecções',
      'Limpar e tratar as gengivas',
      'Ensinar a escovar e a prevenir',
    ],
    workContext: [
      { label: 'Ambiente', value: 'Clínicas dentárias e consultas de estomatologia' },
      { label: 'Horário', value: 'Sobretudo de dia, com marcação' },
      { label: 'Equipa', value: 'Técnicos de estomatologia e assistentes' },
      { label: 'Trabalho', value: 'Trabalho fino com as mãos e instrumentos' },
    ],
    workStyles: [
      'Destreza manual',
      'Atenção ao detalhe',
      'Calma com doentes com medo',
      'Paciência',
      'Gosto por tecnologia',
    ],
    skills: [
      { id: 'dentisteria', name: 'Dentisteria e restaurações', importance: 'essencial' },
      { id: 'cirurgia-oral', name: 'Cirurgia oral e extracções', importance: 'essencial' },
      { id: 'periodontologia', name: 'Tratamento das gengivas', importance: 'essencial' },
      { id: 'radiologia-dentaria', name: 'Radiologia dentária', importance: 'essencial' },
      { id: 'ortodontia', name: 'Ortodontia', importance: 'opcional' },
      { id: 'ingles-cientifico', name: 'Inglês científico', importance: 'opcional' },
    ],
    pathways: [
      {
        id: 'licenciatura',
        name: 'Licenciatura em Medicina Dentária',
        summary: 'A licenciatura, numa escola pública ou privada, e depois a prática numa clínica.',
        steps: [
          SECONDARY,
          degree('Medicina Dentária'),
          {
            kind: 'experiencia',
            title: 'Trabalho numa clínica dentária',
            need: 'essencial',
            description:
              'Começa-se a trabalhar com dentistas mais experientes, antes de fazer os tratamentos difíceis.',
            months: null,
          },
        ],
        totalCost: null,
      },
    ],
    stages: [
      {
        level: 'junior',
        title: 'Médico dentista em início de carreira',
        years: { min: 0, max: 3 },
        responsibilities: ['Faz consultas e tratamentos simples', 'Aprende com dentistas mais experientes'],
      },
      {
        level: 'pleno',
        title: 'Médico dentista',
        years: { min: 3, max: 8 },
        responsibilities: ['Faz tratamentos completos', 'Pode especializar-se, por exemplo em ortodontia'],
      },
      {
        level: 'senior',
        title: 'Médico dentista com consultório',
        years: { min: 8, max: null },
        responsibilities: ['Gere a clínica e a equipa', 'Forma os mais novos'],
      },
    ],
    market: stateMarket(
      'media',
      [],
      {
        text: 'Nenhuma tabela do Estado nomeia os médicos dentistas, e quase não aparecem nos sites de emprego. Em 2023, os serviços públicos fizeram 330 123 consultas de estomatologia, menos de 1 em cada 200 consultas.',
        source: MINSA_2023,
      },
      [
        'Clínicas dentárias privadas',
        'Hospitais e centros de saúde',
        'Serviços de saúde das Forças Armadas e da Polícia',
      ],
    ),
    cvGuide: {
      template: 'classico',
      include: [
        'A licenciatura, com a escola e o ano',
        'Os tratamentos que fazes com segurança',
        'Cursos e especializações',
        'Línguas',
      ],
      avoid: CV_AVOID,
    },
  }),
  therapyGuide({
    slug: 'tecnico-estomatologia',
    demand: 'baixa',
    level: 'technician',
    description:
      'Apoia o médico dentista nos tratamentos e cuida da higiene oral: limpa os dentes, aplica flúor e selantes, ensina a escovar e faz rastreios nas escolas e nas comunidades. Trabalha em consultas de estomatologia, clínicas dentárias e centros de saúde. Forma-se no curso médio de Estomatologia.',
    dayToDay: [
      'Preparar o consultório e esterilizar os instrumentos',
      'Ajudar o dentista durante os tratamentos',
      'Fazer limpezas e aplicar flúor',
      'Ensinar a escovar os dentes',
      'Fazer rastreios orais nas escolas',
    ],
    workContext: [
      { label: 'Ambiente', value: 'Consultas de estomatologia e clínicas dentárias' },
      { label: 'Horário', value: '34 horas por semana no Estado' },
      { label: 'Equipa', value: 'Médicos dentistas e outros técnicos' },
      { label: 'Comunidade', value: 'Rastreios em escolas e bairros' },
    ],
    workStyles: [
      'Destreza manual',
      'Organização',
      'Simpatia',
      'Seguir regras de higiene',
      'Paciência com crianças',
    ],
    skills: [
      { id: 'higiene-oral', name: 'Higiene oral e prevenção', importance: 'essencial' },
      { id: 'assistencia-dentaria', name: 'Assistência ao dentista', importance: 'essencial' },
      { id: 'esterilizacao', name: 'Esterilização de material', importance: 'essencial' },
      { id: 'educacao-saude-oral', name: 'Educação para a saúde oral', importance: 'essencial' },
      { id: 'radiologia-dentaria', name: 'Radiologia dentária', importance: 'opcional' },
    ],
    pathways: [technician('Estomatologia')],
    hiring: [
      'Hospitais e centros de saúde públicos',
      'Clínicas dentárias privadas',
      'Programas de saúde escolar',
    ],
  }),
]
