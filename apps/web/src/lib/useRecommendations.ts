import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useCareers, useCareerTraits } from '../data/queries'
import { isMinor } from '../domain/education'
import { interestLevel, type InterestLevel } from '../domain/fit'
import { recommendFromDiscovery, type DiscoveryReason } from '../domain/discovery'
import { recommend, type Reason } from '../domain/recommend'
import { useRiasecProfile } from '../state/useRiasecProfile'
import { useUser } from '../state/userStore'
import type { CareerSummary } from '../data/types'

export type RecommendedCareer = { career: CareerSummary; match: InterestLevel; reasons: string[] }

/** Top careers for the person's test result or, without it, for what they told the guide. */
export function useRecommendations(limit = 5): RecommendedCareer[] | null {
  const { t } = useTranslation()
  const { profile } = useRiasecProfile()
  const { discovery, strengths, skills, profile: person } = useUser()
  const { data: careers } = useCareers()
  const { data: traits } = useCareerTraits()
  const minor = person ? isMinor(person.birthYear) : false
  const province = person?.province ?? null

  return useMemo(() => {
    if (!careers) return null
    if (!profile) {
      if (!discovery) return null
      const label = (reason: DiscoveryReason) => {
        if (reason.kind === 'liked') return t('onboarding.reasonLiked')
        if (reason.kind === 'group') return t(`groups.${reason.group}`)
        return t('assessment.reasonDemand')
      }
      return recommendFromDiscovery(discovery, careers, limit).map((item) => ({
        career: item.career,
        match: item.liked ? 'alto' : 'medio',
        reasons: item.reasons.map(label),
      }))
    }
    const label = (reason: Reason) => {
      switch (reason.kind) {
        case 'interest':
          return t('assessment.reasonInterest', { dimension: t(`riasec.${reason.dimension}`) })
        case 'skills':
          return t('assessment.reasonSkills', { count: reason.count })
        case 'path':
          return t(`assessment.reasonPath_${reason.level}`)
        case 'demand':
          return t('assessment.reasonDemand')
        case 'salary':
          return t('assessment.reasonSalary')
      }
    }
    const context = traits ? { traits, strengths, skills, province } : undefined
    return recommend(profile, careers, limit, context).map((item) => ({
      career: item.career,
      match: interestLevel(item.compatibility),
      // A minor sees no salaries, not even as a reason.
      reasons: item.reasons.filter((reason) => !(minor && reason.kind === 'salary')).map(label),
    }))
  }, [profile, discovery, careers, traits, strengths, skills, province, minor, limit, t])
}
