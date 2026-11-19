import type { Career, PathwayStep } from '../types'
import { graduate, technician, therapyGuide } from './diagnosisTherapyCareer'
import { degree, healthGuide, SECONDARY, stateMarket } from './healthGuideParts'

// The full guides of the pharmacy careers (the Farmácia group). The pharmacist and the pharmacy technician are in the
// diagnosis and therapy career (diagnosisTherapyCareer.ts); the private sector, from the licensing rules: every
// pharmacy, distributor and importer needs the authorisation of the medicines agency (ARMED) and a technical director
// declared by the Ordem dos Farmacêuticos (Decreto Presidencial n.º 41/24). The students of each degree: MESCTI,
// Anuário Estatístico do Ensino Superior 2023-2024. The medical sales rep has no State table and no job ads.

const LICENSING = {
  label: 'Decreto Presidencial n.º 41/24: o licenciamento da actividade farmacêutica (AngoLEX)',
  url: 'https://angolex.com/paginas/decreto-presidencial/regulamento-sobre-o-licenciamento-para-o-exercicio-da-actividade-farmaceutica.html',
}

const PHARMACIES = [
  'Farmácias',
  'Hospitais públicos e privados',
  'Distribuidores e importadores de medicamentos',
]

const ORDER: PathwayStep = {
  kind: 'certificacao',
  title: 'Inscrição na Ordem dos Farmacêuticos de Angola',
  need: 'essencial',
  certificate: 'exigido',
  description: 'É a Ordem que declara o Director Técnico de cada farmácia, distribuidor e importador.',
  months: null,
}

