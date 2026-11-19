import type { Career, Company, PathwayStep, SourceLink } from '../types'
import {
  certification,
  course,
  degree,
  firstJob,
  ladder,
  market as marketOf,
  skill,
  type TechSalary,
  universityRoute,
  wage,
} from './technologyGuides'

// The law careers' full pages (ADR 0010), from public sources:
// - the demand: the job ads of the last 12 months, 24 in the area; the courts' 2026 competition goes in the note;
// - the salaries: the State's base pay on entry (Decreto Presidencial 16/26, already in the summaries) and the
//   WageIndicator 2026 survey, in the demand note;
// - the rules: Regulamento n.º 1/26 of the Ordem dos Advogados, Lei n.º 12/16 (mediation), Decreto Presidencial
//   n.º 136/17 (justice officers, registrars and notaries) and the CSMJ's 2026 competition. Where no source gave the
//   rule, as with the magistrates' entry requirements, the guide says to confirm it with the body.

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
const LAW_START = 'entre 271 001 e 1 317 401'
const LAW_AFTER = 'entre 407 570 e 2 082 004'

const publicPay = (
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
  lawyer: wage('juristas', 'os juristas e advogados', LAW_START, LAW_AFTER),
  other: wage(
    'todos-os-outros-profissionais-juridicos',
    'os outros profissionais jurídicos',
    LAW_START,
    LAW_AFTER,
  ),
  judge: publicPay(
    'um juiz de direito com menos de 5 anos de serviço',
    '554 400',
    'juizes',
    'os juízes',
    LAW_START,
    LAW_AFTER,
  ),
  prosecutor: publicPay(
    'um procurador adjunto da República',
    '508 200',
    'juristas',
    'os juristas, a função mais próxima',
    LAW_START,
    LAW_AFTER,
  ),
  officer: publicPay(
    'um oficial de diligências de 3.ª classe',
    '180 955',
    'secretarias-legais',
    'as secretárias jurídicas, a função mais próxima',
    'entre 170 344 e 516 772',
    'entre 248 919 e 796 319',
  ),
  registrar: publicPay(
    'um conservador-adjunto',
    '458 419',
    'todos-os-outros-profissionais-juridicos',
    'os outros profissionais jurídicos',
    LAW_START,
    LAW_AFTER,
  ),
  notary: publicPay(
    'um notário-adjunto',
    '458 419',
    'todos-os-outros-profissionais-juridicos',
    'os outros profissionais jurídicos',
    LAW_START,
    LAW_AFTER,
  ),
}

const COURTS_COMPETITION =
  ' Não há anúncios porque se entra por concurso público: o de 2026 do Conselho Superior da Magistratura Judicial abriu 556 vagas nos tribunais (446 de oficial de diligências, 60 de ajudante de escrivão e 50 de escrivão de direito), com as listas finais publicadas em Abril.'
const STATE_ENTRY = ' Não há anúncios porque se entra por concurso público.'

const CHAMBERS: Career['workContext'] = [
  { label: 'Ambiente', value: 'Tribunal e gabinete, com muita leitura de processos' },
  { label: 'Horário', value: 'Normal, com picos perto dos julgamentos e dos prazos' },
  { label: 'Equipa', value: 'Magistrados, oficiais de justiça e advogados' },
  { label: 'Viagens', value: 'A colocação pode ser noutra província' },
]
const LAW_OFFICE: Career['workContext'] = [
  { label: 'Ambiente', value: 'Escritório, com idas a tribunais e a serviços públicos' },
  { label: 'Horário', value: 'Muitas vezes longo, com picos perto dos prazos' },
  { label: 'Equipa', value: 'Advogados, juristas e clientes' },
  { label: 'Viagens', value: 'Algumas, para diligências noutras províncias' },
]
const REGISTRY: Career['workContext'] = [
  { label: 'Ambiente', value: 'Conservatória ou cartório, com atendimento ao público' },
  { label: 'Horário', value: 'Normal, com filas nas horas de maior movimento' },
  { label: 'Equipa', value: 'Ajudantes e oficiais auxiliares' },
  { label: 'Viagens', value: 'Poucas, mas a colocação pode ser noutra província' },
]

