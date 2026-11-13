import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { CoverHero } from '../../components/CoverHero'
import { EntityCard } from '../../components/EntityCard'
import type { IconName } from '../../components/icons'
import { ListSkeleton } from '../../components/PageStates'
import { QueryState } from '../../components/QueryState'
import { FilterBar } from '../../components/ui/Filters'
import { SectionHeading } from '../../components/ui/PageHeader'
import { Pagination } from '../../components/ui/Pagination'
import { useAcademies } from '../../data/queries'
import { byInterest, groupAreas } from '../../domain/interests'
import { useInterestAreas } from '../../lib/useInterestAreas'
import type { Academy, AcademyOffer, CareerGroup, Institution } from '../../data/types'
import { paginate } from '../../lib/pagination'
import { useUrlFilters } from '../../lib/useUrlFilters'
import { academyMeta } from './labels'

const TYPES: Academy['type'][] = ['universidade', 'instituto_medio', 'centro_formacao', 'online']
/**
 * Filters that only fit some types: faculties exist only at universities, while areas suit the
 * mid-level and vocational courses. With no type chosen, neither shows.
 */
const FILTERS_BY_TYPE: Record<Academy['type'], ('area' | 'faculdade')[]> = {
  universidade: ['faculdade'],
  instituto_superior: [],
  instituto_medio: ['area'],
  centro_formacao: ['area'],
  online: ['area'],
}
/** Filters whose options depend on the type: changing the type clears them. */
const TYPE_DEPENDENT = ['area', 'nivel', 'faculdade', 'pagina']
const OWNERSHIPS: Institution['ownership'][] = ['publica', 'privada']
const LEVELS: AcademyOffer['level'][] = [
  'licenciatura',
  'mestrado',
  'medio_tecnico',
  'formacao_profissional',
  'certificacao',
]
/** The list's filters in the URL; "Limpar filtros" removes them all. */
const FILTER_KEYS = ['tipo', 'area', 'nivel', 'faculdade', 'onde', 'gestao', 'curso', 'pagina']
const PAGE_SIZE = 12

type OfferFilters = {
  course: string | null
  area: CareerGroup | null
  level: AcademyOffer['level'] | null
  faculty: string | null
}

/** An academy matches when one of its offers has the course, area, level and faculty asked for. */
function offersMatch(academy: Academy, { course, area, level, faculty }: OfferFilters): boolean {
  if (!course && !area && !level && !faculty) return true
  return academy.offers.some(
    (offer) =>
      (!course || offer.course.id === course) &&
      (!area || offer.areas.includes(area)) &&
      (!level || offer.level === level) &&
      (!faculty || offer.faculty === faculty),
  )
}

