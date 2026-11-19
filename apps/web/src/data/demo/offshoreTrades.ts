import type {
  Academy,
  AcademyOffer,
  Career,
  CareerGroup,
  CareerSummary,
  Company,
  PathwayStep,
  Skill,
  SourceLink,
} from '../types'
import { riasec, summary } from './careerSummary'

// The mechanical, heavy machinery and procurement careers of the oil companies and their service firms (the Mecânica
// e operações offshore group of the oil area), from public sources:
// - who must be hired: Decreto-Lei n.º 17/09 (all posts filled with Angolans; foreigners only with the Ministry's
//   authorisation when none is qualified); what must be bought locally: Decreto Presidencial n.º 271/20 (conteúdo local);
// - offshore safety: the OPITO standards (BOSIET/T-BOSIET with CA-EBS, renewed with FOET) and the job ads that ask them;
// - the training: Instituto Nacional de Petróleos (inp.gov.ao), CFMA of the Sonangol group (Ver Angola), IPGP
//   (ipgp.ao), Academia PetroAngola (academia.petroangola.com);
// - the demand: the Angolan job sites in the last 12 months (no salary in any);
// - the salaries: the WageIndicator 2026 survey where it has the occupation.

const GROUP: CareerGroup = 'mecanica_offshore'
const WAGE = 'https://wageindicator.org/pt-ao/trabalho-em-angola/trabalho-e-salario/'

const LAW_17_09: SourceLink = {
  label: 'Decreto-Lei n.º 17/09: recrutamento no sector petrolífero (AngoLEX)',
  url: 'https://angolex.com/paginas/decreto-presidencial/regras-a-observar-no-recrutamento-e-formacao-de-trabalhadores-do-sector-petrolifero-17a-09a.html',
}
const LOCAL_CONTENT: SourceLink = {
  label: 'Decreto Presidencial n.º 271/20: conteúdo local no sector dos petróleos (AngoLEX)',
  url: 'https://angolex.com/paginas/decreto-presidencial/regime-juridico-do-conteudo-local-do-sector-dos-petroleos.html',
}

export const OFFSHORE_CAREERS: CareerSummary[] = [
  summary(
    'tecnico-de-manutencao-mecanica',
    'Técnico de Manutenção Mecânica (Petróleo e Gás)',
    GROUP,
    'Mantém bombas, compressores, turbinas e válvulas a funcionar nas plataformas, nos FPSO e nas bases em terra.',
    riasec(0.9, 0.5, 0.1, 0.2, 0.2, 0.6),
    'media',
    null,
  ),
  summary(
    'mecanico-de-sonda',
    'Mecânico de Sonda (Rig Mechanic)',
    GROUP,
    'Repara e mantém os motores, os guinchos e as bombas das sondas de perfuração.',
    riasec(0.95, 0.4, 0.05, 0.2, 0.2, 0.5),
    'media',
    null,
  ),
  summary(
    'soldador-industrial',
    'Soldador Industrial e Caldeireiro',
    GROUP,
    'Solda e monta tubagens e estruturas metálicas segundo normas, em estaleiros, refinarias e plataformas.',
    riasec(0.95, 0.3, 0.2, 0.1, 0.15, 0.5),
    'media',
    null,
  ),
  summary(
    'rigger-e-operador-de-grua',
    'Rigger e Operador de Grua',
    GROUP,
    'Prepara, eleva e movimenta cargas pesadas em segurança, com gruas, cabos e sinais.',
    riasec(0.9, 0.3, 0.05, 0.3, 0.2, 0.55),
    'media',
    null,
  ),
  summary(
    'operador-de-maquinas-pesadas',
    'Operador de Máquinas Pesadas',
    GROUP,
    'Opera escavadoras, pás carregadoras, empilhadores e niveladoras em bases, estaleiros, obras e minas.',
    riasec(0.95, 0.2, 0.05, 0.15, 0.15, 0.5),
    'media',
    null,
  ),
  summary(
    'tecnico-de-instrumentacao',
    'Técnico de Instrumentação e Controlo',
    GROUP,
    'Calibra e repara os sensores, as válvulas de controlo e os sistemas que medem e comandam a produção.',
    riasec(0.8, 0.7, 0.05, 0.15, 0.15, 0.65),
    'media',
    null,
  ),
  summary(
    'tecnico-de-procurement',
    'Técnico de Procurement e Contratos (Petróleo e Gás)',
    GROUP,
    'Compra os bens e serviços das operações petrolíferas, com concursos, contratos e as regras do conteúdo local.',
    riasec(0.2, 0.5, 0.1, 0.4, 0.65, 0.85),
    'media',
    null,
  ),
]

const detailed = (slug: string): CareerSummary => {
  const found = OFFSHORE_CAREERS.find((career) => career.slug === slug)
  if (!found) throw new Error(`Unknown offshore career ${slug}`)
  return { ...found, detailed: true }
}

const NINTH: PathwayStep = {
  kind: 'academico',
  level: 'i_ciclo',
  title: '9.ª classe concluída',
  need: 'essencial',
  description: 'Dá acesso aos cursos médios técnicos e à formação profissional.',
  months: null,
}

export function technicalCourse(course: string): PathwayStep {
  return {
    kind: 'academico',
    level: 'medio_tecnico',
    title: `Curso médio técnico de ${course}`,
    need: 'recomendado',
    description: 'Quatro anos, da 10.ª à 13.ª classe, num instituto médio politécnico ou industrial.',
    months: { min: 48, max: 48 },
  }
}

export function inpCourse(course: string): PathwayStep {
  return {
    kind: 'formacao',
    title: `Formação em ${course} (Instituto Nacional de Petróleos ou outro centro)`,
    need: 'recomendado',
    certificate: 'opcional',
    description:
      'O Instituto Nacional de Petróleos forma técnicos para o petróleo, as minas e o gás desde 1983, com parceiros como a Sonangol e a TotalEnergies. Os centros de formação profissional são certificados pelo INEFOP.',
    months: { min: 3, max: 12 },
  }
}

