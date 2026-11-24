import { useTranslation } from 'react-i18next'
import { useAcademies, useCompanies } from '../data/queries'
import { academiesForCareers, companiesForCareers } from '../domain/relations'
import { RelatedRail } from './RelatedRail'

type RailsProps = {
  /** The careers the rail is about. */
  slugs: string[]
  /** One career: the links carry it, so the page they open can bring the person back. */
  careerSlug?: string
  /** What the "ver todas" link opens; without it the rail has none. */
  seeAllTo?: string
  max?: number
  className?: string
}

const suffix = (param: string, careerSlug?: string) => (careerSlug ? `?${param}=${careerSlug}` : '')

/** "Onde estudar": the academies whose courses lead to the careers. */
export function WhereToStudyRail({ slugs, careerSlug, seeAllTo, max, className }: RailsProps) {
  const { t } = useTranslation()
  const { data: academies = [] } = useAcademies()
  const related = academiesForCareers(academies, slugs)
  const wanted = new Set(slugs)
  return (
    <RelatedRail
      title={t('related.studyTitle')}
      icon="landmark"
      seeAllTo={seeAllTo}
      seeAllLabel={t('related.studyAll')}
      max={max}
      className={className}
      items={related.map(({ item }) => ({
        id: item.id,
        to: `/academias/${item.id}${suffix('carreira', careerSlug)}`,
        name: item.name,
        logo: item.logo,
        meta: t('related.courses', {
          count: item.offers.filter((offer) => offer.careers.some((slug) => wanted.has(slug))).length,
        }),
      }))}
    />
  )
}

/** "Quem contrata": the companies that hire for the careers. */
export function WhoHiresRail({ slugs, careerSlug, seeAllTo, max, className }: RailsProps) {
  const { t } = useTranslation()
  const { data: companies = [] } = useCompanies()
  const related = companiesForCareers(companies, slugs)
  return (
    <RelatedRail
      title={t('related.hiresTitle')}
      icon="building"
      seeAllTo={seeAllTo}
      seeAllLabel={t('related.hiresAll')}
      max={max}
      className={className}
      items={related.map(({ item, matches }) => ({
        id: item.id,
        to: `/empresas/${item.id}${suffix('profissao', careerSlug)}`,
        name: item.name,
        logo: item.logo,
        logoOnDark: item.logoOnDark,
        meta: t('related.careers', { count: matches.length }),
      }))}
    />
  )
}
