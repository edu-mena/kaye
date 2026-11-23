import { useMemo } from 'react'
import { useCareers, useCvExamples } from '../../data/queries'
import type { CvData, CvDocument } from '../../data/types'
import { careerTips, type CareerTips } from '../../domain/cvCareer'
import { useUser } from '../../state/userStore'

/** What a person with no experience can still write for their career, taken from the model CVs. */
export function useCareerTips(
  cv: CvData,
  target?: CvDocument['target'],
): CareerTips & { career: string | null } {
  const user = useUser()
  const { data: examples = [] } = useCvExamples()
  const { data: careers = [] } = useCareers()
  const slug = target?.career ?? user.targetCareer ?? user.savedCareers[0] ?? null
  const area = target?.area ?? user.discovery?.areas[0] ?? null
  const career = careers.find((item) => item.slug === slug)?.name ?? null
  const tips = useMemo(
    () => careerTips(examples, careers, slug, area, cv),
    [examples, careers, slug, area, cv],
  )
  return { ...tips, career }
}
