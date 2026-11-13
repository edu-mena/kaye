import type { NewsItem, SourceLink } from '../types'

// Real news about the companies, from the press or the company itself, dated on the day it was published
// (docs/recolha-de-dados.md, "Empresas", 13/11/2026). Saving a company makes its news "Para ti".

const VA = 'https://www.verangola.net/va'
const FORBES = 'https://forbesafricalusofona.com'

type Piece = { id: string; date: string; title: string; summary: string; source: SourceLink }

/** The first company is the one the piece opens. */
const about = (companies: string[], piece: Piece): NewsItem => ({
  ...piece,
  kind: 'empresas',
  companies,
  to: `/empresas/${companies[0]}`,
})

export const COMPANY_NEWS: NewsItem[] = [
  about(['unitel'], {
    id: 'unitel-oferta-publica-2026',
    date: '2026-07-06',
    title: 'Unitel põe 15% do capital à venda na bolsa',
    summary:
      'Pela primeira vez, os angolanos podem tornar-se accionistas da operadora, que tem mais de 21 milhões de clientes. São 50 milhões de acções para a BODIVA.',
    source: {
      label: 'Ver Angola',
      url: `${VA}/pt/072026/Telecomunicacoes/49388/Lançada-oferta-pública-de-15-por-cento-da-Unitel-Pela-primeira-vez-angolanos-poderão-tornar-se-accionistas.htm`,
    },
  }),
  about(['unitel'], {
    id: 'unitel-bodiva-2026',
    date: '2026-07-29',
    title: 'Unitel entra na bolsa com 11 264 novos accionistas',
    summary:
      'A procura chegou a cerca de 120% da oferta e rendeu perto de 300 mil milhões de kwanzas: a maior oferta pública até hoje. É a primeira operadora de telecomunicações na BODIVA.',
    source: {
      label: 'Ver Angola',
      url: `${VA}/en/072026/Telecommunications/49657/The-stock-exchange-highlighted-the-entry-of-11264-new-shareholders-into-Unitel.htm`,
    },
  }),
  about(['africell'], {
    id: 'africell-rede-julho-2026',
    date: '2026-07-29',
    title: 'Africell reforça a rede depois da falha de 28 de Julho',
    summary:
      'Mais capacidade, técnicos, lojas e pontos de atendimento. Para aguentar a procura, suspendeu as chamadas grátis na rede das 18h à meia-noite.',
    source: { label: 'Africell', url: 'https://www.africell.com/news/angola-network-statement-july-2026/' },
  }),
  about(['angola-cables'], {
    id: 'angola-cables-aicep-2026',
    date: '2026-04-30',
    title: 'CEO da Angola Cables recebe o Prémio de Liderança AICEP 2026',
    summary:
      'Ângelo Gama lidera a empresa desde 2020. A Angola Cables tem mais de 33 mil km de cabo submarino e liga-se a mais de 30 pontos de presença no mundo.',
    source: {
      label: 'Ver Angola',
      url: `${VA}/en/042026/Technology/48642/Angola-Cables-CEO-receives-AICEP-Leadership-Award-2026.htm`,
    },
  }),
  about(['bai'], {
    id: 'bai-afis-2026',
    date: '2026-11-04',
    title: 'BAI reúne-se com investidores no Africa Financial Summit',
    summary:
      'Patrocinador Diamond da cimeira em Luanda, o banco teve encontros com instituições financeiras e de desenvolvimento para trazer investimento para Angola.',
    source: {
      label: 'Ver Angola',
      url: `${VA}/en/112026/BankingInsurance/50656/BAI-leads-bilateral-and-multilateral-meetings-at-the-Africa-Financial-Summit-2026.htm`,
    },
  }),
  about(['bfa', 'unitel'], {
    id: 'bfa-lideranca-2026',
    date: '2026-03-21',
    title: 'Unitel propõe a nova liderança do BFA para 2026-2029',
    summary:
      'Maria do Carmo Bernardo para presidente do Conselho de Administração e Luís Gonçalves na presidência da Comissão Executiva, antes da assembleia de 30 de Março.',
    source: { label: 'Forbes África Lusófona', url: `${FORBES}/?p=170292` },
  }),
  about(['sonangol'], {
    id: 'sonangol-benguela-2026',
    date: '2026-08-06',
    title: 'Sonangol e ANPG confirmam gás e petróleo na bacia de Benguela',
    summary:
      'O poço Katambi-2 deu 41 milhões de pés cúbicos de gás e 1 160 barris de condensado por dia nos primeiros testes; pode passar dos 100 milhões de pés cúbicos.',
    source: {
      label: 'Ver Angola',
      url: `${VA}/en/082026/Energy/49738/ANPG-and-Sonangol-confirm-the-presence-of-gas-and-oil-in-Benguela.htm`,
    },
  }),
  about(['taag'], {
    id: 'taag-novo-pce-2025',
    date: '2025-12-16',
    title: 'Miguel Carneiro é o novo presidente executivo da TAAG',
    summary:
      'Era o director comercial da companhia e sucede a Nelson Pedro Rodrigues de Oliveira na presidência da Comissão Executiva.',
    source: { label: 'Forbes África Lusófona', url: `${FORBES}/?p=166703` },
  }),
  about(['taag'], {
    id: 'taag-semestre-2026',
    date: '2026-08-27',
    title: 'TAAG gera 19,2 milhões de dólares de caixa no 1.º semestre',
    summary:
      'Gastou menos 25,7 milhões do que o orçamento previa, voltou a pôr cinco aviões a voar e passou de 10 para 13 destinos em África.',
    source: { label: 'Forbes África Lusófona', url: `${FORBES}/?p=175653` },
  }),
  about(['endiama'], {
    id: 'endiama-chiri-2026',
    date: '2026-04-23',
    title: 'Endiama e Rio Tinto criam a Sociedade Mineira do Chiri',
    summary:
      'A nova empresa vai procurar e explorar diamantes na Lunda Sul. O objectivo é pôr Angola entre os maiores produtores do mundo.',
    source: {
      label: 'Ver Angola',
      url: `${VA}/pt/042026/MateriasPrimas/48562/Sociedade-Mineira-do-Chiri-Endiama-e-Rio-Tinto-v%C3%A3o-explorar-diamantes-na-Lunda-Sul.htm`,
    },
  }),
  about(['sociedade-mineira-de-catoca'], {
    id: 'catoca-resultados-2025',
    date: '2026-04-25',
    title: 'Catoca lucra 109 milhões de dólares em 2025 e muda de director-geral',
    summary:
      'Os accionistas distribuem 90% do lucro e guardam 10% para projectos ambientais. Pedro Inácio Velasco Galiano sucede a Benedito Paulo Manuel.',
    source: { label: 'Forbes África Lusófona', url: `${FORBES}/?p=171564` },
  }),
  about(['totalenergies'], {
    id: 'totalenergies-investimento-2026',
    date: '2026-09-09',
    title: 'TotalEnergies e parceiros vão investir 10 mil milhões de dólares em Angola',
    summary:
      'Em cinco anos, para manter os cerca de 450 mil barris por dia. Inclui o Kaminho, um projecto de 6 mil milhões na bacia do Kwanza, previsto para 2028.',
    source: {
      label: 'Offshore Engineer',
      url: 'https://www.oedigital.com/amp/news/542835-totalenergies-partners-to-invest-10b-in-angola',
    },
  }),
  about(['chevron'], {
    id: 'chevron-bloco-0-2026',
    date: '2026-08-17',
    title: 'Chevron descobre petróleo e gás no Bloco 0, em Cabinda',
    summary:
      'O poço 105-4X encontrou uma coluna de mais de 600 metros no reservatório Pinda. A CABGOC, filial da Chevron, opera o bloco com 39,2%.',
    source: {
      label: 'World Oil',
      url: 'https://worldoil.com/news/2026/8/17/chevron-strikes-oil-and-gas-in-angola-s-block-0-eyes-tieback-development/',
    },
  }),
  about(['angola-lng'], {
    id: 'angola-lng-manutencao-2026',
    date: '2026-07-08',
    title: 'Angola LNG pára a fábrica do Soyo para manutenção',
    summary:
      'Paragem geral planeada de 32 dias, segundo a ANPG, dentro do plano periódico de manutenção alargada.',
    source: {
      label: 'Forbes África Lusófona',
      url: `${FORBES}/angola-lng-limited-suspende-operacoes-para-manutencao-alargada/`,
    },
  }),
  about(['empresa-nacional-de-distribuicao-de-electricidade-ende'], {
    id: 'ende-contadores-2026',
    date: '2026-05-29',
    title: 'ENDE já instalou mais de 1,26 milhões de contadores pré-pagos',
    summary:
      'O presidente do Conselho de Administração, Pedro Buca, apontou também o vandalismo da rede e o crescimento rápido das cidades como desafios.',
    source: {
      label: 'ANGOP',
      url: 'https://angop.ao/noticias/economia/pca-da-ende-realca-progressos-no-sector-energetico/',
    },
  }),
]
