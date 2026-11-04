import type { NewsItem, Photo } from '../types'
import { COMPANIES } from './companies'
import { CAREER_IMAGES } from './images'
import { PROJECT_NEWS } from './projectManagement'

// DEMO DATA. What Kayé itself shipped is real (dates from the project history); the companies'
// programs are real and sourced (dated when they reached Kayé); what the "Exemplo"
// institutions publish is made up, and says so.

const KAYE: NewsItem[] = [
  {
    id: 'kaye-prazos',
    date: '2026-11-04',
    kind: 'kaye',
    title: 'Calendário de prazos',
    summary:
      'Os prazos das bolsas, das candidaturas e exames de acesso e dos estágios, por data, com lembrete no calendário do telemóvel.',
    to: '/prazos',
  },
  {
    id: 'kaye-estagios',
    date: '2026-11-04',
    kind: 'kaye',
    title: 'Estágios e programas de trainee',
    summary:
      'Os estágios do INEFOP, de bancos, operadoras e petrolíferas: para quem são, se são pagos, o prazo e a fonte de cada um.',
    to: '/estagios',
  },
  {
    id: 'kaye-como-entrar',
    date: '2026-11-03',
    kind: 'kaye',
    title: 'Como entrar no ensino superior',
    summary:
      'Em cada curso e instituição: as datas da candidatura e do exame, as disciplinas, as vagas, a taxa e a fonte oficial.',
    to: '/cursos',
  },
  {
    id: 'kaye-bolsas',
    date: '2026-11-03',
    kind: 'kaye',
    title: 'Bolsas de estudo',
    summary:
      'As bolsas do INAGBE, de empresas e de governos estrangeiros, com o prazo, o que cobrem e a fonte de cada uma.',
    to: '/bolsas',
  },
  {
    id: 'kaye-mercado-novidades',
    date: '2026-10-27',
    kind: 'kaye',
    title: 'Mercado e Novidades',
    summary: 'As áreas em alta, onde falta formação e quem contrata em Angola, e esta página com o que muda.',
    to: '/mercado',
  },
  {
    id: 'kaye-pesquisa',
    date: '2026-10-27',
    kind: 'kaye',
    title: 'Pesquisa: tudo num só sítio',
    summary:
      'Procura carreiras, cursos, academias e empresas ao mesmo tempo, sem te preocupares com acentos.',
    to: '/pesquisa',
  },
  {
    id: 'kaye-privacidade',
    date: '2026-10-27',
    kind: 'kaye',
    title: 'Termos de uso e Política de privacidade',
    summary:
      'Em palavras simples: que dados usamos, para quê e como os apagas. Ainda são uma versão provisória.',
    to: '/privacidade',
  },
  {
    id: 'kaye-configuracoes',
    date: '2026-10-27',
    kind: 'kaye',
    title: 'Configurações',
    summary: 'O idioma, uma cópia dos teus dados e o botão para os apagar, num só sítio.',
    to: '/configuracoes',
  },
  {
    id: 'kaye-academias-empresas',
    date: '2026-10-25',
    kind: 'kaye',
    title: 'Academias e Empresas reais',
    summary:
      'Universidades, institutos e empresas de Angola, só com factos de fontes públicas, e as profissões a que cada um está ligado.',
    to: '/academias',
  },
  {
    id: 'kaye-pagina-curso',
    date: '2026-10-25',
    kind: 'kaye',
    title: 'Uma página para cada curso',
    summary: 'Vê que instituições oferecem o mesmo curso, a que profissões leva, e compara as ofertas.',
    to: '/cursos',
  },
  {
    id: 'kaye-carreiras',
    date: '2026-10-24',
    kind: 'kaye',
    title: 'Carreiras e Cursos de cara nova',
    summary:
      'Uma foto para cada profissão, filtros por área, procura e salário, e os cursos classificados por profissão.',
    to: '/carreiras',
  },
]

/** The companies' programs for young people, from their public sources. */
const YOUTH_PROGRAMS: NewsItem[] = COMPANIES.flatMap((company) =>
  company.programs.map((program, index): NewsItem => ({
    id: `${company.id}-programa-${index + 1}`,
    date: '2026-10-25',
    kind: 'empresas',
    title: `${company.name}: ${program.name}`,
    summary: program.summary,
    to: `/empresas/${company.id}`,
    source: program.source,
    careers: company.careers,
  })),
)

/** Short pieces from public sources (dated when they reached Kayé): on Novidades, never on Notificações. */
const ANALYSIS: NewsItem[] = [
  {
    id: 'analise-fin-summit-2026',
    date: '2026-11-02',
    kind: 'analise',
    title: 'FIN Summit 2026: finanças e negócios em Luanda',
    summary:
      'A 4.ª edição foi marcada para 31 de Outubro e 1 de Novembro, no InterContinental Luanda Miramar.',
    body: [
      'O programa anunciou três salas: Finanças, Economia e Investimentos; Negócios e Liderança; Marketing e Vendas.',
      'O evento dirige-se a líderes empresariais, investidores e profissionais dos sectores financeiro e empresarial.',
      'Estavam previstas intervenções do ministro da Indústria e Comércio, Rui Miguêns de Oliveira, e do ministro do Turismo, Márcio Daniel.',
    ],
    source: {
      label: 'Ver Angola',
      url: 'https://www.verangola.net/va/pt/102026/eventos/50484/4ª-edição-do-FIN-Summit-2026-Conferências.htm',
    },
    careers: ['analista-financeiro', 'economista', 'contabilista'],
  },
  {
    id: 'analise-jovem-lideranca-einstein',
    date: '2026-11-02',
    kind: 'analise',
    title: 'De assistente a liderança em cinco anos',
    summary:
      'Jadmira Queta, angolana de 31 anos, é gestora de pessoas na presidência do Hospital Israelita Albert Einstein, em São Paulo.',
    body: [
      'Entrou no hospital em 2021 como assistente de atendimento e, ao longo de cinco anos, chegou a um cargo de liderança.',
      'Segundo a Embaixada de Angola no Brasil, é a primeira estrangeira africana num cargo de liderança no hospital.',
      'Tem formação em Administração de Empresas pela Universidade Anhanguera e participa no programa interno Etnias, dedicado à diversidade e à inclusão.',
    ],
    source: {
      label: 'Ver Angola',
      url: 'https://www.verangola.net/va/pt/032026/Saude/48006/Angolana-passa-a-ocupar-cargo-de-liderança-em-hospital-de-referência-brasileiro.htm',
    },
    careers: ['gestor-de-recursos-humanos', 'tecnico-de-recursos-humanos'],
  },
]

const photosOf = (slugs: string[]): Photo[] => slugs.flatMap((slug) => CAREER_IMAGES[slug] ?? [])

/** For news with no career of its own, such as what Kayé shipped. */
const GENERAL_PHOTOS = photosOf([
  'product-manager',
  'analista-de-bi',
  'formador-de-tic',
  'gestor-de-ti',
  'consultor-de-gestao',
  'designer-ui-ux',
  'analista-de-sistemas',
])

/** The photo of one of its careers, or a general one. The position varies them along the feed. */
function withImage(item: NewsItem, index: number): NewsItem {
  const photos = photosOf(item.careers ?? [])
  const pool = photos.length > 0 ? photos : GENERAL_PHOTOS
  return { ...item, image: pool[index % pool.length] }
}

/** Newest first. */
export const NEWS: NewsItem[] = [...KAYE, ...YOUTH_PROGRAMS, ...PROJECT_NEWS, ...ANALYSIS]
  .toSorted((a, b) => b.date.localeCompare(a.date))
  .map(withImage)