export const MEDICAL: PathwayStep = {
  kind: 'certificacao',
  title: 'Exame médico para trabalho offshore',
  need: 'essencial',
  certificate: 'exigido',
  description:
    'Antes de ir para o mar, o empregador pede um certificado de aptidão médica para trabalho offshore, que confirma a aptidão física e mental. É pedido também antes do BOSIET.',
  months: null,
}

export const BOSIET: PathwayStep = {
  kind: 'certificacao',
  title: 'BOSIET (ou T-BOSIET) com CA-EBS, da OPITO',
  need: 'essencial',
  certificate: 'exigido',
  description:
    'O curso básico de segurança offshore, de cerca de 3 dias: sobrevivência no mar, combate a incêndios, primeiros socorros e fuga de um helicóptero submerso (HUET), com o respirador de emergência (CA-EBS). Só vale se for dado por um centro aprovado pela OPITO; renova-se de 4 em 4 anos com o FOET. Em Angola, o IPGP anuncia o BOSIET e o CFMA, da Sonangol, dá formação em segurança offshore.',
  months: { min: 0, max: 1 },
}

const ONSHORE: PathwayStep = {
  kind: 'experiencia',
  title: 'Experiência em terra: oficina, estaleiro ou base',
  need: 'essencial',
  description:
    'Os anúncios para trabalhar no mar pedem quase sempre experiência anterior. Começa-se muitas vezes em terra, em bases e estaleiros, ou como ajudante de um técnico experiente.',
  months: { min: 24, max: null },
}

const OFFSHORE_STEPS = [MEDICAL, BOSIET]

const TRADE_STAGES: Career['stages'] = [
  {
    level: 'estagio',
    title: 'Ajudante ou técnico estagiário',
    years: { min: 0, max: 2 },
    responsibilities: ['Trabalha ao lado de um técnico experiente', 'Aprende os procedimentos de segurança'],
  },
  {
    level: 'junior',
    title: 'Técnico',
    years: { min: 2, max: 5 },
    responsibilities: ['Faz as tarefas da sua especialidade sozinho', 'Cumpre as autorizações de trabalho'],
  },
  {
    level: 'pleno',
    title: 'Técnico sénior',
    years: { min: 5, max: 10 },
    responsibilities: ['Faz os trabalhos mais difíceis', 'Orienta os ajudantes'],
  },
  {
    level: 'senior',
    title: 'Supervisor ou encarregado',
    years: { min: 10, max: null },
    responsibilities: ['Planeia e distribui o trabalho do turno', 'Responde pela segurança da equipa'],
  },
]

const SAFETY_SKILLS: Skill[] = [
  { id: 'autorizacao-trabalho', name: 'Autorização de trabalho (permit to work)', importance: 'essencial' },
  { id: 'seguranca-offshore', name: 'Segurança offshore e resposta a emergências', importance: 'essencial' },
  { id: 'ingles-tecnico', name: 'Inglês técnico', importance: 'essencial' },
]

const HIRING = [
  'Petrolíferas (operadoras dos blocos)',
  'Empresas de perfuração e de serviços petrolíferos',
  'Estaleiros, bases logísticas e FPSO',
  'Construção, minas e portos',
]

const OFFSHORE_NOTE =
  'Nos últimos 12 meses, os sites de emprego angolanos publicaram 29 anúncios para trabalhar offshore e 84 de mecânica e soldadura (nenhum com o salário). Entre as que mais anunciaram estão a Oceaneering, a SBM Offshore, a Shelf Drilling, a Sonepral, a Dietsmann, a Friedlander e o Sercomoil Group. A lei obriga as empresas do sector a preencher todos os lugares com angolanos; só contratam estrangeiros com autorização do Ministério, quando provam que não há angolanos qualificados.'

const MECHANICAL_SALARY = {
  text: 'Nenhuma tabela pública nomeia estas funções no sector privado. O inquérito WageIndicator de 2026 dá, para os técnicos de engenharia mecânica, entre 227 255 e 1 385 341 Kz líquidos por mês no início da carreira e entre 281 531 e 1 878 949 Kz após 5 anos.',
  source: { label: 'WageIndicator, Angola 2026', url: `${WAGE}tecnicos-de-engenharia-mecanica/` },
}

function market(
  salary?: typeof MECHANICAL_SALARY,
  note = OFFSHORE_NOTE,
  source = LAW_17_09,
  hiringSectors = HIRING,
): Career['market'] {
  return {
    demand: 'media',
    trendPct: null,
    demandNote: { text: note, source, ...(salary ? { salary } : {}) },
    salary: null,
    salaryByStage: [],
    postingsByMonth: [],
    hiringSectors,
  }
}

const CV_GUIDE: Career['cvGuide'] = {
  template: 'classico',
  include: [
    'Os certificados válidos (BOSIET, exame médico, H2S, soldadura, grua), com a data de validade',
    'Os equipamentos em que trabalhaste: bombas, compressores, turbinas, gruas',
    'As instalações: plataforma, FPSO, sonda, estaleiro ou base',
    'Os anos de experiência offshore e onshore',
  ],
  avoid: [
    'Certificados caducados sem o dizer',
    'Funções sem dizer os equipamentos',
    'Fotografias e dados pessoais que a candidatura não pede',
  ],
}

type Guide = Pick<
  Career,
  'description' | 'dayToDay' | 'workContext' | 'workStyles' | 'pathways' | 'market'
> & {
  slug: string
  skills: Skill[]
  stages?: Career['stages']
  cvGuide?: Career['cvGuide']
}

function guide({ slug, skills, stages = TRADE_STAGES, cvGuide = CV_GUIDE, ...rest }: Guide): Career {
  return {
    ...detailed(slug),
    ...rest,
    skills: [...skills, ...SAFETY_SKILLS],
    stages,
    employerAsks: null,
    cvGuide,
  }
}

