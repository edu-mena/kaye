import type { Career, CareerGroup, Company, PathwayStep, SourceLink } from '../types'
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

// The public administration careers' full pages (ADR 0010), from public sources:
// - the demand: the job ads of the last 12 months, 123 in the area; the State's competitions go in the note;
// - the salaries: the State's base pay on entry (Decreto Presidencial 16/26, already in the summaries) and the
//   WageIndicator 2026 survey, in the demand note;
// - the rules: Decreto Presidencial n.º 209/11 (the diplomat's statute), n.º 194/17 (the SIC's careers), the SNCP's
//   2026 circular and the ENAPP's competitions. No source gave the police officers' entry rules, so that guide says to
//   confirm them on the competition's portal.

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

const WAGE = 'https://wageindicator.org/pt-ao/trabalho-em-angola/trabalho-e-salario/'
const POLICY_START = 'entre 224 459 e 664 821'
const POLICY_AFTER = 'entre 371 529 e 1 063 271'
const POLICE_START = 'entre 183 438 e 652 181'
const POLICE_AFTER = 'entre 285 029 e 1 143 054'

export const publicPay = (
  who: string,
  base: string,
  page: string,
  occupation: string,
  start: string,
  after: string,
): TechSalary => ({
  text: `No Estado, ${who} entra com ${base} Kz de salário base por mês (Decreto Presidencial 16/26). O inquérito WageIndicator de 2026 dá, para ${occupation}, ${start} Kz líquidos por mês no início da carreira e ${after} Kz após 5 anos.`,
  source: { label: 'WageIndicator, Angola 2026', url: `${WAGE}${page}/` },
})

const SALARY = {
  civil: publicPay(
    'um técnico superior de 2.ª classe',
    '361 910',
    'profissionais-em-administracao-de-politicas',
    'os profissionais de administração de políticas',
    POLICY_START,
    POLICY_AFTER,
  ),
  procurement: wage('compradores', 'os compradores, a função mais próxima', POLICE_START, POLICE_AFTER),
  diplomat: publicPay(
    'um adido',
    '361 910',
    'profissionais-em-administracao-de-politicas',
    'os profissionais de administração de políticas, a função mais próxima',
    POLICY_START,
    POLICY_AFTER,
  ),
  cooperation: wage(
    'profissionais-em-administracao-de-politicas',
    'os profissionais de administração de políticas, a função mais próxima',
    POLICY_START,
    POLICY_AFTER,
  ),
  analyst: wage(
    'filosofos-historiadores-e-cientistas-politicos',
    'os filósofos, historiadores e cientistas políticos',
    'entre 271 001 e 1 317 401',
    'entre 407 570 e 2 082 004',
  ),
  police: publicPay(
    'um subinspector',
    '352 905',
    'inspectores-da-policia-e-detectives',
    'os inspectores da polícia e detectives',
    POLICE_START,
    POLICE_AFTER,
  ),
  forensic: wage(
    'tecnicos-em-ciencias-fisica-e-quimica',
    'os técnicos de ciências físicas e químicas, a função mais próxima',
    'entre 227 255 e 1 385 341',
    'entre 281 531 e 1 878 949',
  ),
}

const INTERIOR_COMPETITION =
  ' Não há anúncios porque se entra por concurso público: o do Ministério do Interior de 2026 tem 7 682 vagas, com as provas até Junho de 2027.'

