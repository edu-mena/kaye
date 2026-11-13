import type { Career, Company, PathwayStep, SourceLink } from '../types'
import { career, publicPay } from './publicGuides'
import { context, employer } from './sciencesGuides'
import {
  certification,
  degree,
  firstJob,
  ladder,
  market as marketOf,
  skill,
  type TechSalary,
  technicalRoute,
  universityRoute,
  wage,
} from './technologyGuides'

// The full pages of agriculture, logistics and tourism (ADR 0010), from public sources:
// - the demand: the job ads of the last 12 months, by their titles. market/jobs.json counts 26 ads in agriculture, but
//   environment ads fall under other areas, so that area's total is the 31 ads counted here;
// - the salaries: the WageIndicator 2026 survey, in the demand note;
// - the rules: the Ordem dos Médicos Veterinários, the AGT's competition for customs agents (Expansão, 2023) and
//   Decreto Presidencial n.º 117/20 (environmental licensing). Where no source gave the rule, the guide says to confirm.

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

const ENVIRONMENT_START = 'entre 332 590 e 1 003 463'
const ENVIRONMENT_AFTER = 'entre 515 704 e 1 608 957'
const FARM_START = 'entre 225 031 e 1 398 188'
const FARM_AFTER = 'entre 321 489 e 2 108 237'

const SALARY = {
  agronomist: wage(
    'tecnicos-agricolas',
    'os técnicos agrícolas, a função mais próxima',
    FARM_START,
    FARM_AFTER,
  ),
  farmManager: wage(
    'gerentes-de-producao-agricola-e-de-silvicultura',
    'os directores de produção agrícola, animal e florestal',
    'entre 221 581 e 1 563 228',
    'entre 365 165 e 2 322 648',
  ),
  vet: wage('veterinarios', 'os veterinários', 'entre 263 233 e 869 657', 'entre 418 092 e 1 429 876'),
  environment: wage(
    'profissionais-em-proteccao-ambiental',
    'os profissionais de protecção ambiental',
    ENVIRONMENT_START,
    ENVIRONMENT_AFTER,
  ),
  marine: wage(
    'biologos-botanicos-zoologos-e-profissionais',
    'os biólogos, botânicos e zoólogos',
    ENVIRONMENT_START,
    ENVIRONMENT_AFTER,
  ),
  fisheries: wage(
    'biologos-botanicos-zoologos-e-profissionais',
    'os biólogos, a função mais próxima',
    ENVIRONMENT_START,
    ENVIRONMENT_AFTER,
  ),
  food: wage(
    'tecnicos-em-ciencias-fisica-e-quimica',
    'os técnicos de ciências físicas e químicas, a função mais próxima',
    'entre 227 255 e 1 385 341',
    'entre 281 531 e 1 878 949',
  ),
  stock: wage(
    'funcionarios-do-stock',
    'os funcionários de stock',
    'entre 112 644 e 408 782',
    'entre 160 739 e 716 144',
  ),
  logistics: wage(
    'gerentes-de-fornecimento-distribuicao-e-assuntos',
    'os directores de compras, transportes e distribuição',
    'entre 221 581 e 1 563 228',
    'entre 365 165 e 2 322 648',
  ),
  customs: wage(
    'despachantes-alfandegarios',
    'os despachantes',
    'entre 183 438 e 652 181',
    'entre 285 029 e 1 143 054',
  ),
  fleet: wage(
    'funcionarios-de-transporte',
    'os empregados dos serviços de transportes',
    'entre 112 644 e 408 782',
    'entre 160 739 e 716 144',
  ),
  transportEngineer: wage(
    'engenheiros-civis',
    'os engenheiros civis',
    'entre 493 864 e 882 343',
    'entre 672 762 e 1 210 790',
  ),
  port: wage(
    'gerentes-de-fornecimento-distribuicao-e-assuntos',
    'os directores de compras, transportes e distribuição, a função mais próxima',
    'entre 221 581 e 1 563 228',
    'entre 365 165 e 2 322 648',
  ),
  aviation: publicPay(
    'um técnico superior de 2.ª classe',
    '361 910',
    'engenheiros-civis',
    'os engenheiros civis, uma das funções mais próximas',
    'entre 493 864 e 882 343',
    'entre 672 762 e 1 210 790',
  ),
  chef: wage(
    'chefes-de-cozinha',
    'os chefes de cozinha',
    'entre 236 457 e 651 392',
    'entre 325 145 e 1 016 698',
  ),
  hotel: wage(
    'gerentes-de-hoteis',
    'os directores e gerentes de hotelaria',
    'entre 217 222 e 1 220 145',
    'entre 422 679 e 1 975 764',
  ),
  frontDesk: wage(
    'recepcionistas-de-hoteis',
    'os recepcionistas de hotel',
    'entre 135 095 e 381 987',
    'entre 177 515 e 601 494',
  ),
  travel: wage(
    'consultores-e-funcionarios-de-viagens',
    'os empregados das agências de viagem',
    'entre 135 095 e 381 987',
    'entre 177 515 e 601 494',
  ),
  guide: wage(
    'guias-de-viagens',
    'os guias-intérpretes',
    'entre 114 214 e 395 306',
    'entre 189 510 e 685 139',
  ),
  restaurant: wage(
    'gerentes-de-restaurantes',
    'os directores e gerentes de restauração',
    'entre 217 222 e 1 220 145',
    'entre 422 679 e 1 975 764',
  ),
}

const FIELD = context(
  'Campo e escritório',
  'Normal, com picos nas sementeiras e colheitas',
  'Técnicos, trabalhadores e agricultores',
  'Frequentes, entre fazendas',
)
const MARINE = context(
  'Barcos, portos, tanques e laboratório',
  'Irregular, conforme a maré e as campanhas',
  'Pescadores, técnicos e inspectores',
  'Frequentes, para a costa',
)
const GREEN = context(
  'Escritório, fábricas e estaleiros',
  'Normal, com visitas a obras',
  'Engenheiros, HSE e autoridades',
  'Frequentes, para os projectos',
)
const SITE = context(
  'Armazém, pátio ou porto',
  'Por turnos em muitas empresas',
  'Motoristas, armazém e compras',
  'Algumas',
)
const LOGISTICS_DESK = context(
  'Escritório e armazém',
  'Normal, com picos nas chegadas de carga',
  'Compras, armazém, transportes e alfândega',
  'Algumas, para portos e armazéns',
)
const HOTEL = context(
  'Hotel, restaurante ou agência',
  'Turnos, com noites, fins-de-semana e feriados',
  'Recepção, sala, cozinha e limpeza',
  'Poucas',
)
const KITCHEN = context(
  'Cozinha de restaurante, hotel ou empresa',
  'Turnos longos, com fins-de-semana',
  'Cozinheiros, ajudantes e sala',
  'Algumas, em obras ou no Soyo',
)

const CV_FIELD: Career['cvGuide'] = {
  template: 'classico',
  include: [
    'A formação, com a escola e o ano',
    'O que fizeste: hectares, animais, armazéns, viaturas, turnos ou quartos',
    'As certificações e as cartas de condução',
    'As províncias onde podes trabalhar',
  ],
  avoid: [
    'Listas de tarefas sem números',
    'Dados de clientes ou de empresas anteriores',
    'Fotografia e dados pessoais que a vaga não pede',
  ],
}

const REPORTS = skill('relatorios-tecnicos', 'Relatórios técnicos')
const ENGLISH = skill('ingles-trabalho', 'Inglês de trabalho', 'opcional')
const EXCEL = skill('excel-relatorios', 'Excel e relatórios')
const SERVICE = skill('atendimento-cliente', 'Atendimento ao cliente')
const HYGIENE = skill('haccp', 'HACCP (controlo de riscos nos alimentos)')

