import type { Company, CompanyInsight, CompanyRole, CompanySector } from '../types'

// What each kind of business hires for and how a young person gets there. This is our reading of the type of
// business (what banks, oil companies, ministries… do and need), not a statement by any company: everything
// built here is `estimated` (docs/recolha-de-dados.md, "Empresas"; memory "data-to-collect-later").
// Real posts with an ad or a careers page (companyProfiles.ts) always win over these.

export type Kind =
  | 'banco'
  | 'telecom'
  | 'tecnologia'
  | 'petroleo'
  | 'electricidade'
  | 'media'
  | 'mineracao'
  | 'comercio'
  | 'consultoria'
  | 'saude'
  | 'seguros'
  | 'transporte'
  | 'porto'
  | 'estado'
  | 'industria'
  | 'construcao'
  | 'hotelaria'
  | 'advocacia'
  | 'justica'
  | 'educacao'
  | 'agricultura'
  | 'organizacao'

type Post = { title: string; careers: string[]; requirements: string[]; ladder: string[] }

type KindData = {
  posts: Post[]
  partners: string[]
  /** The usual ways in, in order. */
  hiring: string[]
  values: string
  tip: string
}

const KINDS: Record<Kind, KindData> = {
  banco: {
    posts: [
      {
        title: 'Gestor de clientes',
        careers: ['gestor-de-clientes-bancario'],
        requirements: [
          'Licenciatura em Economia, Gestão ou Finanças',
          'Gosto por vender e falar com pessoas',
        ],
        ladder: [
          'Estagiário comercial',
          'Gestor de clientes particulares',
          'Gestor de clientes empresas',
          'Gerente de agência',
          'Director comercial',
        ],
      },
      {
        title: 'Atendimento e caixa',
        careers: ['operador-de-caixa-bancario'],
        requirements: ['Ensino médio em Contabilidade, Economia ou Administração', 'Rigor com dinheiro'],
        ladder: [
          'Operador de caixa',
          'Assistente de atendimento',
          'Chefe de operações da agência',
          'Gerente de agência',
        ],
      },
      {
        title: 'Crédito e risco',
        careers: ['analista-de-credito', 'analista-de-risco'],
        requirements: ['Licenciatura em Economia, Finanças ou Matemática', 'Domínio de Excel'],
        ladder: [
          'Analista júnior de crédito',
          'Analista de crédito ou de risco',
          'Coordenador de risco',
          'Director de risco',
        ],
      },
      {
        title: 'Compliance e auditoria',
        careers: ['tecnico-de-compliance', 'auditor-interno'],
        requirements: [
          'Licenciatura em Direito, Economia ou Contabilidade',
          'Conhecimento das regras do BNA',
        ],
        ladder: [
          'Técnico de compliance',
          'Auditor interno',
          'Coordenador de compliance',
          'Director de compliance',
        ],
      },
      {
        title: 'Tesouraria e contabilidade',
        careers: ['tesoureiro', 'contabilista'],
        requirements: ['Licenciatura em Contabilidade, Finanças ou Economia'],
        ladder: ['Assistente de contabilidade', 'Contabilista', 'Tesoureiro', 'Director financeiro'],
      },
      {
        title: 'Tecnologia e segurança',
        careers: ['desenvolvedor-backend', 'analista-de-ciberseguranca', 'administrador-de-redes'],
        requirements: ['Licenciatura em Engenharia Informática ou afins', 'Certificações são uma mais-valia'],
        ladder: [
          'Estagiário de TI',
          'Técnico ou programador',
          'Especialista (segurança, sistemas)',
          'Coordenador de TI',
          'Director de sistemas',
        ],
      },
      {
        title: 'Recursos humanos e marketing',
        careers: ['tecnico-de-recursos-humanos', 'gestor-de-marketing'],
        requirements: ['Licenciatura em Gestão, Psicologia ou Marketing'],
        ladder: ['Assistente', 'Técnico', 'Coordenador', 'Director de área'],
      },
    ],
    partners: [
      'uan',
      'ucan',
      'isptec',
      'isutic',
      'instituto-medio-de-economia-de-luanda',
      'instituto-medio-comercial-de-luanda',
      'academia-de-seguros-e-fundos-de-pensoes',
    ],
    hiring: [
      'Candidatar-se ao programa de estágio ou de trainee do banco, quando abre (anúncio no site, no LinkedIn e nos portais de emprego).',
      'Fazer as provas de selecção (raciocínio, cultura geral financeira e inglês) e a entrevista.',
      'Entrar como estagiário, e passar a contrato se a avaliação for boa.',
    ],
    values:
      'Rigor com números, cumprimento das regras do BNA, atendimento ao cliente e vontade de aprender. Média alta e inglês ajudam; os bancos privados valorizam também quem vende.',
    tip: 'Antes da candidatura, treina Excel e matemática financeira básica e lê as notícias do banco: a entrevista pergunta o que sabes dele.',
  },
  telecom: {
    posts: [
      {
        title: 'Redes e telecomunicações',
        careers: ['engenheiro-de-telecomunicacoes', 'tecnico-de-telecomunicacoes'],
        requirements: [
          'Engenharia de Telecomunicações ou Electrotécnica',
          'Disponibilidade para trabalho de campo',
        ],
        ladder: [
          'Estagiário de redes',
          'Técnico de telecomunicações',
          'Engenheiro de redes',
          'Coordenador de operações',
          'Director técnico',
        ],
      },
      {
        title: 'Sistemas e desenvolvimento',
        careers: ['desenvolvedor-backend', 'administrador-de-sistemas', 'analista-de-dados'],
        requirements: ['Engenharia Informática ou afins', 'Portfólio de projectos'],
        ladder: [
          'Estagiário de TI',
          'Programador ou administrador júnior',
          'Especialista',
          'Líder de equipa',
          'Director de sistemas',
        ],
      },
      {
        title: 'Vendas e clientes',
        careers: ['gestor-comercial', 'tecnico-comercial'],
        requirements: ['Ensino médio ou licenciatura em Gestão ou Marketing', 'Boa comunicação'],
        ladder: ['Assistente de loja', 'Técnico comercial', 'Gestor comercial', 'Director comercial'],
      },
      {
        title: 'Marketing digital',
        careers: ['gestor-de-marketing-digital', 'gestor-de-redes-sociais'],
        requirements: ['Licenciatura em Marketing ou Comunicação'],
        ladder: [
          'Assistente de marketing',
          'Gestor de redes sociais',
          'Gestor de marketing digital',
          'Director de marketing',
        ],
      },
      {
        title: 'Segurança e finanças',
        careers: ['analista-de-ciberseguranca', 'analista-financeiro'],
        requirements: ['Licenciatura na área', 'Certificações de segurança ou finanças valorizadas'],
        ladder: ['Analista júnior', 'Analista', 'Coordenador', 'Director da área'],
      },
    ],
    partners: ['isptec', 'isutic', 'itel', 'uan', 'ucan', 'cinfotec'],
    hiring: [
      'Candidatar-se ao programa de estágio ou à candidatura espontânea (as operadoras abrem-nas por áreas e datas).',
      'Passar nas provas técnicas da área e na entrevista, com inglês básico.',
      'Começar como estagiário ou técnico e crescer por resultados.',
    ],
    values:
      'Conhecimento técnico de redes e sistemas, disponibilidade para turnos e trabalho de campo e orientação para o cliente. Uma operadora tem muitos clientes e pouca margem para erros de serviço.',
    tip: 'Tira uma certificação reconhecida (Cisco, por exemplo) e mostra projectos reais: contam mais do que a nota do diploma.',
  },
  tecnologia: {
    posts: [
      {
        title: 'Desenvolvimento de software',
        careers: ['desenvolvedor-full-stack', 'desenvolvedor-frontend', 'desenvolvedor-backend'],
        requirements: ['Curso de Informática ou autodidacta com portfólio', 'Git e uma stack moderna'],
        ladder: [
          'Estagiário',
          'Programador júnior',
          'Programador sénior',
          'Líder técnico',
          'Director de tecnologia',
        ],
      },
      {
        title: 'Suporte e infraestrutura',
        careers: ['tecnico-de-suporte', 'administrador-de-sistemas', 'tecnico-de-hardware'],
        requirements: ['Médio ou licenciatura em Informática', 'Certificações de redes ou sistemas'],
        ladder: [
          'Técnico de suporte',
          'Administrador de sistemas',
          'Especialista de infraestrutura',
          'Coordenador de TI',
        ],
      },
      {
        title: 'Produto e design',
        careers: ['designer-ui-ux', 'gestor-de-projetos-de-ti', 'analista-de-sistemas'],
        requirements: ['Formação em Design, Gestão ou Informática', 'Portfólio'],
        ladder: [
          'Assistente',
          'Designer ou analista',
          'Gestor de produto ou projecto',
          'Director de produto',
        ],
      },
      {
        title: 'Dados e vendas',
        careers: ['analista-de-dados', 'comercial-de-ti'],
        requirements: ['Estatística, Informática ou Gestão', 'SQL ou boa comunicação comercial'],
        ladder: ['Analista júnior', 'Analista ou comercial', 'Especialista', 'Responsável da área'],
      },
    ],
    partners: ['isptec', 'isutic', 'itel', 'cinfotec', 'escola-42-luanda', 'uan'],
    hiring: [
      'Responder ao anúncio com o CV e o link para o portfólio ou GitHub.',
      'Fazer um teste técnico curto e uma entrevista com a equipa.',
      'Entrar como estagiário ou júnior; as empresas pequenas promovem depressa quem entrega.',
    ],
    values:
      'Provas de que sabes fazer: projectos, código publicado e certificações. Nas empresas pequenas, polivalência e rapidez; nas grandes, método e trabalho em equipa.',
    tip: 'Constrói dois ou três projectos reais e mostra-os. Em empresas pequenas isso vale mais do que a média do curso.',
  },
  petroleo: {
    posts: [
      {
        title: 'Engenharia de petróleos e perfuração',
        careers: ['engenheiro-de-petroleos', 'engenheiro-de-perfuracao'],
        requirements: [
          'Licenciatura em Engenharia de Petróleos ou Química',
          'Inglês técnico',
          'Cursos de segurança offshore',
        ],
        ladder: [
          'Estagiário ou trainee',
          'Engenheiro júnior',
          'Engenheiro de campo ou de projecto',
          'Engenheiro sénior',
          'Gestor de activo',
        ],
      },
      {
        title: 'Geociências',
        careers: ['geologo', 'geofisico'],
        requirements: ['Licenciatura em Geologia ou Geofísica', 'Inglês técnico'],
        ladder: [
          'Trainee',
          'Geólogo ou geofísico júnior',
          'Geocientista',
          'Geocientista sénior',
          'Gestor de exploração',
        ],
      },
      {
        title: 'Operação e manutenção',
        careers: ['operador-de-producao-petrolifera', 'engenheiro-mecanico', 'tecnico-de-instrumentacao'],
        requirements: [
          'Ensino médio técnico ou licenciatura em Mecânica ou Electrotecnia',
          'Certificados de segurança (BOSIET)',
        ],
        ladder: [
          'Ajudante técnico',
          'Operador ou técnico',
          'Técnico sénior',
          'Supervisor',
          'Gestor de operações',
        ],
      },
      {
        title: 'Segurança, saúde e ambiente',
        careers: ['tecnico-de-seguranca-no-trabalho', 'engenheiro-do-ambiente'],
        requirements: ['Formação em HSE ou Engenharia'],
        ladder: ['Técnico de HSE', 'Supervisor de HSE', 'Coordenador de HSE', 'Director de HSE'],
      },
      {
        title: 'Finanças, jurídico e compras',
        careers: ['analista-financeiro', 'jurista', 'tecnico-de-procurement'],
        requirements: ['Licenciatura em Economia, Direito ou Gestão', 'Inglês'],
        ladder: ['Trainee', 'Analista', 'Coordenador', 'Director da área'],
      },
    ],
    partners: [
      'instituto-nacional-de-petroleos',
      'uan',
      'isptec',
      'ucan',
      'academia-petroangola',
      'centro-de-formacao-maritima-de-angola',
      'instituto-profissional-de-gestao-de-petroleo',
    ],
    hiring: [
      'Seguir as vagas, as bolsas e os programas de trainee da empresa (as petrolíferas e as de serviços anunciam-nos nos sites e portais de emprego).',
      'Tirar os cursos de segurança exigidos para trabalhar offshore, quando a vaga é no mar.',
      'Entrar muitas vezes por uma empresa de serviços (subcontratada) e depois passar para a operadora.',
    ],
    values:
      'Inglês técnico, segurança acima de tudo, disponibilidade para regimes de rotação (por exemplo 28 dias a bordo, 28 em casa) e formação técnica sólida. O conteúdo local obriga as empresas a formar angolanos.',
    tip: 'Ganha vantagem com certificados de segurança e inglês antes de acabar o curso: sem eles, as empresas de serviços nem agendam entrevista.',
  },
  electricidade: {
    posts: [
      {
        title: 'Engenharia electrotécnica',
        careers: ['engenheiro-electrotecnico', 'engenheiro-de-energias-renovaveis'],
        requirements: ['Licenciatura em Engenharia Electrotécnica ou Energias', 'Carta de condução'],
        ladder: [
          'Estagiário',
          'Engenheiro júnior',
          'Engenheiro de projecto ou de operação',
          'Chefe de departamento',
          'Director técnico',
        ],
      },
      {
        title: 'Electricistas e manutenção',
        careers: ['tecnico-electricista', 'tecnico-de-manutencao-mecanica', 'engenheiro-de-manutencao'],
        requirements: [
          'Ensino médio técnico em Electricidade ou Mecânica',
          'Formação em segurança eléctrica',
        ],
        ladder: [
          'Ajudante',
          'Electricista',
          'Electricista sénior',
          'Chefe de equipa',
          'Supervisor de manutenção',
        ],
      },
      {
        title: 'Clientes e cobranças',
        careers: ['tecnico-comercial', 'tecnico-de-cobrancas'],
        requirements: ['Ensino médio ou licenciatura em Gestão ou Economia'],
        ladder: ['Assistente de atendimento', 'Técnico comercial', 'Coordenador', 'Responsável comercial'],
      },
      {
        title: 'Segurança e finanças',
        careers: ['tecnico-de-seguranca-no-trabalho', 'analista-financeiro'],
        requirements: ['Formação na área'],
        ladder: ['Técnico', 'Analista', 'Coordenador', 'Director da área'],
      },
    ],
    partners: [
      'isptec',
      'uan',
      'instituto-medio-industrial-de-luanda',
      'instituto-medio-politecnico-industrial-de-luanda',
      'inefop',
    ],
    hiring: [
      'Acompanhar os concursos e os anúncios das empresas públicas de energia e dos seus empreiteiros.',
      'Mostrar formação técnica e, para campo, carta de condução e saúde em dia.',
      'Começar como estagiário ou ajudante e subir com certificações de segurança eléctrica.',
    ],
    values:
      'Segurança no trabalho, formação técnica, disponibilidade para trabalho de campo em várias províncias e interesse pelas renováveis, que estão a crescer.',
    tip: 'Quem domina painéis solares e sistemas híbridos entra mais depressa: é uma área onde faltam técnicos.',
  },
  media: {
    posts: [
      {
        title: 'Jornalismo',
        careers: ['jornalista', 'editor-de-video'],
        requirements: ['Licenciatura em Comunicação Social ou Jornalismo', 'Portfólio de peças'],
        ladder: [
          'Estagiário de redacção',
          'Repórter',
          'Redactor ou editor',
          'Chefe de redacção',
          'Director de informação',
        ],
      },
      {
        title: 'Produção e realização',
        careers: ['realizador', 'tecnico-de-relacoes-publicas'],
        requirements: ['Formação em Audiovisual ou Comunicação'],
        ladder: ['Assistente de produção', 'Produtor', 'Realizador', 'Director de programas'],
      },
      {
        title: 'Digital e design',
        careers: ['gestor-de-redes-sociais', 'designer-grafico'],
        requirements: ['Portfólio digital', 'Domínio de ferramentas de edição'],
        ladder: [
          'Assistente digital',
          'Gestor de redes sociais ou designer',
          'Coordenador digital',
          'Director digital',
        ],
      },
      {
        title: 'Técnico de emissão',
        careers: ['tecnico-de-telecomunicacoes'],
        requirements: ['Ensino médio técnico em Electrónica ou Telecomunicações'],
        ladder: ['Ajudante técnico', 'Técnico de emissão', 'Chefe técnico'],
      },
    ],
    partners: [
      'centro-de-formacao-de-jornalistas-cefojor',
      'isutic',
      'uan',
      'ucan',
      'instituto-superior-de-artes',
    ],
    hiring: [
      'Fazer estágio curricular ou profissional na redacção ou na produtora, ou enviar peças e portfólio.',
      'Passar numa prova de escrita ou de edição e numa entrevista.',
      'Nos órgãos públicos, as entradas são por concurso ou nomeação; nos privados, por convite e portfólio.',
    ],
    values:
      'Rigor, rapidez, escrita limpa e domínio do vídeo e das redes sociais. Quem faz uma peça completa (texto, imagem, vídeo) é muito procurado.',
    tip: 'Publica regularmente: um blogue, canal ou perfil com peças tuas é o melhor currículo em comunicação.',
  },
  mineracao: {
    posts: [
      {
        title: 'Geologia e minas',
        careers: ['geologo', 'engenheiro-de-minas'],
        requirements: [
          'Licenciatura em Geologia ou Engenharia de Minas',
          'Disponibilidade para viver na mina',
        ],
        ladder: [
          'Trainee',
          'Geólogo ou engenheiro de minas júnior',
          'Engenheiro de planeamento',
          'Chefe de mina',
          'Director de operações',
        ],
      },
      {
        title: 'Processamento e metalurgia',
        careers: ['engenheiro-metalurgico', 'engenheiro-mecanico', 'engenheiro-de-manutencao'],
        requirements: ['Licenciatura em Engenharia', 'Formação em segurança industrial'],
        ladder: ['Estagiário', 'Engenheiro júnior', 'Engenheiro de processo', 'Chefe de fábrica'],
      },
      {
        title: 'Operação de máquinas',
        careers: ['operador-de-maquinas-pesadas', 'tecnico-de-manutencao-mecanica'],
        requirements: ['Ensino médio técnico', 'Certificado de operador'],
        ladder: ['Ajudante', 'Operador', 'Operador sénior', 'Supervisor'],
      },
      {
        title: 'Apoio e gestão',
        careers: ['tecnico-de-seguranca-no-trabalho', 'contabilista', 'tecnico-de-recursos-humanos'],
        requirements: ['Formação na área'],
        ladder: ['Assistente', 'Técnico', 'Coordenador', 'Director da área'],
      },
    ],
    partners: ['uan', 'isptec', 'ucan', 'inefop'],
    hiring: [
      'Procurar as vagas e os programas de formação da empresa mineira; muitas contratam na província da mina.',
      'Mostrar formação técnica, saúde e, para campo, disponibilidade para viver no local.',
      'Começar como trainee ou operador e crescer com a experiência e os cursos de segurança.',
    ],
    values:
      'Segurança, resistência a condições de campo, formação técnica e estabilidade: as minas contratam para ficar anos.',
    tip: 'Quem vive perto da mina (por exemplo na Lunda) tem vantagem: pergunta pelos programas de contratação local.',
  },
  comercio: {
    posts: [
      {
        title: 'Gestão de loja',
        careers: ['gestor-de-loja', 'tecnico-comercial'],
        requirements: ['Ensino médio ou licenciatura em Gestão', 'Experiência de atendimento é valorizada'],
        ladder: [
          'Operador de loja',
          'Chefe de secção',
          'Gestor de loja',
          'Gestor regional',
          'Director de operações',
        ],
      },
      {
        title: 'Compras e logística',
        careers: ['tecnico-de-compras', 'gestor-de-logistica', 'tecnico-de-logistica'],
        requirements: ['Formação em Logística ou Gestão', 'Excel'],
        ladder: [
          'Assistente de armazém',
          'Técnico de logística',
          'Gestor de logística',
          'Director de cadeia de abastecimento',
        ],
      },
      {
        title: 'Finanças e pessoas',
        careers: ['contabilista', 'tecnico-de-recursos-humanos'],
        requirements: ['Licenciatura na área'],
        ladder: ['Assistente', 'Técnico', 'Coordenador', 'Director'],
      },
      {
        title: 'Marketing',
        careers: ['gestor-de-marketing'],
        requirements: ['Licenciatura em Marketing ou Gestão'],
        ladder: ['Assistente de marketing', 'Gestor de marketing', 'Director de marketing'],
      },
    ],
    partners: ['instituto-medio-comercial-de-luanda', 'uan', 'ucan', 'inefop'],
    hiring: [
      'Entregar o CV na loja ou responder ao anúncio; o comércio contrata em grande número e muitas vezes por entrevista de grupo.',
      'Começar na loja ou no armazém: é a porta de entrada mesmo para quem tem curso.',
      'Subir de operador a chefe de secção e gestor, com bom desempenho e liderança.',
    ],
    values:
      'Atendimento, rapidez, honestidade com o dinheiro e disponibilidade de horário (fins-de-semana e feriados). Quem lidera pessoas sobe depressa.',
    tip: 'Mostra que sabes lidar com números e com pessoas: gestores de loja são promovidos de dentro mais do que contratados de fora.',
  },
  consultoria: {
    posts: [
      {
        title: 'Auditoria',
        careers: ['auditor', 'contabilista'],
        requirements: ['Licenciatura em Contabilidade, Auditoria ou Finanças', 'Média alta e inglês'],
        ladder: ['Estagiário', 'Auditor júnior', 'Auditor sénior', 'Gerente', 'Sócio'],
      },
      {
        title: 'Consultoria e finanças',
        careers: ['consultor-de-gestao', 'analista-financeiro'],
        requirements: ['Licenciatura em Gestão ou Economia', 'Excel e apresentação'],
        ladder: ['Estagiário', 'Consultor júnior', 'Consultor sénior', 'Gerente', 'Sócio'],
      },
      {
        title: 'Fiscalidade e jurídico',
        careers: ['tecnico-de-impostos', 'jurista'],
        requirements: ['Licenciatura em Direito, Economia ou Contabilidade'],
        ladder: ['Estagiário', 'Consultor fiscal ou jurista', 'Sénior', 'Gerente', 'Sócio'],
      },
      {
        title: 'Tecnologia e dados',
        careers: ['analista-de-dados', 'analista-de-ciberseguranca'],
        requirements: ['Engenharia Informática ou afins'],
        ladder: ['Estagiário', 'Analista', 'Consultor', 'Gerente'],
      },
    ],
    partners: ['uan', 'ucan', 'isptec', 'pwc-academy-angola'],
    hiring: [
      'Candidatar-se ao programa de estágio ou de graduados (as consultoras recrutam nas universidades, em ciclos anuais).',
      'Passar nos testes de raciocínio, no caso prático em grupo e nas entrevistas.',
      'Entrar como estagiário e subir de nível todos os 2 a 3 anos, por avaliação.',
    ],
    values:
      'Média alta, inglês, Excel, capacidade de aprender depressa e de apresentar ideias. O trabalho é exigente e por projectos.',
    tip: 'As datas dos programas de estágio são curtas: segue as páginas das consultoras e candidata-te no último ano do curso.',
  },
  saude: {
    posts: [
      {
        title: 'Medicina',
        careers: ['medico-clinica-geral', 'medico-pediatra', 'cirurgiao-geral'],
        requirements: ['Licenciatura em Medicina', 'Inscrição na Ordem dos Médicos'],
        ladder: ['Interno', 'Médico geral', 'Médico especialista', 'Chefe de serviço', 'Director clínico'],
      },
      {
        title: 'Enfermagem',
        careers: ['enfermeiro', 'tecnico-medio-enfermagem'],
        requirements: ['Licenciatura ou curso médio de Enfermagem', 'Inscrição na Ordem dos Enfermeiros'],
        ladder: [
          'Técnico de enfermagem',
          'Enfermeiro',
          'Enfermeiro especialista',
          'Enfermeiro-chefe',
          'Director de enfermagem',
        ],
      },
      {
        title: 'Diagnóstico e farmácia',
        careers: ['tecnico-analises-clinicas', 'tecnico-radiologia', 'farmaceutico'],
        requirements: ['Formação técnica ou licenciatura na área'],
        ladder: ['Técnico', 'Técnico sénior', 'Responsável de laboratório ou serviço', 'Director técnico'],
      },
      {
        title: 'Reabilitação e nutrição',
        careers: ['fisioterapeuta', 'nutricionista'],
        requirements: ['Licenciatura na área'],
        ladder: ['Técnico', 'Terapeuta ou nutricionista', 'Responsável de serviço'],
      },
      {
        title: 'Administração',
        careers: ['contabilista', 'tecnico-de-recursos-humanos'],
        requirements: ['Formação em Gestão ou Contabilidade'],
        ladder: ['Assistente', 'Técnico', 'Coordenador', 'Director administrativo'],
      },
    ],
    partners: [
      'escola-de-formacao-de-tecnicos-de-saude-de-luanda',
      'instituto-de-especializacao-em-saude',
      'uan',
      'ucan',
    ],
    hiring: [
      'Nos hospitais e institutos públicos, concorrer aos concursos públicos de saúde (abrem com quadros e datas por província).',
      'Nas clínicas privadas, enviar o CV e as cédulas das ordens e passar por entrevista e prova prática.',
      'Entrar como interno, técnico ou estagiário e especializar-se com a experiência.',
    ],
    values:
      'Inscrição na ordem profissional, ética, resistência ao stress e trabalho em equipa. Nas clínicas privadas contam também o atendimento e a língua estrangeira.',
    tip: 'Se vais para o público, acompanha os concursos de saúde por província: há vagas fora de Luanda que quase ninguém concorre.',
  },
  seguros: {
    posts: [
      {
        title: 'Seguros e mediação',
        careers: ['tecnico-de-seguros', 'mediador-de-seguros'],
        requirements: ['Ensino médio ou licenciatura em Gestão, Economia ou Direito', 'Formação em seguros'],
        ladder: ['Assistente de seguros', 'Técnico de seguros', 'Gestor de carteira', 'Director de ramo'],
      },
      {
        title: 'Actuariado e risco',
        careers: ['actuario', 'analista-de-risco'],
        requirements: ['Licenciatura em Matemática, Estatística ou Economia'],
        ladder: ['Analista júnior', 'Actuário ou analista de risco', 'Coordenador', 'Director técnico'],
      },
      {
        title: 'Jurídico e contabilidade',
        careers: ['jurista', 'contabilista'],
        requirements: ['Licenciatura na área'],
        ladder: ['Assistente', 'Técnico', 'Coordenador', 'Director'],
      },
      {
        title: 'Comercial',
        careers: ['tecnico-comercial', 'gestor-comercial'],
        requirements: ['Gosto por vender e acompanhar clientes'],
        ladder: ['Agente ou comercial', 'Gestor comercial', 'Director comercial'],
      },
    ],
    partners: ['academia-de-seguros-e-fundos-de-pensoes', 'uan', 'ucan', 'isptec'],
    hiring: [
      'Responder aos anúncios ou aos programas de estágio das seguradoras.',
      'Fazer a formação inicial em seguros, muitas vezes dada pela própria seguradora.',
      'Começar em atendimento ou sinistros e passar para a área técnica.',
    ],
    values:
      'Confiança com clientes, atenção às cláusulas, números e cumprimento das regras da ARSEG. Actuários são raros e muito procurados.',
    tip: 'Matemática e estatística fortes abrem a porta do actuariado, uma das carreiras com menos concorrência no sector financeiro.',
  },
  transporte: {
    posts: [
      {
        title: 'Operações e transportes',
        careers: ['tecnico-de-transportes', 'engenheiro-de-transportes'],
        requirements: ['Licenciatura em Engenharia ou Gestão de Transportes'],
        ladder: [
          'Assistente de operações',
          'Técnico de transportes',
          'Coordenador de operações',
          'Director de operações',
        ],
      },
      {
        title: 'Aviação e segurança',
        careers: ['inspector-de-aviacao-civil', 'tecnico-de-seguranca-no-trabalho'],
        requirements: ['Formação aeronáutica ou em segurança', 'Inglês'],
        ladder: ['Técnico', 'Inspector', 'Coordenador de segurança', 'Director de segurança'],
      },
      {
        title: 'Manutenção',
        careers: ['engenheiro-de-manutencao', 'tecnico-de-manutencao-mecanica'],
        requirements: ['Ensino médio técnico ou licenciatura em Mecânica'],
        ladder: ['Ajudante técnico', 'Técnico de manutenção', 'Engenheiro de manutenção', 'Director técnico'],
      },
      {
        title: 'Comercial e finanças',
        careers: ['tecnico-comercial', 'contabilista'],
        requirements: ['Formação na área'],
        ladder: ['Assistente', 'Técnico', 'Coordenador', 'Director'],
      },
    ],
    partners: ['isptec', 'uan', 'ucan', 'instituto-medio-industrial-de-luanda'],
    hiring: [
      'Acompanhar os programas de estágio e de formação da empresa (por exemplo, de pilotos e de técnicos) e os anúncios de vagas.',
      'Passar em testes técnicos, de inglês e de aptidão física ou médica, conforme a função.',
      'Entrar como estagiário ou técnico e especializar-se com cursos certificados.',
    ],
    values: 'Segurança acima de tudo, pontualidade, inglês e cumprimento rigoroso de procedimentos.',
    tip: 'Os cursos certificados (aviação, ferrovia, portos) são o que abre a porta: verifica os requisitos antes de escolheres o curso.',
  },
  porto: {
    posts: [
      {
        title: 'Gestão portuária',
        careers: ['gestor-portuario', 'despachante-aduaneiro'],
        requirements: ['Licenciatura em Gestão, Logística ou Transportes'],
        ladder: ['Assistente', 'Técnico portuário', 'Gestor de terminal', 'Director de operações'],
      },
      {
        title: 'Logística',
        careers: ['gestor-de-logistica', 'tecnico-de-logistica'],
        requirements: ['Formação em Logística'],
        ladder: ['Assistente', 'Técnico de logística', 'Gestor de logística', 'Director de logística'],
      },
      {
        title: 'Obras e equipamentos',
        careers: ['engenheiro-civil', 'operador-de-maquinas-pesadas', 'rigger-e-operador-de-grua'],
        requirements: ['Engenharia Civil ou curso técnico', 'Certificado de operador'],
        ladder: ['Ajudante', 'Operador ou técnico', 'Operador sénior', 'Supervisor'],
      },
      {
        title: 'Segurança e finanças',
        careers: ['tecnico-de-seguranca-no-trabalho', 'analista-financeiro'],
        requirements: ['Formação na área'],
        ladder: ['Técnico', 'Analista', 'Coordenador', 'Director'],
      },
    ],
    partners: ['centro-de-formacao-maritima-de-angola', 'uan', 'isptec', 'ucan'],
    hiring: [
      'Acompanhar os anúncios e os concursos da empresa portuária e dos operadores de terminais.',
      'Tirar cursos certificados de operação de equipamentos e de segurança portuária.',
      'Entrar como técnico ou operador e crescer com certificações.',
    ],
    values: 'Segurança, trabalho por turnos, disciplina e conhecimento das regras aduaneiras.',
    tip: 'Quem junta logística com inglês e conhecimento aduaneiro é muito procurado pelos operadores de terminais.',
  },
  estado: {
    posts: [
      {
        title: 'Economia e estudos',
        careers: ['economista', 'analista-de-estudos-economicos'],
        requirements: ['Licenciatura em Economia', 'Concurso público ou processo de selecção'],
        ladder: ['Técnico médio', 'Técnico superior', 'Chefe de departamento', 'Director nacional'],
      },
      {
        title: 'Finanças e impostos',
        careers: ['tecnico-de-impostos', 'auditor-interno', 'analista-financeiro'],
        requirements: ['Licenciatura em Contabilidade, Finanças ou Direito'],
        ladder: ['Técnico médio', 'Técnico superior', 'Chefe de secção', 'Director'],
      },
      {
        title: 'Administração pública e jurídico',
        careers: ['tecnico-superior-de-administracao-publica', 'jurista'],
        requirements: ['Licenciatura em Direito, Administração Pública ou Gestão'],
        ladder: ['Técnico médio', 'Técnico superior', 'Chefe de departamento', 'Director nacional'],
      },
      {
        title: 'Informática',
        careers: ['analista-de-sistemas', 'analista-de-ciberseguranca'],
        requirements: ['Engenharia Informática ou afins'],
        ladder: ['Técnico de informática', 'Analista', 'Chefe de sistemas', 'Director de informática'],
      },
    ],
    partners: ['escola-nacional-de-administracao-e-politicas-publicas-enapp', 'uan', 'ucan', 'isptec'],
    hiring: [
      'Acompanhar os concursos públicos (o Ministério da Administração Pública publica as vagas por órgão e província).',
      'Candidatar-se com os documentos pedidos (certificado, BI, registo criminal) no prazo do edital.',
      'Fazer a prova escrita e a entrevista; a entrada é por categoria e depois sobe-se por antiguidade e avaliação.',
    ],
    values:
      'Cumprir o edital à letra, documentos em ordem, formação na área do concurso e paciência: o processo é lento, mas a carreira é estável.',
    tip: 'Prepara os documentos antes de o concurso abrir: os prazos são curtos e a falta de um papel desclassifica.',
  },
  industria: {
    posts: [
      {
        title: 'Produção e qualidade',
        careers: [
          'engenheiro-de-producao-industrial',
          'tecnico-de-qualidade-alimentar',
          'engenheiro-quimico',
        ],
        requirements: ['Licenciatura em Engenharia Industrial, Química ou Alimentar'],
        ladder: ['Estagiário', 'Técnico ou engenheiro júnior', 'Chefe de linha', 'Director de produção'],
      },
      {
        title: 'Manutenção',
        careers: ['engenheiro-de-manutencao', 'tecnico-de-manutencao-mecanica', 'tecnico-electricista'],
        requirements: ['Ensino médio técnico ou licenciatura em Mecânica ou Electricidade'],
        ladder: ['Ajudante técnico', 'Técnico de manutenção', 'Chefe de manutenção', 'Director técnico'],
      },
      {
        title: 'Logística e comercial',
        careers: ['gestor-de-logistica', 'gestor-comercial'],
        requirements: ['Licenciatura em Gestão ou Logística'],
        ladder: ['Assistente', 'Técnico', 'Gestor', 'Director'],
      },
      {
        title: 'Segurança e finanças',
        careers: ['tecnico-de-seguranca-no-trabalho', 'contabilista'],
        requirements: ['Formação na área'],
        ladder: ['Técnico', 'Analista', 'Coordenador', 'Director'],
      },
    ],
    partners: ['isptec', 'uan', 'instituto-medio-industrial-de-luanda', 'inefop'],
    hiring: [
      'Responder aos anúncios da fábrica ou levar o CV à porta de entrada: muitas indústrias contratam localmente.',
      'Fazer testes técnicos práticos, por exemplo de manutenção ou de qualidade.',
      'Entrar como técnico ou operador e subir por mérito.',
    ],
    values:
      'Disciplina, trabalho por turnos, cumprimento de normas de segurança e de qualidade e capacidade técnica de resolver avarias.',
    tip: 'Quem junta técnico de manutenção com conhecimentos de qualidade tem vantagem: as fábricas precisam dos dois.',
  },
  construcao: {
    posts: [
      {
        title: 'Engenharia civil e obras',
        careers: ['engenheiro-civil', 'tecnico-de-obras', 'topografo'],
        requirements: [
          'Licenciatura em Engenharia Civil ou curso técnico de Construção',
          'Disponibilidade para obra',
        ],
        ladder: [
          'Estagiário de obra',
          'Engenheiro ou técnico de obra',
          'Director de obra',
          'Director de projecto',
          'Administrador',
        ],
      },
      {
        title: 'Orçamentos e projecto',
        careers: ['medidor-orcamentista', 'arquitecto', 'gestor-de-projectos'],
        requirements: ['Licenciatura em Engenharia, Arquitectura ou Gestão', 'AutoCAD e Excel'],
        ladder: [
          'Desenhador ou medidor',
          'Projectista ou orçamentista',
          'Coordenador de projecto',
          'Director de projectos',
        ],
      },
      {
        title: 'Electricidade e segurança',
        careers: ['engenheiro-electrotecnico', 'tecnico-de-seguranca-no-trabalho'],
        requirements: ['Formação na área'],
        ladder: ['Técnico', 'Engenheiro', 'Coordenador', 'Director'],
      },
    ],
    partners: ['uan', 'isptec', 'ucan', 'instituto-medio-politecnico-industrial-de-luanda'],
    hiring: [
      'Seguir as vagas dos empreiteiros e as obras novas, que contratam por projecto.',
      'Mostrar formação, carta de condução e disponibilidade para mudar de província conforme a obra.',
      'Começar em obra como estagiário ou técnico e passar a gestão com resultados.',
    ],
    values:
      'Resistência física, leitura de projectos, segurança em obra e disponibilidade para mudar de local. Quem sabe orçamentar e planear vale ouro.',
    tip: 'Aprende AutoCAD e orçamentação cedo: são o que separa o técnico de obra do gestor de projecto.',
  },
  hotelaria: {
    posts: [
      {
        title: 'Gestão hoteleira',
        careers: ['gestor-hoteleiro', 'recepcionista-de-hotel'],
        requirements: ['Curso de Hotelaria ou Turismo', 'Inglês e simpatia ao balcão'],
        ladder: ['Recepcionista', 'Chefe de recepção', 'Gestor de departamento', 'Director do hotel'],
      },
      {
        title: 'Cozinha e restauração',
        careers: ['chefe-de-cozinha', 'cozinheiro', 'gestor-de-restauracao'],
        requirements: ['Escola de hotelaria e experiência de cozinha'],
        ladder: ['Ajudante de cozinha', 'Cozinheiro', 'Chefe de partida', 'Chefe de cozinha'],
      },
      {
        title: 'Turismo',
        careers: ['tecnico-de-turismo', 'guia-turistico'],
        requirements: ['Formação em Turismo e línguas'],
        ladder: ['Assistente', 'Técnico de turismo ou guia', 'Coordenador', 'Responsável de produto'],
      },
    ],
    partners: [
      'escola-de-hotelaria-e-restauracao-de-talatona',
      'escola-de-hotelaria-e-turismo-de-cabinda',
      'uan',
    ],
    hiring: [
      'Entregar o CV no hotel ou restaurante e fazer um estágio, que é a porta de entrada habitual.',
      'Passar numa entrevista com teste de línguas e de atendimento.',
      'Subir de departamento em departamento: quem muda de função aprende o negócio todo.',
    ],
    values: 'Simpatia, línguas (inglês, francês), apresentação, disciplina e disponibilidade de horário.',
    tip: 'Inglês falado a sério é o que faz um recepcionista passar a gestor: investe nele.',
  },
  advocacia: {
    posts: [
      {
        title: 'Advocacia',
        careers: ['advogado', 'jurista'],
        requirements: ['Licenciatura em Direito', 'Estágio na Ordem dos Advogados e cédula profissional'],
        ladder: ['Advogado estagiário', 'Advogado', 'Advogado sénior', 'Sócio'],
      },
      {
        title: 'Mediação e arbitragem',
        careers: ['mediador-de-conflitos'],
        requirements: ['Licenciatura em Direito ou afins', 'Formação em mediação'],
        ladder: ['Assistente', 'Mediador', 'Árbitro ou mediador sénior'],
      },
      {
        title: 'Apoio administrativo',
        careers: ['assistente-administrativo', 'secretario-executivo'],
        requirements: ['Ensino médio em Administração ou Secretariado'],
        ladder: ['Assistente', 'Secretário', 'Gestor de escritório'],
      },
    ],
    partners: ['centro-de-estudos-e-formacao-da-ordem-dos-advogados-de-angola', 'uan', 'ucan'],
    hiring: [
      'Enviar o CV e as notas ao escritório (os maiores abrem estágios todos os anos) e fazer entrevistas com sócios.',
      'Fazer o estágio da Ordem dos Advogados, que dá a cédula profissional.',
      'Ficar como advogado associado e subir até sénior e sócio ao longo de muitos anos.',
    ],
    values:
      'Notas altas, escrita jurídica clara, ética, confidencialidade e inglês nas áreas de petróleo e comércio internacional.',
    tip: 'Escolhe uma área (petróleo, laboral, fiscal, imobiliário) e especializa-te: os escritórios contratam por área.',
  },
  justica: {
    posts: [
      {
        title: 'Magistratura e ministério público',
        careers: ['juiz', 'procurador'],
        requirements: ['Licenciatura em Direito', 'Curso do Instituto Nacional de Estudos Judiciários'],
        ladder: [
          'Magistrado em formação',
          'Magistrado',
          'Magistrado sénior',
          'Presidente ou procurador-geral',
        ],
      },
      {
        title: 'Oficial de justiça e registos',
        careers: ['oficial-de-justica', 'conservador-dos-registos', 'notario'],
        requirements: ['Ensino médio ou licenciatura em Direito', 'Concurso público'],
        ladder: ['Escrivão adjunto', 'Oficial de justiça', 'Escrivão', 'Conservador ou notário'],
      },
      {
        title: 'Investigação e apoio',
        careers: ['investigador-criminal', 'jurista'],
        requirements: ['Licenciatura em Direito ou afins', 'Concurso público'],
        ladder: ['Inspector estagiário', 'Inspector', 'Inspector principal', 'Director'],
      },
    ],
    partners: [
      'instituto-nacional-de-estudos-judiciarios-inej',
      'centro-de-formacao-do-sic-da-damba',
      'uan',
      'ucan',
    ],
    hiring: [
      'Acompanhar os concursos de ingresso (o INEJ forma magistrados; os registos, tribunais e a investigação abrem concursos próprios).',
      'Candidatar-se no prazo com os documentos exigidos e passar nas provas escritas e orais.',
      'Fazer a formação inicial paga e ingressar na carreira, que sobe por antiguidade e mérito.',
    ],
    values:
      'Integridade, conhecimento do Direito, escrita rigorosa e capacidade de resistir a pressões. A entrada é exigente e formal.',
    tip: 'Prepara-te para as provas com antecedência: os concursos de justiça têm poucas vagas e muitos candidatos.',
  },
  educacao: {
    posts: [
      {
        title: 'Professor',
        careers: [
          'professor-do-ensino-primario',
          'professor-de-matematica',
          'professor-de-lingua-portuguesa',
          'professor-de-informatica',
        ],
        requirements: ['Licenciatura em Ensino ou Magistério Primário', 'Prova de ingresso ou entrevista'],
        ladder: [
          'Professor estagiário',
          'Professor',
          'Professor coordenador',
          'Subdirector pedagógico',
          'Director da escola',
        ],
      },
      {
        title: 'Direcção e pedagogia',
        careers: ['pedagogo', 'director-escolar'],
        requirements: ['Licenciatura em Ciências da Educação e experiência de ensino'],
        ladder: ['Professor', 'Coordenador pedagógico', 'Subdirector', 'Director'],
      },
      {
        title: 'Formação profissional',
        careers: ['formador-profissional', 'docente-do-ensino-superior'],
        requirements: ['Licenciatura (ou mestrado para docente superior) na área'],
        ladder: ['Formador assistente', 'Formador', 'Coordenador de cursos', 'Director de formação'],
      },
    ],
    partners: [
      'instituto-superior-de-ciencias-de-educacao-de-luanda',
      'escola-superior-pedagogica-do-cuanza-norte',
      'instituto-nacional-de-formacao-de-quadros-da-educacao-infqe',
      'uan',
    ],
    hiring: [
      'No ensino público, concorrer ao concurso nacional de ingresso de professores (abre por província e disciplina).',
      'Nas escolas privadas e internacionais, enviar o CV e fazer uma aula de demonstração e entrevista.',
      'Começar como professor, e crescer para coordenação e direcção com formação pedagógica.',
    ],
    values:
      'Domínio da disciplina, capacidade de explicar e de gerir uma turma, e inglês nas escolas internacionais.',
    tip: 'Guarda planos de aula e certificados: as escolas privadas pedem uma aula de demonstração.',
  },
  agricultura: {
    posts: [
      {
        title: 'Agronomia e produção',
        careers: ['engenheiro-agronomo', 'tecnico-agropecuario', 'gestor-de-empresas-agricolas'],
        requirements: ['Licenciatura em Agronomia ou médio agrário', 'Disponibilidade para viver na fazenda'],
        ladder: [
          'Estagiário de campo',
          'Técnico agrário',
          'Engenheiro agrónomo',
          'Gestor de exploração',
          'Director agrícola',
        ],
      },
      {
        title: 'Pecuária e veterinária',
        careers: ['medico-veterinario', 'zootecnico'],
        requirements: ['Licenciatura em Veterinária ou Zootecnia'],
        ladder: ['Técnico', 'Veterinário ou zootécnico', 'Responsável sanitário', 'Director de pecuária'],
      },
      {
        title: 'Pescas e aquicultura',
        careers: ['tecnico-de-pescas', 'tecnico-de-aquicultura', 'biologo-marinho'],
        requirements: ['Formação em Pescas, Biologia Marinha ou afins'],
        ladder: ['Ajudante', 'Técnico', 'Responsável de produção', 'Director de operações'],
      },
      {
        title: 'Conservação',
        careers: ['tecnico-de-conservacao-da-natureza', 'engenheiro-florestal'],
        requirements: ['Licenciatura em Biologia, Florestas ou Ambiente'],
        ladder: ['Estagiário', 'Técnico', 'Gestor de área', 'Coordenador de projectos'],
      },
    ],
    partners: ['uan', 'ucan', 'inefop'],
    hiring: [
      'Procurar as fazendas e as empresas agro-pecuárias da tua província: contratam muito localmente.',
      'Mostrar formação técnica e vontade de trabalhar no campo e longe da cidade.',
      'Começar como técnico e chegar a gestor de exploração com resultados de produção.',
    ],
    values: 'Trabalho de campo, resistência, gosto pela terra e, nas empresas maiores, números e gestão.',
    tip: 'A agricultura contrata fora de Luanda: ir para a província é muitas vezes o caminho mais rápido para um cargo de gestão.',
  },
  organizacao: {
    posts: [
      {
        title: 'Projectos e programas',
        careers: ['gestor-de-projectos', 'coordenador-de-projectos', 'tecnico-de-cooperacao-internacional'],
        requirements: [
          'Licenciatura em Gestão, Ciências Sociais ou Relações Internacionais',
          'Inglês (e francês é uma mais-valia)',
        ],
        ladder: [
          'Estagiário ou voluntário',
          'Assistente de projecto',
          'Oficial de programa',
          'Coordenador',
          'Director de programa',
        ],
      },
      {
        title: 'Acção social',
        careers: ['assistente-social', 'tecnico-de-salvaguardas-sociais'],
        requirements: ['Licenciatura em Serviço Social, Sociologia ou Psicologia'],
        ladder: ['Voluntário', 'Técnico social', 'Coordenador de terreno', 'Responsável de programa'],
      },
      {
        title: 'Estudos e monitoria',
        careers: ['analista-de-estudos-economicos', 'investigador-em-ciencias-sociais'],
        requirements: ['Licenciatura em Economia, Estatística ou Ciências Sociais'],
        ladder: ['Analista júnior', 'Analista', 'Especialista de monitoria', 'Chefe de estudos'],
      },
    ],
    partners: ['uan', 'ucan', 'pmi-angola-chapter'],
    hiring: [
      'Acompanhar as vagas publicadas nos sites da organização e nos portais de emprego da cooperação internacional.',
      'Candidatar-se em inglês, com carta de motivação, e passar em entrevistas por competências.',
      'Fazer estágio ou voluntariado primeiro: é a forma mais comum de entrar.',
    ],
    values:
      'Inglês, escrita de relatórios, experiência de terreno, trabalho em equipa multicultural e compromisso com a causa.',
    tip: 'O voluntariado numa organização local é o atalho: as organizações internacionais recrutam muita gente que já passou por lá.',
  },
}

