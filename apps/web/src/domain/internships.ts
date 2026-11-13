import type { Internship, InternshipAudience, InternshipKind, MarketArea } from '../data/types'
import { isOpen } from './scholarships'

// Estágios: which internships suit a career or a company, and the filters of /estagios.

export const INTERNSHIP_KINDS: InternshipKind[] = [
  'trainee',
  'estagio_profissional',
  'estagio_curricular',
  'programa_publico',
]
export const INTERNSHIP_AUDIENCES: InternshipAudience[] = [
  'finalista',
  'recem_formado',
  'medio_tecnico',
  'licenciado',
]

export type InternshipFilters = {
  kind: InternshipKind | null
  area: MarketArea | null
  audience: InternshipAudience | null
  open: boolean
  paid: boolean
}

/** No areas: open to any area. No audience: the source names no level, so nobody is left out. */
const fitsArea = (internship: Internship, areas: MarketArea[]) =>
  internship.areas.length === 0 || internship.areas.some((area) => areas.includes(area))

export function filterInternships(
  internships: Internship[],
  { kind, area, audience, open, paid }: InternshipFilters,
  today: string,
): Internship[] {
  return internships.filter(
    (internship) =>
      (kind === null || internship.kind === kind) &&
      (area === null || fitsArea(internship, [area])) &&
      (audience === null || internship.audience.length === 0 || internship.audience.includes(audience)) &&
      (!open || isOpen(internship, today)) &&
      (!paid || internship.paid === true),
  )
}

/** The internships for a career's areas: those made for the area first, then the open ones. */
export function internshipsFor(internships: Internship[], areas: MarketArea[], today: string): Internship[] {
  return internships
    .filter((internship) => fitsArea(internship, areas))
    .toSorted(
      (a, b) =>
        Number(b.areas.length > 0) - Number(a.areas.length > 0) ||
        Number(isOpen(b, today)) - Number(isOpen(a, today)),
    )
}

/** The programmes a company itself runs. */
export function byCompany(internships: Internship[], companyId: string): Internship[] {
  return internships.filter((internship) => internship.companyId === companyId)
}
