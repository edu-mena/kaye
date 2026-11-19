import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router'
import { LIST_ROW } from '../../components/CareerRow'
import { CareerPills, DetailBlock, ExternalLink } from '../../components/DetailParts'
import { ShareButton } from '../../components/ShareButton'
import { ButtonLink } from '../../components/ui/Button'
import { DetailLayout, DetailSection, StatBlock, Subheading } from '../../components/DetailLayout'
import { Icon, type IconName } from '../../components/icons'
import { FilteredGrid } from '../../components/FilteredGrid'
import { DetailSkeleton, NotFoundState } from '../../components/PageStates'
import { QueryState } from '../../components/QueryState'
import { Chip } from '../../components/ui/Chip'
import { useAdmissions, useCareers, useCourse } from '../../data/queries'
import type { Admission, CareerSummary, CatalogCourse, SourceLink } from '../../data/types'
import { admissionsFor } from '../../domain/admissions'
import { offerFee, FEE_BANDS, feeBand, studyCost, type FeeBand } from '../../domain/fees'
import { useUrlFilters } from '../../lib/useUrlFilters'
import { CareersEvaluation, CareersMarket } from '../careers/CareersOverview'
import { CostVsSalary } from '../careers/CostVsSalary'
import { ScholarshipLinks } from '../scholarships/ScholarshipLinks'
import { AdmissionActions, AdmissionStatusChip } from './AdmissionBlock'
import { useAdmissionDates } from './useAdmissionDates'
import { CurriculumView } from './CurriculumView'
import { FeeLine } from './FeeLine'

type Offer = CatalogCourse['offers'][number]

const TABS = [
  { id: 'geral', icon: 'eye' },
  { id: 'mercado', icon: 'chart' },
  { id: 'ofertas', icon: 'landmark' },
  { id: 'avaliacao', icon: 'user' },
] as const satisfies readonly { id: string; icon: IconName }[]

type TabId = (typeof TABS)[number]['id']

/**
 * A real course across the institutions that teach it, in four tabs: what it is, the market of the careers it
 * leads to, the institutions that offer it (each opens the institution on this course) and how it fits the
 * user. The careers it leads to and the sources stay at the side.
 */
export default function CatalogCoursePage() {
  const { t } = useTranslation()
  const { id = '' } = useParams()
  const courseQuery = useCourse(id)

  return (
    <QueryState query={courseQuery} loading={<DetailSkeleton />}>
      {(course) =>
        course ? (
          <CourseView course={course} />
        ) : (
          <NotFoundState
            title={t('training.notFoundTitle')}
            body={t('training.notFound')}
            action={{ to: '/cursos', label: t('training.back') }}
          />
        )
      }
    </QueryState>
  )
}