const OFFICE: Career['workContext'] = [
  { label: 'Ambiente', value: 'Gabinete de um ministério, governo provincial ou administração municipal' },
  { label: 'Horário', value: 'Normal, com picos perto dos prazos' },
  { label: 'Equipa', value: 'Técnicos, chefes de departamento e direcção' },
  { label: 'Viagens', value: 'Algumas, para as províncias e municípios' },
]
const ABROAD: Career['workContext'] = [
  { label: 'Ambiente', value: 'Ministério, embaixadas, consulados e reuniões internacionais' },
  { label: 'Horário', value: 'Irregular, com eventos e diferenças de fuso' },
  { label: 'Equipa', value: 'Colegas angolanos e delegações de outros países' },
  { label: 'Viagens', value: 'Frequentes, com anos a viver fora do país' },
]
const PROJECTS: Career['workContext'] = [
  { label: 'Ambiente', value: 'Escritório, com visitas aos projectos' },
  { label: 'Horário', value: 'Normal, com picos perto dos relatórios' },
  { label: 'Equipa', value: 'Técnicos nacionais e estrangeiros' },
  { label: 'Viagens', value: 'Frequentes, para as províncias' },
]
const STUDY: Career['workContext'] = [
  { label: 'Ambiente', value: 'Universidade, centro de estudos ou escritório' },
  { label: 'Horário', value: 'Flexível, com picos em eleições e relatórios' },
  { label: 'Equipa', value: 'Investigadores e jornalistas' },
  { label: 'Viagens', value: 'Algumas, para trabalho de campo' },
]
const POLICE: Career['workContext'] = [
  { label: 'Ambiente', value: 'Rua, esquadras e gabinetes' },
  { label: 'Horário', value: 'Por turnos, com noites e fins-de-semana' },
  { label: 'Equipa', value: 'Agentes, investigadores e magistrados' },
  { label: 'Viagens', value: 'A colocação pode ser noutra província' },
]

const CV: Career['cvGuide'] = {
  template: 'classico',
  include: [
    'A licenciatura, com a universidade e o ano',
    'A formação complementar, com a entidade e as horas',
    'Os projectos ou processos em que trabalhaste, com o resultado',
    'As línguas, sobretudo o inglês e o francês',
  ],
  avoid: [
    'Documentos internos ou dados de processos',
    'Opiniões políticas pessoais',
    'Fotografia e dados pessoais que o concurso não pede',
  ],
}

const WRITING = skill('redaccao-administrativa', 'Redacção de pareceres e relatórios')
const PUBLIC_LAW = skill('direito-administrativo', 'Direito administrativo')
const ENGLISH = skill('ingles-trabalho', 'Inglês de trabalho')
const NEGOTIATION = skill('negociacao', 'Negociação')
const ETHICS = skill('etica-publica', 'Ética e integridade')
const EVIDENCE = skill('recolha-prova', 'Recolha e preservação de provas')
const CRIMINAL_LAW = skill('direito-penal', 'Direito penal e processual penal')

const mandatory = (step: PathwayStep): PathwayStep => ({ ...step, need: 'essencial' })

const COMPETITION = mandatory(
  firstJob(
    'Concurso público',
    'Os concursos dos ministérios e institutos correm pela Entidade Recrutadora Única, conduzidos pela ENAPP, com uma prova de conhecimentos. Cada aviso diz que licenciaturas aceita, por isso confirma-o antes de te candidatares.',
  ),
)
const POLICE_COMPETITION = mandatory(
  firstJob(
    'Concurso público do Ministério do Interior',
    'O de 2026 tem testes psicotécnicos, prova escrita, avaliação psicológica, exames médicos e prova física. As regras estão em candidaturas.minint.ao, que o júri indica como único canal oficial.',
  ),
)
const BASIC_COURSE: PathwayStep = {
  ...mandatory(
    firstJob(
      'Curso Básico de Investigação Criminal',
      'Dá acesso ao posto de Agente de Investigação Criminal de 3.ª Classe. O curso do SIC no Centro de Formação da Damba, em Malanje, durou seis meses.',
    ),
  ),
  months: { min: 6, max: 6 },
}

/** The stages of a State career use its own categories, not "Júnior" and "Sénior". */
export const career = (
  titles: [string, string, string, string],
  duties: [string[], string[], string[], string[]],
): Career['stages'] =>
  ladder(titles[1], titles[3], duties).map((stage, index) =>
    Object.assign(stage, { title: titles[index] ?? stage.title }),
  )

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
  const base = marketOf(postings, salary, sectors, { name: 'administração pública', total: 123 })
  return {
    ...entry,
    employerAsks: null,
    market: {
      ...base,
      demandNote: base.demandNote && { ...base.demandNote, text: `${base.demandNote.text}${extra}` },
    },
    cvGuide: CV,
  }
}