const AGRONOMY = degree(
  'Engenharia Agronómica',
  'Ou Agronomia. Vários institutos politécnicos e universidades dão o curso.',
)
const ENVIRONMENT = degree('Engenharia do Ambiente', 'Ou Engenharia de Recursos Naturais e Ambiente.')
const FISHERIES = degree(
  'Aquicultura',
  'Ou Engenharia de Pescas ou Biologia Marinha. Oferta rara: confirma onde abre.',
)
const LOGISTICS = degree('Gestão Logística e Transportes', 'Ou Logística e Gestão Comercial.')
const HOTEL_DEGREE = degree('Gestão Hoteleira', 'Ou Hotelaria e Turismo.')
const TOURISM_DEGREE = degree('Gestão de Turismo', 'Ou Hotelaria e Turismo.')
const CAREER_MEDIUM = (title: string): PathwayStep => ({
  kind: 'academico',
  level: 'medio_tecnico',
  title,
  need: 'recomendado',
  description: 'Num instituto médio. Confirma a oferta na tua província.',
  months: null,
})
const SUPPLY_CERT = certification(
  'CSCP ou CIPS (gestão da cadeia de abastecimento)',
  'Certificações internacionais. Não encontrámos em Angola um centro aprovado, por isso confirma as opções online na ASCM e no CIPS.',
)
const HOTEL_SCHOOL = certification(
  'Curso numa escola de hotelaria',
  'A Escola de Hotelaria e Turismo de Cabinda, aberta em 2025, é certificada pelo Turismo de Portugal e licenciada pelo INEFOP. Em Luanda há a Escola de Hotelaria e Restauração de Talatona.',
)

const fieldStages = (title: string, lead: string, what: string): Career['stages'] =>
  ladder(title, lead, [
    ['Apoia a equipa', `Aprende ${what}`],
    ['Responde por uma área', 'Trabalha com autonomia'],
    ['Leva os casos mais difíceis', 'Orienta os mais novos'],
    ['Dirige a equipa', 'Responde pelos resultados'],
  ])

