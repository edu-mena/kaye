import type { Career, Company, PathwayStep, SourceLink } from '../types'
import { career } from './publicGuides'
import { context, employer } from './sciencesGuides'
import {
  certification,
  degree,
  firstJob,
  ladder,
  market as marketOf,
  selfTaughtRoute,
  skill,
  type TechSalary,
  universityRoute,
  wage,
} from './technologyGuides'

// The communication, languages and arts careers' full pages (ADR 0010), from public sources:
// - the demand: the job ads of the last 12 months, 78 in the area;
// - the salaries: the WageIndicator 2026 survey, in the demand note;
// - the rules: Lei n.º 5/17 (the journalist's statute) and Decreto Executivo n.º 584/17 (the Instituto Superior de
//   Artes). Actors, musicians and visual artists work mostly on their own, as their guides explain.

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

const WIDE_START = 'entre 271 001 e 1 317 401'
const WIDE_AFTER = 'entre 407 570 e 2 082 004'
const MARKETING_START = 'entre 249 209 e 831 420'
const MARKETING_AFTER = 'entre 385 535 e 1 337 979'

const wide = (page: string, occupation: string) => wage(page, occupation, WIDE_START, WIDE_AFTER)

const SALARY = {
  journalist: wide('jornalistas', 'os jornalistas'),
  video: wage(
    'tecnicos-de-radiodifusao-e-audio-visuais',
    'os técnicos de radiodifusão e audiovisuais',
    'entre 232 680 e 671 601',
    'entre 324 168 e 1 038 410',
  ),
  relations: wage(
    'profissionais-em-relacoes-publicas',
    'os profissionais de relações públicas',
    MARKETING_START,
    MARKETING_AFTER,
  ),
  social: wage(
    'profissionais-em-marketing-e-publicidade',
    'os profissionais de marketing e publicidade',
    MARKETING_START,
    MARKETING_AFTER,
  ),
  translator: wide('tradutores-interpretes-e-outros-linguistas', 'os tradutores, intérpretes e linguistas'),
  writer: wide('autores-e-escritores-relacionados', 'os autores e escritores, a função mais próxima'),
  director: wide(
    'directores-e-produtores-de-filme-teatro-e-outros',
    'os directores e produtores de cinema e teatro',
  ),
  actor: wide('actores', 'os actores'),
  musician: wide('musicos-cantores-e-compositores', 'os músicos, cantores e compositores'),
  artist: wide('artistas-visuais', 'os artistas visuais'),
  fashion: wage(
    'decoradores-e-designers',
    'os decoradores e designers, a função mais próxima',
    'entre 236 457 e 651 392',
    'entre 325 145 e 1 016 698',
  ),
  culture: wide(
    'artistas-criativos-e-de-representacao-e-todos-os',
    'os artistas criativos e de espectáculo, a função mais próxima',
  ),
}

const NEWSROOM = context(
  'Redacção, estúdio e rua',
  'Por turnos, com prazos curtos',
  'Jornalistas, editores e técnicos',
  'Frequentes',
)
const OFFICE = context(
  'Escritório ou agência, com eventos',
  'Normal, com picos em campanhas',
  'Direcção, marketing e fornecedores',
  'Algumas',
)
const ALONE = context(
  'Casa, escritório ou agência',
  'Por trabalho, com prazos',
  'Muitas vezes sozinho',
  'Raras',
)
const STAGE = context(
  'Palcos, estúdios e salas de ensaio',
  'Noites e fins-de-semana, por projecto',
  'Outros artistas e técnicos',
  'Algumas, para espectáculos',
)
const STUDIO = context(
  'Atelier ou estúdio',
  'Flexível, por encomenda',
  'Muitas vezes sozinho',
  'Algumas, para exposições e feiras',
)

const CV: Career['cvGuide'] = {
  template: 'classico',
  include: [
    'Um link para os teus trabalhos: textos, vídeos, contas ou obras',
    'A formação, com a instituição e o ano',
    'Projectos concretos, com o teu papel e o resultado',
    'As línguas e os programas que dominas',
  ],
  avoid: [
    'Trabalhos de outras pessoas como se fossem teus',
    'Listas de programas que não usas',
    'Fotografia e dados pessoais que a vaga não pede',
  ],
}

const WRITING = skill('escrita', 'Escrita clara')
const INTERVIEW = skill('entrevista', 'Entrevista e recolha de informação')
const EDITING = skill('montagem-video', 'Montagem de vídeo')
const PLANNING = skill('plano-comunicacao', 'Planos de comunicação')
const EVENTS = skill('organizacao-eventos', 'Organização de eventos')
const ENGLISH = skill('ingles', 'Inglês', 'opcional')
const PORTUGUESE = skill('norma-portuguesa', 'Domínio do português escrito')
const SELF_PROMOTION = skill('divulgacao-propria', 'Divulgar o próprio trabalho')
const SELF_EMPLOYED = skill('gestao-carreira', 'Gestão de contratos e direitos de autor', 'opcional')