const CV: Career['cvGuide'] = {
  template: 'classico',
  include: [
    'A licenciatura, com a universidade e o ano',
    'O estágio e a inscrição na Ordem, se os tiveres',
    'As áreas do Direito em que trabalhaste, com o tipo de casos ou contratos',
    'As línguas, sobretudo o inglês jurídico',
  ],
  avoid: [
    'Nomes de clientes ou pormenores de processos',
    'Listas de leis que não aplicaste',
    'Fotografia e dados pessoais que a vaga não pede',
  ],
}

const WRITING = skill('redaccao-juridica', 'Redacção jurídica')
const RESEARCH = skill('pesquisa-juridica', 'Pesquisa de leis e de decisões')
const ENGLISH = skill('ingles-juridico', 'Inglês jurídico', 'opcional')
const PROCEDURE = skill('processo-judicial', 'Processo civil e penal')
const ETHICS = skill('deontologia', 'Ética e deontologia')
const REGISTRY_LAW = skill('direito-registral', 'Direito dos registos e do notariado')

const LAW_DEGREE = degree(
  'Direito',
  'Numa das muitas universidades do país que têm o curso. Dá a base de todas as carreiras jurídicas.',
)

const mandatory = (step: PathwayStep): PathwayStep => ({ ...step, need: 'essencial' })
/** A formal course or exam: required, and it cannot be done alone. */
const formal = (step: PathwayStep): PathwayStep => ({
  ...mandatory(step),
  selfTaught: false,
  certificate: 'exigido',
})

const BAR_TRAINEESHIP: PathwayStep = {
  ...mandatory(
    firstJob(
      'Estágio de 18 meses na Ordem dos Advogados',
      'Inscreves-te como advogado estagiário e trabalhas com um patrono, um advogado com pelo menos 5 anos de exercício, que orienta o estágio e não te pode cobrar por isso. São 6 meses de fase propedêutica (a parte inicial) e 12 de tirocínio (a parte prática), com a formação obrigatória no Centro de Estudos e Formação da Ordem.',
    ),
  ),
  months: { min: 18, max: 18 },
}
const BAR_EXAM = formal(
  certification(
    'Prova Final de Acesso à Advocacia',
    'Prova escrita e oral, em Abril, em todo o país. Precisas de 10 valores ou mais, em 20. Depois, tens 45 dias úteis para te inscreveres como advogado.',
  ),
)
const MAGISTRATE_TRAINING = (who: string): PathwayStep =>
  formal(
    course(
      'Concurso e formação no INEJ',
      `Quem quer ser ${who} faz, depois da licenciatura em Direito, a formação do Instituto Nacional de Estudos Judiciários, com uma parte teórica e meses de prática. Confirma os requisitos de cada concurso, como a idade e a experiência, no INEJ e no conselho superior da magistratura respectivo.`,
      15,
      18,
    ),
  )

