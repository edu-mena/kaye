import { useTranslation } from 'react-i18next'
import { OpportunityLinks } from '../../components/OpportunityCard'
import { useInternships } from '../../data/queries'
import type { Internship, MarketArea } from '../../data/types'
import { byCompany, internshipsFor } from '../../domain/internships'
import { todayIso } from '../../domain/scholarships'

type LinksProps = { title: string; items: Internship[]; seeAllTo: string; className?: string | undefined }

function Links({ title, items, seeAllTo, className }: LinksProps) {
  const { t } = useTranslation()
  return (
    <OpportunityLinks
      title={title}
      items={items}
      icon="briefcase"
      seeAllTo={seeAllTo}
      seeAllLabel={t('internships.seeAll', { count: items.length })}
      className={className}
    />
  )
}

/** "Estágios nesta área" on a career: up to three, and all of them on /estagios with the area set. */
export function InternshipsForArea({ area, className }: { area: MarketArea; className?: string }) {
  const { t } = useTranslation()
  const { data = [] } = useInternships()
  return (
    <Links
      title={t('internships.forAreaTitle')}
      items={internshipsFor(data, [area], todayIso())}
      seeAllTo={`/oportunidades?tab=estagios&area=${area}`}
      className={className}
    />
  )
}

/** "Programas desta empresa": the internships the company itself runs, when it has any. */
export function InternshipsOfCompany({ companyId, className }: { companyId: string; className?: string }) {
  const { t } = useTranslation()
  const { data = [] } = useInternships()
  return (
    <Links
      title={t('internships.byCompanyTitle')}
      items={byCompany(data, companyId)}
      seeAllTo="/oportunidades?tab=estagios"
      className={className}
    />
  )
}
