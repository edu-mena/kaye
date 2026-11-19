import type { NewsEvent, NewsItem, Photo, SourceLink } from '../types'

// Events in Angola with talks, networking or room to share ideas, collected on 12 November 2026 from
// the organisers' pages, the ticket sites (Vibra, Môevento, Ticket.ao, Check-in.ao) and the press.
// Prices and times are as published; `unconfirmed` marks what only one secondary source gives.
// Posters are the organisers' own, kept in public/eventos and credited to them.

const REACHED = '2026-11-12'

function poster(file: string, title: string, author: string, url: string): Photo {
  // From the site's root in development, from /spa/ in the Laravel build: like the other public files.
  const src = `${import.meta.env.BASE_URL}eventos/${file}.webp`
  return {
    thumb: src,
    small: src,
    large: src,
    alt: `Cartaz de ${title}`,
    credit: { author, license: 'Cartaz do organizador', url },
  }
}

type EventSeed = {
  id: string
  title: string
  summary: string
  body?: string[]
  event: NewsEvent
  source: SourceLink
  careers?: string[]
  /** File name in public/eventos, without the extension. */
  poster?: string
}

const vibra = (slug: string): SourceLink => ({ label: 'Vibra', url: `https://www.vibra.ao/eventos/${slug}` })
const moevento = (host: string): SourceLink => ({ label: 'Môevento', url: `https://${host}.moevento.com` })