/** The kind of business a company belongs to, from its sector, with a few that the sector cannot tell. */
const KIND_BY_SECTOR: Record<CompanySector, Kind> = {
  telecomunicacoes: 'telecom',
  banca: 'banco',
  tecnologia: 'tecnologia',
  televisao: 'telecom',
  energia: 'petroleo',
  industria: 'industria',
  transportes: 'transporte',
  saude: 'saude',
  seguros: 'seguros',
  consultoria: 'consultoria',
  estado: 'estado',
  comercio: 'comercio',
  justica: 'justica',
  comunicacao: 'media',
  educacao: 'educacao',
  mineracao: 'mineracao',
  agricultura: 'agricultura',
  turismo: 'hotelaria',
}

const ADVOCACIA = /advogad|grupo-legal|pilar-campos|jac-angola|arbitragem|crel/
const CONSTRUCAO =
  /mota-engil|teixeira-duarte|omatapalo|grupo-casais|pinto-e-cruz|prime-engenharia|bsprojectos|geonorte/
const ORGANIZACAO =
  /unicef|pnud|carter-center|african-parks|conservation-international|expertise-france|chemonics|kiazop|light-for-autism/
const ELECTRICIDADE = /^(empresa-nacional-de-distribuicao|empresa-publica-de-producao)/
const PORTO = /porto|dp-world|maritima|navegacao|logistics|premier-yangue/

