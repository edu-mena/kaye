import type { Career, PathwayStep, Skill } from '../types'
import { BOSIET, inpCourse, MEDICAL, technicalCourse } from './offshoreTrades'
import {
  certification,
  degree,
  firstJob,
  ladder,
  market as marketOf,
  skill,
  technicalRoute,
  type TechSalary,
  universityRoute,
  wage,
} from './technologyGuides'

// The oil, gas and mining careers' full pages (ADR 0010), from public sources:
// - the demand: the job titles in the Angolan job ads of the last 12 months (scrapers/data/postings.jsonl), plus the
//   posts named inside the ads of Chitotolo and Kaixepa. The big ads do not list every post, so the counts are a minimum;
// - the salaries: the WageIndicator 2026 survey for the same or the closest occupation, in the demand note;
// - the Engineers' Order: its admission regulation (Regulamento n.º 4/20). Whether a job demands membership was not
//   found, so the guides say to confirm it.

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

const BIG_ADS =
  ' Os anúncios grandes do sector, como os de 197 vagas da SBM Offshore ou de 113 da Oceaneering, raramente separam todas as funções.'

function market(postings: number, salary: TechSalary, sectors: string[]): Career['market'] {
  const base = marketOf(postings, salary, sectors, { name: 'petróleo, gás e minas', total: 139 })
  return {
    ...base,
    demandNote: base.demandNote && { ...base.demandNote, text: `${base.demandNote.text}${BIG_ADS}` },
  }
}

const SALARY = {
  engineer: wage(
    'engenheiros-de-minas-metalurgistas-e-profissionais',
    'os engenheiros de minas, metalurgistas e profissões próximas',
    'entre 430 576 e 1 069 678',
    'entre 684 379 e 1 591 047',
  ),
  chemical: wage(
    'engenheiros-quimicos',
    'a função mais próxima (engenheiros químicos)',
    'entre 430 576 e 1 069 678',
    'entre 684 379 e 1 591 047',
  ),
  operator: wage(
    'operadores-de-refinarias-de-petroleo-e-gas-natural',
    'os operadores de refinarias de petróleo e gás natural',
    'entre 225 031 e 1 398 188',
    'entre 321 489 e 2 108 237',
  ),
  geoscientist: wage(
    'geologos-e-geofisicos',
    'os geólogos e geofísicos',
    'entre 332 590 e 1 003 463',
    'entre 515 704 e 1 608 957',
  ),
}

const OIL_SECTORS = ['Petrolíferas', 'Empresas de serviços petrolíferos', 'Agência e Estado', 'Consultoras']
const MINE_SECTORS = ['Diamantes', 'Outros minérios', 'Estado', 'Pedreiras e construção']

const SEA: Career['workContext'] = [
  { label: 'Ambiente', value: 'Escritório em Luanda e períodos a bordo' },
  { label: 'Horário', value: 'Normal em terra, turnos de 12 horas no mar' },
  { label: 'Equipa', value: 'Engenheiros, geólogos e técnicos' },
  { label: 'Viagens', value: 'Frequentes, para plataformas e bases' },
]
const RIG: Career['workContext'] = [
  { label: 'Ambiente', value: 'Sondas, plataformas e FPSO' },
  { label: 'Horário', value: 'Turnos de 12 horas, com semanas a bordo e semanas de folga' },
  { label: 'Equipa', value: 'Equipa do turno e sala de controlo' },
  { label: 'Segurança', value: 'Autorização de trabalho e equipamento de protecção sempre' },
]
const PLANT: Career['workContext'] = [
  { label: 'Ambiente', value: 'Refinaria ou fábrica, entre o escritório e as unidades' },
  { label: 'Horário', value: 'Normal, com turnos e prevenção em muitas empresas' },
  { label: 'Equipa', value: 'Operadores, manutenção e laboratório' },
  { label: 'Segurança', value: 'Produtos perigosos: regras rígidas' },
]
const MINE: Career['workContext'] = [
  { label: 'Ambiente', value: 'Minas e campos, muitas vezes longe das cidades' },
  { label: 'Horário', value: 'Turnos e períodos longos no local' },
  { label: 'Equipa', value: 'Engenheiros, geólogos e operadores de máquinas' },
  { label: 'Viagens', value: 'Frequentes, sobretudo às Lundas' },
]
const LAB: Career['workContext'] = [
  { label: 'Ambiente', value: 'Escritório e computador, com saídas ao campo' },
  { label: 'Horário', value: 'Normal, mais intenso nas campanhas de campo' },
  { label: 'Equipa', value: 'Geólogos, geofísicos e engenheiros' },
  { label: 'Viagens', value: 'Algumas, para o campo ou para o mar' },
]

