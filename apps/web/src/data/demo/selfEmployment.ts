import type { SelfEmployment } from '../types'

/*
 * Working on one's own in each career, in Angola: editorial and estimated (plausible, not from a survey), so every
 * entry carries `estimated: true` (docs/recolha-de-dados.md, "O que falta"). Careers where it is rare (State
 * careers, offshore crews, hospital-only specialities) have no entry. The programmes are in supportPrograms.ts.
 */

type Kind = 'consult' | 'digital' | 'trade' | 'clinic' | 'tutor' | 'creative' | 'business' | 'agro'

const REGISTER =
  'Registar-te como empresário em nome individual ou sociedade unipessoal no GUE (online ou num balcão).'
const TAX = 'Pedir o NIF da actividade na AGT e passar factura ou recibo a cada cliente.'
const SOCIAL =
  'Inscrever-te no INSS como trabalhador por conta própria e, quando contratares, inscrever os trabalhadores.'
const PREMISES = 'Pedir a licença de actividade e o alvará do espaço na Administração Municipal.'

const BASE: Record<
  Kind,
  { cost: [number, number]; steps: string[]; formalise: string[]; programs: string[] }
> = {
  consult: {
    cost: [150_000, 800_000],
    steps: [
      'Ganha 2 a 3 anos de experiência numa empresa: os primeiros clientes vêm de quem já te conhece.',
      'Escolhe um serviço concreto e dá-lhe um preço fechado.',
      'Faz o primeiro trabalho a um cliente da tua rede e pede-lhe uma recomendação.',
    ],
    formalise: [REGISTER, TAX, SOCIAL],
    programs: ['gue', 'inapem', 'empodera-ela'],
  },
  digital: {
    cost: [250_000, 1_200_000],
    steps: [
      'Junta um portefólio com 3 trabalhos, mesmo que sejam projectos teus.',
      'Cria perfil no LinkedIn e numa plataforma como Upwork ou Fiverr.',
      'Começa com pequenos negócios do teu bairro e pede-lhes uma recomendação.',
    ],
    formalise: [REGISTER, TAX, SOCIAL],
    programs: [
      'gue',
      'orange-corners-acelera',
      'orange-corners-fundo',
      'sonajovem-spacium',
      'facra',
      'inapem',
    ],
  },
  trade: {
    cost: [300_000, 2_500_000],
    steps: [
      'Tira o curso profissional e o certificado (INEFOP ou escola técnica).',
      'Junta o kit de ferramentas: o JOBE do INEFOP entrega kits a quem acaba a formação.',
      'Trabalha primeiro em obras e casas do bairro e guarda o contacto de cada cliente.',
    ],
    formalise: [REGISTER, TAX, PREMISES],
    programs: ['jobe-inefop', 'gue', 'orange-corners-fundo', 'inapem'],
  },
  clinic: {
    cost: [3_000_000, 30_000_000],
    steps: [
      'Ganha experiência num hospital ou clínica e inscreve-te na tua ordem profissional.',
      'Começa a dar consultas ou sessões em clínicas privadas, à percentagem.',
      'Junta sócios para partilhar o espaço, o equipamento e a licença.',
    ],
    formalise: [
      'Licenciar a unidade de saúde (consultório ou clínica) no Ministério da Saúde.',
      REGISTER,
      TAX,
      SOCIAL,
    ],
    programs: ['gue', 'inapem', 'empodera-ela'],
  },
  tutor: {
    cost: [20_000, 200_000],
    steps: [
      'Começa com 2 ou 3 alunos do bairro ou da igreja, em casa ou online.',
      'Junta alunos em grupos pequenos e cobra por mês.',
      'Mostra os resultados nos exames: é o que traz alunos novos.',
    ],
    formalise: [REGISTER, TAX],
    programs: ['gue', 'inapem'],
  },
  creative: {
    cost: [100_000, 1_500_000],
    steps: [
      'Mostra o teu trabalho nas redes sociais e em feiras, todas as semanas.',
      'Diz que sim a trabalhos pequenos (eventos, encomendas) para ganhar contactos.',
      'Faz uma tabela de preços e pede sempre um sinal antes de começar.',
    ],
    formalise: [REGISTER, TAX, SOCIAL],
    programs: ['gue', 'orange-corners-acelera', 'orange-corners-fundo', 'inapem'],
  },
  business: {
    cost: [1_000_000, 15_000_000],
    steps: [
      'Aprende o negócio a trabalhar num igual: compras, stock, pessoal e preços.',
      'Faz um plano simples: quanto custa abrir, quanto vendes por dia e quando recuperas o dinheiro.',
      'Começa pequeno (encomendas, banca, loja partilhada) antes de alugar um espaço.',
    ],
    formalise: [REGISTER, TAX, PREMISES, SOCIAL],
    programs: ['gue', 'inapem', 'empodera-ela', 'orange-corners-fundo', 'facra', 'jobe-inefop'],
  },
  agro: {
    cost: [500_000, 10_000_000],
    steps: [
      'Começa num terreno pequeno, alugado ou da família, perto de Luanda (Icolo e Bengo, Bengo).',
      'Garante a água e um comprador (mercado, restaurante, supermercado) antes de plantar ou criar.',
      'Junta-te a uma cooperativa para comprar sementes e rações mais baratas.',
    ],
    formalise: [
      REGISTER,
      TAX,
      'Registar a exploração e, se venderes a lojas, o produto, na Direcção Provincial da Agricultura.',
    ],
    programs: ['gue', 'jobe-inefop', 'orange-corners-fundo', 'inapem', 'empodera-ela'],
  },
}

type Options = {
  cost?: [number, number]
  /** Steps that replace the kind's first one. */
  steps?: string[]
  /** Licences and registrations that come before the kind's. */
  licence?: string[]
  programs?: string[]
}

function entry(kind: Kind, fit: SelfEmployment['fit'], how: string, options: Options = {}): SelfEmployment {
  const base = BASE[kind]
  const [min, max] = options.cost ?? base.cost
  return {
    fit,
    how,
    startCost: { min, max, estimated: true },
    firstSteps: options.steps ? [...options.steps, ...base.steps.slice(options.steps.length)] : base.steps,
    formalise: [...(options.licence ?? []), ...base.formalise],
    programIds: options.programs ?? base.programs,
    estimated: true,
  }
}

