import type { TFunction } from 'i18next'
import type { IconName } from '../../components/icons'
import type {
  Academy,
  CareerGroup,
  CareerSummary,
  Company,
  Institution,
  Internship,
  MarketArea,
  Program,
  Scholarship,
} from '../../data/types'
import { byInterest, groupAreas } from '../../domain/interests'
import { rank } from '../../domain/search'

export const RESULT_TYPES = [
  'carreiras',
  'cursos',
  'academias',
  'bolsas',
  'estagios',
  'empresas',
  'pessoas',
  'paginas',
] as const
export type ResultType = (typeof RESULT_TYPES)[number]

/** Each type of result is one of the app's sections: its name, icon and address. */
export const SECTIONS = {
  carreiras: { nav: 'careers', icon: 'compass', to: '/carreiras' },
  cursos: { nav: 'courses', icon: 'cap', to: '/cursos' },
  academias: { nav: 'academies', icon: 'landmark', to: '/academias' },
  bolsas: { nav: 'scholarships', icon: 'award', to: '/oportunidades?tab=bolsas' },
  estagios: { nav: 'internships', icon: 'briefcase', to: '/oportunidades?tab=estagios' },
  empresas: { nav: 'companies', icon: 'building', to: '/empresas' },
  pessoas: { nav: 'people', icon: 'users', to: '/empresas' },
  paginas: { nav: 'pages', icon: 'compass', to: '/' },
} as const satisfies Record<ResultType, { nav: string; icon: string; to: string }>

/** The sections a tile of "Explorar" leads to; people and pages are only found by typing. */
export const EXPLORE_TYPES = RESULT_TYPES.filter((type) => type !== 'pessoas' && type !== 'paginas')

/** The app's own pages, so "plano" or "exames de acesso" lead there; each has its lines in search.appPages. */
const PAGES = [
  { id: 'plan', to: '/plano', icon: 'path' },
  { id: 'noDegree', to: '/sem-universidade', icon: 'helmet' },
  { id: 'admissions', to: '/prazos?tipo=exame', icon: 'calendar' },
  { id: 'accessExams', to: '/exames-de-acesso', icon: 'pencil' },
  { id: 'deadlines', to: '/prazos', icon: 'calendar' },
  { id: 'tests', to: '/testes', icon: 'target' },
  { id: 'psychotech', to: '/treino', icon: 'brain' },
  { id: 'interviews', to: '/entrevistas', icon: 'message' },
  { id: 'kursos', to: '/kursos', icon: 'book' },
  { id: 'market', to: '/mercado', icon: 'chart' },
  { id: 'news', to: '/novidades', icon: 'newspaper' },
  { id: 'opportunities', to: '/oportunidades', icon: 'award' },
  { id: 'cv', to: '/cv', icon: 'document' },
  { id: 'card', to: '/cv/cartao', icon: 'share' },
  { id: 'profile', to: '/perfil', icon: 'user' },
  { id: 'support', to: '/suporte', icon: 'help' },
  { id: 'settings', to: '/configuracoes', icon: 'gear' },
] as const satisfies { id: string; to: string; icon: IconName }[]

/** A career shows its area's icon, a scholarship its section's; everything else its logo (or initials). */
type Picture =
  | { group: CareerGroup }
  | { icon: IconName }
  | { logo: Pick<Institution, 'name' | 'logo'> & { logoOnDark?: boolean | undefined } }

/** One result, whatever it is: where it leads, its picture, its name and one line about it. */
export type Result = { key: string; to: string; picture: Picture; title: string; meta: string }

type Data = {
  careers: CareerSummary[]
  programs: Program[]
  academies: Academy[]
  companies: Company[]
  scholarships: Scholarship[]
  internships: Internship[]
}

/**
 * Every match of the words, by type, best first; on a tie, what touches the person's areas first.
 * Labels are searched in the person's language.
 */
