import type { TFunction } from 'i18next'
import type { Academy, CareerGroup, CareerSummary, Company, Institution, Program } from '../../data/types'
import { rank } from '../../domain/search'

export const RESULT_TYPES = ['carreiras', 'cursos', 'academias', 'empresas'] as const
export type ResultType = (typeof RESULT_TYPES)[number]

/** Each type of result is one of the app's sections: its name, icon and address. */
export const SECTIONS = {
  carreiras: { nav: 'careers', icon: 'compass', to: '/carreiras' },
  cursos: { nav: 'courses', icon: 'cap', to: '/cursos' },
  academias: { nav: 'academies', icon: 'landmark', to: '/academias' },
  empresas: { nav: 'companies', icon: 'building', to: '/empresas' },
} as const satisfies Record<ResultType, { nav: string; icon: string; to: string }>

/** A career shows its area's icon; everything else its logo (or initials). */
type Picture =
  { group: CareerGroup } | { logo: Pick<Institution, 'name' | 'logo'> & { logoOnDark?: boolean | undefined } }

/** One result, whatever it is: where it leads, its picture, its name and one line about it. */
export type Result = { key: string; to: string; picture: Picture; title: string; meta: string }

type Data = { careers: CareerSummary[]; programs: Program[]; academies: Academy[]; companies: Company[] }

/** Every match of the words, by type, best first. Labels are searched in the person's language. */
export function findResults(data: Data, words: string[], t: TFunction): Record<ResultType, Result[]> {
  const careers = rank(data.careers, words, (career) => ({
    name: career.name,
    others: [career.summary, t(`groups.${career.group}`)],
  }))
  const programs = rank(data.programs, words, (program) => ({
    name: program.name,
    others: [
      program.course.name,
      program.institution.name,
      program.institution.province,
      t(`training.${program.level}`),
    ],
  }))
  const academies = rank(data.academies, words, (academy) => ({
    name: academy.name,
    others: [
      academy.place,
      academy.province,
      t(`training.type_${academy.type}`),
      ...academy.offers.flatMap((offer) => [offer.name, offer.faculty ?? '']),
    ],
  }))
  const companies = rank(data.companies, words, (company) => ({
    name: company.name,
    others: [t(`companies.sector_${company.sector}`), company.place, company.province, company.summary],
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
    empresas: companies.map((company) => ({
      key: company.id,
      to: `/empresas/${company.id}`,
      title: company.name,
      meta: `${t(`companies.sector_${company.sector}`)} · ${company.place}`,
      picture: { logo: company },
    })),
  }
}