const CV: Career['cvGuide'] = {
  template: 'classico',
  include: [
    'Os projectos, campos ou minas em que trabalhaste, com o teu papel',
    'Os programas que dominas, com um exemplo de uso',
    'Os certificados válidos, com a data',
    'O estágio e o trabalho de fim de curso, se estás a começar',
    'O inglês técnico, com o nível real',
  ],
  avoid: [
    'Certificados caducados sem o dizer',
    'Listas de programas que nunca usaste',
    'Fotografia e dados pessoais que a vaga não pede',
  ],
}

const ENGLISH = skill('ingles-tecnico', 'Inglês técnico')
const SAFETY = skill('seguranca-industrial', 'Segurança industrial e gestão de riscos')
const GEOLOGY = skill('geologia', 'Geologia')
const MAPPING = skill('mapas-sig', 'Mapas e sistemas de informação geográfica', 'opcional')

export const ORDER = certification(
  'Ordem dos Engenheiros de Angola',
  'A entrada como membro efectivo começa por um estágio como membro estagiário, com formação em ética. Confirma com a Ordem se a tua função a exige.',
)
const INTERNSHIP = firstJob(
  'Estágio numa empresa do sector',
  'Procura os programas de estágio das petrolíferas e das minas ainda durante o curso.',
)

const degreeSteps = (title: string, description: string, ...rest: PathwayStep[]) => [
  degree(title, description),
  INTERNSHIP,
  ...rest,
]

const skills = (...list: Skill[]) => [...list, SAFETY, ENGLISH]

const guide = ({
  postings,
  salary,
  sectors,
  ...entry
}: Omit<Guide, 'market' | 'employerAsks' | 'cvGuide'> & {
  postings: number
  salary: TechSalary
  sectors: string[]
}): Guide => ({
  ...entry,
  employerAsks: null,
  market: market(postings, salary, sectors),
  cvGuide: CV,
})

