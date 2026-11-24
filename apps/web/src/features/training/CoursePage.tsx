import { useTranslation } from 'react-i18next'
import { Link, useParams, useSearchParams } from 'react-router'
import { CareerCard } from '../../components/CareerCard'
import { CareerRow, LIST_ROW } from '../../components/CareerRow'
import { Icon } from '../../components/icons'
import { InstitutionLogo } from '../../components/InstitutionLogo'
import { DetailSkeleton, NotFoundState } from '../../components/PageStates'
import { WhoHiresRail } from '../../components/RelatedRails'
import { PhotoImg } from '../../components/PhotoImg'
import { QueryState } from '../../components/QueryState'
import { ScoreRing } from '../../components/ScoreRing'
import { Chip } from '../../components/ui/Chip'
import { ShareButton } from '../../components/ShareButton'
import { SectionHeading } from '../../components/ui/PageHeader'
import { useCareer, useCareers, usePrograms } from '../../data/queries'
import type { Program } from '../../data/types'
import { formatKz } from '../../domain/format'
import { rankPrograms, scorePrograms, type ScoredProgram } from '../../domain/ranking'
import { useDuration } from '../../lib/useFormat'
import { CompareButton } from './ProgramCard'
import { ProgramSummary } from './ProgramSummary'

/**
 * A course's page. The URL names one institution's offer (the card that was opened): the page
 * shows the course, that offer in full, the careers it leads to and every institution that offers
 * it. In both lists the first comes with its photo and the rest as one-line items. Each
 * institution's curriculum for the course comes later, in the offer's part of the page.
 * With ?carreira= it also says which step of that career the course serves.
 */
export default function CoursePage() {
  const { t } = useTranslation()
  const { id = '' } = useParams()
  const [params] = useSearchParams()
  const careerSlug = params.get('carreira')
  const programsQuery = usePrograms()
  const { data: careers = [] } = useCareers()
  const query = careerSlug ? `?carreira=${careerSlug}` : ''

  return (
    <QueryState query={programsQuery} loading={<DetailSkeleton tabs={false} />}>
      {(programs) => {
        // Scored against the whole catalogue, so the score and place match the Cursos page.
        const scored = scorePrograms(programs)
        const item = scored.find((candidate) => candidate.program.id === id)
        if (!item) {
          return (
            <NotFoundState
              title={t('training.notFoundTitle')}
              body={t('training.notFound')}
              action={{ to: '/cursos', label: t('training.back') }}
            />
          )
        }
        const { program } = item
        const rank = program.recognized ? rankPrograms(scored, 'score').ranked.indexOf(item) + 1 : undefined
        const sameCourse = rankPrograms(
          scored.filter((candidate) => candidate.program.course.id === program.course.id),
          'score',
        )
        // The offer on show first, then the others by score.
        const offers = [
          item,
          ...[...sameCourse.ranked, ...sameCourse.unrecognized].filter((offer) => offer !== item),
        ]
        const leadsTo = careers.filter((career) => program.careers.includes(career.slug))

        return (
          <div className="space-y-12">
            <Hero item={item} institutions={offers.length} back={`/cursos${query}`} />

            <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] lg:items-start">
              <section
                aria-labelledby="course-offer"
                className="rounded-card bg-surface p-6 shadow-card sm:p-8"
              >
                <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-xs font-light text-muted">
                      {t('training.offerOf', { institution: program.institution.name })}
                    </p>
                    <h2
                      id="course-offer"
                      className="mt-1 text-xl leading-snug font-extrabold text-night sm:text-2xl"
                    >
                      {program.name}
                    </h2>
                  </div>
                  <CompareButton programId={program.id} />
                </div>
                {careerSlug ? (
                  <SummaryForCareer item={item} rank={rank} slug={careerSlug} />
                ) : (
                  <ProgramSummary item={item} rank={rank} onPage />
                )}
              </section>

              <div className="space-y-10">
                {leadsTo.length > 0 && (
                  <section aria-labelledby="course-careers">
                    <SectionHeading id="course-careers" title={t('training.leadsTo')} icon="briefcase" />
                    <ul className="space-y-3">
                      {leadsTo.map((career, index) => (
                        <li key={career.slug}>
                          {index === 0 ? <CareerCard career={career} brief /> : <CareerRow career={career} />}
                        </li>
                      ))}
                    </ul>
                  </section>
                )}

                <section aria-labelledby="course-offers">
                  <SectionHeading id="course-offers" title={t('training.offeredBy')} icon="landmark" />
                  <p className="-mt-2 mb-6 text-sm font-light text-copy">
                    {t('training.offeredByBody', { count: offers.length })}
                  </p>
                  <ul className="space-y-3">
                    {offers.map((offer, index) => (
                      <li key={offer.program.id}>
                        {index === 0 ? (
                          <OfferFeature offer={offer} to={`/cursos/${offer.program.id}${query}`} />
                        ) : (
                          <OfferRow offer={offer} to={`/cursos/${offer.program.id}${query}`} />
                        )}
                      </li>
                    ))}
                  </ul>
                </section>

                <WhoHiresRail slugs={program.careers} seeAllTo="/empresas" />
              </div>
            </div>
          </div>
        )
      }}
    </QueryState>
  )
}

