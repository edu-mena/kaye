import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useParams, useSearchParams } from 'react-router'
import { CareerPills, DetailBlock, ExternalLink } from '../../components/DetailParts'
import { Icon } from '../../components/icons'
import { DetailSkeleton, NotFoundState } from '../../components/PageStates'
import { QueryState } from '../../components/QueryState'
import { Chip } from '../../components/ui/Chip'
import { SectionHeading } from '../../components/ui/PageHeader'
import { useCareers, useCourse } from '../../data/queries'
import type { CatalogCourse, SourceLink } from '../../data/types'
import { CurriculumView } from './CurriculumView'

type Offer = CatalogCourse['offers'][number]

/**
 * A real course across the institutions that teach it: where to study it (the institution it was opened from
 * first, with ?academia=), each institution's plan of studies when its decree is published, and the careers it
 * leads to.
 */
export default function CatalogCoursePage() {
  const { t } = useTranslation()
  const { id = '' } = useParams()
  const [params] = useSearchParams()
  const chosen = params.get('academia')
  const courseQuery = useCourse(id)
  const { data: careers = [] } = useCareers()

  return (
    <QueryState query={courseQuery} loading={<DetailSkeleton tabs={false} />}>
      {(course) => {
        if (!course) {
          return (
            <NotFoundState
              title={t('training.notFoundTitle')}
              body={t('training.notFound')}
              action={{ to: '/cursos', label: t('training.back') }}
            />
          )
        }
        // The institution it was opened from first, then the most studied.
        const offers = course.offers.toSorted(
          (a, b) =>
            Number(b.academy.id === chosen) - Number(a.academy.id === chosen) ||
            (b.offer.students ?? 0) - (a.offer.students ?? 0),
        )
        const decrees = [
          ...new Map(
            offers.flatMap(({ offer }) =>
              [offer.recognition, offer.curriculum?.source].flatMap((source): [string, SourceLink][] =>
                source ? [[source.url, source]] : [],
              ),
            ),
          ).values(),
        ]
        return (
          <div className="space-y-12">
            <Hero course={course} />
            <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] lg:items-start">
              <div className="space-y-12">
                <Where offers={offers} chosen={chosen} />
                <Curricula offers={offers} chosen={chosen} />
              </div>
              <div className="space-y-10">
                <DetailBlock id="leads-to" icon="briefcase" title={t('training.leadsTo')}>
                  <CareerPills careers={careers.filter((career) => course.careers.includes(career.slug))} />
                </DetailBlock>
                {decrees.length > 0 && (
                  <DetailBlock id="sources" icon="newspaper" title={t('academy.sourcesTitle')}>
                    <ul className="space-y-2 text-sm">
                      {decrees.map((source) => (
                        <li key={source.url}>
                          <ExternalLink href={source.url}>{source.label}</ExternalLink>
                        </li>
                      ))}
                    </ul>
                  </DetailBlock>
                )}
              </div>
            </div>
          </div>
        )
      }}
    </QueryState>
  )
}