export default function AcademiesPage() {
  const { t } = useTranslation()
  const academiesQuery = useAcademies()
  const mine = useInterestAreas()
  const [params, setParam] = useUrlFilters()
  /** A filter from the URL, only when it is one of the options: unknown values are ignored. */
  const pick = <T extends string>(key: string, values: readonly T[]) =>
    values.find((value) => value === params.get(key)) ?? null
  const type = pick('tipo', TYPES)
  const ownership = pick('gestao', OWNERSHIPS)
  const shown = type ? FILTERS_BY_TYPE[type] : []
  const list = useRef<HTMLElement>(null)

  return (
    <div className="space-y-12">
      <QueryState query={academiesQuery} loading={<ListSkeleton tiles={3} />}>
        {(academies) => {
          const offers = academies.flatMap((academy) => academy.offers)
          const courses = [...new Map(offers.map((offer) => [offer.course.id, offer.course.name]))]
            .map(([value, label]) => ({ value, label }))
            .toSorted((a, b) => a.label.localeCompare(b.label))
          const types = TYPES.filter((value) => academies.some((academy) => academy.type === value))
          // The options come from the chosen type's offers; a filter hidden for this type has none.
          const ofType = academies.filter((academy) => !type || academy.type === type)
          const typeOffers = ofType.flatMap((academy) => academy.offers)
          const areas = shown.includes('area') ? [...new Set(typeOffers.flatMap((offer) => offer.areas))] : []
          const levels = LEVELS.filter((value) => typeOffers.some((offer) => offer.level === value))
          const faculties = shown.includes('faculdade')
            ? [...new Set(typeOffers.flatMap((offer) => (offer.faculty ? [offer.faculty] : [])))]
            : []
          const provinces = [...new Set(academies.map((academy) => academy.province))]

          const course = pick(
            'curso',
            courses.map((option) => option.value),
          )
          const area = pick('area', areas)
          const level = pick('nivel', levels)
          const faculty = pick('faculdade', faculties)
          const province = pick('onde', provinces)
          const visible = byInterest(
            ofType.filter(
              (academy) =>
                offersMatch(academy, { course, area, level, faculty }) &&
                (!province || academy.province === province) &&
                (!ownership || academy.ownership === ownership),
            ),
            (academy) => groupAreas(academy.offers.flatMap((offer) => offer.areas)),
            mine,
          )
          const courseName = courses.find((option) => option.value === course)?.label
          const { page, pages, shown: onPage } = paginate(visible, Number(params.get('pagina')), PAGE_SIZE)
          const goTo = (next: number) => {
            setParam('pagina', next > 1 ? String(next) : null)
            list.current?.scrollIntoView?.({ behavior: 'smooth', block: 'start' })
          }
          const stats: { icon: IconName; value: number; label: string }[] = [
            { icon: 'landmark', value: academies.length, label: t('academies.statInstitutions') },
            {
              icon: 'building',
              value: academies.filter((academy) => academy.ownership === 'publica').length,
              label: t('academies.statPublic'),
            },
            { icon: 'cap', value: courses.length, label: t('academies.statCourses') },
            {
              icon: 'document',
              value: new Set(academies.flatMap((academy) => academy.sources.map((source) => source.url)))
                .size,
              label: t('academies.statSources'),
            },
          ]

          return (
            <>
              <CoverHero title={t('academies.title')} stats={stats} />

              <section aria-labelledby="list" ref={list} className="scroll-mt-6">
                <div className="mb-6">
                  <h2 id="list" className="text-xl font-extrabold text-night sm:text-2xl">
                    {courseName ? t('academies.forCourse', { course: courseName }) : t('academies.all')}
                  </h2>
                  <output className="mt-1 block text-xs font-light text-muted">
                    {t('academies.count', { count: visible.length })}
                  </output>
                </div>
                <div className="mb-6">
                  <FilterBar
                    clearLabel={t('common.clearFilters')}
                    onChange={(key, value) =>
                      setParam(key, value, key === 'tipo' ? TYPE_DEPENDENT : ['pagina'])
                    }
                    onClear={() => setParam('tipo', null, FILTER_KEYS)}
                    filters={[
                      {
                        key: 'curso',
                        label: t('academies.courseLabel'),
                        placeholder: t('academies.allCourses'),
                        value: course,
                        options: courses,
                      },
                      {
                        key: 'tipo',
                        label: t('academies.typesTitle'),
                        placeholder: t('academies.allTypes'),
                        value: type,
                        options: types.map((value) => ({ value, label: t(`training.type_${value}`) })),
                      },
                      ...(areas.length > 0
                        ? [
                            {
                              key: 'area',
                              label: t('academies.areaLabel'),
                              placeholder: t('academies.allAreas'),
                              value: area,
                              options: areas
                                .map((value) => ({ value, label: t(`groups.${value}`) }))
                                .toSorted((a, b) => a.label.localeCompare(b.label)),
                            },
                          ]
                        : []),
                      ...(faculties.length > 0
                        ? [
                            {
                              key: 'faculdade',
                              label: t('academies.facultyLabel'),
                              placeholder: t('academies.anyFaculty'),
                              value: faculty,
                              options: faculties.map((value) => ({ value, label: value })),
                            },
                          ]
                        : []),
                      // A level filter with one option says nothing: it shows from two.
                      ...(levels.length > 1
                        ? [
                            {
                              key: 'nivel',
                              label: t('academies.levelLabel'),
                              placeholder: t('academies.anyLevel'),
                              value: level,
                              options: levels.map((value) => ({ value, label: t(`training.${value}`) })),
                            },
                          ]
                        : []),
                      {
                        key: 'onde',
                        label: t('academies.provinceLabel'),
                        placeholder: t('academies.allProvinces'),
                        value: province,
                        options: provinces.map((value) => ({ value, label: value })),
                      },
                      {
                        key: 'gestao',
                        label: t('academies.ownershipLabel'),
                        placeholder: t('academies.anyOwnership'),
                        value: ownership,
                        options: OWNERSHIPS.map((value) => ({
                          value,
                          label: t(`training.ownership_${value}`),
                        })),
                      },
                    ]}
                  />
                </div>

                {visible.length === 0 ? (
                  <p className="rounded-card bg-surface py-10 text-center text-sm font-light text-muted shadow-card">
                    {t('academies.empty')}
                  </p>
                ) : (
                  <ul
                    aria-label={t('academies.list')}
                    className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4"
                  >
                    {onPage.map((academy) => (
                      <li key={academy.id}>
                        <EntityCard
                          entity={academy}
                          to={`/academias/${academy.id}`}
                          meta={academyMeta(academy, t)}
                          place={academy.place}
                          badge={
                            academy.minAge === undefined
                              ? undefined
                              : t('academies.minAge', { age: academy.minAge })
                          }
                        />
                      </li>
                    ))}
                  </ul>
                )}
                <Pagination page={page} pages={pages} onChange={goTo} label={t('academies.pages')} />
              </section>

              <section
                aria-labelledby="method"
                className="rounded-card bg-coal p-6 text-white shadow-card sm:p-8"
              >
                <SectionHeading id="method" title={t('academies.howTitle')} icon="info" tone="dark" />
                <p className="max-w-prose text-sm font-light text-white/80">{t('academies.howBody')}</p>
              </section>
            </>
          )
        }}
      </QueryState>
    </div>
  )
}
