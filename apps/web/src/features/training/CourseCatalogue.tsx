import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { AreaPicker } from '../../components/AreaPicker'
import { Icon } from '../../components/icons'
import { PhotoImg } from '../../components/PhotoImg'
import { Chip } from '../../components/ui/Chip'
import { FilterBar } from '../../components/ui/Filters'
import { SectionHeading } from '../../components/ui/PageHeader'
import { Pagination } from '../../components/ui/Pagination'
import { MARKET_AREAS, type CareerSummary, type CatalogCourse } from '../../data/types'
import { filterCourses, OFFER_LEVELS } from '../../domain/courses'
import { byInterest } from '../../domain/interests'
import { paginate } from '../../lib/pagination'
import { useInterestAreas } from '../../lib/useInterestAreas'
import { useUrlFilters, useUrlText } from '../../lib/useUrlFilters'
import { coursePath } from './coursePath'

const PAGE_SIZE = 12

type CourseCatalogueProps = {
  courses: CatalogCourse[]
  careers: CareerSummary[]
  career: string | null
  careerOptions: { value: string; label: string }[]
  onCareer: (value: string | null) => void
}

/**
 * Every real course (the yearbook's and the decrees'), one area at a time or all, with a level, a career and a
 * search: the catalogue.
 */
export function CourseCatalogue({ courses, careers, career, careerOptions, onCareer }: CourseCatalogueProps) {
  const { t } = useTranslation()
  const [params, setParam] = useUrlFilters()
  const [search, setSearch] = useUrlText('q')
  const list = useRef<HTMLElement>(null)
  const mine = useInterestAreas()
  const area = MARKET_AREAS.find((value) => value === params.get('area')) ?? null
  const level = OFFER_LEVELS.find((value) => value === params.get('grau')) ?? null
  const areas = MARKET_AREAS.filter((value) => courses.some((course) => course.areas.includes(value)))
  const levels = OFFER_LEVELS.filter((value) => courses.some((course) => course.levels.includes(value)))
  // In "todas as áreas", the person's areas first (health has the most courses and would fill the top).
  const results = byInterest(
    filterCourses(courses, { query: search, area, level, career }),
    (course) => course.areas,
    mine,
  )
  const { page, pages, shown } = paginate(results, Number(params.get('pagina')), PAGE_SIZE)
  // A new area, level or search starts again on the first page.
  const setFilter = (key: string, value: string | null) => setParam(key, value, ['pagina'])

  return (
    <section ref={list} data-tour="courses" aria-labelledby="catalogue" className="scroll-mt-24">
      <SectionHeading id="catalogue" title={t('training.catalogueTitle')} icon="compass" />
      <AreaPicker
        label={t('training.catalogueTitle')}
        allLabel={t('training.allAreas')}
        options={areas.map((value) => ({ value, label: t(`market.area_${value}`) }))}
        value={area}
        onChange={(value) => setFilter('area', value)}
        mine={mine}
        className="mb-4"
      />
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end">
        <label className="relative block sm:w-80">
          <span className="sr-only">{t('training.searchLabel')}</span>
          <Icon
            name="search"
            className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted"
          />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value, ['pagina'])}
            placeholder={t('training.searchLabel')}
            className="h-11 w-full rounded-full border border-line bg-surface pr-4 pl-10 text-sm text-night placeholder:text-muted"
          />
        </label>
        <FilterBar
          clearLabel={t('training.clear')}
          onChange={(key, value) => (key === 'carreira' ? onCareer(value) : setFilter(key, value))}
          onClear={() => {
            setParam('grau', null, ['q', 'pagina'])
            onCareer(null)
          }}
          filters={[
            {
              key: 'carreira',
              label: t('training.careerLabel'),
              placeholder: t('training.allCareers'),
              value: career,
              options: careerOptions,
            },
            {
              key: 'grau',
              label: t('training.level'),
              placeholder: t('training.anyLevel'),
              value: level,
              options: levels.map((value) => ({ value, label: t(`training.${value}`) })),
            },
          ]}
        />
      </div>
      <output className="mb-4 block text-xs font-light text-muted">
        {t('training.courses', { count: results.length })}
      </output>
      {results.length === 0 ? (
        <p className="rounded-card bg-surface py-10 text-center text-sm font-light text-muted shadow-card">
          {t('training.catalogueEmpty')}
        </p>
      ) : (
        <ul aria-label={t('training.catalogue')} className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
          {shown.map((course) => (
            <li key={course.id}>
              <CourseCard course={course} careers={careers} />
            </li>
          ))}
        </ul>
      )}
      <Pagination
        page={page}
        pages={pages}
        label={t('training.cataloguePages')}
        onChange={(next) => {
          setParam('pagina', next > 1 ? String(next) : null)
          list.current?.scrollIntoView?.({ behavior: 'smooth', block: 'start' })
        }}
      />
    </section>
  )
}

/**
 * A course: its photo (the career it leads to), its levels, its name, its areas, how many
 * institutions teach it and to how many students.
 */
function CourseCard({ course, careers }: { course: CatalogCourse; careers: CareerSummary[] }) {
  const { t, i18n } = useTranslation()
  const titleId = `course-${course.id}`
  const curricula = course.offers.filter(({ offer }) => offer.curriculum).length
  const career = careers.find((item) => course.careers.includes(item.slug))
  return (
    <article
      aria-labelledby={titleId}
      className="relative flex h-full flex-col overflow-hidden rounded-card bg-surface shadow-card transition hover:shadow-lift"
    >
      <div className="relative h-32 shrink-0 bg-coal sm:h-40">
        {career?.image && (
          <PhotoImg
            photo={career.image}
            sizes="(min-width: 1024px) 22vw, (min-width: 640px) 33vw, 50vw"
            className="size-full object-cover object-[center_30%]"
          />
        )}
      </div>
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <div className="flex flex-wrap gap-1.5">
          {course.levels.map((level) => (
            <Chip key={level}>{t(`training.${level}`)}</Chip>
          ))}
        </div>
        <h3 id={titleId} className="mt-3 font-display text-lg font-bold break-words text-night">
          <Link to={coursePath(course.id)} className="after:absolute after:inset-0">
            {course.name}
          </Link>
        </h3>
        <p className="mt-1 text-xs font-light text-muted">
          {course.areas.map((value) => t(`market.area_${value}`)).join(' · ')}
        </p>
        <p className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1 pt-4 text-sm font-light text-copy">
          <span className="inline-flex items-center gap-1.5">
            <Icon name="landmark" className="size-4 text-muted" />
            {t('training.institutionsCount', { count: course.offers.length })}
          </span>
          {course.students > 0 && (
            <span className="inline-flex items-center gap-1.5">
              <Icon name="users" className="size-4 text-muted" />
              {t('training.students', {
                count: course.students,
                value: course.students.toLocaleString(i18n.language),
              })}
            </span>
          )}
          {curricula > 0 && (
            <span className="inline-flex items-center gap-1.5">
              <Icon name="document" className="size-4 text-muted" />
              {t('academy.hasCurriculum')}
            </span>
          )}
        </p>
      </div>
    </article>
  )
}