export const PUBLIC_GUIDES: Guide[] = [
  guide({
    slug: 'tecnico-superior-de-administracao-publica',
    description:
      'Prepara processos, pareceres e planos num ministério, governo provincial ou administração municipal. Entra-se por concurso público, com licenciatura, e muitas vezes o aviso aceita vários cursos, não só Administração Pública.',
    dayToDay: [
      'Analisar processos e escrever pareceres',
      'Preparar planos e relatórios',
      'Acompanhar o orçamento do serviço',
      'Responder a pedidos de cidadãos e de outros serviços',
      'Apoiar as decisões da direcção',
    ],
    workContext: OFFICE,
    workStyles: ['Organização', 'Rigor', 'Sentido de serviço público', 'Discrição', 'Clareza a escrever'],
    skills: [
      PUBLIC_LAW,
      WRITING,
      skill('gestao-publica', 'Gestão e finanças públicas'),
      skill('excel-relatorios', 'Excel e relatórios'),
      ETHICS,
    ],
    pathways: [
      universityRoute(
        'A licenciatura é o requisito. Administração Pública, Gestão Pública e Ciência Política preparam directamente.',
        [
          degree(
            'Administração Pública',
            'Ou Gestão Pública. Os concursos também aceitam áreas como Direito e Contabilidade, conforme o aviso.',
          ),
          COMPETITION,
        ],
      ),
    ],
    stages: career(
      [
        'Técnico Superior de 2.ª Classe',
        'Técnico Superior de 1.ª Classe',
        'Técnico Superior Principal',
        'Assessor',
      ],
      [
        ['Trata de processos simples', 'Aprende as regras do serviço'],
        ['Responde por uma área', 'Escreve pareceres'],
        ['Leva os dossiês mais difíceis', 'Orienta colegas'],
        ['Aconselha a direcção', 'Prepara decisões importantes'],
      ],
    ),
    postings: 1,
    salary: SALARY.civil,
    sectors: ['Ministérios', 'Governos provinciais', 'Administrações municipais', 'Institutos públicos'],
    extra:
      ' A maior parte da entrada faz-se por concursos do Estado. Em Abril de 2026, a ENAPP anunciou 7 concursos com 661 vagas, e o anúncio contado aqui, do Governo Provincial do Huambo, tinha 100 vagas.',
  }),
  guide({
    slug: 'tecnico-de-contratacao-publica',
    description:
      'Prepara e acompanha os concursos em que o Estado compra bens, obras e serviços, para que sejam legais e transparentes. É uma área em profissionalização: em 2026, o Serviço Nacional da Contratação Pública exigiu aos chefes das Unidades de Contratação Pública que provem formação na matéria.',
    dayToDay: [
      'Preparar os documentos do concurso',
      'Responder às dúvidas dos concorrentes',
      'Avaliar as propostas em comissão',
      'Preparar o contrato',
      'Acompanhar a execução e registar tudo no portal',
    ],
    workContext: [
      { label: 'Ambiente', value: 'Unidade de Contratação Pública de um organismo do Estado' },
      ...OFFICE.slice(1),
    ],
    workStyles: ['Rigor', 'Honestidade', 'Organização', 'Resistência à pressão', 'Atenção ao pormenor'],
    skills: [
      skill('contratos-publicos', 'Lei dos Contratos Públicos'),
      skill('pecas-procedimento', 'Preparação de cadernos de encargos'),
      skill('avaliacao-propostas', 'Avaliação de propostas'),
      skill('gestao-contratos', 'Gestão de contratos'),
      ETHICS,
    ],
    pathways: [
      universityRoute(
        'Não há uma licenciatura própria: Administração Pública, Gestão e Direito são as bases mais próximas.',
        [
          degree('Administração Pública', 'Ou Gestão, Direito ou Economia.'),
          {
            ...certification(
              'Pós-Graduação em Contratação Pública',
              'Na ENAPP, com 240 horas e sessões presenciais duas semanas por mês, em Talatona. A 3.ª edição começou em Junho de 2026, com 150 formandos.',
            ),
            need: 'recomendado',
            months: null,
          },
          COMPETITION,
        ],
      ),
    ],
    stages: ladder('Técnico de Contratação Pública', 'Chefe de Unidade de Contratação Pública', [
      ['Apoia os processos', 'Aprende os procedimentos'],
      ['Conduz concursos simples', 'Prepara contratos'],
      ['Leva concursos grandes', 'Pode ser gestor de contrato'],
      ['Chefia a unidade', 'Responde perante o SNCP'],
    ]),
    postings: 0,
    salary: SALARY.procurement,
    sectors: ['Ministérios', 'Empresas públicas', 'Institutos públicos', 'Fornecedores do Estado'],
    extra:
      ' Os anúncios de técnico de compras do sector privado não entram nesta conta. A certificação ainda não está definida: em 2026, o Banco Africano de Desenvolvimento apoiou a formação e certificação de funcionários, e a circular do SNCP não exige um certificado de uma instituição concreta. A certificação CIPS, britânica, é reconhecida no sector, mas não encontrámos em Angola um centro aprovado, por isso confirma a lista no CIPS.',
  }),
  guide({
    slug: 'diplomata',
    description:
      'Representa Angola noutros países e em organizações internacionais, negoceia acordos e protege os angolanos no estrangeiro. Pelo Estatuto do Diplomata, entra-se por concurso público, com licenciatura, português e uma língua de trabalho das Nações Unidas.',
    dayToDay: [
      'Acompanhar a política do país onde está',
      'Escrever notas e relatórios para Luanda',
      'Preparar reuniões e visitas',
      'Negociar acordos',
      'Apoiar os angolanos no estrangeiro',
    ],
    workContext: ABROAD,
    workStyles: ['Tacto', 'Discrição', 'Abertura a outras culturas', 'Capacidade de negociar', 'Adaptação'],
    skills: [
      skill('relacoes-internacionais', 'Relações internacionais'),
      skill('direito-internacional', 'Direito internacional'),
      NEGOTIATION,
      ENGLISH,
      skill('frances', 'Francês', 'opcional'),
      WRITING,
    ],
    pathways: [
      universityRoute(
        'A lei pede licenciatura, sem nomear o curso. Relações Internacionais é a preparação mais directa.',
        [
          degree(
            'Relações Internacionais',
            'Ou Direito ou Ciência Política. Aprende bem uma língua de trabalho das Nações Unidas: inglês, francês, espanhol, árabe, russo ou chinês.',
          ),
          mandatory(
            firstJob(
              'Concurso público do Ministério das Relações Exteriores',
              'Quem é aprovado frequenta o curso de preparação diplomática e faz estágio em vários serviços do Ministério. Confirma o regulamento do concurso no MIREX.',
            ),
          ),
        ],
      ),
    ],
    stages: career(
      ['Adido', 'Terceiro Secretário', 'Primeiro Secretário', 'Embaixador'],
      [
        ['Faz o curso e o estágio', 'Pelo menos 2 anos até Terceiro Secretário'],
        ['Trata de dossiês no Ministério ou numa embaixada', 'Pelo menos 4 anos em cada categoria'],
        ['Acompanha temas importantes', 'A seguir: Conselheiro e Ministro Conselheiro'],
        ['Chefia uma missão diplomática', 'Nomeação com aprovação do Presidente da República'],
      ],
    ),
    postings: 0,
    salary: SALARY.diplomat,
    sectors: [
      'Ministério das Relações Exteriores',
      'Embaixadas e consulados',
      'Missões em organizações internacionais',
    ],
    extra: ' Não há anúncios porque se entra por concurso público.',
  }),
  guide({
    slug: 'tecnico-de-cooperacao-internacional',
    description:
      'Prepara e acompanha projectos entre Angola e outros países ou organizações, como as Nações Unidas ou a cooperação francesa. As agências da ONU em Luanda abrem lugares de oficial nacional, só para angolanos, e pedem português e inglês fluentes.',
    dayToDay: [
      'Preparar propostas de projecto',
      'Acompanhar parceiros e actividades',
      'Escrever relatórios para os financiadores',
      'Organizar reuniões entre instituições',
      'Controlar o orçamento e os prazos',
    ],
    workContext: PROJECTS,
    workStyles: [
      'Diplomacia',
      'Organização',
      'Abertura a outras culturas',
      'Clareza a escrever',
      'Autonomia',
    ],
    skills: [
      skill('gestao-projectos-cooperacao', 'Gestão de projectos de cooperação'),
      skill('monitoria-avaliacao', 'Monitoria e avaliação'),
      ENGLISH,
      WRITING,
      NEGOTIATION,
    ],
    pathways: [
      universityRoute(
        'Relações Internacionais é a base mais directa, mas as agências aceitam outras áreas ligadas ao projecto.',
        [
          degree(
            'Relações Internacionais',
            'Ou Economia, Gestão ou a área técnica do projecto, como a saúde.',
          ),
          certification(
            'Certificação em gestão de projectos',
            'As certificações CAPM e PMP, do PMI, dão a linguagem usada nos projectos. O PMI Angola Chapter apoia a preparação.',
          ),
          firstJob(
            'Assistente de programa ou de parcerias',
            'Nos últimos 12 meses, a Expertise France anunciou uma vaga de assistente de coordenação e parcerias em Luanda.',
          ),
        ],
      ),
    ],
    stages: ladder('Técnico de Cooperação', 'Coordenador de Programa', [
      ['Apoia reuniões e relatórios', 'Aprende as regras dos financiadores'],
      ['Acompanha um projecto', 'Fala com os parceiros'],
      ['Gere um orçamento', 'Lidera uma componente'],
      ['Coordena um programa', 'Representa a organização'],
    ]),
    postings: 1,
    salary: SALARY.cooperation,
    sectors: ['Agências das Nações Unidas', 'Agências de cooperação', 'Ministérios', 'ONG internacionais'],
    extra:
      ' As agências das Nações Unidas publicam a maior parte das vagas nos seus próprios portais, que esta conta não cobre.',
  }),
  guide({
    slug: 'analista-politico',
    description:
      'Estuda as eleições, os partidos e as políticas públicas e explica-os em relatórios. É um mercado pequeno em Angola, quase sempre ligado a universidades e centros de estudos, e muitas pessoas juntam esta actividade ao ensino ou à consultoria.',
    dayToDay: [
      'Ler leis, programas e notícias',
      'Recolher dados e fazer entrevistas',
      'Comparar com outros países',
      'Escrever relatórios e artigos',
      'Explicar as conclusões a clientes ou à imprensa',
    ],
    workContext: STUDY,
    workStyles: [
      'Espírito crítico',
      'Independência',
      'Curiosidade',
      'Clareza a escrever',
      'Rigor com os factos',
    ],
    skills: [
      skill('analise-politica', 'Análise política'),
      skill('metodos-investigacao', 'Métodos de investigação'),
      skill('estatistica-basica', 'Estatística básica'),
      WRITING,
      ENGLISH,
    ],
    pathways: [
      universityRoute(
        'A licenciatura em Ciência Política é a base. Um mestrado ajuda a entrar em centros de estudos.',
        [
          degree('Ciência Política', 'Ou Relações Internacionais, Sociologia ou Filosofia.'),
          firstJob(
            'Assistente de investigação',
            'Procura projectos num centro de estudos ou universidade, como o CEIC da Universidade Católica.',
          ),
        ],
      ),
    ],
    stages: ladder('Analista Político', 'Director de Centro de Estudos', [
      ['Recolhe dados', 'Apoia relatórios'],
      ['Escreve análises próprias', 'Fala em nome da equipa'],
      ['Lidera estudos', 'É ouvido pela imprensa'],
      ['Dirige um centro', 'Procura financiamento'],
    ]),
    postings: 0,
    salary: SALARY.analyst,
    sectors: ['Universidades', 'Centros de estudos', 'Organizações internacionais', 'Comunicação social'],
  }),
  guide({
    slug: 'investigador-criminal',
    description:
      'Investiga os crimes, recolhe as provas e identifica os suspeitos para o Ministério Público. No Serviço de Investigação Criminal entra-se como Agente de 3.ª Classe, entre os 18 e os 35 anos, depois do Curso Básico de Investigação Criminal.',
    dayToDay: [
      'Ir aos locais dos crimes',
      'Ouvir vítimas e testemunhas',
      'Recolher e guardar provas',
      'Seguir pistas e identificar suspeitos',
      'Escrever autos para o Ministério Público',
    ],
    workContext: POLICE,
    workStyles: ['Observação', 'Persistência', 'Resistência à pressão', 'Honestidade', 'Discrição'],
    skills: [
      skill('tecnicas-investigacao', 'Técnicas de investigação criminal'),
      EVIDENCE,
      CRIMINAL_LAW,
      skill('entrevista', 'Entrevista e interrogatório'),
      skill('tiro-defesa', 'Armamento e defesa pessoal'),
    ],
    pathways: [
      {
        ...universityRoute(
          'A lei pede nacionalidade angolana, 18 a 35 anos, formação adequada, situação militar regularizada, saúde física e mental e registo criminal limpo.',
          [POLICE_COMPETITION, BASIC_COURSE],
        ),
        id: 'concurso',
        name: 'Concurso e Curso Básico',
      },
      universityRoute(
        'A licenciatura em Ciências Criminais prepara para a carreira. Confirma no concurso como conta para entrar.',
        [
          degree(
            'Ciências Criminais',
            'No Instituto Superior de Ciências Policiais e Criminais ou no Instituto Superior Politécnico de Ciências e Tecnologia.',
          ),
          POLICE_COMPETITION,
          BASIC_COURSE,
        ],
      ),
    ],
    stages: career(
      ['Agente de Investigação Criminal', 'Subchefe', 'Inspector', 'Superintendente'],
      [
        ['Apoia as investigações', 'Aprende com investigadores experientes'],
        ['Conduz diligências', 'Escreve autos'],
        ['Chefia uma brigada', 'Responde por casos graves'],
        ['Dirige uma unidade', 'Coordena com o Ministério Público'],
      ],
    ),
    postings: 0,
    salary: SALARY.police,
    sectors: ['Serviço de Investigação Criminal', 'Ministério do Interior'],
    extra: `${INTERIOR_COMPETITION} Em 2023 e 2024, o SIC formou mais de 2 700 novos efectivos.`,
  }),
  guide({
    slug: 'oficial-de-policia',
    description:
      'Comanda equipas de agentes na prevenção do crime e na ordem pública. Os oficiais formam-se no Instituto Superior de Ciências Policiais e Criminais, que dá Ciências Criminais, Direito e Gestão e Administração Pública.',
    dayToDay: [
      'Planear o policiamento de uma zona',
      'Dirigir os agentes de serviço',
      'Responder a ocorrências graves',
      'Falar com a comunidade',
      'Escrever relatórios',
    ],
    workContext: POLICE,
    workStyles: ['Liderança', 'Disciplina', 'Calma sob pressão', 'Honestidade', 'Respeito pelas pessoas'],
    skills: [
      skill('comando-equipas', 'Comando de equipas'),
      skill('ordem-publica', 'Ordem pública e policiamento'),
      CRIMINAL_LAW,
      skill('direitos-humanos', 'Direitos humanos'),
      skill('tiro-defesa', 'Armamento e defesa pessoal'),
    ],
    pathways: [
      universityRoute(
        'Não encontrámos as regras de entrada no Instituto. Confirma-as na Polícia Nacional ou em candidaturas.minint.ao.',
        [
          degree(
            'Ciências Criminais',
            'No Instituto Superior de Ciências Policiais e Criminais General Osvaldo Serra Van-Dúnem.',
          ),
          POLICE_COMPETITION,
        ],
      ),
    ],
    stages: career(
      ['Subinspector', 'Inspector', 'Superintendente', 'Comissário'],
      [
        ['Chefia uma pequena equipa', 'Aprende o comando'],
        ['Responde por uma esquadra ou sector', 'Avalia os agentes'],
        ['Dirige uma unidade', 'Planeia operações grandes'],
        ['Comanda ao nível provincial ou nacional', 'Decide a estratégia'],
      ],
    ),
    postings: 0,
    salary: SALARY.police,
    sectors: ['Polícia Nacional', 'Ministério do Interior'],
    extra: INTERIOR_COMPETITION,
  }),
  guide({
    slug: 'perito-criminalista',
    description:
      'Analisa no laboratório os vestígios de um crime, como impressões digitais, documentos e armas, e explica os resultados aos investigadores e ao tribunal. Trabalha no Laboratório Central de Criminalística do SIC, para o qual o Ministro do Interior anunciou em 2024 um edifício novo.',
    dayToDay: [
      'Receber e registar os vestígios',
      'Analisar impressões, documentos ou armas',
      'Comparar com as bases de dados',
      'Escrever o relatório pericial',
      'Explicar as conclusões em tribunal',
    ],
    workContext: [
      { label: 'Ambiente', value: 'Laboratório, com saídas aos locais dos crimes' },
      { label: 'Horário', value: 'Normal, com chamadas fora de horas' },
      { label: 'Equipa', value: 'Peritos, investigadores e médicos legistas' },
      { label: 'Viagens', value: 'Algumas' },
    ],
    workStyles: ['Rigor', 'Paciência', 'Imparcialidade', 'Atenção ao pormenor', 'Honestidade'],
    skills: [
      skill('lofoscopia', 'Lofoscopia (impressões digitais)'),
      skill('documentoscopia', 'Análise de documentos'),
      skill('balistica', 'Balística'),
      EVIDENCE,
      skill('relatorios-periciais', 'Relatórios periciais'),
    ],
    pathways: [
      universityRoute(
        'A carreira do SIC prevê funções técnico-científicas, até Perito Criminalístico Principal. Confirma no SIC como se entra nelas.',
        [
          degree('Ciências Criminais', 'Química, Biologia ou Farmácia também dão base para o laboratório.'),
          POLICE_COMPETITION,
        ],
      ),
    ],
    stages: ladder('Perito', 'Perito Criminalístico Principal', [
      ['Apoia os exames', 'Aprende uma especialidade'],
      ['Faz exames sozinho', 'Assina relatórios'],
      ['Leva casos difíceis', 'Testemunha em tribunal'],
      ['Coordena o laboratório', 'Responde pela qualidade dos exames'],
    ]),
    postings: 0,
    salary: SALARY.forensic,
    sectors: ['Laboratório Central de Criminalística', 'Serviço de Investigação Criminal'],
    extra: INTERIOR_COMPETITION,
  }),
]

