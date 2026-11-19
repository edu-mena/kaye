import type { Career, CareerSummary, Company, PathwayStep, Skill, SourceLink } from '../types'
import { EDUCATION_CAREERS } from './educationCareers'
import {
  certification,
  course,
  degree,
  firstJob,
  ladder,
  market as marketOf,
  NINTH_GRADE,
  skill,
  type TechSalary,
  universityRoute,
  wage,
} from './technologyGuides'

// The education careers' full pages (ADR 0010), from public sources:
// - the demand: the job ads of the last 12 months and the Ministry's 2026 competition (9 000 posts, Ver Angola). The
//   level stays the summary's, which reads both; the count in the note is the job ads' alone;
// - the salaries: the State's base pay on entry (Decreto Presidencial 16/26, already in the summaries) and the
//   WageIndicator 2026 survey, in the demand note;
// - the rules: the competition's requirements (Ver Angola) and Decreto Executivo Conjunto n.º 59/21 (agregação pedagógica).

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
const TEACHERS_SURVEY =
  'entre 263 233 e 869 657 Kz líquidos por mês no início da carreira e entre 418 092 e 1 429 876 Kz após 5 anos'
const publicPay = (who: string, base: string, page: string): TechSalary => ({
  text: `Na função pública, ${who} entra com ${base} Kz de salário base por mês (Decreto Presidencial 16/26). O inquérito WageIndicator de 2026 dá, para os professores, ${TEACHERS_SURVEY}.`,
  source: { label: 'WageIndicator, Angola 2026', url: `${WAGE}${page}/` },
})

const SALARY = {
  teacher: publicPay('um professor com licenciatura', '361 910', 'professores-do-ensino-secundario'),
  primary: publicPay('um professor com licenciatura', '361 910', 'professores-do-ensino-primario'),
  nursery: publicPay(
    'um educador de infância com licenciatura',
    '410 165',
    'educadores-da-primeira-infancia',
  ),
  special: publicPay(
    'um professor com licenciatura',
    '361 910',
    'professores-de-alunos-com-necessidades-educativas',
  ),
  technical: publicPay('um professor com licenciatura', '361 910', 'professores-de-educacao-vocacional'),
  specialist: publicPay('um especialista com licenciatura', '361 910', 'especialistas-em-metodos-de-ensino'),
  lecturer: publicPay(
    'um assistente estagiário',
    '458 419',
    'professores-universitarios-e-de-ensino-superior',
  ),
  trainer: publicPay('um formador com licenciatura', '361 910', 'professores-de-educacao-vocacional'),
  coach: wage(
    'treinadores-instrutores-e-oficiais',
    'os treinadores, instrutores e oficiais desportivos',
    'entre 236 457 e 651 392',
    'entre 325 145 e 1 016 698',
  ),
  fitness: wage(
    'instrutores-de-exercicio-e-actividades-recreativas',
    'os instrutores de exercício físico',
    'entre 236 457 e 651 392',
    'entre 325 145 e 1 016 698',
  ),
}

const COMPETITION =
  ' Em 2026, o concurso público da Educação abriu 8 000 vagas para professores do ensino primário e secundário, nas 21 províncias, com 4% reservadas a candidatos com deficiência.'

const summaryOf = (slug: string): CareerSummary => {
  const found = EDUCATION_CAREERS.find((career) => career.slug === slug)
  if (!found) throw new Error(`Unknown education career ${slug}`)
  return found
}

const SCHOOL: Career['workContext'] = [
  { label: 'Ambiente', value: 'Sala de aula, com turmas muitas vezes grandes' },
  { label: 'Horário', value: 'Por turnos, mais a preparação de aulas e a correcção de provas' },
  { label: 'Equipa', value: 'Professores, coordenação e encarregados de educação' },
  { label: 'Viagens', value: 'Raras, mas no concurso público a colocação pode ser noutra zona' },
]
const OFFICE: Career['workContext'] = [
  { label: 'Ambiente', value: 'Escola, instituição ou serviços da educação' },
  { label: 'Horário', value: 'Normal, com picos no início e no fim do ano lectivo' },
  { label: 'Equipa', value: 'Professores, técnicos e direcção' },
  { label: 'Viagens', value: 'Algumas, para visitas às escolas' },
]
const TRAINING: Career['workContext'] = [
  { label: 'Ambiente', value: 'Salas de formação e oficinas' },
  { label: 'Horário', value: 'Por cursos, muitas vezes pós-laboral' },
  { label: 'Equipa', value: 'Formadores, coordenação e empresas' },
  { label: 'Viagens', value: 'Algumas' },
]
const SPORT: Career['workContext'] = [
  { label: 'Ambiente', value: 'Campos, pavilhões e ginásios' },
  { label: 'Horário', value: 'Fim do dia e fins-de-semana, com competições' },
  { label: 'Equipa', value: 'Atletas, treinadores e direcção do clube' },
  { label: 'Viagens', value: 'Frequentes, para jogos e provas' },
]

