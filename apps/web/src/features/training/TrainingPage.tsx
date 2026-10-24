import { useTranslation } from 'react-i18next'
import heroLarge from '../../assets/heroes/cursos-1600.webp'
import heroSmall from '../../assets/heroes/cursos-800.webp'
import { Icon, type IconName } from '../../components/icons'
import { HERO_CONTROL, HeroField, ListHero } from '../../components/ListHero'
import { PhotoCredits } from '../../components/PhotoCredits'
import { QueryState } from '../../components/QueryState'
import { ButtonLink } from '../../components/ui/Button'
import { CardRow, ROW_ITEM } from '../../components/ui/CardRow'
import { FilterBar, FilterTiles } from '../../components/ui/Filters'
import { SectionHeading } from '../../components/ui/PageHeader'
import { Segmented } from '../../components/ui/Segmented'
import { useCareers, usePrograms } from '../../data/queries'
import type { Institution, Program, Schedule } from '../../data/types'
import { COST_BANDS, DURATION_BANDS, findBand } from '../../domain/bands'
import { formatPercent } from '../../domain/format'
import { matchesProgram } from '../../domain/programs'
import { CRITERIA, rankPrograms, scorePrograms, type SortKey } from '../../domain/ranking'
import { useUrlFilters } from '../../lib/useUrlFilters'
import { useUser } from '../../state/userStore'
import { ProgramCard } from './ProgramCard'

const SORTS: SortKey[] = ['score', 'price', 'rating']
const LEVELS: { level: Program['level']; icon: IconName }[] = [
  { level: 'licenciatura', icon: 'cap' },
  { level: 'medio_tecnico', icon: 'building' },
  { level: 'formacao_profissional', icon: 'briefcase' },
  { level: 'certificacao', icon: 'award' },
]
const isLevel = (value: string | null): value is Program['level'] =>
  LEVELS.some((item) => item.level === value)
const SCHEDULES: Schedule[] = ['diurno', 'pos_laboral', 'online']
const OWNERSHIPS: Institution['ownership'][] = ['publica', 'privada']
/** The list's filters in the URL; "Limpar filtros" removes them all. */
const FILTER_KEYS = ['onde', 'duracao', 'preco', 'horario', 'gestao', 'nivel']

// CC BY 4.0 asks for the author, the source and the licence, next to the photo.
const PHOTO = {
  author: 'Zapsmedia25',
  license: 'CC BY 4.0',
  url: 'https://commons.wikimedia.org/wiki/File:Wikiforhumanrights_Workshop_for_Students_at_the_Centre_for_Climate_Change_and_Sustainability_Studies_Department_university_of_Ghana_14.jpg',
}

