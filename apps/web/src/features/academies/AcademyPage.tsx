import type { TFunction } from 'i18next'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router'
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
import { Icon } from '../../components/icons'
import { DetailSkeleton, NotFoundState } from '../../components/PageStates'
import { QueryState } from '../../components/QueryState'
import { SectionHeading } from '../../components/ui/PageHeader'
import { useAcademy, useCareers } from '../../data/queries'
import type { Academy, AcademyOffer, CareerSummary } from '../../data/types'
import { academyMeta } from './labels'

/**
 * An institution's page: what it is, the courses a public source confirms (with the decree that
 * recognises each one), the careers they lead to, its contacts and its sources. Prices, length,
 * schedules, curricula and reviews have no source yet: the page shows where they will go and says
 * so, never a number of its own.
 */
export default function AcademyPage() {
  const { t } = useTranslation()
  const { id = '' } = useParams()
  const academyQuery = useAcademy(id)
  const { data: careers = [] } = useCareers()

  return (
    <QueryState query={academyQuery} loading={<DetailSkeleton tabs={false} />}>
      {(academy) =>
        academy ? (
          <div className="space-y-12">
            <DetailHero
              entity={academy}
              back={{ to: '/academias', label: t('academy.back') }}
              meta={academyMeta(academy, t)}
            />
            <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] lg:items-start">
              <div className="space-y-10">
                <DetailBlock id="about" icon="landmark" title={t('academy.about')}>
                  <p className="max-w-prose text-sm font-light text-copy">{academy.summary}</p>
                  <FactList facts={facts(academy, t)} />
                </DetailBlock>
                <Offers academy={academy} careers={careers} />
                <SoonBlock id="curriculum" icon="document" title={t('academy.curriculumTitle')}>
                  {t('academy.curriculumBody')}
                </SoonBlock>
              </div>
              <div className="space-y-10">
                <ContactsBlock website={academy.website} />
                {academy.type === 'universidade' && (
                  <section
                    aria-labelledby="accreditation"
                    className="rounded-card bg-coal p-6 text-white shadow-card"
                  >
                    <SectionHeading
                      id="accreditation"
                      title={t('academy.accreditationTitle')}
                      icon="info"
                      tone="dark"
                    />
                    <p className="-mt-2 text-sm font-light text-white/80">{t('academy.accreditationBody')}</p>
                  </section>
                )}
                <SoonBlock id="reviews" icon="award" title={t('academy.reviewsTitle')}>
                  {t('academy.reviewsBody')}
                </SoonBlock>
                <SoonBlock id="news" icon="megaphone" title={t('academy.newsTitle')}>
                  {t('academy.newsBody')}
                </SoonBlock>
                <SourcesBlock sources={academy.sources} />
              </div>
            </div>
          </div>
        ) : (
          <NotFoundState
            title={t('academy.notFoundTitle')}
            body={t('academy.notFound')}
            action={{ to: '/academias', label: t('academy.back') }}
          />
        )
      }
    </QueryState>
  )
}

function facts(academy: Academy, t: TFunction) {
  return [
    { label: t('academy.type'), value: t(`training.type_${academy.type}`) },
    {
      label: t('academy.ownership'),
      value: academy.ownership
        ? t(`training.ownership_${academy.ownership}`)
        : t('academies.ownershipPending'),
    },
    { label: t('academy.place'), value: academy.place },
    { label: t('academy.province'), value: academy.province },
    ...(academy.minAge === undefined
      ? []
      : [{ label: t('academy.minAge'), value: t('academy.minAgeValue', { age: academy.minAge }) }]),
  ]
}

/** The courses a source confirms: level, faculty, recognition and the careers they lead to. */
function Offers({ academy, careers }: { academy: Academy; careers: CareerSummary[] }) {
  const { t } = useTranslation()
  return (
    <section aria-labelledby="offers">
      <SectionHeading id="offers" title={t('academy.offersTitle')} icon="cap" />
      <p className="-mt-2 mb-6 text-sm font-light text-copy">
        {academy.offers.length === 0
          ? t('academy.offersEmpty')
          : t('academy.offersBody', { count: academy.offers.length })}
      </p>
      <ul className="space-y-4">
        {academy.offers.map((offer) => (
          <li key={`${offer.course.id}-${offer.level}`}>
            <OfferCard
              offer={offer}
              careers={careers.filter((career) => offer.careers.includes(career.slug))}
            />
          </li>
        ))}
      </ul>
    </section>
  )
}

function OfferCard({ offer, careers }: { offer: AcademyOffer; careers: CareerSummary[] }) {
  const { t } = useTranslation()
  const pending = ['price', 'duration', 'schedule'] as const
  return (
    <article aria-label={offer.name} className="rounded-card bg-surface p-6 shadow-card">
      <p className="text-xs font-light text-muted">
        {t(`training.${offer.level}`)}
        {offer.faculty && ` · ${offer.faculty}`}
      </p>
      <h3 className="mt-1 text-lg font-bold text-night">{offer.name}</h3>
      <dl className="mt-4 grid grid-cols-3 gap-3">
        {pending.map((key) => (
          <div key={key}>
            <dt className="text-xs font-light text-muted">{t(`academy.${key}`)}</dt>
            <dd className="mt-0.5 text-sm font-normal text-night">{t('academy.toConfirm')}</dd>
          </div>
        ))}
      </dl>
      {offer.recognition && (
        <p className="mt-4 flex flex-wrap items-center gap-1.5 text-sm font-light text-copy">
          <Icon name="shield" className="size-4 text-muted" />
          {t('academy.recognition')}:
          <ExternalLink href={offer.recognition.url}>{offer.recognition.label}</ExternalLink>
        </p>
      )}
      {careers.length > 0 && (
        <>
          <p className="mt-5 text-xs font-semibold text-night">{t('academy.leadsTo')}</p>
          <CareerPills careers={careers} />
        </>
      )}
    </article>
  )
}
