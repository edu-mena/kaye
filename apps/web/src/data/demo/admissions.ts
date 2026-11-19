import type { Admission } from '../types'

/*
 * Access exams and applications for 2026/27, checked on 3 November 2026 in the institutions' own notices (sites and
 * scanned edicts) and the MESCTI calendars. Dates, vacancies and fees only when a source gives them.
 * Sources and gaps: docs/recolha-de-dados.md.
 */

const CHECKED = '2026-11-03'
const YEAR = '2026/27'

/** Every day from start to end (ISO), both included. */
const days = (start: string, end: string) => {
  const result: string[] = []
  for (
    let day = new Date(`${start}T00:00:00Z`);
    day <= new Date(`${end}T00:00:00Z`);
    day.setUTCDate(day.getUTCDate() + 1)
  ) {
    result.push(day.toISOString().slice(0, 10))
  }
  return result
}

const DECREE_135_26 = {
  label: 'Decreto Executivo 135/26 (calendário 2026/27)',
  url: 'https://angolex.com/paginas/decreto-executivo/calendario-do-ano-academico-2026a2027a-das-instituicoes-de-ensino-superior-135a-26a.html',
}
const FORBES_VAGAS = {
  label: 'Forbes África Lusófona (11/09/2026)',
  url: 'https://forbesafricalusofona.com/ensino-superior-reduz-50-mil-vagas-em-angola-no-proximo-ano-academico/',
}
const DNES_TEACHERS = {
  label: 'MESCTI, DNES: calendário dos exames nacionais de formação de professores (24/07/2026)',
  url: 'https://isced.edu.ao/wp-content/uploads/2026/08/CALENDARIO-DAS-PROVAS-DOS-EXAMES-DE-ACESSO-2026-2027.pdf',
}
const DNES_TEACHERS_EXCEPTIONAL = {
  label: 'MESCTI, DNES: calendário excepcional (30/09/2026)',
  url: 'https://isced.edu.ao/wp-content/uploads/2026/10/CALENDARIO-EXCEPCIONAL-DE-EXAMES-NACIONAIS-DE-ACESSO-1-a-CHAMADA.pdf',
}

const UAN_URL = 'https://examedeacesso.uan.co.ao'
const UAN_SOURCES = [
  {
    label: 'UAN: Exame de Acesso 2026 (13/08/2026)',
    url: 'https://www.uan.ao/detalhes/noticia/exame-de-acesso-2026',
  },
  {
    label: 'UAN: cursos disponíveis (27/07/2026)',
    url: 'https://www.uan.ao/detalhes/noticia/cursos-disponiveis-para-os-exames-de-acesso-2026',
  },
  { label: 'UAN: tópicos do exame de acesso 2026', url: 'https://uan.ao/sobre-uan/admissao' },
]
/** One process for every course; the subjects change with the area. Vacancies: 3810 or 3900, the notices differ. */
const UAN = {
  academyId: 'uan',
  year: YEAR,
  registration: { start: '2026-08-03', end: '2026-08-17' },
  examDates: days('2026-08-25', '2026-08-28'),
  fee: 5000,
  requirements: [
    'Inscrição só online',
    'Certificado ou declaração do ensino secundário (PDF)',
    'Fotografia tipo passe',
    'Duas opções de curso: 10 000 Kz',
    'No dia: BI original e ficha de inscrição impressa',
  ],
  url: UAN_URL,
  sources: UAN_SOURCES,
  checkedAt: CHECKED,
} satisfies Omit<Admission, 'id' | 'subjects'>

const ISCED_LUANDA = 'instituto-superior-de-ciencias-de-educacao-de-luanda'
const ISCED_REQUIREMENTS = [
  'Certificado do II ciclo do ensino secundário (original e cópia)',
  'Cópia do BI actualizado',
  'Comprovativo de pagamento',
]

const UCAN_TOPICS = {
  label: 'UCAN: tópicos para os exames de acesso 2026',
  url: 'https://www.ucan.co.ao/topicos-para-os-exames-de-acesso/',
}