export const OIL_MINING_GUIDES: Guide[] = [
  guide({
    slug: 'engenheiro-de-petroleos',
    description:
      'Estuda os reservatórios debaixo da terra e do mar e decide como tirar deles o petróleo e o gás da melhor forma. Nos anúncios, esta função raramente aparece com este nome, por isso vale a pena olhar também para os estágios e os programas das petrolíferas.',
    dayToDay: [
      'Analisar dados de poços e reservatórios',
      'Prever a produção em modelos de computador',
      'Propor novos poços e melhorias',
      'Acompanhar a produção com as equipas no mar',
      'Preparar relatórios para os sócios e a ANPG',
    ],
    workContext: SEA,
    workStyles: [
      'Raciocínio lógico',
      'Rigor',
      'Trabalhar em equipa',
      'Decidir com dados',
      'Resistência à pressão',
    ],
    skills: skills(
      skill('engenharia-reservatorios', 'Engenharia de reservatórios'),
      skill('producao-petroleo', 'Engenharia de produção'),
      skill('simulacao-reservatorios', 'Simulação de reservatórios', 'opcional'),
    ),
    pathways: [
      universityRoute('É o caminho normal para as funções de engenharia.', [
        ...degreeSteps(
          'Engenharia de Petróleos',
          'Dá a base de geologia, reservatórios, perfuração e produção.',
          ORDER,
        ),
        firstJob(
          'Primeiro emprego como engenheiro júnior',
          'Numa petrolífera ou empresa de serviços. Para ir ao mar precisas do exame médico e do BOSIET.',
        ),
      ]),
    ],
    stages: ladder('Engenheiro de Petróleos', 'Gestor de Activos', [
      ['Trata dados de poços', 'Aprende com engenheiros seniores'],
      ['Faz os estudos de um campo', 'Propõe melhorias à produção'],
      ['Decide o desenvolvimento de um campo', 'Orienta os mais novos'],
      ['Dirige um activo ou equipa', 'Fala com os sócios e a ANPG'],
    ]),
    postings: 1,
    salary: SALARY.engineer,
    sectors: OIL_SECTORS,
  }),
  guide({
    slug: 'engenheiro-de-perfuracao',
    description:
      'Planeia como furar um poço até ao reservatório e acompanha a perfuração, com segurança e dentro do orçamento. Um erro pode sair muito caro, por isso a função pede formação em controlo de poços e tempo nas sondas.',
    dayToDay: [
      'Desenhar o programa de um poço',
      'Escolher brocas, lamas e revestimentos',
      'Acompanhar a perfuração com a equipa da sonda',
      'Resolver problemas durante a operação',
      'Controlar o tempo e os custos do poço',
    ],
    workContext: RIG,
    workStyles: ['Calma sob pressão', 'Rigor', 'Liderança', 'Resolver problemas', 'Disciplina em segurança'],
    skills: skills(
      skill('programa-poco', 'Desenho de poços'),
      skill('controlo-poco', 'Controlo de poços (well control)'),
      skill('fluidos-perfuracao', 'Fluidos de perfuração'),
    ),
    pathways: [
      universityRoute('Precisas da licenciatura e, depois, de experiência nas sondas.', [
        ...degreeSteps(
          'Engenharia de Petróleos',
          'Com as cadeiras de perfuração e completação de poços.',
          MEDICAL,
          BOSIET,
        ),
        certification(
          'Certificado de controlo de poços (IWCF ou IADC)',
          'O Instituto Nacional de Petróleos tem um centro de well control, perfuração e completação.',
        ),
        firstJob(
          'Trabalho numa sonda',
          'Começar numa empresa de serviços dá a experiência que os anúncios pedem.',
        ),
      ]),
    ],
    stages: ladder('Engenheiro de Perfuração', 'Superintendente de Perfuração', [
      ['Acompanha operações a bordo', 'Prepara relatórios diários'],
      ['Planeia secções do poço', 'Acompanha os fornecedores'],
      ['Responde por poços inteiros', 'Resolve os casos difíceis'],
      ['Dirige a campanha de perfuração', 'Responde pela segurança e pelos custos'],
    ]),
    postings: 1,
    salary: SALARY.engineer,
    sectors: ['Empresas de perfuração', 'Empresas de serviços petrolíferos', 'Petrolíferas'],
  }),
  guide({
    slug: 'engenheiro-de-processos-de-refinacao',
    description:
      'Controla e melhora os processos que transformam o petróleo em gasolina, gasóleo e gás. Angola tem a refinaria de Luanda e, desde 2026, a de Cabinda; a do Lobito está em construção. Ainda há muito poucos anúncios com este nome.',
    dayToDay: [
      'Vigiar o desempenho das unidades da refinaria',
      'Calcular balanços de materiais e energia',
      'Propor mudanças para produzir melhor',
      'Investigar desvios de qualidade',
      'Trabalhar com a operação e a manutenção',
    ],
    workContext: PLANT,
    workStyles: [
      'Raciocínio lógico',
      'Atenção ao detalhe',
      'Trabalhar em equipa',
      'Disciplina em segurança',
      'Curiosidade técnica',
    ],
    skills: skills(
      skill('processos-quimicos', 'Processos químicos'),
      skill('balancos-massa-energia', 'Balanços de massa e energia'),
      skill('simulacao-processos', 'Simulação de processos', 'opcional'),
    ),
    pathways: [
      universityRoute('O caminho normal é uma licenciatura em refinação ou engenharia química.', [
        ...degreeSteps(
          'Engenharia de Refinação de Petróleos',
          'Ou Engenharia Química, que abre também outras indústrias.',
          ORDER,
        ),
        firstJob(
          'Primeiro emprego numa refinaria ou fábrica de gás',
          'Começa-se a acompanhar uma unidade, ao lado da operação.',
        ),
      ]),
    ],
    stages: ladder('Engenheiro de Processos', 'Chefe de Unidade', [
      ['Recolhe e analisa dados', 'Aprende a unidade'],
      ['Acompanha uma unidade', 'Propõe melhorias'],
      ['Lidera projectos de melhoria', 'Orienta os mais novos'],
      ['Dirige a engenharia ou a produção', 'Responde pelos resultados'],
    ]),
    postings: 1,
    salary: SALARY.chemical,
    sectors: ['Refinarias', 'Gás natural', 'Indústria química'],
  }),
  guide({
    slug: 'operador-de-producao-petrolifera',
    description:
      'Opera e vigia os equipamentos que separam e bombeiam o petróleo e o gás, na plataforma ou na sala de controlo. Pode começar-se com um curso técnico, mas para trabalhar no mar é preciso o exame médico e o curso de segurança.',
    dayToDay: [
      'Vigiar pressões, temperaturas e caudais',
      'Abrir e fechar válvulas segundo os procedimentos',
      'Fazer rondas às instalações',
      'Preparar equipamentos para a manutenção',
      'Registar a produção e passar o turno',
    ],
    workContext: RIG,
    workStyles: [
      'Atenção constante',
      'Disciplina',
      'Trabalhar em equipa',
      'Calma nas emergências',
      'Responsabilidade',
    ],
    skills: skills(
      skill('operacao-producao', 'Operação de separadores e bombas'),
      skill('sala-controlo', 'Sistemas da sala de controlo'),
      skill('autorizacao-trabalho', 'Autorização de trabalho (permit to work)'),
    ),
    pathways: [
      technicalRoute('O caminho mais comum: curso técnico, formação de operador e certificados do mar.', [
        technicalCourse('Instrumentação, Mecânica ou Electricidade'),
        inpCourse('Operador de Produção'),
        MEDICAL,
        BOSIET,
        firstJob(
          'Primeiro emprego como operador assistente',
          'Os anúncios costumam pedir experiência. Começar em terra ajuda.',
        ),
      ]),
      {
        ...technicalRoute('Nas refinarias e nas fábricas de gás, sem os certificados do mar.', [
          inpCourse('Operador de Refinaria'),
          firstJob(
            'Primeiro emprego numa instalação em terra',
            'A experiência em sala de controlo conta muito.',
          ),
        ]),
        id: 'terra',
        name: 'Refinaria e gás em terra',
      },
    ],
    stages: ladder('Operador de Produção', 'Superintendente de Produção', [
      ['Faz rondas com um colega experiente', 'Aprende as instalações'],
      ['Opera uma área sozinho', 'Prepara equipamentos para a manutenção'],
      ['Opera a sala de controlo', 'Orienta os mais novos'],
      ['Dirige a produção de uma instalação', 'Responde pela segurança'],
    ]),
    postings: 4,
    salary: SALARY.operator,
    sectors: ['Petrolíferas', 'FPSO', 'Refinarias', 'Gás natural'],
  }),
  guide({
    slug: 'engenheiro-de-minas',
    description:
      'Planeia e dirige a extracção de diamantes e outros minérios, com segurança e sem desperdício. Grande parte do trabalho fica nas Lundas, e em 2026 a Sociedade Mineira do Chitotolo anunciou uma vaga com este nome.',
    dayToDay: [
      'Planear a abertura e o avanço da mina',
      'Organizar máquinas, explosivos e equipas',
      'Controlar a produção e os custos',
      'Fazer cumprir as regras de segurança',
      'Trabalhar com os geólogos na avaliação do minério',
    ],
    workContext: MINE,
    workStyles: [
      'Liderança',
      'Planeamento',
      'Disciplina em segurança',
      'Resolver problemas',
      'Viver longe da cidade',
    ],
    skills: skills(
      skill('planeamento-mineiro', 'Planeamento de minas'),
      skill('desmonte-explosivos', 'Perfuração e desmonte'),
      GEOLOGY,
      skill('software-mineiro', 'Programas mineiros, como o Micromine', 'opcional'),
    ),
    pathways: [
      universityRoute('É o caminho normal para esta função.', [
        ...degreeSteps(
          'Engenharia de Minas',
          'Dá a base de geologia, desmonte e planeamento de minas.',
          ORDER,
        ),
        firstJob('Primeiro emprego numa mina', 'Começa-se a acompanhar a frente de trabalho, por turnos.'),
      ]),
    ],
    stages: ladder('Engenheiro de Minas', 'Director de Mina', [
      ['Acompanha a frente de trabalho', 'Faz medições e relatórios'],
      ['Planeia a produção do mês', 'Coordena equipas'],
      ['Responde por uma área da mina', 'Orienta os mais novos'],
      ['Dirige as operações mineiras', 'Responde pela segurança e pelos resultados'],
    ]),
    postings: 3,
    salary: SALARY.engineer,
    sectors: MINE_SECTORS,
  }),
  guide({
    slug: 'geologo',
    description:
      'Estuda as rochas e o subsolo para encontrar minérios, petróleo e água. Foi a profissão da área com mais anúncios próprios: além de minas e petrolíferas, em 2026 o projecto RECLIMA procurou jovens de hidrogeologia no Sul do país.',
    dayToDay: [
      'Fazer trabalho de campo e recolher amostras',
      'Ler e desenhar mapas geológicos',
      'Descrever as amostras das sondagens',
      'Interpretar os dados no computador',
      'Estimar o que há no subsolo',
    ],
    workContext: LAB,
    workStyles: ['Observação', 'Curiosidade', 'Resistência física', 'Rigor', 'Autonomia'],
    skills: skills(
      GEOLOGY,
      skill('cartografia-geologica', 'Cartografia geológica'),
      skill('sondagens', 'Descrição de sondagens'),
      MAPPING,
    ),
    pathways: [
      universityRoute('É o caminho normal, com vários cursos pelo país.', [
        ...degreeSteps('Geologia', 'Ou Engenharia Geológica. Dá a base de rochas, minerais e cartografia.'),
        firstJob('Primeiro emprego no campo', 'Em minas, pesquisa, sondagens ou estudos de água.'),
      ]),
    ],
    stages: ladder('Geólogo', 'Director de Exploração', [
      ['Recolhe amostras', 'Descreve sondagens'],
      ['Faz mapas e interpretações', 'Acompanha campanhas'],
      ['Avalia depósitos', 'Orienta os mais novos'],
      ['Dirige a exploração', 'Decide onde investir'],
    ]),
    postings: 9,
    salary: SALARY.geoscientist,
    sectors: ['Diamantes', 'Outros minérios', 'Petróleo e gás', 'Água e estudos de solos'],
  }),
  guide({
    slug: 'geofisico',
    description:
      'Usa medições sísmicas, magnéticas e da gravidade para ver o subsolo sem o escavar. É uma profissão pequena: no anuário de 2023-2024, só o ISPTEC e a Universidade Agostinho Neto ensinavam Geofísica, e os anúncios são raros.',
    dayToDay: [
      'Planear campanhas de medição',
      'Processar dados sísmicos no computador',
      'Interpretar as imagens do subsolo',
      'Trabalhar com geólogos e engenheiros',
      'Apresentar onde vale a pena procurar',
    ],
    workContext: LAB,
    workStyles: ['Raciocínio matemático', 'Paciência', 'Rigor', 'Curiosidade', 'Trabalhar em equipa'],
    skills: skills(
      skill('sismica', 'Processamento e interpretação sísmica'),
      skill('programacao-cientifica', 'Programação científica', 'opcional'),
      GEOLOGY,
    ),
    pathways: [
      universityRoute('Precisas da licenciatura. Ser forte em matemática e física ajuda muito.', [
        ...degreeSteps('Geofísica', 'Dá a base de física da Terra, sinais e sísmica.'),
        firstJob('Primeiro emprego júnior', 'Na pesquisa de petróleo, em empresas de serviços ou no Estado.'),
      ]),
    ],
    stages: ladder('Geofísico', 'Chefe de Geociências', [
      ['Trata dados', 'Aprende os programas'],
      ['Interpreta uma área', 'Acompanha campanhas'],
      ['Decide as interpretações difíceis', 'Orienta os mais novos'],
      ['Dirige a equipa de geociências', 'Propõe onde pesquisar'],
    ]),
    postings: 2,
    salary: SALARY.geoscientist,
    sectors: ['Petrolíferas', 'Empresas de serviços petrolíferos', 'Instituto Geológico', 'Minas'],
  }),
  guide({
    slug: 'engenheiro-metalurgico',
    description:
      'Transforma os minérios em metais e escolhe e testa os materiais de estruturas e equipamentos. Em 2026 as sociedades mineiras de Chitotolo e Kaixepa anunciaram vagas de metalurgia, e há fábricas de ferro-ligas e de aço a recrutar.',
    dayToDay: [
      'Acompanhar o tratamento do minério',
      'Medir quanto se recupera e onde se perde',
      'Fazer ensaios de materiais',
      'Investigar corrosão e falhas',
      'Propor melhorias ao processo',
    ],
    workContext: PLANT,
    workStyles: [
      'Rigor',
      'Curiosidade técnica',
      'Resolver problemas',
      'Disciplina em segurança',
      'Trabalhar em equipa',
    ],
    skills: skills(
      skill('tratamento-minerios', 'Tratamento de minérios'),
      skill('ensaios-materiais', 'Ensaios de materiais'),
      skill('corrosao', 'Corrosão', 'opcional'),
    ),
    pathways: [
      universityRoute('É o caminho normal. No anuário de 2023-2024, o curso existia em duas universidades.', [
        ...degreeSteps(
          'Engenharia de Metalurgia e Materiais',
          'Na Universidade Lueji A’Nkonde e na Universidade do Namibe.',
          ORDER,
        ),
        firstJob(
          'Primeiro emprego numa lavaria ou fábrica',
          'Começa-se a acompanhar uma linha de tratamento.',
        ),
      ]),
    ],
    stages: ladder('Engenheiro Metalúrgico', 'Superintendente de Metalurgia', [
      ['Faz ensaios', 'Recolhe dados do processo'],
      ['Acompanha uma linha', 'Propõe melhorias'],
      ['Responde pelo processo', 'Orienta os mais novos'],
      ['Dirige a metalurgia', 'Responde pelos resultados'],
    ]),
    postings: 3,
    salary: SALARY.engineer,
    sectors: ['Minas', 'Siderurgia e ferro-ligas', 'Petróleo e gás', 'Indústria'],
  }),
]