export const PHARMACY_GUIDES: Career[] = [
  therapyGuide({
    slug: 'farmaceutico',
    demand: 'media',
    description:
      'Garante que os medicamentos são os certos, seguros e bem usados: confere as receitas, aconselha os doentes, controla o stock e a validade e, nos hospitais, prepara medicamentos e acompanha os tratamentos. Trabalha em farmácias, hospitais, distribuidores e importadores de medicamentos e na agência reguladora. Cada farmácia, distribuidor e importador precisa de um Director Técnico declarado pela Ordem dos Farmacêuticos. No ano lectivo 2023/24 havia 2 743 estudantes em Ciências Farmacêuticas.',
    dayToDay: [
      'Conferir as receitas e aconselhar os doentes',
      'Controlar o stock, a validade e a conservação dos medicamentos',
      'Preparar medicamentos na farmácia do hospital',
      'Comunicar as reacções adversas à farmacovigilância',
      'Responder pela farmácia como Director Técnico',
    ],
    workContext: [
      { label: 'Ambiente', value: 'Farmácias, hospitais, armazéns e laboratórios' },
      { label: 'Horário', value: '34 horas por semana no Estado; turnos e fins de semana nas farmácias' },
      { label: 'Equipa', value: 'Técnicos de farmácia, médicos e enfermeiros' },
      { label: 'Responsabilidade', value: 'O Director Técnico responde pelo estabelecimento' },
    ],
    workStyles: [
      'Rigor',
      'Atenção ao detalhe',
      'Falar com o público',
      'Organização',
      'Ética e responsabilidade',
    ],
    skills: [
      { id: 'dispensa-medicamentos', name: 'Dispensa e aconselhamento', importance: 'essencial' },
      { id: 'farmacologia', name: 'Farmacologia', importance: 'essencial' },
      { id: 'gestao-stock', name: 'Gestão de stock e conservação', importance: 'essencial' },
      { id: 'farmacovigilancia', name: 'Farmacovigilância', importance: 'essencial' },
      { id: 'legislacao-farmaceutica', name: 'Legislação farmacêutica', importance: 'essencial' },
      { id: 'ingles-cientifico', name: 'Inglês científico', importance: 'opcional' },
    ],
    pathways: [
      graduate('Ciências Farmacêuticas'),
      {
        id: 'director-tecnico',
        name: 'Director Técnico no privado',
        summary:
          'Com a licenciatura e a Ordem, podes dirigir uma farmácia, um distribuidor ou um importador.',
        steps: [
          SECONDARY,
          degree('Ciências Farmacêuticas'),
          ORDER,
          {
            kind: 'experiencia',
            title: 'Director Técnico de um estabelecimento farmacêutico',
            need: 'essencial',
            description:
              'A agência reguladora só autoriza a farmácia, o distribuidor ou o importador com a identificação e a formação do Director Técnico e a declaração da Ordem.',
            months: null,
          },
        ],
        totalCost: null,
      },
    ],
    hiring: [...PHARMACIES, 'Agência Reguladora de Medicamentos e CECOMA'],
    note: {
      text: 'Cada farmácia, distribuidor ou importador de medicamentos só abre com autorização da agência reguladora e com um Director Técnico declarado pela Ordem dos Farmacêuticos (Decreto Presidencial n.º 41/24). No Estado, os farmacêuticos entram por concurso na carreira de diagnóstico e terapêutica, que abriu 588 vagas de Técnico Superior nos hospitais centrais em 2026.',
      source: LICENSING,
    },
  }),
  therapyGuide({
    slug: 'tecnico-farmacia',
    demand: 'media',
    level: 'technician',
    description:
      'Prepara e entrega os medicamentos, explica às pessoas como os tomar e ajuda o farmacêutico a controlar o stock. Trabalha em farmácias, hospitais e armazéns de medicamentos. Forma-se no curso médio de Farmácia, que não foi suspenso em 2025; com a licenciatura em Farmácia entra-se no Estado como Técnico Superior.',
    dayToDay: [
      'Atender ao balcão e entregar os medicamentos receitados',
      'Explicar a dose e os cuidados de cada medicamento',
      'Receber as encomendas e arrumar o stock',
      'Controlar as validades e as temperaturas',
      'Preparar os pedidos dos serviços do hospital',
    ],
    workContext: [
      { label: 'Ambiente', value: 'Farmácias, farmácias de hospital e armazéns' },
      { label: 'Horário', value: '34 horas por semana no Estado; turnos e fins de semana nas farmácias' },
      { label: 'Equipa', value: 'Farmacêuticos e outros técnicos' },
      { label: 'Público', value: 'Atendimento a muitas pessoas por dia' },
    ],
    workStyles: ['Simpatia no atendimento', 'Rigor', 'Organização', 'Atenção ao detalhe', 'Honestidade'],
    skills: [
      { id: 'dispensa-medicamentos', name: 'Dispensa e aconselhamento', importance: 'essencial' },
      { id: 'gestao-stock', name: 'Gestão de stock e conservação', importance: 'essencial' },
      { id: 'atendimento-publico', name: 'Atendimento ao público', importance: 'essencial' },
      { id: 'calculo-doses', name: 'Cálculo de doses', importance: 'essencial' },
      { id: 'sistemas-farmacia', name: 'Sistemas informáticos de farmácia', importance: 'opcional' },
    ],
    pathways: [technician('Farmácia'), graduate('Farmácia')],
    hiring: PHARMACIES,
  }),
  healthGuide({
    slug: 'delegado-informacao-medica',
    description:
      'Apresenta os medicamentos e os equipamentos de uma empresa a médicos, farmácias e hospitais, explica para que servem e como se usam e acompanha as encomendas. Trabalha para laboratórios farmacêuticos, importadores e distribuidores. Não é uma carreira do Estado; uma formação em saúde ajuda a falar com os médicos.',
    dayToDay: [
      'Visitar médicos, farmácias e hospitais',
      'Apresentar os produtos e responder a perguntas técnicas',
      'Deixar amostras e material informativo',
      'Registar as visitas e as encomendas',
      'Cumprir objectivos de visitas e de vendas',
    ],
    workContext: [
      { label: 'Ambiente', value: 'Na rua, em consultórios, farmácias e hospitais' },
      { label: 'Horário', value: 'De dia, com muitas deslocações' },
      { label: 'Equipa', value: 'Um supervisor e outros delegados' },
      { label: 'Objectivos', value: 'Metas de visitas e de vendas' },
    ],
    workStyles: [
      'Gostar de falar com pessoas',
      'Persistência',
      'Organização',
      'Aprender sobre medicamentos',
      'Boa apresentação',
    ],
    skills: [
      { id: 'farmacologia', name: 'Farmacologia', importance: 'essencial' },
      { id: 'apresentacao', name: 'Comunicação e apresentação', importance: 'essencial' },
      { id: 'negociacao', name: 'Negociação', importance: 'essencial' },
      { id: 'carteira-clientes', name: 'Gestão de uma carteira de clientes', importance: 'essencial' },
      { id: 'carta-conducao', name: 'Carta de condução', importance: 'opcional' },
    ],
    pathways: [
      {
        id: 'empresa',
        name: 'Formação em saúde e entrada numa empresa',
        summary: 'Não há um curso próprio: a formação em saúde ajuda, e a empresa ensina os seus produtos.',
        steps: [
          SECONDARY,
          {
            ...degree('Ciências Farmacêuticas, Enfermagem ou outra área de saúde'),
            need: 'recomendado',
          },
          {
            kind: 'experiencia',
            title: 'Emprego num laboratório, importador ou distribuidor',
            need: 'essencial',
            description: 'A empresa forma o delegado nos seus produtos antes das primeiras visitas.',
            months: null,
          },
        ],
        totalCost: null,
      },
    ],
    stages: [
      {
        level: 'junior',
        title: 'Delegado de Informação Médica',
        years: { min: 0, max: 3 },
        responsibilities: ['Visita os médicos e as farmácias da sua zona', 'Aprende os produtos da empresa'],
      },
      {
        level: 'pleno',
        title: 'Delegado sénior',
        years: { min: 3, max: 6 },
        responsibilities: ['Tem os clientes mais importantes', 'Ajuda os delegados novos'],
      },
      {
        level: 'senior',
        title: 'Supervisor ou gestor de produto',
        years: { min: 6, max: null },
        responsibilities: ['Coordena uma equipa ou uma linha de produtos', 'Planeia as vendas de uma região'],
      },
    ],
    market: stateMarket(
      'media',
      [],
      {
        text: 'Não há tabela do Estado nem anúncios que mostrem a procura: nos últimos 12 meses, os sites de emprego não publicaram nenhum. Os delegados trabalham para laboratórios, importadores e distribuidores, que só funcionam com autorização da agência reguladora e um Director Técnico (Decreto Presidencial n.º 41/24).',
        source: LICENSING,
      },
      [
        'Laboratórios farmacêuticos',
        'Importadores e distribuidores de medicamentos',
        'Empresas de equipamento médico',
      ],
    ),
    cvGuide: {
      template: 'classico',
      include: [
        'A formação em saúde e os cursos sobre medicamentos',
        'Resultados de vendas, com números',
        'A carta de condução, se a tiveres',
        'Línguas',
      ],
      avoid: [
        'Fotografias e dados pessoais que a candidatura não pede',
        'Objectivos vagos, sem números',
        'Erros de ortografia',
      ],
    },
  }),
]