type HeroProps = { item: ScoredProgram; institutions: number; back: string }

/** The course photo under a dark gradient: the way back, the level, how many institutions, the course. */
function Hero({ item, institutions, back }: HeroProps) {
  const { t } = useTranslation()
  const { program } = item
  return (
    <section className="relative isolate overflow-hidden rounded-card bg-coal text-white">
      {program.image && (
        <PhotoImg
          photo={program.image}
          sizes="100vw"
          alt={program.image.alt}
          priority
          className="absolute inset-0 -z-10 size-full object-cover"
        />
      )}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-linear-to-t from-coal via-coal/75 to-coal/20"
      />
      <div className="flex min-h-72 flex-col justify-between gap-10 p-6 sm:p-10 lg:min-h-96">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Link
            to={back}
            className="inline-flex w-fit items-center gap-2 rounded-full bg-coal/70 px-4 py-2 text-sm font-light hover:bg-coal"
          >
            <Icon name="arrowLeft" className="size-4" />
            {t('training.back')}
          </Link>
          <ShareButton
            look="onDark"
            text={t('share.course', { name: program.course.name })}
            path={`/cursos/${program.id}`}
          />
        </div>
        <div className="max-w-2xl">
          <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm font-light text-white/80">
            <span>{t(`training.${program.level}`)}</span>
            <span aria-hidden="true">·</span>
            <span className="inline-flex items-center gap-1.5">
              <Icon name="landmark" className="size-4 text-gold" />
              {t('training.institutionsCount', { count: institutions })}
            </span>
          </p>
          <h1 className="mt-2 text-3xl leading-tight font-extrabold sm:text-5xl">{program.course.name}</h1>
        </div>
      </div>
    </section>
  )
}

/** How long and how much, quietly. */
function OfferFacts({ program }: { program: Program }) {
  const duration = useDuration()
  return (
    <span className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs font-light text-copy">
      <span className="inline-flex items-center gap-1">
        <Icon name="clock" className="size-3.5" />
        {duration({ min: program.durationMonths, max: program.durationMonths })}
      </span>
      {program.totalCost !== null && (
        <span className="inline-flex items-center gap-1">
          <Icon name="wallet" className="size-3.5" />
          {formatKz(program.totalCost)}
        </span>
      )}
    </span>
  )
}

type OfferProps = { offer: ScoredProgram; to: string }

/** The offer on show, first and with its photo: the institution's logo and the score on it. */
function OfferFeature({ offer, to }: OfferProps) {
  const { t } = useTranslation()
  const { program, score } = offer
  return (
    <Link
      to={to}
      preventScrollReset
      aria-current="page"
      className="block overflow-hidden rounded-2xl bg-surface shadow-card ring-2 ring-night"
    >
      <span className="relative block h-32 bg-coal">
        {program.image && (
          <PhotoImg
            photo={program.image}
            sizes="(min-width: 1024px) 22rem, 100vw"
            className="size-full object-cover"
          />
        )}
        <span className="absolute bottom-2 left-2">
          <InstitutionLogo institution={program.institution} />
        </span>
        {program.recognized && (
          <span className="absolute top-2 right-2 rounded-full bg-coal">
            <ScoreRing score={score} tone="dark" />
          </span>
        )}
      </span>
      <span className="block p-4">
        <span className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold text-night">{program.institution.name}</span>
          <Chip tone="night">{t('training.onShow')}</Chip>
          {!program.recognized && <Chip>{t('training.unconfirmed')}</Chip>}
        </span>
        <span className="mt-1 block text-xs font-light text-muted">
          {program.name} · {program.institution.province}
        </span>
        <OfferFacts program={program} />
      </span>
    </Link>
  )
}

/** Another institution's offer of the course, in one line; opening it shows that offer instead. */
function OfferRow({ offer, to }: OfferProps) {
  const { t } = useTranslation()
  const { program, score } = offer
  return (
    <Link to={to} preventScrollReset className={LIST_ROW}>
      <InstitutionLogo institution={program.institution} size="sm" />
      <span className="min-w-0 flex-1">
        <span className="block text-sm leading-snug font-semibold text-night">
          {program.institution.name}
        </span>
        <span className="mt-1 block text-xs font-light text-muted">{program.name}</span>
        <OfferFacts program={program} />
      </span>
      {program.recognized ? <ScoreRing score={score} /> : <Chip>{t('training.unconfirmed')}</Chip>}
    </Link>
  )
}

function SummaryForCareer({ item, rank, slug }: { item: ScoredProgram; rank?: number; slug: string }) {
  const { data: career } = useCareer(slug)
  return <ProgramSummary item={item} career={career} rank={rank} onPage />
}
