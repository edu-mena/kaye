import type { NewsItem } from '../types'
import { COMPANIES } from './companies'
import { PROJECT_NEWS } from './projectManagement'

// DEMO DATA. What Kayé itself shipped is real (dates from the project history); the companies'
// programs are real and sourced (dated when they reached Kayé); what the "Exemplo"
// institutions publish is made up, and says so.

const KAYE: NewsItem[] = [
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

/** Newest first. */
export const NEWS: NewsItem[] = [...KAYE, ...YOUTH_PROGRAMS, ...PROJECT_NEWS].toSorted((a, b) =>
  b.date.localeCompare(a.date),
)
