import type {
  Academy,
  AcademyOffer,
  Career,
  CareerGroup,
  CareerSummary,
  Demand,
  PathwayStep,
  RiasecProfile,
  SourceLink,
} from '../types'
import { riasec, summary } from './careerSummary'

/*
 * Ofícios: the trades many young Angolans learn without a degree (plumbing, building, cars, sewing, hair, food,
 * farming), with the INEFOP centres whose courses a public source confirms:
 * - Pavilhão de Artes e Ofícios dos Ramiros (Belas, Luanda), INEFOP: Ver Angola, 13/10/2026;
 * - Centro de Formação Profissional 1.º de Maio (Uíge), INEFOP: Decreto Executivo n.º 149/23;
 * - Centro de Formação Profissional Feminino (Rangel, Luanda), INEFOP: Decreto Executivo n.º 186/23.
 * The job sites show few ads for these trades (most work is on one's own and by word of mouth), so demand,
 * course lengths and costs are estimated and flagged (data-to-collect-later). No salaries: no public table.
 */

const RAMIROS: SourceLink = {
  label: 'Ver Angola: Pavilhão de formação profissional dos Ramiros (13/10/2026)',
  url: 'https://www.verangola.net/va/pt/102026/Sociedade/50392/Pavilh%C3%A3o-de-forma%C3%A7%C3%A3o-profissional-dos-Ramiros-abre-portas-para-qualificar-1000-formandos-por-ciclo.htm',
}
const UIGE: SourceLink = {
  label: 'Decreto Executivo n.º 149/23: Centro de Formação Profissional 1.º de Maio (AngoLEX)',
  url: 'https://angolex.com/paginas/decreto-executivo/estatuto-organico-do-centro-de-formacao-profissional-1a-de-maio-149a-23a.html',
}
const FEMININO: SourceLink = {
  label:
    'Decreto Executivo n.º 186/23: Centro de Formação Profissional Feminino (Diário da República, 31/08/2023)',
  url: 'https://faolex.fao.org/docs/pdf/ang221175.pdf',
}
const INEFOP: SourceLink = { label: 'INEFOP', url: 'https://www.inefop.gov.ao' }

type Trade = {
  slug: string
  name: string
  group: CareerGroup
  summary: string
  profile: RiasecProfile
  demand: Demand
  description: string
  dayToDay: string[]
  place: string
  hours: string
  equipment: string
  workStyles: string[]
  skills: [string, string][]
  /** The INEFOP course, its length in months and what it costs in Kz (estimated). */
  course: { name: string; months: [number, number]; cost: [number, number] }
  /** The médio técnico course that leads to the trade, when there is one. */
  technical?: string
  /** The paper the trade asks before working (a driving licence, a hygiene card). */
  licence?: PathwayStep
  /** How the first clients come. */
  clients: string[]
}