const CV: Career['cvGuide'] = {
  template: 'classico',
  include: [
    'As classes, disciplinas ou grupos com que trabalhaste',
    'A formação pedagógica, com o ano',
    'Resultados concretos, como projectos ou melhorias dos alunos',
    'As línguas e os programas que usas em aula',
  ],
  avoid: [
    'Listas de tarefas sem exemplos',
    'Fotografia e dados pessoais que a vaga não pede',
    'Dados de alunos, sobretudo de menores',
  ],
}

const TEACHING = skill('didactica', 'Didáctica e planificação de aulas')
const CLASS = skill('gestao-sala-aula', 'Gestão da sala de aula')
const ASSESSMENT = skill('avaliacao-alunos', 'Avaliação dos alunos')
const DIGITAL = skill('ferramentas-digitais', 'Ferramentas digitais', 'opcional')

const TEACHER_STYLES = [
  'Paciência',
  'Comunicação clara',
  'Organização',
  'Gosto por ensinar',
  'Justiça com os alunos',
]
const TEACHER_DAY = (subject: string) => [
  `Preparar as aulas de ${subject}`,
  'Dar aulas e tirar dúvidas',
  'Fazer e corrigir provas',
  'Registar notas e presenças',
  'Falar com os encarregados de educação',
]

const MAGISTERIO: PathwayStep = {
  kind: 'academico',
  level: 'medio_tecnico',
  title: 'Curso numa Escola de Magistério',
  need: 'recomendado',
  description: 'A formação média de professores, a seguir à 9.ª classe.',
  months: { min: 48, max: 48 },
}
const AGGREGATION = certification(
  'Agregação pedagógica',
  'Para quem tem licenciatura noutra área ou já ensina sem formação de professor. Sem ela, as candidaturas ao ensino costumam limitar-se às cadeiras técnicas.',
)
const COMPETITION_STEP = firstJob(
  'Concurso público ou colégio privado',
  'Na escola pública entra-se por concurso, com testes. Confirma os requisitos de cada ano no Ministério da Educação.',
)

const teacherRoutes = (degreeName: string): Career['pathways'] => [
  universityRoute('A licenciatura em ensino é o caminho mais directo.', [
    degree(degreeName, 'Num instituto superior de ciências da educação ou numa escola superior pedagógica.'),
    COMPETITION_STEP,
  ]),
  {
    id: 'agregacao',
    name: 'Licenciatura noutra área',
    summary: 'Para quem estudou a matéria num curso sem formação de professor.',
    steps: [AGGREGATION, COMPETITION_STEP],
    totalCost: null,
  },
]

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
  const base = marketOf(postings, salary, sectors, { name: 'educação', total: 78 })
  return {
    ...entry,
    employerAsks: null,
    market: {
      ...base,
      demand: summaryOf(entry.slug).demand,
      demandNote: base.demandNote && { ...base.demandNote, text: `${base.demandNote.text}${extra}` },
    },
    cvGuide: CV,
  }
}

const SCHOOLS = ['Escolas públicas', 'Colégios privados', 'Escolas internacionais']

/** A secondary school teacher: the same work and routes, with its subject. */
const secondary = (
  slug: string,
  subject: string,
  name: string,
  degreeName: string,
  description: string,
  subjectSkills: Skill[],
  postings: number,
): Guide =>
  guide({
    slug,
    description,
    dayToDay: TEACHER_DAY(subject),
    workContext: SCHOOL,
    workStyles: TEACHER_STYLES,
    skills: [...subjectSkills, TEACHING, CLASS, ASSESSMENT, DIGITAL],
    pathways: teacherRoutes(degreeName),
    stages: ladder(name, 'Coordenador de Disciplina', [
      ['Dá aulas com apoio', 'Aprende a planificar'],
      ['Dá aulas sozinho', 'Prepara as provas'],
      ['Apoia os colegas', 'Coordena actividades'],
      ['Coordena a disciplina', 'Orienta os mais novos'],
    ]),
    postings,
    salary: SALARY.teacher,
    sectors: SCHOOLS,
    extra: COMPETITION,
  })

const SPORT_ROUTE = (summary: string, last: PathwayStep): Career['pathways'] => [
  universityRoute(summary, [
    degree('Educação Física e Desporto', 'Ou Ciências do Desporto. Dá a base de treino, corpo e pedagogia.'),
    last,
  ]),
]