const OFFSHORE_CONTEXT = (equipment: string): Career['workContext'] => [
  { label: 'Ambiente', value: 'Plataformas, FPSO, sondas e bases em terra' },
  { label: 'Horário', value: 'Turnos de 12 horas, com semanas a bordo e semanas de folga' },
  { label: 'Equipamento', value: equipment },
  { label: 'Segurança', value: 'Autorização de trabalho e equipamento de protecção sempre' },
]

function tradePathway(course: string, inp: string, extra: PathwayStep[] = []): Career['pathways'] {
  return [
    {
      id: 'offshore',
      name: 'Curso técnico, experiência e certificados offshore',
      summary:
        'O caminho mais comum: um curso técnico, experiência em terra e os certificados para ir para o mar.',
      steps: [NINTH, technicalCourse(course), inpCourse(inp), ...extra, ONSHORE, ...OFFSHORE_STEPS],
      totalCost: null,
    },
    {
      id: 'onshore',
      name: 'Trabalho em terra',
      summary: 'Nas bases, estaleiros e refinarias, sem os certificados do mar.',
      steps: [NINTH, inpCourse(inp), ...extra],
      totalCost: null,
    },
  ]
}

export const OFFSHORE_GUIDES: Career[] = [
  guide({
    slug: 'tecnico-de-manutencao-mecanica',
    description:
      'Faz a manutenção preventiva e as reparações das máquinas que mantêm a produção de petróleo e gás: bombas, compressores, turbinas, motores, válvulas e permutadores. Trabalha para as petrolíferas e, sobretudo, para as empresas de serviços que elas contratam, no mar (plataformas e FPSO) ou em terra.',
    dayToDay: [
      'Seguir o plano de manutenção preventiva',
      'Desmontar, reparar e montar bombas e compressores',
      'Alinhar eixos e trocar empanques e rolamentos',
      'Registar cada intervenção no sistema de manutenção',
      'Pedir a autorização de trabalho antes de cada tarefa',
    ],
    workContext: OFFSHORE_CONTEXT('Bombas, compressores, turbinas e válvulas'),
    workStyles: [
      'Gosto por máquinas',
      'Resolver problemas',
      'Rigor com a segurança',
      'Resistência física',
      'Trabalhar em equipa',
    ],
    skills: [
      { id: 'manutencao-bombas-compressores', name: 'Bombas e compressores', importance: 'essencial' },
      { id: 'alinhamento-eixos', name: 'Alinhamento de eixos', importance: 'essencial' },
      { id: 'leitura-desenho-tecnico', name: 'Leitura de desenho técnico', importance: 'essencial' },
      { id: 'sistema-manutencao', name: 'Sistemas de gestão da manutenção', importance: 'opcional' },
    ],
    pathways: tradePathway('Mecânica ou Electromecânica', 'Mecânica de Manutenção'),
    market: market(MECHANICAL_SALARY),
  }),
  guide({
    slug: 'mecanico-de-sonda',
    description:
      'Mantém a funcionar as máquinas de uma sonda de perfuração: os motores diesel, os guinchos, as bombas de lama e os sistemas hidráulicos. Vive a bordo, em turnos, com a equipa de perfuração; as empresas de perfuração e de serviços anunciam estas vagas como "Rig Mechanic".',
    dayToDay: [
      'Inspeccionar motores, guinchos e bombas de lama',
      'Reparar avarias para a perfuração não parar',
      'Fazer a manutenção dos sistemas hidráulicos',
      'Registar as horas e as intervenções de cada máquina',
      'Participar nos exercícios de emergência a bordo',
    ],
    workContext: OFFSHORE_CONTEXT('Motores diesel, guinchos, bombas de lama e hidráulica'),
    workStyles: [
      'Gosto por motores',
      'Decidir depressa',
      'Resistência física',
      'Rigor com a segurança',
      'Viver a bordo',
    ],
    skills: [
      { id: 'motores-diesel', name: 'Motores diesel', importance: 'essencial' },
      { id: 'hidraulica', name: 'Hidráulica', importance: 'essencial' },
      { id: 'manutencao-bombas-compressores', name: 'Bombas e compressores', importance: 'essencial' },
    ],
    pathways: tradePathway('Mecânica', 'Mecânica de Manutenção'),
    market: market(MECHANICAL_SALARY),
  }),
  guide({
    slug: 'soldador-industrial',
    description:
      'Solda e monta tubagens e estruturas de aço, muitas vezes sob pressão, segundo procedimentos aprovados e inspeccionados: em estaleiros de construção de módulos, refinarias, plataformas e bases. Cada soldador é testado e qualificado antes de soldar em tubagens de pressão. O Instituto Nacional de Petróleos forma soldadores e caldeireiros e venceu o primeiro campeonato nacional de soldadura industrial (Angola Skills).',
    dayToDay: [
      'Ler os desenhos e o procedimento de soldadura',
      'Preparar e alinhar as peças',
      'Soldar tubagens e estruturas por eléctrodo, MIG/MAG ou TIG',
      'Corrigir os defeitos que a inspecção encontra',
      'Cumprir a autorização de trabalho a quente',
    ],
    workContext: [
      { label: 'Ambiente', value: 'Estaleiros, oficinas, refinarias e plataformas' },
      { label: 'Horário', value: 'Turnos, com semanas a bordo quando é offshore' },
      { label: 'Equipamento', value: 'Máquinas de soldadura, esmeris e corte' },
      { label: 'Segurança', value: 'Trabalho a quente, com protecção e vigilância de incêndio' },
    ],
    workStyles: [
      'Mãos firmes',
      'Paciência',
      'Atenção ao detalhe',
      'Resistência física',
      'Rigor com a segurança',
    ],
    skills: [
      { id: 'soldadura-tig-mig', name: 'Soldadura por eléctrodo, MIG/MAG e TIG', importance: 'essencial' },
      { id: 'leitura-desenho-tecnico', name: 'Leitura de desenho técnico', importance: 'essencial' },
      { id: 'tubagem', name: 'Montagem de tubagem', importance: 'essencial' },
    ],
    pathways: tradePathway('Metalomecânica', 'Soldador ou Caldeireiro de Tubos', [
      {
        kind: 'certificacao',
        title: 'Qualificação de soldador por norma',
        need: 'essencial',
        certificate: 'exigido',
        description:
          'Antes de soldar em tubagens de pressão, o soldador é testado e qualificado num procedimento de soldadura (por exemplo, pela norma ASME IX ou AWS), e a qualificação fica registada.',
        months: null,
      },
    ]),
    market: market(),
  }),
  guide({
    slug: 'rigger-e-operador-de-grua',
    description:
      'Prepara e faz as elevações de cargas pesadas: escolhe e verifica os cabos, as cintas e as manilhas, prende a carga, dá os sinais ao operador ou opera a grua. Nas plataformas e nos navios de apoio, as gruas descarregam tudo o que chega do mar. As petrolíferas pedem a certificação do operador de grua e do rigger e sinaleiro (há normas OPITO para gruas offshore e para sinaleiros e amarradores).',
    dayToDay: [
      'Planear cada elevação com o peso e o raio da grua',
      'Inspeccionar cabos, cintas e acessórios',
      'Prender e guiar a carga com sinais',
      'Operar a grua da plataforma ou do cais',
      'Parar a operação quando o vento ou o mar não deixam',
    ],
    workContext: [
      { label: 'Ambiente', value: 'Plataformas, navios, cais e estaleiros' },
      { label: 'Horário', value: 'Turnos, com semanas a bordo quando é offshore' },
      { label: 'Equipamento', value: 'Gruas, cabos, cintas e manilhas' },
      { label: 'Segurança', value: 'Ninguém debaixo de uma carga suspensa' },
    ],
    workStyles: [
      'Atenção constante',
      'Comunicar com sinais claros',
      'Calma',
      'Rigor com a segurança',
      'Trabalhar em equipa',
    ],
    skills: [
      { id: 'planeamento-elevacoes', name: 'Planeamento de elevações', importance: 'essencial' },
      { id: 'sinais-grua', name: 'Sinais para o operador de grua', importance: 'essencial' },
      { id: 'operacao-grua', name: 'Operação de grua', importance: 'essencial' },
    ],
    pathways: tradePathway('Mecânica', 'Rigging e operação de gruas', [
      {
        kind: 'certificacao',
        title: 'Certificação de rigger, sinaleiro e operador de grua',
        need: 'essencial',
        certificate: 'exigido',
        description:
          'Para trabalhar no mar, o operador de grua e o rigger ou sinaleiro precisam de uma certificação reconhecida pela empresa, como as normas OPITO para gruas offshore e para sinaleiros e amarradores.',
        months: { min: 0, max: 2 },
      },
    ]),
    market: market(),
  }),
  guide({
    slug: 'operador-de-maquinas-pesadas',
    description:
      'Opera as máquinas que movem terra e cargas: escavadoras, retroescavadoras, pás carregadoras, niveladoras e empilhadores de grande porte. No petróleo trabalha sobretudo em terra, nas bases logísticas, nos estaleiros e nos portos; e há muito trabalho nas obras públicas e nas minas.',
    dayToDay: [
      'Verificar a máquina antes de começar: óleo, pneus, luzes',
      'Escavar, carregar e nivelar segundo o plano',
      'Movimentar contentores e cargas nas bases e portos',
      'Avisar a manutenção das avarias',
      'Respeitar as zonas de segurança à volta da máquina',
    ],
    workContext: [
      { label: 'Ambiente', value: 'Bases logísticas, estaleiros, portos, obras e minas' },
      { label: 'Horário', value: 'Turnos, muitas vezes longe de casa' },
      { label: 'Equipamento', value: 'Escavadoras, pás carregadoras, niveladoras e empilhadores' },
      { label: 'Segurança', value: 'Atenção às pessoas à volta da máquina' },
    ],
    workStyles: [
      'Coordenação',
      'Atenção constante',
      'Responsabilidade',
      'Resistência',
      'Rigor com a segurança',
    ],
    skills: [
      { id: 'operacao-escavadora', name: 'Escavadora e retroescavadora', importance: 'essencial' },
      { id: 'operacao-empilhador', name: 'Empilhador de grande porte', importance: 'essencial' },
      { id: 'verificacao-maquinas', name: 'Verificação diária da máquina', importance: 'essencial' },
    ],
    pathways: [
      {
        id: 'formacao',
        name: 'Formação de operador e experiência',
        summary:
          'Um curso de operador num centro de formação certificado e prática com um operador experiente.',
        steps: [
          NINTH,
          {
            kind: 'formacao',
            title: 'Curso de operador de máquinas pesadas',
            need: 'essencial',
            certificate: 'exigido',
            description:
              'Num centro de formação profissional certificado pelo INEFOP ou da própria empresa, com teoria e horas de máquina.',
            months: { min: 1, max: 6 },
          },
          {
            kind: 'certificacao',
            title: 'Carta de condução',
            need: 'recomendado',
            certificate: 'opcional',
            description:
              'Muitas empresas pedem a carta de condução, sobretudo para máquinas que andam na estrada.',
            months: null,
          },
          {
            kind: 'experiencia',
            title: 'Prática com um operador experiente',
            need: 'essencial',
            description: 'Começa-se como ajudante ou em máquinas mais pequenas.',
            months: { min: 6, max: null },
          },
        ],
        totalCost: null,
      },
    ],
    market: market(
      undefined,
      OFFSHORE_NOTE.replace(
        '29 anúncios para trabalhar offshore e 84 de mecânica e soldadura',
        '18 anúncios de operadores de máquinas e riggers',
      ),
      LAW_17_09,
      [
        'Bases logísticas e portos',
        'Construção e obras públicas',
        'Minas',
        'Empresas de serviços petrolíferos',
      ],
    ),
  }),
  guide({
    slug: 'tecnico-de-instrumentacao',
    description:
      'Instala, calibra e repara os instrumentos que medem pressão, temperatura, caudal e nível e as válvulas e sistemas que comandam a produção e param tudo numa emergência. Junta mecânica, electricidade e electrónica, e trabalha nas plataformas, nos FPSO, nas refinarias e nas fábricas.',
    dayToDay: [
      'Calibrar transmissores e manómetros',
      'Testar as válvulas de controlo e de segurança',
      'Encontrar avarias nos circuitos de controlo',
      'Testar os sistemas de paragem de emergência',
      'Registar as calibrações e as reparações',
    ],
    workContext: OFFSHORE_CONTEXT('Transmissores, válvulas de controlo e sistemas de controlo'),
    workStyles: [
      'Raciocínio lógico',
      'Atenção ao detalhe',
      'Gosto por electrónica',
      'Rigor com a segurança',
      'Paciência',
    ],
    skills: [
      { id: 'calibracao-instrumentos', name: 'Calibração de instrumentos', importance: 'essencial' },
      { id: 'valvulas-controlo', name: 'Válvulas de controlo', importance: 'essencial' },
      { id: 'electricidade-industrial', name: 'Electricidade industrial', importance: 'essencial' },
      { id: 'automacao-plc', name: 'Automação e PLC', importance: 'opcional' },
    ],
    pathways: tradePathway('Instrumentação ou Electrónica', 'Instrumentação Industrial'),
    market: market(MECHANICAL_SALARY),
  }),
  guide({
    slug: 'tecnico-de-procurement',
    description:
      'Compra os bens e serviços de que as operações petrolíferas precisam, de peças e equipamentos a navios e empresas de serviços: prepara os concursos, compara propostas, negoceia e acompanha os contratos. A lei do conteúdo local obriga as empresas do sector a comprar a empresas angolanas os bens e serviços da lista de exclusividade e a dar-lhes preferência quando estão em igualdade de qualidade e preço; o procurement aplica estas regras todos os dias.',
    dayToDay: [
      'Receber os pedidos de compra das equipas',
      'Preparar concursos e pedir propostas',
      'Comparar propostas técnicas e comerciais',
      'Negociar e preparar os contratos',
      'Verificar as regras do conteúdo local e os prazos de entrega',
    ],
    workContext: [
      { label: 'Ambiente', value: 'Escritório, nas petrolíferas e empresas de serviços' },
      { label: 'Horário', value: 'De dia, com prazos de concursos' },
      { label: 'Equipa', value: 'Engenheiros, logística, jurídico e fornecedores' },
      { label: 'Responsabilidade', value: 'Contratos de muito dinheiro e regras de ética' },
    ],
    workStyles: ['Negociação', 'Rigor', 'Ética', 'Organização', 'Gosto por números'],
    skills: [
      { id: 'concursos-propostas', name: 'Concursos e análise de propostas', importance: 'essencial' },
      { id: 'gestao-contratos', name: 'Gestão de contratos e fornecedores', importance: 'essencial' },
      { id: 'conteudo-local', name: 'Regras do conteúdo local', importance: 'essencial' },
      { id: 'erp-compras', name: 'Sistemas de compras (ERP)', importance: 'opcional' },
    ],
    pathways: [
      {
        id: 'licenciatura',
        name: 'Licenciatura e procurement',
        summary: 'Uma licenciatura em gestão, economia, engenharia ou logística e experiência em compras.',
        steps: [
          {
            kind: 'academico',
            level: 'licenciatura',
            title: 'Licenciatura em Gestão, Economia, Engenharia ou Logística',
            need: 'recomendado',
            description: 'Quatro a cinco anos. Os engenheiros compram melhor os equipamentos técnicos.',
            months: { min: 48, max: 60 },
          },
          inpCourse('Gestão, Logística e Aprovisionamento'),
          {
            kind: 'certificacao',
            title: 'Certificação em compras e cadeia de abastecimento',
            need: 'opcional',
            certificate: 'opcional',
            description: 'Certificações internacionais como as do CIPS ajudam a subir na carreira.',
            months: { min: 3, max: 12 },
          },
          {
            kind: 'experiencia',
            title: 'Experiência em compras ou logística',
            need: 'essencial',
            description: 'Começa-se muitas vezes como assistente de compras ou técnico de logística.',
            months: { min: 24, max: null },
          },
        ],
        totalCost: null,
      },
    ],
    stages: [
      {
        level: 'junior',
        title: 'Assistente ou Técnico de Procurement',
        years: { min: 0, max: 4 },
        responsibilities: ['Prepara pedidos de cotação', 'Acompanha encomendas e entregas'],
      },
      {
        level: 'pleno',
        title: 'Comprador Sénior ou Especialista de Contratos',
        years: { min: 4, max: 10 },
        responsibilities: ['Conduz concursos', 'Negoceia e gere contratos'],
      },
      {
        level: 'senior',
        title: 'Gestor de Procurement',
        years: { min: 10, max: null },
        responsibilities: ['Define a estratégia de compras', 'Responde pelo plano de conteúdo local'],
      },
    ],
    market: market(
      {
        text: 'O inquérito WageIndicator de 2026 dá, para os compradores, entre 183 438 e 652 181 Kz líquidos por mês no início da carreira e entre 285 029 e 1 143 054 Kz após 5 anos; para os directores de compras, entre 221 581 e 1 563 228 Kz no início.',
        source: { label: 'WageIndicator, Angola 2026', url: `${WAGE}compradores/` },
      },
      'Nos últimos 12 meses, os sites de emprego angolanos publicaram 35 anúncios de compras e procurement, de vários sectores (nenhum com o salário). No petróleo, a lei do conteúdo local obriga as empresas a comprar a empresas angolanas os bens e serviços da lista de exclusividade e a preferi-las quando estão em igualdade de qualidade e preço.',
      LOCAL_CONTENT,
      ['Petrolíferas e empresas de serviços', 'Indústria e distribuição', 'Construção', 'Logística'],
    ),
    cvGuide: {
      template: 'classico',
      include: [
        'Os concursos e contratos que conduziste, com valores e poupanças',
        'Os sistemas de compras que usas (ERP)',
        'O conhecimento das regras do conteúdo local',
        'As certificações em compras',
      ],
      avoid: [
        'Valores confidenciais de contratos',
        'Listas de tarefas sem resultados',
        'Erros de ortografia',
      ],
    },
  }),
]