const COMMUNICATION = degree('Comunicação Social', 'Ou Ciências da Comunicação ou Jornalismo.')
const LANGUAGES = degree(
  'Língua e Literatura',
  'Inglesa, francesa ou portuguesa, conforme a língua com que queres trabalhar.',
)
const ARTS_COURSE = (name: string): PathwayStep =>
  degree(name, 'No Instituto Superior de Artes ou na Faculdade de Artes da Universidade de Luanda.')
const CEARTE_STEP: PathwayStep = {
  kind: 'academico',
  level: 'medio_tecnico',
  title: 'Formação no CEARTE',
  need: 'recomendado',
  description:
    'O Complexo das Escolas de Artes, no Camama, em Luanda, tem teatro, artes visuais, música, cinema e dança.',
  months: null,
}
const LANGUAGE_EXAM = certification(
  'Exame internacional de língua',
  'Prova o teu nível. A Aliança Francesa de Luanda teve 220 candidatos aos exames DELF e DALF em 2025. Não confirmámos em Angola centros de IELTS, TOEFL ou HSK: confirma nos sites oficiais.',
)
const GOOGLE_META = certification(
  'Certificações do Google Ads e da Meta',
  'Fazem-se online e mostram que sabes gerir anúncios e medir resultados.',
)

const artistStages = (title: string, lead: string): Career['stages'] =>
  ladder(title, lead, [
    ['Faz os primeiros trabalhos', 'Aprende com artistas experientes'],
    ['Vive de projectos regulares', 'Constrói o seu nome'],
    ['É convidado para projectos maiores', 'Pode ensinar'],
    ['Lidera os seus projectos', 'Forma uma equipa ou um grupo'],
  ])