/** The stages of a State career use its own categories, not "Júnior" and "Sénior". */
const career = (
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
  const base = marketOf(postings, salary, sectors, { name: 'direito', total: 24 })
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

export const LEGAL_GUIDES: Guide[] = [
  guide({
    slug: 'advogado',
    description:
      'Defende pessoas e empresas em tribunal e aconselha-as sobre os seus direitos. A licenciatura em Direito não chega: para usar o título é preciso o estágio e a Prova Final da Ordem dos Advogados de Angola.',
    dayToDay: [
      'Ouvir o cliente e estudar o caso',
      'Procurar as leis e as decisões que se aplicam',
      'Escrever petições, recursos e contratos',
      'Representar o cliente em audiências',
      'Negociar acordos e controlar os prazos',
    ],
    workContext: LAW_OFFICE,
    workStyles: ['Argumentação', 'Rigor', 'Discrição', 'Resistência à pressão', 'Sentido ético'],
    skills: [WRITING, RESEARCH, PROCEDURE, skill('negociacao', 'Negociação'), ETHICS, ENGLISH],
    pathways: [
      universityRoute('É o único caminho: licenciatura, estágio e Prova Final.', [
        LAW_DEGREE,
        BAR_TRAINEESHIP,
        BAR_EXAM,
      ]),
    ],
    stages: career(
      ['Advogado Estagiário', 'Advogado', 'Advogado Sénior', 'Sócio de Sociedade de Advogados'],
      [
        ['Trabalha com o patrono', 'Faz a formação obrigatória'],
        ['Acompanha os seus processos', 'Vai a audiências sozinho'],
        ['Leva os casos mais difíceis', 'Pode ser patrono de estagiários'],
        ['Angaria clientes', 'Dirige a equipa ou o escritório'],
      ],
    ),
    postings: 5,
    salary: SALARY.lawyer,
    sectors: ['Sociedades de advogados', 'Prática por conta própria', 'Empresas', 'Banca'],
    extra: ' Em Março de 2022, a Ordem tinha 4 648 advogados e 4 780 estagiários, segundo o bastonário.',
  }),
  guide({
    slug: 'jurista',
    description:
      'Prepara contratos, pareceres e regulamentos para que a organização cumpra a lei. Trabalha para uma só organização, enquanto o advogado representa clientes. Nos últimos 12 meses houve anúncios para contratos de petróleo e gás, para o banco BCB e para o projecto RECLIMA do Ministério da Energia e Águas.',
    dayToDay: [
      'Escrever e rever contratos',
      'Dar pareceres às outras equipas',
      'Acompanhar leis novas que afectam a organização',
      'Preparar regulamentos e procedimentos',
      'Acompanhar processos com os advogados externos',
    ],
    workContext: [
      { label: 'Ambiente', value: 'Escritório de uma empresa, banco ou organismo público' },
      { label: 'Horário', value: 'Normal, com picos em negócios e prazos' },
      { label: 'Equipa', value: 'Direcção, finanças, recursos humanos e compras' },
      { label: 'Viagens', value: 'Raras' },
    ],
    workStyles: ['Rigor', 'Clareza a escrever', 'Discrição', 'Organização', 'Sentido prático'],
    skills: [
      WRITING,
      RESEARCH,
      skill('direito-comercial', 'Direito comercial e dos contratos'),
      skill('direito-trabalho', 'Direito do trabalho'),
      skill('compliance', 'Conformidade legal (compliance)', 'opcional'),
      ENGLISH,
    ],
    pathways: [
      universityRoute(
        'A licenciatura em Direito é a base. Quem fizer também o estágio da Ordem pode vir a exercer como advogado.',
        [
          LAW_DEGREE,
          firstJob(
            'Primeiro emprego num departamento jurídico',
            'Nos últimos 12 meses, o Ministério da Energia e Águas procurou jovens recém-licenciados em Direito e houve anúncios de assistente jurídico.',
          ),
        ],
      ),
    ],
    stages: ladder('Jurista', 'Director Jurídico', [
      ['Revê documentos simples', 'Apoia os colegas'],
      ['Escreve contratos e pareceres', 'Responde a uma área'],
      ['Leva os negócios mais difíceis', 'Orienta os mais novos'],
      ['Dirige o departamento jurídico', 'Aconselha a administração'],
    ]),
    postings: 10,
    salary: SALARY.lawyer,
    sectors: ['Banca e seguros', 'Petróleo e gás', 'Organismos públicos', 'Empresas de serviços'],
  }),
  guide({
    slug: 'mediador-de-conflitos',
    description:
      'Ajuda duas partes em conflito a chegarem a acordo sem irem a tribunal, sem decidir por elas. É uma actividade quase sempre por conta própria, ligada a centros de mediação, e muitas vezes feita a par de outra profissão. Por lei, só se pode exercer com mais de 26 anos.',
    dayToDay: [
      'Ouvir cada parte, em conjunto e em separado',
      'Explicar as regras da mediação',
      'Ajudar as partes a encontrar soluções',
      'Redigir o acordo a que chegaram',
      'Guardar sigilo sobre o que ouviu',
    ],
    workContext: [
      { label: 'Ambiente', value: 'Salas de centros de mediação e arbitragem' },
      { label: 'Horário', value: 'Por sessões, muitas vezes a par de outro trabalho' },
      { label: 'Equipa', value: 'Quase sempre sozinho, com as partes e os seus advogados' },
      { label: 'Viagens', value: 'Algumas' },
    ],
    workStyles: ['Imparcialidade', 'Escuta', 'Calma', 'Discrição', 'Paciência'],
    skills: [
      skill('tecnicas-mediacao', 'Técnicas de mediação e conciliação'),
      skill('negociacao', 'Negociação'),
      skill('comunicacao-conflito', 'Comunicação em conflito'),
      RESEARCH,
      ETHICS,
    ],
    pathways: [
      universityRoute(
        'A Lei n.º 12/16 pede mais de 26 anos, licenciatura adequada ou experiência relevante, idoneidade e um curso de mediação reconhecido.',
        [
          LAW_DEGREE,
          formal(
            course(
              'Curso de mediação reconhecido',
              'Tem de ser dado ou reconhecido pelo organismo da Justiça responsável pela resolução extrajudicial de litígios, ou por uma entidade formadora certificada por ele. Confirma a lista actual no Ministério da Justiça e dos Direitos Humanos.',
              1,
              6,
            ),
          ),
          firstJob(
            'Inscrição num centro de mediação',
            'Os centros públicos e privados precisam de autorização. Confirma como entrar na lista de mediadores de cada um.',
          ),
        ],
      ),
    ],
    stages: ladder('Mediador', 'Coordenador de Centro de Mediação', [
      ['Acompanha mediadores experientes', 'Trata de casos simples'],
      ['Conduz mediações sozinho', 'Ganha prática numa área'],
      ['Leva conflitos comerciais ou familiares difíceis', 'Forma novos mediadores'],
      ['Coordena um centro', 'Responde pela qualidade do serviço'],
    ]),
    postings: 0,
    salary: SALARY.other,
    sectors: ['Centros de mediação e arbitragem', 'Prática por conta própria', 'Serviços do Estado'],
  }),
  guide({
    slug: 'juiz',
    description:
      'Julga os processos e decide segundo a lei, de forma independente. Depois da licenciatura em Direito, entra-se por concurso público e pela formação do INEJ, um percurso longo e muito disputado. Em 2024, 183 novos juízes tomaram posse de uma só vez, 95 deles mulheres.',
    dayToDay: [
      'Ler e estudar os processos',
      'Conduzir audiências e ouvir testemunhas',
      'Decidir pedidos ao longo do processo',
      'Escrever sentenças fundamentadas',
      'Gerir os prazos do tribunal',
    ],
    workContext: CHAMBERS,
    workStyles: ['Imparcialidade', 'Independência', 'Ponderação', 'Rigor', 'Sentido de justiça'],
    skills: [PROCEDURE, skill('direito-penal', 'Direito civil e penal'), WRITING, RESEARCH, ETHICS],
    pathways: [
      universityRoute('A licenciatura em Direito, o concurso e a formação no INEJ.', [
        LAW_DEGREE,
        MAGISTRATE_TRAINING('juiz'),
      ]),
    ],
    stages: career(
      ['Juiz de Direito em início de carreira', 'Juiz de Direito', 'Juiz Desembargador', 'Juiz Conselheiro'],
      [
        ['Julga casos num tribunal de comarca', 'Ganha prática com colegas'],
        ['Leva processos mais complexos', 'Orienta colegas mais novos'],
        ['Julga recursos num Tribunal da Relação', 'Só depois de pelo menos 5 anos de exercício'],
        ['Julga nos tribunais superiores', 'Decide recursos vindos de todo o país'],
      ],
    ),
    postings: 0,
    salary: SALARY.judge,
    sectors: ['Tribunais de comarca', 'Tribunais da Relação', 'Tribunais superiores'],
    extra: `${STATE_ENTRY} O salário base não inclui o subsídio de representação dos magistrados.`,
  }),
  guide({
    slug: 'procurador',
    description:
      'Dirige a investigação dos crimes, acusa em tribunal e defende a legalidade em nome do Estado. Depois da licenciatura em Direito, passa pela formação do INEJ, que em 2022 tinha uma parte teórica de quase um ano e mais seis meses de prática.',
    dayToDay: [
      'Dirigir as investigações com a polícia',
      'Analisar provas e decidir se há acusação',
      'Escrever acusações e pareceres',
      'Representar o Estado em julgamento',
      'Defender menores e pessoas vulneráveis',
    ],
    workContext: CHAMBERS,
    workStyles: ['Sentido de justiça', 'Coragem', 'Rigor', 'Resistência à pressão', 'Discrição'],
    skills: [
      skill('direito-penal', 'Direito civil e penal'),
      PROCEDURE,
      skill('investigacao-criminal', 'Direcção da investigação criminal'),
      WRITING,
      ETHICS,
    ],
    pathways: [
      universityRoute('A licenciatura em Direito, o concurso e a formação no INEJ.', [
        LAW_DEGREE,
        MAGISTRATE_TRAINING('procurador'),
      ]),
    ],
    stages: career(
      [
        'Procurador Adjunto da República',
        'Procurador da República',
        'Procurador da República experiente',
        'Procurador-Geral Adjunto da República',
      ],
      [
        ['Acompanha processos simples', 'Aprende com um colega mais antigo'],
        ['Dirige investigações', 'Acusa em julgamento'],
        ['Leva os casos mais graves', 'Orienta colegas'],
        ['Coordena serviços do Ministério Público', 'Actua nos tribunais superiores'],
      ],
    ),
    postings: 0,
    salary: SALARY.prosecutor,
    sectors: ['Procuradoria-Geral da República', 'Procuradorias provinciais', 'Tribunais'],
    extra: `${STATE_ENTRY} O salário base não inclui o subsídio de representação dos magistrados.`,
  }),
  guide({
    slug: 'oficial-de-justica',
    description:
      'Faz o tribunal funcionar: notifica as partes, organiza os processos e cumpre as ordens do juiz. É a carreira da justiça mais acessível, porque se pode entrar com o curso médio, sem licenciatura. O concurso anulado de 2025 teve mais de 20 700 candidatos.',
    dayToDay: [
      'Entregar notificações e citações',
      'Abrir e organizar os processos',
      'Registar os actos do tribunal',
      'Apoiar as audiências',
      'Atender advogados e cidadãos',
    ],
    workContext: [
      { label: 'Ambiente', value: 'Secretaria do tribunal, com saídas para entregar notificações' },
      { label: 'Horário', value: 'Normal' },
      { label: 'Equipa', value: 'Escrivães, ajudantes e juízes' },
      { label: 'Viagens', value: 'Deslocações na zona do tribunal' },
    ],
    workStyles: ['Organização', 'Rigor', 'Responsabilidade', 'Atendimento cordial', 'Discrição'],
    skills: [
      skill('organizacao-judiciaria', 'Organização judiciária'),
      PROCEDURE,
      skill('gestao-processos', 'Gestão de processos e arquivo'),
      skill('informatica-escritorio', 'Informática na óptica do utilizador'),
      ETHICS,
    ],
    pathways: [
      {
        ...universityRoute(
          'Para Oficial de Diligências de 3.ª Classe, o concurso de 2026 pediu pelo menos o curso médio, nacionalidade angolana e 18 anos.',
          [
            mandatory(
              firstJob(
                'Concurso público dos tribunais',
                'Prova escrita: 80% sobre a organização judiciária, 10% sobre a administração pública e 10% sobre ética e cultura geral. A lei pede também aprovação em estágio específico.',
              ),
            ),
          ],
        ),
        id: 'medio',
        name: 'Com o ensino médio',
      },
      universityRoute(
        'Para Escrivão de Direito de 3.ª Classe, o concurso de 2026 pediu licenciatura. Direito é uma das áreas aceites.',
        [
          LAW_DEGREE,
          mandatory(
            firstJob(
              'Concurso público dos tribunais',
              'Em 2026 também foram aceites áreas como Gestão e Contabilidade, Psicologia, Sociologia e Engenharia Informática.',
            ),
          ),
        ],
      ),
    ],
    stages: career(
      [
        'Oficial de Diligências',
        'Ajudante de Escrivão de Direito',
        'Escrivão de Direito',
        'Secretário Judicial',
      ],
      [
        ['Entrega notificações', 'Aprende como funciona a secretaria'],
        ['Ajuda a organizar os processos', 'Promoção com pelo menos 3 anos e classificação de bom'],
        ['Responde pelos processos de uma secção', 'Promoção com pelo menos 3 anos e classificação de bom'],
        ['Dirige a secretaria do tribunal', 'Coordena os funcionários'],
      ],
    ),
    postings: 0,
    salary: SALARY.officer,
    sectors: ['Tribunais de comarca', 'Tribunais da Relação', 'Tribunais superiores'],
    extra: COURTS_COMPETITION,
  }),
  guide({
    slug: 'conservador-dos-registos',
    description:
      'Dirige uma conservatória, onde ficam registados os nascimentos, os casamentos, as empresas e os imóveis. Entra-se como Conservador-Adjunto, por concurso para licenciados, ou por promoção a partir de Ajudante Principal com pelo menos 3 anos na categoria.',
    dayToDay: [
      'Verificar se os pedidos cumprem a lei',
      'Fazer e assinar os registos',
      'Emitir certidões',
      'Resolver casos duvidosos',
      'Dirigir os ajudantes e o atendimento',
    ],
    workContext: REGISTRY,
    workStyles: ['Rigor', 'Organização', 'Honestidade', 'Atendimento cordial', 'Atenção ao pormenor'],
    skills: [
      REGISTRY_LAW,
      skill('direito-civil', 'Direito civil e da família'),
      skill('direito-comercial', 'Direito comercial e dos contratos'),
      skill('gestao-equipa', 'Gestão de uma equipa'),
      ETHICS,
    ],
    pathways: [
      universityRoute(
        'O Decreto Presidencial 136/17 pede licenciatura para entrar. Só nomeia Direito na 1.ª Classe, mas é o curso que prepara para o trabalho.',
        [
          LAW_DEGREE,
          mandatory(
            firstJob(
              'Concurso público e estágio',
              'A lei pede concurso público e aprovação em estágio específico. Confirma as regras de cada concurso no Ministério da Justiça e dos Direitos Humanos.',
            ),
          ),
        ],
      ),
    ],
    stages: career(
      [
        'Conservador-Adjunto',
        'Conservador de 3.ª Classe',
        'Conservador de 2.ª Classe',
        'Conservador de 1.ª Classe',
      ],
      [
        ['Apoia o conservador', 'Aprende os registos'],
        ['Dirige uma conservatória', 'Decide os registos'],
        ['Dirige conservatórias com mais movimento', 'Orienta adjuntos'],
        ['Responde pelas conservatórias maiores', 'Exige licenciatura em Direito'],
      ],
    ),
    postings: 0,
    salary: SALARY.registrar,
    sectors: ['Conservatórias do Registo Civil', 'Registo Predial e Comercial', 'Guiché Único da Empresa'],
    extra: STATE_ENTRY,
  }),
  guide({
    slug: 'notario',
    description:
      'Dá fé pública a escrituras, testamentos e contratos, ou seja, garante que são verdadeiros e que valem perante todos. Em Angola trabalha nos cartórios do Estado. Entra-se como Notário-Adjunto, por concurso para licenciados, ou por promoção a partir de Ajudante Principal com pelo menos 3 anos na categoria.',
    dayToDay: [
      'Confirmar a identidade e a vontade das partes',
      'Preparar escrituras e testamentos',
      'Reconhecer assinaturas',
      'Autenticar documentos',
      'Guardar os livros do cartório',
    ],
    workContext: REGISTRY,
    workStyles: ['Rigor', 'Honestidade', 'Discrição', 'Atenção ao pormenor', 'Atendimento cordial'],
    skills: [
      REGISTRY_LAW,
      skill('direito-civil', 'Direito civil e da família'),
      skill('direito-comercial', 'Direito comercial e dos contratos'),
      WRITING,
      ETHICS,
    ],
    pathways: [
      universityRoute(
        'O Decreto Presidencial 136/17 pede licenciatura para entrar. Só nomeia Direito na 1.ª Classe, mas é o curso que prepara para o trabalho.',
        [
          LAW_DEGREE,
          mandatory(
            firstJob(
              'Concurso público e estágio',
              'A lei pede concurso público e aprovação em estágio específico. Confirma as regras de cada concurso no Ministério da Justiça e dos Direitos Humanos.',
            ),
          ),
        ],
      ),
    ],
    stages: career(
      ['Notário-Adjunto', 'Notário de 3.ª Classe', 'Notário de 2.ª Classe', 'Notário de 1.ª Classe'],
      [
        ['Apoia o notário', 'Aprende os actos notariais'],
        ['Dirige um cartório', 'Faz escrituras e autenticações'],
        ['Dirige cartórios com mais movimento', 'Orienta adjuntos'],
        ['Responde pelos cartórios maiores', 'Exige licenciatura em Direito'],
      ],
    ),
    postings: 0,
    salary: SALARY.notary,
    sectors: ['Cartórios notariais', 'Guiché Único da Empresa'],
    extra: STATE_ENTRY,
  }),
]

const LEGAL_500: SourceLink = {
  label: 'The Legal 500: Angola',
  url: 'https://www.legal500.com/c/angola/local-firms',
}
const LAW_CAREERS = ['advogado', 'jurista']

const employer = (
  id: string,
  name: string,
  summary: string,
  careers: string[],
  careersSourced: boolean,
  source: SourceLink,
): Company => ({
  id,
  name,
  sector: 'justica',
  province: 'Luanda',
  place: 'Luanda',
  summary,
  careers,
  careersSourced,
  areas: ['advocacia'],
  programs: [],
  partners: [],
  sources: [source],
})

const firm = (id: string, name: string, tier: number): Company =>
  employer(
    id,
    name,
    `Sociedade de advogados, no nível ${tier} das firmas de Angola no ranking The Legal 500.`,
    LAW_CAREERS,
    false,
    LEGAL_500,
  )

const jobartis = (label: string, path: string): SourceLink => ({
  label: `Jobartis: ${label}`,
  url: `https://www.jobartis.com/emprego-${path}`,
})

export const LEGAL_COMPANIES: Company[] = [
  firm('alc-advogados', 'ALC Advogados', 1),
  firm('prime-advogados', 'PRIME Advogados', 1),
  firm('cms-lbr', 'CMS LBR', 2),
  firm('dla-piper-africa-angola', 'DLA Piper Africa, Angola (ADCA)', 2),
  firm('plmj-colab-rva-advogados', 'PLMJ Colab Angola - RVA Advogados', 2),
  firm('avm-advogados', 'AVM', 2),
  firm('fatima-freitas-associados', 'Fátima Freitas & Associados', 3),
  firm('evc-advogados', 'EVC Advogados', 3),
  firm('ftl-advogados', 'FTL Advogados', 3),
  employer(
    'fbl-advogados',
    'FBL Advogados',
    'Sociedade de advogados no centro de Luanda, com contencioso e direito societário, financeiro, laboral e dos recursos naturais.',
    LAW_CAREERS,
    false,
    { label: 'Lex Africa: FBL Advogados', url: 'https://lexafrica.com/firm/fbl-advogados/' },
  ),
  employer(
    'grupo-legal',
    'Grupo Legal',
    'Anunciou uma vaga de advogado.',
    ['advogado'],
    true,
    jobartis('advogado', 'grupo-legal-advogado-a'),
  ),
  employer(
    'pilar-campos',
    'Pilar Campos',
    'Anunciou uma vaga de jurista.',
    ['jurista'],
    true,
    jobartis('jurista', 'pilar-campos-jurista'),
  ),
  employer(
    'jac-angola',
    'JAC Angola',
    'Anunciou uma vaga de jurista.',
    ['jurista'],
    true,
    jobartis('jurista', 'jac-angola-jurista'),
  ),
  employer(
    'centro-arbitragem-aia',
    'Centro de Arbitragem da AIA',
    'O centro da Associação Industrial de Angola, em Luanda, autorizado em 2017. Os estatutos incluem a formação de árbitros, mediadores e conciliadores.',
    ['mediador-de-conflitos'],
    true,
    {
      label: 'Decreto Executivo n.º 464/17 (Lex.AO)',
      url: 'https://lex.ao/docs/ministerio-da-justica-e-dos-direitos-humanos/2017/decreto-executivo-n-o-464-17-de-02-de-outubro/',
    },
  ),
  employer(
    'crel',
    'Centro de Resolução Extrajudicial de Litígios (CREL)',
    'Centro de Luanda com serviços de conciliação, mediação e arbitragem. Reunia 80 mediadores, segundo a Ver Angola.',
    ['mediador-de-conflitos'],
    true,
    {
      label: 'Ver Angola: o CREL e a arbitragem',
      url: 'https://www.verangola.net/va/pt/122016/Politica/1016/Governo-angolano-aposta-na-resolu%C3%A7%C3%A3o-de-conflitos-pela-via-arbitral.htm',
    },
  ),
]
