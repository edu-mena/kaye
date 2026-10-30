import type { NewsItem } from '../types'
import { COMPANIES } from './companies'
import { PROGRAMS } from './programs'
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

/** A made-up announcement from an "Exemplo" institution, about one of its courses. */
function example(programId: string, date: string, title: string, summary: string): NewsItem {
  const program = PROGRAMS.find((entry) => entry.id === programId)
  if (!program) throw new Error(`Unknown program ${programId}`)
  return {
    id: `exemplo-${programId}`,
    date,
    kind: 'cursos',
    title,
    summary,
    to: `/cursos/${program.id}`,
    example: true,
    careers: program.careers,
  }
}

const EXAMPLES: NewsItem[] = [
  example(
    'eng-informatica-publica',
    '2026-10-26',
    'Universidade Pública Exemplo abre candidaturas',
    'Engenharia Informática e Ciências da Computação: candidaturas até 15 de dezembro, com exame de acesso em janeiro.',
  ),
  example(
    'web-react',
    '2026-10-23',
    'Nova turma de Desenvolvimento Web com React',
    'A Academia Digital Exemplo abre uma turma pós-laboral em novembro, com 20 vagas.',
  ),
  example(
    'analise-dados',
    '2026-10-20',
    'Desconto em Análise de Dados',
    'A Academia Digital Exemplo dá 20% de desconto na inscrição até 30 de novembro.',
  ),
  example(
    'figma-benguela',
    '2026-10-18',
    'Design de interfaces chega a Benguela',
    'O Centro de Formação Exemplo Benguela abre o primeiro curso de Figma fora de Luanda.',
  ),
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
export const NEWS: NewsItem[] = [...KAYE, ...EXAMPLES, ...YOUTH_PROGRAMS, ...PROJECT_NEWS].toSorted((a, b) =>
  b.date.localeCompare(a.date),
)