export function findResults(
  data: Data,
  words: string[],
  t: TFunction,
  areas: readonly MarketArea[] = [],
): Record<ResultType, Result[]> {
  // rank() keeps the order of equal scores, so sorting by interest first breaks the ties.
  const mine = <T>(items: T[], areasOf: (item: T) => readonly MarketArea[]) =>
    byInterest(items, areasOf, areas)
  const careers = rank(
    mine(data.careers, (career) => groupAreas([career.group])),
    words,
    (career) => ({
      name: career.name,
      others: [career.summary, t(`groups.${career.group}`)],
    }),
  )
  const programs = rank(data.programs, words, (program) => ({
    name: program.name,
    others: [
      program.course.name,
      program.institution.name,
      program.institution.province,
      t(`training.${program.level}`),
    ],
  }))
  const academies = rank(
    mine(data.academies, (academy) => groupAreas(academy.offers.flatMap((offer) => offer.areas))),
    words,
    (academy) => ({
      name: academy.name,
      others: [
        academy.place,
        academy.province,
        t(`training.type_${academy.type}`),
        ...academy.offers.flatMap((offer) => [offer.name, offer.faculty ?? '']),
      ],
    }),
  )
  const companies = rank(
    mine(data.companies, (company) => groupAreas(company.areas)),
    words,
    (company) => ({
      name: company.name,
      others: [t(`companies.sector_${company.sector}`), company.place, company.province, company.summary],
    }),
  )

  const scholarships = rank(
    mine(data.scholarships, (item) => item.areas),
    words,
    (scholarship) => ({
      name: scholarship.name,
      others: [
        scholarship.provider,
        t(`scholarships.destination_${scholarship.destination}`),
        ...scholarship.levels.map((level) => t(`training.${level}`)),
        ...scholarship.areas.map((area) => t(`market.area_${area}`)),
      ],
    }),
  )

  const internships = rank(
    mine(data.internships, (item) => item.areas),
    words,
    (internship) => ({
      name: internship.name,
      others: [
        internship.provider,
        t(`internships.kind_${internship.kind}`),
        ...internship.audience.map((audience) => t(`internships.audience_${audience}`)),
        ...internship.areas.map((area) => t(`market.area_${area}`)),
      ],
    }),
  )

  // Only the name and the post: the rest of a person's record stays on the company's page.
  const people = rank(
    data.companies.flatMap((company) => (company.people ?? []).map((person) => ({ company, person }))),
    words,
    ({ company, person }) => ({ name: person.name, others: [person.role, company.name] }),
  )
  const pages = rank([...PAGES], words, (page) => ({
    name: t(`search.appPages.${page.id}_title`),
    others: [t(`search.appPages.${page.id}_words`)],
  }))

  return {
    carreiras: careers.map((career) => ({
      key: career.slug,
      to: `/carreiras/${career.slug}`,
      title: career.name,
      meta: `${t(`groups.${career.group}`)} · ${t(`demand.${career.demand}`)}`,
      picture: { group: career.group },
    })),
    cursos: programs.map((program) => ({
      key: program.id,
      to: `/cursos/${program.id}`,
      title: program.name,
      meta: `${program.institution.name} · ${t(`training.${program.level}`)}`,
      picture: { logo: program.institution },
    })),
    academias: academies.map((academy) => ({
      key: academy.id,
      to: `/academias/${academy.id}`,
      title: academy.name,
      meta: `${t(`training.type_${academy.type}`)} · ${academy.place}`,
      picture: { logo: academy },
    })),
    bolsas: scholarships.map((scholarship) => ({
      key: scholarship.id,
      to: `/oportunidades?tab=bolsas&destino=${scholarship.destination}`,
      title: scholarship.name,
      meta: `${scholarship.provider} · ${t(`scholarships.destination_${scholarship.destination}`)}`,
      picture: { icon: 'award' },
    })),
    estagios: internships.map((internship) => ({
      key: internship.id,
      to: `/oportunidades?tab=estagios&tipo=${internship.kind}`,
      title: internship.name,
      meta: `${internship.provider} · ${t(`internships.kind_${internship.kind}`)}`,
      picture: { icon: 'briefcase' },
    })),
    empresas: companies.map((company) => ({
      key: company.id,
      to: `/empresas/${company.id}`,
      title: company.name,
      meta: `${t(`companies.sector_${company.sector}`)} · ${company.place}`,
      picture: { logo: company },
    })),
    pessoas: people.map(({ company, person }) => ({
      key: `${company.id}-${person.name}`,
      to: `/empresas/${company.id}`,
      title: person.name,
      meta: `${person.role} · ${company.name}`,
      picture: { icon: 'user' },
    })),
    paginas: pages.map((page) => ({
      key: page.id,
      to: page.to,
      title: t(`search.appPages.${page.id}_title`),
      meta: t(`search.appPages.${page.id}_words`),
      picture: { icon: page.icon },
    })),
  }
}
