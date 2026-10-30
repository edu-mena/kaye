import type { TFunction } from 'i18next'
import { useState } from 'react'
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
import { ButtonLink } from '../../components/ui/Button'
import { Chip } from '../../components/ui/Chip'
import { Dialog } from '../../components/ui/Dialog'
import { SectionHeading } from '../../components/ui/PageHeader'
import { useAcademy, useCareers } from '../../data/queries'
import type { Academy, AcademyOffer, CareerSummary } from '../../data/types'
import { coursePath } from '../training/coursePath'
import { CurriculumView } from '../training/CurriculumView'
import { academyMeta } from './labels'

/**
 * An institution's page: what it is, the courses a public source confirms as cards (each opens the offer, with the
 * plan of studies its decree approved and a way to the course's page), its contacts and its sources. Prices,
 * length, schedules and reviews have no source yet: the page shows where they will go and says so, never a number
 * of its own.
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

/** The courses a source confirms, as cards in two columns; a card opens the offer in a dialog. */
function Offers({ academy, careers }: { academy: Academy; careers: CareerSummary[] }) {
  const { t } = useTranslation()
  const [open, setOpen] = useState<AcademyOffer | null>(null)
  return (
    <section aria-labelledby="offers">
      <SectionHeading id="offers" title={t('academy.offersTitle')} icon="cap" />
      <p className="-mt-2 mb-6 text-sm font-light text-copy">
        {academy.offers.length === 0
          ? t('academy.offersEmpty')
          : t('academy.offersBody', { count: academy.offers.length })}
      </p>
      <ul className="grid gap-4 sm:grid-cols-2">
        {academy.offers.map((offer) => (
          <li key={`${offer.course.id}-${offer.level}`}>
            <OfferCard offer={offer} onOpen={() => setOpen(offer)} />
          </li>
        ))}
      </ul>
      {open && (
        <OfferDialog
          academy={academy}
          offer={open}
          careers={careers.filter((career) => open.careers.includes(career.slug))}
          onClose={() => setOpen(null)}
        />
      )}
    </section>
  )
}

/** "1 234 estudantes e 56 diplomados em 2023/24", from the yearbook. */
function People({ offer }: { offer: AcademyOffer }) {
  const { t, i18n } = useTranslation()
  if (offer.students === undefined) return null
  return (
    <p className="mt-1 text-sm font-light text-copy">
      {t('academy.people', {
        students: offer.students.toLocaleString(i18n.language),
        graduates: (offer.graduates ?? 0).toLocaleString(i18n.language),
        year: offer.year,
      })}
    </p>
  )
}

/** One course: level, faculty, name, students, and whether its plan of studies and decree are published. */
function OfferCard({ offer, onOpen }: { offer: AcademyOffer; onOpen: () => void }) {
  const { t } = useTranslation()
  return (
    <article
      aria-label={offer.name}
      className="relative flex h-full flex-col rounded-card bg-surface p-5 shadow-card transition hover:shadow-lift"
    >
      <p className="text-xs font-light text-muted">
        {t(`training.${offer.level}`)}
        {offer.faculty && ` · ${offer.faculty}`}
      </p>
      <h3 className="mt-1 font-display text-lg font-bold break-words text-night">
        <button
          type="button"
          onClick={onOpen}
          aria-label={t('academy.offerOpen', { course: offer.name })}
          className="text-left after:absolute after:inset-0"
        >
          {offer.name}
        </button>
      </h3>
      <People offer={offer} />
      {(offer.curriculum ?? offer.recognition) && (
        <div className="mt-auto flex flex-wrap gap-1.5 pt-4">
          {offer.curriculum && <Chip>{t('academy.hasCurriculum')}</Chip>}
          {offer.recognition && <Chip>{t('academy.recognition')}</Chip>}
        </div>
      )}
    </article>
  )
}

type OfferDialogProps = {
  academy: Academy
  offer: AcademyOffer
  careers: CareerSummary[]
  onClose: () => void
}

/**
 * An institution's offer of a course: what is confirmed, what is not yet, the plan of studies its decree approved
 * and the careers it leads to, with a way to the course's own page.
 */
function OfferDialog({ academy, offer, careers, onClose }: OfferDialogProps) {
  const { t } = useTranslation()
  const pending = ['price', 'duration', 'schedule'] as const
  return (
    <Dialog
      open
      onClose={onClose}
      title={offer.name}
      footer={
        <ButtonLink to={coursePath(offer.course.id, academy.id)} className="w-full justify-center">
          {t('academy.seeCourse')}
        </ButtonLink>
      }
    >
      <p className="text-xs font-light text-muted">
        {t(`training.${offer.level}`)}
        {offer.faculty && ` · ${offer.faculty}`} · {academy.name}
      </p>
      <People offer={offer} />
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
      <h3 className="mt-6 mb-3 text-sm font-bold text-night">{t('academy.curriculumTitle')}</h3>
      {offer.curriculum ? (
        <CurriculumView curriculum={offer.curriculum} />
      ) : (
        <p className="text-sm font-light text-copy">{t('academy.curriculumNone')}</p>
      )}
      {careers.length > 0 && (
        <>
          <p className="mt-6 text-xs font-semibold text-night">{t('academy.leadsTo')}</p>
          <CareerPills careers={careers} />
        </>
      )}
    </Dialog>
  )
}
