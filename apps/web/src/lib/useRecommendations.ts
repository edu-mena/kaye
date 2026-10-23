import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useCareers } from '../data/queries'
import { interestLevel, type InterestLevel } from '../domain/fit'
import { recommend, type Reason } from '../domain/recommend'
import { useRiasecProfile } from '../state/useRiasecProfile'
import type { CareerSummary } from '../data/types'

export type RecommendedCareer = { career: CareerSummary; match: InterestLevel; reasons: string[] }

/** Top careers for the person's test result, with the reasons in plain words. */
export function useRecommendations(limit = 5): RecommendedCareer[] | null {
  const { t } = useTranslation()
  const { profile } = useRiasecProfile()
  const { data: careers } = useCareers()

  return useMemo(() => {
    if (!profile || !careers) return null
    const label = (reason: Reason) => {
      if (reason.kind === 'interest') {
        return t('assessment.reasonInterest', { dimension: t(`riasec.${reason.dimension}`) })
      }
      return reason.kind === 'demand' ? t('assessment.reasonDemand') : t('assessment.reasonSalary')
    }
    return recommend(profile, careers, limit).map((item) => ({
      career: item.career,
      match: interestLevel(item.compatibility),
      reasons: item.reasons.map(label),
    }))
  }, [profile, careers, limit, t])
}
