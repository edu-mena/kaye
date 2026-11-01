import type { Career, CareerGroup, Company, CompanySector, PathwayStep, SourceLink } from '../types'
import { career, publicPay } from './publicGuides'
import {
  certification,
  degree,
  firstJob,
  ladder,
  market as marketOf,
  skill,
  type TechSalary,
  universityRoute,
  wage,
} from './technologyGuides'

// The sciences and humanities careers' full pages (ADR 0010), from public sources:
// - the demand: the job ads of the last 12 months, by their titles. market/jobs.json has no total for this area, whose
//   ads fall under others, so the total is the 28 ads counted here;
// - the salaries: the WageIndicator 2026 survey and, for statisticians and researchers, the State's base pay on entry
//   (Decreto Presidencial 16/26, already in the summaries);
// - the rules: Decreto Presidencial n.º 109/19 (the scientific career) and Decreto n.º 29/01 (merchant navy
//   certificates). No source gave rules for psychologists or social workers, so those guides say to confirm them.

type Guide = Pick<
  Career,
  | 'description'
  | 'dayToDay'
  | 'workContext'
  | 'workStyles'
  | 'skills'
  | 'employerAsks'
  | 'pathways'
  | 'stages'
  | 'market'
  | 'cvGuide'
> & { slug: string }

const SOCIAL_START = 'entre 271 001 e 1 317 401'
const SOCIAL_AFTER = 'entre 407 570 e 2 082 004'
const SCIENCE_START = 'entre 332 590 e 1 003 463'
const SCIENCE_AFTER = 'entre 515 704 e 1 608 957'

const social = (page: string, occupation: string) => wage(page, occupation, SOCIAL_START, SOCIAL_AFTER)
const science = (page: string, occupation: string) => wage(page, occupation, SCIENCE_START, SCIENCE_AFTER)

const SALARY = {
  psychologist: social('psicologos', 'os psicólogos'),
  sociologist: social('sociologos-antropologistas-e-profissionais', 'os sociólogos e antropólogos'),
  socialWorker: social('assistentes-sociais-e-conselheiros', 'os assistentes sociais e conselheiros'),
  historian: social(
    'filosofos-historiadores-e-cientistas-politicos',
    'os filósofos, historiadores e cientistas políticos',
  ),
  archivist: social('arquivistas-e-conservadores-de-museus', 'os arquivistas e conservadores de museus'),
  biologist: science('biologos-botanicos-zoologos-e-profissionais', 'os biólogos, botânicos e zoólogos'),
  biotech: science('biologos-botanicos-zoologos-e-profissionais', 'os biólogos, a função mais próxima'),
  geophysicist: science('geologos-e-geofisicos', 'os geólogos e geofísicos, a função mais próxima'),
  meteorologist: science('meteorologistas', 'os meteorologistas'),
  environment: science('profissionais-em-proteccao-ambiental', 'os profissionais de protecção ambiental'),
  physicist: science('fisicistas-e-astronomos', 'os físicos e astrónomos'),
  mathematician: science('matematicos-actuarios-e-estaticistas', 'os matemáticos, actuários e estatísticos'),
  food: wage(
    'inspectores-da-saude-ambiental-e-ocupacional-e',
    'os inspectores de saúde ambiental e ocupacional, a função mais próxima',
    'entre 196 984 e 699 612',
    'entre 319 423 e 1 181 326',
  ),
  officer: wage(
    'oficiais-de-bordo-e-pilotos',
    'os oficiais de bordo e pilotos',
    'entre 225 031 e 1 398 188',
    'entre 321 489 e 2 108 237',
  ),
  chemist: wage(
    'tecnicos-em-ciencias-fisica-e-quimica',
    'os técnicos de ciências físicas e químicas, a função mais próxima',
    'entre 227 255 e 1 385 341',
    'entre 281 531 e 1 878 949',
  ),
  statistician: publicPay(
    'um técnico superior de estatística de 2.ª classe',
    '361 910',
    'matematicos-actuarios-e-estaticistas',
    'os matemáticos, actuários e estatísticos',
    SCIENCE_START,
    SCIENCE_AFTER,
  ),
  researcher: publicPay(
    'um estagiário de investigação',
    '458 419',
    'biologos-botanicos-zoologos-e-profissionais',
    'os biólogos, uma das funções mais próximas',
    SCIENCE_START,
    SCIENCE_AFTER,
  ),
}

export const context = (
  ambient: string,
  hours: string,
  team: string,
  travel: string,
): Career['workContext'] => [
  { label: 'Ambiente', value: ambient },
  { label: 'Horário', value: hours },
  { label: 'Equipa', value: team },
  { label: 'Viagens', value: travel },
]

const PEOPLE = context(
  'Gabinete ou serviço, a falar com pessoas',
  'Normal',
  'Colegas de outras profissões e direcção',
  'Algumas',
)
const FIELDWORK = context(
  'Escritório e trabalho de campo nas comunidades',
  'Normal, com picos no terreno',
  'Técnicos, inquiridores e parceiros',
  'Frequentes, para as províncias',
)
const HERITAGE = context(
  'Museu, arquivo ou serviço de cultura',
  'Normal',
  'Técnicos e direcção',
  'Algumas, para sítios e outros museus',
)
const LABORATORY = context(
  'Laboratório',
  'Normal, com turnos nalgumas fábricas',
  'Técnicos e investigadores',
  'Raras',
)
const NATURE = context(
  'Campo e laboratório',
  'Irregular nas saídas de campo',
  'Investigadores e técnicos',
  'Frequentes',
)
const DESK = context(
  'Escritório ou universidade',
  'Normal, com picos perto dos prazos',
  'Investigadores e técnicos',
  'Raras',
)

const CV_STUDY: Career['cvGuide'] = {
  template: 'classico',
  include: [
    'A licenciatura, com a universidade, o ano e o tema do trabalho final',
    'Os estudos ou projectos em que participaste, com o teu papel',
    'As publicações e comunicações, se as tiveres',
    'Os programas que dominas e as línguas',
  ],
  avoid: [
    'Dados pessoais de pessoas que acompanhaste ou entrevistaste',
    'Listas de disciplinas sem exemplos',
    'Fotografia e dados pessoais que a vaga não pede',
  ],
}

const REPORTS = skill('relatorios-tecnicos', 'Relatórios técnicos')
const FIELD_METHODS = skill('metodos-investigacao', 'Métodos de investigação')
const INTERVIEWS = skill('entrevistas-campo', 'Entrevistas e trabalho de campo')
const STATISTICS = skill('estatistica-basica', 'Estatística aplicada')
const ENGLISH = skill('ingles-tecnico', 'Inglês técnico', 'opcional')
const LAB_SAFETY = skill('seguranca-laboratorio', 'Segurança no laboratório')
const LAB_METHODS = skill('tecnicas-laboratorio', 'Técnicas de laboratório')
const LISTENING = skill('escuta-activa', 'Escuta e entrevista')
const ETHICS = skill('etica-profissional', 'Ética e sigilo')
const DATA_TOOLS = skill('r-python-dados', 'Programas de análise de dados, como R ou Python')