const officeStages = (title: string, lead: string): Career['stages'] =>
  ladder(title, lead, [
    ['Apoia a equipa', 'Aprende as ferramentas'],
    ['Trata de um cliente ou área', 'Propõe ideias'],
    ['Lidera campanhas', 'Orienta os mais novos'],
    ['Dirige a equipa', 'Responde pelos resultados'],
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
  const base = marketOf(postings, salary, sectors, { name: 'comunicação, línguas e artes', total: 78 })
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

export const COMMUNICATION_GUIDES: Guide[] = [
  guide({
    slug: 'jornalista',
    description:
      'Investiga, escreve e conta as notícias na televisão, na rádio, nos jornais e na internet. A lei pede licenciatura na área e um estágio obrigatório, e todo o jornalista tem de ter carteira profissional.',
    dayToDay: [
      'Procurar e confirmar notícias',
      'Falar com fontes',
      'Escrever ou gravar peças',
      'Fazer directos',
      'Cumprir o fecho da edição',
    ],
    workContext: NEWSROOM,
    workStyles: ['Curiosidade', 'Rigor com os factos', 'Coragem', 'Rapidez', 'Independência'],
    skills: [
      WRITING,
      INTERVIEW,
      skill('etica-jornalistica', 'Ética jornalística'),
      skill('voz-camara', 'Voz e presença em câmara', 'opcional'),
      EDITING,
    ],
    pathways: [
      universityRoute(
        'A Lei n.º 5/17 pede licenciatura em Jornalismo, Ciências da Comunicação ou Comunicação Social.',
        [
          COMMUNICATION,
          {
            ...firstJob(
              'Estágio e carteira de jornalista estagiário',
              'O estágio é obrigatório e dura de 6 a 12 meses. A carteira é emitida pela Comissão da Carteira e Ética e pede-se até 30 dias depois da admissão.',
            ),
            need: 'essencial',
            months: { min: 6, max: 12 },
          },
        ],
      ),
      {
        ...universityRoute(
          'Quem é licenciado noutra área pode entrar com pelo menos um semestre de formação em técnicas de jornalismo, numa instituição credenciada.',
          [
            {
              ...certification(
                'Formação especializada em jornalismo',
                'No mínimo um semestre. Confirma se o CEFOJOR ou outra instituição dá esta formação credenciada.',
              ),
              need: 'essencial',
            },
            {
              ...firstJob(
                'Estágio e carteira de jornalista estagiário',
                'De 6 a 12 meses, tal como na via normal.',
              ),
              need: 'essencial',
              months: { min: 6, max: 12 },
            },
          ],
        ),
        id: 'outra-area',
        name: 'Licenciatura noutra área',
      },
    ],
    stages: ladder('Jornalista', 'Editor ou Director de Informação', [
      ['Faz o estágio', 'Cobre temas simples'],
      ['Segue uma área', 'Trabalha sozinho'],
      ['Faz grandes reportagens', 'Orienta estagiários'],
      ['Coordena a redacção', 'Decide o que se publica'],
    ]),
    postings: 0,
    salary: SALARY.journalist,
    sectors: ['Televisão', 'Rádio', 'Jornais e sites', 'Agências de notícias'],
    extra:
      ' Os órgãos de comunicação raramente publicam estas vagas nos sites de emprego. A lei proíbe acumular o jornalismo com publicidade, assessoria de imprensa e cargos políticos ou no Estado.',
  }),
  guide({
    slug: 'editor-de-video',
    description:
      'Filma, monta e finaliza vídeos para a televisão, a publicidade e as redes sociais. Conta mais o portefólio do que o diploma: nos últimos 12 meses, uma escola e outras empresas anunciaram vagas.',
    dayToDay: [
      'Filmar ou receber imagens',
      'Montar a história',
      'Tratar som e cor',
      'Pôr legendas e gráficos',
      'Adaptar para cada rede',
    ],
    workContext: context(
      'Estúdio, agência ou rua',
      'Por projecto, com prazos',
      'Realizadores, jornalistas e designers',
      'Algumas, para gravações',
    ),
    workStyles: [
      'Criatividade',
      'Paciência',
      'Atenção ao pormenor',
      'Sentido de ritmo',
      'Cumprimento de prazos',
    ],
    skills: [
      EDITING,
      skill('premiere-davinci', 'Programas como Premiere ou DaVinci Resolve'),
      skill('camara-luz', 'Câmara e luz'),
      skill('som', 'Tratamento de som'),
      skill('motion-graphics', 'Grafismo animado', 'opcional'),
    ],
    pathways: [
      selfTaughtRoute(
        'Muitos aprendem com cursos online e projectos próprios. O portefólio é o que abre a porta.',
        [
          firstJob(
            'Portefólio com vídeos reais',
            'Faz vídeos para igrejas, escolas ou pequenos negócios e publica-os.',
          ),
        ],
      ),
      universityRoute('O curso dá base de cinema, televisão e narrativa.', [
        degree('Cinema e Televisão', 'Ou Comunicação Social e Imagem.'),
        firstJob('Assistente numa produtora ou agência', 'As agências e os canais são a entrada mais comum.'),
      ]),
    ],
    stages: officeStages('Editor de Vídeo', 'Director de Pós-Produção'),
    postings: 3,
    salary: SALARY.video,
    sectors: ['Agências de publicidade', 'Televisão', 'Produtoras', 'Empresas com equipa própria'],
  }),
  guide({
    slug: 'tecnico-de-relacoes-publicas',
    description:
      'Cuida da imagem de uma organização: prepara comunicados, organiza eventos e responde aos jornalistas. Trabalha em empresas, agências e organismos públicos, e nos últimos 12 meses houve poucos anúncios com este nome.',
    dayToDay: [
      'Escrever comunicados',
      'Falar com jornalistas',
      'Organizar eventos',
      'Acompanhar o que se diz da organização',
      'Preparar relatórios',
    ],
    workContext: OFFICE,
    workStyles: ['Simpatia', 'Organização', 'Diplomacia', 'Calma em crises', 'Clareza a escrever'],
    skills: [WRITING, EVENTS, PLANNING, skill('relacao-imprensa', 'Relação com a imprensa'), ENGLISH],
    pathways: [
      universityRoute('Comunicação Social é a base mais comum.', [
        COMMUNICATION,
        firstJob(
          'Assistente de comunicação',
          'Agências e departamentos de comunicação são a entrada. O Ministério da Energia e Águas procurou recém-licenciados em Comunicação e Imagem.',
        ),
      ]),
    ],
    stages: officeStages('Técnico de Relações Públicas', 'Director de Comunicação'),
    postings: 2,
    salary: SALARY.relations,
    sectors: ['Agências de comunicação', 'Banca', 'Telecomunicações', 'Organismos públicos'],
  }),
  guide({
    slug: 'gestor-de-redes-sociais',
    description:
      'Planeia e publica o que uma marca diz nas redes sociais e responde a quem lá escreve. Foi a profissão desta área com mais anúncios nos últimos 12 meses, e pode começar-se sem licenciatura, com bons exemplos de trabalho.',
    dayToDay: [
      'Planear as publicações',
      'Criar textos, imagens e vídeos',
      'Responder às mensagens',
      'Gerir anúncios pagos',
      'Medir os resultados',
    ],
    workContext: OFFICE,
    workStyles: ['Criatividade', 'Rapidez', 'Organização', 'Curiosidade', 'Bom senso'],
    skills: [
      skill('conteudo-redes', 'Criação de conteúdos'),
      skill('canva-design', 'Design simples, como o Canva'),
      skill('anuncios-pagos', 'Anúncios pagos'),
      skill('analise-metricas', 'Análise de resultados'),
      WRITING,
    ],
    pathways: [
      selfTaughtRoute(
        'É das poucas áreas com entrada sem licenciatura: gere contas reais e mostra os resultados.',
        [
          GOOGLE_META,
          firstJob(
            'Contas de pequenos negócios',
            'Começa com um negócio do bairro ou uma associação e regista o que mudou.',
          ),
        ],
      ),
      universityRoute('Comunicação Social ou Marketing dão base mais sólida.', [
        COMMUNICATION,
        GOOGLE_META,
        firstJob('Assistente numa agência', 'As agências de comunicação são boa escola.'),
      ]),
    ],
    stages: officeStages('Gestor de Redes Sociais', 'Director de Marketing Digital'),
    postings: 11,
    salary: SALARY.social,
    sectors: ['Agências de publicidade', 'Comércio', 'Educação', 'Empresas de serviços'],
  }),
  guide({
    slug: 'assessor-de-comunicacao',
    description:
      'Prepara a comunicação de um ministério, de uma empresa ou de um dirigente: discursos, entrevistas e campanhas. Costuma ser função para quem já tem experiência em jornalismo ou comunicação. Atenção: a lei não deixa acumular assessoria de imprensa com jornalismo.',
    dayToDay: [
      'Preparar discursos',
      'Marcar entrevistas',
      'Treinar dirigentes para falar',
      'Planear campanhas',
      'Gerir crises',
    ],
    workContext: OFFICE,
    workStyles: ['Discrição', 'Calma em crises', 'Diplomacia', 'Clareza a escrever', 'Sentido político'],
    skills: [
      PLANNING,
      WRITING,
      skill('gestao-crise', 'Gestão de crises'),
      skill('relacao-imprensa', 'Relação com a imprensa'),
      ENGLISH,
    ],
    pathways: [
      universityRoute('Comunicação Social é a base. Quase sempre pede experiência anterior.', [
        COMMUNICATION,
        firstJob(
          'Experiência em redacção ou agência',
          'Alguns anos em jornalismo ou comunicação preparam para o cargo.',
        ),
      ]),
    ],
    stages: officeStages('Assessor de Comunicação', 'Director de Gabinete de Comunicação'),
    postings: 1,
    salary: SALARY.relations,
    sectors: ['Ministérios', 'Empresas públicas', 'Organizações internacionais'],
  }),
  guide({
    slug: 'tradutor',
    description:
      'Passa textos de uma língua para outra: contratos, relatórios técnicos e documentos oficiais. A maioria dos anúncios dos últimos 12 meses pedia mandarim e português. Muitos tradutores trabalham por conta própria, por isso nem sempre há um empregador fixo.',
    dayToDay: [
      'Ler o documento',
      'Procurar os termos técnicos',
      'Traduzir',
      'Rever o texto',
      'Entregar no prazo',
    ],
    workContext: ALONE,
    workStyles: ['Rigor', 'Atenção ao pormenor', 'Discrição', 'Autonomia', 'Curiosidade'],
    skills: [
      skill('traducao-tecnica', 'Tradução técnica'),
      skill('mandarim', 'Mandarim', 'opcional'),
      skill('ingles-frances', 'Inglês ou francês avançado'),
      skill('ferramentas-traducao', 'Ferramentas de tradução'),
      PORTUGUESE,
    ],
    pathways: [
      universityRoute(
        'A licenciatura em línguas dá a base. Não encontrámos em Angola um registo oficial de tradutores: quem recebe o documento diz que forma aceita.',
        [
          LANGUAGES,
          LANGUAGE_EXAM,
          firstJob(
            'Primeiros trabalhos',
            'Empresas com equipas estrangeiras são uma boa entrada. O Instituto Confúcio da Universidade Agostinho Neto ensina mandarim.',
          ),
        ],
      ),
    ],
    stages: ladder('Tradutor', 'Coordenador de Tradução', [
      ['Traduz textos simples', 'Trabalha com revisão'],
      ['Traduz sozinho', 'Escolhe uma área técnica'],
      ['Leva documentos difíceis', 'Revê colegas'],
      ['Coordena projectos', 'Gere clientes'],
    ]),
    postings: 9,
    salary: SALARY.translator,
    sectors: [
      'Construção e comércio com empresas chinesas',
      'Petróleo e gás',
      'Embaixadas',
      'Prática por conta própria',
    ],
  }),
  guide({
    slug: 'interprete',
    description:
      'Traduz de viva voz, ao mesmo tempo ou logo a seguir, em reuniões, conferências e tribunais. É sobretudo trabalho por conta própria e por evento. Em 2024, a Lusa noticiou a falta de intérpretes de língua gestual em Angola.',
    dayToDay: [
      'Estudar o tema da reunião',
      'Preparar o vocabulário',
      'Interpretar em directo',
      'Trabalhar em cabine ou ao lado da pessoa',
      'Manter sigilo',
    ],
    workContext: context(
      'Salas de reunião, conferências e tribunais',
      'Por evento',
      'Normalmente em par com outro intérprete',
      'Frequentes',
    ),
    workStyles: ['Concentração', 'Calma', 'Discrição', 'Rapidez', 'Boa memória'],
    skills: [
      skill('interpretacao-simultanea', 'Interpretação simultânea'),
      skill('ingles-frances', 'Inglês ou francês avançado'),
      skill('mandarim', 'Mandarim', 'opcional'),
      skill('lingua-gestual', 'Língua gestual angolana', 'opcional'),
      PORTUGUESE,
    ],
    pathways: [
      universityRoute(
        'A licenciatura em línguas dá a base. A prática de interpretação ganha-se em eventos e com colegas.',
        [
          LANGUAGES,
          LANGUAGE_EXAM,
          firstJob('Eventos e reuniões de empresas', 'Começa como tradutor e passa para a interpretação.'),
        ],
      ),
    ],
    stages: ladder('Intérprete', 'Coordenador de Intérpretes', [
      ['Apoia reuniões simples', 'Prepara vocabulário'],
      ['Interpreta em reuniões', 'Ganha prática em cabine'],
      ['Faz conferências grandes', 'Orienta colegas'],
      ['Coordena equipas', 'Trata de grandes eventos'],
    ]),
    postings: 1,
    salary: SALARY.translator,
    sectors: [
      'Empresas estrangeiras',
      'Organizações internacionais',
      'Tribunais',
      'Prática por conta própria',
    ],
  }),
  guide({
    slug: 'revisor-de-textos',
    description:
      'Corrige a ortografia, a gramática e o estilo de livros, jornais e documentos antes de serem publicados. Trabalha em jornais, editoras e agências, ou por conta própria.',
    dayToDay: [
      'Ler o texto com atenção',
      'Corrigir erros',
      'Uniformizar o estilo',
      'Tirar dúvidas com o autor',
      'Rever as provas finais',
    ],
    workContext: ALONE,
    workStyles: ['Atenção ao pormenor', 'Paciência', 'Rigor', 'Discrição', 'Gosto pela leitura'],
    skills: [
      PORTUGUESE,
      skill('acordo-ortografico', 'Regras ortográficas e gramática'),
      skill('revisao-digital', 'Revisão em computador'),
      WRITING,
      ENGLISH,
    ],
    pathways: [
      universityRoute('Língua Portuguesa ou Comunicação são as bases mais próximas.', [
        degree('Língua Portuguesa e Comunicação', 'Ou Língua e Literatura Portuguesa.'),
        firstJob(
          'Revisão num jornal ou editora',
          'Jornais, editoras e agências contratam ou pagam por trabalho.',
        ),
      ]),
    ],
    stages: ladder('Revisor', 'Editor de Texto', [
      ['Revê textos curtos', 'Trabalha com orientação'],
      ['Revê jornais ou livros', 'Trabalha sozinho'],
      ['Leva obras grandes', 'Define regras de estilo'],
      ['Coordena a revisão', 'Edita obras'],
    ]),
    postings: 1,
    salary: SALARY.writer,
    sectors: ['Jornais', 'Editoras', 'Agências', 'Prática por conta própria'],
  }),
  guide({
    slug: 'linguista',
    description:
      'Estuda as línguas, incluindo as línguas nacionais de Angola, e prepara gramáticas, dicionários e materiais de ensino. Trabalha sobretudo em universidades e na investigação, e não houve anúncios com este nome.',
    dayToDay: [
      'Recolher falas e textos',
      'Analisar a gramática',
      'Preparar dicionários',
      'Criar materiais de ensino',
      'Publicar estudos',
    ],
    workContext: context(
      'Universidade e trabalho de campo',
      'Normal',
      'Investigadores, professores e falantes',
      'Algumas, para as comunidades',
    ),
    workStyles: ['Curiosidade', 'Paciência', 'Rigor', 'Respeito pelas comunidades', 'Bom ouvido'],
    skills: [
      skill('analise-linguistica', 'Análise linguística'),
      skill('linguas-nacionais', 'Línguas nacionais'),
      skill('recolha-dados', 'Recolha de dados'),
      WRITING,
      ENGLISH,
    ],
    pathways: [
      universityRoute(
        'Línguas e Literaturas Africanas é a via mais directa. A investigação pede mestrado e doutoramento.',
        [
          degree(
            'Línguas e Literaturas Africanas',
            'Na Universidade Agostinho Neto ou num instituto de ciências da educação.',
          ),
          firstJob('Ensino ou projecto de investigação', 'Quase sempre se junta o ensino à investigação.'),
        ],
      ),
    ],
    stages: career(
      [
        'Estagiário de Investigação',
        'Assistente de Investigação',
        'Investigador Auxiliar',
        'Investigador Coordenador',
      ],
      [
        ['Apoia projectos', 'Prepara o mestrado'],
        ['Estuda uma língua', 'Publica com a equipa'],
        ['Lidera estudos', 'Orienta os mais novos'],
        ['Coordena projectos', 'Procura financiamento'],
      ],
    ),
    postings: 0,
    salary: SALARY.translator,
    sectors: ['Universidades', 'Ministério da Cultura', 'Institutos de investigação'],
  }),
  guide({
    slug: 'realizador',
    description:
      'Dirige a gravação de filmes, séries, programas e anúncios, da ideia à montagem. Angola ainda não tem uma indústria de cinema, por isso muitos filmes nascem de produtoras independentes, como a Geração 80, e o trabalho paga-se por projecto.',
    dayToDay: [
      'Trabalhar o guião',
      'Escolher actores e locais',
      'Dirigir as gravações',
      'Acompanhar a montagem',
      'Procurar financiamento',
    ],
    workContext: context(
      'Estúdios, locais de filmagem e salas de montagem',
      'Por projecto, com dias longos',
      'Actores, técnicos e produtores',
      'Frequentes',
    ),
    workStyles: ['Visão criativa', 'Liderança', 'Persistência', 'Comunicação', 'Decisão rápida'],
    skills: [
      skill('direccao-actores', 'Direcção de actores'),
      skill('linguagem-cinema', 'Linguagem de cinema'),
      skill('guiao', 'Guião'),
      EDITING,
      skill('producao-orcamento', 'Produção e orçamento'),
    ],
    pathways: [
      universityRoute('Cinema e Televisão é a via directa.', [
        degree('Cinema e Televisão', 'No Instituto Superior Politécnico Metropolitano.'),
        firstJob(
          'Assistente numa produtora ou canal',
          'Curtas-metragens próprias ajudam a mostrar o que sabes.',
        ),
      ]),
      selfTaughtRoute('O CEARTE tem cinema, e muitos começam com curtas-metragens e publicidade.', [
        CEARTE_STEP,
        firstJob('Curtas-metragens e publicidade', 'Festivais e concursos dão visibilidade.'),
      ]),
    ],
    stages: artistStages('Realizador', 'Realizador e Produtor'),
    postings: 0,
    salary: SALARY.director,
    sectors: ['Produtoras', 'Televisão', 'Publicidade'],
  }),
  guide({
    slug: 'actor',
    description:
      'Interpreta personagens no teatro, no cinema, na televisão e na publicidade. Trabalha quase sempre por conta própria e por projecto, sem patrão fixo, em grupos de teatro e com produtoras, e muitos juntam outro trabalho.',
    dayToDay: [
      'Ler e decorar textos',
      'Ensaiar',
      'Trabalhar a voz e o corpo',
      'Ir a audições',
      'Representar',
    ],
    workContext: STAGE,
    workStyles: ['Expressividade', 'Disciplina', 'Resiliência', 'Trabalho em equipa', 'Imaginação'],
    skills: [
      skill('interpretacao', 'Interpretação'),
      skill('voz-corpo', 'Voz e corpo'),
      SELF_PROMOTION,
      SELF_EMPLOYED,
      ENGLISH,
    ],
    pathways: [
      universityRoute('A licenciatura em Teatro dá formação completa.', [
        ARTS_COURSE('Teatro'),
        firstJob('Grupo de teatro', 'Junta-te a um grupo, como o Elinga, e faz audições.'),
      ]),
      selfTaughtRoute('Muitos começam em grupos de teatro. O CEARTE tem formação em teatro.', [
        CEARTE_STEP,
        firstJob('Grupo de teatro e publicidade', 'A experiência em palco é o teu currículo.'),
      ]),
    ],
    stages: artistStages('Actor', 'Actor Principal ou Encenador'),
    postings: 0,
    salary: SALARY.actor,
    sectors: ['Grupos de teatro', 'Televisão', 'Cinema', 'Publicidade'],
  }),
  guide({
    slug: 'musico',
    description:
      'Toca, canta ou compõe, em palco, em estúdio ou a dar aulas. A maior parte trabalha por conta própria, de concerto em concerto, e dar aulas é uma forma comum de ter rendimento regular.',
    dayToDay: ['Praticar', 'Ensaiar', 'Compor ou fazer arranjos', 'Actuar', 'Dar aulas ou gravar'],
    workContext: STAGE,
    workStyles: ['Disciplina', 'Criatividade', 'Bom ouvido', 'Persistência', 'Trabalho em equipa'],
    skills: [
      skill('instrumento-voz', 'Instrumento ou voz'),
      skill('teoria-musical', 'Teoria musical'),
      skill('gravacao', 'Gravação em casa ou estúdio', 'opcional'),
      SELF_PROMOTION,
      SELF_EMPLOYED,
    ],
    pathways: [
      universityRoute('A licenciatura em Música dá base sólida e abre o ensino.', [
        ARTS_COURSE('Música'),
        firstJob('Banda, orquestra ou ensino', 'O CEARTE indica orquestras e escolas como saídas.'),
      ]),
      selfTaughtRoute('Muitos músicos aprendem em bandas e com outros músicos.', [
        CEARTE_STEP,
        firstJob('Bandas e eventos', 'Grava e publica o que fazes.'),
      ]),
    ],
    stages: artistStages('Músico', 'Director Musical'),
    postings: 0,
    salary: SALARY.musician,
    sectors: ['Eventos', 'Bandas e orquestras', 'Escolas de música', 'Igrejas'],
  }),
  guide({
    slug: 'artista-plastico',
    description:
      'Cria pintura, escultura e outras obras para expor e vender. Trabalha sobretudo por conta própria, com galerias e colecionadores, e muitos juntam a arte à ilustração ou ao ensino.',
    dayToDay: [
      'Desenvolver ideias',
      'Criar as obras',
      'Fotografar o trabalho',
      'Falar com galerias',
      'Vender ou dar aulas',
    ],
    workContext: STUDIO,
    workStyles: ['Criatividade', 'Persistência', 'Autonomia', 'Observação', 'Sensibilidade'],
    skills: [
      skill('desenho-pintura', 'Desenho e pintura'),
      skill('materiais-tecnicas', 'Materiais e técnicas'),
      skill('portefolio-arte', 'Portefólio'),
      SELF_PROMOTION,
      SELF_EMPLOYED,
    ],
    pathways: [
      universityRoute('A licenciatura em Artes Visuais dá técnica e pensamento.', [
        ARTS_COURSE('Artes Visuais'),
        firstJob('Exposições colectivas', 'Participa em mostras e concursos.'),
      ]),
      selfTaughtRoute('O portefólio conta mais do que o diploma. O CEARTE tem artes visuais.', [
        CEARTE_STEP,
        firstJob('Primeiras exposições', 'Publica o teu trabalho e procura galerias.'),
      ]),
    ],
    stages: artistStages('Artista Plástico', 'Artista com Atelier Próprio'),
    postings: 0,
    salary: SALARY.artist,
    sectors: ['Galerias', 'Colecionadores', 'Ensino', 'Ilustração'],
  }),
  guide({
    slug: 'designer-de-moda',
    description:
      'Desenha roupa e acessórios e acompanha a sua produção, da colecção à loja. O sector faz-se sobretudo de marcas próprias, e os eventos Moda Luanda e Angola Fashion Week são as grandes montras. Vários estilistas angolanos estudaram fora.',
    dayToDay: [
      'Pesquisar tendências',
      'Desenhar a colecção',
      'Escolher tecidos',
      'Fazer moldes e provas',
      'Vender e mostrar as peças',
    ],
    workContext: STUDIO,
    workStyles: ['Criatividade', 'Atenção ao pormenor', 'Sentido de negócio', 'Persistência', 'Bom gosto'],
    skills: [
      skill('desenho-moda', 'Desenho de moda'),
      skill('modelagem-costura', 'Modelagem e costura'),
      skill('tecidos', 'Conhecimento de tecidos'),
      skill('gestao-marca', 'Gestão de uma marca'),
      SELF_PROMOTION,
    ],
    pathways: [
      universityRoute('A licenciatura em Design de Moda é a via directa.', [
        ARTS_COURSE('Design de Moda'),
        firstJob('Atelier ou marca própria', 'Começa num atelier ou com pequenas colecções.'),
      ]),
      selfTaughtRoute(
        'Muitos começam na costura. Há uma escola de moda na sede da marca Beatriz Franck, em Luanda: confirma os cursos.',
        [firstJob('Colecção própria', 'Faz peças para clientes e mostra-as em eventos.')],
      ),
    ],
    stages: artistStages('Designer de Moda', 'Director Criativo'),
    postings: 0,
    salary: SALARY.fashion,
    sectors: ['Marcas próprias', 'Ateliers', 'Retalho de moda'],
  }),
  guide({
    slug: 'gestor-cultural',
    description:
      'Organiza festivais, espectáculos e exposições e procura quem os financie. Trabalha em centros culturais, fundações e no Estado, muitas vezes por projecto. Os anúncios de coordenador de eventos que apareceram não são de cultura, por isso não entram na conta.',
    dayToDay: [
      'Planear a programação',
      'Procurar patrocínios',
      'Tratar de contratos com artistas',
      'Organizar o evento',
      'Prestar contas',
    ],
    workContext: OFFICE,
    workStyles: ['Organização', 'Gosto pelas artes', 'Capacidade de negociar', 'Criatividade', 'Liderança'],
    skills: [
      EVENTS,
      skill('financiamento-cultural', 'Financiamento e patrocínios'),
      skill('gestao-orcamento', 'Gestão de orçamentos'),
      PLANNING,
      ENGLISH,
    ],
    pathways: [
      universityRoute('Não há um curso único. Artes, Comunicação ou Gestão servem de base.', [
        ARTS_COURSE('Artes Visuais'),
        firstJob(
          'Assistente num centro cultural ou festival',
          'Voluntariado em eventos é uma boa porta de entrada.',
        ),
      ]),
    ],
    stages: officeStages('Gestor Cultural', 'Director de Centro Cultural'),
    postings: 1,
    salary: SALARY.culture,
    sectors: ['Centros culturais', 'Fundações', 'Ministério da Cultura', 'Produtoras de eventos'],
  }),
]

const AGENCY_CAREERS = ['gestor-de-redes-sociais', 'tecnico-de-relacoes-publicas', 'assessor-de-comunicacao']
const COMMUNICATION_GROUP: Company['areas'] = ['comunicacao_social']

const jobartis = (label: string, path: string): SourceLink => ({
  label: `Jobartis: ${label}`,
  url: `https://www.jobartis.com/emprego-${path}`,
})

export const COMMUNICATION_COMPANIES: Company[] = [
  employer(
    'back-communication',
    'Back Communication',
    'comunicacao',
    'Agência de publicidade, relações públicas e digital, com escritórios em Luanda, Maputo e Lisboa. Foi Agência do Ano em Angola em 2016.',
    AGENCY_CAREERS,
    false,
    COMMUNICATION_GROUP,
    {
      label: 'Ver Angola: Back, Agência do Ano (2016)',
      url: 'https://www.verangola.net/va/pt/072016/Telecomunicacoes/4894/Back-%C3%A9-Ag%C3%AAncia-de-Publicidade-do-Ano-em-Angola-pela-terceira-vez-consecutiva.htm',
    },
  ),
  employer(
    'zwela-angola',
    'Zwela Angola',
    'comunicacao',
    'Agência de comunicação, antes chamada Publivision, com planeamento estratégico e produção de conteúdos.',
    [...AGENCY_CAREERS, 'editor-de-video'],
    false,
    COMMUNICATION_GROUP,
    {
      label: 'Ver Angola: Publivision passa a Zwela Angola (2015)',
      url: 'https://www.verangola.net/va/pt/122015/Telecomunicacoes/3102/Publivision-passa-a-designar-se-Zwela-Angola.htm',
    },
  ),
  employer(
    'kreatif-comunicacoes',
    'Kreatif Comunicações',
    'comunicacao',
    'Agência de marketing e comunicação em Luanda, fundada em 2021, focada em relações públicas.',
    AGENCY_CAREERS,
    false,
    COMMUNICATION_GROUP,
    { label: 'online.pr: Kreatif Comunicações', url: 'https://online.pr/agency/kreatif-comunicacoes-angola' },
  ),
  employer(
    'brandai-express',
    'BrandAI Express',
    'comunicacao',
    'Anunciou uma vaga de gestor de redes sociais e designer.',
    ['gestor-de-redes-sociais'],
    true,
    COMMUNICATION_GROUP,
    jobartis('gestor de redes sociais', 'brandai-express-gestor-de-redes-sociais-e-desagner'),
  ),
  employer(
    'pilar-campos',
    'Pilar Campos',
    'comunicacao',
    'Anunciou vagas de gestor de redes sociais, marketing e comunicação.',
    ['gestor-de-redes-sociais'],
    true,
    COMMUNICATION_GROUP,
    jobartis('jurista', 'pilar-campos-jurista'),
  ),
  employer(
    'conosenti-angola',
    'Conosenti Angola',
    'comunicacao',
    'Anunciou uma vaga de videomaker, fotógrafo e editor.',
    ['editor-de-video'],
    true,
    COMMUNICATION_GROUP,
    jobartis('videomaker e editor', 'conosenti-angola-videomaker-fotografo-editor'),
  ),
  employer(
    'portulang',
    'Portulang - Comércio Internacional',
    'comercio',
    'Anunciou uma vaga de tradutor e intérprete em Luanda.',
    ['tradutor', 'interprete'],
    true,
    ['linguas'],
    jobartis('tradutor intérprete', 'portulang-comercio-internacional-su-lda-tradutor-interprete'),
  ),
  employer(
    'wange-international-angola-lda',
    'Wange International Angola Lda',
    'comercio',
    'Anunciou vagas de tradutor de mandarim.',
    ['tradutor'],
    true,
    ['linguas'],
    jobartis(
      'tradutor de mandarim',
      'wange-international-angola-lda-tradutor-de-mandarim-para-portugues-cd109bd6-82a8-43b8-b46f-304f8afafc05',
    ),
  ),
  employer(
    'geracao-80',
    'Geração 80',
    'comunicacao',
    'Produtora de cinema independente de Luanda, criada em 2010, com filmes mostrados em festivais internacionais.',
    ['realizador', 'editor-de-video', 'actor'],
    false,
    ['artes', 'comunicacao_social'],
    {
      label: 'Ver Angola: novo filme da Geração 80 (2021)',
      url: 'https://www.verangola.net/va/pt/122021/Cultura/28687/%E2%80%9CNossa-Senhora-da-Loja-do-Chin%C3%AAs%E2%80%9D-novo-filme-da-Gera%C3%A7%C3%A3o-80-estreia-em-Roterd%C3%A3o.htm',
    },
  ),
  employer(
    'elinga-teatro',
    'Elinga Teatro',
    'comunicacao',
    'Grupo de teatro de Luanda, criado em 1988. Em 2021 fez uma coprodução com o Camões.',
    ['actor', 'gestor-cultural'],
    false,
    ['artes'],
    {
      label: 'Ver Angola: "Abel, Abel" em Luanda (2021)',
      url: 'https://www.verangola.net/va/pt/102021/Cultura/27697/Teatro-angolano-e-portugu%C3%AAs-juntam-se-para-levar-%C3%A0-cena-%E2%80%9CAbel-Abel%E2%80%9D-em-Luanda.htm',
    },
  ),
  employer(
    'beatriz-franck',
    'Beatriz Franck',
    'comercio',
    'Marca de moda com sede em Luanda, onde junta loja, showroom e escola de moda.',
    ['designer-de-moda'],
    false,
    ['artes'],
    {
      label: 'Ver Angola: nova sede da Beatriz Franck (2021)',
      url: 'https://www.verangola.net/va/pt/102021/Lazer/27749/BEATRIZFRANCK-soma-e-segue-na-ind%C3%BAstria-da-moda-e-inaugura-novo-edif%C3%ADcio-sede-em-Luanda.htm',
    },
  ),
  employer(
    'impact-cloud',
    'Impact Cloud',
    'consultoria',
    'Anunciou uma vaga de director de acção cultural e língua portuguesa.',
    ['gestor-cultural'],
    true,
    ['artes'],
    jobartis('director de acção cultural', 'impact-cloud-diretor-de-acao-cultural-e-lingua-portuguesa'),
  ),
]