/** The course's name, levels and areas, and how many institutions, students and graduates it has. */
function Hero({ course }: { course: CatalogCourse }) {
  const { t, i18n } = useTranslation()
  const stats = [
    { value: course.offers.length, label: t('course.statInstitutions') },
    ...(course.students > 0
      ? [
          { value: course.students, label: t('course.statStudents') },
          { value: course.graduates, label: t('course.statGraduates') },
        ]
      : []),
  ]
  return (
    <section className="rounded-card bg-coal p-6 text-white sm:p-10">
      <Link
        to="/cursos"
        className="inline-flex w-fit items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-light hover:bg-white/20"
      >
        <Icon name="arrowLeft" className="size-4" />
        {t('training.back')}
      </Link>
      <div className="mt-10 flex flex-wrap gap-1.5">
        {course.levels.map((level) => (
          <Chip key={level} tone="onDark">
            {t(`training.${level}`)}
          </Chip>
        ))}
      </div>
      <h1 className="mt-3 text-3xl leading-tight font-extrabold sm:text-5xl">{course.name}</h1>
      <p className="mt-2 text-sm font-light text-white/80">
        {course.areas.map((area) => t(`market.area_${area}`)).join(' · ')}
      </p>
      <dl className="mt-8 flex flex-wrap gap-x-10 gap-y-4">
        {stats.map((stat) => (
          <div key={stat.label}>
            <dt className="text-xs font-light text-white/70">{stat.label}</dt>
            <dd className="text-2xl font-extrabold tabular-nums">
              {stat.value.toLocaleString(i18n.language)}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  )
}

/** Each institution's offer as a card in two columns; the whole card opens the institution. */
function Where({ offers, chosen }: { offers: Offer[]; chosen: string | null }) {
  const { t, i18n } = useTranslation()
  return (
    <section aria-labelledby="where">
      <SectionHeading id="where" title={t('course.where')} icon="landmark" />
      <p className="-mt-2 mb-6 text-sm font-light text-copy">
        {t('course.whereBody', { count: offers.length })}
      </p>
      <ul className="grid gap-4 sm:grid-cols-2">
        {offers.map(({ academy, offer }) => (
          <li key={`${academy.id}-${offer.level}`}>
            <article
              aria-label={academy.name}
              className={`relative flex h-full flex-col rounded-card bg-surface p-5 shadow-card transition hover:shadow-lift ${academy.id === chosen ? 'ring-2 ring-night' : ''}`}
            >
              <p className="text-xs font-light text-muted">
                {t(`training.type_${academy.type}`)} · {academy.province}
              </p>
              <h3 className="mt-1 font-display text-base font-bold break-words text-night">
                <Link to={`/academias/${academy.id}`} className="after:absolute after:inset-0">
                  {academy.name}
                </Link>
              </h3>
              <p className="mt-1 text-sm font-light text-copy">
                {offer.name} · {t(`training.${offer.level}`)}
              </p>
              {offer.students !== undefined && (
                <p className="mt-1 text-xs font-light text-muted">
                  {t('academy.people', {
                    students: offer.students.toLocaleString(i18n.language),
                    graduates: (offer.graduates ?? 0).toLocaleString(i18n.language),
                    year: offer.year,
                  })}
                </p>
              )}
              <div className="mt-auto flex flex-wrap gap-1.5 pt-4">
                {academy.id === chosen && <Chip tone="night">{t('training.onShow')}</Chip>}
                {offer.curriculum && <Chip>{t('academy.hasCurriculum')}</Chip>}
              </div>
            </article>
          </li>
        ))}
      </ul>
    </section>
  )
}

/** The plans of studies on record, one institution at a time: the chosen one when it has a plan. */
function Curricula({ offers, chosen }: { offers: Offer[]; chosen: string | null }) {
  const { t } = useTranslation()
  const planned = offers.filter(({ offer }) => offer.curriculum)
  const [picked, setPicked] = useState(
    () => (planned.find(({ academy }) => academy.id === chosen) ?? planned[0])?.academy.id ?? '',
  )
  const shown = planned.find(({ academy }) => academy.id === picked)
  return (
    <section aria-labelledby="curricula">
      <SectionHeading id="curricula" title={t('course.curriculumTitle')} icon="document" />
      {shown?.offer.curriculum ? (
        <>
          {planned.length > 1 && (
            <label className="mb-4 block max-w-sm">
              <span className="block text-xs font-light text-muted">{t('course.curriculumPick')}</span>
              <select
                value={picked}
                onChange={(event) => setPicked(event.target.value)}
                className="mt-1 h-11 w-full rounded-full border border-line bg-surface px-4 text-sm text-night"
              >
                {planned.map(({ academy }) => (
                  <option key={academy.id} value={academy.id}>
                    {academy.name}
                  </option>
                ))}
              </select>
            </label>
          )}
          <p className="mb-4 text-sm font-light text-copy">{shown.academy.name}</p>
          <CurriculumView curriculum={shown.offer.curriculum} wide />
        </>
      ) : (
        <p className="max-w-prose text-sm font-light text-copy">{t('course.curriculumNone')}</p>
      )}
    </section>
  )
}