const PSYCHOLOGY = degree(
  'Psicologia',
  'Muitas universidades têm o curso. Algumas já têm ramos do trabalho, escolar ou jurídico.',
)
const PSYCHOLOGY_ROUTE = (focus: string, job: PathwayStep): Career['pathways'] => [
  universityRoute(
    `Licenciatura em Psicologia, com atenção à ${focus}. Não encontrámos uma regra legal de inscrição: confirma na Ordem dos Psicólogos de Angola.`,
    [PSYCHOLOGY, job],
  ),
]

const RESEARCH_JOB = firstJob(
  'Estágio de investigação',
  'O Estatuto do Investigador Científico abre esta categoria a licenciados, por concurso documental, com contrato de 3 anos.',
)
const researchRoute = (name: string, description: string): Career['pathways'] => [
  universityRoute(
    'Na investigação, cada degrau pede mais estudos: mestrado para Assistente e doutoramento para Investigador Auxiliar.',
    [degree(name, description), RESEARCH_JOB],
  ),
]

const LADDER_RESEARCH: Parameters<typeof career>[1] = [
  ['Apoia projectos', 'Prepara o mestrado'],
  ['Conduz partes de um estudo', 'Publica com a equipa'],
  ['Lidera estudos', 'Orienta os mais novos'],
  ['Coordena linhas de investigação', 'Procura financiamento'],
]
const researchStages = (): Career['stages'] =>
  career(
    [
      'Estagiário de Investigação',
      'Assistente de Investigação',
      'Investigador Auxiliar',
      'Investigador Coordenador',
    ],
    LADDER_RESEARCH,
  )

const specialist = (title: string, lead: string, what: string): Career['stages'] =>
  ladder(title, lead, [
    ['Apoia os colegas', `Aprende ${what}`],
    ['Trabalha com autonomia', 'Escreve os seus relatórios'],
    ['Leva os casos mais difíceis', 'Orienta os mais novos'],
    ['Dirige a equipa', 'Responde pelo trabalho do serviço'],
  ])

const guide = ({
  postings,
  salary,
  sectors,
  extra = '',
  ...entry
}: Omit<Guide, 'market' | 'employerAsks' | 'cvGuide'> & {
  postings: number
  salary: TechSalary
  sectors: string[]
  extra?: string
}): Guide => {
  const base = marketOf(postings, salary, sectors, { name: 'ciências e humanidades', total: 28 })
  return {
    ...entry,
    employerAsks: null,
    market: {
      ...base,
      demandNote: base.demandNote && { ...base.demandNote, text: `${base.demandNote.text}${extra}` },
    },
    cvGuide: CV_STUDY,
  }
}

