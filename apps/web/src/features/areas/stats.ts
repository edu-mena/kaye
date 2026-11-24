import type { Academy, CareerSummary, Company, MarketArea, Photo, Program } from '../../data/types'
import {
  academiesForCareers,
  careersOfArea,
  companiesForCareers,
  programsOfCareers,
} from '../../domain/relations'

export type AreaStats = {
  area: MarketArea
  careers: CareerSummary[]
  programs: Program[]
  academies: number
  companies: number
  /** Distinct courses (an institution's offers of one course count once). */
  courses: number
  photo?: Photo
}

type Catalogue = { careers: CareerSummary[]; programs: Program[]; academies: Academy[]; companies: Company[] }

/** What the catalogue holds for one area: its careers and everything linked to them. */
export function areaStats(
  area: MarketArea,
  { careers, programs, academies, companies }: Catalogue,
): AreaStats {
  const inArea = careersOfArea(careers, area)
  const slugs = inArea.map((career) => career.slug)
  const areaPrograms = programsOfCareers(programs, slugs)
  return {
    area,
    careers: inArea,
    programs: areaPrograms,
    academies: academiesForCareers(academies, slugs).length,
    companies: companiesForCareers(companies, slugs).length,
    courses: new Set(areaPrograms.map((program) => program.course.id)).size,
    photo: inArea.find((career) => career.image)?.image,
  }
}