const SEEDS: EventSeed[] = [
  {
    id: 'evento-she-moves-2026',
    title: 'She Moves: mulheres em movimento no Direito',
    summary:
      'Encontro nacional sobre a liderança feminina no Direito, com dois painéis de juristas e directoras jurídicas de bancos e empresas.',
    body: [
      'Um espaço de partilha de experiências, debate e networking para mulheres líderes, profissionais do Direito, estudantes e instituições.',
      'Os painéis juntam advogadas, árbitras e directoras jurídicas da Unitel, do Standard Bank, do BFA Capital Markets e da Refriango.',
    ],
    event: {
      starts: '2026-11-13',
      time: '17h00',
      venue: 'Shopping Talatona (Febracis, 1.º piso)',
      city: 'Luanda',
      formats: ['conferencia', 'networking'],
      free: false,
      price: '5 250 Kz',
      organizer: 'Sapiens Conecta',
      register: vibra('she-moves-2-edicao'),
    },
    source: vibra('she-moves-2-edicao'),
    careers: ['advogado', 'jurista', 'juiz', 'procurador'],
    poster: 'she-moves',
  },
  {
    id: 'evento-batuque-fest-2026',
    title: 'Fest Batuque: Creative Economy Hub',
    summary:
      'Um dia de música, mercado de marcas e criadores angolanos e um hub de economia criativa com painéis e networking.',
    body: [
      'O Creative Economy Hub é o eixo de negócio e conhecimento do festival: financiamento cultural, empreendedorismo e economia criativa.',
    ],
    event: {
      starts: '2026-11-13',
      time: '10h00–21h00',
      venue: 'Palácio de Ferro',
      city: 'Luanda',
      formats: ['palestra', 'networking', 'feira'],
      free: false,
      price: '5 000 Kz',
      organizer: 'Kuzuka-Arts Beats',
      register: { label: 'Ticket.ao', url: 'https://ticket.ao/event/fest-batuque-criative-economy-hub/' },
    },
    source: { label: 'Ticket.ao', url: 'https://ticket.ao/event/fest-batuque-criative-economy-hub/' },
    careers: ['gestor-cultural', 'musico', 'designer-grafico', 'artista-plastico'],
    poster: 'batuque-fest',
  },
  {
    id: 'evento-jovens-que-inspiram-2026',
    title: 'Jovens que Inspiram',
    summary:
      'Profissionais angolanos de referência falam de empreendedorismo, carreira, desenvolvimento pessoal, sector petrolífero e empregabilidade.',
    body: [
      'Um dia de partilha, aprendizagem e conexão. Há um espaço onde as empresas patrocinadoras podem oferecer aos jovens mentoria, formação, programas de capacitação e financiamento.',
      'Bilhetes: Normal 8 000 Kz, VIP 12 000 Kz, VIP Premium 18 000 Kz (com certificado de participação).',
    ],
    event: {
      starts: '2026-11-14',
      time: '09h00',
      venue: 'Centro de Conferências de Belas (CCB), Futungo',
      city: 'Luanda',
      formats: ['conferencia', 'networking'],
      free: false,
      price: '8 000 Kz',
      organizer: 'Mimoos Grupo',
      register: vibra('jovens-que-inspiram'),
    },
    source: vibra('jovens-que-inspiram'),
    careers: ['gestor-de-empresas', 'engenheiro-de-petroleos', 'gestor-de-recursos-humanos'],
    poster: 'jovens-que-inspiram',
  },
  {
    id: 'evento-growth-summit-2026',
    title: 'Growth Summit Angola 2026',
    summary:
      'Conferência empresarial para empresários, gestores e líderes, com oradores de Angola, da Nigéria e da África do Sul.',
    body: [
      'Programa: abertura às 09h00, intervenções de Isaac Cangundo, Sam Enugue e Desidério César, pausa para networking, "Visão 2027" com uma linha de financiamento para empreendedores e keynote de Vusi Thembekwayo. Termina com perguntas abertas aos oradores.',
      'O tema junta fé, propósito e negócios.',
    ],
    event: {
      starts: '2026-11-14',
      time: '07h30–13h30',
      venue: 'Centro de Convenções de Talatona (CCTA)',
      city: 'Luanda',
      formats: ['conferencia', 'networking'],
      free: false,
      register: { label: 'Inscrição', url: 'https://inscricao.growthsummitangola.com' },
    },
    source: { label: 'Growth Summit Angola', url: 'https://growthsummitangola.com/' },
    careers: ['gestor-de-empresas', 'consultor-de-gestao', 'economista'],
    poster: 'growth-summit',
  },
  {
    id: 'evento-gew-angola-2026',
    title: 'Semana Global do Empreendedorismo (GEW Angola)',
    summary:
      'Uma semana de actividades sobre empreendedorismo em Luanda. O vencedor do Startup Challenge Angola 2026 é anunciado durante a semana.',
    body: [
      'A Global Entrepreneurship Week junta todos os anos parceiros de vários países. Em Angola, a agenda de cada dia é publicada na página da GEW Angola.',
    ],
    event: {
      starts: '2026-11-16',
      ends: '2026-11-22',
      venue: 'Vários locais',
      city: 'Luanda',
      formats: ['palestra', 'networking', 'workshop'],
      free: true,
      register: { label: 'GEW Angola no Facebook', url: 'https://www.facebook.com/gewangola/' },
    },
    source: { label: 'allAfrica', url: 'https://allafrica.com/stories/202608250210.html' },
    careers: ['gestor-de-empresas', 'product-manager', 'gestor-de-marketing-digital'],
  },
  {
    id: 'evento-forbes-annual-summit-2026',
    title: 'Forbes África Lusófona Annual Summit 2026',
    summary:
      'Encontro de líderes, empresários e investidores da África lusófona: competitividade, infra-estruturas, investimento e sistema financeiro.',
    event: {
      starts: '2026-11-17',
      venue: 'Hotel de Convenções de Talatona (HCTA)',
      city: 'Luanda',
      formats: ['conferencia', 'networking'],
      free: false,
      organizer: 'Forbes África Lusófona',
      register: {
        label: 'Loja Medianove',
        url: 'https://loja.medianove.com/produto/annual-summit-angola/bilhete-fal-annual-summit-angola-2026/',
      },
    },
    source: {
      label: 'Forbes África Lusófona',
      url: 'https://forbesafricalusofona.com/annual-summit-2026-regressa-a-luanda-a-15-de-outubro/',
    },
    careers: ['economista', 'analista-de-investimentos', 'gestor-de-empresas'],
    poster: 'forbes-annual-summit',
  },
  {
    id: 'evento-fit-turismo-2026',
    title: 'FIT: Fórum Internacional de Turismo (2.ª edição)',
    summary: 'Fórum sobre a ligação entre a banca e o turismo, com o tema "Banca & Turismo".',
    event: {
      starts: '2026-11-20',
      time: '08h00–13h45',
      venue: 'Tendas do Porto de Luanda',
      city: 'Luanda',
      formats: ['conferencia', 'networking'],
      free: false,
      organizer: 'Forbes África Lusófona',
      unconfirmed: true,
    },
    source: { label: 'Forbes África Lusófona', url: 'https://forbesafricalusofona.com/?p=177723' },
    careers: ['tecnico-de-turismo', 'gestor-hoteleiro', 'guia-turistico'],
  },
  {
    id: 'evento-bitur-2026',
    title: 'BITUR 2026: Bolsa Internacional de Turismo de Angola',
    summary:
      'Feira de turismo com operadores de Angola e de outros países: destinos, alojamento e viagens dentro do país.',
    event: {
      starts: '2026-11-20',
      ends: '2026-11-22',
      time: '10h00–18h00',
      venue: 'Tendas do Grupo Arena, Porto de Luanda',
      city: 'Luanda',
      formats: ['feira', 'networking'],
      free: false,
      price: '2 500 Kz (crianças até 12 anos grátis com um adulto)',
      register: { label: 'Check-in.ao', url: 'https://check-in.ao/events/bitur-2026' },
    },
    source: { label: 'Check-in.ao', url: 'https://check-in.ao/events/bitur-2026' },
    careers: ['tecnico-de-turismo', 'guia-turistico', 'gestor-hoteleiro', 'recepcionista-de-hotel'],
    poster: 'bitur',
  },
  {
    id: 'evento-feira-geociencias-2026',
    title: 'Feira de Geociências',
    summary: 'Uma feira dedicada às geociências, no Arquivo Nacional de Angola.',
    event: {
      starts: '2026-11-21',
      venue: 'Arquivo Nacional de Angola',
      city: 'Luanda',
      formats: ['feira'],
      free: false,
      register: moevento('feira-geociencias-2026'),
    },
    source: moevento('feira-geociencias-2026'),
    careers: ['geologo', 'geofisico', 'engenheiro-de-minas', 'topografo'],
  },
  {
    id: 'evento-bonitas-com-proposito-2026',
    title: 'Conferência de Mulheres Bonitas com Propósito',
    summary: 'Uma conferência para mulheres na Baía de Luanda.',
    event: {
      starts: '2026-11-21',
      venue: 'Baía de Luanda',
      city: 'Luanda',
      formats: ['conferencia'],
      free: false,
      register: moevento('bonitas-com-proposito'),
    },
    source: moevento('bonitas-com-proposito'),
  },
  {
    id: 'evento-lucrar-com-ia-2026',
    title: 'Lucrar com Inteligência Artificial na Prática',
    summary:
      'Workshop presencial de cerca de 5 horas: usar IA para vender mais, atender melhor clientes e poupar tempo no negócio.',
    body: [
      'Cinco módulos com demonstrações ao vivo e exercícios guiados: trabalhar melhor com IA, criar conteúdos e campanhas, automatizar o atendimento com um agente de IA, criar soluções digitais e juntar tudo.',
      'Para empreendedores, donos de pequenos negócios, freelancers e quem quer começar um negócio.',
    ],
    event: {
      starts: '2026-11-24',
      time: '10h00',
      venue: 'Academia do Empreendedor de Luanda, Benfica',
      city: 'Luanda',
      formats: ['workshop'],
      free: false,
      price: '23 500 Kz',
      organizer: 'Esteves Francisco',
      register: vibra('lucrar-com-inteligencia-artificial-na-pratica'),
    },
    source: vibra('lucrar-com-inteligencia-artificial-na-pratica'),
    careers: ['gestor-de-marketing-digital', 'gestor-de-redes-sociais', 'cientista-de-dados'],
    poster: 'lucrar-com-ia',
  },
  {
    id: 'evento-digital-summit-2026',
    title: 'Digital Summit Angola 2026',
    summary:
      'A 2.ª edição debate a tecnologia nos sectores estruturantes da economia: energia, infra-estrutura digital e dados, banca e seguros, mobilidade e logística.',
    body: [
      'Para empresas de tecnologia, decisores públicos, líderes empresariais, investidores e especialistas em inovação. A inteligência artificial é uma das prioridades da agenda.',
      'A Women in Tech Angola é parceira comunitária do evento.',
    ],
    event: {
      starts: '2026-11-24',
      ends: '2026-11-25',
      venue: 'Hotel InterContinental Luanda Miramar',
      city: 'Luanda',
      formats: ['conferencia', 'networking'],
      free: false,
      organizer: 'Digital Summit Angola',
      register: { label: 'Digital Summit Angola', url: 'https://digitalsummit.ao/' },
    },
    source: { label: 'Forbes África Lusófona', url: 'https://forbesafricalusofona.com/?p=172821' },
    careers: [
      'gestor-de-ti',
      'engenheiro-de-dados',
      'analista-de-ciberseguranca',
      'engenheiro-de-telecomunicacoes',
    ],
  },
  {
    id: 'evento-forges-2026',
    title: '16.ª Conferência FORGES: gestão do ensino superior',
    summary:
      'Investigadores e instituições de ensino superior dos países de língua portuguesa debatem a gestão das universidades e da investigação científica.',
    body: [
      'A 24 de Novembro há visitas a instituições de ensino superior de Luanda; a conferência decorre de 25 a 27 de Novembro. Pode participar-se presencialmente ou online.',
    ],
    event: {
      starts: '2026-11-24',
      ends: '2026-11-27',
      venue: 'Auditório da Universidade de Luanda',
      city: 'Luanda',
      formats: ['conferencia'],
      free: false,
      organizer: 'FORGES e Universidade de Luanda',
      register: { label: 'FORGES', url: 'https://eventos.aforges.org/inscricoes/' },
    },
    source: { label: 'FORGES', url: 'https://eventos.aforges.org/agenda/16-a-conferencia-forges/' },
    careers: [
      'docente-do-ensino-superior',
      'investigador-cientifico',
      'especialista-de-administracao-da-educacao',
    ],
  },
  {
    id: 'evento-conferencia-minas-2026',
    title: 'Conferência Internacional de Minas de Angola',
    summary:
      '"Minerais que Transformam, Parcerias que Impulsionam": cobre, diamantes, ouro, terras raras e lítio, industrialização local e parcerias.',
    event: {
      starts: '2026-11-26',
      ends: '2026-11-27',
      venue: 'A anunciar',
      city: 'Luanda',
      formats: ['conferencia', 'networking'],
      free: false,
      unconfirmed: true,
    },
    source: {
      label: 'Ver Angola',
      url: 'https://www.verangola.net/va/pt/092026/eventos/50228/Conferência-Internacional-de-Minas-de-Angola-Conferências.htm',
    },
    careers: ['engenheiro-de-minas', 'geologo', 'engenheiro-metalurgico'],
    poster: 'conferencia-minas',
  },
  {
    id: 'evento-wake-up-angola-2026',
    title: 'Wake Up Angola 2026: Feira da Produção Local',
    summary:
      'Feira multissectorial que promove empresas angolanas, empreendedorismo e inovação, em parceria com o INAPEM.',
    body: ['Para expor, as empresas pagam uma taxa de 5 000 Kz pelo letreiro.'],
    event: {
      starts: '2026-11-27',
      ends: '2026-11-29',
      venue: 'Fortaleza de São Miguel',
      city: 'Luanda',
      formats: ['feira', 'networking'],
      free: true,
      organizer: 'Verbo Comunica',
      register: { label: 'Wake Up Angola', url: 'https://wake-up-angola.vercel.app/' },
    },
    source: { label: 'Wake Up Angola', url: 'https://wake-up-angola.vercel.app/' },
    careers: ['gestor-de-empresas', 'gestor-comercial', 'engenheiro-agroalimentar'],
  },
  {
    id: 'evento-improvaveis-2026',
    title: 'Conferência Improváveis 2026',
    summary: 'Uma conferência no Belas Business Park, em Talatona.',
    event: {
      starts: '2026-12-03',
      venue: 'Belas Business Park, Edifício Cuanza Norte, Talatona',
      city: 'Luanda',
      formats: ['conferencia'],
      free: false,
      register: moevento('improvaveis'),
    },
    source: moevento('improvaveis'),
  },
  {
    id: 'evento-faje-2026',
    title: 'FAJE 2026: Fórum Angolano de Jovens Empreendedores',
    summary:
      'O empreendedorismo jovem como motor da inclusão financeira: palestras, apresentação de programas de apoio, networking e prémios.',
    body: [
      'Abre o presidente do INAPEM. Há palestras sobre empreender, pensar global e criar local, e empreendedorismo digital "do código ao mercado".',
      'São apresentados os programas RECRIA, Projecto Envolver, Replica e Diversifica Mais, com contacto directo com os seus representantes, e entregues os prémios FAJE 2026.',
      'Adesão: 10 000 Kz para 1 participante, 15 000 Kz para 2, 20 000 Kz para 3.',
    ],
    event: {
      starts: '2026-12-05',
      time: '08h00–15h00',
      venue: 'Centro de Conferências de Belas (CCB), Luanda Sul',
      city: 'Luanda',
      formats: ['conferencia', 'palestra', 'networking'],
      free: false,
      price: '10 000 Kz',
      organizer: 'Mukonda Eventos',
      register: { label: 'Mukonda Eventos', url: 'https://www.mukondaeventos.com/faje' },
    },
    source: { label: 'Mukonda Eventos', url: 'https://www.mukondaeventos.com/faje' },
    careers: ['gestor-de-empresas', 'product-manager', 'desenvolvedor-full-stack'],
  },
  {
    id: 'evento-desperte-para-a-mudanca-2026',
    title: 'Desperte Para a Mudança: da intenção à execução',
    summary:
      'Para líderes, empreendedores e profissionais: pessoas, processos e negócios preparados para o futuro.',
    event: {
      starts: '2026-12-05',
      time: '14h00',
      venue: 'Auditório do Hotel Skyna, Mutamba',
      city: 'Luanda',
      formats: ['palestra'],
      free: false,
      price: '10 500 Kz',
      organizer: 'DD-Forma',
      register: vibra('desperte-para-a-mudanca-hovqkt'),
    },
    source: vibra('desperte-para-a-mudanca-hovqkt'),
    careers: ['gestor-de-empresas', 'gestor-de-recursos-humanos', 'consultor-de-gestao'],
    poster: 'desperte-para-a-mudanca',
  },
  {
    id: 'evento-forum-negocios-2026',
    title: 'Fórum Negócios e Jantar à Mesa (8.ª edição)',
    summary: 'Fórum de negócios com jantar, para conhecer empresários e fazer contactos.',
    event: {
      starts: '2026-12-06',
      venue: 'Hotel Diamante',
      city: 'Luanda',
      formats: ['networking', 'palestra'],
      free: false,
      register: moevento('marcadeautoridade'),
    },
    source: moevento('marcadeautoridade'),
    careers: ['gestor-de-empresas', 'gestor-comercial'],
  },
  {
    id: 'evento-angola-developer-summit-2026',
    title: 'Angola Developer Summit 2026',
    summary:
      '"Construir em Angola. Competir no Mundo." Palestras técnicas de programação, IA, infra-estrutura e cloud, painéis, networking e um hackathon.',
    body: [
      'Para programadores, engenheiros de software, especialistas em IA, CTOs, fundadores e estudantes.',
      'Bilhetes: Easy Pass 10 000 Kz (conferência), Early Bird 15 000 Kz (e uma possível vaga no hackathon), Developer Pass 35 000 Kz (com kit, coffee break e sessões de networking).',
    ],
    event: {
      starts: '2026-12-12',
      time: '08h00–17h00',
      venue: 'Parque Tecnológico da Huawei, Talatona',
      city: 'Luanda',
      formats: ['conferencia', 'hackathon', 'networking'],
      free: false,
      price: '10 000 Kz',
      organizer: 'Twala Technology',
      register: vibra('angola-developer-summit-2026'),
    },
    source: vibra('angola-developer-summit-2026'),
    careers: [
      'desenvolvedor-backend',
      'desenvolvedor-frontend',
      'desenvolvedor-full-stack',
      'engenheiro-devops',
      'cientista-de-dados',
    ],
    poster: 'angola-developer-summit',
  },
  {
    id: 'evento-devfest-luanda-2026',
    title: 'DevFest Luanda 2026: Build, Secure, Scale',
    summary:
      'O DevFest do GDG Luanda: criar, proteger e escalar aplicações na era dos agentes de IA, com oradores e networking com programadores locais.',
    event: {
      starts: '2026-12-12',
      venue: 'ENAPP, Rua da Samba, Corimba',
      city: 'Luanda',
      formats: ['conferencia', 'workshop', 'networking'],
      free: false,
      organizer: 'GDG Luanda',
      register: { label: 'Edukangola', url: 'https://www.edukangola.com/eventos/devfest-2026' },
    },
    source: {
      label: 'GDG Luanda',
      url: 'https://gdg.community.dev/events/details/google-gdg-luanda-presents-devfest-luanda-build-secure-scale',
    },
    careers: [
      'desenvolvedor-mobile',
      'desenvolvedor-backend',
      'analista-de-ciberseguranca',
      'engenheiro-devops',
    ],
  },
  {
    id: 'evento-experiencias-oportunidades-2026',
    title: 'Experiências que transformam oportunidades em resultados',
    summary:
      'Conferência para contactar directamente com empresários, gestores e directores de grandes empresas.',
    event: {
      starts: '2026-12-12',
      time: '10h00',
      venue: 'Auditório do Complexo Escolar Santo Agostinho da Juventude, Samba',
      city: 'Luanda',
      formats: ['conferencia', 'networking'],
      free: false,
      price: '5 000 Kz',
      organizer: 'Miguel Morais Canda',
      register: vibra('experiencias-que-transformam-oportunidades-em-resultados'),
    },
    source: vibra('experiencias-que-transformam-oportunidades-em-resultados'),
    careers: ['gestor-de-empresas', 'gestor-comercial'],
    poster: 'experiencias-oportunidades',
  },
  {
    id: 'evento-infertilidade-2026',
    title: 'Infertilidade & Medicina Reprodutiva',
    summary:
      'Um encontro sobre infertilidade e medicina reprodutiva, em Talatona (local exacto a confirmar).',
    event: {
      starts: '2026-12-12',
      venue: 'Talatona (a confirmar)',
      city: 'Luanda',
      formats: ['conferencia'],
      free: false,
      register: moevento('maat-tondo'),
    },
    source: moevento('maat-tondo'),
    careers: ['medico-ginecologista-obstetra', 'enfermeiro', 'parteira'],
  },
  {
    id: 'evento-jovens-contabilistas-2027',
    title: 'Conferência Nacional de Jovens Contabilistas (4.ª edição especial)',
    summary: 'A conferência nacional dos jovens contabilistas, no Centro de Conferências de Belas.',
    event: {
      starts: '2027-02-20',
      venue: 'Centro de Conferências de Belas (CCB)',
      city: 'Luanda',
      formats: ['conferencia', 'networking'],
      free: false,
      register: moevento('conferencia-nacional-de-jovens-contabilista-4-edicao'),
    },
    source: moevento('conferencia-nacional-de-jovens-contabilista-4-edicao'),
    careers: ['contabilista', 'tecnico-de-contabilidade', 'auditor'],
  },
]

// `seed` is a fresh object from the rest pattern, so filling it in place changes nothing shared.
export const EVENTS: NewsItem[] = SEEDS.map(({ poster: file, ...seed }) =>
  Object.assign(
    seed,
    { date: REACHED, kind: 'eventos' as const },
    file
      ? { image: poster(file, seed.title, seed.event.organizer ?? seed.source.label, seed.source.url) }
      : {},
  ),
)