const TRADES: Trade[] = [
  {
    slug: 'canalizador',
    name: 'Canalizador',
    group: 'construcao_civil',
    summary:
      'Instala e repara a canalização da água e dos esgotos em casas, prédios e obras: tubos, torneiras, autoclismos e tanques.',
    profile: riasec(0.9, 0.35, 0.1, 0.35, 0.3, 0.45),
    demand: 'media',
    description:
      'Monta e repara as redes de água e esgoto: corta e une tubos, instala loiças, torneiras, autoclismos, bombas e tanques, e encontra fugas. Trabalha em obras novas e, muito, em reparações em casa dos clientes, quase sempre por conta própria.',
    dayToDay: [
      'Ler a planta e marcar o caminho dos tubos',
      'Cortar, roscar e colar tubos de PVC, PPR e ferro',
      'Instalar torneiras, autoclismos, lavatórios e esquentadores',
      'Encontrar e reparar fugas e entupimentos',
      'Ligar tanques e bombas de água',
    ],
    place: 'Obras e casas dos clientes',
    hours: 'Por obra ou por chamada, muitas vezes ao fim de semana',
    equipment: 'Chaves, serra de tubos, máquina de soldar PPR, desentupidor',
    workStyles: [
      'Sentido prático',
      'Resolver problemas',
      'Honestidade com o cliente',
      'Autonomia',
      'Resistência física',
    ],
    skills: [
      ['instalacao-canalizacao', 'Instalação de redes de água e esgoto'],
      ['deteccao-fugas', 'Detecção de fugas'],
      ['leitura-plantas', 'Leitura de plantas'],
      ['orcamentos-servicos', 'Fazer orçamentos'],
    ],
    course: { name: 'Canalização', months: [3, 6], cost: [0, 150_000] },
    technical: 'Construção Civil',
    clients: [
      'Diz aos vizinhos, à igreja e às lojas de material que fazes reparações: muitos chamam o canalizador que a loja recomenda.',
      'Tira fotografias de antes e depois e publica-as no WhatsApp e no Facebook.',
    ],
  },
  {
    slug: 'serralheiro',
    name: 'Serralheiro',
    group: 'construcao_civil',
    summary:
      'Faz e monta portões, grades, janelas e estruturas de ferro e alumínio, a cortar, dobrar e soldar o metal.',
    profile: riasec(0.95, 0.3, 0.25, 0.2, 0.35, 0.4),
    demand: 'media',
    description:
      'Corta, dobra e solda ferro e alumínio para fazer portões, grades, portas, janelas, escadas e coberturas, e monta-os nas casas e obras. Muitos serralheiros têm oficina própria no bairro; outros trabalham para construtoras e fábricas.',
    dayToDay: [
      'Medir o vão e desenhar a peça com o cliente',
      'Cortar e dobrar os perfis de ferro ou alumínio',
      'Soldar e lixar as peças',
      'Pintar e proteger o metal da ferrugem',
      'Montar a peça na obra',
    ],
    place: 'Oficina e obras',
    hours: 'Horário de oficina, mais horas quando há encomendas',
    equipment: 'Máquina de soldar, rebarbadora, berbequim, serra de corte',
    workStyles: [
      'Mãos firmes',
      'Atenção ao detalhe',
      'Rigor com a segurança',
      'Criatividade',
      'Resistência física',
    ],
    skills: [
      ['soldadura-electrodo', 'Soldadura por eléctrodo'],
      ['corte-dobragem-metal', 'Corte e dobragem de metal'],
      ['medicao-vaos', 'Medição e desenho de peças'],
      ['orcamentos-servicos', 'Fazer orçamentos'],
    ],
    course: { name: 'Serralharia de Construção Civil', months: [3, 6], cost: [0, 150_000] },
    technical: 'Metalomecânica',
    clients: [
      'Mostra os portões e grades que já fizeste: uma porta bem feita na rua é a melhor publicidade.',
      'Combina com pedreiros e empreiteiros do bairro: eles precisam de quem faça a serralharia das obras.',
    ],
  },
  {
    slug: 'pedreiro',
    name: 'Pedreiro',
    group: 'construcao_civil',
    summary: 'Levanta paredes, faz fundações, rebocos e pavimentos: é quem constrói a casa, bloco a bloco.',
    profile: riasec(0.95, 0.2, 0.15, 0.3, 0.3, 0.45),
    demand: 'media',
    description:
      'Faz as fundações, levanta paredes de blocos, faz a betonagem de pilares e lajes, os rebocos e os pavimentos. Começa quase sempre como servente ao lado de um mestre de obras e, com anos de prática, pode chegar a encarregado ou empreiteiro com equipa própria.',
    dayToDay: [
      'Preparar a massa e o betão nas quantidades certas',
      'Assentar blocos a prumo e a nível',
      'Rebocar e alisar paredes',
      'Assentar mosaico e pavimentos',
      'Ler as medidas da planta com o mestre de obras',
    ],
    place: 'Obras de casas, prédios e estradas',
    hours: 'De manhã cedo ao fim da tarde, ao ar livre',
    equipment: 'Colher, nível, fio de prumo, betoneira, andaimes',
    workStyles: [
      'Resistência física',
      'Trabalhar em equipa',
      'Rigor com as medidas',
      'Paciência',
      'Rigor com a segurança',
    ],
    skills: [
      ['alvenaria', 'Alvenaria de blocos'],
      ['rebocos-pavimentos', 'Rebocos e pavimentos'],
      ['leitura-plantas', 'Leitura de plantas'],
      ['orcamentos-servicos', 'Fazer orçamentos'],
    ],
    course: { name: 'Construção Civil', months: [3, 6], cost: [0, 150_000] },
    technical: 'Construção Civil',
    clients: [
      'Começa a trabalhar com um mestre de obras: as obras seguintes chegam pelas pessoas para quem já trabalhaste.',
      'Faz pequenos trabalhos (muros, casas de banho, pavimentos) para mostrar o teu acabamento.',
    ],
  },
  {
    slug: 'carpinteiro',
    name: 'Carpinteiro e Marceneiro',
    group: 'construcao_civil',
    summary: 'Faz e repara portas, janelas, telhados, armários e móveis de madeira.',
    profile: riasec(0.9, 0.3, 0.5, 0.2, 0.35, 0.4),
    demand: 'media',
    description:
      'O carpinteiro trabalha a madeira nas obras (cofragens, telhados, portas e janelas); o marceneiro faz móveis por medida (camas, armários, cozinhas). Muitos têm oficina própria e trabalham por encomenda.',
    dayToDay: [
      'Medir e desenhar a peça com o cliente',
      'Escolher e cortar a madeira',
      'Montar, colar e aparafusar as peças',
      'Lixar, envernizar e pintar',
      'Montar portas, armários e cozinhas em casa do cliente',
    ],
    place: 'Oficina e obras',
    hours: 'Horário de oficina, por encomenda',
    equipment: 'Serra circular, berbequim, plaina, lixadora, grampos',
    workStyles: [
      'Criatividade',
      'Atenção ao detalhe',
      'Paciência',
      'Sentido prático',
      'Rigor com a segurança',
    ],
    skills: [
      ['corte-madeira', 'Corte e montagem de madeira'],
      ['acabamentos-madeira', 'Acabamentos: lixar, envernizar, pintar'],
      ['medicao-vaos', 'Medição e desenho de peças'],
      ['orcamentos-servicos', 'Fazer orçamentos'],
    ],
    course: { name: 'Carpintaria e Marcenaria', months: [3, 6], cost: [0, 150_000] },
    clients: [
      'Publica fotografias de cada móvel acabado: muitos clientes escolhem pelo Instagram e pelo Facebook.',
      'Faz um preço por peça (cama, armário, porta) e pede um sinal para comprar a madeira.',
    ],
  },
  {
    slug: 'tecnico-de-frio',
    name: 'Técnico de Frio e Climatização',
    group: 'engenharia_electrica',
    summary: 'Instala e repara aparelhos de ar condicionado, arcas, frigoríficos e câmaras frigoríficas.',
    profile: riasec(0.9, 0.5, 0.1, 0.3, 0.3, 0.45),
    demand: 'media',
    description:
      'Instala, faz a manutenção e repara aparelhos de ar condicionado, frigoríficos, arcas e câmaras frigoríficas de casas, lojas, restaurantes e escritórios. Com o calor de Angola, é um trabalho que não falta, em empresas de climatização ou por conta própria.',
    dayToDay: [
      'Instalar aparelhos de ar condicionado split',
      'Limpar filtros e fazer a manutenção',
      'Encontrar fugas e recarregar o gás',
      'Reparar compressores, motores e placas',
      'Explicar ao cliente como poupar energia',
    ],
    place: 'Casas, lojas, restaurantes e escritórios',
    hours: 'Por chamada, com mais trabalho na época quente',
    equipment: 'Manómetros, bomba de vácuo, multímetro, ferramentas de cobre',
    workStyles: [
      'Resolver problemas',
      'Sentido prático',
      'Rigor com a segurança',
      'Simpatia com o cliente',
      'Autonomia',
    ],
    skills: [
      ['instalacao-ar-condicionado', 'Instalação de ar condicionado'],
      ['circuitos-frio', 'Circuitos de frio e gases refrigerantes'],
      ['electricidade-basica', 'Electricidade básica'],
      ['orcamentos-servicos', 'Fazer orçamentos'],
    ],
    course: { name: 'Técnico de Frio', months: [3, 9], cost: [0, 250_000] },
    technical: 'Electromecânica ou Frio e Climatização',
    clients: [
      'Oferece contratos de manutenção a restaurantes, lojas e escritórios: limpar os aparelhos de 3 em 3 meses dá trabalho certo.',
      'Deixa o teu número colado em cada aparelho que instalas ou reparas.',
    ],
  },
  {
    slug: 'tecnico-de-paineis-solares',
    name: 'Técnico de Instalação Solar',
    group: 'engenharia_electrica',
    summary: 'Instala painéis solares, baterias e inversores em casas, escolas e fazendas sem rede estável.',
    profile: riasec(0.9, 0.55, 0.1, 0.25, 0.35, 0.45),
    demand: 'media',
    description:
      'Calcula o que a casa ou a fazenda gasta, escolhe os painéis, as baterias e o inversor, e instala e mantém o sistema. Em Angola há muita procura onde a rede falha ou não chega, e projectos públicos e de ONG a formar jovens nesta área.',
    dayToDay: [
      'Visitar o cliente e calcular o consumo',
      'Escolher painéis, baterias e inversor',
      'Fixar os painéis no telhado ou no chão',
      'Fazer as ligações eléctricas e testar',
      'Limpar os painéis e verificar as baterias',
    ],
    place: 'Casas, escolas, fazendas e postos de saúde',
    hours: 'De dia, ao ar livre e em telhados',
    equipment: 'Multímetro, ferramentas eléctricas, escadas e arnês',
    workStyles: [
      'Sentido prático',
      'Rigor com a segurança',
      'Curiosidade',
      'Resistência física',
      'Autonomia',
    ],
    skills: [
      ['dimensionamento-solar', 'Dimensionamento de sistemas solares'],
      ['electricidade-basica', 'Electricidade básica'],
      ['trabalho-em-altura', 'Trabalho em altura com segurança'],
      ['orcamentos-servicos', 'Fazer orçamentos'],
    ],
    course: { name: 'Energias Renováveis: instalação solar', months: [1, 6], cost: [0, 300_000] },
    technical: 'Electricidade ou Energias Renováveis',
    clients: [
      'Começa com um sistema pequeno (luz e telemóveis) em casas do bairro ou da família, e mostra-o a funcionar.',
      'Fala com escolas, igrejas e fazendas: precisam de energia e preferem quem dá manutenção depois.',
    ],
  },
  {
    slug: 'mecanico-auto',
    name: 'Mecânico Auto e de Motos',
    group: 'transportes',
    summary:
      'Faz a manutenção e repara carros, motorizadas e candongueiros: motor, travões, suspensão e electricidade.',
    profile: riasec(0.95, 0.45, 0.05, 0.25, 0.3, 0.4),
    demand: 'media',
    description:
      'Encontra e repara as avarias de carros, motorizadas e carrinhas: motor, caixa, travões, suspensão e a parte eléctrica. Há oficinas em todos os bairros e as motorizadas (mototáxis) e os candongueiros dão muito trabalho. Os carros novos pedem cada vez mais diagnóstico por computador.',
    dayToDay: [
      'Ouvir o cliente e testar o veículo',
      'Mudar o óleo, filtros e pastilhas',
      'Desmontar e reparar o motor e a caixa',
      'Ler as avarias com a máquina de diagnóstico',
      'Dizer ao cliente o preço antes de começar',
    ],
    place: 'Oficinas de bairro, concessionários e frotas',
    hours: 'Horário de oficina, por vezes ao sábado',
    equipment: 'Chaves, macaco, elevador, máquina de diagnóstico',
    workStyles: [
      'Gosto por motores',
      'Resolver problemas',
      'Honestidade com o cliente',
      'Paciência',
      'Resistência física',
    ],
    skills: [
      ['motores-gasolina-diesel', 'Motores a gasolina e diesel'],
      ['travoes-suspensao', 'Travões e suspensão'],
      ['diagnostico-auto', 'Diagnóstico por computador'],
      ['orcamentos-servicos', 'Fazer orçamentos'],
    ],
    course: { name: 'Mecânica Auto', months: [3, 9], cost: [0, 250_000] },
    technical: 'Mecânica',
    clients: [
      'Os mototaxistas e candongueiros precisam de um mecânico de confiança: oferece-lhes um bom preço por cliente fixo.',
      'Diz o preço antes e mostra a peça velha ao cliente: a confiança é o que traz clientes de volta.',
    ],
  },
  {
    slug: 'motorista-profissional',
    name: 'Motorista Profissional',
    group: 'transportes',
    summary:
      'Conduz camiões, autocarros, carrinhas de carga ou táxi, com a carta de condução da categoria certa.',
    profile: riasec(0.8, 0.15, 0.05, 0.4, 0.3, 0.55),
    demand: 'media',
    description:
      'Transporta pessoas ou mercadorias: táxi e candongueiro, autocarro, camião de carga, carrinha de distribuição ou motorista de empresa. Precisa da carta de condução da categoria do veículo e de conhecer bem as estradas, as regras e o seu veículo.',
    dayToDay: [
      'Verificar o veículo antes de sair: pneus, óleo, luzes',
      'Planear o caminho e os horários',
      'Conduzir com segurança e respeitar o Código da Estrada',
      'Carregar, entregar e assinar as guias da carga',
      'Avisar a oficina das avarias',
    ],
    place: 'Na estrada, na cidade e entre províncias',
    hours: 'Turnos longos, às vezes dias fora de casa',
    equipment: 'O veículo e os seus documentos',
    workStyles: ['Atenção constante', 'Calma', 'Responsabilidade', 'Pontualidade', 'Resistência'],
    skills: [
      ['conducao-defensiva', 'Condução defensiva'],
      ['codigo-estrada', 'Código da Estrada'],
      ['manutencao-veiculo', 'Verificação diária do veículo'],
    ],
    course: {
      name: 'Escola de condução (carta da categoria do veículo)',
      months: [1, 4],
      cost: [80_000, 400_000],
    },
    licence: {
      kind: 'certificacao',
      title: 'Carta de condução da categoria do veículo',
      need: 'essencial',
      certificate: 'exigido',
      description:
        'Para ligeiros, a categoria B; para camiões e autocarros, as categorias de pesados, que pedem também aulas técnicas sobre o funcionamento do veículo. O pedido da carta já se pode fazer numa plataforma online do Ministério do Interior.',
      months: { min: 1, max: 4 },
    },
    clients: [
      'Empresas de distribuição, construção e transportes pedem motoristas com experiência e a carta limpa: guarda as cartas de recomendação.',
      'Com carro próprio, podes trabalhar nas plataformas de transporte ou em entregas.',
    ],
  },
  {
    slug: 'costureiro',
    name: 'Costureiro e Alfaiate',
    group: 'artes',
    summary:
      'Corta e cose roupa por medida, faz arranjos e confecciona com panos africanos, para clientes ou lojas.',
    profile: riasec(0.75, 0.2, 0.75, 0.4, 0.4, 0.4),
    demand: 'media',
    description:
      'Tira as medidas, corta o tecido e cose roupa por medida: vestidos, fatos, camisas, uniformes e roupa de pano africano para festas e casamentos. Faz também arranjos. A maioria trabalha por conta própria, em casa ou num atelier; há também fábricas e empresas de uniformes.',
    dayToDay: [
      'Tirar as medidas ao cliente',
      'Desenhar o molde e cortar o tecido',
      'Coser à máquina e acabar à mão',
      'Fazer provas e ajustes',
      'Entregar a tempo das festas',
    ],
    place: 'Casa, atelier ou mercado',
    hours: 'Por encomenda, com picos antes das festas e do início das aulas',
    equipment: 'Máquina de costura, corta-e-cose, tesouras, fita métrica',
    workStyles: [
      'Criatividade',
      'Atenção ao detalhe',
      'Paciência',
      'Cumprir prazos',
      'Simpatia com o cliente',
    ],
    skills: [
      ['corte-costura', 'Corte e costura'],
      ['moldes', 'Fazer moldes'],
      ['acabamentos-roupa', 'Acabamentos e arranjos'],
      ['orcamentos-servicos', 'Fazer orçamentos'],
    ],
    course: { name: 'Corte e Costura', months: [3, 6], cost: [0, 150_000] },
    clients: [
      'Publica cada peça no Instagram e no WhatsApp com o preço: as clientes partilham com as amigas.',
      'Propõe uniformes a escolas, igrejas e empresas: uma encomenda grande paga a máquina.',
    ],
  },
  {
    slug: 'cabeleireiro',
    name: 'Cabeleireiro e Barbeiro',
    group: 'beleza',
    summary: 'Corta, trança, alisa e trata o cabelo, num salão, numa barbearia ou em casa dos clientes.',
    profile: riasec(0.6, 0.15, 0.7, 0.75, 0.5, 0.3),
    demand: 'media',
    description:
      'Corta e trata o cabelo, faz tranças, extensões, alisamentos e penteados, e na barbearia faz cortes e barba. É dos ofícios em que mais jovens começam por conta própria: em casa, no salão de outra pessoa ou ao domicílio.',
    dayToDay: [
      'Ouvir o que o cliente quer e aconselhar',
      'Lavar, cortar e tratar o cabelo',
      'Fazer tranças, extensões e penteados',
      'Limpar e desinfectar as ferramentas',
      'Marcar clientes pelo telefone e pelo WhatsApp',
    ],
    place: 'Salões, barbearias e ao domicílio',
    hours: 'Muitas horas de pé, sobretudo ao fim de semana',
    equipment: 'Tesouras, máquinas de corte, secadores, produtos',
    workStyles: ['Criatividade', 'Gostar de pessoas', 'Simpatia', 'Higiene', 'Paciência'],
    skills: [
      ['corte-cabelo', 'Corte de cabelo'],
      ['trancas-extensoes', 'Tranças e extensões'],
      ['higiene-ferramentas', 'Higiene e desinfecção'],
      ['atendimento-cliente', 'Atendimento ao cliente'],
    ],
    course: { name: 'Cabeleireiro e Barbeiro', months: [3, 6], cost: [0, 150_000] },
    clients: [
      'Faz fotografias de cada penteado e publica-as: o Instagram e o TikTok são a montra de um cabeleireiro.',
      'Começa ao domicílio ou numa cadeira alugada num salão antes de abrir o teu.',
    ],
  },
  {
    slug: 'esteticista',
    name: 'Esteticista',
    group: 'beleza',
    summary: 'Faz tratamentos de pele, maquilhagem, manicure, pedicure, depilação e massagem.',
    profile: riasec(0.5, 0.25, 0.6, 0.8, 0.5, 0.35),
    demand: 'media',
    description:
      'Cuida da pele e da aparência: limpezas de pele, maquilhagem para festas e casamentos, manicure, pedicure, unhas de gel, depilação e massagem. Trabalha em salões, spas e hotéis, ou por conta própria em casa e ao domicílio.',
    dayToDay: [
      'Avaliar a pele do cliente e aconselhar',
      'Fazer limpezas de pele e massagens',
      'Maquilhar para festas e casamentos',
      'Fazer manicure, pedicure e unhas',
      'Desinfectar o material entre clientes',
    ],
    place: 'Salões, spas, hotéis e ao domicílio',
    hours: 'Por marcação, muito ao fim de semana',
    equipment: 'Marquesa, produtos, kit de manicure, maquilhagem',
    workStyles: ['Gostar de pessoas', 'Higiene', 'Delicadeza', 'Criatividade', 'Discrição'],
    skills: [
      ['cuidados-pele', 'Cuidados de pele'],
      ['maquilhagem', 'Maquilhagem'],
      ['manicure-pedicure', 'Manicure e pedicure'],
      ['higiene-ferramentas', 'Higiene e desinfecção'],
    ],
    course: { name: 'Massagem e Estética', months: [3, 6], cost: [0, 200_000] },
    clients: [
      'Maquilhar noivas e convidadas dá clientes para o ano inteiro: publica as fotografias com autorização.',
      'Faz pacotes (manicure e pedicure, maquilhagem de grupo) e dá um desconto a quem trouxer uma amiga.',
    ],
  },
  {
    slug: 'cozinheiro',
    name: 'Cozinheiro',
    group: 'turismo',
    summary: 'Prepara e cozinha as refeições de restaurantes, hotéis, cantinas e eventos.',
    profile: riasec(0.75, 0.2, 0.55, 0.4, 0.4, 0.45),
    demand: 'media',
    description:
      'Prepara os ingredientes, cozinha os pratos e cumpre as regras de higiene, numa cozinha de restaurante, hotel, cantina de empresa ou catering de eventos. Com experiência, pode chegar a chefe de cozinha ou abrir o seu negócio de comida.',
    dayToDay: [
      'Receber e guardar os produtos',
      'Preparar, cortar e temperar',
      'Cozinhar os pratos do dia',
      'Empratar no tempo certo',
      'Limpar a cozinha e cumprir a higiene',
    ],
    place: 'Restaurantes, hotéis, cantinas e catering',
    hours: 'Turnos, ao fim de semana e nos feriados',
    equipment: 'Fogões, fornos, facas e utensílios de cozinha',
    workStyles: ['Rapidez', 'Trabalhar em equipa', 'Higiene', 'Criatividade', 'Resistência física'],
    skills: [
      ['tecnicas-cozinha', 'Técnicas de cozinha'],
      ['higiene-alimentar', 'Higiene e segurança alimentar'],
      ['cozinha-angolana', 'Cozinha angolana e internacional'],
    ],
    course: { name: 'Culinária e Pastelaria', months: [3, 6], cost: [0, 200_000] },
    clients: [
      'Começa a trabalhar numa cozinha: a experiência é o que os restaurantes e hotéis pedem.',
      'Por conta própria, comida por encomenda e catering de festas, com o menu no WhatsApp.',
    ],
  },
  {
    slug: 'pasteleiro',
    name: 'Pasteleiro e Padeiro',
    group: 'turismo',
    summary: 'Faz pão, bolos, salgados e doces para padarias, pastelarias, hotéis e encomendas.',
    profile: riasec(0.75, 0.2, 0.65, 0.35, 0.45, 0.5),
    demand: 'media',
    description:
      'Faz pão, bolos de aniversário e casamento, salgados e sobremesas, com receitas e medidas certas. Trabalha em padarias, pastelarias e hotéis, ou por conta própria: os bolos e salgados por encomenda são dos negócios mais comuns entre os jovens.',
    dayToDay: [
      'Pesar e misturar os ingredientes',
      'Amassar, moldar e levar ao forno',
      'Decorar bolos por encomenda',
      'Calcular o custo de cada receita',
      'Limpar e cumprir as regras de higiene',
    ],
    place: 'Padarias, pastelarias, hotéis e em casa',
    hours: 'Começa muito cedo; mais trabalho antes das festas',
    equipment: 'Forno, batedeira, formas e balança',
    workStyles: ['Rigor com as medidas', 'Criatividade', 'Higiene', 'Paciência', 'Cumprir prazos'],
    skills: [
      ['panificacao', 'Panificação'],
      ['pastelaria-decoracao', 'Pastelaria e decoração de bolos'],
      ['higiene-alimentar', 'Higiene e segurança alimentar'],
      ['custos-receitas', 'Custo de cada receita'],
    ],
    course: { name: 'Culinária e Pastelaria', months: [3, 6], cost: [0, 200_000] },
    clients: [
      'Publica cada bolo com o preço e aceita encomendas pelo WhatsApp; entrega a tempo e as clientes voltam.',
      'Oferece salgados a escritórios e escolas, com entrega todas as semanas.',
    ],
  },
  {
    slug: 'agricultor-e-criador',
    name: 'Agricultor e Criador de Animais',
    group: 'agricultura',
    summary:
      'Cultiva hortícolas, milho ou mandioca e cria galinhas, cabritos ou porcos, para comer e vender.',
    profile: riasec(0.9, 0.35, 0.1, 0.25, 0.5, 0.45),
    demand: 'media',
    description:
      'Prepara a terra, semeia, rega e colhe, e cria animais (galinhas, cabritos, porcos, peixe), para a família e para vender nos mercados, restaurantes e lojas. Com técnica, um terreno pequeno com água pode dar rendimento todo o ano; as cooperativas ajudam a comprar e a vender.',
    dayToDay: [
      'Preparar a terra e semear',
      'Regar, adubar e tratar as pragas',
      'Alimentar e vacinar os animais',
      'Colher e vender no mercado',
      'Anotar o que gastas e o que vendes',
    ],
    place: 'No campo, em fazendas, quintais e cooperativas',
    hours: 'De madrugada ao fim do dia, conforme as estações',
    equipment: 'Enxadas, regador ou rega gota-a-gota, sementes, capoeira',
    workStyles: ['Resistência física', 'Paciência', 'Observação', 'Iniciativa', 'Gosto pela natureza'],
    skills: [
      ['horticultura', 'Horticultura'],
      ['criacao-animais', 'Criação de animais'],
      ['rega', 'Rega e gestão da água'],
      ['contas-negocio', 'Contas do negócio'],
    ],
    course: { name: 'Agricultura e criação de animais', months: [1, 6], cost: [0, 100_000] },
    technical: 'Agropecuária',
    clients: [
      'Garante o comprador antes de plantar: restaurantes, cantinas e vendedoras do mercado.',
      'Junta-te a uma cooperativa para vender em maior quantidade e chegar a supermercados.',
    ],
  },
]