// The training centres of the oil and gas industry, with what their own pages or the news state.
const offer = (name: string, careers: string[], areas: CareerGroup[] = [GROUP]): AcademyOffer => ({
  course: {
    id: name
      .toLowerCase()
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, ''),
    name,
  },
  name,
  level: 'formacao_profissional',
  careers,
  areas,
})

const MECHANICS = ['tecnico-de-manutencao-mecanica', 'mecanico-de-sonda']
const OFFSHORE_ALL = OFFSHORE_CAREERS.map((career) => career.slug).filter(
  (slug) => slug !== 'tecnico-de-procurement',
)

export const OIL_ACADEMIES: Academy[] = [
  {
    id: 'instituto-nacional-de-petroleos',
    name: 'Instituto Nacional de Petróleos (INP)',
    type: 'instituto_medio',
    ownership: 'publica',
    province: 'Cuanza Sul',
    place: 'Sumbe',
    website: 'https://inp.gov.ao',
    summary:
      'Criado em 1983 da fusão do Instituto Médio de Petróleos com a Escola Central de Petróleos, forma técnicos para a indústria do petróleo, das minas e do gás e dá formação às empresas do sector, com parceiros como a Sonangol e a TotalEnergies. Tem um centro de well control, perfuração e completação (CFWC).',
    offers: [
      offer('Mecânica de Manutenção', MECHANICS),
      offer('Instrumentação Industrial', ['tecnico-de-instrumentacao']),
      offer('Soldador', ['soldador-industrial']),
      offer('Caldeireiro de Tubos - Tubista', ['soldador-industrial']),
      offer('Caldeireiro de Estruturas', ['soldador-industrial']),
      offer('Serralheiro Mecânico', ['soldador-industrial', 'tecnico-de-manutencao-mecanica']),
      offer('Técnico de Mecatrónica', ['tecnico-de-manutencao-mecanica', 'tecnico-de-instrumentacao']),
      offer('Electricidade Industrial', ['tecnico-de-instrumentacao']),
      offer('Operador de Produção', ['operador-de-producao-petrolifera'], ['petroleo_gas']),
      offer('Operador de Refinaria', ['operador-de-producao-petrolifera'], ['petroleo_gas']),
      offer('Well Control', ['engenheiro-de-perfuracao', 'mecanico-de-sonda'], ['petroleo_gas', GROUP]),
      offer('Gestão, Logística e Aprovisionamento', ['tecnico-de-procurement']),
      offer(
        'Técnico de Segurança e Higiene no Trabalho',
        ['tecnico-de-seguranca-no-trabalho'],
        ['petroleo_gas'],
      ),
    ],
    sources: [{ label: 'Instituto Nacional de Petróleos', url: 'https://inp.gov.ao/' }],
  },
  {
    id: 'centro-de-formacao-maritima-de-angola',
    name: 'Centro de Formação Marítima de Angola (CFMA)',
    type: 'centro_formacao',
    ownership: 'publica',
    province: 'Luanda',
    place: 'Cacuaco (Luanda) e Sumbe (Cuanza Sul)',
    summary:
      'Unidade de negócio do grupo Sonangol, criada em 2009, para a formação dos profissionais da indústria: segurança marítima e offshore, petróleo e gás, capacitação técnico-profissional e gestão. Aberta a empresas e a particulares; em 2021, os cursos custavam entre 40 mil e 700 mil Kz.',
    offers: [
      offer('Segurança Marítima e Offshore', OFFSHORE_ALL),
      offer('Oil & Gas', ['operador-de-producao-petrolifera', ...MECHANICS], ['petroleo_gas', GROUP]),
      offer('Capacitação Técnico-profissional', OFFSHORE_ALL),
      offer('Gestão e Soft Skills', ['tecnico-de-procurement']),
      {
        ...offer('Formação marítima e certificação STCW', ['oficial-da-marinha-mercante'], ['ciencias_vida']),
        level: 'certificacao',
      },
    ],
    sources: [
      {
        label: 'The Maritime Executive: abertura do CFMA (2014)',
        url: 'https://maritime-executive.com/corporate/New-Maritime-Training-Facility-Launched-in-Angola-2014-08-29',
      },
      {
        label: 'Ver Angola: Sonangol relança o CFMA (2021)',
        url: 'https://www.verangola.net/va/pt/062021/Educacao/25748/Sonangol-relan%C3%A7a-Centro-de-Forma%C3%A7%C3%A3o-Mar%C3%ADtima.htm',
      },
      {
        label: 'Ver Angola: os pacotes de formação do CFMA (2022)',
        url: 'https://www.verangola.net/va/pt/072022/Energia/31744/Centro-de-Forma%C3%A7%C3%A3o-Mar%C3%ADtima-prepara-pacotes-de-forma%C3%A7%C3%A3o-para-quadros-da-ind%C3%BAstria--petrol%C3%ADfera.htm',
      },
    ],
  },
  {
    id: 'instituto-profissional-de-gestao-de-petroleo',
    name: 'Instituto Profissional de Gestão de Petróleo (IPGP)',
    type: 'centro_formacao',
    ownership: null,
    province: 'Luanda',
    place: 'Luanda',
    website: 'https://ipgp.ao',
    summary:
      'Centro de formação para o petróleo e gás: operações, segurança offshore, contratos, contabilidade petrolífera e logística, com certificados verificáveis por QR e conteúdos alinhados com as normas IADC, OPITO e IWCF, segundo o seu site.',
    offers: [
      offer('Offshore: BOSIET + HSE', OFFSHORE_ALL),
      offer('BST: Sobrevivência em Alto Mar', OFFSHORE_ALL),
      offer('Técnico de Operações de Refinaria', ['operador-de-producao-petrolifera'], ['petroleo_gas']),
      offer('Contabilidade Petrolífera', ['tecnico-de-procurement']),
    ],
    sources: [{ label: 'IPGP', url: 'https://ipgp.ao/' }],
  },
  {
    id: 'academia-petroangola',
    name: 'Academia PetroAngola',
    type: 'centro_formacao',
    ownership: 'privada',
    province: 'Luanda',
    place: 'Marginal de Luanda',
    website: 'https://academia.petroangola.com',
    summary:
      'Centro de formação técnica e profissional para os trabalhadores e quadros do sector petrolífero, com cursos de upstream, midstream, downstream e negócio e um calendário anual.',
    offers: [
      offer(
        'Introdução à Indústria Petrolífera',
        ['operador-de-producao-petrolifera', 'tecnico-de-procurement'],
        ['petroleo_gas', GROUP],
      ),
      offer(
        'Fundamentos da Indústria Petrolífera Angolana',
        ['tecnico-de-procurement'],
        ['petroleo_gas', GROUP],
      ),
    ],
    sources: [{ label: 'Academia PetroAngola', url: 'https://academia.petroangola.com/' }],
  },
]