function CourseView({ course }: { course: CatalogCourse }) {
  const { t } = useTranslation()
  const [params, setParam] = useUrlFilters()
  const { data: allCareers = [] } = useCareers()
  const careers = allCareers.filter((career) => course.careers.includes(career.slug))
  const chosen = params.get('academia')
  const tabs = TABS.map((tab) => ({ id: tab.id, icon: tab.icon, label: t(`course.tab_${tab.id}`) }))
  const active: TabId = tabs.find((tab) => tab.id === params.get('secao'))?.id ?? 'geral'
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
    <DetailLayout
      header={<Hero course={course} />}
      tabs={{
        label: t('course.tabsLabel'),
        items: tabs,
        value: active,
        onChange: (tab) => setParam('secao', tab === 'geral' ? null : tab),
        idPrefix: 'course',
      }}
      aside={
        <>
          <DetailBlock id="leads-to" icon="briefcase" title={t('training.leadsTo')}>
            <CareerPills careers={careers} />
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
        </>
      }
    >
      {active === 'geral' && <General course={course} offers={offers} chosen={chosen} careers={careers} />}
      {active === 'mercado' && (
        <DetailSection id="mercado" title={t('course.tab_mercado')} icon="chart">
          <CareersMarket
            slugs={course.careers}
            intro={t('course.marketIntro')}
            none={t('course.marketNone')}
          />
        </DetailSection>
      )}
      {active === 'ofertas' && <Offers course={course} offers={offers} chosen={chosen} />}
      {active === 'avaliacao' && (
        <DetailSection id="avaliacao" title={t('course.tab_avaliacao')} icon="user">
          <CareersEvaluation
            careers={careers}
            count={{ label: t('course.evalInstitutions'), value: course.offers.length }}
            plans={course.offers.filter(({ offer }) => offer.curriculum).length}
            note={t('course.evalNote')}
            fitSubtitle={t('course.fitSubtitle')}
          />
        </DetailSection>
      )}
    </DetailLayout>
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
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Link
          to="/cursos"
          className="inline-flex w-fit items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-light hover:bg-white/20"
        >
          <Icon name="arrowLeft" className="size-4" />
          {t('training.back')}
        </Link>
        <ShareButton
          look="onDark"
          text={t('share.course', { name: course.name })}
          path={`/cursos/curso/${course.id}`}
        />
      </div>
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

type OffersProps = { course: CatalogCourse; offers: Offer[]; chosen: string | null }

/** The median of the salaries of the careers a course leads to; null when none has one. */
function medianSalary(careers: CareerSummary[]): number | null {
  const salaries = careers.flatMap((career) => (career.salaryMedian === null ? [] : [career.salaryMedian]))
  if (salaries.length === 0) return null
  const sorted = salaries.toSorted((a, b) => a - b)
  const middle = Math.floor(sorted.length / 2)
  return sorted.length % 2
    ? (sorted[middle] ?? null)
    : ((sorted[middle - 1] ?? 0) + (sorted[middle] ?? 0)) / 2
}

/** What the course is: its levels, areas, how widely it is taught, and the plans of studies on record. */
function General({ course, offers, chosen, careers }: OffersProps & { careers: CareerSummary[] }) {
  const { t } = useTranslation()
  const cost = studyCost(offers)
  const provinces = new Set(offers.map(({ academy }) => academy.province))
  const levels = course.levels.map((level) => t(`training.${level}`))
  const areas = course.areas.map((area) => t(`market.area_${area}`))
  return (
    <DetailSection id="geral" title={t('course.tab_geral')} icon="eye">
      <p className="max-w-3xl text-sm leading-relaxed font-light text-copy">
        {t('course.summary', {
          name: course.name,
          levels: levels.join(', ').toLowerCase(),
          count: offers.length,
          provinces: provinces.size,
        })}
      </p>
      <div className="mt-8">
        <StatBlock
          items={[
            { label: t('course.statLevels'), value: levels.join(', ') },
            { label: t('course.statAreas'), value: areas.join(', ') || '—' },
            { label: t('course.statInstitutions'), value: String(offers.length) },
            { label: t('course.statProvinces'), value: [...provinces].join(', ') },
          ]}
        />
      </div>
      {cost && (
        <div className="mt-10">
          <CostVsSalary cost={cost} salary={medianSalary(careers)} salaryLabel={t('cost.salary')} />
        </div>
      )}
      <HowToGetIn course={course} />
      <Curricula offers={offers} chosen={chosen} />
      <ScholarshipLinks areas={course.areas} levels={course.levels} className="mt-10" />
    </DetailSection>
  )
}

const ADMISSIONS_SHOWN = 3

/**
 * "Como entrar": the national calendar first, then up to three institutions with their applications' state and
 * days, each opening the institution on this course.
 */
function HowToGetIn({ course }: { course: CatalogCourse }) {
  const { t } = useTranslation()
  const dates = useAdmissionDates()
  const { data = [] } = useAdmissions()
  const admissions = admissionsFor(data, { course })
  if (admissions.length === 0) return null
  const names = new Map(course.offers.map(({ academy }) => [academy.id, academy.name]))
  const national = admissions.filter((admission) => admission.academyId === null)
  const institutions = admissions
    .filter((admission) => admission.academyId !== null)
    .slice(0, ADMISSIONS_SHOWN)

  return (
    <div className="mt-10">
      <Subheading>{t('admission.title')}</Subheading>
      <ul className="grid gap-2">
        {national.map((admission) => (
          <li key={admission.id} className="flex items-center gap-1">
            <a
              href={admission.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`${LIST_ROW} min-w-0 flex-1`}
            >
              <AdmissionRow
                name={t('admission.national')}
                admission={admission}
                detail={t('admission.examsOn', { dates: dates(admission).exams })}
              />
            </a>
            <AdmissionActions
              admission={admission}
              title={t('admission.national')}
              path={`/cursos/curso/${course.id}`}
            />
          </li>
        ))}
        {institutions.map((admission) => (
          <li key={admission.id} className="flex items-center gap-1">
            <Link
              to={`/academias/${admission.academyId}?curso=${course.id}&secao=geral`}
              className={`${LIST_ROW} min-w-0 flex-1`}
            >
              <AdmissionRow
                name={names.get(admission.academyId ?? '') ?? ''}
                admission={admission}
                detail={t('admission.registrationOn', { dates: dates(admission).registration })}
              />
            </Link>
            <AdmissionActions
              admission={admission}
              title={names.get(admission.academyId ?? '') ?? ''}
              path={`/academias/${admission.academyId}?curso=${course.id}&secao=geral`}
            />
          </li>
        ))}
      </ul>
      {institutions.length > 0 && (
        <ButtonLink
          to={`/exames-de-acesso?curso=${course.id}`}
          variant="secondary"
          size="sm"
          className="mt-4"
        >
          <Icon name="pencil" className="size-4" />
          {t('accessExams.prepare')}
        </ButtonLink>
      )}
    </div>
  )
}

function AdmissionRow({ name, admission, detail }: { name: string; admission: Admission; detail: string }) {
  return (
    <>
      <span className="grid size-8 shrink-0 place-items-center rounded-full bg-coal text-gold">
        <Icon name="cap" className="size-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm leading-snug font-semibold text-night">{name}</span>
        <span className="mt-0.5 block truncate text-xs font-light text-muted">{detail}</span>
      </span>
      <AdmissionStatusChip admission={admission} />
      <Icon name="chevronRight" className="size-4 shrink-0 text-muted" />
    </>
  )
}

/**
 * One card per institution that offers the course, filtered by province and fee, a page at a time. A card opens
 * the institution on this course, where its offer is detailed.
 */
function Offers({ course, offers, chosen }: OffersProps) {
  const { t, i18n } = useTranslation()
  const [province, setProvince] = useState('')
  const [band, setBand] = useState<FeeBand | ''>('')
  const provinces = [...new Set(offers.map(({ academy }) => academy.province))].toSorted((a, b) =>
    a.localeCompare(b),
  )
  const rows = offers
    .map((item) => ({ ...item, fee: offerFee(item.academy, item.offer) }))
    .filter(
      ({ academy, fee }) =>
        (!province || academy.province === province) && (!band || (fee !== null && feeBand(fee) === band)),
    )

  return (
    <DetailSection id="ofertas" title={t('course.tab_ofertas')} icon="landmark">
      <p className="-mt-2 mb-6 text-sm font-light text-copy">
        {t('course.whereBody', { count: offers.length })}
      </p>
      <FilteredGrid
        filters={[
          {
            key: 'province',
            label: t('course.filterProvince'),
            placeholder: t('course.anyProvince'),
            value: province,
            options: provinces.map((item) => ({ value: item, label: item })),
            onChange: setProvince,
          },
          {
            key: 'fee',
            label: t('course.filterFee'),
            placeholder: t('course.anyFee'),
            value: band,
            options: FEE_BANDS.map((item) => ({ value: item, label: t(`course.fee_${item}`) })),
            onChange: (value) => setBand(FEE_BANDS.find((item) => item === value) ?? ''),
          },
        ]}
        items={rows}
        itemKey={({ academy, offer }) => `${academy.id}-${offer.level}`}
        empty={t('course.offersNone')}
        pagesLabel={t('course.offersPages')}
        renderItem={({ academy, offer, fee }) => (
          <article
            aria-label={academy.name}
            className={`relative flex h-full flex-col rounded-card border border-line bg-surface p-5 transition hover:-translate-y-0.5 hover:shadow-card ${academy.id === chosen ? 'ring-2 ring-night' : ''}`}
          >
            <p className="text-xs font-light text-muted">
              {t(`training.type_${academy.type}`)} · {academy.province}
            </p>
            <h3 className="mt-1 font-display text-base font-bold break-words text-night">
              <Link
                to={`/academias/${academy.id}?curso=${course.id}&nivel=${offer.level}`}
                className="after:absolute after:inset-0"
              >
                {academy.name}
              </Link>
            </h3>
            <p className="mt-1 text-sm font-light text-copy">
              {offer.name} · {t(`training.${offer.level}`)}
            </p>
            <FeeLine fee={fee} />
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
        )}
      />
    </DetailSection>
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
    <section aria-labelledby="curricula" className="mt-10">
      <Subheading>
        <span id="curricula">{t('course.curriculumTitle')}</span>
      </Subheading>
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