export const EDUCATION_GUIDES: Guide[] = [
  guide({
    slug: 'educador-de-infancia',
    description:
      'Cuida e ensina crianças pequenas, com jogos, histórias e actividades que as preparam para a escola. Creches e jardins de infância privados anunciaram vagas nos últimos 12 meses.',
    dayToDay: [
      'Preparar actividades e jogos',
      'Ensinar rotinas e regras',
      'Observar como cada criança cresce',
      'Cuidar da higiene e da segurança',
      'Falar com as famílias',
    ],
    workContext: SCHOOL,
    workStyles: ['Paciência', 'Carinho', 'Criatividade', 'Atenção', 'Responsabilidade'],
    skills: [
      skill('desenvolvimento-infantil', 'Desenvolvimento infantil'),
      TEACHING,
      skill('jogos-educativos', 'Jogos educativos'),
      skill('primeiros-socorros', 'Primeiros socorros', 'opcional'),
    ],
    pathways: [
      universityRoute('A licenciatura dá melhor entrada na carreira pública.', [
        degree('Educação de Infância', 'Ou Ensino Pré-Escolar.'),
        COMPETITION_STEP,
      ]),
      {
        id: 'magisterio',
        name: 'Magistério',
        summary: 'Formação média de professores.',
        steps: [NINTH_GRADE, MAGISTERIO, COMPETITION_STEP],
        totalCost: null,
      },
    ],
    stages: ladder('Educador de Infância', 'Coordenador Pedagógico', [
      ['Apoia uma sala', 'Aprende as rotinas'],
      ['Responde por uma sala', 'Fala com as famílias'],
      ['Apoia colegas', 'Prepara projectos'],
      ['Coordena a creche', 'Orienta a equipa'],
    ]),
    postings: 7,
    salary: SALARY.nursery,
    sectors: ['Creches e jardins de infância', 'Colégios privados', 'Estado'],
  }),
  guide({
    slug: 'professor-do-ensino-primario',
    description:
      'Ensina a ler, a escrever e a contar, e acompanha a mesma turma da 1.ª à 6.ª classe. A escola pública é o maior empregador: entra-se por concurso.',
    dayToDay: TEACHER_DAY('todas as disciplinas'),
    workContext: SCHOOL,
    workStyles: TEACHER_STYLES,
    skills: [
      skill('alfabetizacao', 'Ensino da leitura e da escrita'),
      skill('matematica-basica', 'Ensino da matemática básica'),
      TEACHING,
      CLASS,
      ASSESSMENT,
    ],
    pathways: [
      universityRoute('A licenciatura abre mais escalões da carreira.', [
        degree('Ensino Primário', 'Ou Educação Primária.'),
        COMPETITION_STEP,
      ]),
      {
        id: 'magisterio',
        name: 'Magistério',
        summary: 'Formação média de professores.',
        steps: [NINTH_GRADE, MAGISTERIO, COMPETITION_STEP],
        totalCost: null,
      },
    ],
    stages: ladder('Professor Primário', 'Coordenador de Classe', [
      ['Dá aulas com apoio', 'Aprende a planificar'],
      ['Responde por uma turma', 'Acompanha os alunos com dificuldades'],
      ['Apoia os colegas', 'Coordena actividades'],
      ['Coordena uma classe', 'Orienta os mais novos'],
    ]),
    postings: 2,
    salary: SALARY.primary,
    sectors: SCHOOLS,
    extra: COMPETITION,
  }),
  guide({
    slug: 'professor-de-educacao-especial',
    description:
      'Ensina crianças e jovens com deficiência, adaptando as aulas a cada um. Não encontrei anúncios próprios nos últimos 12 meses, e o trabalho está sobretudo nas escolas especiais e nas escolas regulares com estes alunos.',
    dayToDay: [
      'Avaliar o que cada aluno precisa',
      'Adaptar aulas e materiais',
      'Trabalhar com famílias e técnicos',
      'Acompanhar os progressos',
      'Apoiar outros professores',
    ],
    workContext: SCHOOL,
    workStyles: ['Paciência', 'Empatia', 'Criatividade', 'Observação', 'Persistência'],
    skills: [
      skill('educacao-inclusiva', 'Educação inclusiva'),
      skill('adaptacao-curricular', 'Adaptação de aulas'),
      skill('lingua-gestual', 'Língua gestual ou braille', 'opcional'),
      ASSESSMENT,
    ],
    pathways: [
      universityRoute('É o caminho normal.', [
        degree('Educação Especial', 'Ou Ensino Especial.'),
        COMPETITION_STEP,
      ]),
    ],
    stages: ladder('Professor de Educação Especial', 'Coordenador de Inclusão', [
      ['Apoia uma turma', 'Aprende os métodos'],
      ['Acompanha alunos sozinho', 'Adapta materiais'],
      ['Apoia colegas', 'Fala com os técnicos'],
      ['Coordena a inclusão na escola', 'Orienta a equipa'],
    ]),
    postings: 0,
    salary: SALARY.special,
    sectors: ['Escolas especiais', 'Escolas públicas', 'Organizações sociais'],
  }),
  secondary(
    'professor-de-matematica',
    'Matemática',
    'Professor de Matemática',
    'Ensino da Matemática',
    'Ensina Matemática no secundário. É dos cursos de ensino com mais escolas, e colégios privados anunciaram vagas que juntam Matemática, Física e Química.',
    [skill('matematica', 'Matemática')],
    3,
  ),
  secondary(
    'professor-de-lingua-portuguesa',
    'Português',
    'Professor de Língua Portuguesa',
    'Ensino da Língua Portuguesa',
    'Ensina a ler, escrever e interpretar bem em português. Nas escolas angolanas, esta é a língua de ensino, por isso a disciplina pesa em todas as outras.',
    [skill('gramatica-portuguesa', 'Gramática e escrita'), skill('literatura', 'Literatura')],
    1,
  ),
  secondary(
    'professor-de-linguas-estrangeiras',
    'Inglês ou Francês',
    'Professor de Línguas',
    'Ensino da Língua Inglesa',
    'Ensina inglês ou francês em escolas e centros de línguas. Os anúncios pedem sobretudo inglês, em colégios e empresas de formação.',
    [skill('lingua-estrangeira', 'Inglês ou francês fluente'), skill('ensino-linguas', 'Ensino de línguas')],
    7,
  ),
  secondary(
    'professor-de-biologia',
    'Biologia',
    'Professor de Biologia',
    'Ensino da Biologia',
    'Ensina como funcionam os seres vivos, o corpo humano e o ambiente. Não encontrei anúncios próprios nos últimos 12 meses: a entrada é sobretudo pelo concurso público.',
    [skill('biologia', 'Biologia'), skill('aulas-praticas', 'Aulas práticas e laboratório', 'opcional')],
    0,
  ),
  secondary(
    'professor-de-quimica',
    'Química',
    'Professor de Química',
    'Ensino da Química',
    'Ensina a matéria e as suas transformações, com experiências sempre que a escola o permite. Os anúncios privados costumam juntar Química, Física e Matemática.',
    [skill('quimica', 'Química'), skill('aulas-praticas', 'Aulas práticas e laboratório', 'opcional')],
    3,
  ),
  secondary(
    'professor-de-fisica',
    'Física',
    'Professor de Física',
    'Ensino da Física',
    'Ensina como funcionam o movimento, a energia e a electricidade. Os anúncios privados costumam juntar Física, Química e Matemática.',
    [skill('fisica', 'Física'), skill('aulas-praticas', 'Aulas práticas e laboratório', 'opcional')],
    3,
  ),
  secondary(
    'professor-de-historia',
    'História',
    'Professor de História',
    'Ensino da História',
    'Ensina a história de Angola, de África e do mundo, e ajuda os alunos a pensar sobre o passado. Há poucos anúncios privados.',
    [skill('historia', 'História de Angola e de África')],
    1,
  ),
  secondary(
    'professor-de-geografia',
    'Geografia',
    'Professor de Geografia',
    'Ensino da Geografia',
    'Ensina o território, o clima, a população e a economia. Há poucos anúncios privados.',
    [skill('geografia', 'Geografia'), skill('leitura-mapas', 'Leitura de mapas')],
    1,
  ),
  secondary(
    'professor-de-filosofia',
    'Filosofia',
    'Professor de Filosofia',
    'Ensino da Filosofia',
    'Ensina a pensar com rigor e a discutir ideias, na Filosofia e nas Ciências Sociais. Não encontrei anúncios próprios nos últimos 12 meses.',
    [skill('filosofia', 'Filosofia'), skill('argumentacao', 'Argumentação')],
    0,
  ),
  secondary(
    'professor-de-informatica',
    'Informática',
    'Professor de Informática',
    'Ensino da Informática',
    'Ensina a usar computadores e a programar. Colégios e centros de formação anunciaram vagas, e o curso de ensino existe em poucas escolas.',
    [skill('informatica-basica', 'Informática'), skill('programacao', 'Programação', 'opcional')],
    5,
  ),
  guide({
    slug: 'professor-do-ensino-tecnico',
    description:
      'Ensina disciplinas técnicas em institutos médios, como agropecuária ou electricidade. Muitos vêm de uma licenciatura técnica e acrescentam a formação pedagógica.',
    dayToDay: TEACHER_DAY('uma especialidade técnica'),
    workContext: SCHOOL,
    workStyles: TEACHER_STYLES,
    skills: [
      skill('especialidade-tecnica', 'Domínio da especialidade'),
      skill('aulas-oficina', 'Aulas de oficina'),
      TEACHING,
      ASSESSMENT,
    ],
    pathways: [
      universityRoute('Costuma começar por um curso técnico superior.', [
        degree('uma área técnica', 'Ou um curso de ensino técnico, como Ensino da Produção Agropecuária.'),
        AGGREGATION,
        COMPETITION_STEP,
      ]),
    ],
    stages: ladder('Professor Técnico', 'Coordenador de Curso', [
      ['Dá aulas com apoio', 'Prepara oficinas'],
      ['Dá aulas sozinho', 'Acompanha estágios'],
      ['Apoia os colegas', 'Fala com as empresas'],
      ['Coordena um curso', 'Orienta os mais novos'],
    ]),
    postings: 0,
    salary: SALARY.technical,
    sectors: ['Institutos médios', 'Centros de formação'],
    extra: COMPETITION,
  }),
  guide({
    slug: 'pedagogo',
    description:
      'Ajuda as escolas a ensinar melhor: orienta professores, programas e métodos. Nos anúncios aparece como coordenador ou orientador pedagógico, sobretudo em colégios privados.',
    dayToDay: [
      'Assistir a aulas e dar sugestões',
      'Apoiar a planificação',
      'Acompanhar alunos com dificuldades',
      'Preparar formações',
      'Analisar resultados da escola',
    ],
    workContext: OFFICE,
    workStyles: ['Observação', 'Escuta', 'Organização', 'Liderança', 'Tacto'],
    skills: [
      skill('pedagogia', 'Pedagogia'),
      skill('supervisao-pedagogica', 'Supervisão pedagógica'),
      TEACHING,
      ASSESSMENT,
    ],
    pathways: [
      universityRoute('É o caminho normal.', [
        degree('Pedagogia', 'Ou Ciências da Educação.'),
        firstJob('Experiência numa escola', 'Ter dado aulas ajuda a orientar professores.'),
      ]),
    ],
    stages: ladder('Pedagogo', 'Director Pedagógico', [
      ['Apoia a coordenação', 'Observa aulas'],
      ['Acompanha professores', 'Prepara formações'],
      ['Responde pela pedagogia da escola', 'Orienta colegas'],
      ['Dirige a pedagogia', 'Fala com a direcção'],
    ]),
    postings: 3,
    salary: SALARY.specialist,
    sectors: ['Colégios privados', 'Estado', 'Organizações de educação'],
  }),
  guide({
    slug: 'especialista-de-administracao-da-educacao',
    description:
      'Trabalha nos serviços que organizam a educação: dados, inspecção, planeamento e apoio às escolas. É uma carreira do Estado, com tabela própria.',
    dayToDay: [
      'Recolher dados das escolas',
      'Preparar planos e relatórios',
      'Apoiar a gestão dos professores',
      'Visitar escolas',
      'Aplicar as regras do sector',
    ],
    workContext: OFFICE,
    workStyles: ['Organização', 'Rigor', 'Discrição', 'Comunicação', 'Responsabilidade'],
    skills: [
      skill('gestao-educacao', 'Gestão da educação'),
      skill('legislacao-educacao', 'Regras do sector'),
      skill('excel', 'Excel e relatórios'),
    ],
    pathways: [
      universityRoute('A entrada é por concurso público.', [
        degree('Ciências da Educação', 'Ou Pedagogia.'),
        COMPETITION_STEP,
      ]),
    ],
    stages: ladder('Especialista de Educação', 'Director Provincial ou Municipal', [
      ['Apoia os serviços', 'Trata dados'],
      ['Responde por um tema', 'Visita escolas'],
      ['Coordena equipas', 'Orienta colegas'],
      ['Dirige serviços', 'Fala com as escolas e o Estado'],
    ]),
    postings: 0,
    salary: SALARY.specialist,
    sectors: ['Ministério da Educação', 'Gabinetes provinciais e municipais'],
  }),
  guide({
    slug: 'director-escolar',
    description:
      'Dirige uma escola: pessoas, alunos, dinheiro e resultados. Chega-se aqui depois de anos a ensinar. Os colégios privados anunciam funções como directora pedagógica.',
    dayToDay: [
      'Organizar turmas e horários',
      'Acompanhar os professores',
      'Gerir o orçamento',
      'Falar com as famílias',
      'Prestar contas às autoridades',
    ],
    workContext: OFFICE,
    workStyles: ['Liderança', 'Organização', 'Justiça', 'Comunicação', 'Decisão'],
    skills: [
      skill('gestao-escolar', 'Gestão escolar'),
      skill('gestao-pessoas', 'Gestão de pessoas'),
      skill('gestao-orcamento', 'Gestão do orçamento'),
    ],
    pathways: [
      universityRoute('Costuma exigir experiência como professor.', [
        degree('Ciências da Educação', 'Ou um curso de ensino.'),
        firstJob(
          'Anos de ensino e de coordenação',
          'Subdirector ou coordenador costumam ser os passos anteriores.',
        ),
      ]),
    ],
    stages: ladder('Director Escolar', 'Director de Vários Colégios', [
      ['Coordena uma classe', 'Apoia a direcção'],
      ['É subdirector', 'Organiza a escola'],
      ['Dirige a escola', 'Responde pelos resultados'],
      ['Dirige um grupo de escolas', 'Decide o rumo'],
    ]),
    postings: 2,
    salary: SALARY.specialist,
    sectors: SCHOOLS,
  }),
  guide({
    slug: 'docente-do-ensino-superior',
    description:
      'Ensina nas universidades e faz investigação. A carreira pública começa como assistente estagiário e sobe com o mestrado, o doutoramento e as publicações.',
    dayToDay: [
      'Dar aulas e seminários',
      'Orientar trabalhos de fim de curso',
      'Investigar e publicar',
      'Avaliar estudantes',
      'Participar na vida da universidade',
    ],
    workContext: OFFICE,
    workStyles: ['Curiosidade', 'Rigor', 'Comunicação', 'Autonomia', 'Persistência'],
    skills: [
      skill('investigacao', 'Investigação científica'),
      skill('escrita-academica', 'Escrita académica'),
      TEACHING,
    ],
    pathways: [
      universityRoute('Precisas de uma boa licenciatura e, depois, de mestrado e doutoramento.', [
        degree('na área que queres ensinar', 'Uma boa média ajuda na entrada como assistente.'),
        firstJob('Mestrado e doutoramento', 'Costumam ser pedidos para subir na carreira.'),
      ]),
    ],
    stages: ladder('Docente', 'Professor Catedrático', [
      ['É assistente estagiário', 'Apoia as aulas'],
      ['Dá cadeiras', 'Faz o mestrado'],
      ['Faz investigação', 'Orienta trabalhos'],
      ['Lidera cursos ou investigação', 'Forma novos docentes'],
    ]),
    postings: 1,
    salary: SALARY.lecturer,
    sectors: ['Universidades públicas', 'Universidades privadas', 'Institutos superiores'],
  }),
  guide({
    slug: 'formador-profissional',
    description:
      'Ensina adultos e jovens uma profissão ou uma competência. Teve 30 anúncios nos últimos 12 meses, em áreas como inglês, soldadura, HST e informática, muitos pedidos por empresas de formação.',
    dayToDay: [
      'Preparar o curso',
      'Dar sessões práticas',
      'Avaliar os formandos',
      'Actualizar materiais',
      'Falar com as empresas clientes',
    ],
    workContext: TRAINING,
    workStyles: ['Comunicação', 'Sentido prático', 'Paciência', 'Organização', 'Energia'],
    skills: [
      skill('especialidade-tecnica', 'Domínio da especialidade'),
      skill('formacao-adultos', 'Formação de adultos'),
      TEACHING,
      DIGITAL,
    ],
    pathways: [
      {
        id: 'experiencia',
        name: 'Experiência na profissão',
        summary: 'O caminho mais comum: primeiro dominar a profissão, depois ensiná-la.',
        steps: [
          firstJob('Anos de experiência na tua área', 'Os anúncios pedem quem domine o assunto.'),
          course(
            'Curso de formação de formadores',
            'Num centro certificado pelo INEFOP. Confirma com ele o que é exigido.',
            1,
            3,
          ),
        ],
        totalCost: null,
      },
    ],
    stages: ladder('Formador', 'Coordenador de Formação', [
      ['Apoia sessões', 'Prepara materiais'],
      ['Dá cursos sozinho', 'Avalia formandos'],
      ['Desenha cursos', 'Orienta colegas'],
      ['Coordena a formação', 'Fala com as empresas'],
    ]),
    postings: 30,
    salary: SALARY.trainer,
    sectors: ['Empresas de formação', 'Centros do INEFOP', 'Empresas'],
  }),
  guide({
    slug: 'tecnico-de-emprego-e-formacao',
    description:
      'Liga pessoas a empregos e a cursos, sobretudo nos centros do INEFOP. Quase não tem anúncios: é uma função do Estado, com concurso.',
    dayToDay: [
      'Atender quem procura emprego',
      'Orientar para cursos',
      'Falar com empresas',
      'Registar vagas e candidatos',
      'Preparar relatórios',
    ],
    workContext: OFFICE,
    workStyles: ['Escuta', 'Organização', 'Comunicação', 'Paciência', 'Sentido social'],
    skills: [
      skill('orientacao-profissional', 'Orientação profissional'),
      skill('mercado-trabalho', 'Conhecimento do mercado de trabalho'),
      skill('excel', 'Excel e relatórios'),
    ],
    pathways: [
      universityRoute('A entrada é por concurso público.', [
        degree('Ciências da Educação', 'Ou Psicologia, Sociologia ou Gestão de Recursos Humanos.'),
        COMPETITION_STEP,
      ]),
    ],
    stages: ladder('Técnico de Emprego', 'Director de Centro', [
      ['Atende candidatos', 'Trata registos'],
      ['Responde por programas', 'Fala com empresas'],
      ['Coordena equipas', 'Orienta colegas'],
      ['Dirige um centro', 'Presta contas'],
    ]),
    postings: 1,
    salary: SALARY.trainer,
    sectors: ['INEFOP', 'Empresas de recrutamento', 'Organizações sociais'],
  }),
  guide({
    slug: 'professor-de-educacao-fisica',
    description:
      'Ensina movimento, desporto e hábitos de saúde na escola. Há poucos anúncios privados, por isso a entrada é sobretudo pelo concurso público.',
    dayToDay: TEACHER_DAY('Educação Física'),
    workContext: SPORT,
    workStyles: ['Energia', 'Liderança', 'Paciência', 'Disciplina', 'Trabalhar com crianças'],
    skills: [
      skill('educacao-fisica', 'Educação física'),
      skill('modalidades', 'Várias modalidades'),
      skill('primeiros-socorros', 'Primeiros socorros', 'opcional'),
      TEACHING,
    ],
    pathways: SPORT_ROUTE('É o caminho normal.', COMPETITION_STEP),
    stages: ladder('Professor de Educação Física', 'Coordenador de Desporto Escolar', [
      ['Dá aulas com apoio', 'Aprende a planificar'],
      ['Dá aulas sozinho', 'Organiza jogos'],
      ['Treina equipas da escola', 'Apoia colegas'],
      ['Coordena o desporto escolar', 'Orienta os mais novos'],
    ]),
    postings: 1,
    salary: SALARY.teacher,
    sectors: SCHOOLS,
    extra: COMPETITION,
  }),
  guide({
    slug: 'treinador-desportivo',
    description:
      'Prepara atletas e equipas para competir. Não encontrei anúncios: nos clubes entra-se quase sempre pelo próprio desporto, como antigo atleta ou treinador de formação. Clubes como o Petro têm escolas de jovens.',
    dayToDay: [
      'Planear os treinos',
      'Ensinar técnica e táctica',
      'Acompanhar os atletas',
      'Preparar os jogos',
      'Analisar os resultados',
    ],
    workContext: SPORT,
    workStyles: ['Liderança', 'Disciplina', 'Motivar pessoas', 'Observação', 'Decisão'],
    skills: [
      skill('treino-desportivo', 'Planeamento do treino'),
      skill('tactica', 'Técnica e táctica'),
      skill('gestao-grupos', 'Gestão de grupos'),
    ],
    pathways: SPORT_ROUTE(
      'A licenciatura ajuda, mas o caminho passa pela prática.',
      certification(
        'Cursos de treinador da federação',
        'Cada modalidade tem os seus níveis. Confirma com a federação.',
      ),
    ),
    stages: ladder('Treinador', 'Treinador Principal', [
      ['Treina escalões jovens', 'Ajuda o treinador'],
      ['Treina uma equipa', 'Planeia a época'],
      ['Treina equipas de competição', 'Orienta adjuntos'],
      ['Dirige a equipa principal', 'Responde pelos resultados'],
    ]),
    postings: 0,
    salary: SALARY.coach,
    sectors: ['Clubes', 'Escolas de desporto', 'Federações'],
  }),
  guide({
    slug: 'preparador-fisico',
    description:
      'Prepara o corpo dos atletas para render mais e lesionar-se menos. Não encontrei anúncios próprios: trabalha em clubes e ginásios, muitas vezes ao lado do treinador.',
    dayToDay: [
      'Avaliar os atletas',
      'Planear a força e a resistência',
      'Acompanhar os treinos',
      'Ajudar no regresso de lesões',
      'Registar a evolução',
    ],
    workContext: SPORT,
    workStyles: ['Rigor', 'Disciplina', 'Observação', 'Motivar pessoas', 'Trabalhar em equipa'],
    skills: [
      skill('fisiologia-exercicio', 'Fisiologia do exercício'),
      skill('treino-forca', 'Treino de força'),
      skill('avaliacao-fisica', 'Avaliação física'),
    ],
    pathways: SPORT_ROUTE(
      'É o caminho normal.',
      firstJob('Trabalho num clube ou ginásio', 'Começa-se em escalões jovens ou como instrutor.'),
    ),
    stages: ladder('Preparador Físico', 'Coordenador de Preparação Física', [
      ['Apoia os treinos', 'Faz medições'],
      ['Prepara um grupo', 'Planeia ciclos'],
      ['Prepara equipas de competição', 'Orienta colegas'],
      ['Coordena a preparação física', 'Fala com a equipa médica'],
    ]),
    postings: 0,
    salary: SALARY.fitness,
    sectors: ['Clubes', 'Ginásios', 'Federações'],
  }),
  guide({
    slug: 'gestor-desportivo',
    description:
      'Organiza clubes, competições e projectos de desporto: pessoas, dinheiro, patrocínios e eventos. É uma profissão pequena, e apareceu um anúncio com este nome nos últimos 12 meses.',
    dayToDay: [
      'Organizar competições',
      'Gerir o orçamento',
      'Procurar patrocínios',
      'Coordenar equipas',
      'Tratar da inscrição de atletas',
    ],
    workContext: SPORT,
    workStyles: ['Organização', 'Liderança', 'Comunicação', 'Negociação', 'Gosto pelo desporto'],
    skills: [
      skill('gestao-eventos', 'Gestão de eventos'),
      skill('gestao-orcamento', 'Gestão do orçamento'),
      skill('patrocinios', 'Patrocínios e marketing'),
    ],
    pathways: SPORT_ROUTE(
      'Gestão com experiência desportiva é outro caminho.',
      firstJob('Trabalho num clube ou federação', 'Voluntariado em eventos conta como experiência.'),
    ),
    stages: ladder('Gestor Desportivo', 'Director Desportivo', [
      ['Apoia eventos', 'Trata inscrições'],
      ['Organiza competições', 'Gere um orçamento'],
      ['Coordena uma secção', 'Fala com os patrocinadores'],
      ['Dirige a área desportiva', 'Decide contratações'],
    ]),
    postings: 1,
    salary: SALARY.coach,
    sectors: ['Clubes', 'Federações', 'Estado', 'Empresas de eventos'],
  }),
]

