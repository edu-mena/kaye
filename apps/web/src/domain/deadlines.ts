import {
  type Academy,
  type Admission,
  GROUP_AREAS,
  type Internship,
  type MarketArea,
  type Scholarship,
} from '../data/types'

// Prazos: every dated deadline that counts (scholarships, access applications and exams, internships), from today on.
// Concursos públicos have no closing day in the data yet, so they stay out (nothing made up).

export type DeadlineKind = 'bolsa' | 'acesso' | 'exame' | 'estagio' | 'concurso'

export type DeadlineItem = {
  id: string
  kind: DeadlineKind
  title: string
  /** ISO day. */
  date: string
  /** The page of the app it is about. */
  to: string
  /** Empty: open to any area. */
  areas: MarketArea[]
  careerSlugs?: string[]
}

export type DeadlineSources = {
  scholarships: Scholarship[]
  admissions: Admission[]
  internships: Internship[]
  academies: Pick<Academy, 'id' | 'name' | 'offers'>[]
}

/** Days from one ISO day to another. */
export const daysUntil = (today: string, date: string) =>
  Math.round((Date.parse(`${date}T00:00:00Z`) - Date.parse(`${today}T00:00:00Z`)) / 86_400_000)

/** The market areas an institution's record covers (no course ids: every course it teaches). */
function admissionAreas(admission: Admission, academy: DeadlineSources['academies'][number] | undefined) {
  if (!academy) return []
  const offers = academy.offers.filter(
    (offer) => admission.courseIds === undefined || admission.courseIds.includes(offer.course.id),
  )
  return [...new Set(offers.flatMap((offer) => offer.areas.map((group) => GROUP_AREAS[group])))]
}

function admissionItems(admission: Admission, academies: DeadlineSources['academies']): DeadlineItem[] {
  const academy = academies.find((item) => item.id === admission.academyId)
  const name = academy?.name ?? 'MESCTI'
  const to = academy ? `/academias/${academy.id}` : '/cursos'
  const areas = admissionAreas(admission, academy)
  const items: DeadlineItem[] = admission.examDates.map((date, index) => ({
    id: `${admission.id}-exame-${index}`,
    kind: 'exame',
    title: name,
    date,
    to,
    areas,
  }))
  const end = admission.registration.end
  return end === null
    ? items
    : [{ id: `${admission.id}-acesso`, kind: 'acesso', title: name, date: end, to, areas }, ...items]
}

/** The deadlines from today on, nearest first. */
export function upcomingDeadlines(sources: DeadlineSources, today: string): DeadlineItem[] {
  const items: DeadlineItem[] = [
    ...sources.scholarships.flatMap((item): DeadlineItem[] =>
      item.deadline === null
        ? []
        : [
            {
              id: item.id,
              kind: 'bolsa',
              title: item.name,
              date: item.deadline,
              to: '/bolsas',
              areas: item.areas,
            },
          ],
    ),
    ...sources.internships.flatMap((item): DeadlineItem[] =>
      item.deadline === null
        ? []
        : [
            {
              id: item.id,
              kind: 'estagio',
              title: item.name,
              date: item.deadline,
              to: '/estagios',
              areas: item.areas,
            },
          ],
    ),
    ...sources.admissions.flatMap((admission) => admissionItems(admission, sources.academies)),
  ]
  return items.filter((item) => item.date >= today).toSorted((a, b) => a.date.localeCompare(b.date))
}

/** The person's areas: those of the careers they saved or chose. */
export function myAreas(careers: { slug: string; group: keyof typeof GROUP_AREAS }[], slugs: Set<string>) {
  return new Set(
    careers.filter((career) => slugs.has(career.slug)).map((career) => GROUP_AREAS[career.group]),
  )
}

/** "Só para mim": open to any area, in one of the person's areas, or about one of their careers. */
export function mine(items: DeadlineItem[], user: { areas: Set<MarketArea>; careers: Set<string> }) {
  return items.filter(
    (item) =>
      item.areas.length === 0 ||
      item.areas.some((area) => user.areas.has(area)) ||
      (item.careerSlugs?.some((slug) => user.careers.has(slug)) ?? false),
  )
}

/** Not seen yet: it came within a week after the person last opened their notifications. */
export function isDeadlineUnseen(item: DeadlineItem, seenAt: string | null): boolean {
  return seenAt === null || daysUntil(seenAt.slice(0, 10), item.date) > 7
}