const ad = (label: string, url: string): SourceLink => ({ label, url })

/** The oil service firms that advertised most offshore and mechanical posts in the last 12 months. */
const employer = (
  id: string,
  name: string,
  summaryText: string,
  careers: string[],
  source: SourceLink,
): Company => ({
  id,
  name,
  sector: 'energia',
  province: 'Luanda',
  place: 'Luanda',
  summary: summaryText,
  careers,
  careersSourced: true,
  areas: [GROUP, 'petroleo_gas'],
  programs: [],
  partners: [],
  sources: [source],
})

/** An employer outside Luanda or outside the offshore group; careersSourced is true only where an ad names the post. */
const elsewhere = (
  base: Company,
  province: string,
  place: string,
  careersSourced: boolean,
  group: CareerGroup = 'petroleo_gas',
): Company => ({ ...base, province, place, careersSourced, areas: [group] })

const MINE: CareerGroup = 'minas_geologia'

export const OFFSHORE_COMPANIES: Company[] = [
  elsewhere(
    {
      ...employer(
        'angola-lng',
        'Angola LNG',
        'A fábrica de gás natural liquefeito do Soyo, a produzir desde 2013, com capacidade de 5,2 milhões de toneladas por ano. Os sócios são a Sonangol, a Chevron, a TotalEnergies, a BP e a Eni.',
        [
          'engenheiro-de-processos-de-refinacao',
          'operador-de-producao-petrolifera',
          'tecnico-de-manutencao-mecanica',
          'tecnico-de-instrumentacao',
        ],
        ad(
          'Angorecruta: vagas da Angola LNG (Julho de 2026)',
          'https://angorecruta.com/a-angola-lng-abre-vagas-de-emprego-em-diversas-areas/',
        ),
      ),
      website: 'https://www.angolalng.com',
    },
    'Zaire',
    'Soyo',
    false,
  ),
  elsewhere(
    employer(
      'refinaria-de-cabinda',
      'Refinaria de Cabinda (Gemcorp)',
      'Nova refinaria ligada à Gemcorp, com 10% da Sonangol. A primeira fase trata 30 mil barris por dia e arrancou em 2026.',
      [
        'engenheiro-de-processos-de-refinacao',
        'operador-de-producao-petrolifera',
        'tecnico-de-instrumentacao',
      ],
      ad(
        'Ver Angola: arranque da refinaria de Cabinda (Fevereiro de 2026)',
        'https://www.verangola.net/va/en/022026/Energy/47618/Cabinda-refinery-expected-to-start-selling-fuels-in-March.htm',
      ),
    ),
    'Cabinda',
    'Cabinda',
    false,
  ),
  elsewhere(
    employer(
      'cnec-refinaria-do-lobito',
      'CNEC (obra da Refinaria do Lobito)',
      'Em Abril de 2026 anunciou vagas em 16 áreas para o projecto da Refinaria do Lobito, incluindo operadores de máquina e de grua.',
      ['operador-de-maquinas-pesadas', 'rigger-e-operador-de-grua'],
      ad(
        'Angorecruta: vagas no projecto da Refinaria do Lobito (Abril de 2026)',
        'https://angorecruta.com/a-empresa-cnec-vagas-em-16-areas-para-o-projecto-da-refinaria-do-lobito/',
      ),
    ),
    'Benguela',
    'Lobito',
    true,
    GROUP,
  ),
  elsewhere(
    {
      ...employer(
        'sociedade-mineira-do-chitotolo',
        'Sociedade Mineira do Chitotolo',
        'Explora diamantes na Lunda Norte. Em Junho de 2026 anunciou vagas de engenheiro de minas, especialista em Micromine e metalurgista.',
        ['engenheiro-de-minas', 'engenheiro-metalurgico'],
        ad(
          'Angorecruta: vagas do Chitotolo (Junho de 2026)',
          'https://angorecruta.com/a-sociedade-mineira-do-chitotolo-abre-vagas-de-emprego-em-diversas-areas/',
        ),
      ),
      sector: 'mineracao',
    },
    'Lunda Norte',
    'Lunda Norte',
    true,
    MINE,
  ),
  elsewhere(
    {
      ...employer(
        'sociedade-mineira-de-kaixepa',
        'Sociedade Mineira de Kaixepa',
        'Empresa mineira da Lunda Norte, com mais de 600 trabalhadores. Em Agosto de 2026 procurava um superintendente de metalurgia e técnicos de metalurgia e mecânica.',
        ['engenheiro-metalurgico'],
        ad(
          'Angorecruta: vagas da Kaixepa (Agosto de 2026)',
          'https://angorecruta.com/sociedade-mineira-de-kaixepa-recrutamento/',
        ),
      ),
      sector: 'mineracao',
    },
    'Lunda Norte',
    'Lunda Norte',
    true,
    MINE,
  ),
  elsewhere(
    {
      ...employer(
        'sociedade-mineira-do-lulo',
        'Sociedade Mineira do Lulo',
        'Explora os diamantes aluvionares do Lulo, na Lunda Norte, de onde saiu o maior diamante conhecido de Angola, com 404 quilates. A Endiama e a australiana Lucapa são sócias.',
        ['engenheiro-de-minas', 'geologo', 'operador-de-maquinas-pesadas'],
        ad('Lucapa: projecto do Lulo', 'https://www.lucapa.com.au/projects/lulo/'),
      ),
      sector: 'mineracao',
    },
    'Lunda Norte',
    'Lunda Norte',
    false,
    MINE,
  ),
  elsewhere(
    {
      ...employer(
        'ozango-minerais',
        'Ozango Minerais',
        'A empresa angolana do projecto de terras raras de Longonjo, no Huambo, participada pela britânica Pensana e pelo Estado.',
        ['engenheiro-de-minas', 'geologo', 'engenheiro-metalurgico'],
        ad('Pensana: projecto de Longonjo', 'https://pensana.co.uk/longonjo-rare-earths-refinery-project'),
      ),
      sector: 'mineracao',
    },
    'Huambo',
    'Longonjo',
    false,
    MINE,
  ),
  elsewhere(
    {
      ...employer(
        'ango-alloys',
        'Ango Alloys',
        'Sociedade angolana que vai instalar uma fábrica de ferro-ligas. Em Maio de 2026 anunciou 28 vagas, de engenharia, produção e manutenção.',
        ['engenheiro-metalurgico'],
        ad(
          'Angorecruta: 28 vagas (Maio de 2026)',
          'https://angorecruta.com/a-ango-alloys-lda-abre-28-vagas-para-industria-de-producao-de-ferro-ligas/',
        ),
      ),
      sector: 'industria',
    },
    'Icolo e Bengo',
    'Icolo e Bengo',
    false,
    MINE,
  ),
  elsewhere(
    {
      ...employer(
        'angola-iron-and-steel',
        'Angola Iron and Steel Corporation',
        'Em Setembro de 2026 anunciou 8 vagas, sobretudo de recursos humanos, para trabalhar no Dande, no Bengo.',
        ['engenheiro-metalurgico'],
        ad(
          'Angorecruta: 8 vagas (Setembro de 2026)',
          'https://angorecruta.com/recrutamento-8-vagas-na-empresa-angola-iron-and-steel-corporation/',
        ),
      ),
      sector: 'industria',
    },
    'Bengo',
    'Dande',
    false,
    MINE,
  ),
  employer(
    'oceaneering-angola',
    'Oceaneering Angola',
    'Empresa de serviços petrolíferos (robótica submarina e engenharia offshore). Em Agosto de 2026 anunciou 113 vagas para trabalhar em terra e no mar, de nível médio e superior.',
    ['tecnico-de-manutencao-mecanica', 'tecnico-de-instrumentacao', 'rigger-e-operador-de-grua'],
    ad(
      'Angorecruta: 113 vagas (Agosto de 2026)',
      'https://angorecruta.com/a-oceaneering-angola-abre-113-vagas-de-empreo-em-varias-areas-nivel-medio-ou-superior/',
    ),
  ),
  employer(
    'sbm-offshore-angola',
    'SBM Offshore Angola',
    'Opera FPSO, os navios que produzem e armazenam petróleo no mar. Em 2026 anunciou vagas offshore e onshore, incluindo 197 em Junho.',
    [
      'tecnico-de-manutencao-mecanica',
      'tecnico-de-instrumentacao',
      'rigger-e-operador-de-grua',
      'tecnico-de-procurement',
    ],
    ad(
      'Angorecruta: 197 vagas (Junho de 2026)',
      'https://angorecruta.com/a-sbm-offshore-angola-abre-197-vagas-para-industria-de-petroleo-e-gas-offshore-e-onshore/',
    ),
  ),
  employer(
    'shelf-drilling',
    'Shelf Drilling',
    'Empresa de perfuração offshore. Em Agosto de 2026 procurava 15 profissionais angolanos para uma plataforma de perfuração.',
    ['mecanico-de-sonda', 'rigger-e-operador-de-grua', 'tecnico-de-manutencao-mecanica'],
    ad(
      'Angorecruta: 15 vagas (Agosto de 2026)',
      'https://angorecruta.com/a-shelf-drilling-procura-15-talentos-angolanos-para-apoiar-as-operacoes-de-uma-plataforma-de-perfuracao/',
    ),
  ),
  employer(
    'sonepral',
    'Sonepral',
    'Empresa de serviços petrolíferos que recruta para sondas offshore: em 2026 anunciou vagas de mecânico e electricista de sonda.',
    ['mecanico-de-sonda', 'tecnico-de-instrumentacao'],
    ad(
      'Jobartis: Mecânico de Rig (Offshore)',
      'https://www.jobartis.com/emprego-sonepral-lda-mecanico-de-rig-offshore-recrutamento-urgente',
    ),
  ),
  employer(
    'dietsmann-angola',
    'Dietsmann Angola',
    'Empresa de operação e manutenção de instalações de petróleo e gás. Anunciou várias vagas para a indústria petrolífera em 2026.',
    ['tecnico-de-manutencao-mecanica', 'tecnico-de-instrumentacao'],
    ad(
      'Angorecruta: vagas da Dietsmann (Agosto de 2026)',
      'https://angorecruta.com/a-dietsmann-angola-abre-07-vagas-de-emprego-para-industria-petrolifera/',
    ),
  ),
  employer(
    'friedlander',
    'Friedlander',
    'Empresa de metalomecânica e serviços industriais. Em 2026 recrutou para a área metalomecânica, em terra e no mar.',
    ['soldador-industrial', 'rigger-e-operador-de-grua', 'tecnico-de-manutencao-mecanica'],
    ad(
      'Angoemprego: vagas de metalomecânica (Setembro de 2026)',
      'https://angoemprego.com/friedlander-recruta-varias-vagas-na-area-metalomecanica-offshore-onshore/',
    ),
  ),
]
