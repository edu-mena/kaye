import type { Career, Company, Skill, SourceLink } from '../types'
import { technicalCourse } from './offshoreTrades'
import { ORDER } from './oilMiningGuides'
import {
  certification,
  course,
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

// The engineering and construction careers' full pages (ADR 0010), from public sources:
// - the demand: the job titles in the Angolan job ads of the last 12 months (scrapers/data/postings.jsonl);
// - the salaries: the WageIndicator 2026 survey for the same or the closest occupation, in the demand note;
// - the rules: the Order of Engineers' admission regulation and the Order of Architects' statute (Decreto n.º 54/04).

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

const SALARY = {
  civil: wage(
    'engenheiros-civis',
    'os engenheiros civis',
    'entre 493 864 e 882 343',
    'entre 672 762 e 1 210 790',
  ),
  closestCivil: wage(
    'engenheiros-civis',
    'a função mais próxima (engenheiros civis)',
    'entre 493 864 e 882 343',
    'entre 672 762 e 1 210 790',
  ),
  civilTechnician: wage(
    'tecnicos-de-engenharia-civil',
    'os técnicos de engenharia civil',
    'entre 227 255 e 1 385 341',
    'entre 281 531 e 1 878 949',
  ),
  closestTechnician: wage(
    'tecnicos-de-engenharia-civil',
    'a função mais próxima (técnicos de engenharia civil)',
    'entre 227 255 e 1 385 341',
    'entre 281 531 e 1 878 949',
  ),
  surveyor: wage(
    'cartografos-e-agrimensores',
    'os cartógrafos e agrimensores',
    'entre 214 512 e 707 383',
    'entre 373 897 e 1 186 122',
  ),
  architect: wage(
    'arquitectos-de-construcao',
    'os arquitectos',
    'entre 326 019 e 782 929',
    'entre 455 014 e 1 143 955',
  ),
  planner: wage(
    'planeadores-urbanos-e-de-trafego',
    'os planeadores urbanos e de tráfego',
    'entre 214 512 e 707 383',
    'entre 373 897 e 1 186 122',
  ),
  mechanical: wage(
    'engenheiros-mecanicos',
    'os engenheiros mecânicos',
    'entre 430 576 e 1 069 678',
    'entre 684 379 e 1 591 047',
  ),
  closestMechanical: wage(
    'engenheiros-mecanicos',
    'a função mais próxima (engenheiros mecânicos)',
    'entre 430 576 e 1 069 678',
    'entre 684 379 e 1 591 047',
  ),
  industrial: wage(
    'engenheiros-industriais-e-de-producao',
    'os engenheiros industriais e de produção',
    'entre 430 576 e 1 069 678',
    'entre 684 379 e 1 591 047',
  ),
  electronic: wage(
    'engenheiros-electronicos',
    'a função mais próxima (engenheiros electrónicos)',
    'entre 520 265 e 1 405 789',
    'entre 831 126 e 2 200 610',
  ),
  chemical: wage(
    'engenheiros-quimicos',
    'os engenheiros químicos',
    'entre 430 576 e 1 069 678',
    'entre 684 379 e 1 591 047',
  ),
  safety: wage(
    'profissionais-do-ambiente-e-saude-ocupacional-e',
    'os profissionais de ambiente e saúde ocupacional',
    'entre 263 233 e 869 657',
    'entre 418 092 e 1 429 876',
  ),
  electrical: wage(
    'engenheiros-electricos',
    'os engenheiros electrotécnicos',
    'entre 520 265 e 1 405 789',
    'entre 831 126 e 2 200 610',
  ),
  closestElectrical: wage(
    'engenheiros-electricos',
    'a função mais próxima (engenheiros electrotécnicos)',
    'entre 520 265 e 1 405 789',
    'entre 831 126 e 2 200 610',
  ),
  electrician: wage(
    'electricistas-de-construcao-civil-e-relacionados',
    'os electricistas da construção',
    'entre 123 286 e 461 980',
    'entre 187 324 e 729 862',
  ),
}

const OBRA: Career['workContext'] = [
  { label: 'Ambiente', value: 'Obra e escritório' },
  { label: 'Horário', value: 'Normal, com picos perto das entregas' },
  { label: 'Equipa', value: 'Engenheiros, encarregados e subempreiteiros' },
  { label: 'Viagens', value: 'Frequentes: as obras mudam de sítio e de província' },
]
const STUDIO: Career['workContext'] = [
  { label: 'Ambiente', value: 'Gabinete, com visitas às obras' },
  { label: 'Horário', value: 'Normal, com picos perto das entregas' },
  { label: 'Equipa', value: 'Arquitectos, engenheiros e clientes' },
  { label: 'Viagens', value: 'Algumas' },
]
const FACTORY: Career['workContext'] = [
  { label: 'Ambiente', value: 'Fábrica ou instalação industrial' },
  { label: 'Horário', value: 'Normal, com turnos e prevenção em muitas empresas' },
  { label: 'Equipa', value: 'Técnicos, operadores e produção' },
  { label: 'Segurança', value: 'Equipamento de protecção e procedimentos sempre' },
]
const FIELD: Career['workContext'] = [
  { label: 'Ambiente', value: 'No terreno, com tempo no escritório' },
  { label: 'Horário', value: 'Normal, com chamadas de avaria em muitas empresas' },
  { label: 'Equipa', value: 'Técnicos e um supervisor' },
  { label: 'Viagens', value: 'Frequentes' },
]

const CV: Career['cvGuide'] = {
  template: 'classico',
  include: [
    'As obras ou instalações em que trabalhaste, com o teu papel e a dimensão',
    'Os programas que dominas, como o AutoCAD, com um exemplo',
    'As certificações e a inscrição na Ordem, se tiveres',
    'O estágio e o trabalho de fim de curso, se estás a começar',
  ],
  avoid: [
    'Listas de tarefas sem resultados',
    'Programas que nunca usaste num trabalho',
    'Fotografia e dados pessoais que a vaga não pede',
  ],
}

const CAD = skill('autocad', 'AutoCAD')
const PROJECT_READING = skill('leitura-projectos', 'Leitura de projectos')
const SAFETY = skill('seguranca-trabalho', 'Segurança no trabalho')
const PLANNING = skill('planeamento-obra', 'Planeamento e controlo de custos')
const BIM = skill('bim', 'BIM (Revit ou semelhante)', 'opcional')
const MAINTENANCE = skill('manutencao-industrial', 'Manutenção industrial')
const ELECTRICITY = skill('electricidade', 'Instalações eléctricas')

const INTERNSHIP = firstJob(
  'Estágio profissional',
  'Muitas empresas contratam os estagiários que correm bem.',
)
const NEBOSH = certification(
  'Certificado de segurança, como o NEBOSH IGC',
  'É um certificado britânico muito pedido em projectos internacionais. Confirma que o centro é aprovado pela NEBOSH.',
)

const engineer = (name: string, about: string, summary = 'É o caminho normal para esta função.') =>
  universityRoute(summary, [degree(name, about), INTERNSHIP, ORDER])
const technician = (name: string, summary: string, job: string, detail: string) =>
  technicalRoute(summary, [technicalCourse(name), firstJob(job, detail)])

const guide = ({
  postings,
  salary,
  sectors,
  ...entry
}: Omit<Guide, 'market' | 'employerAsks' | 'cvGuide' | 'skills'> & {
  skills: Skill[]
  postings: number
  salary: TechSalary
  sectors: string[]
}): Guide => ({
  ...entry,
  employerAsks: null,
  market: marketOf(postings, salary, sectors, { name: 'engenharia e construção', total: 325 }),
  cvGuide: CV,
})

const BUILDERS = ['Construtoras', 'Empresas de fiscalização', 'Gabinetes de projecto', 'Estado']
const INDUSTRY = ['Indústria transformadora', 'Bebidas e alimentação', 'Petróleo e gás', 'Minas']
const POWER = ['Electricidade', 'Construção', 'Indústria', 'Petróleo e gás']

export const ENGINEERING_GUIDES: Guide[] = [
  guide({
    slug: 'engenheiro-civil',
    description:
      'Projecta e dirige a construção de edifícios, estradas, pontes e redes. É um dos cursos de engenharia com mais escolas em Angola e tem anúncios regulares, de construtoras, projectos do Estado e empresas de fiscalização.',
    dayToDay: [
      'Calcular e rever projectos',
      'Planear a obra e os custos',
      'Acompanhar as equipas no local',
      'Controlar a qualidade dos materiais',
      'Falar com o dono da obra e os fornecedores',
    ],
    workContext: OBRA,
    workStyles: ['Rigor', 'Liderança', 'Resolver problemas', 'Organização', 'Responsabilidade'],
    skills: [skill('estruturas', 'Cálculo de estruturas'), PROJECT_READING, PLANNING, CAD, BIM, SAFETY],
    pathways: [engineer('Engenharia Civil', 'Dá a base de estruturas, solos, materiais e obras.')],
    stages: ladder('Engenheiro Civil', 'Director de Obra', [
      ['Acompanha a obra', 'Faz medições e relatórios'],
      ['Responde por uma frente de obra', 'Controla prazos e qualidade'],
      ['Responde por obras inteiras', 'Orienta os mais novos'],
      ['Dirige obras ou projectos', 'Responde pelo custo e pelo prazo'],
    ]),
    postings: 18,
    salary: SALARY.civil,
    sectors: BUILDERS,
  }),
  guide({
    slug: 'tecnico-de-obras',
    description:
      'Organiza o trabalho na obra, ao lado do engenheiro: confirma medidas, materiais e equipas. Foi a função com mais anúncios da área, e pode começar-se com um curso médio.',
    dayToDay: [
      'Ler o projecto e marcar o trabalho',
      'Distribuir as tarefas das equipas',
      'Controlar materiais e medições',
      'Verificar a qualidade do que foi feito',
      'Preencher o diário de obra',
    ],
    workContext: OBRA,
    workStyles: ['Organização', 'Liderança', 'Sentido prático', 'Responsabilidade', 'Trabalhar em equipa'],
    skills: [
      PROJECT_READING,
      skill('medicoes', 'Medições'),
      skill('materiais-construcao', 'Materiais de construção'),
      CAD,
      SAFETY,
    ],
    pathways: [
      technician(
        'Construção Civil',
        'O caminho mais comum e mais rápido para entrar na obra.',
        'Primeiro emprego numa obra',
        'Muitos começam como auxiliares técnicos ou encarregados.',
      ),
      universityRoute('Com o tempo, podes tirar a licenciatura e passar a engenheiro.', [
        degree('Engenharia Civil', 'Ou Engenharia de Construção Civil.'),
        INTERNSHIP,
      ]),
    ],
    stages: ladder('Técnico de Construção Civil', 'Encarregado Geral', [
      ['Apoia as medições', 'Acompanha uma equipa'],
      ['Organiza uma frente de obra', 'Controla os materiais'],
      ['Coordena várias equipas', 'Orienta os mais novos'],
      ['Coordena a obra no terreno', 'Responde perante o director de obra'],
    ]),
    postings: 26,
    salary: SALARY.civilTechnician,
    sectors: BUILDERS,
  }),
  guide({
    slug: 'medidor-orcamentista',
    description:
      'Calcula quanto vai custar uma obra, medindo tudo o que o projecto pede. Sem um bom orçamento a obra perde dinheiro, por isso as construtoras procuram quem tenha rigor e saiba ler projectos.',
    dayToDay: [
      'Medir as quantidades do projecto',
      'Pedir preços a fornecedores',
      'Preparar orçamentos e propostas',
      'Controlar o custo durante a obra',
      'Preparar os autos de medição',
    ],
    workContext: STUDIO,
    workStyles: ['Rigor', 'Organização', 'Atenção ao detalhe', 'Cumprir prazos', 'Honestidade'],
    skills: [
      PROJECT_READING,
      skill('orcamentacao', 'Orçamentação'),
      skill('excel', 'Excel avançado'),
      CAD,
      PLANNING,
    ],
    pathways: [
      technician(
        'Construção Civil',
        'Começa-se muitas vezes pelo curso médio e por trabalho em obra.',
        'Primeiro emprego num departamento de orçamentos',
        'A experiência em obra ajuda a medir bem.',
      ),
      universityRoute('A licenciatura abre os cargos de direcção de custos.', [
        degree('Engenharia Civil', 'Ou Engenharia de Construção Civil.'),
        INTERNSHIP,
      ]),
    ],
    stages: ladder('Medidor-Orçamentista', 'Director de Orçamentos', [
      ['Faz medições', 'Pede preços'],
      ['Faz orçamentos sozinho', 'Prepara autos de medição'],
      ['Responde por propostas grandes', 'Orienta os mais novos'],
      ['Dirige os orçamentos', 'Decide os preços com a direcção'],
    ]),
    postings: 9,
    salary: SALARY.closestTechnician,
    sectors: ['Construtoras', 'Gabinetes de projecto', 'Empresas de fiscalização'],
  }),
  guide({
    slug: 'topografo',
    description:
      'Mede o terreno e marca no chão onde cada obra vai nascer. Trabalha ao ar livre, com instrumentos de precisão e GPS. Os anúncios com este nome são poucos, mas as obras e as minas precisam da função.',
    dayToDay: [
      'Medir terrenos com estação total e GPS',
      'Marcar eixos e cotas na obra',
      'Desenhar plantas topográficas',
      'Calcular áreas e volumes',
      'Confirmar o que foi construído',
    ],
    workContext: FIELD,
    workStyles: ['Precisão', 'Autonomia', 'Resistência física', 'Atenção ao detalhe', 'Organização'],
    skills: [
      skill('estacao-total', 'Estação total e GPS'),
      skill('calculo-topografico', 'Cálculo topográfico'),
      CAD,
    ],
    pathways: [
      technician(
        'Construção Civil ou Topografia',
        'Um curso técnico e muito tempo de campo.',
        'Primeiro emprego como ajudante de topógrafo',
        'Aprende-se a usar os aparelhos ao lado de quem sabe.',
      ),
      universityRoute('A licenciatura abre as funções de cartografia e gestão do território.', [
        degree(
          'Engenharia Geográfica',
          'Dá a base de topografia, cartografia e sistemas de informação geográfica.',
        ),
        INTERNSHIP,
      ]),
    ],
    stages: ladder('Topógrafo', 'Chefe de Topografia', [
      ['Ajuda nas medições', 'Aprende os aparelhos'],
      ['Faz levantamentos sozinho', 'Marca obras'],
      ['Responde pela topografia de uma obra', 'Orienta os ajudantes'],
      ['Dirige a equipa de topografia', 'Confirma os trabalhos difíceis'],
    ]),
    postings: 2,
    salary: SALARY.surveyor,
    sectors: ['Construtoras', 'Estradas', 'Minas', 'Estado'],
  }),
  guide({
    slug: 'engenheiro-hidraulico',
    description:
      'Projecta e gere sistemas de água: abastecimento, saneamento, barragens e rega. Em 2026 teve vários anúncios, muitos para jovens recém-licenciados em projectos do Ministério da Energia e Águas.',
    dayToDay: [
      'Calcular redes de água e esgotos',
      'Estudar rios e chuvas',
      'Acompanhar obras hidráulicas',
      'Controlar a qualidade dos trabalhos',
      'Preparar relatórios para o Estado e os doadores',
    ],
    workContext: OBRA,
    workStyles: ['Rigor', 'Sentido prático', 'Trabalhar em equipa', 'Resolver problemas', 'Autonomia'],
    skills: [
      skill('hidraulica', 'Hidráulica'),
      skill('saneamento', 'Saneamento e redes de água'),
      PROJECT_READING,
      CAD,
    ],
    pathways: [
      engineer(
        'Engenharia Hidráulica',
        'Ou Engenharia em Recursos Hídricos. Dá a base de água, redes e obras.',
      ),
    ],
    stages: ladder('Engenheiro Hidráulico', 'Director de Projecto', [
      ['Apoia os cálculos', 'Acompanha obras'],
      ['Projecta redes', 'Fiscaliza trabalhos'],
      ['Responde por projectos', 'Orienta os mais novos'],
      ['Dirige projectos de água', 'Fala com o Estado e os financiadores'],
    ]),
    postings: 13,
    salary: SALARY.closestCivil,
    sectors: ['Energia e Águas', 'Empresas de água', 'Construtoras', 'Projectos de cooperação'],
  }),
  guide({
    slug: 'arquitecto',
    description:
      'Desenha edifícios e espaços que sejam úteis, seguros e bonitos, e acompanha a sua construção. A Ordem dos Arquitectos de Angola tinha 1633 inscritos em 2022, 90% em Luanda, e disse que o país precisava do dobro.',
    dayToDay: [
      'Ouvir o que o cliente precisa',
      'Desenhar plantas e modelos 3D',
      'Tratar das licenças do projecto',
      'Coordenar os engenheiros',
      'Acompanhar a obra',
    ],
    workContext: STUDIO,
    workStyles: ['Criatividade', 'Sentido prático', 'Comunicação', 'Atenção ao detalhe', 'Persistência'],
    skills: [
      skill('projecto-arquitectura', 'Projecto de arquitectura'),
      CAD,
      BIM,
      skill('modelacao-3d', 'Modelação 3D'),
      skill('legislacao-urbanistica', 'Regras de urbanismo'),
    ],
    pathways: [
      universityRoute('Precisas da licenciatura e da inscrição na Ordem.', [
        degree('Arquitectura', 'Ou Arquitectura e Urbanismo. Dá a base de projecto, desenho e construção.'),
        INTERNSHIP,
        certification(
          'Inscrição na Ordem dos Arquitectos de Angola',
          'A Ordem já ameaçou levar a tribunal quem exerce sem inscrição. Confirma com ela os passos actuais.',
        ),
      ]),
    ],
    stages: ladder('Arquitecto', 'Director de Atelier', [
      ['Desenha sob orientação', 'Prepara peças do projecto'],
      ['Faz projectos sozinho', 'Acompanha obras'],
      ['Responde por projectos grandes', 'Orienta os mais novos'],
      ['Dirige o atelier', 'Fala com os clientes'],
    ]),
    postings: 6,
    salary: SALARY.architect,
    sectors: ['Gabinetes de arquitectura', 'Construtoras', 'Imobiliário', 'Estado'],
  }),
  guide({
    slug: 'urbanista',
    description:
      'Planeia como uma cidade deve crescer: onde ficam casas, ruas, escolas e serviços. Quase não há anúncios com este nome, e o trabalho concentra-se no Estado, nas administrações locais e em consultoras.',
    dayToDay: [
      'Estudar o território e a população',
      'Desenhar planos de bairros e cidades',
      'Propor regras de ocupação',
      'Ouvir comunidades e autoridades',
      'Avaliar pedidos de construção',
    ],
    workContext: STUDIO,
    workStyles: ['Visão de conjunto', 'Comunicação', 'Paciência', 'Sentido social', 'Rigor'],
    skills: [
      skill('planeamento-urbano', 'Planeamento urbano'),
      skill('sig', 'Sistemas de informação geográfica'),
      CAD,
      skill('legislacao-urbanistica', 'Regras de urbanismo'),
    ],
    pathways: [
      universityRoute('É o caminho normal.', [
        degree('Arquitectura e Urbanismo', 'Ou Planeamento Regional e Urbano.'),
        INTERNSHIP,
      ]),
    ],
    stages: ladder('Urbanista', 'Director de Urbanismo', [
      ['Recolhe dados', 'Faz mapas'],
      ['Prepara partes de um plano', 'Analisa pedidos'],
      ['Responde por planos', 'Orienta os mais novos'],
      ['Dirige o urbanismo', 'Fala com as autoridades'],
    ]),
    postings: 1,
    salary: SALARY.planner,
    sectors: ['Estado', 'Administrações locais', 'Consultoras', 'Gabinetes de projecto'],
  }),
  guide({
    slug: 'desenhador-projectista',
    description:
      'Transforma as ideias dos engenheiros e arquitectos em desenhos exactos no computador. É uma boa entrada para quem tem o curso médio, e os anúncios pedem sobretudo AutoCAD.',
    dayToDay: [
      'Desenhar plantas e cortes no computador',
      'Corrigir os desenhos com as alterações',
      'Preparar as peças para a obra',
      'Organizar os ficheiros do projecto',
      'Confirmar medidas com a equipa',
    ],
    workContext: STUDIO,
    workStyles: ['Atenção ao detalhe', 'Paciência', 'Organização', 'Cumprir prazos', 'Trabalhar em equipa'],
    skills: [CAD, BIM, PROJECT_READING, skill('desenho-tecnico', 'Desenho técnico')],
    pathways: [
      technicalRoute('O caminho mais comum: curso médio e prática no computador.', [
        technicalCourse('Desenhador Projectista'),
        course('Curso de AutoCAD', 'Num centro de formação, com projectos reais.', 1, 4),
        firstJob('Primeiro emprego num gabinete', 'Leva exemplos dos teus desenhos à entrevista.'),
      ]),
    ],
    stages: ladder('Desenhador', 'Coordenador de Desenho', [
      ['Corrige desenhos', 'Aprende as normas'],
      ['Desenha sozinho', 'Prepara peças da obra'],
      ['Responde pelos desenhos de um projecto', 'Orienta os mais novos'],
      ['Coordena a equipa de desenho', 'Garante a qualidade'],
    ]),
    postings: 7,
    salary: SALARY.closestTechnician,
    sectors: ['Gabinetes de projecto', 'Construtoras', 'Indústria'],
  }),
  guide({
    slug: 'engenheiro-mecanico',
    description:
      'Projecta, escolhe e mantém máquinas e equipamentos. Trabalha em fábricas, projectos de energia e água, metalomecânica e serviços petrolíferos. Em 2026 o Ministério da Energia e Águas procurou recém-licenciados e a Fabrimetal anunciou esta vaga.',
    dayToDay: [
      'Escolher e dimensionar equipamentos',
      'Acompanhar a montagem de máquinas',
      'Planear a manutenção',
      'Investigar avarias',
      'Trabalhar com fornecedores',
    ],
    workContext: FACTORY,
    workStyles: [
      'Raciocínio lógico',
      'Sentido prático',
      'Resolver problemas',
      'Rigor',
      'Trabalhar em equipa',
    ],
    skills: [
      skill('mecanica-maquinas', 'Mecânica e máquinas'),
      skill('desenho-mecanico', 'Desenho mecânico (CAD)'),
      MAINTENANCE,
      SAFETY,
    ],
    pathways: [
      engineer(
        'Engenharia Mecânica',
        'Ou Engenharia Electromecânica. Dá a base de máquinas, materiais e energia.',
      ),
    ],
    stages: ladder('Engenheiro Mecânico', 'Director Técnico', [
      ['Apoia a equipa técnica', 'Acompanha trabalhos'],
      ['Responde por equipamentos', 'Planeia intervenções'],
      ['Lidera projectos', 'Orienta os mais novos'],
      ['Dirige a área técnica', 'Decide os investimentos'],
    ]),
    postings: 5,
    salary: SALARY.mechanical,
    sectors: INDUSTRY,
  }),
  guide({
    slug: 'engenheiro-de-manutencao',
    description:
      'Faz com que as máquinas de uma fábrica ou instalação não parem. Organiza as equipas, as peças e os planos de manutenção. Tem bastantes anúncios, em fábricas, hotéis, edifícios e indústria.',
    dayToDay: [
      'Planear a manutenção preventiva',
      'Organizar as equipas de avaria',
      'Controlar peças e custos',
      'Analisar porque é que as máquinas falham',
      'Acompanhar empresas contratadas',
    ],
    workContext: FACTORY,
    workStyles: ['Organização', 'Liderança', 'Calma sob pressão', 'Resolver problemas', 'Responsabilidade'],
    skills: [
      MAINTENANCE,
      skill('gestao-manutencao', 'Sistemas de gestão da manutenção'),
      ELECTRICITY,
      SAFETY,
    ],
    pathways: [
      engineer(
        'Engenharia Mecânica',
        'Ou Engenharia Electromecânica, ou Organização e Manutenção Industrial.',
      ),
      technician(
        'Electromecânica',
        'Muitos chegam a responsáveis pela experiência de técnico.',
        'Primeiro emprego como técnico de manutenção',
        'Depois podes tirar a licenciatura.',
      ),
    ],
    stages: ladder('Engenheiro de Manutenção', 'Director de Manutenção', [
      ['Acompanha as equipas', 'Regista avarias'],
      ['Planeia a manutenção de uma área', 'Controla peças'],
      ['Responde pela manutenção de uma fábrica', 'Orienta os mais novos'],
      ['Dirige a manutenção', 'Responde pelo orçamento'],
    ]),
    postings: 10,
    salary: SALARY.closestMechanical,
    sectors: ['Fábricas', 'Hotéis e edifícios', 'Petróleo e gás', 'Minas'],
  }),
  guide({
    slug: 'engenheiro-de-producao-industrial',
    description:
      'Organiza como uma fábrica produz: pessoas, máquinas, materiais e tempo. Procura produzir mais, melhor e com menos desperdício. Os anúncios aparecem sobretudo como director ou responsável de produção, e pedem experiência.',
    dayToDay: [
      'Planear a produção',
      'Medir tempos e desperdícios',
      'Propor melhorias',
      'Coordenar equipas por turnos',
      'Controlar a qualidade',
    ],
    workContext: FACTORY,
    workStyles: ['Organização', 'Liderança', 'Decidir com dados', 'Resolver problemas', 'Melhorar sempre'],
    skills: [
      skill('planeamento-producao', 'Planeamento da produção'),
      skill('lean', 'Melhoria contínua (Lean)'),
      skill('qualidade', 'Gestão da qualidade'),
      SAFETY,
    ],
    pathways: [engineer('Engenharia e Gestão Industrial', 'Ou Engenharia de Produção Industrial.')],
    stages: ladder('Engenheiro de Produção', 'Director de Produção', [
      ['Recolhe dados da produção', 'Apoia melhorias'],
      ['Responde por uma linha', 'Coordena uma equipa'],
      ['Responde por uma área da fábrica', 'Orienta os mais novos'],
      ['Dirige a produção', 'Responde pelos resultados'],
    ]),
    postings: 4,
    salary: SALARY.industrial,
    sectors: ['Bebidas e alimentação', 'Plásticos e embalagens', 'Metalomecânica', 'Materiais de construção'],
  }),
  guide({
    slug: 'engenheiro-mecatronico',
    description:
      'Junta mecânica, electrónica e programação para criar e manter máquinas automáticas. No anuário de 2023-2024 havia poucos cursos. Nos anúncios aparece mais como técnico de automação, incluindo em máquinas bancárias.',
    dayToDay: [
      'Programar automatismos',
      'Instalar sensores e motores',
      'Diagnosticar avarias em máquinas',
      'Testar melhorias',
      'Documentar os sistemas',
    ],
    workContext: FACTORY,
    workStyles: ['Curiosidade técnica', 'Raciocínio lógico', 'Resolver problemas', 'Rigor', 'Autonomia'],
    skills: [
      skill('automacao-plc', 'Automação e PLC'),
      skill('electronica', 'Electrónica'),
      skill('mecanica-maquinas', 'Mecânica e máquinas'),
      skill('programacao', 'Programação', 'opcional'),
    ],
    pathways: [engineer('Engenharia Mecatrónica', 'Dá a base de mecânica, electrónica e controlo.')],
    stages: ladder('Engenheiro Mecatrónico', 'Chefe de Automação', [
      ['Apoia instalações', 'Faz testes'],
      ['Programa e repara sistemas', 'Responde por equipamentos'],
      ['Lidera projectos de automação', 'Orienta os mais novos'],
      ['Dirige a automação', 'Decide as tecnologias'],
    ]),
    postings: 7,
    salary: SALARY.electronic,
    sectors: ['Indústria', 'Assistência a equipamentos', 'Banca (máquinas)', 'Petróleo e gás'],
  }),
  guide({
    slug: 'engenheiro-quimico',
    description:
      'Transforma matérias-primas em produtos, como combustíveis, cimento, bebidas ou plásticos, de forma segura. Não encontrei anúncios com este nome nos últimos 12 meses, por isso vale a pena procurar também funções de processos, qualidade e laboratório.',
    dayToDay: [
      'Vigiar processos de produção',
      'Fazer análises de qualidade',
      'Calcular quantidades e rendimentos',
      'Propor melhorias',
      'Cumprir regras de segurança e ambiente',
    ],
    workContext: FACTORY,
    workStyles: [
      'Rigor',
      'Curiosidade técnica',
      'Disciplina em segurança',
      'Raciocínio lógico',
      'Trabalhar em equipa',
    ],
    skills: [
      skill('processos-quimicos', 'Processos químicos'),
      skill('laboratorio', 'Análises de laboratório'),
      skill('qualidade', 'Gestão da qualidade'),
      SAFETY,
    ],
    pathways: [engineer('Engenharia Química', 'Dá a base de química, processos e energia.')],
    stages: ladder('Engenheiro Químico', 'Director de Processos', [
      ['Faz análises', 'Recolhe dados'],
      ['Responde por um processo', 'Propõe melhorias'],
      ['Lidera projectos', 'Orienta os mais novos'],
      ['Dirige a qualidade ou a produção', 'Responde pelos resultados'],
    ]),
    postings: 0,
    salary: SALARY.chemical,
    sectors: ['Refinarias', 'Bebidas e alimentação', 'Cimento', 'Laboratório de engenharia'],
  }),
  guide({
    slug: 'tecnico-de-seguranca-no-trabalho',
    description:
      'Previne acidentes e doenças no trabalho. Foi das funções com mais anúncios da área, porque obras, fábricas, petróleo e minas precisam dela. Os anúncios chamam-lhe HST, HSE ou QHSE, e projectos internacionais costumam valorizar certificados.',
    dayToDay: [
      'Identificar perigos no local',
      'Fazer inspecções e registar falhas',
      'Dar formações curtas às equipas',
      'Investigar acidentes',
      'Verificar o equipamento de protecção',
    ],
    workContext: OBRA,
    workStyles: ['Observação', 'Firmeza', 'Comunicação', 'Responsabilidade', 'Organização'],
    skills: [
      SAFETY,
      skill('avaliacao-riscos', 'Avaliação de riscos'),
      skill('investigacao-acidentes', 'Investigação de acidentes'),
      skill('primeiros-socorros', 'Primeiros socorros', 'opcional'),
    ],
    pathways: [
      technicalRoute('O caminho mais rápido: curso de segurança e prática em obra.', [
        technicalCourse('Higiene e Segurança no Trabalho'),
        NEBOSH,
        firstJob('Primeiro emprego como técnico de HST', 'Obras e fábricas são boas portas de entrada.'),
      ]),
      universityRoute('A licenciatura abre os cargos de coordenação.', [
        degree('Engenharia Industrial', 'Ou outra engenharia, com formação em segurança.'),
        NEBOSH,
        INTERNSHIP,
      ]),
    ],
    stages: ladder('Técnico de HST', 'Coordenador de QHSE', [
      ['Acompanha inspecções', 'Regista ocorrências'],
      ['Responde pela segurança de uma frente', 'Dá formações'],
      ['Responde por um projecto', 'Orienta os mais novos'],
      ['Dirige a segurança', 'Fala com a direcção e os clientes'],
    ]),
    postings: 27,
    salary: SALARY.safety,
    sectors: ['Construção', 'Petróleo e gás', 'Indústria', 'Minas'],
  }),
  guide({
    slug: 'engenheiro-electrotecnico',
    description:
      'Projecta e mantém sistemas de electricidade, desde a instalação de um edifício às grandes redes. Trabalha na ENDE, na PRODEL, em construtoras e na indústria.',
    dayToDay: [
      'Calcular instalações eléctricas',
      'Acompanhar montagens',
      'Planear a manutenção de redes',
      'Testar equipamentos',
      'Cumprir regras de segurança eléctrica',
    ],
    workContext: FIELD,
    workStyles: [
      'Rigor',
      'Raciocínio lógico',
      'Disciplina em segurança',
      'Resolver problemas',
      'Trabalhar em equipa',
    ],
    skills: [
      ELECTRICITY,
      skill('redes-electricas', 'Redes de energia'),
      skill('automacao-plc', 'Automação e PLC', 'opcional'),
      CAD,
      SAFETY,
    ],
    pathways: [
      engineer(
        'Engenharia Electrotécnica',
        'Ou Engenharia Eléctrica. Dá a base de circuitos, máquinas e energia.',
      ),
    ],
    stages: ladder('Engenheiro Electrotécnico', 'Director de Energia', [
      ['Apoia projectos', 'Acompanha montagens'],
      ['Projecta instalações', 'Responde por uma área'],
      ['Lidera projectos', 'Orienta os mais novos'],
      ['Dirige a área de energia', 'Decide os investimentos'],
    ]),
    postings: 7,
    salary: SALARY.electrical,
    sectors: POWER,
  }),
  guide({
    slug: 'tecnico-electricista',
    description:
      'Instala e repara a electricidade de casas, edifícios e fábricas. Tem muitos anúncios, de construtoras a serviços petrolíferos, e pode começar-se com um curso médio ou profissional.',
    dayToDay: [
      'Instalar cabos, quadros e tomadas',
      'Ler esquemas eléctricos',
      'Encontrar e reparar avarias',
      'Testar as instalações',
      'Cumprir as regras de segurança',
    ],
    workContext: FIELD,
    workStyles: [
      'Sentido prático',
      'Atenção ao detalhe',
      'Disciplina em segurança',
      'Autonomia',
      'Responsabilidade',
    ],
    skills: [
      ELECTRICITY,
      skill('esquemas-electricos', 'Leitura de esquemas'),
      skill('avarias', 'Diagnóstico de avarias'),
      SAFETY,
    ],
    pathways: [
      technician(
        'Electricidade',
        'O caminho mais comum.',
        'Primeiro emprego com um electricista experiente',
        'A prática é o que mais conta nos anúncios.',
      ),
      technicalRoute('Uma formação profissional curta também abre portas.', [
        course(
          'Curso profissional de electricidade',
          'Num centro de formação certificado pelo INEFOP.',
          3,
          12,
        ),
        firstJob('Trabalho em obra ou manutenção', 'Muitos aprendem ao lado de um técnico experiente.'),
      ]),
    ].map((route, index) =>
      index ? Object.assign(route, { id: 'profissional', name: 'Formação profissional' }) : route,
    ),
    stages: ladder('Técnico Electricista', 'Encarregado de Electricidade', [
      ['Ajuda nas instalações', 'Aprende as regras'],
      ['Faz instalações sozinho', 'Repara avarias'],
      ['Faz os trabalhos difíceis', 'Orienta os ajudantes'],
      ['Coordena equipas', 'Responde pela segurança'],
    ]),
    postings: 16,
    salary: SALARY.electrician,
    sectors: POWER,
  }),
  guide({
    slug: 'engenheiro-de-energias-renovaveis',
    description:
      'Projecta e instala sistemas de energia solar, eólica e hídrica. Ainda não encontrei anúncios próprios nos últimos 12 meses, mas a PRODEL tem centrais solares e o Estado investe nesta energia. Convém ter uma base forte em electricidade.',
    dayToDay: [
      'Estudar quanta energia um local pode produzir',
      'Dimensionar painéis e baterias',
      'Acompanhar a instalação',
      'Monitorizar a produção',
      'Calcular custos e retorno',
    ],
    workContext: FIELD,
    workStyles: ['Curiosidade técnica', 'Rigor', 'Resolver problemas', 'Trabalhar em equipa', 'Autonomia'],
    skills: [
      skill('energia-solar', 'Energia solar'),
      ELECTRICITY,
      skill('estudos-energeticos', 'Estudos de energia'),
    ],
    pathways: [
      engineer('Engenharia Energética', 'Ou Engenharia Electrotécnica, com cadeiras de energias renováveis.'),
    ],
    stages: ladder('Engenheiro de Energias Renováveis', 'Director de Projectos de Energia', [
      ['Apoia estudos', 'Acompanha instalações'],
      ['Dimensiona sistemas', 'Responde por instalações'],
      ['Lidera projectos', 'Orienta os mais novos'],
      ['Dirige projectos de energia', 'Fala com investidores'],
    ]),
    postings: 0,
    salary: SALARY.closestElectrical,
    sectors: ['Electricidade', 'Energia solar', 'Projectos de cooperação', 'Construção'],
  }),
]

const JOBARTIS = 'https://www.jobartis.com/emprego-'
const ad = (label: string, path: string): SourceLink => ({
  label: `Jobartis: ${label}`,
  url: `${JOBARTIS}${path}`,
})

/** An employer from the job ads; careersSourced is true only where an ad names the post. */
const employer = (
  id: string,
  name: string,
  summary: string,
  careers: string[],
  careersSourced: boolean,
  source: SourceLink,
  province = 'Luanda',
): Company => ({
  id,
  name,
  sector: 'industria',
  province,
  place: province,
  summary,
  careers,
  careersSourced,
  areas: ['construcao_civil'],
  programs: [],
  partners: [],
  sources: [source],
})

export const ENGINEERING_COMPANIES: Company[] = [
  employer(
    'geonorte',
    'Geonorte',
    'Empresa de geotecnia e fundações especiais. Anunciou uma vaga de engenheiro civil e geotécnico.',
    ['engenheiro-civil'],
    true,
    ad(
      'engenheiro civil/geotécnico',
      'geonorte-geotecnia-e-fundacoes-especiais-lda-engenheiro-civil-geotecnico',
    ),
    'Benguela',
  ),
  employer(
    'bsprojectos',
    'BSProjectos',
    'Gabinete de projectos. Anunciou uma vaga de arquitecto sénior projectista.',
    ['arquitecto', 'desenhador-projectista'],
    false,
    ad('arquitecto sénior projectista', 'bsprojectos-lda-arquitecto-senior-projectista'),
  ),
  employer(
    'prime-engenharia',
    'Prime Engenharia & Projetos',
    'Empresa de engenharia e projectos. Anunciou uma vaga de arquitecto sénior, de projecto, execução e 3D.',
    ['arquitecto', 'desenhador-projectista'],
    false,
    ad('arquitecto sénior', 'prime-engenharia-projetos-arquitecto-senior-projeto-execucao-e-3d'),
  ),
  employer(
    'fabrimetal',
    'Fabrimetal',
    'Anunciou vagas de engenheiro mecânico e de electricista industrial.',
    ['engenheiro-mecanico', 'tecnico-electricista'],
    true,
    ad('engenheiro mecânico', 'fabrimetal-engenheiro-mecanico'),
  ),
  employer(
    'alpla-angola',
    'Alpla Angola Plásticos',
    'Fábrica de plásticos. Anunciou vagas de operador de injectora e de técnico de manutenção.',
    ['engenheiro-de-producao-industrial', 'engenheiro-de-manutencao'],
    false,
    ad('técnico de manutenção', 'alpla-angola-plasticos-lda-tecnico-de-manutencao-junior-manutencao-tecnica'),
  ),
  employer(
    'grupo-nov',
    'Grupo Nov',
    'Anunciou uma vaga de director de produção.',
    ['engenheiro-de-producao-industrial'],
    true,
    ad('director de produção', 'grupo-nov-director-de-producao-zona'),
  ),
  employer(
    'rcs-angola',
    'RCS Angola',
    'Anunciou vagas de técnico de automação bancária, em Malanje e noutros locais.',
    ['engenheiro-mecatronico'],
    true,
    ad('supervisor técnico', 'rcs-angola-supervisor-tecnico-490d0131-11d2-4e0b-9d4d-4db867ccfb68'),
  ),
  employer(
    'teixeira-duarte',
    'Teixeira Duarte',
    'Grupo de construção com actividade em Angola. Em 2026 anunciou vagas em Luanda.',
    ['engenheiro-civil', 'tecnico-de-obras', 'medidor-orcamentista', 'topografo'],
    false,
    {
      label: 'Angorecruta: vagas da Teixeira Duarte (2026)',
      url: 'https://angorecruta.com/a-teixeira-duarte-tem-vagas-de-emprego-em-diversas-areas/',
    },
  ),
]