export const TRADE_CAREERS: CareerSummary[] = TRADES.map((trade) =>
  summary(trade.slug, trade.name, trade.group, trade.summary, trade.profile, trade.demand, null),
)

const NINTH: PathwayStep = {
  kind: 'academico',
  level: 'i_ciclo',
  title: '9.ª classe concluída',
  need: 'essencial',
  description: 'Dá acesso aos cursos médios técnicos, da 10.ª à 13.ª classe.',
  months: null,
}

const STAGES: Career['stages'] = [
  {
    level: 'estagio',
    title: 'Aprendiz ou ajudante',
    years: { min: 0, max: 2 },
    responsibilities: ['Trabalha ao lado de um mestre', 'Aprende as ferramentas e a segurança'],
  },
  {
    level: 'junior',
    title: 'Oficial',
    years: { min: 2, max: 5 },
    responsibilities: ['Faz os trabalhos sozinho', 'Dá o preço ao cliente'],
  },
  {
    level: 'pleno',
    title: 'Mestre ou por conta própria',
    years: { min: 5, max: null },
    responsibilities: ['Tem os seus clientes ou a sua oficina', 'Ensina os aprendizes'],
  },
]

const CV_GUIDE: Career['cvGuide'] = {
  template: 'classico',
  include: [
    'Os cursos e certificados (INEFOP, escola técnica), com o ano',
    'Os trabalhos que já fizeste, com fotografias num link ou no telemóvel',
    'Quem pode dar referências: mestres e clientes',
    'As ferramentas e máquinas que sabes usar',
  ],
  avoid: ['Trabalhos sem dizer o que fizeste', 'Dados pessoais que a candidatura não pede'],
}

