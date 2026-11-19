import type { Academy, Admission, CatalogCourse } from '../data/types'
import { isOpen } from './scholarships'

// Como entrar: the access exams and applications of an institution or a course, and whether they are open.

const CLOSING_DAYS = 14

export type AdmissionStatus =
  { kind: 'abertas' | 'por_abrir' | 'fechadas' | 'por_anunciar' } | { kind: 'fecham_em'; days: number }

/** Days from one ISO date to another. */
const daysBetween = (from: string, to: string) =>
  Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86_400_000)

/**
 * Applications: closing within two weeks (with the days left), open, still to open or closed. Without a closing
 * day (applications, or else the last exam), still to be announced.
 */
export function admissionStatus(admission: Admission, today: string): AdmissionStatus {
  const { start, end: registrationEnd } = admission.registration
  const end = registrationEnd ?? admission.examDates.at(-1) ?? null
  if (end === null) return { kind: 'por_anunciar' }
  if (start !== null && today < start) return { kind: 'por_abrir' }
  if (!isOpen({ deadline: end, recurring: false }, today)) return { kind: 'fechadas' }
  const days = daysBetween(today, end)
  return days <= CLOSING_DAYS ? { kind: 'fecham_em', days } : { kind: 'abertas' }
}

/** Whether one institution's record covers a course (no course ids: every course it teaches). */
const covers = (admission: Admission, courseId: string) =>
  admission.courseIds === undefined || admission.courseIds.includes(courseId)

/**
 * An institution's records; or, for a course, the national calendar first and then the records of the
 * institutions that teach it.
 */
export function admissionsFor(
  admissions: Admission[],
  target: { academy: Pick<Academy, 'id'> } | { course: Pick<CatalogCourse, 'id' | 'offers'> },
): Admission[] {
  if ('academy' in target) return admissions.filter((admission) => admission.academyId === target.academy.id)
  const { course } = target
  const teaching = new Set(course.offers.map(({ academy }) => academy.id))
  const national = admissions.find((admission) => admission.academyId === null)
  const institutions = admissions.filter(
    (admission) =>
      admission.academyId !== null && teaching.has(admission.academyId) && covers(admission, course.id),
  )
  return [...(national ? [national] : []), ...institutions]
}

/** The exam subjects of an institution's course, from the record that covers it; empty when none says. */
export const examSubjects = (admissions: Admission[], courseId: string) =>
  admissions.find((admission) => covers(admission, courseId) && admission.subjects.length > 0)?.subjects ?? []
