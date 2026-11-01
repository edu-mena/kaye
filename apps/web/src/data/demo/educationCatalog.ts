import catalog from '../catalog/education.json'
import { buildArea, type AreaData } from './areaCatalog'
import { CAREER_SUMMARIES } from './careers'

// Education, from scrapers/catalog/education.json (python -m catalog.education): every higher education institution
// with teacher training or sport courses (MESCTI yearbook 2023-2024), the training of teachers in service, and the
// employers: the Ministry of Education and its institutes, the employment and vocational training institute (each
// with its source) and the schools with most job ads.

const SUMMARIES: Record<string, string> = {
  ministerio_educacao:
    'Tutela o ensino pré-escolar, primário e secundário: as escolas públicas, os programas e os professores.',
  avaliacao: 'Prepara os programas e os manuais escolares e avalia o que os alunos aprendem.',
  educacao_especial:
    'Orienta a educação das crianças e jovens com deficiência e as escolas de educação especial.',
  emprego_formacao: 'Gere os centros de emprego e de formação profissional do Estado, em todo o país.',
  escola_internacional:
    'Escola internacional privada em Luanda, com ensino em inglês do pré-escolar ao fim do secundário.',
}

export const EDUCATION = buildArea(catalog as AreaData, {
  // Some courses also lead to the careers of other areas (school psychologist, ICT trainer, translator).
  careers: CAREER_SUMMARIES,
  courses: 'educação e desporto',
  courseCareers: [
    // Before /fisica/: "Educação Física e Desporto".
    [
      /desporto|deporto|educacao fisica/,
      ['professor-de-educacao-fisica', 'treinador-desportivo', 'preparador-fisico', 'gestor-desportivo'],
    ],
    [/pre.escolar|infancia/, ['educador-de-infancia']],
    [/especial/, ['professor-de-educacao-especial']],
    [/primari|magisterio/, ['professor-do-ensino-primario']],
    [/informatica/, ['professor-de-informatica', 'formador-de-tic']],
    [/matematica/, ['professor-de-matematica']],
    [/africanas/, ['professor-de-lingua-portuguesa', 'linguista']],
    [/portugues|nacionais/, ['professor-de-lingua-portuguesa', 'revisor-de-textos']],
    [/ingles|frances/, ['professor-de-linguas-estrangeiras', 'tradutor']],
    [/biologia/, ['professor-de-biologia']],
    [/quimica/, ['professor-de-quimica']],
    [/fisica/, ['professor-de-fisica']],
    [/historia/, ['professor-de-historia']],
    [/geografia/, ['professor-de-geografia']],
    [/psicolog/, ['psicologo-escolar', 'professor-de-filosofia', 'pedagogo']],
    [/filosofia|sociologia|moral/, ['professor-de-filosofia']],
    [/alimentares|agricola|agropecuaria/, ['professor-do-ensino-tecnico']],
    [
      /pedagogia|ciencias da educacao|formacao de professores/,
      [
        'pedagogo',
        'especialista-de-administracao-da-educacao',
        'director-escolar',
        'docente-do-ensino-superior',
        'formador-profissional',
        'tecnico-de-emprego-e-formacao',
      ],
    ],
  ],
  employs: [
    [
      /ministerio da educacao/,
      [
        'educador-de-infancia',
        'professor-do-ensino-primario',
        'professor-de-matematica',
        'professor-de-lingua-portuguesa',
        'professor-de-linguas-estrangeiras',
        'professor-de-biologia',
        'professor-de-quimica',
        'professor-de-fisica',
        'professor-de-historia',
        'professor-de-geografia',
        'professor-de-filosofia',
        'professor-de-informatica',
        'professor-do-ensino-tecnico',
        'professor-de-educacao-fisica',
        'especialista-de-administracao-da-educacao',
        'director-escolar',
      ],
    ],
    [/avaliacao e desenvolvimento/, ['pedagogo', 'especialista-de-administracao-da-educacao']],
    [/educacao especial/, ['professor-de-educacao-especial', 'psicologo-escolar']],
    [/emprego e formacao/, ['tecnico-de-emprego-e-formacao', 'formador-profissional']],
    [
      /international school|english school/,
      [
        'professor-de-linguas-estrangeiras',
        'professor-de-matematica',
        'professor-de-fisica',
        'professor-de-quimica',
        'professor-de-informatica',
        'educador-de-infancia',
      ],
    ],
    [/academia/, ['formador-profissional', 'professor-de-linguas-estrangeiras']],
  ],
  fallback: ['professor-do-ensino-primario', 'educador-de-infancia'],
  sector: 'educacao',
  source: catalog.sources.jobs,
  describe: (employer) =>
    SUMMARIES[employer.kind] ??
    `Publicou ${employer.postings ?? 0} vagas na educação nos sites de emprego angolanos.`,
})