function pathways(trade: Trade): Career['pathways'] {
  const months = { min: trade.course.months[0], max: trade.course.months[1] }
  const practice: PathwayStep = {
    kind: 'experiencia',
    title: 'Prática com um mestre ou numa empresa',
    need: 'essencial',
    description: trade.clients[0] ?? 'É com prática que se ganha confiança e clientes.',
    months: { min: 6, max: 24 },
  }
  const course: PathwayStep = {
    kind: 'formacao',
    title: `Curso de ${trade.course.name} (INEFOP ou outro centro)`,
    need: 'recomendado',
    certificate: 'opcional',
    description:
      'Os centros e pavilhões de formação profissional do INEFOP dão cursos curtos de ofícios, com certificado. Informa-te no Centro de Emprego ou no centro mais perto de ti.',
    months,
  }
  const licence = trade.licence ? [trade.licence] : []
  const routes: Career['pathways'] = [
    {
      id: 'inefop',
      name: 'Curso curto de formação profissional',
      summary: 'O caminho mais rápido: um curso de alguns meses e depois prática.',
      steps: [course, ...licence, practice],
      totalCost: { min: trade.course.cost[0], max: trade.course.cost[1] },
      estimated: true,
    },
    {
      id: 'aprendiz',
      name: 'Aprender com um mestre (aprendiz)',
      summary: 'Começar como ajudante de quem já trabalha, e tirar o certificado mais tarde.',
      steps: [
        { ...practice, title: 'Ajudante ou aprendiz de um mestre', months: { min: 12, max: 36 } },
        ...licence,
        { ...course, need: 'opcional', title: 'Curso curto para ter o certificado' },
      ],
      totalCost: { min: 0, max: 0 },
      estimated: true,
    },
  ]
  if (trade.technical) {
    routes.push({
      id: 'tecnico',
      name: 'Curso médio técnico',
      summary: 'Quatro anos depois da 9.ª classe: dá o ofício e o 12.º ano ao mesmo tempo.',
      steps: [
        NINTH,
        {
          kind: 'academico',
          level: 'medio_tecnico',
          title: `Curso médio técnico de ${trade.technical}`,
          need: 'recomendado',
          description: 'Da 10.ª à 13.ª classe, num instituto médio politécnico ou industrial.',
          months: { min: 48, max: 48 },
        },
        ...licence,
        practice,
      ],
      totalCost: null,
    })
  }
  return routes
}