export function kindOf(company: Pick<Company, 'id' | 'sector'>): Kind {
  const { id, sector } = company
  if (ORGANIZACAO.test(id)) return 'organizacao'
  if (CONSTRUCAO.test(id)) return 'construcao'
  if (sector === 'justica' && ADVOCACIA.test(id)) return 'advocacia'
  if (sector === 'energia' && ELECTRICIDADE.test(id)) return 'electricidade'
  if (sector === 'transportes' && PORTO.test(id)) return 'porto'
  return KIND_BY_SECTOR[sector]
}

const join = (steps: string[]): string => steps.map((step, index) => `${index + 1}. ${step}`).join(' ')

/** The posts, careers, schools and study of a kind of business, flagged as our reading. */
export function typical(kind: Kind): {
  roles: CompanyRole[]
  careers: string[]
  partners: string[]
  insights: CompanyInsight[]
  estimated: true
} {
  const { posts, partners, hiring, values, tip } = KINDS[kind]
  return {
    roles: posts.map((post) => ({
      title: post.title,
      careers: post.careers,
      requirements: post.requirements,
      path: [`Formação: ${post.requirements[0]}.`, ...hiring],
      ladder: post.ladder,
      estimated: true,
    })),
    careers: [...new Set(posts.flatMap((post) => post.careers))],
    partners,
    insights: [
      { title: 'Como entrar', text: join(hiring), estimated: true },
      { title: 'O que valorizam', text: values, estimated: true },
      { title: 'Dica Kayé', text: tip, estimated: true },
    ],
    estimated: true,
  }
}