type AreaTotal = { name: string; total: number }
const guide =
  (area: AreaTotal) =>
  ({
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
    const base = marketOf(postings, salary, sectors, area)
    return {
      ...entry,
      employerAsks: null,
      market: {
        ...base,
        demandNote: base.demandNote && { ...base.demandNote, text: `${base.demandNote.text}${extra}` },
      },
      cvGuide: CV_FIELD,
    }
  }

const agriculture = guide({ name: 'agricultura, pescas e ambiente', total: 31 })
const logistics = guide({ name: 'logística e transportes', total: 199 })
const tourism = guide({ name: 'turismo e hotelaria', total: 72 })

export const LAST_AREAS_GUIDES: Guide[] = [
  agriculture({
    slug: 'engenheiro-agronomo',
    description:
      'Planeia as culturas, escolhe sementes e adubos e combate as pragas para que a terra produza mais. Grandes fazendas, como as do grupo Novagrolíder, e o Estado são empregadores naturais, e quase sempre é preciso viver perto da produção.',
    dayToDay: [
      'Analisar o solo',
      'Planear a sementeira',
      'Controlar pragas e rega',
      'Acompanhar as equipas',
      'Medir a produção',
    ],
    workContext: FIELD,
    workStyles: ['Sentido prático', 'Observação', 'Liderança', 'Resistência física', 'Paciência'],
    skills: [
      skill('solos-fertilizacao', 'Solos e fertilização'),
      skill('protecao-culturas', 'Protecção das culturas'),
      skill('rega', 'Rega'),
      skill('gestao-producao', 'Gestão da produção'),
      REPORTS,
    ],
    pathways: [
      universityRoute('A licenciatura é a base. Saber conduzir ajuda muito no campo.', [
        AGRONOMY,
        firstJob(
          'Técnico numa fazenda ou projecto',
          'Fazendas privadas e projectos do Estado são a entrada mais comum.',
        ),
      ]),
    ],
    stages: fieldStages('Engenheiro Agrónomo', 'Director de Produção Agrícola', 'as culturas locais'),
    postings: 2,
    salary: SALARY.agronomist,
    sectors: ['Grandes fazendas', 'Serviços do Estado', 'Agro-indústria', 'Projectos de desenvolvimento'],
  }),
  agriculture({
    slug: 'tecnico-agropecuario',
    description:
      'Acompanha no campo as culturas e os animais e ensina os agricultores a produzir melhor. Entra-se com o ensino médio técnico: nos últimos 12 meses houve vagas para técnicos médios de agricultura e agropecuária, sobretudo no Bengo e em Malanje.',
    dayToDay: [
      'Visitar parcelas e animais',
      'Aconselhar os agricultores',
      'Controlar sementeiras',
      'Registar a produção',
      'Operar equipamento simples',
    ],
    workContext: FIELD,
    workStyles: ['Sentido prático', 'Paciência', 'Comunicação', 'Resistência física', 'Responsabilidade'],
    skills: [
      skill('tecnicas-culturais', 'Técnicas de produção'),
      skill('saude-animal-basica', 'Saúde animal básica'),
      skill('extensao-rural', 'Extensão rural'),
      REPORTS,
    ],
    pathways: [
      technicalRoute('Entras no mercado mais cedo, a seguir à 9.ª classe.', [
        CAREER_MEDIUM('Curso médio técnico de agropecuária'),
        firstJob(
          'Técnico numa fazenda',
          'Nos últimos 12 meses houve vagas para técnicos médios no Bengo e em Malanje.',
        ),
      ]),
      universityRoute('A licenciatura abre chefias.', [
        AGRONOMY,
        firstJob(
          'Técnico de campo',
          'O Instituto de Desenvolvimento Agrário apoia os agricultores em todo o país.',
        ),
      ]),
    ],
    stages: fieldStages('Técnico Agropecuário', 'Encarregado Geral de Fazenda', 'as rotinas da fazenda'),
    postings: 6,
    salary: SALARY.agronomist,
    sectors: ['Fazendas', 'Instituto de Desenvolvimento Agrário', 'Projectos rurais'],
  }),
  agriculture({
    slug: 'engenheiro-florestal',
    description:
      'Gere as florestas: planeia o corte e a replantação e protege-as das queimadas. O Instituto de Desenvolvimento Florestal é o empregador mais evidente, e não houve anúncios com este nome nos últimos 12 meses.',
    dayToDay: [
      'Fazer inventários de árvores',
      'Planear a exploração',
      'Fiscalizar licenças',
      'Acompanhar viveiros',
      'Prevenir queimadas',
    ],
    workContext: context(
      'Florestas, viveiros e serviços',
      'Normal, com saídas longas',
      'Fiscais, técnicos e comunidades',
      'Frequentes',
    ),
    workStyles: ['Gosto pela natureza', 'Resistência física', 'Rigor', 'Honestidade', 'Autonomia'],
    skills: [
      skill('inventario-florestal', 'Inventário florestal'),
      skill('silvicultura', 'Silvicultura'),
      skill('sig-mapas', 'Sistemas de informação geográfica'),
      REPORTS,
    ],
    pathways: [
      universityRoute('A licenciatura em Engenharia Florestal é a via directa.', [
        degree('Engenharia Florestal', 'Oferta rara: confirma onde abre.'),
        firstJob('Serviços florestais ou concessões', 'Entra-se por concurso nos serviços do Estado.'),
      ]),
    ],
    stages: fieldStages('Engenheiro Florestal', 'Chefe de Serviços Florestais', 'o inventário florestal'),
    postings: 0,
    salary: SALARY.agronomist,
    sectors: ['Instituto de Desenvolvimento Florestal', 'Concessões florestais', 'Projectos ambientais'],
  }),
  agriculture({
    slug: 'gestor-de-empresas-agricolas',
    description:
      'Gere uma fazenda ou empresa agrícola: as compras, as vendas, as equipas e as contas. Junta o conhecimento do campo à gestão, e nos últimos 12 meses houve um anúncio de gestor de fazenda no Huambo.',
    dayToDay: [
      'Planear a campanha',
      'Controlar custos',
      'Dirigir as equipas',
      'Comprar sementes e adubos',
      'Vender a produção',
    ],
    workContext: FIELD,
    workStyles: ['Liderança', 'Sentido de negócio', 'Organização', 'Decisão', 'Resistência'],
    skills: [
      skill('gestao-agricola', 'Gestão agrícola'),
      skill('custos-orcamentos', 'Custos e orçamentos'),
      skill('gestao-equipas', 'Gestão de equipas'),
      EXCEL,
      ENGLISH,
    ],
    pathways: [
      universityRoute('Gestão de Empresas Agrárias é a via directa.', [
        degree('Gestão de Empresas Agrárias', 'Ou Economia Agrária ou Agronomia.'),
        firstJob('Adjunto numa fazenda', 'Primeiro ganha-se experiência na produção.'),
      ]),
    ],
    stages: fieldStages('Gestor Agrícola', 'Director de Fazenda', 'a campanha agrícola'),
    postings: 2,
    salary: SALARY.farmManager,
    sectors: ['Grandes fazendas', 'Agro-indústria', 'Cooperativas'],
  }),
  agriculture({
    slug: 'engenheiro-agroalimentar',
    description:
      'Transforma os produtos do campo em alimentos e bebidas e controla a sua qualidade. Fábricas como a Refriango e empresas como a Biocom são destinos naturais, embora não tenha havido anúncios com este nome.',
    dayToDay: [
      'Acompanhar a produção',
      'Controlar a qualidade',
      'Melhorar receitas e processos',
      'Reduzir perdas',
      'Cumprir as regras de higiene',
    ],
    workContext: context(
      'Fábrica e laboratório',
      'Por turnos',
      'Operadores, qualidade e manutenção',
      'Raras',
    ),
    workStyles: ['Rigor', 'Sentido prático', 'Organização', 'Atenção ao pormenor', 'Trabalho em equipa'],
    skills: [
      skill('tecnologia-alimentos', 'Tecnologia dos alimentos'),
      HYGIENE,
      skill('iso-22000', 'ISO 22000 (segurança alimentar)'),
      skill('controlo-processos', 'Controlo de processos'),
      REPORTS,
    ],
    pathways: [
      universityRoute('Engenharia em Tecnologia Agro-Alimentar é a via directa.', [
        degree('Tecnologia Agro-Alimentar', 'Engenharia.'),
        {
          ...certification(
            'HACCP e ISO 22000',
            'As referências da indústria. Confirma as formações no IANORQ.',
          ),
          need: 'recomendado',
        },
        firstJob('Técnico numa fábrica', 'Bebidas, moagens e conservas são entradas comuns.'),
      ]),
    ],
    stages: fieldStages('Engenheiro Agro-Alimentar', 'Director de Fábrica', 'as linhas de produção'),
    postings: 0,
    salary: SALARY.food,
    sectors: ['Bebidas', 'Moagens', 'Açúcar e bioenergia', 'Conservas'],
  }),
  agriculture({
    slug: 'medico-veterinario',
    description:
      'Trata e previne as doenças dos animais e inspecciona os alimentos de origem animal. A Ordem dos Médicos Veterinários de Angola, com 510 inscritos em 2024, diz que só pode exercer quem tem inscrição regularizada. Em 2026 pediu melhores condições e salários para a classe.',
    dayToDay: [
      'Examinar animais',
      'Vacinar e tratar',
      'Inspeccionar carne e leite',
      'Controlar epidemias',
      'Aconselhar os criadores',
    ],
    workContext: context(
      'Campo, matadouros, clínicas e laboratório',
      'Normal, com urgências',
      'Criadores, técnicos e autoridades',
      'Frequentes',
    ),
    workStyles: ['Cuidado com os animais', 'Calma', 'Observação', 'Responsabilidade', 'Resistência física'],
    skills: [
      skill('clinica-veterinaria', 'Clínica veterinária'),
      skill('saude-publica-veterinaria', 'Saúde pública veterinária'),
      skill('inspeccao-alimentos', 'Inspecção de alimentos'),
      REPORTS,
    ],
    pathways: [
      universityRoute('Medicina Veterinária é obrigatória, e depois vem a inscrição na Ordem.', [
        degree('Medicina Veterinária', 'Oferta rara: confirma onde abre.'),
        {
          ...certification(
            'Inscrição na Ordem dos Médicos Veterinários',
            'Confirma os requisitos na Ordem. A bastonária diz que também quem ensina ou investiga deve inscrever-se.',
          ),
          need: 'essencial',
          certificate: 'exigido',
        },
        firstJob(
          'Serviços do Estado ou fazendas',
          'Nos últimos 12 meses houve vagas de técnicos superiores veterinários e no programa do Carter Center.',
        ),
      ]),
    ],
    stages: fieldStages('Médico Veterinário', 'Director de Serviços Veterinários', 'a clínica de campo'),
    postings: 5,
    salary: SALARY.vet,
    sectors: ['Serviços do Estado', 'Fazendas de gado', 'Clínicas', 'Projectos de saúde animal'],
  }),
  agriculture({
    slug: 'zootecnico',
    description:
      'Planeia a criação de gado, galinhas e porcos: a alimentação, a reprodução e a saúde. Empresas com produção de carne, como a Aldeia Nova, são destinos naturais, embora os anúncios costumem pedir técnicos de agropecuária.',
    dayToDay: [
      'Planear a alimentação',
      'Controlar a reprodução',
      'Registar pesos e produção',
      'Acompanhar a sanidade',
      'Melhorar os custos',
    ],
    workContext: FIELD,
    workStyles: ['Sentido prático', 'Organização', 'Observação', 'Cuidado com os animais', 'Liderança'],
    skills: [
      skill('nutricao-animal', 'Nutrição animal'),
      skill('reproducao-animal', 'Reprodução animal'),
      skill('gestao-efectivos', 'Gestão de efectivos'),
      EXCEL,
    ],
    pathways: [
      universityRoute('A licenciatura em Zootecnia é a via directa.', [
        degree('Zootecnia', 'Ou Engenharia Agropecuária.'),
        firstJob('Técnico numa exploração', 'Explorações de gado e aves.'),
      ]),
    ],
    stages: fieldStages('Zootécnico', 'Director de Pecuária', 'o maneio dos animais'),
    postings: 0,
    salary: SALARY.agronomist,
    sectors: ['Fazendas de gado', 'Aviários', 'Agro-indústria'],
  }),
  agriculture({
    slug: 'tecnico-de-aquicultura',
    description:
      'Cria peixe e marisco em tanques e viveiros, da reprodução à venda. É um sector em crescimento, com tilápia no Bengo e no Bié e um investimento anunciado em aquicultura marinha, mas a ração e os alevinos (peixes jovens) ainda são o principal entrave.',
    dayToDay: [
      'Alimentar os peixes',
      'Medir a qualidade da água',
      'Controlar doenças',
      'Pesar e registar',
      'Preparar a colheita',
    ],
    workContext: MARINE,
    workStyles: ['Sentido prático', 'Paciência', 'Observação', 'Resistência física', 'Organização'],
    skills: [
      skill('qualidade-agua', 'Qualidade da água'),
      skill('producao-peixe', 'Produção de peixe'),
      skill('alimentacao-peixe', 'Alimentação de peixes'),
      REPORTS,
    ],
    pathways: [
      universityRoute('Aquicultura é a via directa.', [
        FISHERIES,
        firstJob(
          'Técnico numa exploração',
          'Empresas como a Quinta do Bagre, em Caxito, e projectos do Estado.',
        ),
      ]),
    ],
    stages: fieldStages('Técnico de Aquicultura', 'Gestor de Aquicultura', 'o maneio dos tanques'),
    postings: 0,
    salary: SALARY.fisheries,
    sectors: ['Empresas de aquicultura', 'Projectos do Estado', 'Cooperativas'],
  }),
  agriculture({
    slug: 'biologo-marinho',
    description:
      'Estuda os peixes e a vida do mar para dizer quanto se pode pescar sem esgotar. Trabalha sobretudo no Instituto Nacional de Investigação Pesqueira e Marinha, e não houve anúncios com este nome.',
    dayToDay: [
      'Embarcar em campanhas',
      'Recolher amostras',
      'Medir os stocks de peixe',
      'Analisar dados',
      'Propor quotas',
    ],
    workContext: MARINE,
    workStyles: ['Curiosidade', 'Rigor', 'Resistência física', 'Trabalho em equipa', 'Paciência'],
    skills: [
      skill('avaliacao-pescas', 'Avaliação de recursos pesqueiros'),
      skill('biologia-peixes', 'Biologia de peixes'),
      skill('estatistica-basica', 'Estatística aplicada'),
      REPORTS,
      ENGLISH,
    ],
    pathways: [
      universityRoute('Biologia Marinha é a via directa. A investigação pede mestrado.', [
        degree('Biologia Marinha', 'Ou Ciências Biológicas.'),
        firstJob(
          'Estágio de investigação',
          'O Estatuto do Investigador Científico abre esta categoria a licenciados.',
        ),
      ]),
    ],
    stages: career(
      [
        'Estagiário de Investigação',
        'Assistente de Investigação',
        'Investigador Auxiliar',
        'Investigador Coordenador',
      ],
      [
        ['Apoia as campanhas', 'Prepara o mestrado'],
        ['Conduz partes de um estudo', 'Publica com a equipa'],
        ['Lidera estudos', 'Orienta os mais novos'],
        ['Coordena programas', 'Aconselha quem decide'],
      ],
    ),
    postings: 0,
    salary: SALARY.marine,
    sectors: ['Investigação pesqueira', 'Ministério das Pescas', 'Ambiente'],
  }),
  agriculture({
    slug: 'tecnico-de-pescas',
    description:
      'Acompanha a pesca e a transformação do pescado e inspecciona a sua qualidade, do barco à venda. Empresas de pesca de Luanda, Benguela e Zaire anunciaram vagas para várias funções, sem nomear esta, por isso a conta fica em zero.',
    dayToDay: [
      'Controlar as capturas',
      'Inspeccionar o pescado',
      'Verificar licenças',
      'Registar dados',
      'Acompanhar a fábrica de pescado',
    ],
    workContext: MARINE,
    workStyles: ['Sentido prático', 'Honestidade', 'Resistência física', 'Rigor', 'Organização'],
    skills: [
      skill('tecnologia-pescado', 'Tecnologia do pescado'),
      skill('regras-pesca', 'Regras da pesca'),
      HYGIENE,
      REPORTS,
    ],
    pathways: [
      universityRoute('Cursos de pescas ou de recursos marinhos preparam para a função.', [
        FISHERIES,
        firstJob('Técnico numa empresa de pesca', 'Ou inspector nos serviços do Estado, por concurso.'),
      ]),
    ],
    stages: fieldStages('Técnico de Pescas', 'Chefe de Pescas', 'o trabalho a bordo e em terra'),
    postings: 0,
    salary: SALARY.fisheries,
    sectors: ['Empresas de pesca', 'Fábricas de pescado', 'Ministério das Pescas'],
  }),
  agriculture({
    slug: 'engenheiro-do-ambiente',
    description:
      'Estuda o impacto das obras e das fábricas no ambiente e projecta o tratamento de resíduos e águas. Em Angola, os projectos com impacto precisam de avaliação e licença ambiental, o que cria trabalho em consultoras e empresas.',
    dayToDay: [
      'Fazer estudos de impacto',
      'Preparar licenças ambientais',
      'Projectar tratamento de águas e resíduos',
      'Auditar',
      'Falar com as autoridades',
    ],
    workContext: GREEN,
    workStyles: ['Rigor', 'Sentido prático', 'Diplomacia', 'Organização', 'Honestidade'],
    skills: [
      skill('impacto-ambiental', 'Estudos de impacto ambiental'),
      skill('licenciamento-ambiental', 'Licenciamento ambiental'),
      skill('residuos-aguas', 'Resíduos e águas'),
      skill('iso-14001', 'ISO 14001 (gestão ambiental)'),
      REPORTS,
    ],
    pathways: [
      universityRoute('A licenciatura é a via directa.', [
        ENVIRONMENT,
        {
          ...certification(
            'ISO 14001',
            'A norma de gestão ambiental. Não encontrámos em Luanda um curso com datas: confirma com os centros de QHSE.',
          ),
          need: 'recomendado',
        },
        firstJob(
          'Consultora ou departamento de ambiente',
          'Confirma o registo de consultores no Ministério do Ambiente.',
        ),
      ]),
    ],
    stages: fieldStages('Engenheiro do Ambiente', 'Director de Ambiente', 'os estudos de impacto'),
    postings: 2,
    salary: SALARY.environment,
    sectors: ['Consultoras', 'Petróleo e gás', 'Construção', 'Gestão de resíduos'],
  }),
  agriculture({
    slug: 'tecnico-de-ambiente',
    description:
      'Controla os resíduos, as descargas e as licenças ambientais de uma empresa. Foi a profissão com mais anúncios da área: 8 deles vieram do RECLIMA e de outros projectos do Ministério da Energia e Águas, e os restantes de empresas e consultoras.',
    dayToDay: [
      'Controlar os resíduos',
      'Medir descargas e ruído',
      'Inspeccionar obras',
      'Preparar relatórios',
      'Formar os trabalhadores',
    ],
    workContext: GREEN,
    workStyles: ['Organização', 'Rigor', 'Honestidade', 'Comunicação', 'Sentido prático'],
    skills: [
      skill('gestao-residuos', 'Gestão de resíduos'),
      skill('monitorizacao-ambiental', 'Monitorização ambiental'),
      skill('licenciamento-ambiental', 'Licenciamento ambiental'),
      REPORTS,
    ],
    pathways: [
      universityRoute('Engenharia do Ambiente ou Gestão do Ambiente são as bases.', [
        degree('Gestão do Ambiente', 'Ou Engenharia do Ambiente.'),
        firstJob(
          'Programa para jovens ou obra',
          'O RECLIMA procurou jovens profissionais em várias províncias.',
        ),
      ]),
    ],
    stages: fieldStages('Técnico de Ambiente', 'Coordenador de Ambiente', 'as regras ambientais'),
    postings: 14,
    salary: SALARY.environment,
    sectors: ['Projectos públicos', 'Construção', 'Petróleo e gás', 'Consultoras'],
    extra: ' Os anúncios de qualidade, higiene e segurança (QHSE) não entram nesta conta.',
  }),
  logistics({
    slug: 'gestor-de-logistica',
    description:
      'Organiza o caminho dos produtos, do fornecedor ao cliente: compras, armazéns, transportes e stocks. Teve 29 anúncios nos últimos 12 meses, de chefes de armazém a directores de cadeia de abastecimento.',
    dayToDay: [
      'Planear compras e entregas',
      'Dirigir armazéns',
      'Negociar transportes',
      'Controlar stocks',
      'Reduzir custos',
    ],
    workContext: LOGISTICS_DESK,
    workStyles: ['Organização', 'Liderança', 'Resolução de problemas', 'Calma', 'Sentido de custos'],
    skills: [
      skill('cadeia-abastecimento', 'Gestão da cadeia de abastecimento'),
      skill('gestao-stocks', 'Gestão de stocks'),
      skill('erp', 'Sistemas de gestão (ERP)'),
      skill('incoterms', 'Incoterms e comércio internacional'),
      EXCEL,
    ],
    pathways: [
      universityRoute('A licenciatura em Logística é a via directa, mas muitos gestores vêm da Gestão.', [
        LOGISTICS,
        SUPPLY_CERT,
        firstJob(
          'Técnico de logística ou armazém',
          'A maior parte dos gestores começa no armazém ou nas compras.',
        ),
      ]),
    ],
    stages: fieldStages('Técnico Superior de Logística', 'Director de Logística', 'o circuito da mercadoria'),
    postings: 29,
    salary: SALARY.logistics,
    sectors: ['Distribuição', 'Petróleo e gás', 'Indústria', 'Comércio'],
  }),
  logistics({
    slug: 'tecnico-de-logistica',
    description:
      'Recebe, arruma e despacha a mercadoria e controla o stock do armazém. Há muitos anúncios, sobretudo de fiel de armazém e de operador.',
    dayToDay: [
      'Receber mercadoria',
      'Conferir guias e facturas',
      'Arrumar e etiquetar',
      'Preparar saídas',
      'Registar no sistema',
    ],
    workContext: SITE,
    workStyles: [
      'Organização',
      'Honestidade',
      'Atenção ao pormenor',
      'Resistência física',
      'Trabalho em equipa',
    ],
    skills: [
      skill('gestao-armazem', 'Gestão de armazém'),
      skill('inventarios', 'Inventários'),
      skill('erp', 'Sistemas de gestão (ERP)'),
      EXCEL,
      skill('empilhador', 'Condução de empilhador', 'opcional'),
    ],
    pathways: [
      technicalRoute('Entras mais cedo. O que conta é a experiência e a honestidade.', [
        CAREER_MEDIUM('Curso médio de gestão ou contabilidade'),
        firstJob('Ajudante ou fiel de armazém', 'Começa como ajudante e ganha experiência.'),
      ]),
      universityRoute('A licenciatura abre chefias.', [
        LOGISTICS,
        firstJob('Técnico de logística', 'Distribuidores e empresas de serviços ao petróleo.'),
      ]),
    ],
    stages: fieldStages('Técnico de Logística', 'Chefe de Armazém', 'as rotinas do armazém'),
    postings: 16,
    salary: SALARY.stock,
    sectors: ['Distribuição', 'Comércio', 'Peças auto', 'Serviços ao petróleo'],
  }),
  logistics({
    slug: 'despachante-aduaneiro',
    description:
      'Trata dos papéis e dos impostos para a mercadoria entrar ou sair do país pela alfândega. É uma profissão fechada: em 2023 havia 201 despachantes oficiais, e só a assinatura de um despachante oficial permite entregar o processo. Entra-se como ajudante e sobe-se por concurso.',
    dayToDay: [
      'Classificar mercadorias',
      'Calcular direitos e impostos',
      'Preparar o processo',
      'Falar com a alfândega',
      'Acompanhar a saída da carga',
    ],
    workContext: LOGISTICS_DESK,
    workStyles: ['Rigor', 'Honestidade', 'Persistência', 'Organização', 'Calma'],
    skills: [
      skill('pauta-aduaneira', 'Pauta aduaneira e classificação'),
      skill('legislacao-aduaneira', 'Legislação aduaneira'),
      skill('incoterms', 'Incoterms e comércio internacional'),
      EXCEL,
    ],
    pathways: [
      universityRoute(
        'Costuma pedir-se formação em contabilidade ou direito. Não há um curso próprio e aprende-se a trabalhar.',
        [
          degree('Contabilidade', 'Ou Direito.'),
          firstJob('Ajudante de despachante', 'O caminho faz-se num escritório de despachante.'),
          {
            ...certification(
              'Concurso público e cédula',
              'No concurso de 2021-2022 fizeram prova 589 candidatos e passaram 222. Sem cédula não se exerce em pleno. Confirma as regras na AGT e na Câmara dos Despachantes Oficiais de Angola.',
            ),
            need: 'essencial',
            certificate: 'exigido',
          },
        ],
      ),
    ],
    stages: career(
      [
        'Ajudante de Despachante',
        'Despachante Oficial',
        'Despachante Oficial Sénior',
        'Dono de Escritório de Despacho',
      ],
      [
        ['Prepara os processos', 'Assina só com autorização'],
        ['Assina os processos', 'Responde perante a alfândega'],
        ['Leva cargas complexas', 'Forma ajudantes'],
        ['Gere o escritório', 'Angaria clientes'],
      ],
    ),
    postings: 9,
    salary: SALARY.customs,
    sectors: ['Escritórios de despacho', 'Transitários', 'Importadores'],
  }),
  logistics({
    slug: 'tecnico-de-transportes',
    description:
      'Planeia as rotas, os horários e a manutenção dos camiões, autocarros ou comboios de uma empresa. Os anúncios dos últimos 12 meses pediam sobretudo gestores de frota.',
    dayToDay: [
      'Planear viagens',
      'Escalar motoristas',
      'Controlar combustível',
      'Marcar manutenções',
      'Tratar de seguros e documentos',
    ],
    workContext: SITE,
    workStyles: ['Organização', 'Decisão', 'Calma', 'Liderança', 'Honestidade'],
    skills: [
      skill('gestao-frota', 'Gestão de frotas'),
      skill('planeamento-rotas', 'Planeamento de rotas'),
      skill('custos-transporte', 'Custos de transporte'),
      EXCEL,
    ],
    pathways: [
      universityRoute('Logística e Transportes é a via directa.', [
        LOGISTICS,
        firstJob('Assistente de frota', 'Empresas de transporte e de serviços com viaturas próprias.'),
      ]),
    ],
    stages: fieldStages('Técnico de Transportes', 'Director de Transportes', 'a rotina da frota'),
    postings: 5,
    salary: SALARY.fleet,
    sectors: ['Transportes', 'Distribuição', 'Mineração', 'Serviços'],
  }),
  logistics({
    slug: 'engenheiro-de-transportes',
    description:
      'Projecta estradas, linhas de comboio, portos e redes de transporte. Com o Corredor do Lobito e as grandes obras há trabalho no sector, embora os anúncios costumem pedir engenheiros civis.',
    dayToDay: [
      'Estudar o tráfego',
      'Projectar vias',
      'Acompanhar obras',
      'Avaliar custos',
      'Preparar relatórios',
    ],
    workContext: GREEN,
    workStyles: ['Rigor', 'Visão global', 'Sentido prático', 'Trabalho em equipa', 'Organização'],
    skills: [
      skill('planeamento-transportes', 'Planeamento de transportes'),
      skill('projecto-vias', 'Projecto de vias'),
      skill('autocad-sig', 'AutoCAD e SIG'),
      REPORTS,
    ],
    pathways: [
      universityRoute('Engenharia dos Transportes é a via directa. Engenharia Civil também serve.', [
        degree('Engenharia dos Transportes', 'Ou Engenharia de Gestão Logística e dos Transportes.'),
        firstJob('Empresa de construção ou operador', 'Caminhos-de-ferro, portos e empreiteiros.'),
      ]),
    ],
    stages: fieldStages('Engenheiro de Transportes', 'Director de Projecto', 'os projectos de vias'),
    postings: 0,
    salary: SALARY.transportEngineer,
    sectors: ['Caminhos-de-ferro', 'Construção', 'Ministério dos Transportes', 'Portos'],
  }),
  logistics({
    slug: 'gestor-portuario',
    description:
      'Organiza a entrada dos navios e o movimento da carga num porto. Os grandes terminais estão concessionados: a DP World gere o Terminal Multiusos de Luanda desde 2021 e a Africa Global Logistics os terminais do Lobito desde 2024. A DP World teve um programa de recrutamento de recém-licenciados, o Grow.',
    dayToDay: [
      'Planear atracações',
      'Coordenar gruas e equipas',
      'Controlar contentores',
      'Tratar com agentes e alfândega',
      'Medir a produtividade',
    ],
    workContext: SITE,
    workStyles: ['Liderança', 'Organização', 'Decisão', 'Sentido de segurança', 'Calma'],
    skills: [
      skill('operacoes-portuarias', 'Operações portuárias'),
      skill('gestao-terminais', 'Gestão de terminais'),
      skill('seguranca-portuaria', 'Segurança portuária'),
      ENGLISH,
      EXCEL,
    ],
    pathways: [
      universityRoute('Logística e Transportes é a base mais próxima.', [
        LOGISTICS,
        firstJob(
          'Programa de recém-licenciados ou agente de navegação',
          'Confirma se a DP World abriu nova edição do Grow.',
        ),
      ]),
    ],
    stages: fieldStages('Técnico de Operações Portuárias', 'Director de Terminal', 'as operações do cais'),
    postings: 0,
    salary: SALARY.port,
    sectors: ['Terminais portuários', 'Agentes de navegação', 'Empresas portuárias públicas'],
  }),
  logistics({
    slug: 'inspector-de-aviacao-civil',
    description:
      'Fiscaliza companhias aéreas, aeroportos e aviões para garantir a segurança dos voos. Trabalha na Autoridade Nacional da Aviação Civil, normalmente depois de anos de experiência no sector. Não encontrámos regras publicadas para esta carreira, por isso confirma na ANAC.',
    dayToDay: [
      'Auditar companhias aéreas',
      'Inspeccionar aviões e aeroportos',
      'Verificar licenças',
      'Investigar incidentes',
      'Escrever relatórios',
    ],
    workContext: context(
      'Aeroportos, hangares e gabinete',
      'Normal, com deslocações',
      'Pilotos, técnicos e companhias',
      'Frequentes',
    ),
    workStyles: ['Rigor', 'Independência', 'Firmeza', 'Atenção ao pormenor', 'Honestidade'],
    skills: [
      skill('regulamentos-icao', 'Normas da ICAO'),
      skill('auditoria-aviacao', 'Auditoria de segurança aérea'),
      skill('tecnica-aeronautica', 'Conhecimento técnico de aviação'),
      skill('ingles-aviacao', 'Inglês de aviação'),
    ],
    pathways: [
      universityRoute(
        'Uma formação técnica e anos no sector são o caminho habitual. Um inspector da ANAC indica cursos de inspector da ICAO no seu currículo.',
        [
          degree('Engenharia dos Transportes', 'Ou engenharia, pilotagem ou manutenção de aeronaves.'),
          firstJob('Experiência em aviação', 'Em companhias aéreas ou aeroportos.'),
          {
            ...certification(
              'Curso de inspector da ICAO',
              'A ICAO é a agência da ONU para a aviação civil. Confirma com a ANAC os cursos aceites.',
            ),
            need: 'recomendado',
          },
        ],
      ),
    ],
    stages: fieldStages('Técnico da Aviação Civil', 'Inspector Chefe', 'as normas da aviação'),
    postings: 0,
    salary: SALARY.aviation,
    sectors: ['Autoridade Nacional da Aviação Civil', 'Companhias aéreas', 'Aeroportos'],
  }),
  tourism({
    slug: 'gestor-hoteleiro',
    description:
      'Dirige um hotel ou apart-hotel: as equipas, os custos e a satisfação dos hóspedes. Nos últimos 12 meses houve vagas de director adjunto, gestor e gerente de hotel.',
    dayToDay: [
      'Acompanhar a ocupação',
      'Dirigir recepção, limpeza e sala',
      'Controlar custos',
      'Resolver queixas',
      'Fazer promoções',
    ],
    workContext: HOTEL,
    workStyles: ['Liderança', 'Simpatia', 'Organização', 'Calma', 'Sentido de negócio'],
    skills: [
      skill('gestao-hoteleira', 'Gestão hoteleira'),
      skill('receitas-precos', 'Preços e receitas'),
      SERVICE,
      skill('gestao-equipas', 'Gestão de equipas'),
      ENGLISH,
    ],
    pathways: [
      universityRoute('Gestão Hoteleira é a via directa, e a experiência em hotel pesa muito.', [
        HOTEL_DEGREE,
        firstJob('Recepção ou assistente de direcção', 'Muitos gestores começam na recepção.'),
      ]),
    ],
    stages: fieldStages('Assistente de Direcção de Hotel', 'Director de Hotel', 'cada departamento do hotel'),
    postings: 6,
    salary: SALARY.hotel,
    sectors: ['Hotéis', 'Apart-hotéis', 'Resorts'],
  }),
  tourism({
    slug: 'recepcionista-de-hotel',
    description:
      'Recebe os hóspedes, faz as entradas e as saídas e resolve o que for preciso. Só um anúncio dos últimos 12 meses era de recepção de hotel, mas houve cerca de 20 de recepcionista noutros sectores, e o trabalho é parecido.',
    dayToDay: [
      'Receber os hóspedes',
      'Fazer check-in e check-out',
      'Gerir reservas',
      'Receber pagamentos',
      'Tratar de pedidos',
    ],
    workContext: HOTEL,
    workStyles: ['Simpatia', 'Calma', 'Organização', 'Boa apresentação', 'Discrição'],
    skills: [
      SERVICE,
      skill('sistemas-reservas', 'Sistemas de reservas'),
      skill('caixa', 'Operação de caixa'),
      skill('ingles-basico', 'Inglês de atendimento'),
    ],
    pathways: [
      technicalRoute('Entras com o ensino médio e um curso de hotelaria.', [
        HOTEL_SCHOOL,
        firstJob('Recepcionista júnior', 'Aceita turnos da noite no início.'),
      ]),
      universityRoute('Licenciatura para chegar à direcção.', [
        HOTEL_DEGREE,
        firstJob('Recepção de um hotel', 'A experiência conta mais.'),
      ]),
    ],
    stages: fieldStages('Recepcionista', 'Chefe de Recepção', 'o sistema de reservas'),
    postings: 1,
    salary: SALARY.frontDesk,
    sectors: ['Hotéis', 'Apart-hotéis', 'Resorts'],
  }),
  tourism({
    slug: 'tecnico-de-turismo',
    description:
      'Planeia e promove viagens e destinos, em agências, nos serviços do Estado e nos hotéis. Desde 2024, as agências de viagens seguem o Decreto Presidencial 72/24, e não houve anúncios com este nome nos últimos 12 meses.',
    dayToDay: [
      'Criar pacotes de viagem',
      'Atender clientes',
      'Reservar voos e hotéis',
      'Promover destinos',
      'Preparar relatórios',
    ],
    workContext: context('Agência, serviço público ou hotel', 'Normal', 'Colegas, hotéis e guias', 'Algumas'),
    workStyles: ['Simpatia', 'Curiosidade', 'Organização', 'Boa comunicação', 'Criatividade'],
    skills: [
      skill('produtos-turisticos', 'Criação de produtos turísticos'),
      skill('reservas-voos', 'Reservas de voos'),
      SERVICE,
      ENGLISH,
    ],
    pathways: [
      universityRoute('Gestão de Turismo é a via directa.', [
        TOURISM_DEGREE,
        firstJob('Agência de viagens', 'Ou serviços provinciais de turismo.'),
      ]),
    ],
    stages: fieldStages('Técnico de Turismo', 'Director de Agência', 'os produtos de viagem'),
    postings: 0,
    salary: SALARY.travel,
    sectors: ['Agências de viagens', 'Ministério do Turismo', 'Hotéis'],
  }),
  tourism({
    slug: 'guia-turistico',
    description:
      'Acompanha visitantes e explica a história, a cultura e a natureza dos lugares. É sobretudo um trabalho por conta própria e sazonal, ligado a agências, por isso pode não ter um empregador fixo. Não encontrámos regras de licença para guias: confirma no Ministério do Turismo.',
    dayToDay: [
      'Preparar o percurso',
      'Acompanhar o grupo',
      'Contar a história dos lugares',
      'Cuidar da segurança',
      'Tratar de imprevistos',
    ],
    workContext: context(
      'Ao ar livre, em museus e parques',
      'Por visita, com fins-de-semana',
      'Motoristas, agências e grupos',
      'Constantes',
    ),
    workStyles: ['Simpatia', 'Boa comunicação', 'Paciência', 'Conhecimento local', 'Resistência física'],
    skills: [
      skill('historia-angola', 'História e cultura de Angola'),
      skill('conducao-grupos', 'Condução de grupos'),
      skill('primeiros-socorros', 'Primeiros socorros', 'opcional'),
      skill('linguas-estrangeiras', 'Línguas estrangeiras'),
    ],
    pathways: [
      universityRoute('Gestão de Turismo ajuda, mas as línguas e o conhecimento local pesam muito.', [
        TOURISM_DEGREE,
        firstJob('Colaborador de uma agência', 'Começa por um destino que conheces bem.'),
      ]),
    ],
    stages: fieldStages('Guia Turístico', 'Dono de Empresa de Turismo', 'os percursos'),
    postings: 0,
    salary: SALARY.guide,
    sectors: ['Agências de viagens', 'Parques e museus', 'Prática por conta própria'],
  }),
  tourism({
    slug: 'chefe-de-cozinha',
    description:
      'Dirige a cozinha: cria a ementa, organiza a equipa e garante a qualidade e a higiene. Foi a profissão da área com mais anúncios, quase todos de cozinheiro, em restaurantes, empresas e até fazendas. Começa-se como ajudante ou cozinheiro.',
    dayToDay: [
      'Planear a ementa',
      'Fazer compras e stocks',
      'Cozinhar e dirigir a equipa',
      'Controlar a higiene',
      'Calcular custos',
    ],
    workContext: KITCHEN,
    workStyles: ['Criatividade', 'Liderança', 'Resistência', 'Organização', 'Rapidez'],
    skills: [
      skill('tecnicas-cozinha', 'Técnicas de cozinha'),
      HYGIENE,
      skill('custos-ementa', 'Custos de ementa'),
      skill('gestao-cozinha', 'Gestão de uma cozinha'),
    ],
    pathways: [
      technicalRoute('Entras com um curso e aprendes a trabalhar. O que conta é o que sabes fazer.', [
        HOTEL_SCHOOL,
        firstJob('Ajudante de cozinha ou cozinheiro', 'Sobe-se com a experiência.'),
      ]),
    ],
    stages: career(
      ['Ajudante de Cozinha', 'Cozinheiro', 'Sub-Chefe de Cozinha', 'Chefe de Cozinha'],
      [
        ['Prepara ingredientes', 'Mantém a cozinha limpa'],
        ['Cozinha uma secção', 'Cumpre as receitas'],
        ['Substitui o chefe', 'Orienta a equipa'],
        ['Cria a ementa', 'Responde pela cozinha'],
      ],
    ),
    postings: 22,
    salary: SALARY.chef,
    sectors: ['Restaurantes', 'Hotéis', 'Empresas de catering', 'Obras e petróleo'],
    extra:
      ' Um cozinheiro ganha menos do que um chefe: o inquérito dá entre 114 214 e 395 306 Kz líquidos no início da carreira.',
  }),
  tourism({
    slug: 'gestor-de-restauracao',
    description:
      'Dirige um restaurante ou bar: a equipa, os stocks, os custos e os clientes. Nos últimos 12 meses houve anúncios de gerente de restaurante e chefe de sala.',
    dayToDay: [
      'Organizar turnos',
      'Receber clientes',
      'Controlar stocks e caixa',
      'Tratar de fornecedores',
      'Resolver queixas',
    ],
    workContext: HOTEL,
    workStyles: ['Liderança', 'Simpatia', 'Organização', 'Resistência', 'Sentido de negócio'],
    skills: [
      skill('gestao-restaurante', 'Gestão de restaurantes'),
      skill('custos-ementa', 'Custos de ementa'),
      SERVICE,
      HYGIENE,
      skill('gestao-equipas', 'Gestão de equipas'),
    ],
    pathways: [
      universityRoute('Gestão Hoteleira ajuda, mas muitos gerentes vêm da sala.', [
        HOTEL_DEGREE,
        firstJob('Empregado de mesa ou chefe de sala', 'Experiência de sala é a base.'),
      ]),
    ],
    stages: fieldStages('Chefe de Sala', 'Director de Restauração', 'o serviço de sala'),
    postings: 2,
    salary: SALARY.restaurant,
    sectors: ['Restaurantes', 'Hotéis', 'Bares', 'Catering'],
  }),
]

const jobartis = (label: string, path: string): SourceLink => ({
  label: `Jobartis: ${label}`,
  url: `https://www.jobartis.com/emprego-${path}`,
})
const angorecruta = (label: string, path: string): SourceLink => ({
  label: `AngoRecruta: ${label}`,
  url: `https://angorecruta.com/${path}/`,
})

const FARM: Company['areas'] = ['agricultura']
const WATER: Company['areas'] = ['pescas']
const GREEN_GROUP: Company['areas'] = ['ambiente']
const TRADE: Company['areas'] = ['logistica']
const PORTS: Company['areas'] = ['transportes']

export const LAST_AREAS_COMPANIES: Company[] = [
  employer(
    'novagrolider',
    'Novagrolíder',
    'agricultura',
    'Grupo agrícola com fazendas no Bom Jesus, Caxito, Quibala e Porto Amboim e unidades de transformação. Vende trigo às moagens.',
    [
      'gestor-de-empresas-agricolas',
      'engenheiro-agronomo',
      'engenheiro-agroalimentar',
      'tecnico-agropecuario',
    ],
    false,
    FARM,
    {
      label: 'Ver Angola: Novagrolíder e Grandes Moagens (2023)',
      url: 'https://www.verangola.net/va/pt/122023/Industria/38324/Grandes-Moagens-de-Angola-compra-85-toneladas-de-trigo-nacional-%C3%A0-Novagrol%C3%ADder.htm',
    },
  ),
  employer(
    'aldeia-nova',
    'Aldeia Nova',
    'agricultura',
    'Empresa agropecuária do Cuanza Sul, com centenas de famílias de agricultores e produção de carne.',
    ['zootecnico', 'gestor-de-empresas-agricolas'],
    false,
    FARM,
    {
      label: 'Euronews: as mega-fazendas do Cuanza Sul (2019)',
      url: 'https://www.euronews.com/business/2019/11/13/angola-s-kwanza-sul-megafarms-and-small-farmers',
    },
    'Cuanza Sul',
  ),
  employer(
    'fazenda-sol-nascente',
    'Fazenda Sol Nascente',
    'agricultura',
    'Anunciou uma vaga de engenheiro agrónomo, no Huambo.',
    ['engenheiro-agronomo'],
    true,
    FARM,
    jobartis('engenheiro agrónomo', 'fazenda-sol-nascente-engenheiro-agronomo'),
    'Huambo',
  ),
  employer(
    'espaco-agricola',
    'Espaço Agrícola',
    'agricultura',
    'Anunciou uma vaga de técnico de produção agrícola, em Malanje.',
    ['tecnico-agropecuario'],
    true,
    FARM,
    jobartis('técnico de produção agrícola', 'espaco-agricola-lda-tecnico-de-producao-agricola-m-f'),
    'Malanje',
  ),
  employer(
    'carter-center-angola',
    'Carter Center',
    'saude',
    'Organização que anunciou vagas de veterinário para o programa de erradicação da dracunculose.',
    ['medico-veterinario'],
    true,
    ['pecuaria'],
    jobartis('veterinário do programa', 'carter-center-veterinario-do-programa-ed'),
  ),
  employer(
    'quinta-do-bagre',
    'Quinta do Bagre',
    'agricultura',
    'Exploração de aquicultura em Caxito, com bagre e tilápia.',
    ['tecnico-de-aquicultura'],
    false,
    WATER,
    {
      label: 'Ver Angola: Quinta do Bagre (2023)',
      url: 'https://www.verangola.net/va/pt/092023/Industria/37190/Quinta-do-Bagre-pronta-para-produzir-700-toneladas-de-pescado-por-ano.htm',
    },
    'Bengo',
  ),
  employer(
    'atlantico-pescaria',
    'Atlântico Pescaria',
    'agricultura',
    'Empresa de pesca que anunciou 5 vagas em diferentes áreas.',
    ['tecnico-de-pescas'],
    false,
    WATER,
    angorecruta(
      'Atlântico Pescaria',
      'a-atlantico-pescaria-lda-abre-05-vagas-de-emprego-em-diferentes-areas',
    ),
  ),
  employer(
    'guanda-pesca',
    'Guanda Pesca',
    'agricultura',
    'Empresa de pesca de Benguela que procurou 8 profissionais de diferentes áreas.',
    ['tecnico-de-pescas'],
    false,
    WATER,
    angorecruta('Guanda Pesca', 'a-empresa-guanda-pesca-lda-procura-8-profissionais-de-diferentes-areas'),
    'Benguela',
  ),
  employer(
    'seatag-pesca',
    'Seatag Pesca',
    'agricultura',
    'Empresa de pesca do Zaire que abriu 9 vagas em diferentes áreas.',
    ['tecnico-de-pescas'],
    false,
    WATER,
    angorecruta(
      'Seatag Pesca',
      'a-empresa-seatag-pesca-lda-abre-09-vagas-para-trabalhadores-de-diferentes-areas',
    ),
    'Zaire',
  ),
  employer(
    'agencia-nacional-de-residuos',
    'Agência Nacional de Resíduos',
    'estado',
    'Licencia os operadores de resíduos e propõe as medidas de gestão de resíduos. Trabalha sob o Ministério do Ambiente.',
    ['tecnico-de-ambiente', 'engenheiro-do-ambiente'],
    false,
    GREEN_GROUP,
    {
      label: 'Decreto Presidencial n.º 181/14 (AngoLEX)',
      url: 'https://angolex.com/paginas/decreto-presidencial/estatuto-organico-da-agencia-nacional-de-residuos-181a-14a.html',
    },
  ),
  employer(
    'yingke-angola-consultoria',
    'YINGKE Angola Consultoria',
    'consultoria',
    'Anunciou uma vaga de ambientalista.',
    ['tecnico-de-ambiente', 'engenheiro-do-ambiente'],
    true,
    GREEN_GROUP,
    jobartis('ambientalista', 'yingke-angola-consultoria-ambientalista'),
  ),
  employer(
    'hispatec-globaltec',
    'Hispatec - Globaltec',
    'consultoria',
    'Anunciou uma vaga de técnico ambiental.',
    ['tecnico-de-ambiente'],
    true,
    GREEN_GROUP,
    jobartis('técnico ambiental', 'hispatec-lda-globaltec-tecnico-ambiental'),
  ),
  employer(
    'socinter',
    'Socinter',
    'comercio',
    'Sociedade de comércio internacional que anunciou uma vaga de supervisor de logística.',
    ['gestor-de-logistica', 'tecnico-de-logistica'],
    true,
    TRADE,
    jobartis(
      'supervisor de logística',
      'socinter-sociedade-de-comercio-internacional-lda-supervisor-de-logistica',
    ),
  ),
  employer(
    'africa-global-logistics',
    'Africa Global Logistics',
    'transportes',
    'Gere desde 2024 os terminais de contentores e multiusos do Lobito e anunciou uma vaga de supervisor de trânsito marítimo.',
    ['gestor-portuario', 'gestor-de-logistica', 'despachante-aduaneiro'],
    true,
    PORTS,
    jobartis('supervisor de trânsito marítimo', 'africa-global-logistics-supervisor-de-transito-maritimo'),
  ),
  employer(
    'dp-world-luanda',
    'DP World Luanda',
    'transportes',
    'Gere o Terminal Multiusos do Porto de Luanda desde 2021, com uma concessão de 20 anos. Em 2021 recrutou recém-licenciados no programa Grow.',
    ['gestor-portuario', 'tecnico-de-logistica'],
    false,
    PORTS,
    {
      label: 'Ver Angola: recrutamento para jovens no Porto de Luanda (2021)',
      url: 'https://www.verangola.net/va/pt/052021/Sociedade/25295/Gestora-do-Porto-de-Luanda-lan%C3%A7a-concurso-de-recrutamento-para-jovens-angolanos.htm',
    },
  ),
  employer(
    'merlion-agentes-de-navegacao',
    'Merlion - Agentes de Navegação',
    'transportes',
    'Anunciou uma vaga de agente de navegação para operações.',
    ['gestor-portuario'],
    true,
    PORTS,
    jobartis('agente de navegação', 'merlion-agentes-de-navegacao-lda-agente-de-navegacao-operacoes'),
  ),
  employer(
    'restaurante-pimms',
    'Restaurante Pimms',
    'turismo',
    'Anunciou vagas de cozinheiro chefe e de sala.',
    ['chefe-de-cozinha', 'gestor-de-restauracao'],
    true,
    ['turismo'],
    jobartis('sub-chefe de cozinha', 'restaurante-pimms-sub-chefe-de-cozinha-sub-chefe-de-sala'),
  ),
]