const NOTE =
  'Os sites de emprego mostram poucos anúncios para este ofício: a maior parte do trabalho é por conta própria e chega por recomendação. A procura é uma estimativa do Kayé.'

// `base` belongs to TRADE_CAREERS: mutating it in place (the rule's advice) would change that list too.
// oxlint-disable-next-line no-map-spread
export const TRADE_GUIDES: Career[] = TRADES.map((trade) => {
  const base = TRADE_CAREERS.find((career) => career.slug === trade.slug)
  if (!base) throw new Error(`Unknown trade ${trade.slug}`)
  return {
    ...base,
    detailed: true,
    description: trade.description,
    dayToDay: trade.dayToDay,
    workContext: [
      { label: 'Ambiente', value: trade.place },
      { label: 'Horário', value: trade.hours },
      { label: 'Equipamento', value: trade.equipment },
      { label: 'Clientes', value: trade.clients[1] ?? trade.clients[0] ?? '' },
    ],
    workStyles: trade.workStyles,
    skills: trade.skills.map(([id, name], index) => ({
      id,
      name,
      importance: index < 2 ? 'essencial' : 'opcional',
    })),
    employerAsks: null,
    pathways: pathways(trade),
    stages: STAGES,
    market: {
      demand: trade.demand,
      trendPct: null,
      demandNote: { text: NOTE, source: INEFOP },
      salary: null,
      salaryByStage: [],
      postingsByMonth: [],
      hiringSectors: ['Por conta própria', 'Pequenas empresas e oficinas', 'Construtoras, hotéis e frotas'],
    },
    cvGuide: CV_GUIDE,
  }
})

