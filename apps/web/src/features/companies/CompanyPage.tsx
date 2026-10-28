import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router'
import {
  CareerPills,
  ContactsBlock,
  DetailBlock,
  DetailHero,
  ExternalLink,
  FactList,
  SoonBlock,
  SourcesBlock,
} from '../../components/DetailParts'
import { DetailSkeleton, NotFoundState } from '../../components/PageStates'
import { QueryState } from '../../components/QueryState'
import { useAcademies, useCareers, useCompany } from '../../data/queries'

/**
 * A company's page: what it is, the careers it hires for (from a source, or our reading of its
 * sector, and the page says which), its programmes for young people, the academies it works with,
 * its contacts and its sources. Vacancies, salaries and reviews wait for their data and say so.
 */
export default function CompanyPage() {
  const { t } = useTranslation()
  const { id = '' } = useParams()
  const companyQuery = useCompany(id)
  const { data: careers = [] } = useCareers()
  const { data: academies = [] } = useAcademies()

  return (
    <QueryState query={companyQuery} loading={<DetailSkeleton tabs={false} />}>
      {(company) => {
        if (!company) {
          return (
            <NotFoundState
              title={t('company.notFoundTitle')}
              body={t('company.notFound')}
              action={{ to: '/empresas', label: t('company.back') }}
            />
          )
        }
        const sector = t(`companies.sector_${company.sector}`)
        const partners = academies.filter((academy) => company.partners.includes(academy.id))
        return (
          <div className="space-y-12">
            <DetailHero entity={company} back={{ to: '/empresas', label: t('company.back') }} meta={sector} />
            <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] lg:items-start">
              <div className="space-y-10">
                <DetailBlock id="about" icon="building" title={t('company.about')}>
                  <p className="max-w-prose text-sm font-light text-copy">{company.summary}</p>
                  <FactList
                    facts={[
                      { label: t('company.sector'), value: sector },
                      { label: t('company.place'), value: company.place },
                      { label: t('company.province'), value: company.province },
                    ]}
                  />
                </DetailBlock>
                <DetailBlock id="careers" icon="briefcase" title={t('company.careersTitle')}>
                  <p className="text-sm font-light text-copy">
                    {company.careersSourced ? t('company.careersSourced') : t('company.careersEditorial')}
                  </p>
                  <CareerPills careers={careers.filter((career) => company.careers.includes(career.slug))} />
                </DetailBlock>
                {company.programs.length > 0 && (
                  <DetailBlock id="programs" icon="award" title={t('company.programsTitle')}>
                    <ul className="space-y-5">
                      {company.programs.map((program) => (
                        <li key={program.name}>
                          <h3 className="text-base font-bold text-night">{program.name}</h3>
                          <p className="mt-1 text-sm font-light text-copy">{program.summary}</p>
                          <p className="mt-1 text-xs font-light text-muted">
                            {t('company.source')}:{' '}
                            <ExternalLink href={program.source.url}>{program.source.label}</ExternalLink>
                          </p>
                        </li>
                      ))}
                    </ul>
                  </DetailBlock>
                )}
                <SoonBlock id="jobs" icon="megaphone" title={t('company.jobsTitle')}>
                  {t('company.jobsBody')}
                </SoonBlock>
              </div>
              <div className="space-y-10">
                <ContactsBlock website={company.website} />
                {partners.length > 0 && (
                  <DetailBlock id="partners" icon="landmark" title={t('company.partnersTitle')}>
                    <ul className="space-y-2 text-sm">
                      {partners.map((academy) => (
                        <li key={academy.id}>
                          <Link
                            to={`/academias/${academy.id}`}
                            className="font-normal text-night underline underline-offset-2 hover:text-blue"
                          >
                            {academy.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </DetailBlock>
                )}
                <SoonBlock id="salaries" icon="wallet" title={t('company.salariesTitle')}>
                  {t('company.salariesBody')}
                </SoonBlock>
                <SoonBlock id="reviews" icon="award" title={t('company.reviewsTitle')}>
                  {t('company.reviewsBody')}
                </SoonBlock>
                <SourcesBlock sources={company.sources} />
              </div>
            </div>
          </div>
        )
      }}
    </QueryState>
  )
}
