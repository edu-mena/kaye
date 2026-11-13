import { useTranslation } from 'react-i18next'
import { OpportunityLinks } from '../../components/OpportunityCard'
import { useScholarships } from '../../data/queries'
import type { AcademyOffer, MarketArea } from '../../data/types'
import { scholarshipsFor, todayIso } from '../../domain/scholarships'

type ScholarshipLinksProps = { areas: MarketArea[]; levels?: AcademyOffer['level'][]; className?: string }

/** "Bolsas para esta área": up to three, each to its official site, and all of them on /bolsas with the area set. */
export function ScholarshipLinks({ areas, levels, className = '' }: ScholarshipLinksProps) {
  const { t } = useTranslation()
  const { data = [] } = useScholarships()
  const matches = scholarshipsFor(data, { areas, levels }, todayIso())
  const area = areas[0]
  return (
    <OpportunityLinks
      title={t('scholarships.forAreaTitle')}
      items={matches}
      icon="award"
      seeAllTo={area ? `/oportunidades?tab=bolsas&area=${area}` : '/oportunidades?tab=bolsas'}
      seeAllLabel={t('scholarships.seeAll', { count: matches.length })}
      className={className}
    />
  )
}
