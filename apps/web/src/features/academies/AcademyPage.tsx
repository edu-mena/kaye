import type { TFunction } from 'i18next'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams, useSearchParams } from 'react-router'
import { DetailLayout, DetailSection, StatBlock, Subheading } from '../../components/DetailLayout'
import {
  CareerPills,
  ContactsBlock,
  DetailHero,
  ExternalLink,
  SoonBlock,
  SourcesBlock,
} from '../../components/DetailParts'
import { FilteredGrid } from '../../components/FilteredGrid'
import { Icon, type IconName } from '../../components/icons'
import { DetailSkeleton, NotFoundState } from '../../components/PageStates'
import { QueryState } from '../../components/QueryState'
import { ButtonLink } from '../../components/ui/Button'
import { Chip } from '../../components/ui/Chip'
import { Dialog } from '../../components/ui/Dialog'
import { SectionHeading } from '../../components/ui/PageHeader'
import { useAcademy, useAdmissions, useCareers } from '../../data/queries'
import type { Academy, AcademyOffer, Admission, CareerSummary } from '../../data/types'
import { admissionsFor, examSubjects } from '../../domain/admissions'
import { offerFee, FEE_BANDS, feeBand, type FeeBand } from '../../domain/fees'
import { formatKz } from '../../domain/format'
import { useUrlFilters } from '../../lib/useUrlFilters'
import { CareersEvaluation, CareersMarket } from '../careers/CareersOverview'
import { coursePath } from '../training/coursePath'
import { AdmissionBlock, ExamSubjects } from '../training/AdmissionBlock'
import { CurriculumView } from '../training/CurriculumView'
import { FeeLine } from '../training/FeeLine'
import { academyMeta } from './labels'

const TABS = [
  { id: 'geral', icon: 'eye' },
  { id: 'mercado', icon: 'chart' },
  { id: 'cursos', icon: 'cap' },
  { id: 'avaliacao', icon: 'user' },
] as const satisfies readonly { id: string; icon: IconName }[]

type TabId = (typeof TABS)[number]['id']

/**
 * An institution's page, in four tabs: what it is, the market of the careers its courses lead to, its courses
 * (a course opens its offer with the plan of studies, also from a course page's ?curso=) and how it fits the
 * user. Contacts and sources stay at the side. Fees are estimates and say so; length, schedules and reviews
 * have no source yet.
 */