export const SCIENCES_GUIDES: Guide[] = [
  guide({
    slug: 'psicologo-do-trabalho',
    description:
      'Ajuda a escolher, formar e motivar as pessoas e a melhorar o ambiente de trabalho. Em Angola a função aparece quase sempre dentro dos recursos humanos, por isso os anúncios raramente pedem um psicólogo pelo nome.',
    dayToDay: [
      'Entrevistar candidatos',
      'Aplicar testes de selecção',
      'Preparar formações',
      'Medir o clima da empresa',
      'Apoiar equipas em conflito',
    ],
    workContext: PEOPLE,
    workStyles: ['Escuta', 'Discrição', 'Imparcialidade', 'Organização', 'Sentido prático'],
    skills: [
      skill('recrutamento-seleccao', 'Recrutamento e selecção'),
      skill('testes-psicologicos', 'Testes psicológicos'),
      skill('formacao-pessoas', 'Formação de pessoas'),
      LISTENING,
      ETHICS,
    ],
    pathways: PSYCHOLOGY_ROUTE(
      'psicologia das organizações',
      firstJob(
        'Primeiro emprego em recursos humanos',
        'Consultoras de recrutamento e departamentos de pessoal são a entrada mais comum.',
      ),
    ),
    stages: specialist('Psicólogo do Trabalho', 'Director de Recursos Humanos', 'os processos de selecção'),
    postings: 0,
    salary: SALARY.psychologist,
    sectors: ['Consultoras de recrutamento', 'Banca', 'Petróleo e gás', 'Grandes empresas'],
  }),
  guide({
    slug: 'psicologo-escolar',
    description:
      'Acompanha alunos com dificuldades de aprendizagem ou de comportamento e apoia professores e famílias. Não encontrámos anúncios com este nome nos últimos 12 meses.',
    dayToDay: [
      'Avaliar alunos com dificuldades',
      'Falar com as famílias',
      'Apoiar os professores',
      'Orientar escolhas de curso',
      'Preparar acções de prevenção',
    ],
    workContext: context(
      'Escola ou gabinete de apoio',
      'Horário escolar',
      'Professores, direcção e famílias',
      'Raras',
    ),
    workStyles: ['Paciência', 'Escuta', 'Discrição', 'Empatia', 'Organização'],
    skills: [
      skill('avaliacao-aprendizagem', 'Avaliação da aprendizagem'),
      skill('orientacao-vocacional', 'Orientação vocacional'),
      skill('desenvolvimento-infantil', 'Desenvolvimento da criança e do adolescente'),
      LISTENING,
      ETHICS,
    ],
    pathways: PSYCHOLOGY_ROUTE(
      'psicologia escolar',
      firstJob(
        'Trabalho num colégio ou serviço de apoio',
        'Aceita estágios em colégios ou ao lado de um psicólogo experiente.',
      ),
    ),
    stages: specialist('Psicólogo Escolar', 'Coordenador de Serviços de Psicologia', 'a avaliar alunos'),
    postings: 0,
    salary: SALARY.psychologist,
    sectors: ['Colégios privados', 'Escolas públicas', 'Serviços de educação'],
  }),
  guide({
    slug: 'psicologo-forense',
    description:
      'Avalia arguidos, vítimas e testemunhas e escreve relatórios para os tribunais. Há cursos de Psicologia Criminal e Jurídica em Angola, mas não encontrámos anúncios com este nome nos últimos 12 meses.',
    dayToDay: [
      'Entrevistar arguidos e vítimas',
      'Aplicar testes',
      'Escrever relatórios periciais',
      'Responder a perguntas do tribunal',
      'Apoiar vítimas de violência',
    ],
    workContext: context(
      'Gabinete, tribunais e serviços policiais',
      'Normal, com casos urgentes',
      'Investigadores, magistrados e médicos',
      'Algumas',
    ),
    workStyles: ['Imparcialidade', 'Resistência emocional', 'Rigor', 'Discrição', 'Escuta'],
    skills: [
      skill('avaliacao-psicologica', 'Avaliação psicológica'),
      skill('relatorios-periciais', 'Relatórios periciais'),
      skill('nocoes-direito-penal', 'Noções de direito penal'),
      LISTENING,
      ETHICS,
    ],
    pathways: PSYCHOLOGY_ROUTE(
      'psicologia criminal ou jurídica',
      firstJob(
        'Experiência clínica ou com vítimas',
        'Ganha prática em psicologia antes de escrever para os tribunais.',
      ),
    ),
    stages: specialist(
      'Psicólogo Forense',
      'Coordenador de Peritagem Psicológica',
      'a escrever relatórios periciais',
    ),
    postings: 0,
    salary: SALARY.psychologist,
    sectors: [
      'Serviço de Investigação Criminal',
      'Tribunais',
      'Serviços prisionais',
      'Prática por conta própria',
    ],
  }),
  guide({
    slug: 'sociologo',
    description:
      'Estuda como vivem os grupos e as comunidades, com inquéritos e entrevistas, para orientar projectos e políticas. Os anúncios raramente pedem um sociólogo pelo nome: o trabalho aparece como técnico social ou de projectos.',
    dayToDay: [
      'Desenhar inquéritos',
      'Fazer entrevistas e grupos de discussão',
      'Analisar os dados',
      'Escrever relatórios',
      'Apresentar recomendações',
    ],
    workContext: FIELDWORK,
    workStyles: ['Curiosidade', 'Escuta', 'Rigor', 'Respeito pelas comunidades', 'Clareza a escrever'],
    skills: [FIELD_METHODS, INTERVIEWS, STATISTICS, REPORTS, ENGLISH],
    pathways: [
      universityRoute('A licenciatura em Sociologia é a base. Programas de dados ajudam muito.', [
        degree('Sociologia', 'Dá a base de métodos, teoria social e inquéritos.'),
        firstJob(
          'Inquiridor ou assistente de projecto',
          'Institutos, ONG e consultoras contratam para estudos com prazo.',
        ),
      ]),
    ],
    stages: specialist('Sociólogo', 'Coordenador de Estudos', 'os métodos de campo'),
    postings: 0,
    salary: SALARY.sociologist,
    sectors: ['Ministérios', 'ONG', 'Organizações internacionais', 'Centros de estudos'],
  }),
  guide({
    slug: 'tecnico-de-salvaguardas-sociais',
    description:
      'Avalia como uma obra grande muda a vida das comunidades e planeia como reduzir os danos, por exemplo quando há famílias a realojar. Nos últimos 12 meses, o Ministério da Energia e Águas e a Conservation International anunciaram vagas.',
    dayToDay: [
      'Visitar as comunidades afectadas',
      'Fazer consultas públicas',
      'Preparar planos de compensação',
      'Receber e tratar queixas',
      'Reportar aos financiadores',
    ],
    workContext: FIELDWORK,
    workStyles: [
      'Respeito pelas comunidades',
      'Diplomacia',
      'Organização',
      'Resistência à pressão',
      'Honestidade',
    ],
    skills: [
      skill('impacto-social', 'Avaliação de impacto social'),
      skill('consulta-comunidades', 'Consulta às comunidades'),
      skill('reassentamento', 'Reassentamento e compensação'),
      REPORTS,
      ENGLISH,
    ],
    pathways: [
      universityRoute('Sociologia ou Serviço Social são as bases mais comuns.', [
        degree('Sociologia', 'Ou Serviço Social, Antropologia ou Direito.'),
        certification(
          'Licença Social de Operação',
          'Certificação sobre a aceitação de um projecto pelas comunidades, usada sobretudo no sector mineiro. Em Angola, um assistente social já a obteve. Confirma onde se faz.',
        ),
        firstJob(
          'Programa para recém-licenciados',
          'O Ministério da Energia e Águas procurou jovens recém-licenciados em Salvaguardas e Riscos Sociais.',
        ),
      ]),
    ],
    stages: specialist(
      'Técnico de Salvaguardas Sociais',
      'Especialista em Salvaguardas',
      'as regras dos financiadores',
    ),
    postings: 7,
    salary: SALARY.sociologist,
    sectors: ['Projectos públicos', 'Organizações ambientais', 'Mineração', 'Consultoras'],
  }),
  guide({
    slug: 'assistente-social',
    description:
      'Apoia famílias, crianças e idosos em situação difícil e liga-os aos apoios que existem. Em muitas organizações ainda não há serviço social, e a função é feita por pessoas com outra formação, por isso quem estudou a área tem de explicar o que sabe fazer.',
    dayToDay: [
      'Receber pessoas e ouvir o problema',
      'Visitar famílias',
      'Encaminhar para apoios',
      'Acompanhar casos',
      'Escrever relatórios sociais',
    ],
    workContext: context(
      'Hospitais, escolas, administrações e comunidades',
      'Normal',
      'Médicos, professores e técnicos',
      'Deslocações na zona',
    ),
    workStyles: ['Empatia', 'Paciência', 'Discrição', 'Resistência emocional', 'Organização'],
    skills: [
      skill('acompanhamento-casos', 'Acompanhamento de casos'),
      skill('politicas-sociais', 'Políticas sociais'),
      skill('mediacao-familiar', 'Mediação familiar'),
      LISTENING,
      ETHICS,
    ],
    pathways: [
      universityRoute(
        'A licenciatura em Serviço Social é a via própria. Não encontrámos regra de inscrição obrigatória. Existe uma Associação dos Assistentes Sociais de Angola.',
        [
          degree('Serviço Social', 'Dá a base de políticas sociais, intervenção e ética.'),
          firstJob(
            'Estágio numa instituição social',
            'Hospitais, administrações municipais e ONG são as entradas mais comuns.',
          ),
        ],
      ),
    ],
    stages: specialist('Assistente Social', 'Coordenador de Serviço Social', 'a acompanhar casos'),
    postings: 0,
    salary: SALARY.socialWorker,
    sectors: ['Hospitais', 'Administrações municipais', 'Ministério da Acção Social', 'ONG'],
  }),
  guide({
    slug: 'antropologo',
    description:
      'Estuda as culturas, as línguas e as tradições dos povos, convivendo com as comunidades. É uma profissão rara: o curso existe em poucas instituições, e o Museu Nacional de Antropologia, com 6 000 objectos, tinha em 2020 apenas seis técnicos superiores.',
    dayToDay: [
      'Viver e conversar com comunidades',
      'Registar tradições',
      'Estudar colecções de museu',
      'Escrever estudos',
      'Aconselhar projectos',
    ],
    workContext: FIELDWORK,
    workStyles: ['Curiosidade', 'Respeito', 'Paciência', 'Abertura a outras culturas', 'Rigor'],
    skills: [
      skill('etnografia', 'Etnografia'),
      INTERVIEWS,
      skill('linguas-nacionais', 'Línguas nacionais', 'opcional'),
      REPORTS,
      ENGLISH,
    ],
    pathways: [
      universityRoute('A licenciatura em Antropologia é a via directa.', [
        degree('Antropologia', 'Oferta rara no país: confirma onde abre.'),
        firstJob(
          'Assistente num museu ou projecto',
          'Museus e estudos de impacto social contratam antropólogos.',
        ),
      ]),
    ],
    stages: specialist('Antropólogo', 'Director de Museu', 'o trabalho de campo'),
    postings: 0,
    salary: SALARY.sociologist,
    sectors: ['Museus', 'Universidades', 'Projectos de desenvolvimento'],
  }),
  guide({
    slug: 'demografo',
    description:
      'Estuda a população, ou seja, os nascimentos, as mortes e as migrações, e prevê como vai mudar. O INE, que fez o Censo de 2024, é o empregador mais evidente.',
    dayToDay: [
      'Analisar dados do censo e de inquéritos',
      'Calcular taxas e projecções',
      'Preparar relatórios',
      'Fazer mapas da população',
      'Aconselhar quem planeia serviços',
    ],
    workContext: DESK,
    workStyles: ['Rigor', 'Paciência', 'Atenção ao pormenor', 'Curiosidade', 'Clareza a escrever'],
    skills: [skill('demografia', 'Análise demográfica'), STATISTICS, DATA_TOOLS, REPORTS, ENGLISH],
    pathways: [
      universityRoute('A licenciatura em Geodemografia é a via directa. Estatística também serve.', [
        degree('Geodemografia', 'Ou Estatística. A oferta de Geodemografia é rara.'),
        firstJob(
          'Técnico num instituto ou ministério',
          'Entra-se por concurso público no INE e nos ministérios.',
        ),
      ]),
    ],
    stages: specialist('Demógrafo', 'Director de Estudos da População', 'as fontes de dados'),
    postings: 0,
    salary: SALARY.sociologist,
    sectors: ['Instituto Nacional de Estatística', 'Ministérios', 'Organizações internacionais'],
  }),
  guide({
    slug: 'investigador-em-ciencias-sociais',
    description:
      'Investiga a sociedade, a história ou o pensamento e publica o que descobre. Quase sempre também ensina numa universidade. Nos últimos 12 meses apareceram consultorias de pesquisa, com prazo curto.',
    dayToDay: [
      'Ler o que já se escreveu',
      'Recolher dados ou documentos',
      'Analisar o que encontrou',
      'Escrever artigos',
      'Apresentar em conferências',
    ],
    workContext: DESK,
    workStyles: ['Curiosidade', 'Persistência', 'Espírito crítico', 'Independência', 'Clareza a escrever'],
    skills: [FIELD_METHODS, INTERVIEWS, skill('escrita-academica', 'Escrita académica'), STATISTICS, ENGLISH],
    pathways: researchRoute('Sociologia', 'Ou História, Filosofia ou Antropologia.'),
    stages: researchStages(),
    postings: 2,
    salary: SALARY.sociologist,
    sectors: ['Universidades', 'Centros de estudos', 'Consultoras'],
  }),
  guide({
    slug: 'historiador',
    description:
      'Investiga o passado em arquivos e documentos e conta-o em livros, aulas e exposições. Os locais de trabalho naturais são as universidades, os museus e o Arquivo Nacional.',
    dayToDay: [
      'Procurar documentos em arquivos',
      'Ouvir testemunhos orais',
      'Comparar fontes',
      'Escrever estudos',
      'Preparar aulas ou exposições',
    ],
    workContext: HERITAGE,
    workStyles: ['Paciência', 'Espírito crítico', 'Curiosidade', 'Rigor', 'Clareza a escrever'],
    skills: [
      skill('pesquisa-arquivo', 'Pesquisa em arquivos'),
      skill('critica-fontes', 'Análise crítica de fontes'),
      skill('escrita-academica', 'Escrita académica'),
      skill('historia-angola', 'História de Angola'),
      ENGLISH,
    ],
    pathways: [
      universityRoute('A licenciatura em História é a base. Ensinar exige a formação pedagógica.', [
        degree('História', 'Num instituto de ciências da educação ou numa faculdade.'),
        firstJob(
          'Museu, arquivo ou ensino',
          'Na escola pública e nos serviços de cultura entra-se por concurso.',
        ),
      ]),
    ],
    stages: specialist('Historiador', 'Director de Instituição Cultural', 'a pesquisa em arquivo'),
    postings: 0,
    salary: SALARY.historian,
    sectors: ['Universidades', 'Museus', 'Arquivos', 'Escolas'],
  }),
  guide({
    slug: 'arquivista',
    description:
      'Organiza e conserva documentos, em papel e digitais, para que se encontrem quando são precisos. Trabalha em arquivos públicos e também em empresas: nos últimos 12 meses houve anúncios de arquivista e de arquivo central.',
    dayToDay: [
      'Receber e classificar documentos',
      'Organizar o arquivo',
      'Digitalizar',
      'Atender pedidos',
      'Decidir o que se guarda ou elimina',
    ],
    workContext: context(
      'Arquivo, com muitas horas entre estantes e computador',
      'Normal',
      'Técnicos de documentação e outros serviços',
      'Raras',
    ),
    workStyles: ['Organização', 'Atenção ao pormenor', 'Discrição', 'Paciência', 'Método'],
    skills: [
      skill('classificacao-documentos', 'Classificação de documentos'),
      skill('digitalizacao', 'Digitalização'),
      skill('gestao-documental', 'Gestão documental'),
      skill('conservacao-papel', 'Conservação de papel', 'opcional'),
      ETHICS,
    ],
    pathways: [
      universityRoute('Ciência da Informação é a via directa. História também prepara.', [
        degree('Ciência da Informação', 'Ou História.'),
        firstJob(
          'Arquivo de uma empresa ou organismo',
          'Os bancos e os organismos públicos guardam muitos documentos.',
        ),
      ]),
    ],
    stages: specialist('Arquivista', 'Chefe de Arquivo', 'as regras de classificação'),
    postings: 2,
    salary: SALARY.archivist,
    sectors: ['Arquivo Nacional', 'Banca', 'Organismos públicos', 'Empresas grandes'],
  }),
  guide({
    slug: 'tecnico-de-patrimonio-cultural',
    description:
      'Estuda, protege e mostra ao público os monumentos, os sítios e os objectos históricos, como os de Mbanza Kongo. Em 2026, o Ministro da Cultura apontou a formação especializada como um dos desafios dos museus.',
    dayToDay: [
      'Inventariar peças e sítios',
      'Vigiar o estado de conservação',
      'Preparar exposições',
      'Falar com as comunidades',
      'Propor medidas de protecção',
    ],
    workContext: HERITAGE,
    workStyles: ['Rigor', 'Paciência', 'Cuidado', 'Curiosidade', 'Respeito pela memória'],
    skills: [
      skill('inventario-patrimonio', 'Inventário do património'),
      skill('conservacao-preventiva', 'Conservação preventiva'),
      skill('museologia', 'Museologia'),
      skill('digitalizacao', 'Digitalização'),
      REPORTS,
    ],
    pathways: [
      universityRoute('História e Antropologia são as bases mais próximas.', [
        degree('História', 'Ou Antropologia ou Arqueologia.'),
        firstJob(
          'Museu ou serviço de cultura',
          'Entra-se por concurso público. O Instituto Nacional do Património Cultural propõe acções de formação de técnicos.',
        ),
      ]),
    ],
    stages: specialist('Técnico de Património', 'Director de Museu', 'o inventário'),
    postings: 0,
    salary: SALARY.archivist,
    sectors: ['Museus', 'Instituto Nacional do Património Cultural', 'Ministério da Cultura'],
  }),
  guide({
    slug: 'biologo',
    description:
      'Estuda os seres vivos, das plantas e dos animais aos microrganismos, no campo e no laboratório. Quem estuda Biologia para ensinar é professor: como biólogo, o trabalho está em institutos, parques e estudos de impacto ambiental.',
    dayToDay: [
      'Recolher amostras no campo',
      'Identificar espécies',
      'Analisar no laboratório',
      'Escrever relatórios',
      'Propor medidas de protecção',
    ],
    workContext: NATURE,
    workStyles: ['Curiosidade', 'Paciência', 'Rigor', 'Resistência física', 'Gosto pela natureza'],
    skills: [
      skill('identificacao-especies', 'Identificação de espécies'),
      LAB_METHODS,
      skill('impacto-ambiental', 'Estudos de impacto ambiental'),
      STATISTICS,
      ENGLISH,
    ],
    pathways: researchRoute('Ciências Biológicas', 'Ou Biologia, num instituto de ciências da educação.'),
    stages: researchStages(),
    postings: 0,
    salary: SALARY.biologist,
    sectors: [
      'Institutos de investigação',
      'Áreas de conservação',
      'Consultoras de ambiente',
      'Universidades',
    ],
  }),
  guide({
    slug: 'biotecnologo',
    description:
      'Usa microrganismos e células para produzir alimentos, medicamentos e outros produtos. O curso existe em poucas instituições e não há anúncios com este nome: as saídas reais estão em laboratórios de investigação e no controlo de qualidade.',
    dayToDay: [
      'Preparar culturas de microrganismos',
      'Fazer experiências',
      'Controlar a produção',
      'Registar resultados',
      'Escrever relatórios',
    ],
    workContext: LABORATORY,
    workStyles: ['Rigor', 'Paciência', 'Curiosidade', 'Organização', 'Atenção ao pormenor'],
    skills: [LAB_METHODS, skill('microbiologia', 'Microbiologia'), LAB_SAFETY, STATISTICS, ENGLISH],
    pathways: researchRoute('Biotecnologia', 'Oferta rara no país: confirma onde abre.'),
    stages: researchStages(),
    postings: 0,
    salary: SALARY.biotech,
    sectors: ['Institutos de investigação', 'Indústria alimentar', 'Indústria farmacêutica'],
  }),
  guide({
    slug: 'oceanografo',
    description:
      'Estuda o mar: as correntes, a água e a vida marinha da costa angolana. O principal empregador é o Instituto Nacional de Investigação Pesqueira e Marinha, que usa o navio oceanográfico Baía Farta e faz campanhas com cientistas estrangeiros.',
    dayToDay: [
      'Preparar campanhas no mar',
      'Recolher amostras e dados',
      'Avaliar recursos pesqueiros',
      'Analisar resultados',
      'Aconselhar quem decide as quotas de pesca',
    ],
    workContext: context(
      'Laboratório e navio de investigação',
      'Campanhas de semanas no mar',
      'Cientistas e tripulação',
      'Frequentes, no mar',
    ),
    workStyles: ['Curiosidade', 'Resistência física', 'Rigor', 'Trabalho em equipa', 'Paciência'],
    skills: [
      skill('oceanografia', 'Oceanografia'),
      skill('avaliacao-pescas', 'Avaliação de recursos pesqueiros'),
      STATISTICS,
      REPORTS,
      ENGLISH,
    ],
    pathways: researchRoute('Oceanografia', 'Oferta rara no país. Biologia e Física também servem.'),
    stages: researchStages(),
    postings: 0,
    salary: SALARY.geophysicist,
    sectors: ['Investigação pesqueira', 'Ambiente', 'Petróleo e gás'],
  }),
  guide({
    slug: 'meteorologista',
    description:
      'Observa a atmosfera e prevê o tempo e o clima, para a aviação, a agricultura e a protecção civil. O INAMET é o principal empregador, e a procura de novos técnicos deve crescer: em 2018, 68,4% do seu pessoal técnico tinha entre 51 e 60 anos.',
    dayToDay: [
      'Ler dados de estações e satélites',
      'Correr modelos de previsão',
      'Escrever boletins',
      'Avisar sobre tempo perigoso',
      'Apoiar voos',
    ],
    workContext: context(
      'Centro de previsão, aeroporto ou estação',
      'Por turnos',
      'Previsores, observadores e técnicos',
      'Algumas, para as estações',
    ),
    workStyles: ['Atenção ao pormenor', 'Calma', 'Rigor', 'Responsabilidade', 'Curiosidade'],
    skills: [
      skill('previsao-tempo', 'Previsão do tempo'),
      skill('meteorologia-aeronautica', 'Meteorologia aeronáutica', 'opcional'),
      STATISTICS,
      DATA_TOOLS,
      ENGLISH,
    ],
    pathways: [
      universityRoute('Meteorologia é a via directa. Física ou Matemática também servem.', [
        degree('Meteorologia', 'Ou Física.'),
        {
          ...certification(
            'Competência em meteorologia aeronáutica',
            'Quem trabalha para a aviação precisa de formação especializada: o INAMET certifica a competência técnica do seu pessoal.',
          ),
          need: 'recomendado',
        },
        firstJob('Observador ou previsor no INAMET', 'Confirma os concursos no instituto.'),
      ]),
    ],
    stages: specialist('Meteorologista', 'Chefe de Previsão', 'a ler os modelos'),
    postings: 1,
    salary: SALARY.meteorologist,
    sectors: ['Instituto Nacional de Meteorologia', 'Aeroportos', 'Petróleo e gás'],
  }),
  guide({
    slug: 'tecnico-de-conservacao-da-natureza',
    description:
      'Protege a fauna e a flora dos parques e das reservas: acompanha as espécies, fiscaliza e trabalha com as comunidades. Em 2026, a African Parks recrutou 8 técnicos para o Parque Nacional do Iona. Em 2020, o INBAC tinha cerca de 150 fiscais.',
    dayToDay: [
      'Patrulhar o parque',
      'Acompanhar animais e plantas',
      'Registar dados no campo',
      'Falar com as comunidades',
      'Combater a caça ilegal',
    ],
    workContext: context(
      'Parques e reservas, longe das cidades',
      'Turnos longos no campo',
      'Fiscais, técnicos e comunidades',
      'Vive-se perto do parque',
    ),
    workStyles: [
      'Resistência física',
      'Coragem',
      'Gosto pela natureza',
      'Respeito pelas comunidades',
      'Disciplina',
    ],
    skills: [
      skill('monitorizacao-fauna', 'Monitorização de fauna'),
      skill('fiscalizacao-ambiental', 'Fiscalização ambiental'),
      skill('gps-mapas', 'GPS e mapas'),
      skill('sobrevivencia-campo', 'Trabalho no mato'),
      skill('dialogo-comunidades', 'Diálogo com comunidades'),
    ],
    pathways: [
      universityRoute('Biologia ou Ciências Agrárias dão a base. A prática no campo pesa muito.', [
        degree('Ciências Biológicas', 'Ou Biologia.'),
        {
          ...certification(
            'Formação de guardas de parque',
            'O Southern African Wildlife College, na África do Sul, recebeu em 2026 guardas de Angola num programa regional. Confirma as candidaturas com o INBAC.',
          ),
          need: 'recomendado',
        },
        firstJob('Técnico num parque', 'Confirma os concursos no INBAC e as vagas da African Parks.'),
      ]),
    ],
    stages: specialist('Técnico de Conservação', 'Gestor de Parque', 'a trabalhar no campo'),
    postings: 1,
    salary: SALARY.environment,
    sectors: ['Instituto da Biodiversidade', 'Gestão de parques', 'ONG ambientais'],
  }),
  guide({
    slug: 'tecnico-de-qualidade-alimentar',
    description:
      'Analisa os alimentos e controla a higiene da produção, para que cheguem seguros a quem os come. A Refriango, por exemplo, anuncia a norma ISO 22000 e tinha em 2016 mais de 20 técnicos num laboratório próprio.',
    dayToDay: [
      'Recolher amostras na fábrica',
      'Fazer análises',
      'Verificar a higiene',
      'Registar os resultados',
      'Parar um lote com problemas',
    ],
    workContext: LABORATORY,
    workStyles: ['Rigor', 'Atenção ao pormenor', 'Responsabilidade', 'Organização', 'Firmeza'],
    skills: [
      skill('haccp', 'HACCP (controlo de riscos nos alimentos)'),
      skill('iso-22000', 'ISO 22000 (segurança alimentar)'),
      skill('analises-microbiologicas', 'Análises microbiológicas'),
      LAB_METHODS,
      REPORTS,
    ],
    pathways: [
      universityRoute('Engenharia Alimentar ou Química são as bases mais próximas.', [
        degree('Engenharia Agro-Alimentar', 'Ou Química ou Tecnologia de Alimentos.'),
        {
          ...certification(
            'HACCP e ISO 22000',
            'São as referências que os anúncios pedem. Não encontrámos em Luanda um curso público com datas: confirma no IANORQ, o instituto de normalização.',
          ),
          need: 'recomendado',
        },
        firstJob(
          'Técnico de laboratório numa fábrica',
          'Fábricas de bebidas e de alimentos anunciam estas funções.',
        ),
      ]),
    ],
    stages: specialist('Técnico de Qualidade', 'Director de Qualidade', 'as análises'),
    postings: 2,
    salary: SALARY.food,
    sectors: ['Bebidas', 'Alimentos', 'Laboratórios', 'Serviços do Estado'],
  }),
  guide({
    slug: 'tecnico-de-recursos-hidricos',
    description:
      'Estuda os rios e as águas subterrâneas e planeia captações, barragens e regadios. Em 2026, o projecto RECLIMA do Ministério da Energia e Águas procurou vários jovens em hidrogeologia e hidráulica, sobretudo no sul do país.',
    dayToDay: [
      'Medir caudais e furos',
      'Estudar as bacias',
      'Preparar mapas',
      'Acompanhar obras de água',
      'Escrever relatórios',
    ],
    workContext: context(
      'Campo e escritório',
      'Normal, com saídas',
      'Engenheiros, geólogos e comunidades',
      'Frequentes, para as províncias',
    ),
    workStyles: ['Rigor', 'Sentido prático', 'Resistência física', 'Trabalho em equipa', 'Curiosidade'],
    skills: [
      skill('hidrologia', 'Hidrologia'),
      skill('hidrogeologia', 'Hidrogeologia'),
      skill('sig-mapas', 'Sistemas de informação geográfica'),
      REPORTS,
      ENGLISH,
    ],
    pathways: [
      universityRoute(
        'Engenharia Hidráulica é a via directa. Geologia também serve para as águas subterrâneas.',
        [
          degree('Engenharia Hidráulica', 'Ou Hidráulica e Recursos Hídricos, ou Geologia.'),
          firstJob(
            'Programa para jovens profissionais',
            'Em 2026, os anúncios do RECLIMA foram para Cunene, Huíla, Cuando Cubango e Luanda.',
          ),
        ],
      ),
    ],
    stages: specialist('Técnico de Recursos Hídricos', 'Chefe de Departamento de Águas', 'a medir no campo'),
    postings: 7,
    salary: SALARY.geophysicist,
    sectors: ['Projectos de água', 'Instituto Nacional de Recursos Hídricos', 'Construção', 'Energia'],
  }),
  guide({
    slug: 'oficial-da-marinha-mercante',
    description:
      'Conduz navios de carga, de passageiros e de apoio às plataformas petrolíferas e responde pela segurança a bordo. Os certificados seguem a Convenção STCW, a norma internacional de formação de quem trabalha no mar, e emitem-se em Angola pelo sector dos Transportes.',
    dayToDay: [
      'Fazer quartos na ponte de comando',
      'Planear a rota',
      'Controlar carga e estabilidade',
      'Fazer exercícios de segurança',
      'Cumprir os registos de bordo',
    ],
    workContext: context('Navios e portos', 'Quartos a bordo, semanas no mar', 'Tripulação', 'Constantes'),
    workStyles: ['Disciplina', 'Calma', 'Liderança', 'Responsabilidade', 'Resistência física'],
    skills: [
      skill('navegacao', 'Navegação'),
      skill('seguranca-mar', 'Segurança no mar'),
      skill('regulamento-abalroamentos', 'Regras internacionais do mar'),
      skill('ingles-maritimo', 'Inglês marítimo'),
      skill('gestao-carga', 'Gestão de carga'),
    ],
    pathways: [
      universityRoute('A carreira exige formação náutica, certificados STCW e tempo de mar.', [
        degree('Navegação', 'Ciências Náuticas ou curso equivalente.'),
        {
          ...certification(
            'Certificados STCW',
            'Começa pela segurança básica no mar. A Resilience QHSE diz ser um dos três centros aprovados em Angola. Confirma na Agência Marítima Nacional os certificados que valem para cada posto.',
          ),
          need: 'essencial',
        },
        firstJob(
          'Cadete a bordo',
          'O tempo de mar conta para subir de posto. Confirma as regras na Agência Marítima Nacional.',
        ),
      ]),
    ],
    stages: career(
      ['Cadete', 'Oficial Chefe de Quarto', 'Imediato', 'Comandante'],
      [
        ['Aprende a bordo', 'Cumpre tempo de mar'],
        ['Faz quartos na ponte', 'Controla a navegação'],
        ['É o segundo do navio', 'Responde pela carga e pela tripulação'],
        ['Comanda o navio', 'Responde por tudo a bordo'],
      ],
    ),
    postings: 4,
    salary: SALARY.officer,
    sectors: ['Navegação', 'Offshore', 'Portos'],
  }),
  guide({
    slug: 'quimico',
    description:
      'Analisa e transforma substâncias no laboratório, para controlar a qualidade e criar produtos. Muitos licenciados em Química vão para o ensino: como químico, o trabalho está em fábricas, no tratamento de água e na indústria petrolífera.',
    dayToDay: [
      'Preparar amostras',
      'Fazer análises',
      'Calibrar equipamentos',
      'Registar resultados',
      'Melhorar processos',
    ],
    workContext: LABORATORY,
    workStyles: ['Rigor', 'Atenção ao pormenor', 'Organização', 'Paciência', 'Curiosidade'],
    skills: [
      skill('quimica-analitica', 'Química analítica'),
      LAB_METHODS,
      LAB_SAFETY,
      skill('controlo-qualidade', 'Controlo de qualidade'),
      ENGLISH,
    ],
    pathways: [
      universityRoute('A licenciatura em Química é a base.', [
        degree('Química', 'Numa faculdade de ciências ou num instituto de ciências da educação.'),
        firstJob(
          'Técnico de laboratório',
          'Fábricas de bebidas, tintas e tratamento de água são entradas comuns.',
        ),
      ]),
    ],
    stages: specialist('Químico', 'Chefe de Laboratório', 'os métodos de análise'),
    postings: 1,
    salary: SALARY.chemist,
    sectors: ['Bebidas e alimentos', 'Petróleo e gás', 'Tratamento de água', 'Tintas'],
  }),
  guide({
    slug: 'fisico',
    description:
      'Estuda a matéria e a energia e usa o que sabe em medições, satélites e energia. Em Angola, as saídas são o ensino superior, a investigação e o programa espacial: em 2026, o GGPEN enviou cinco especialistas a França para mestrados ligados ao satélite ANGEO-1.',
    dayToDay: [
      'Montar medições e experiências',
      'Fazer modelos no computador',
      'Analisar dados',
      'Escrever relatórios',
      'Dar aulas',
    ],
    workContext: DESK,
    workStyles: ['Curiosidade', 'Pensamento abstracto', 'Persistência', 'Rigor', 'Paciência'],
    skills: [
      skill('fisica-aplicada', 'Física aplicada'),
      skill('modelacao', 'Modelação matemática'),
      DATA_TOOLS,
      STATISTICS,
      ENGLISH,
    ],
    pathways: researchRoute('Física', 'Numa faculdade de ciências ou num instituto de ciências da educação.'),
    stages: researchStages(),
    postings: 0,
    salary: SALARY.physicist,
    sectors: ['Universidades', 'Programa espacial', 'Investigação'],
  }),
  guide({
    slug: 'matematico',
    description:
      'Resolve problemas com modelos matemáticos, para prever, optimizar e calcular riscos. Os anúncios com este nome são quase todos de professor: quem quer outra saída junta a matemática aos dados e às finanças, por exemplo em bancos e seguradoras.',
    dayToDay: [
      'Perceber o problema',
      'Construir um modelo',
      'Programar os cálculos',
      'Testar os resultados',
      'Explicar o que significam',
    ],
    workContext: DESK,
    workStyles: ['Pensamento abstracto', 'Persistência', 'Rigor', 'Curiosidade', 'Paciência'],
    skills: [
      skill('modelacao', 'Modelação matemática'),
      STATISTICS,
      DATA_TOOLS,
      skill('optimizacao', 'Optimização'),
      ENGLISH,
    ],
    pathways: researchRoute(
      'Matemática',
      'Numa faculdade de ciências ou num instituto de ciências da educação.',
    ),
    stages: researchStages(),
    postings: 0,
    salary: SALARY.mathematician,
    sectors: ['Universidades', 'Banca e seguros', 'Institutos de investigação'],
    extra: ' Os anúncios de professor de Matemática contam-se na Educação.',
  }),
  guide({
    slug: 'estatistico',
    description:
      'Planeia inquéritos e recenseamentos e tira conclusões dos números que recolhem. O INE é a maior referência no Estado, e as mesmas capacidades servem bancos e organizações internacionais.',
    dayToDay: [
      'Desenhar amostras e questionários',
      'Limpar dados',
      'Fazer análises',
      'Preparar quadros e gráficos',
      'Explicar os resultados',
    ],
    workContext: DESK,
    workStyles: ['Rigor', 'Atenção ao pormenor', 'Curiosidade', 'Organização', 'Clareza a explicar'],
    skills: [
      skill('amostragem', 'Amostragem e inquéritos'),
      STATISTICS,
      DATA_TOOLS,
      skill('excel-relatorios', 'Excel e relatórios'),
      ENGLISH,
    ],
    pathways: [
      universityRoute('A licenciatura em Estatística é a via directa. Matemática também serve.', [
        degree('Estatística', 'Ou Matemática.'),
        firstJob(
          'Técnico num instituto ou empresa',
          'No Estado entra-se por concurso, e o Censo de 2024 teve mais de 200 mil candidatos a agente de campo.',
        ),
      ]),
    ],
    stages: career(
      [
        'Técnico Superior de Estatística de 2.ª Classe',
        'Estatístico',
        'Estatístico Sénior',
        'Director de Estatística',
      ],
      [
        ['Limpa dados', 'Prepara quadros'],
        ['Faz análises', 'Desenha inquéritos'],
        ['Leva estudos grandes', 'Orienta colegas'],
        ['Dirige a equipa', 'Responde pela qualidade dos números'],
      ],
    ),
    postings: 2,
    salary: SALARY.statistician,
    sectors: ['Instituto Nacional de Estatística', 'Banca', 'Organizações internacionais', 'Ministérios'],
  }),
  guide({
    slug: 'investigador-cientifico',
    description:
      'Faz investigação no laboratório ou no campo e publica o que descobre. A carreira do Estado começa em Estagiário de Investigação, aberta a licenciados por concurso documental, com a exigência de fazer o mestrado e depois o doutoramento para subir.',
    dayToDay: [
      'Definir uma pergunta de investigação',
      'Fazer experiências ou estudos',
      'Analisar os dados',
      'Escrever artigos',
      'Procurar financiamento',
    ],
    workContext: LABORATORY,
    workStyles: ['Curiosidade', 'Persistência', 'Rigor', 'Honestidade', 'Independência'],
    skills: [
      FIELD_METHODS,
      skill('escrita-academica', 'Escrita académica'),
      STATISTICS,
      LAB_METHODS,
      ENGLISH,
    ],
    pathways: researchRoute(
      'Ciências Biológicas',
      'Ou Química, Física ou outra ciência: a área define a linha de investigação.',
    ),
    stages: researchStages(),
    postings: 0,
    salary: SALARY.researcher,
    sectors: ['Centro Nacional de Investigação Científica', 'Universidades', 'Institutos públicos'],
    extra: ' Não há anúncios porque se entra por concurso.',
  }),
]

