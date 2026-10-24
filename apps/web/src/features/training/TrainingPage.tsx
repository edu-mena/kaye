import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import heroLarge from '../../assets/heroes/cursos-1600.webp'
import heroSmall from '../../assets/heroes/cursos-800.webp'
import { Icon, type IconName } from '../../components/icons'
import { PhotoCredits } from '../../components/PhotoCredits'
import { QueryState } from '../../components/QueryState'
import { ButtonLink } from '../../components/ui/Button'
import { Dialog } from '../../components/ui/Dialog'
import { FilterSelect, FilterTiles, StatPills } from '../../components/ui/Filters'
import { SectionHeading } from '../../components/ui/PageHeader'
import { Pagination } from '../../components/ui/Pagination'
import { Segmented } from '../../components/ui/Segmented'
import { useCareer, useCareers, usePrograms } from '../../data/queries'
import type { Program } from '../../data/types'
import { formatPercent } from '../../domain/format'
import { CRITERIA, rankPrograms, scorePrograms, type ScoredProgram, type SortKey } from '../../domain/ranking'
import { paginate } from '../../lib/pagination'
import { useUrlFilters } from '../../lib/useUrlFilters'
import { useUser } from '../../state/userStore'
import { ProgramCard } from './ProgramCard'
import { ProgramSummary } from './ProgramSummary'

