import { useTranslation } from 'react-i18next'
import type { Admission } from '../../data/types'

/** "3 ago. – 17 ago. 2026" for applications and exams; "Por anunciar" when no source gives the days. */
export function useAdmissionDates() {
  const { t, i18n } = useTranslation()
  const format = new Intl.DateTimeFormat(i18n.language, { day: 'numeric', month: 'short', year: 'numeric' })
  const range = (start?: string | null, end?: string | null) => {
    const days = [start, end].flatMap((day) => (day ? [format.format(new Date(`${day}T12:00:00`))] : []))
    return days.length === 0 ? t('admission.toAnnounce') : [...new Set(days)].join(' – ')
  }
  return (admission: Admission) => ({
    registration: range(admission.registration.start, admission.registration.end),
    exams: range(admission.examDates[0], admission.examDates.at(-1)),
  })
}