const INTERIOR: SourceLink = {
  label: 'Ver Angola: concurso do Ministério do Interior (2026)',
  url: 'https://www.verangola.net/va/pt/092026/Defesa/50038/Minist%C3%A9rio-do-Interior-disponibiliza-calend%C3%A1rio-do-concurso-p%C3%BAblico-Conhe%C3%A7a-as-fases.htm',
}

const employer = (
  id: string,
  name: string,
  summary: string,
  careers: string[],
  careersSourced: boolean,
  areas: CareerGroup[],
  source: SourceLink,
  province = 'Luanda',
): Company => ({
  id,
  name,
  sector: 'estado',
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

export const PUBLIC_COMPANIES: Company[] = [
  employer(
    'ministerio-do-interior',
    'Ministério do Interior (MININT)',
    'Tutela a Polícia Nacional e o Serviço de Investigação Criminal. Em 2026 abriu um concurso com 7 682 vagas.',
    ['oficial-de-policia', 'investigador-criminal', 'perito-criminalista'],
    false,
    ['investigacao_criminal'],
    INTERIOR,
  ),
  employer(
    'policia-nacional-de-angola',
    'Polícia Nacional de Angola',
    'Faz a prevenção do crime e mantém a ordem pública em todo o país. Forma os oficiais no seu instituto superior.',
    ['oficial-de-policia'],
    false,
    ['investigacao_criminal'],
    INTERIOR,
  ),
  employer(
    'sncp',
    'Serviço Nacional da Contratação Pública (SNCP)',
    'Regula a contratação pública. Em 2026 pediu aos organismos do Estado que indiquem técnicos qualificados para as suas Unidades de Contratação Pública.',
    ['tecnico-de-contratacao-publica', 'jurista'],
    true,
    ['administracao_publica'],
    {
      label: 'Expansão: o SNCP quer técnicos qualificados (2026)',
      url: 'https://expansao.co.ao/angola/detalhe/sncp-aperta-e-quer-tecnicos-das-unidades-de-contratacao-publica-qualificados-71157.html',
    },
  ),
  employer(
    'governo-provincial-do-huambo',
    'Governo Provincial do Huambo',
    'Em Janeiro de 2026 teve anunciadas 100 vagas de Técnico Superior de 2.ª Classe.',
    ['tecnico-superior-de-administracao-publica'],
    true,
    ['administracao_publica'],
    {
      label: 'AngoEmprego: 100 vagas de Técnico Superior',
      url: 'https://angoemprego.com/100-vagas-de-emprego-para-tecnico-superior-de-2a-classe-no-gorverno-provincial-do-huambo/',
    },
    'Huambo',
  ),
  employer(
    'expertise-france',
    'Expertise France',
    'A agência francesa de cooperação técnica. Anunciou em Luanda uma vaga de assistente de coordenação e parcerias.',
    ['tecnico-de-cooperacao-internacional'],
    true,
    ['relacoes_internacionais'],
    {
      label: 'Jobartis: assistente de coordenação e parcerias',
      url: 'https://www.jobartis.com/emprego-expertise-france-assistente-de-coordenacao-e-parcerias',
    },
  ),
  employer(
    'unicef-angola',
    'UNICEF Angola',
    'A agência das Nações Unidas para a infância. Abre lugares de oficial nacional em Luanda.',
    ['tecnico-de-cooperacao-internacional'],
    false,
    ['relacoes_internacionais'],
    { label: 'UNICEF: vagas', url: 'https://jobs.unicef.org/en-us/job/595373' },
  ),
  employer(
    'pnud-angola',
    'PNUD Angola',
    'O Programa das Nações Unidas para o Desenvolvimento, com escritório em Angola.',
    ['tecnico-de-cooperacao-internacional'],
    false,
    ['relacoes_internacionais'],
    { label: 'UNjobs: vagas do PNUD em Angola', url: 'https://unjobs.org/offices/undp_lad' },
  ),
  employer(
    'ceic-ucan',
    'Centro de Estudos e Investigação Científica (CEIC-UCAN)',
    'O centro de estudos da Universidade Católica de Angola, em Luanda. Publica o relatório económico anual e tem projectos de ciência política com o instituto norueguês CMI.',
    ['analista-politico', 'investigador-em-ciencias-sociais'],
    false,
    ['relacoes_internacionais', 'ciencias_sociais'],
    {
      label: 'CMI: programa CEIC-CMI',
      url: 'https://www.cmi.no/projects/1927-the-ceic-cmi-angola-programme',
    },
  ),
]
