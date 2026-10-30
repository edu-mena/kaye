import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { AreaPicker } from '../../components/AreaPicker'
import { Icon } from '../../components/icons'
import { Chip } from '../../components/ui/Chip'
import { FilterBar } from '../../components/ui/Filters'
import { SectionHeading } from '../../components/ui/PageHeader'
import { Pagination } from '../../components/ui/Pagination'
import { MARKET_AREAS, type CatalogCourse, type MarketArea } from '../../data/types'
import { filterCourses, OFFER_LEVELS } from '../../domain/courses'
import { paginate } from '../../lib/pagination'
import { useUrlFilters, useUrlText } from '../../lib/useUrlFilters'
import { coursePath } from './coursePath'

const PAGE_SIZE = 12
const ALL = 'todas'

/**
 * Every real course (the yearbook's and the decrees'), one area at a time or all, with a level and a search: the
 * catalogue. The hero's career, when chosen, keeps only the courses that lead to it.
 */
export function CourseCatalogue({ courses, career }: { courses: CatalogCourse[]; career: string | null }) {
  const { t } = useTranslation()
  const [params, setParam] = useUrlFilters()
  const [search, setSearch] = useUrlText('q')
  const list = useRef<HTMLElement>(null)
  const area = MARKET_AREAS.find((value) => value === params.get('area')) ?? null
  const level = OFFER_LEVELS.find((value) => value === params.get('grau')) ?? null
  const areas = MARKET_AREAS.filter((value) => courses.some((course) => course.areas.includes(value)))
  const levels = OFFER_LEVELS.filter((value) => courses.some((course) => course.levels.includes(value)))
  const results = filterCourses(courses, { query: search, area, level, career })
  const { page, pages, shown } = paginate(results, Number(params.get('pagina')), PAGE_SIZE)
  // A new area, level or search starts again on the first page.
  const setFilter = (key: string, value: string | null) => setParam(key, value, ['pagina'])

  return (
    <section ref={list} aria-labelledby="catalogue" className="scroll-mt-24">
      <SectionHeading id="catalogue" title={t('training.catalogueTitle')} icon="compass" />
      <p className="-mt-2 mb-6 max-w-prose text-sm font-light text-copy">{t('training.catalogueBody')}</p>
      <AreaPicker<MarketArea | typeof ALL>
        label={t('training.catalogueTitle')}
        options={[
          { value: ALL, label: t('training.allAreas') },
          ...areas.map((value) => ({ value, label: t(`market.area_${value}`) })),
        ]}
        value={area ?? ALL}
        onChange={(value) => setFilter('area', value === ALL ? null : value)}
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
          onChange={setFilter}
          onClear={() => setParam('grau', null, ['q', 'pagina'])}
          filters={[
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
        <ul aria-label={t('training.catalogue')} className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {shown.map((course) => (
            <li key={course.id}>
              <CourseCard course={course} />
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

/** A course: its levels, its name, its areas, how many institutions teach it and to how many students. */
function CourseCard({ course }: { course: CatalogCourse }) {
  const { t, i18n } = useTranslation()
  const titleId = `course-${course.id}`
  const curricula = course.offers.filter(({ offer }) => offer.curriculum).length
  return (
    <article
      aria-labelledby={titleId}
      className="relative flex h-full flex-col rounded-card bg-surface p-5 shadow-card transition hover:shadow-lift"
    >
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
    </article>
  )
}