export default function AcademyPage() {
  const { t } = useTranslation()
  const { id = '' } = useParams()
  const academyQuery = useAcademy(id)

  return (
    <QueryState query={academyQuery} loading={<DetailSkeleton />}>
      {(academy) =>
        academy ? (
          <AcademyView academy={academy} />
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

function AcademyView({ academy }: { academy: Academy }) {
  const { t } = useTranslation()
  const [params, setParam] = useUrlFilters()
  const { data: allCareers = [] } = useCareers()
  const slugs = [...new Set(academy.offers.flatMap((offer) => offer.careers))]
  const careers = allCareers.filter((career) => slugs.includes(career.slug))
  const tabs = TABS.map((tab) => ({ id: tab.id, icon: tab.icon, label: t(`academy.tab_${tab.id}`) }))
  // Opened on a course (?curso=, from a course page): its tab, with the offer open.
  const active: TabId =
    tabs.find((tab) => tab.id === params.get('secao'))?.id ?? (params.get('curso') ? 'cursos' : 'geral')

  return (
    <DetailLayout
      header={
        <DetailHero
          entity={academy}
          back={{ to: '/academias', label: t('academy.back') }}
          meta={academyMeta(academy, t)}
        />
      }
      tabs={{
        label: t('academy.tabsLabel'),
        items: tabs,
        value: active,
        onChange: (tab) =>
          setParam('secao', tab === 'geral' ? null : tab, tab === 'cursos' ? [] : ['curso', 'nivel']),
        idPrefix: 'academy',
      }}
      aside={
        <>
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
          <SourcesBlock sources={academy.sources} />
        </>
      }
    >
      {active === 'geral' && <General academy={academy} />}
      {active === 'mercado' && <Market academy={academy} slugs={slugs} />}
      {active === 'cursos' && <Courses academy={academy} careers={careers} />}
      {active === 'avaliacao' && (
        <DetailSection id="avaliacao" title={t('academy.tab_avaliacao')} icon="user">
          <CareersEvaluation
            careers={careers}
            count={{ label: t('academy.statCourses'), value: academy.offers.length }}
            plans={academy.offers.filter((offer) => offer.curriculum).length}
            note={t('academy.evalNote')}
            fitSubtitle={t('academy.fitSubtitle')}
          >
            <div className="mt-8">
              <SoonBlock id="reviews" icon="award" title={t('academy.reviewsTitle')}>
                {t('academy.reviewsBody')}
              </SoonBlock>
            </div>
          </CareersEvaluation>
        </DetailSection>
      )}
    </DetailLayout>
  )
}

/**
 * "Como entrar": one block per access process (opened on a course, the one that covers it first); without one,
 * the national calendar, as the institution's days are still to be announced.
 */
function HowToGetIn({ academy }: { academy: Academy }) {
  const { t } = useTranslation()
  const [params] = useUrlFilters()
  const { data = [] } = useAdmissions()
  const curso = params.get('curso') ?? ''
  const own = admissionsFor(data, { academy }).toSorted(
    (a, b) => Number(names(b, curso)) - Number(names(a, curso)),
  )
  const national = data.find((admission) => admission.academyId === null)
  const title = (admission: Admission) => {
    const courses = academy.offers
      .filter((offer) => names(admission, offer.course.id))
      .map((offer) => offer.course.name)
    return courses.length === 0 ? t('admission.allCourses') : [...new Set(courses)].join(', ')
  }
  return (
    <div className="mt-10">
      <Subheading>{t('admission.title')}</Subheading>
      <div className="grid gap-4">
        {own.map((admission) => (
          <AdmissionBlock key={admission.id} admission={admission} title={title(admission)} />
        ))}
        {own.length === 0 && national && (
          <>
            <p className="text-sm font-light text-copy">{t('admission.noneYet')}</p>
            <AdmissionBlock admission={national} title={t('admission.national')} />
          </>
        )}
      </div>
    </div>
  )
}

/** Whether a record names the course (one with no course ids covers them all, without naming any). */
const names = (admission: Admission, courseId: string) => admission.courseIds?.includes(courseId) ?? false

/** What the institution is: its summary, the facts a source confirms, and where its news will go. */
function General({ academy }: { academy: Academy }) {
  const { t } = useTranslation()
  return (
    <DetailSection id="geral" title={t('academy.tab_geral')} icon="eye">
      <p className="max-w-3xl text-sm leading-relaxed font-light text-copy">{academy.summary}</p>
      <div className="mt-8">
        <StatBlock items={facts(academy, t)} />
      </div>
      <HowToGetIn academy={academy} />
      <div className="mt-10">
        <SoonBlock id="news" icon="megaphone" title={t('academy.newsTitle')}>
          {t('academy.newsBody')}
        </SoonBlock>
      </div>
    </DetailSection>
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

/**
 * The institution's own figures (students and graduates from the yearbook, the fee range published or estimated
 * from its kind), then the market of the careers its courses lead to.
 */
function Market({ academy, slugs }: { academy: Academy; slugs: string[] }) {
  const { t, i18n } = useTranslation()
  const fees = academy.offers.flatMap((offer) => offerFee(academy, offer) ?? [])
  const students = academy.offers.reduce((sum, offer) => sum + (offer.students ?? 0), 0)
  const graduates = academy.offers.reduce((sum, offer) => sum + (offer.graduates ?? 0), 0)
  const min = Math.min(...fees.map((fee) => fee.min))
  const max = Math.max(...fees.map((fee) => fee.max))
  const fee =
    fees.length === 0
      ? t('course.feeUnknown')
      : max === 0
        ? t('course.feeFree')
        : t('course.feeValue', { min: formatKz(min), max: formatKz(max) })
  return (
    <DetailSection id="mercado" title={t('academy.tab_mercado')} icon="chart">
      <StatBlock
        items={[
          { label: t('academy.statCourses'), value: String(academy.offers.length) },
          ...(students > 0
            ? [
                { label: t('academy.statStudents'), value: students.toLocaleString(i18n.language) },
                { label: t('academy.statGraduates'), value: graduates.toLocaleString(i18n.language) },
              ]
            : []),
          { label: t('academy.statFee'), value: fee },
        ]}
      />
      {fees.length > 0 && (
        <p className="mt-3 text-xs font-light text-muted">
          {t(fees.some((item) => item.estimated) ? 'course.feeEstimated' : 'academy.feesPublished')}
        </p>
      )}
      <div className="mt-10">
        <CareersMarket slugs={slugs} intro={t('academy.marketIntro')} none={t('academy.marketNone')} />
      </div>
    </DetailSection>
  )
}

/**
 * The courses a source confirms, filtered by level and fee, a page at a time. A course opens its offer, kept in
 * the address (?curso=&nivel=) so a course page can link straight to it.
 */
function Courses({ academy, careers }: { academy: Academy; careers: CareerSummary[] }) {
  const { t } = useTranslation()
  const [params, setParam] = useUrlFilters()
  const [, setParams] = useSearchParams()
  const [level, setLevel] = useState('')
  const [band, setBand] = useState<FeeBand | ''>('')
  const curso = params.get('curso')
  const nivel = params.get('nivel')
  const open = academy.offers.find((offer) => offer.course.id === curso && (!nivel || offer.level === nivel))
  const levels = [...new Set(academy.offers.map((offer) => offer.level))]
  const rows = academy.offers
    .map((offer) => ({ offer, fee: offerFee(academy, offer) }))
    .filter(
      ({ offer, fee }) =>
        (!level || offer.level === level) && (!band || (fee !== null && feeBand(fee) === band)),
    )
  const close = () => setParam('curso', null, ['nivel'])

  return (
    <DetailSection id="cursos" title={t('academy.tab_cursos')} icon="cap">
      <p className="-mt-2 mb-6 text-sm font-light text-copy">
        {academy.offers.length === 0
          ? t('academy.offersEmpty')
          : t('academy.offersBody', { count: academy.offers.length })}
      </p>
      {academy.offers.length > 0 && (
        <FilteredGrid
          filters={[
            {
              key: 'level',
              label: t('academy.filterLevel'),
              placeholder: t('academy.anyLevel'),
              value: level,
              options: levels.map((item) => ({ value: item, label: t(`training.${item}`) })),
              onChange: setLevel,
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
          itemKey={({ offer }) => `${offer.course.id}-${offer.level}`}
          empty={t('academy.coursesNone')}
          pagesLabel={t('academy.coursesPages')}
          renderItem={({ offer, fee }) => (
            <OfferCard
              offer={offer}
              fee={fee}
              shown={offer === open}
              onOpen={() =>
                setParams(
                  (current) => {
                    const next = new URLSearchParams(current)
                    next.set('curso', offer.course.id)
                    next.set('nivel', offer.level)
                    return next
                  },
                  { replace: true, preventScrollReset: true },
                )
              }
            />
          )}
        />
      )}
      {open && (
        <OfferDialog
          academy={academy}
          offer={open}
          careers={careers.filter((career) => open.careers.includes(career.slug))}
          onClose={close}
        />
      )}
    </DetailSection>
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

type OfferCardProps = {
  offer: AcademyOffer
  fee: ReturnType<typeof offerFee>
  /** The course the page was opened on. */
  shown: boolean
  onOpen: () => void
}

/** One course: level, faculty, name, fee, students, and whether its plan of studies and decree are published. */
function OfferCard({ offer, fee, shown, onOpen }: OfferCardProps) {
  const { t } = useTranslation()
  return (
    <article
      aria-label={offer.name}
      className={`relative flex h-full flex-col rounded-card border border-line bg-surface p-5 transition hover:-translate-y-0.5 hover:shadow-card ${shown ? 'ring-2 ring-night' : ''}`}
    >
      <p className="text-xs font-light text-muted">
        {t(`training.${offer.level}`)}
        {offer.faculty && ` · ${offer.faculty}`}
      </p>
      <h3 className="mt-1 font-display text-base font-bold break-words text-night">
        <button
          type="button"
          onClick={onOpen}
          aria-label={t('academy.offerOpen', { course: offer.name })}
          className="text-left after:absolute after:inset-0"
        >
          {offer.name}
        </button>
      </h3>
      <FeeLine fee={fee} />
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
 * An institution's offer of a course: the estimated fee, what is not confirmed yet, the plan of studies its
 * decree approved and the careers it leads to, with a way to the course's own page.
 */
function OfferDialog({ academy, offer, careers, onClose }: OfferDialogProps) {
  const { t } = useTranslation()
  const { data = [] } = useAdmissions()
  const subjects = examSubjects(admissionsFor(data, { academy }), offer.course.id)
  const pending = ['duration', 'schedule'] as const
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
      <FeeLine fee={offerFee(academy, offer)} />
      <dl className="mt-4 grid grid-cols-2 gap-3">
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
      {subjects.length > 0 && (
        <>
          <h3 className="mt-6 mb-3 text-sm font-bold text-night">{t('admission.subjects')}</h3>
          <ExamSubjects subjects={subjects} />
        </>
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