export const employer = (
  id: string,
  name: string,
  sector: CompanySector,
  summary: string,
  careers: string[],
  careersSourced: boolean,
  areas: CareerGroup[],
  source: SourceLink,
  province = 'Luanda',
): Company => ({
  id,
  name,
  sector,
  province,
  place: province,
  summary,
  careers,
  careersSourced,
  areas,
  programs: [],
  partners: [],
  sources: [source],
})

export const SCIENCES_COMPANIES: Company[] = [
  employer(
    'kept-people',
    'KEPT PEOPLE',
    'consultoria',
    'Anuncia vagas para outras empresas em Angola, sobretudo em banca e tecnologia.',
    ['psicologo-do-trabalho'],
    false,
    ['psicologia'],
    {
      label: 'Jobartis: anúncio da KEPT PEOPLE',
      url: 'https://www.jobartis.com/emprego-kept-people-consultor-legal',
    },
  ),
  employer(
    'museu-nacional-de-antropologia',
    'Museu Nacional de Antropologia',
    'estado',
    'Museu em Luanda com um acervo de 6 000 objectos. Em 2020 tinha seis técnicos superiores e dizia precisar de mais.',
    ['antropologo', 'tecnico-de-patrimonio-cultural'],
    false,
    ['ciencias_sociais', 'humanidades'],
    {
      label: 'Ver Angola: museu precisa de técnicos (2020)',
      url: 'https://www.verangola.net/va/pt/022020/Cultura/18602/Museu-de-antropologia-precisa-de-t%C3%A9cnicos-para-acervo-com-6000-objectos.htm',
    },
  ),
  employer(
    'instituto-nacional-do-patrimonio-cultural',
    'Instituto Nacional do Património Cultural (INPC)',
    'estado',
    'Gere a informação sobre os museus e os bens culturais e propõe a formação de técnicos e investigadores.',
    ['tecnico-de-patrimonio-cultural', 'historiador', 'antropologo'],
    false,
    ['humanidades', 'ciencias_sociais'],
    {
      label: 'Decreto Presidencial n.º 16/21 (AngoLEX)',
      url: 'https://angolex.com/paginas/decreto-presidencial/estatuto-organico-do-instituto-nacional-do-patrimonio-cultural-16a-21a.html',
    },
  ),
  employer(
    'arquivo-nacional-de-angola',
    'Arquivo Nacional de Angola',
    'estado',
    'O órgão que orienta a política de arquivos do país.',
    ['arquivista', 'historiador'],
    false,
    ['humanidades'],
    {
      label: 'Decreto Presidencial n.º 1/21 (Lex.AO)',
      url: 'https://lex.ao/docs/presidente-da-republica/2021/decreto-presidencial-n-o-1-21-de-04-de-janeiro/',
    },
  ),
  employer(
    'instituto-nacional-de-investigacao-pesqueira-e-marinha',
    'Instituto Nacional de Investigação Pesqueira e Marinha (INIPM)',
    'estado',
    'Estuda os recursos do mar angolano e trabalha com o navio oceanográfico Baía Farta.',
    ['oceanografo', 'biologo'],
    false,
    ['ciencias_vida'],
    {
      label: 'Ver Angola: navio Baía Farta (2023)',
      url: 'https://www.verangola.net/va/pt/122023/Ambiente/38110/Entrega-do-navio-oceanogr%C3%A1fico-Ba%C3%ADa-Farta-prevista-para-Maio-do-pr%C3%B3ximo-ano.htm',
    },
  ),
  employer(
    'instituto-nacional-de-meteorologia-e-geofisica-inamet',
    'Instituto Nacional de Meteorologia e Geofísica (INAMET)',
    'estado',
    'Presta os serviços de meteorologia e geofísica e certifica a competência técnica do seu pessoal.',
    ['meteorologista', 'fisico'],
    false,
    ['ciencias_vida', 'ciencias_exactas'],
    {
      label: 'Decreto Presidencial n.º 230/14 (Lex.AO)',
      url: 'https://lex.ao/docs/presidente-da-republica/2014/decreto-presidencial-n-o-230-14-de-04-de-setembro/',
    },
  ),
  employer(
    'instituto-nacional-de-recursos-hidricos',
    'Instituto Nacional de Recursos Hídricos (INRH)',
    'estado',
    'Executa a política nacional da água: planeamento, gestão, protecção e fiscalização.',
    ['tecnico-de-recursos-hidricos'],
    false,
    ['ciencias_vida'],
    { label: 'FAOLEX: estatuto do INRH', url: 'https://faolex.fao.org/docs/pdf/ang154238.pdf' },
  ),
  employer(
    'african-parks',
    'African Parks',
    'agricultura',
    'Gere o Parque Nacional do Iona, no Namibe, desde o acordo de 2019 com o Estado. Em 2026 recrutou 8 técnicos para o parque.',
    ['tecnico-de-conservacao-da-natureza', 'biologo'],
    true,
    ['ciencias_vida'],
    {
      label: 'AngoRecruta: técnicos para o Parque do Iona',
      url: 'https://angorecruta.com/a-african-parks-recruta-08-tecnicos-para-parque-nacional-de-iona/',
    },
    'Namibe',
  ),
  employer(
    'conservation-international',
    'Conservation International',
    'agricultura',
    'Organização ambiental. Anunciou em Luanda uma vaga de gestor de salvaguardas e conformidade.',
    ['tecnico-de-salvaguardas-sociais'],
    true,
    ['ciencias_sociais'],
    {
      label: 'Jobartis: gestor de salvaguardas',
      url: 'https://www.jobartis.com/emprego-conservation-international-gestor-de-salvaguardas-e-conformidade',
    },
  ),
  employer(
    'ianorq',
    'Instituto Angolano de Normalização e Qualidade (IANORQ)',
    'estado',
    'Gere o sistema de certificação de Angola.',
    ['tecnico-de-qualidade-alimentar', 'quimico'],
    false,
    ['ciencias_vida'],
    {
      label: 'trade.gov: normas em Angola',
      url: 'https://www.trade.gov/country-commercial-guides/angola-standards-trade',
    },
  ),
  employer(
    'refriango',
    'Refriango',
    'industria',
    'Fabricante de bebidas em Luanda. Anuncia a norma ISO 22000 e tinha em 2016 um laboratório de qualidade com mais de 20 técnicos.',
    ['tecnico-de-qualidade-alimentar', 'quimico'],
    true,
    ['ciencias_vida', 'ciencias_exactas'],
    {
      label: 'Ver Angola: laboratório da Refriango (2016)',
      url: 'https://www.verangola.net/va/pt/042016/ComercioIndustria/4231/Inova%C3%A7%C3%A3o-e-qualidade-das-marcas-Refriango-valem-11-medalhas-em-concurso-internacional.htm',
    },
  ),
  employer(
    'merlahen',
    'Merlahen Comércio e Indústria',
    'industria',
    'Anunciou uma vaga de químico de tintas industriais.',
    ['quimico'],
    true,
    ['ciencias_exactas'],
    {
      label: 'Jobartis: químico de tintas',
      url: 'https://www.jobartis.com/emprego-merlahen-comercio-e-industria-industrial-paint-chemist-2a0e409a-edef-40c4-b8a0-49a0ac239a38',
    },
  ),
  employer(
    'agencia-maritima-nacional',
    'Agência Marítima Nacional (AMN)',
    'transportes',
    'Regula o sector marítimo e portuário. Nasceu em 2021 da fusão do IMPA com o instituto hidrográfico.',
    ['oficial-da-marinha-mercante'],
    false,
    ['ciencias_vida'],
    {
      label: 'Decreto Presidencial n.º 292/21 (Lex.AO)',
      url: 'https://lex.ao/docs/presidente-da-republica/2021/decreto-presidencial-n-o-292-21-de-08-de-dezembro/',
    },
  ),
  employer(
    'premier-yangue',
    'Premier Yangue',
    'transportes',
    'Anunciou uma vaga de imediato ou oficial de convés, na província do Zaire.',
    ['oficial-da-marinha-mercante'],
    true,
    ['ciencias_vida'],
    {
      label: 'Jobartis: chief officer ou deck officer',
      url: 'https://www.jobartis.com/emprego-premier-yangue-chief-officer-ou-deck-officer-oow',
    },
    'Zaire',
  ),
]