const ORDER = (name: string) => `Inscrever-te na ${name}, sem a qual não podes exercer.`
const ENGINEERS = ORDER('Ordem dos Engenheiros de Angola')
const DOCTORS = ORDER('Ordem dos Médicos de Angola')
const NURSES = ORDER('Ordem dos Enfermeiros de Angola')

const MEDICINE_STEPS = [
  'Termina o internato e a especialidade e inscreve-te na Ordem dos Médicos.',
  'Começa a dar consultas em clínicas privadas, à percentagem, ao lado do hospital.',
]

const medicine = (speciality: string, fit: SelfEmployment['fit'], how?: string) =>
  entry(
    'clinic',
    fit,
    how ??
      `Consultas de ${speciality} em clínicas privadas e, com sócios, consultório próprio, quase sempre ao lado do lugar no hospital público.`,
    { steps: MEDICINE_STEPS, licence: [DOCTORS], cost: [5_000_000, 40_000_000] },
  )

const lessons = (subject: string, fit: SelfEmployment['fit']) =>
  entry(
    'tutor',
    fit,
    `Explicações de ${subject} a alunos do ensino secundário e preparação para os exames de acesso, em casa, em grupo ou online. Muitos professores fazem-no ao lado da escola.`,
  )

export const SELF_EMPLOYMENT: Record<string, SelfEmployment> = {
  // Administração pública, direito
  'tecnico-de-contratacao-publica': entry(
    'consult',
    'possivel',
    'Consultoria a empresas que concorrem a concursos públicos: preparar propostas e documentos e cumprir a Lei dos Contratos Públicos.',
  ),
  advogado: entry(
    'consult',
    'comum',
    'Muitos advogados abrem escritório próprio ou em sociedade com colegas, depois do estágio na Ordem. Os clientes chegam por recomendação: famílias, pequenas empresas e casos laborais.',
    {
      cost: [1_000_000, 6_000_000],
      steps: ['Faz o estágio e inscreve-te na Ordem dos Advogados; trabalha uns anos num escritório.'],
      licence: [
        ORDER('Ordem dos Advogados de Angola'),
        'Registar a sociedade de advogados na Ordem, se te juntares a colegas.',
      ],
    },
  ),
  jurista: entry(
    'consult',
    'possivel',
    'Consultoria jurídica a pequenas empresas: contratos, registos e questões laborais. Sem inscrição na Ordem dos Advogados não podes representar clientes em tribunal.',
  ),
  'mediador-de-conflitos': entry(
    'consult',
    'comum',
    'Mediadores trabalham por conta própria ou em centros de mediação e arbitragem, e cobram por sessão. Os casos vêm de empresas, famílias e vizinhos.',
    {
      licence: [
        'Confirmar no Ministério da Justiça se precisas de estar inscrito num centro de mediação reconhecido.',
      ],
    },
  ),

  // Agricultura, ambiente
  'engenheiro-agroalimentar': entry(
    'agro',
    'possivel',
    'Pequenas unidades de transformação (sumos, farinhas, conservas, padaria) ou consultoria de qualidade a produtores que querem vender a supermercados.',
    { cost: [2_000_000, 15_000_000] },
  ),
  'engenheiro-agronomo': entry(
    'agro',
    'comum',
    'Consultoria a fazendas, produção própria em terreno alugado, ou venda de sementes e adubos com aconselhamento técnico.',
  ),
  'engenheiro-florestal': entry(
    'agro',
    'possivel',
    'Viveiros de plantas, inventários florestais para projectos e consultoria ambiental a madeireiras.',
  ),
  'gestor-de-empresas-agricolas': entry(
    'agro',
    'comum',
    'Gerir a própria exploração (hortícolas, aves, cabritos) ou prestar serviços de gestão a fazendeiros que vivem na cidade.',
  ),
  'tecnico-agropecuario': entry(
    'agro',
    'comum',
    'Hortas em Icolo e Bengo e na periferia de Luanda, criação de galinhas e porcos, ou assistência técnica a cooperativas.',
    { cost: [300_000, 5_000_000] },
  ),
  'engenheiro-do-ambiente': entry(
    'consult',
    'possivel',
    'Estudos de impacte ambiental e planos de gestão de resíduos para obras e fábricas, muitas vezes em parceria com consultoras maiores.',
    { licence: [ENGINEERS] },
  ),
  'tecnico-de-ambiente': entry(
    'business',
    'possivel',
    'Recolha e venda de recicláveis (plástico, metal, papelão) e gestão de resíduos para condomínios e empresas.',
    { cost: [500_000, 5_000_000] },
  ),

  // Arquitectura
  arquitecto: entry(
    'consult',
    'comum',
    'Ateliê próprio, sozinho ou com colegas: projectos de moradias, remodelações e licenciamento de obras nas administrações municipais.',
    { cost: [500_000, 3_000_000], licence: [ORDER('Ordem dos Arquitectos de Angola')] },
  ),
  'desenhador-projectista': entry(
    'digital',
    'comum',
    'Desenhos técnicos em AutoCAD e Revit, à peça, para arquitectos, engenheiros e particulares que precisam de licenciar obras.',
  ),
  urbanista: entry(
    'consult',
    'possivel',
    'Consultoria em planos de pormenor e loteamentos, quase sempre como subcontratado de ateliês ou consultoras.',
  ),

  // Artes
  actor: entry(
    'creative',
    'comum',
    'A maioria trabalha por projecto: teatro, novelas, publicidade, dobragens e animação de eventos. Junta vários trabalhos e uma boa agenda de contactos.',
    { cost: [50_000, 500_000] },
  ),
  'artista-plastico': entry(
    'creative',
    'comum',
    'Venda de obras em feiras, galerias e redes sociais, encomendas de murais e retratos, e oficinas para crianças.',
  ),
  'designer-de-moda': entry(
    'creative',
    'comum',
    'Ateliê de costura por medida e coleções pequenas com tecidos africanos, vendidas no Instagram e em feiras.',
    {
      cost: [300_000, 3_000_000],
      programs: ['jobe-inefop', 'gue', 'empodera-ela', 'orange-corners-fundo', 'inapem'],
    },
  ),
  'gestor-cultural': entry(
    'consult',
    'possivel',
    'Produção de eventos, festivais e espectáculos, e gestão da carreira de artistas.',
  ),
  musico: entry(
    'creative',
    'comum',
    'Actuações em casamentos, bares e festas, aulas de instrumento, gravações em estúdio e venda nas plataformas digitais.',
  ),
  realizador: entry(
    'creative',
    'comum',
    'Produtora pequena: vídeos para empresas, casamentos, videoclipes e documentários. Os filmes próprios vêm depois.',
    { cost: [800_000, 5_000_000] },
  ),

  // Banca e seguros
  'analista-de-credito': entry(
    'consult',
    'possivel',
    'Ajudar pequenas empresas a preparar o processo de crédito para o banco: plano de negócio, contas e garantias.',
  ),
  'mediador-de-seguros': entry(
    'consult',
    'comum',
    'Os mediadores trabalham por conta própria e ganham comissão pelos seguros que vendem (automóvel, saúde, vida).',
    {
      licence: [
        'Registar-te como mediador na ARSEG (Agência Angolana de Regulação e Supervisão de Seguros).',
      ],
    },
  ),
  'tecnico-de-seguros': entry(
    'consult',
    'possivel',
    'Com experiência numa seguradora, podes passar a mediador: vender e gerir apólices de vários clientes, por comissão.',
    { licence: ['Registar-te como mediador na ARSEG.'] },
  ),

  // Ciências
  estatistico: entry(
    'consult',
    'possivel',
    'Análise de dados e inquéritos para ONG, estudantes de mestrado e empresas; muitos fazem-no à peça, ao lado do emprego.',
  ),
  fisico: entry(
    'tutor',
    'possivel',
    'Explicações de Física e Matemática e preparação para os exames de acesso às engenharias.',
  ),
  matematico: entry(
    'tutor',
    'possivel',
    'Explicações e preparação para os exames de acesso, e análise quantitativa à peça para empresas.',
  ),
  quimico: entry(
    'business',
    'possivel',
    'Pequena produção licenciada de sabão, detergentes ou cosméticos, ou análises de controlo de qualidade para fábricas.',
    { cost: [500_000, 4_000_000] },
  ),
  antropologo: entry(
    'consult',
    'possivel',
    'Estudos para ONG e projectos de desenvolvimento (consultas a comunidades, avaliações), contratado por projecto.',
  ),
  'assistente-social': entry(
    'consult',
    'possivel',
    'Projectos próprios numa associação ou ONG (idosos, crianças, famílias), financiados por doadores.',
  ),
  'investigador-em-ciencias-sociais': entry(
    'consult',
    'possivel',
    'Consultor independente para ONG e agências internacionais: inquéritos, entrevistas e relatórios de avaliação.',
  ),
  sociologo: entry(
    'consult',
    'possivel',
    'Inquéritos, avaliações de projectos e estudos de mercado para ONG e empresas, como consultor independente.',
  ),
  'tecnico-de-salvaguardas-sociais': entry(
    'consult',
    'possivel',
    'Consultor independente em planos de reassentamento e relação com comunidades, para projectos financiados por bancos de desenvolvimento.',
  ),
  biotecnologo: entry(
    'agro',
    'possivel',
    'Pequena produção (cogumelos, biofertilizantes, mudas in vitro) ou serviços de laboratório a produtores.',
  ),
  biologo: entry(
    'consult',
    'possivel',
    'Levantamentos de fauna e flora para estudos de impacte ambiental, contratado à peça por consultoras.',
  ),
  'tecnico-de-conservacao-da-natureza': entry(
    'creative',
    'possivel',
    'Ecoturismo e guias de natureza, viveiros e projectos com comunidades financiados por ONG.',
  ),
  'tecnico-de-recursos-hidricos': entry(
    'trade',
    'possivel',
    'Furos de água e sistemas de rega e de captação para fazendas, condomínios e comunidades.',
    { cost: [2_000_000, 15_000_000] },
  ),
  'tecnico-de-qualidade-alimentar': entry(
    'consult',
    'possivel',
    'Consultoria em boas práticas de higiene, HACCP e rotulagem para restaurantes, padarias e pequenas fábricas.',
  ),

  // Comercial, marketing, comunicação
  'gestor-comercial': entry(
    'consult',
    'possivel',
    'Representação comercial de marcas, por comissão, ou distribuição própria depois de conhecer bem o mercado.',
  ),
  'gestor-de-loja': entry(
    'business',
    'possivel',
    'Abrir a própria loja (roupa, telemóveis, mercearia) depois de aprender a gerir stock e pessoal numa loja de outros.',
  ),
  'gestor-de-marketing': entry(
    'digital',
    'possivel',
    'Consultor ou agência pequena: estratégia, campanhas e redes sociais para pequenas e médias empresas.',
  ),
  'tecnico-comercial': entry(
    'business',
    'comum',
    'Revenda de produtos (cosméticos, peças, comida) com margem, no bairro, no WhatsApp e no Instagram: muitos começam assim.',
    { cost: [100_000, 1_000_000] },
  ),
  'tecnico-de-comercio-internacional': entry(
    'consult',
    'possivel',
    'Importação de pequenos lotes, ou apoio a quem importa: fornecedores, documentos e despacho.',
  ),
  'assessor-de-comunicacao': entry(
    'consult',
    'possivel',
    'Assessoria de imprensa e comunicação para figuras públicas, eventos e pequenas empresas, como freelancer ou agência pequena.',
  ),
  'editor-de-video': entry(
    'digital',
    'comum',
    'Edição à peça para criadores de conteúdo, empresas, igrejas e casamentos; o portefólio no YouTube e no Instagram traz clientes.',
    { cost: [400_000, 2_000_000] },
  ),
  'gestor-de-redes-sociais': entry(
    'digital',
    'comum',
    'Gestão das páginas de pequenas empresas por mensalidade: publicações, anúncios pagos e resposta aos clientes.',
    { cost: [150_000, 800_000] },
  ),
  jornalista: entry(
    'creative',
    'possivel',
    'Freelancer para meios nacionais e estrangeiros, ou projecto próprio: podcast, canal no YouTube ou newsletter.',
  ),
  'tecnico-de-relacoes-publicas': entry(
    'consult',
    'possivel',
    'Organização de eventos e lançamentos, e relação com a imprensa para marcas, como freelancer.',
  ),

  // Construção civil
  'engenheiro-civil': entry(
    'business',
    'comum',
    'Empresa pequena de projecto e fiscalização, ou de construção de moradias e remodelações. O alvará de construção define o tamanho das obras a que podes concorrer.',
    {
      cost: [2_000_000, 20_000_000],
      steps: ['Trabalha uns anos numa construtora e inscreve-te na Ordem dos Engenheiros.'],
      licence: [
        ENGINEERS,
        'Pedir o alvará de construção no organismo que regula a construção civil (IRCCOP).',
      ],
    },
  ),
  'engenheiro-hidraulico': entry(
    'consult',
    'possivel',
    'Projectos e instalação de redes de água, esgotos e furos para condomínios e obras.',
    { licence: [ENGINEERS] },
  ),
  'medidor-orcamentista': entry(
    'consult',
    'comum',
    'Medições e orçamentos à peça para empreiteiros e particulares, a partir do projecto.',
  ),
  topografo: entry(
    'trade',
    'comum',
    'Levantamentos topográficos de terrenos para registos, loteamentos e obras. O maior custo é o equipamento (estação total, GPS).',
    { cost: [3_000_000, 15_000_000] },
  ),
  'tecnico-de-obras': entry(
    'trade',
    'comum',
    'Pequeno empreiteiro: remodelações, moradias e acabamentos, com uma equipa de pedreiros contratada por obra.',
    { cost: [500_000, 5_000_000] },
  ),

  // Contabilidade, finanças
  auditor: entry(
    'consult',
    'possivel',
    'Com anos numa auditora e o título de perito contabilista, podes abrir uma sociedade de auditoria pequena.',
    { licence: [ORDER('Ordem dos Contabilistas e Peritos Contabilistas de Angola (OCPCA)')] },
  ),
  contabilista: entry(
    'consult',
    'comum',
    'Gabinete de contabilidade para pequenas empresas, por avença mensal: contas, IVA, salários e declarações à AGT.',
    {
      cost: [500_000, 3_000_000],
      licence: [ORDER('Ordem dos Contabilistas e Peritos Contabilistas de Angola (OCPCA)')],
    },
  ),
  'tecnico-de-contabilidade': entry(
    'consult',
    'comum',
    'Contabilidade e declarações fiscais de pequenos negócios e cantinas, por mensalidade, muitas vezes ao lado do emprego.',
  ),
  'tecnico-de-impostos': entry(
    'consult',
    'possivel',
    'Ajudar pequenas empresas com o IVA, as declarações e o Portal do Contribuinte da AGT.',
  ),
  'analista-financeiro': entry(
    'consult',
    'possivel',
    'Planos de negócio, avaliação de empresas e modelos financeiros para empreendedores e pequenas empresas.',
  ),
  'controller-de-gestao': entry(
    'consult',
    'possivel',
    'Controller a tempo parcial para várias pequenas empresas: orçamento, custos e relatórios mensais.',
  ),
  'tecnico-de-cobrancas': entry(
    'consult',
    'possivel',
    'Serviço de cobrança para pequenas empresas, pago com uma comissão sobre o que recuperas.',
  ),
  economista: entry(
    'consult',
    'possivel',
    'Planos de negócio, estudos de viabilidade e candidaturas a crédito para empreendedores e pequenas empresas.',
  ),
  'analista-de-estudos-economicos': entry(
    'consult',
    'possivel',
    'Estudos de mercado e relatórios sectoriais para empresas, associações e investidores estrangeiros.',
  ),

  // Tecnologia
  'administrador-de-base-de-dados': entry(
    'digital',
    'possivel',
    'Manutenção de bases de dados de várias pequenas empresas por avença, e trabalho remoto para clientes estrangeiros.',
  ),
  'analista-de-bi': entry(
    'digital',
    'possivel',
    'Painéis e relatórios em Power BI para pequenas empresas, à peça ou por avença.',
  ),
  'analista-de-dados': entry(
    'digital',
    'possivel',
    'Análise de vendas, inquéritos e relatórios para empresas e ONG, como freelancer, aqui e em plataformas internacionais.',
  ),
  'cientista-de-dados': entry(
    'digital',
    'possivel',
    'Projectos de modelos e automação para empresas, sobretudo remotos e depois de alguns anos de experiência.',
  ),
  'engenheiro-de-dados': entry(
    'digital',
    'possivel',
    'Trabalho remoto para empresas estrangeiras em plataformas como Upwork e Toptal, depois de experiência sólida.',
  ),
  'desenvolvedor-backend': entry(
    'digital',
    'comum',
    'Sistemas e APIs para pequenas empresas, por projecto, e trabalho remoto para clientes estrangeiros.',
  ),
  'desenvolvedor-frontend': entry(
    'digital',
    'comum',
    'Sites e lojas online para pequenas empresas, por projecto, e trabalho remoto para clientes estrangeiros.',
  ),
  'desenvolvedor-full-stack': entry(
    'digital',
    'comum',
    'Sites e sistemas completos para pequenas empresas, por projecto; vários juntam-se e criam uma startup.',
  ),
  'desenvolvedor-mobile': entry(
    'digital',
    'comum',
    'Apps para pequenas empresas e startups, por projecto, e trabalho remoto para clientes estrangeiros.',
  ),
  'engenheiro-de-qa': entry(
    'digital',
    'possivel',
    'Testes de sites e apps à peça, sobretudo em plataformas internacionais.',
  ),
  'designer-grafico': entry(
    'digital',
    'comum',
    'Logótipos, cartazes, menus e redes sociais para pequenas empresas e eventos; muitos designers são freelancers desde a faculdade.',
  ),
  'designer-ui-ux': entry(
    'digital',
    'comum',
    'Desenho de apps e sites para startups e agências, por projecto, aqui e para fora.',
  ),
  'gestor-de-marketing-digital': entry(
    'digital',
    'comum',
    'Agência pequena ou freelancer: anúncios no Facebook e Google, redes sociais e sites para pequenas empresas, por mensalidade.',
  ),
  'analista-de-sistemas': entry(
    'digital',
    'possivel',
    'Levantar processos e escolher ou adaptar sistemas de gestão para pequenas empresas, como consultor.',
  ),
  'comercial-de-ti': entry(
    'business',
    'comum',
    'Revenda de software, equipamento e serviços de TI a empresas, por comissão ou com uma empresa própria.',
    { cost: [500_000, 5_000_000] },
  ),
  'gestor-de-projetos-de-ti': entry(
    'consult',
    'possivel',
    'Gestor de projectos freelance para software houses e empresas que implementam sistemas.',
  ),
  'gestor-de-ti': entry(
    'consult',
    'possivel',
    'TI de várias pequenas empresas por avença: redes, contas de email, cópias de segurança e suporte.',
  ),
  'product-manager': entry(
    'digital',
    'possivel',
    'Fundar uma startup própria: quem sabe testar e validar um produto parte com vantagem.',
  ),
  'administrador-de-redes': entry(
    'trade',
    'possivel',
    'Instalar e manter redes e Wi-Fi de escritórios, hotéis e condomínios, por contrato.',
    { cost: [500_000, 3_000_000], steps: ['Tira uma certificação de redes (ex.: Cisco CCNA).'] },
  ),
  'administrador-de-sistemas': entry(
    'digital',
    'possivel',
    'Servidores, email e cópias de segurança de pequenas empresas por avença, e trabalho remoto.',
  ),
  'engenheiro-devops': entry(
    'digital',
    'possivel',
    'Projectos de cloud e automação para startups e empresas estrangeiras, quase sempre remotos.',
  ),
  'tecnico-de-hardware': entry(
    'trade',
    'comum',
    'Loja ou banca de reparação de computadores e telemóveis: muitos técnicos começam assim no bairro.',
    { cost: [300_000, 2_000_000] },
  ),
  'tecnico-de-suporte': entry(
    'trade',
    'possivel',
    'Suporte informático por avença a pequenos escritórios, escolas e clínicas.',
    { cost: [200_000, 1_000_000] },
  ),
  'analista-de-ciberseguranca': entry(
    'digital',
    'possivel',
    'Testes de intrusão e auditorias para empresas, e programas internacionais de recompensa por falhas (bug bounty).',
  ),
  'engenheiro-de-telecomunicacoes': entry(
    'consult',
    'possivel',
    'Instalação de redes, torres e fibra como subempreiteiro das operadoras.',
    { licence: [ENGINEERS] },
  ),
  'tecnico-de-telecomunicacoes': entry(
    'trade',
    'comum',
    'Instalação de antenas, TV por satélite, câmaras e internet em casas e empresas.',
  ),

  // Desporto
  'gestor-desportivo': entry(
    'consult',
    'possivel',
    'Organizar torneios, escolinhas de futebol e eventos desportivos, ou agenciar atletas.',
  ),
  'preparador-fisico': entry(
    'creative',
    'comum',
    'Personal trainer: treinos individuais e em grupo em ginásios, condomínios e na Marginal, por mensalidade.',
    { cost: [100_000, 1_500_000] },
  ),
  'professor-de-educacao-fisica': entry(
    'creative',
    'possivel',
    'Escolinhas de desporto, aulas de grupo e treino personalizado, ao lado do lugar na escola.',
    { cost: [100_000, 1_500_000] },
  ),
  'treinador-desportivo': entry(
    'creative',
    'comum',
    'Escolinhas de futebol, basquetebol ou natação para crianças, por mensalidade, em campos ou piscinas alugados.',
    { cost: [200_000, 2_000_000] },
  ),

  // Saúde
  cardiopneumologista: entry(
    'clinic',
    'possivel',
    'Exames (ECG, Holter, espirometria) feitos à peça em várias clínicas, ou um posto de exames próprio com sócios.',
    { cost: [5_000_000, 25_000_000] },
  ),
  'tecnico-analises-clinicas': entry(
    'clinic',
    'possivel',
    'Posto de colheitas ou laboratório pequeno, em sociedade, depois de anos de experiência e com licença do Ministério da Saúde.',
    { cost: [10_000_000, 60_000_000] },
  ),
  'tecnico-electromedicina': entry(
    'trade',
    'comum',
    'Manutenção e reparação de equipamento médico para clínicas privadas, por contrato.',
    { cost: [500_000, 4_000_000] },
  ),
  'tecnico-radiologia': entry(
    'clinic',
    'possivel',
    'Sozinho é raro, porque o equipamento é caro; é possível em sociedade com médicos, num centro de imagem.',
    { cost: [20_000_000, 150_000_000] },
  ),
  enfermeiro: entry(
    'clinic',
    'possivel',
    'Cuidados ao domicílio (pensos, injecções, idosos acamados) e postos de enfermagem; muitos fazem-no ao lado do hospital.',
    { cost: [200_000, 2_000_000], licence: [NURSES] },
  ),
  parteira: entry(
    'clinic',
    'possivel',
    'Acompanhamento da gravidez e do pós-parto e aulas de preparação para o parto, em ligação com uma clínica.',
    { cost: [200_000, 2_000_000], licence: [NURSES] },
  ),
  'tecnico-medio-enfermagem': entry(
    'clinic',
    'possivel',
    'Cuidados ao domicílio a idosos e doentes crónicos, combinados com o turno no hospital ou na clínica.',
    { cost: [100_000, 1_000_000], licence: [NURSES] },
  ),
  farmaceutico: entry(
    'business',
    'comum',
    'Abrir uma farmácia, que precisa de um farmacêutico como director técnico; é dos negócios de saúde mais comuns.',
    {
      cost: [15_000_000, 60_000_000],
      licence: [
        ORDER('Ordem dos Farmacêuticos de Angola'),
        'Licenciar a farmácia na ARMED (Agência Reguladora de Medicamentos).',
      ],
    },
  ),
  'tecnico-farmacia': entry(
    'business',
    'possivel',
    'Trabalhar como técnico numa farmácia e, mais tarde, abrir uma com um farmacêutico como director técnico.',
    {
      cost: [15_000_000, 60_000_000],
      licence: ['Licenciar a farmácia na ARMED, com um farmacêutico como director técnico.'],
    },
  ),
  'delegado-informacao-medica': entry(
    'consult',
    'possivel',
    'Representar laboratórios como agente independente, por comissão, depois de conhecer os médicos e as farmácias.',
  ),
  'medico-clinica-geral': medicine(
    'clínica geral',
    'comum',
    'Consultório próprio ou consultas em várias clínicas privadas, ao lado do hospital público. Abrir uma clínica pede sócios e capital.',
  ),
  'cirurgiao-geral': medicine('cirurgia', 'possivel'),
  'medico-cardiologista': medicine('cardiologia', 'possivel'),
  'medico-dermatologista': medicine('dermatologia', 'comum'),
  'medico-ginecologista-obstetra': medicine('ginecologia e obstetrícia', 'comum'),
  'medico-internista': medicine('medicina interna', 'possivel'),
  'medico-neurologista': medicine('neurologia', 'possivel'),
  'medico-oftalmologista': medicine(
    'oftalmologia',
    'comum',
    'Consultas em clínicas e óticas e, com sócios, uma clínica de olhos própria, muitas vezes junto a uma ótica.',
  ),
  'medico-ortopedista': medicine('ortopedia', 'possivel'),
  'medico-otorrinolaringologista': medicine('otorrinolaringologia', 'possivel'),
  'medico-pediatra': medicine('pediatria', 'comum'),
  'medico-psiquiatra': medicine('psiquiatria', 'possivel'),
  'medico-radiologista': medicine(
    'radiologia',
    'possivel',
    'Relatórios de exames à peça para várias clínicas (também à distância) e, com sócios, um centro de imagem.',
  ),
  'medico-urologista': medicine('urologia', 'possivel'),
  'medico-saude-publica': entry(
    'consult',
    'possivel',
    'Consultoria para ONG e agências internacionais em programas de saúde: desenho, avaliação e formação.',
  ),
  'tecnico-saude-ambiental': entry(
    'trade',
    'possivel',
    'Desinfestação, controlo de pragas e inspecções de higiene para restaurantes, escolas e condomínios.',
    { cost: [500_000, 3_000_000] },
  ),
  'tecnico-saude-publica': entry(
    'consult',
    'possivel',
    'Inquéritos de saúde e acções de formação para ONG e projectos comunitários, contratado por projecto.',
  ),
  'psicologo-clinico': entry(
    'clinic',
    'comum',
    'Consultório próprio ou partilhado, e consultas online; muitos começam a dar consultas ao fim do dia, além do emprego.',
    { cost: [500_000, 3_000_000] },
  ),
  'psicologo-escolar': entry(
    'clinic',
    'possivel',
    'Consultas a crianças e adolescentes e apoio a colégios privados, por avença.',
    { cost: [300_000, 2_000_000] },
  ),
  'psicologo-do-trabalho': entry(
    'consult',
    'possivel',
    'Recrutamento, avaliação psicológica e formação para empresas, como consultor.',
  ),
  'medico-dentista': entry(
    'clinic',
    'comum',
    'Clínica dentária própria ou em sociedade é o caminho mais comum; a cadeira e o equipamento são o maior custo.',
    { cost: [15_000_000, 60_000_000], licence: [DOCTORS] },
  ),
  'tecnico-estomatologia': entry(
    'clinic',
    'possivel',
    'Trabalhar em clínicas dentárias ou abrir um laboratório de prótese dentária que serve várias clínicas.',
    { cost: [2_000_000, 10_000_000] },
  ),
  fisioterapeuta: entry(
    'clinic',
    'comum',
    'Clínica pequena ou sessões ao domicílio (idosos, pós-cirurgia, desportistas); o equipamento básico é barato.',
    { cost: [1_000_000, 8_000_000] },
  ),
  nutricionista: entry(
    'clinic',
    'comum',
    'Consultas em clínicas e ginásios, planos alimentares online e consultoria a restaurantes e escolas.',
    { cost: [200_000, 2_000_000] },
  ),
  ortoprotesico: entry(
    'trade',
    'possivel',
    'Oficina de próteses e ortóteses que serve hospitais e centros de reabilitação.',
    { cost: [5_000_000, 20_000_000] },
  ),
  ortoptista: entry('clinic', 'possivel', 'Exames de visão à peça em óticas e clínicas de oftalmologia.', {
    cost: [500_000, 3_000_000],
  }),
  'medico-veterinario': entry(
    'clinic',
    'comum',
    'Clínica de animais de companhia em Luanda, ou assistência a fazendas de gado e aves.',
    {
      cost: [3_000_000, 15_000_000],
      licence: ['Licenciar a clínica nos serviços de veterinária do Ministério da Agricultura.'],
    },
  ),
  zootecnico: entry(
    'agro',
    'comum',
    'Criação de galinhas, porcos ou cabritos, ou assistência técnica a criadores.',
  ),

  // Engenharia e ofícios
  'engenheiro-electrotecnico': entry(
    'trade',
    'possivel',
    'Projectos e instalações eléctricas para obras e indústria; as empresas pequenas trabalham como subempreiteiras.',
    { cost: [2_000_000, 10_000_000], licence: [ENGINEERS] },
  ),
  'engenheiro-de-energias-renovaveis': entry(
    'trade',
    'comum',
    'Instalação de painéis solares e baterias em casas, escolas e fazendas sem rede estável: um negócio a crescer em Angola.',
    { cost: [1_000_000, 8_000_000] },
  ),
  'tecnico-electricista': entry(
    'trade',
    'comum',
    'Instalações e reparações eléctricas em casas, lojas e obras; os clientes chegam por recomendação no bairro e nas obras.',
    { cost: [200_000, 1_500_000] },
  ),
  'engenheiro-mecatronico': entry(
    'trade',
    'possivel',
    'Automação e reparação de máquinas para fábricas e padarias, e sistemas de portões automáticos e câmaras.',
    { cost: [1_000_000, 6_000_000] },
  ),
  'engenheiro-mecanico': entry(
    'trade',
    'possivel',
    'Oficina de reparação, ou manutenção de geradores e máquinas para empresas, por contrato.',
    { cost: [2_000_000, 12_000_000], licence: [ENGINEERS] },
  ),
  'engenheiro-quimico': entry(
    'business',
    'possivel',
    'Pequena fábrica (detergentes, tintas, água de mesa) ou consultoria de processos a fábricas.',
    { cost: [5_000_000, 40_000_000], licence: [ENGINEERS] },
  ),
  'engenheiro-de-manutencao': entry(
    'trade',
    'possivel',
    'Contratos de manutenção de geradores, ar condicionado e máquinas com empresas e condomínios.',
    { cost: [1_000_000, 6_000_000] },
  ),
  'engenheiro-de-producao-industrial': entry(
    'consult',
    'possivel',
    'Consultoria de organização da produção e melhoria contínua (lean) para pequenas fábricas.',
  ),
  'tecnico-de-seguranca-no-trabalho': entry(
    'consult',
    'possivel',
    'Consultoria e formação em segurança no trabalho para obras e empresas, que precisam de planos e de formar os trabalhadores.',
  ),
  'operador-de-maquinas-pesadas': entry(
    'trade',
    'possivel',
    'Trabalhar com máquina própria ou de um sócio (retroescavadora, empilhador) alugada à hora ou ao dia para obras.',
    { cost: [15_000_000, 80_000_000] },
  ),
  'soldador-industrial': entry(
    'trade',
    'comum',
    'Serralharia própria: portões, grades e estruturas metálicas. O kit de soldadura é muitas vezes o primeiro passo.',
    { cost: [500_000, 3_000_000] },
  ),
  'tecnico-de-instrumentacao': entry(
    'trade',
    'possivel',
    'Calibração e manutenção de instrumentos para fábricas e empresas de serviços ao petróleo, como subcontratado.',
    { cost: [1_000_000, 6_000_000] },
  ),
  'tecnico-de-manutencao-mecanica': entry(
    'trade',
    'possivel',
    'Oficina de mecânica, ou manutenção de geradores e bombas para empresas, por contrato.',
    { cost: [1_000_000, 6_000_000] },
  ),
  'tecnico-de-procurement': entry(
    'consult',
    'possivel',
    'Ajudar empresas angolanas a tornarem-se fornecedoras do petróleo: registo, conteúdo local e propostas.',
  ),
  'engenheiro-metalurgico': entry(
    'trade',
    'possivel',
    'Serralharia, pequena fundição ou ensaios de materiais para obras.',
    { cost: [2_000_000, 15_000_000], licence: [ENGINEERS] },
  ),
  'engenheiro-de-minas': entry(
    'consult',
    'possivel',
    'Consultoria a pequenas explorações de inertes (areia, brita) e apoio ao licenciamento mineiro.',
    { licence: [ENGINEERS] },
  ),
  geologo: entry(
    'consult',
    'possivel',
    'Prospecção e estudos geológicos para pequenas concessões, furos de água e obras.',
  ),
  geofisico: entry(
    'consult',
    'possivel',
    'Prospecção de água subterrânea por geofísica antes de abrir furos: um serviço muito procurado.',
    { cost: [2_000_000, 10_000_000] },
  ),

  // Educação
  'formador-de-tic': entry(
    'tutor',
    'comum',
    'Cursos de informática e programação para jovens e empresas, numa sala alugada ou online.',
    {
      cost: [500_000, 3_000_000],
      licence: ['Para passares certificados, licenciar o centro de formação no INEFOP.'],
    },
  ),
  'educador-de-infancia': entry(
    'business',
    'comum',
    'Creche ou centro infantil em casa ou numa vivenda alugada; precisa de licença e de um espaço seguro.',
    {
      cost: [1_000_000, 8_000_000],
      licence: ['Licenciar a creche no Ministério da Acção Social e na Administração Municipal.'],
    },
  ),
  'professor-de-educacao-especial': entry(
    'tutor',
    'possivel',
    'Apoio individual a crianças com necessidades especiais, em casa, pago pelas famílias.',
  ),
  'professor-do-ensino-primario': entry(
    'tutor',
    'possivel',
    'Explicações e apoio ao estudo para crianças da 1.ª à 6.ª classe, em casa ou no bairro.',
  ),
  'professor-de-biologia': lessons('Biologia', 'possivel'),
  'professor-de-filosofia': lessons('Filosofia', 'possivel'),
  'professor-de-fisica': lessons('Física', 'comum'),
  'professor-de-geografia': lessons('Geografia', 'possivel'),
  'professor-de-historia': lessons('História', 'possivel'),
  'professor-de-informatica': lessons('Informática', 'comum'),
  'professor-de-linguas-estrangeiras': lessons('Inglês ou Francês', 'comum'),
  'professor-de-lingua-portuguesa': lessons('Língua Portuguesa', 'comum'),
  'professor-de-matematica': lessons('Matemática', 'comum'),
  'professor-de-quimica': lessons('Química', 'comum'),
  'professor-do-ensino-tecnico': entry(
    'trade',
    'possivel',
    'Oficina própria no ofício que ensinas (electricidade, mecânica, construção) e formação à peça para centros privados.',
  ),
  'docente-do-ensino-superior': entry(
    'consult',
    'possivel',
    'Consultoria na área em que é especialista, explicações para universitários e preparação para os exames de acesso.',
  ),
  'formador-profissional': entry(
    'consult',
    'comum',
    'Formador por conta própria para centros de formação e empresas, pago por acção de formação.',
    { licence: ['Obter a certificação de formador junto do INEFOP.'] },
  ),
  'tecnico-de-emprego-e-formacao': entry(
    'consult',
    'possivel',
    'Recrutamento e orientação de carreira para empresas e jovens, ou um centro de formação próprio.',
  ),
  'director-escolar': entry(
    'business',
    'possivel',
    'Fundar um colégio privado é o passo de muitos directores com experiência; pede licença do Ministério da Educação.',
    { cost: [10_000_000, 80_000_000], licence: ['Licenciar o colégio no Ministério da Educação.'] },
  ),
  'especialista-de-administracao-da-educacao': entry(
    'consult',
    'possivel',
    'Consultoria a colégios privados: organização, licenciamento e formação de directores.',
  ),
  pedagogo: entry(
    'tutor',
    'possivel',
    'Centro de explicações e apoio ao estudo, ou formação de professores para colégios privados.',
    { cost: [200_000, 2_000_000] },
  ),

  // Gestão, recursos humanos, projectos
  'assistente-administrativo': entry(
    'consult',
    'possivel',
    'Secretariado e apoio administrativo a pequenas empresas e profissionais, à hora ou por avença.',
    { cost: [100_000, 500_000] },
  ),
  'consultor-de-gestao': entry(
    'consult',
    'comum',
    'Consultor independente ou em sociedade: organização, planos de negócio e processos para pequenas e médias empresas.',
  ),
  'gestor-de-empresas': entry(
    'business',
    'comum',
    'Criar e gerir um negócio próprio (comércio, serviços, restauração) é o caminho de muitos licenciados em gestão.',
  ),
  'secretario-executivo': entry(
    'consult',
    'possivel',
    'Assistente virtual de vários executivos e pequenas empresas: agenda, viagens, documentos e correspondência.',
    { cost: [100_000, 500_000] },
  ),
  'tecnico-de-compras': entry(
    'consult',
    'possivel',
    'Agente de compras: encontrar fornecedores e importar por encomenda para empresas e particulares.',
  ),
  'coordenador-de-projectos': entry(
    'consult',
    'possivel',
    'Coordenador freelance de projectos de ONG e de eventos, contratado por projecto.',
  ),
  'gestor-de-projectos': entry(
    'consult',
    'possivel',
    'Gestor de projectos freelance para ONG, obras e empresas, contratado por projecto.',
  ),
  'planeador-de-projectos': entry(
    'consult',
    'possivel',
    'Planeamento e controlo em Primavera P6 ou MS Project, à peça, para empreiteiros.',
  ),
  'scrum-master': entry(
    'consult',
    'possivel',
    'Coaching ágil para equipas de software, sobretudo remoto e para empresas estrangeiras.',
  ),
  'gestor-de-recursos-humanos': entry(
    'consult',
    'possivel',
    'Consultora de recrutamento e de processos de recursos humanos para pequenas e médias empresas.',
  ),
  'tecnico-de-recrutamento': entry(
    'consult',
    'comum',
    'Recrutamento por conta própria: as empresas pagam por cada vaga preenchida.',
  ),
  'tecnico-de-recursos-humanos': entry(
    'consult',
    'possivel',
    'Contratos, processos disciplinares e regulamentos internos para pequenas empresas, por avença.',
  ),
  'tecnico-de-salarios': entry(
    'consult',
    'possivel',
    'Processamento de salários e do INSS para pequenas empresas, por avença mensal.',
  ),

  // Humanidades, línguas, relações internacionais
  arquivista: entry(
    'consult',
    'possivel',
    'Organização e digitalização de arquivos para empresas, escolas e igrejas.',
  ),
  historiador: entry(
    'creative',
    'possivel',
    'Livros, conteúdos e roteiros de turismo histórico, quase sempre ao lado de outro emprego.',
  ),
  'tecnico-de-patrimonio-cultural': entry(
    'consult',
    'possivel',
    'Inventários e projectos de património para administrações, museus e ONG, contratado por projecto.',
  ),
  interprete: entry(
    'consult',
    'comum',
    'Interpretação em conferências, reuniões e tribunais, paga ao dia, para agências e empresas.',
  ),
  linguista: entry(
    'digital',
    'possivel',
    'Revisão, tradução e aulas de línguas nacionais, e conteúdos para editoras e projectos de educação.',
  ),
  'revisor-de-textos': entry(
    'digital',
    'comum',
    'Revisão de livros, teses e documentos de empresas, paga por página.',
    { cost: [100_000, 500_000] },
  ),
  tradutor: entry(
    'digital',
    'comum',
    'A maioria trabalha por conta própria: traduções de documentos, sites e contratos para empresas e agências estrangeiras.',
    { cost: [150_000, 800_000] },
  ),
  'analista-politico': entry(
    'consult',
    'possivel',
    'Análise de risco e relatórios para embaixadas, empresas estrangeiras e meios de comunicação.',
  ),
  'tecnico-de-cooperacao-internacional': entry(
    'consult',
    'possivel',
    'Consultor de ONG e agências de cooperação: escrever propostas e avaliar projectos.',
  ),

  // Logística, transportes, turismo
  'despachante-aduaneiro': entry(
    'consult',
    'comum',
    'Os despachantes oficiais trabalham por conta própria ou em sociedade: tratam do desembaraço de mercadorias no porto e no aeroporto.',
    {
      cost: [1_000_000, 5_000_000],
      licence: [
        'Obter a licença de despachante oficial na AGT e inscrever-te na Câmara dos Despachantes Oficiais.',
      ],
    },
  ),
  'gestor-de-logistica': entry(
    'business',
    'possivel',
    'Empresa de entregas, transporte de mercadorias ou armazém para lojas online.',
  ),
  'tecnico-de-logistica': entry(
    'business',
    'possivel',
    'Entregas de motorizada ou carrinha para restaurantes e lojas online, com encomendas pelo WhatsApp.',
    { cost: [500_000, 4_000_000] },
  ),
  'tecnico-de-transportes': entry(
    'business',
    'possivel',
    'Gerir uma pequena frota (táxis, carrinhas de carga, mototáxis) ou um serviço de transporte escolar.',
    { cost: [3_000_000, 20_000_000] },
  ),
  'chefe-de-cozinha': entry(
    'business',
    'comum',
    'Restaurante pequeno, catering para eventos ou comida por encomenda no Instagram; muitos chefs começam pelas encomendas.',
    {
      cost: [300_000, 5_000_000],
      licence: ['Pedir a licença sanitária do espaço na Administração Municipal.'],
    },
  ),
  'gestor-hoteleiro': entry(
    'business',
    'possivel',
    'Alojamento local, uma pequena guest house, ou gestão de casas para arrendamento de curta duração.',
    { licence: ['Licenciar o alojamento no Ministério do Turismo.'] },
  ),
  'gestor-de-restauracao': entry(
    'business',
    'comum',
    'Restaurante, café ou lanchonete próprio, depois de aprender a gerir custos e pessoal num de outros.',
    {
      cost: [2_000_000, 15_000_000],
      licence: ['Pedir a licença sanitária do espaço na Administração Municipal.'],
    },
  ),
  'guia-turistico': entry(
    'creative',
    'comum',
    'Passeios em Luanda, à Kissama, ao Mussulo e a Kalandula com grupos pequenos, vendidos online e a hotéis.',
    { licence: ['Informar-te no Ministério do Turismo sobre a carteira de guia.'] },
  ),
  'tecnico-de-turismo': entry(
    'business',
    'possivel',
    'Agência de viagens pequena ou pacotes turísticos vendidos online.',
    { cost: [500_000, 5_000_000], licence: ['Licenciar a agência de viagens no Ministério do Turismo.'] },
  ),

  // Pescas
  'biologo-marinho': entry(
    'consult',
    'possivel',
    'Estudos de impacte ambiental costeiros e monitorização para consultoras e empresas de pesca.',
  ),
  'tecnico-de-aquicultura': entry(
    'agro',
    'comum',
    'Tanques de tilápia ou bagre num terreno com água; há procura em Luanda e o arranque pode ser pequeno.',
    { cost: [1_000_000, 8_000_000] },
  ),
  'tecnico-de-pescas': entry(
    'agro',
    'comum',
    'Pesca artesanal com barco próprio ou de cooperativa, ou venda e conservação de pescado.',
    { licence: ['Pedir a licença de pesca no Ministério das Pescas.'] },
  ),
}