export default function TrainingPage() {
  const { t } = useTranslation()
  const programsQuery = usePrograms()
  const { data: careers = [] } = useCareers()
  const { compare } = useUser()
  const [params, setParam] = useUrlFilters()
  const career = params.get('carreira')
  const province = params.get('onde')
  const levelParam = params.get('nivel')
  const level = isLevel(levelParam) ? levelParam : null
  const sort = SORTS.find((value) => value === params.get('ordem')) ?? 'score'
  const duration = findBand(DURATION_BANDS, params.get('duracao'))
  const cost = findBand(COST_BANDS, params.get('preco'))
  const schedule = SCHEDULES.find((value) => value === params.get('horario')) ?? null
  const ownership = OWNERSHIPS.find((value) => value === params.get('gestao')) ?? null
  const careerName = careers.find((item) => item.slug === career)?.name
  const setFilter = (key: string, value: string | null) => setParam(key, value)

  return (
    <div className="space-y-12">
      <QueryState query={programsQuery}>
        {(programs) => {
          const careerOptions = [...new Set(programs.flatMap((program) => program.careers))]
            .map((slug) => ({ value: slug, label: careers.find((item) => item.slug === slug)?.name ?? slug }))
            .toSorted((a, b) => a.label.localeCompare(b.label))
          const provinces = [...new Set(programs.map((program) => program.institution.province))]
          // Every filter but the level: the level tiles count what each level would show.
          const forCareer = scorePrograms(programs).filter(({ program }) =>
            matchesProgram(program, { career, province, duration, cost, schedule, ownership }),
          )
          const visible = forCareer.filter(({ program }) => !level || program.level === level)
          const { ranked, unrecognized } = rankPrograms(visible, sort)
          const courseLink = (id: string) => `/cursos/${id}${career ? `?carreira=${career}` : ''}`

          return (
            <>
              <Hero
                programs={programs}
                career={career}
                careerOptions={careerOptions}
                onCareer={(value) => setFilter('carreira', value || null)}
              />

              <section aria-labelledby="levels">
                <SectionHeading id="levels" title={t('training.levelsTitle')} icon="cap" />
                <FilterTiles
                  columns="sm:grid-cols-3 lg:grid-cols-4"
                  selected={level}
                  onSelect={(value) => setFilter('nivel', value)}
                  tiles={LEVELS.flatMap(({ level: value, icon }) => {
                    const count = forCareer.filter((item) => item.program.level === value).length
                    return count === 0
                      ? []
                      : [
                          {
                            value,
                            icon,
                            label: t(`training.${value}`),
                            note: t('training.courses', { count }),
                          },
                        ]
                  })}
                />
              </section>

              <Method />

              <section aria-labelledby="ranking">
                <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <h2 id="ranking" className="text-xl font-extrabold text-night sm:text-2xl">
                      {careerName
                        ? t('training.forCareer', { career: careerName })
                        : t('training.allCourses')}
                    </h2>
                    <output className="mt-1 block text-xs font-light text-muted">
                      {t('training.count', { count: ranked.length })}
                    </output>
                  </div>
                  <Segmented<SortKey>
                    label={t('training.sortLabel')}
                    value={sort}
                    onChange={(value) => setFilter('ordem', value)}
                    options={SORTS.map((value) => ({ value, label: t(`training.sort${value}`) }))}
                  />
                </div>
                <div className="mb-6">
                  <FilterBar
                    clearLabel={t('common.clearFilters')}
                    onChange={setFilter}
                    onClear={() => setParam('onde', null, FILTER_KEYS)}
                    filters={[
                      {
                        key: 'onde',
                        label: t('training.provinceLabel'),
                        placeholder: t('training.allProvinces'),
                        value: province,
                        options: provinces.map((value) => ({ value, label: value })),
                      },
                      {
                        key: 'duracao',
                        label: t('training.duration'),
                        placeholder: t('training.anyDuration'),
                        value: duration?.key ?? null,
                        options: DURATION_BANDS.map((band) => ({
                          value: band.key,
                          label: t(`training.duration_${band.key}`),
                        })),
                      },
                      {
                        key: 'preco',
                        label: t('training.cost'),
                        placeholder: t('training.anyCost'),
                        value: cost?.key ?? null,
                        options: COST_BANDS.map((band) => ({
                          value: band.key,
                          label: t(`training.cost_${band.key}`),
                        })),
                      },
                      {
                        key: 'horario',
                        label: t('training.schedule'),
                        placeholder: t('training.anySchedule'),
                        value: schedule,
                        options: SCHEDULES.map((value) => ({ value, label: t(`training.${value}`) })),
                      },
                      {
                        key: 'gestao',
                        label: t('training.institution'),
                        placeholder: t('training.anyOwnership'),
                        value: ownership,
                        options: OWNERSHIPS.map((value) => ({
                          value,
                          label: t(`training.ownership_${value}`),
                        })),
                      },
                    ]}
                  />
                </div>

                {ranked.length === 0 && (
                  <p className="rounded-card bg-surface py-10 text-center text-sm font-light text-muted shadow-card">
                    {unrecognized.length === 0 ? t('training.empty') : t('training.emptyRanked')}
                  </p>
                )}
                <CardRow label={t('training.ranked')}>
                  {ranked.map((item, index) => (
                    <li key={item.program.id} className={ROW_ITEM}>
                      <ProgramCard
                        item={item}
                        rank={index + 1}
                        featured={index === 0}
                        to={courseLink(item.program.id)}
                      />
                    </li>
                  ))}
                </CardRow>
              </section>

              {unrecognized.length > 0 && (
                <section aria-labelledby="unrecognized">
                  <SectionHeading id="unrecognized" title={t('training.unrecognizedTitle')} icon="info" />
                  <p className="-mt-2 mb-6 max-w-prose text-sm font-light text-copy">
                    {t('training.unrecognizedBody')}
                  </p>
                  <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
                    {unrecognized.map((item) => (
                      <li key={item.program.id}>
                        <ProgramCard item={item} to={courseLink(item.program.id)} />
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              <PhotoCredits photos={programs.map((program) => program.image)} />
            </>
          )
        }}
      </QueryState>

      {compare.length > 0 && (
        <div className="fixed inset-x-0 bottom-20 z-10 px-4 lg:bottom-6 lg:left-64">
          <div className="mx-auto flex max-w-lg items-center justify-between gap-3 rounded-full bg-coal py-2 pr-2 pl-5 text-white shadow-lift">
            <span className="text-sm font-light">{t('training.compareTray', { count: compare.length })}</span>
            <ButtonLink to="/cursos/comparar" variant="onDark" size="sm">
              {t('training.compareCta')}
            </ButtonLink>
          </div>
        </div>
      )}
    </div>
  )
}

type HeroProps = {
  programs: Program[]
  career: string | null
  careerOptions: { value: string; label: string }[]
  onCareer: (value: string) => void
}

/** The question the page answers (which career?), the numbers and a photo of students. */
function Hero({ programs, career, careerOptions, onCareer }: HeroProps) {
  const { t } = useTranslation()
  const costs = programs.flatMap((program) => (program.totalCost === null ? [] : [program.totalCost]))
  const stats: { icon: IconName; value: string | number; label: string }[] = [
    { icon: 'cap', value: programs.length, label: t('training.statCourses') },
    {
      icon: 'landmark',
      value: new Set(programs.map((program) => program.institution.id)).size,
      label: t('training.statInstitutions'),
    },
    {
      icon: 'check',
      value: programs.filter((program) => program.recognized).length,
      label: t('training.statRecognized'),
    },
    ...(costs.length > 0
      ? [
          {
            icon: 'wallet' as const,
            value: t('training.statFromValue', { value: Math.round(Math.min(...costs) / 1000) }),
            label: t('training.statFrom'),
          },
        ]
      : []),
  ]

  return (
    <ListHero
      title={t('training.title')}
      body={t('training.body')}
      stats={stats}
      control={
        <label className="block">
          <span className="block text-xs font-light text-muted">{t('training.careerLabel')}</span>
          <span className="mt-2 block">
            <HeroField icon="briefcase">
              <select
                value={career ?? ''}
                onChange={(event) => onCareer(event.target.value)}
                className={HERO_CONTROL}
              >
                <option value="">{t('training.allCareers')}</option>
                {careerOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <Icon
                name="chevronRight"
                className="pointer-events-none absolute top-1/2 right-5 size-5 -translate-y-1/2 rotate-90 text-night"
              />
            </HeroField>
          </span>
        </label>
      }
      media={
        <figure className="relative h-56 sm:h-72 lg:h-full">
          <img
            src={heroSmall}
            srcSet={`${heroSmall} 800w, ${heroLarge} 1600w`}
            sizes="(min-width: 1024px) 45vw, 100vw"
            alt=""
            className="size-full rounded-2xl object-cover"
          />
          <figcaption className="absolute right-2 bottom-2 rounded-full bg-coal/75 px-3 py-1 text-xs font-light text-white/80">
            {t('training.photoCredit')}{' '}
            <a
              href={PHOTO.url}
              target="_blank"
              rel="noreferrer"
              className="underline-offset-2 hover:underline"
            >
              {PHOTO.author}
            </a>{' '}
            ({PHOTO.license})
          </figcaption>
        </figure>
      }
    />
  )
}

/**
 * The method, published next to the ranking: what counts and how much, as bars of the real share
 * (40% of the track for 40% of the score). Market data has no source yet, so its bar stays grey.
 */
function Method() {
  const { t } = useTranslation()
  return (
    <section aria-labelledby="method" className="rounded-card bg-coal p-6 text-white shadow-card sm:p-8">
      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        <div>
          <SectionHeading id="method" title={t('training.howTitle')} icon="info" tone="dark" />
          <p className="max-w-prose text-sm font-light text-white/80">{t('training.howBody')}</p>
        </div>
        <ul aria-label={t('training.criteriaList')} className="space-y-4">
          {CRITERIA.map((criterion) => {
            const soon = criterion.key === 'market'
            return (
              <li key={criterion.key}>
                <div className="mb-2 flex items-baseline justify-between gap-4 text-sm">
                  <span className="font-normal">{t(`training.${criterion.key}`)}</span>
                  <span className={`font-semibold tabular-nums ${soon ? 'text-white/60' : ''}`}>
                    {formatPercent(criterion.weight)}
                  </span>
                </div>
                <span aria-hidden="true" className="block h-2 rounded-full bg-white/10">
                  <span
                    className={`block h-full rounded-full ${soon ? 'bg-white/30' : 'bg-white'}`}
                    style={{ width: `${criterion.weight * 100}%` }}
                  />
                </span>
                {soon && <p className="mt-2 text-xs font-light text-white/60">{t('training.marketSoon')}</p>}
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