const SPORT_CAREERS = ['treinador-desportivo', 'preparador-fisico', 'gestor-desportivo']

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
  sector: 'educacao',
  province: 'Luanda',
  place: 'Luanda',
  summary,
  careers,
  careersSourced,
  areas: ['ensino_secundario'],
  programs: [],
  partners: [],
  sources: [source],
})

const jobartis = (label: string, path: string): SourceLink => ({
  label: `Jobartis: ${label}`,
  url: `https://www.jobartis.com/emprego-${path}`,
})

export const EDUCATION_COMPANIES: Company[] = [
  employer(
    'petro-de-luanda',
    'Atlético Petróleos de Luanda',
    'Clube de Luanda, com futebol e basquetebol. Em 2023 lançou as Academias Petro, de educação com desporto em futebol, basquetebol e andebol.',
    SPORT_CAREERS,
    false,
    {
      label: 'Ver Angola: Academias Petro (2023)',
      url: 'https://www.verangola.net/va/pt/102023/Desporto/37648/%E2%80%9CAcademias-Petro%E2%80%9D-Lan%C3%A7ada-academia-de-futebol-do-Petro-de-Luanda.htm',
    },
  ),
  employer(
    'primeiro-de-agosto',
    'Clube Desportivo 1.º de Agosto',
    'Clube de Luanda, com futebol e basquetebol. Em 2022 teve uma greve por salários em atraso.',
    SPORT_CAREERS,
    false,
    {
      label: 'A Bola: basquetebol do 1.º de Agosto (2026)',
      url: 'https://www.abola.pt/noticias/miguel-lutonda-assume-basquetebol-do-1o-de-agosto-2026090817170443626',
    },
  ),
  employer(
    'organizacoes-kiazop',
    'Organizações Kiazop',
    'Teve vários anúncios de formadores, de professor de inglês e de professor de informática nos últimos 12 meses.',
    ['formador-profissional', 'professor-de-linguas-estrangeiras', 'professor-de-informatica'],
    true,
    jobartis('anúncios das Organizações Kiazop', 'organizacoes-kiazop-tecnico-de-construcao-civil'),
  ),
  employer(
    'pro-futuro-academy',
    'Pro Futuro Academy',
    'Anunciou uma vaga de formador.',
    ['formador-profissional'],
    true,
    jobartis('formador', 'pro-futuro-academy-formador'),
  ),
  employer(
    'light-for-autism',
    'Light for Autism',
    'Anunciou uma vaga de cuidadora infantil. O nome indica trabalho com crianças com autismo.',
    ['educador-de-infancia', 'professor-de-educacao-especial'],
    false,
    jobartis('cuidadora infantil', 'light-for-autism-cuidadora-infantil'),
  ),
]