export const ADMISSIONS: Admission[] = [
  {
    id: 'mescti-2026-27',
    academyId: null,
    year: YEAR,
    registration: { start: null, end: null },
    examDates: [...days('2026-08-24', '2026-08-28'), ...days('2026-09-14', '2026-09-18')],
    subjects: [],
    vacancies: 283500,
    requirements: [
      'Instituições públicas: exames de 24 a 28 de agosto',
      'Instituições privadas: exames de 14 a 18 de setembro',
      'Cada instituição marca as inscrições',
    ],
    url: DECREE_135_26.url,
    sources: [DECREE_135_26, FORBES_VAGAS],
    checkedAt: CHECKED,
  },
  {
    id: 'mescti-formacao-de-professores-2026-27',
    academyId: null,
    year: YEAR,
    registration: { start: '2026-08-03', end: '2026-08-14' },
    examDates: [
      ...days('2026-08-24', '2026-08-28'),
      ...days('2026-09-14', '2026-09-16'),
      '2026-09-21',
      '2026-09-22',
    ],
    subjects: [
      'Língua Portuguesa',
      'História',
      'Matemática',
      'Biologia',
      'Física',
      'Química',
      'Geografia',
      'Língua Inglesa',
      'Língua Francesa',
      'Línguas Africanas',
      'Educação Física (prova prática)',
    ],
    requirements: [
      'Exame nacional para os cursos de educadores de infância e de professores',
      '2.ª chamada em setembro',
    ],
    url: DNES_TEACHERS.url,
    sources: [DNES_TEACHERS],
    checkedAt: CHECKED,
  },
  {
    id: 'mescti-formacao-de-professores-excepcional-2026-27',
    academyId: null,
    year: YEAR,
    registration: { start: '2026-09-30', end: '2026-10-07' },
    examDates: days('2026-10-12', '2026-10-16'),
    subjects: [
      'Língua Portuguesa',
      'História',
      'Matemática',
      'Biologia',
      'Física',
      'Química',
      'Geografia',
      'Língua Inglesa',
      'Língua Francesa',
      'Línguas Africanas',
      'Educação Física (prova prática)',
    ],
    requirements: ['Chamada excepcional para os cursos de educadores de infância e de professores'],
    url: DNES_TEACHERS_EXCEPTIONAL.url,
    sources: [DNES_TEACHERS_EXCEPTIONAL],
    checkedAt: CHECKED,
  },
  {
    ...UAN,
    id: 'uan-exactas-2026-27',
    courseIds: [
      'arquitectura',
      'engenharia-civil',
      'engenharia-de-minas',
      'engenharia-electrotecnica',
      'engenharia-electronica-e-telecomunicacoes',
      'engenharia-de-petroleos',
      'engenharia-de-petroleo',
      'engenharia-informatica',
      'engenharia-mecanica',
      'engenharia-quimica',
      'geologia',
    ],
    subjects: ['Língua Portuguesa', 'Biologia', 'Matemática', 'Física', 'Química', 'Desenho'],
  },
  {
    ...UAN,
    id: 'uan-saude-2026-27',
    courseIds: ['medicina', 'enfermagem', 'analises-clinicas-e-saude-publica', 'ciencias-farmaceuticas'],
    subjects: ['Língua Portuguesa', 'Biologia', 'Matemática', 'Química'],
  },
  {
    ...UAN,
    id: 'uan-sociais-2026-27',
    courseIds: [
      'antropologia',
      'gestao-e-administracao-publica',
      'geodemografia',
      'comunicacao-social',
      'direito',
      'economia',
      'educacao-fisica-e-desporto',
      'filosofia',
      'lingua-e-literaturas-africanas',
      'linguas-e-literaturas-africanas',
      'lingua-e-literaturas-em-lingua-francesa',
      'psicologia-clinica',
      'psicologia-escolar',
    ],
    subjects: ['Língua Portuguesa', 'História', 'Matemática', 'Cultura Geral'],
  },
  {
    id: 'uniluanda-instic-2026-27',
    academyId: 'universidade-de-luanda',
    courseIds: [
      'engenharia-informatica',
      'engenharia-de-telecomunicacoes',
      'informatica-de-gestao',
      'informatica',
    ],
    year: YEAR,
    registration: { start: '2026-08-04', end: '2026-08-15' },
    examDates: ['2026-08-26'],
    subjects: [],
    fee: 5000,
    requirements: [
      'Cópia do BI',
      'Fotografia tipo passe',
      'Cópia do certificado de habilitações',
      'Pagamento por RUPE',
      'Duas opções de curso: 10 000 Kz',
    ],
    url: 'https://instic.uniluanda.ao/exame-de-acesso-2/',
    sources: [
      {
        label: 'INSTIC (UniLuanda): Exame de Acesso 2026-27',
        url: 'https://instic.uniluanda.ao/exame-de-acesso-2/',
      },
    ],
    checkedAt: CHECKED,
  },
  {
    id: 'isptec-cabinda-2026-27',
    academyId: 'isptec',
    courseIds: ['engenharia-mecanica', 'engenharia-de-petroleos'],
    year: YEAR,
    registration: { start: '2026-10-14', end: '2026-10-21' },
    examDates: days('2026-10-22', '2026-10-24'),
    subjects: ['Matemática', 'Física'],
    vacancies: 200,
    fee: 5000,
    requirements: [
      'Pólo de Cabinda',
      'Pré-inscrição em isptec.co.ao, validação no pólo',
      'Fotocópia do BI',
      'Certificado do II ciclo com notas de todas as disciplinas',
    ],
    url: 'https://isptec.co.ao/public/assets/uploads/docs/edital-exame-acesso-2026-2027-polo-cabinda.pdf',
    sources: [
      {
        label: 'ISPTEC: Edital do Exame de Acesso 2026/2027, Pólo de Cabinda (08/10/2026)',
        url: 'https://isptec.co.ao/public/assets/uploads/docs/edital-exame-acesso-2026-2027-polo-cabinda.pdf',
      },
    ],
    checkedAt: CHECKED,
  },
  {
    id: 'isced-luanda-2026-27',
    academyId: ISCED_LUANDA,
    courseIds: [
      'educacao-de-infancia',
      'ensino-primario',
      'ensino-da-lingua-portuguesa',
      'ensino-do-portugues',
      'ensino-da-lingua-e-literaturas-africanas',
      'ensino-das-linguas-e-literaturas-africanas',
    ],
    year: YEAR,
    registration: { start: '2026-08-03', end: '2026-08-19' },
    examDates: days('2026-08-24', '2026-08-28'),
    subjects: ['Língua Portuguesa', 'Matemática', 'Línguas e Literaturas Africanas'],
    vacancies: 225,
    requirements: [...ISCED_REQUIREMENTS, 'Ensino da Língua Portuguesa: também prova oral'],
    url: 'https://isced.edu.ao/2026/07/31/informacoes-sobre-o-processo-de-candidatura-para-o-ano-academico-2026-2027/',
    sources: [
      {
        label: 'ISCED Luanda: processo de acesso 2026/2027',
        url: 'https://isced.edu.ao/2026/07/31/informacoes-sobre-o-processo-de-candidatura-para-o-ano-academico-2026-2027/',
      },
      {
        label: 'ISCED Luanda: vagas (30/07/2026)',
        url: 'https://isced.edu.ao/wp-content/uploads/2026/08/VAGAS-DISPONIVEIS.pdf',
      },
      {
        label: 'ISCED Luanda: prorrogação das inscrições (17/08/2026)',
        url: 'https://isced.edu.ao/wp-content/uploads/2026/08/COMUNICADO-SOBRE-PRORROGACAO-DAS-INSCRICOES.pdf',
      },
      DNES_TEACHERS,
    ],
    checkedAt: CHECKED,
  },
  {
    id: 'isced-luanda-excepcional-2026-27',
    academyId: ISCED_LUANDA,
    courseIds: [
      'ensino-da-matematica',
      'ensino-da-historia',
      'ensino-da-lingua-inglesa',
      'ensino-do-ingles',
      'ensino-da-lingua-francesa',
      'ensino-do-frances',
    ],
    year: YEAR,
    registration: { start: '2026-09-30', end: '2026-10-07' },
    examDates: days('2026-10-12', '2026-10-16'),
    subjects: ['Língua Portuguesa', 'Matemática', 'História', 'Língua Inglesa', 'Língua Francesa'],
    requirements: ISCED_REQUIREMENTS,
    url: 'https://isced.edu.ao/2026/10/01/exames-nacionais-excepcionais-de-acesso-aos-cursos-de-formacao-de-educadores-de-infancia-e-de-professores-ano-academico-2026-2027/',
    sources: [
      {
        label: 'ISCED Luanda: exames nacionais excepcionais 2026/2027',
        url: 'https://isced.edu.ao/2026/10/01/exames-nacionais-excepcionais-de-acesso-aos-cursos-de-formacao-de-educadores-de-infancia-e-de-professores-ano-academico-2026-2027/',
      },
      {
        label: 'ISCED Luanda: período e local das inscrições (30/09/2026)',
        url: 'https://isced.edu.ao/wp-content/uploads/2026/10/PERIODO-E-LOCAL-DAS-INSCRICOES.pdf',
      },
      DNES_TEACHERS_EXCEPTIONAL,
    ],
    checkedAt: CHECKED,
  },
  {
    id: 'ucan-informatica-2026-27',
    academyId: 'ucan',
    courseIds: ['engenharia-informatica', 'engenharia-de-telecomunicacoes'],
    year: YEAR,
    registration: { start: null, end: null },
    examDates: [],
    subjects: ['Matemática', 'Física'],
    requirements: [],
    url: UCAN_TOPICS.url,
    sources: [
      UCAN_TOPICS,
      {
        label: 'UCAN: tópicos de Informática e Telecomunicações',
        url: 'https://www.ucan.co.ao/wp-content/uploads/2026/08/Informatica-e-Telecomunicacoes.pdf',
      },
    ],
    checkedAt: CHECKED,
  },
  {
    id: 'ucan-economia-2026-27',
    academyId: 'ucan',
    courseIds: ['contabilidade-e-administracao', 'economia-e-gestao'],
    year: YEAR,
    registration: { start: null, end: null },
    examDates: [],
    subjects: ['Língua Portuguesa', 'Matemática'],
    requirements: [],
    url: UCAN_TOPICS.url,
    sources: [
      UCAN_TOPICS,
      {
        label: 'UCAN: tópicos de Economia e Gestão',
        url: 'https://www.ucan.co.ao/wp-content/uploads/2026/08/Economia-e-Gestao.pdf',
      },
    ],
    checkedAt: CHECKED,
  },
  {
    id: 'unia-2026-27',
    academyId: 'universidade-independente-de-angola',
    year: YEAR,
    registration: { start: '2026-08-03', end: '2026-09-11' },
    examDates: days('2026-09-14', '2026-09-18'),
    subjects: [],
    requirements: ['Candidatura online em secretaria.unia.ao'],
    url: 'https://unia.ao/inscricoes/',
    sources: [
      {
        label: 'UnIA: Calendário Académico 2026/2027 (25/06/2026)',
        url: 'https://unia.ao/wp-content/uploads/2026/08/Calendario-Academico-2026-2027.pdf',
      },
    ],
    checkedAt: CHECKED,
  },
  {
    id: 'unipiaget-2026-27',
    academyId: 'universidades-jean-piaget',
    year: YEAR,
    registration: { start: '2026-08-03', end: '2026-09-05' },
    examDates: days('2026-09-14', '2026-09-16'),
    subjects: [],
    requirements: [
      'Formação de professores (Português e Línguas Nacionais): exame nacional, inscrições até 21 de agosto',
    ],
    url: 'https://www.unipiaget-angola.org/?inscricoes=',
    sources: [
      {
        label: 'Universidade Jean Piaget: Calendário do Ano Académico 2026/2027',
        url: 'https://www.unipiaget-angola.org/upload/formularios/calendario/CALENDA%CC%81RIO%20_DO_ANO_ACADE%CC%81MICO_2026-2027.pdf',
      },
    ],
    checkedAt: CHECKED,
  },
]