const SORTS: SortKey[] = ['score', 'price', 'rating']
/** Three rows of three on a wide screen. */
const PAGE_SIZE = 9
const LEVELS: { level: Program['level']; icon: IconName }[] = [
  { level: 'licenciatura', icon: 'cap' },
  { level: 'medio_tecnico', icon: 'building' },
  { level: 'formacao_profissional', icon: 'briefcase' },
  { level: 'certificacao', icon: 'award' },
]
const isLevel = (value: string | null): value is Program['level'] =>
  LEVELS.some((item) => item.level === value)

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
  const [openId, setOpenId] = useState<string | null>(null)
  const list = useRef<HTMLElement>(null)
  const career = params.get('carreira')
  const province = params.get('onde')
  const levelParam = params.get('nivel')
  const level = isLevel(levelParam) ? levelParam : null
  const sort = SORTS.find((value) => value === params.get('ordem')) ?? 'score'
  const careerName = careers.find((item) => item.slug === career)?.name
  // A new career, place, level or order starts again on the first page.
  const setFilter = (key: string, value: string | null) => setParam(key, value, ['pagina'])

  return (
    <div className="space-y-12">
      <QueryState query={programsQuery}>
        {(programs) => {
          const careerOptions = [...new Set(programs.flatMap((program) => program.careers))]
            .map((slug) => ({ value: slug, label: careers.find((item) => item.slug === slug)?.name ?? slug }))
            .toSorted((a, b) => a.label.localeCompare(b.label))
          const provinces = [...new Set(programs.map((program) => program.institution.province))]
          const forCareer = scorePrograms(programs).filter(
            ({ program }) =>
              (!career || program.careers.includes(career)) &&
              (!province || program.institution.province === province),
          )
          const visible = forCareer.filter(({ program }) => !level || program.level === level)
          const { ranked, unrecognized } = rankPrograms(visible, sort)
          const { page, pages, offset, shown } = paginate(ranked, Number(params.get('pagina')), PAGE_SIZE)
          // The popup always gives the place by score, whatever order the list is in.
          const byScore = rankPrograms(visible, 'score').ranked
          const open = byScore.find((item) => item.program.id === openId)
          const goTo = (next: number) => {
            setParam('pagina', next > 1 ? String(next) : null)
            list.current?.scrollIntoView?.({ behavior: 'smooth', block: 'start' })
          }

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

              <section ref={list} aria-labelledby="ranking" className="scroll-mt-24">
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
                  <div className="flex flex-wrap items-center gap-3">
                    <FilterSelect
                      label={t('training.provinceLabel')}
                      placeholder={t('training.allProvinces')}
                      value={province}
                      onChange={(value) => setFilter('onde', value)}
                      options={provinces.map((value) => ({ value, label: value }))}
                    />
                    <Segmented<SortKey>
                      label={t('training.sortLabel')}
                      value={sort}
                      onChange={(value) => setFilter('ordem', value)}
                      options={SORTS.map((value) => ({ value, label: t(`training.sort${value}`) }))}
                    />
                  </div>
                </div>

                {ranked.length === 0 && (
                  <p className="rounded-card bg-surface py-10 text-center text-sm font-light text-muted shadow-card">
                    {unrecognized.length === 0 ? t('training.empty') : t('training.emptyRanked')}
                  </p>
                )}
                <ol aria-label={t('training.ranked')} className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {shown.map((item, index) => {
                    const rank = offset + index + 1
                    return (
                      <li key={item.program.id}>
                        <ProgramCard
                          item={item}
                          rank={rank}
                          lead={rank === 1 ? t(`training.top${sort}`) : undefined}
                          onOpen={() => setOpenId(item.program.id)}
                        />
                      </li>
                    )
                  })}
                </ol>
                <Pagination page={page} pages={pages} onChange={goTo} label={t('training.pages')} />
              </section>

              {unrecognized.length > 0 && (
                <section aria-labelledby="unrecognized">
                  <SectionHeading id="unrecognized" title={t('training.unrecognizedTitle')} icon="info" />
                  <p className="-mt-2 mb-6 max-w-prose text-sm font-light text-copy">
                    {t('training.unrecognizedBody')}
                  </p>
                  <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {unrecognized.map((item) => (
                      <li key={item.program.id}>
                        <ProgramCard item={item} />
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              <PhotoCredits photos={programs.map((program) => program.image)} />

              <Dialog open={Boolean(open)} onClose={() => setOpenId(null)} title={open?.program.name ?? ''}>
                {open && <OpenProgram item={open} rank={byScore.indexOf(open) + 1} careerSlug={career} />}
              </Dialog>
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

/** Dark hero: the question the page answers (which career?), the numbers as pills and a photo of students. */
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
    <section className="overflow-hidden rounded-card bg-coal text-white">
      <div className="grid lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
        <div className="p-6 sm:p-10">
          <h1 className="text-3xl leading-tight font-extrabold sm:text-5xl">{t('training.title')}</h1>
          <p className="mt-4 max-w-md text-sm font-light text-white/80">{t('training.body')}</p>

          <label className="mt-8 block max-w-lg">
            <span className="block text-xs font-light text-white/70">{t('training.careerLabel')}</span>
            <span className="relative mt-2 block">
              <Icon
                name="briefcase"
                className="pointer-events-none absolute top-1/2 left-5 size-5 -translate-y-1/2 text-gold"
              />
              <select
                value={career ?? ''}
                onChange={(event) => onCareer(event.target.value)}
                className="h-14 w-full appearance-none rounded-full bg-white pr-12 pl-13 text-base text-night"
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
            </span>
          </label>

          <StatPills stats={stats} className="mt-6" />
        </div>

        <figure className="relative h-56 p-2 sm:h-72 lg:h-auto">
          <img
            src={heroSmall}
            srcSet={`${heroSmall} 800w, ${heroLarge} 1600w`}
            sizes="(min-width: 1024px) 45vw, 100vw"
            alt=""
            className="size-full rounded-2xl object-cover"
          />
          <figcaption className="absolute right-4 bottom-4 rounded-full bg-coal/75 px-3 py-1 text-xs font-light text-white/80">
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
      </div>
    </section>
  )
}

/**
 * The method, published next to the ranking: what counts and how much, as bars of the real share
 * (40% of the track for 40% of the score). Market data has no source yet, so its bar stays grey.
 */
function Method() {
  const { t } = useTranslation()
  return (
    <section aria-labelledby="method" className="rounded-card bg-surface p-6 shadow-card sm:p-8">
      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        <div>
          <SectionHeading id="method" title={t('training.howTitle')} icon="info" />
          <p className="max-w-prose text-sm font-light text-copy">{t('training.howBody')}</p>
        </div>
        <ul aria-label={t('training.criteriaList')} className="space-y-4">
          {CRITERIA.map((criterion) => {
            const soon = criterion.key === 'market'
            return (
              <li key={criterion.key}>
                <div className="mb-2 flex items-baseline justify-between gap-4 text-sm">
                  <span className="font-normal text-night">{t(`training.${criterion.key}`)}</span>
                  <span className={`font-semibold tabular-nums ${soon ? 'text-muted' : 'text-blue'}`}>
                    {formatPercent(criterion.weight)}
                  </span>
                </div>
                <span aria-hidden="true" className="block h-2 rounded-full bg-ash-100">
                  <span
                    className={`block h-full rounded-full ${soon ? 'bg-ash-300' : 'bg-blue'}`}
                    style={{ width: `${criterion.weight * 100}%` }}
                  />
                </span>
                {soon && <p className="mt-2 text-xs font-light text-muted">{t('training.marketSoon')}</p>}
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}

type OpenProgramProps = { item: ScoredProgram; rank: number; careerSlug: string | null }

/** With a career chosen, the popup also says which step of its path the course serves. */
function OpenProgram({ item, rank, careerSlug }: OpenProgramProps) {
  if (!careerSlug) return <ProgramSummary item={item} rank={rank} />
  return <ProgramForCareer item={item} rank={rank} slug={careerSlug} />
}

function ProgramForCareer({ item, rank, slug }: { item: ScoredProgram; rank: number; slug: string }) {
  const { data: career } = useCareer(slug)
  return <ProgramSummary item={item} career={career} rank={rank} />
}