const offer = (name: string, careers: string[]): AcademyOffer => ({
  course: {
    id: `oficio-${name
      .toLowerCase()
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')}`,
    name,
  },
  name,
  level: 'formacao_profissional',
  careers,
  areas: [
    ...new Set(
      [...TRADE_CAREERS, { slug: 'tecnico-electricista', group: 'engenharia_electrica' as const }]
        .filter((career) => careers.includes(career.slug))
        .map((career) => career.group),
    ),
  ],
})

export const TRADE_CENTRES: Academy[] = [
  {
    id: 'pavilhao-artes-oficios-ramiros',
    name: 'Pavilhão de Formação Profissional de Artes e Ofícios dos Ramiros',
    type: 'centro_formacao',
    ownership: 'publica',
    province: 'Luanda',
    place: 'Ramiros, Belas (Luanda)',
    summary:
      'Pavilhão do INEFOP aberto em Outubro de 2026, para cerca de 1000 formandos por ciclo; no primeiro ciclo, de três meses, inscreveram-se 1200 pessoas. O ministério anunciou 13 cursos, entre eles construção civil, corte e costura, culinária e pastelaria, mecânica auto, electricidade, carpintaria, marcenaria e canalização.',
    offers: [
      offer('Construção Civil', ['pedreiro']),
      offer('Corte e Costura', ['costureiro']),
      offer('Culinária e Pastelaria', ['cozinheiro', 'pasteleiro']),
      offer('Mecânica Auto', ['mecanico-auto']),
      offer('Electricidade Predial e Industrial', ['tecnico-electricista']),
      offer('Carpintaria e Marcenaria', ['carpinteiro']),
      offer('Canalização', ['canalizador']),
    ],
    sources: [RAMIROS],
  },
  {
    id: 'centro-formacao-profissional-1-de-maio-uige',
    name: 'Centro de Formação Profissional 1.º de Maio',
    type: 'centro_formacao',
    ownership: 'publica',
    province: 'Uíge',
    place: 'Uíge',
    summary:
      'Centro de formação profissional supervisionado pelo INEFOP. O seu estatuto (2023) lista os cursos de canalização, electricidade de baixa tensão, serralharia de construção civil e informática.',
    offers: [
      offer('Canalização', ['canalizador']),
      offer('Electricidade de Baixa Tensão', ['tecnico-electricista']),
      offer('Serralharia de Construção Civil', ['serralheiro']),
    ],
    sources: [UIGE],
  },
  {
    id: 'centro-formacao-profissional-feminino',
    name: 'Centro de Formação Profissional Feminino',
    type: 'centro_formacao',
    ownership: 'publica',
    province: 'Luanda',
    place: 'Rangel, Luanda',
    summary:
      'Centro do INEFOP no Rangel. O seu estatuto (2023) lista, entre outros, cabeleireiro e barbeiro, corte e costura, cozinha e pastelaria, massagem e estética, decoração, mesa e bar e informática.',
    offers: [
      offer('Cabeleireiro e Barbeiro', ['cabeleireiro']),
      offer('Corte e Costura', ['costureiro']),
      offer('Cozinha e Pastelaria', ['cozinheiro', 'pasteleiro']),
      offer('Massagem e Estética', ['esteticista']),
    ],
    sources: [FEMININO],
  },
]
