import type { Career, PathwayStep } from '../types'
import { graduate, technician, therapyGuide as guide } from './diagnosisTherapyCareer'

// The full guides of the rehabilitation and nutrition careers (the Reabilitação group), all in the diagnosis and
// therapy career (diagnosisTherapyCareer.ts). The physiotherapists' Order and its exam and two-year internship:
// Estatuto da Ordem dos Fisioterapeutas de Angola (Decreto Presidencial n.º 195/25, articles 66 and 71 to 73); the
// physiotherapy consultations: MINSA, Anuário Estatístico Sanitário 2023 (table 135); the students of each degree:
// MESCTI, Anuário Estatístico do Ensino Superior 2023-2024; the technical courses still open after the 2025
// suspension: O País, 27/06/2025.

const ORDER: PathwayStep = {
  kind: 'certificacao',
  title: 'Exame e estágio da Ordem dos Fisioterapeutas',
  need: 'essencial',
  certificate: 'exigido',
  description:
    'Desde 2025, só se exerce com inscrição na Ordem dos Fisioterapeutas de Angola, que pede o curso superior, um exame e 2 anos de estágio com um fisioterapeuta com pelo menos 5 anos de profissão.',
  months: { min: 24, max: 24 },
}

export const REHABILITATION_GUIDES: Career[] = [
  guide({
    slug: 'fisioterapeuta',
    demand: 'media',
    description:
      'Ajuda as pessoas a recuperar o movimento depois de lesões, AVC, fracturas, cirurgias ou doenças, com exercícios, massagem e aparelhos. Trabalha em hospitais, centros de reabilitação física, clínicas e clubes desportivos. Desde 2025 tem Ordem própria, que só inscreve quem tem curso superior. Em 2023, os centros de reabilitação física fizeram 135 905 consultas de fisioterapia, um terço delas em Luanda.',
    dayToDay: [
      'Avaliar o movimento, a força e a dor',
      'Planear e orientar os exercícios de cada doente',
      'Fazer massagem, mobilizações e electroterapia',
      'Ensinar a andar com muletas ou com uma prótese',
      'Acompanhar a recuperação de atletas',
    ],
    workContext: [
      { label: 'Ambiente', value: 'Hospitais, centros de reabilitação, clínicas e clubes' },
      { label: 'Horário', value: '34 horas por semana no Estado' },
      { label: 'Equipa', value: 'Ortopedistas, neurologistas e ortoprotésicos' },
      { label: 'Esforço', value: 'Trabalho físico, de pé e com as mãos' },
    ],
    workStyles: [
      'Paciência',
      'Motivar os outros',
      'Gosto por movimento e desporto',
      'Resistência física',
      'Empatia',
    ],
    skills: [
      { id: 'avaliacao-funcional', name: 'Avaliação funcional', importance: 'essencial' },
      { id: 'exercicio-terapeutico', name: 'Exercício terapêutico', importance: 'essencial' },
      { id: 'terapia-manual', name: 'Terapia manual', importance: 'essencial' },
      { id: 'reabilitacao-neurologica', name: 'Reabilitação neurológica', importance: 'essencial' },
      { id: 'fisioterapia-desportiva', name: 'Fisioterapia desportiva', importance: 'opcional' },
    ],
    pathways: [graduate('Fisioterapia', [ORDER])],
    hiring: [
      'Hospitais públicos e centros de reabilitação física',
      'Clínicas privadas de fisioterapia',
      'Clubes desportivos',
      'Centros ortopédicos',
    ],
  }),
  guide({
    slug: 'nutricionista',
    demand: 'media',
    description:
      'Planeia a alimentação de doentes e de pessoas saudáveis: trata a desnutrição das crianças, a obesidade e a diabetes, faz as dietas dos doentes internados e ensina as famílias a comer melhor. Trabalha em hospitais, centros de saúde, programas de nutrição e na restauração colectiva. Há muito poucos a formar-se: no ano lectivo 2023/24 havia 734 estudantes nas licenciaturas de Nutrição, e só 7 acabaram o curso.',
    dayToDay: [
      'Avaliar o peso, a altura e o estado nutricional',
      'Tratar crianças com desnutrição',
      'Fazer as dietas dos doentes internados',
      'Aconselhar doentes com diabetes, hipertensão ou obesidade',
      'Fazer educação alimentar nas comunidades',
    ],
    workContext: [
      { label: 'Ambiente', value: 'Hospitais, centros de saúde e comunidades' },
      { label: 'Horário', value: '34 horas por semana no Estado' },
      { label: 'Equipa', value: 'Médicos, enfermeiros e as cozinhas dos hospitais' },
      { label: 'Público', value: 'Crianças, doentes e famílias' },
    ],
    workStyles: [
      'Gosto por ciência e alimentação',
      'Paciência',
      'Explicar de forma simples',
      'Organização',
      'Empatia',
    ],
    skills: [
      { id: 'avaliacao-nutricional', name: 'Avaliação do estado nutricional', importance: 'essencial' },
      { id: 'dietoterapia', name: 'Dietas para doentes', importance: 'essencial' },
      { id: 'desnutricao-infantil', name: 'Tratamento da desnutrição infantil', importance: 'essencial' },
      { id: 'educacao-alimentar', name: 'Educação alimentar', importance: 'essencial' },
      { id: 'seguranca-alimentar', name: 'Higiene e segurança alimentar', importance: 'opcional' },
    ],
    pathways: [graduate('Nutrição'), technician('Nutrição e Dietética')],
    hiring: [
      'Hospitais e centros de saúde públicos',
      'Clínicas privadas',
      'Programas e organizações de nutrição',
      'Restauração colectiva e indústria alimentar',
    ],
  }),
  guide({
    slug: 'ortoprotesico',
    demand: 'baixa',
    level: 'technician',
    description:
      'Faz e adapta próteses para quem perdeu um membro e ortóteses, como talas e coletes, para quem tem dificuldade em mexer-se, e ensina a usá-las. Trabalha sobretudo nos centros ortopédicos e de reabilitação física, que servem também as pessoas amputadas por causa das minas. Forma-se no curso médio de Ortoprotesia.',
    dayToDay: [
      'Avaliar o doente e tirar as medidas e os moldes',
      'Fazer próteses e ortóteses na oficina',
      'Provar e ajustar o aparelho no doente',
      'Ensinar a usar e a cuidar da prótese',
      'Reparar aparelhos gastos',
    ],
    workContext: [
      { label: 'Ambiente', value: 'Oficinas ortopédicas e centros de reabilitação' },
      { label: 'Horário', value: '34 horas por semana no Estado' },
      { label: 'Equipa', value: 'Fisioterapeutas e ortopedistas' },
      { label: 'Trabalho', value: 'Trabalho manual com resinas, metais e plásticos' },
    ],
    workStyles: ['Habilidade manual', 'Precisão', 'Paciência', 'Empatia', 'Resolver problemas'],
    skills: [
      { id: 'moldes-medidas', name: 'Moldes e medidas', importance: 'essencial' },
      { id: 'fabrico-proteses', name: 'Fabrico de próteses', importance: 'essencial' },
      { id: 'fabrico-ortoteses', name: 'Fabrico de ortóteses', importance: 'essencial' },
      { id: 'biomecanica', name: 'Biomecânica da marcha', importance: 'essencial' },
      { id: 'desenho-computador', name: 'Desenho por computador', importance: 'opcional' },
    ],
    pathways: [technician('Ortoprotesia')],
    hiring: [
      'Centros ortopédicos e de reabilitação física',
      'Hospitais',
      'Oficinas ortopédicas privadas',
      'Organizações humanitárias',
    ],
  }),
  guide({
    slug: 'ortoptista',
    demand: 'baixa',
    level: 'technician',
    description:
      'Avalia e trata os problemas da visão e dos movimentos dos olhos, como o estrabismo e o olho preguiçoso das crianças, mede a vista e faz exames para o oftalmologista. Trabalha nos serviços de oftalmologia e em clínicas de olhos. Forma-se no curso médio de Ortóptica.',
    dayToDay: [
      'Medir a visão de crianças e adultos',
      'Avaliar o estrabismo e os movimentos dos olhos',
      'Fazer exercícios e tratamentos com a oclusão de um olho',
      'Fazer exames para o oftalmologista',
      'Fazer rastreios da visão nas escolas',
    ],
    workContext: [
      { label: 'Ambiente', value: 'Serviços de oftalmologia e clínicas de olhos' },
      { label: 'Horário', value: '34 horas por semana no Estado, de dia' },
      { label: 'Equipa', value: 'Oftalmologistas e optometristas' },
      { label: 'Doentes', value: 'Muitas crianças' },
    ],
    workStyles: [
      'Paciência com crianças',
      'Atenção ao detalhe',
      'Precisão',
      'Explicar de forma simples',
      'Calma',
    ],
    skills: [
      { id: 'acuidade-visual', name: 'Medição da acuidade visual', importance: 'essencial' },
      { id: 'avaliacao-estrabismo', name: 'Avaliação do estrabismo', importance: 'essencial' },
      { id: 'exames-oftalmicos', name: 'Exames de oftalmologia', importance: 'essencial' },
      { id: 'rastreio-visual', name: 'Rastreio visual', importance: 'essencial' },
      { id: 'lentes-contacto', name: 'Adaptação de lentes de contacto', importance: 'opcional' },
    ],
    pathways: [technician('Ortóptica')],
    hiring: ['Hospitais públicos', 'Clínicas oftalmológicas privadas', 'Programas de saúde escolar'],
  }),
]
