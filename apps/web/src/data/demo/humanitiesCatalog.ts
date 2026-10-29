import catalog from '../catalog/humanities.json'
import { buildArea, type AreaData } from './areaCatalog'
import { HEALTH_CAREERS } from './healthCareers'
import { HUMANITIES_CAREERS } from './humanitiesCareers'
import { SCIENCES_CAREERS } from './sciencesCareers'

// Law, public administration and the social and human sciences, from scrapers/catalog/humanities.json
// (python -m catalog.humanities): every higher education institution with the area's courses (MESCTI yearbook
// 2023-2024), the training of lawyers, magistrates, diplomats and public servants, and the employers: the courts,
// the Public Prosecutor, the justice and State bodies (each with its source) and those with most legal job ads.

const SUMMARIES: Record<string, string> = {
  tribunal_supremo: 'O tribunal mais alto da justiça comum: julga os recursos dos tribunais de todo o país.',
  tribunal_constitucional: 'Decide se as leis e os actos do Estado respeitam a Constituição.',
  magistratura:
    'Gere a carreira dos juízes: abre os concursos de ingresso, coloca-os nos tribunais e avalia-os.',
  ministerio_publico:
    'O Ministério Público: os procuradores que dirigem a investigação dos crimes e acusam em tribunal, em todo o país.',
  ministerio_justica:
    'Tutela os registos, o notariado e a identificação civil, onde trabalham conservadores, notários e oficiais.',
  guiche:
    'Onde se criam as empresas, num só balcão, com cartório notarial e mediação de conflitos. Sob a tutela do Ministério da Justiça.',
  investigacao: 'A polícia que investiga os crimes e reúne as provas para o Ministério Público.',
  provedor:
    'Defende os direitos dos cidadãos perante a administração pública: recebe queixas e recomenda correcções.',
  diplomacia: 'Conduz a política externa de Angola, com as embaixadas e os consulados no estrangeiro.',
  parlamento: 'O parlamento: faz as leis e fiscaliza o Governo, com assessores e técnicos de apoio.',
  eleitoral: 'Organiza e fiscaliza as eleições.',
  territorio: 'Coordena a administração local: os governos provinciais e as administrações municipais.',
  accao_social: 'As políticas para as famílias, as crianças, as mulheres e as pessoas mais vulneráveis.',
  estatistica:
    'Produz as estatísticas oficiais do país: o recenseamento e os inquéritos ao emprego e à população.',
}

export const HUMANITIES = buildArea(catalog as AreaData, {
  // Psicologia also leads to health's clinical psychologist; the INE also hires statisticians.
  careers: [...HUMANITIES_CAREERS, ...HEALTH_CAREERS, ...SCIENCES_CAREERS],
  courses: 'direito, ciências sociais e humanas',
  courseCareers: [
    [/psicologia (criminal|juridica)/, ['psicologo-forense']],
    [/psicologia escolar/, ['psicologo-escolar']],
    [/psicologia (do trabalho|das organizacoes)/, ['psicologo-do-trabalho']],
    [/psicologia/, ['psicologo-clinico', 'psicologo-do-trabalho', 'psicologo-escolar', 'psicologo-forense']],
    [/ciencia politica e administracao/, ['analista-politico', 'tecnico-superior-de-administracao-publica']],
    [/relacoes internacionais/, ['diplomata', 'tecnico-de-cooperacao-internacional', 'analista-politico']],
    [/ciencia politica/, ['analista-politico', 'diplomata', 'tecnico-superior-de-administracao-publica']],
    [
      /administracao publica|gestao publica|territorio|cidades/,
      ['tecnico-superior-de-administracao-publica', 'tecnico-de-contratacao-publica'],
    ],
    [/criminais/, ['investigador-criminal', 'oficial-de-policia', 'perito-criminalista']],
    [/servicos? social/, ['assistente-social']],
    [/sociologia/, ['sociologo', 'tecnico-de-salvaguardas-sociais', 'investigador-em-ciencias-sociais']],
    [/antropologia/, ['antropologo', 'tecnico-de-patrimonio-cultural', 'investigador-em-ciencias-sociais']],
    [/geodemografia/, ['demografo']],
    [/historia/, ['historiador', 'tecnico-de-patrimonio-cultural', 'arquivista']],
    [/filosofia/, ['investigador-em-ciencias-sociais', 'analista-politico']],
    [/ciencia da informacao/, ['arquivista']],
    [/direito/, ['advogado', 'jurista', 'juiz', 'procurador', 'conservador-dos-registos', 'notario']],
  ],
  employs: [
    [/tribunal|magistratura/, ['juiz', 'oficial-de-justica', 'jurista']],
    [/procuradoria/, ['procurador', 'oficial-de-justica', 'jurista']],
    [
      /ministerio da justica|guiche/,
      ['conservador-dos-registos', 'notario', 'oficial-de-justica', 'jurista'],
    ],
    [/investigacao criminal/, ['investigador-criminal', 'perito-criminalista', 'psicologo-forense']],
    [/provedor/, ['jurista', 'tecnico-superior-de-administracao-publica']],
    [/relacoes exteriores/, ['diplomata', 'tecnico-de-cooperacao-internacional', 'jurista']],
    [/assembleia|eleitoral/, ['jurista', 'analista-politico', 'tecnico-superior-de-administracao-publica']],
    [
      /administracao do territorio/,
      ['tecnico-superior-de-administracao-publica', 'tecnico-de-contratacao-publica', 'jurista'],
    ],
    [/accao social/, ['assistente-social', 'sociologo', 'tecnico-superior-de-administracao-publica']],
    [/estatistica/, ['estatistico', 'demografo', 'sociologo']],
    [/minea/, ['jurista', 'tecnico-de-salvaguardas-sociais', 'tecnico-de-contratacao-publica']],
  ],
  fallback: ['jurista', 'advogado'],
  sector: 'comercio',
  source: catalog.sources.jobs,
  describe: (employer) =>
    SUMMARIES[employer.kind] ??
    `Publicou ${employer.postings ?? 0} vagas de juristas e advogados nos sites de emprego angolanos.`,
})
