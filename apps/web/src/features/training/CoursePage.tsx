import { useTranslation } from 'react-i18next'
import { Link, useParams, useSearchParams } from 'react-router'
import { CareerCard } from '../../components/CareerCard'
import { Icon } from '../../components/icons'
import { PhotoCredits } from '../../components/PhotoCredits'
import { QueryState } from '../../components/QueryState'
import { ScoreRing } from '../../components/ScoreRing'
import { ButtonLink } from '../../components/ui/Button'
import { SectionHeading } from '../../components/ui/PageHeader'
import { useCareer, useCareers, usePrograms } from '../../data/queries'
import { rankPrograms, scorePrograms, type ScoredProgram } from '../../domain/ranking'
import { CompareButton } from './ProgramCard'
import { ProgramSummary } from './ProgramSummary'

/**
 * A course's own page: a photo hero with the name, the score and "Comparar"; the course in full
 * (the same summary as the career page's popup); and the careers it leads to. Opened from the
 * eye on each course card; with ?carreira= it also says which step of that career it serves.
 */
export default function CoursePage() {
  const { t } = useTranslation()
  const { id = '' } = useParams()
  const [params] = useSearchParams()
  const careerSlug = params.get('carreira')
  const programsQuery = usePrograms()
  const { data: careers = [] } = useCareers()
  const back = `/cursos${careerSlug ? `?carreira=${careerSlug}` : ''}`

  return (
    <QueryState query={programsQuery}>
      {(programs) => {
        // Scored against the whole catalogue, so the score and place match the Cursos page.
        const scored = scorePrograms(programs)
        const item = scored.find((candidate) => candidate.program.id === id)
        if (!item) {
          return (
            <div className="rounded-card bg-surface p-10 text-center shadow-card">
              <p className="text-sm font-light text-copy">{t('training.notFound')}</p>
              <ButtonLink to="/cursos" variant="secondary" size="sm" className="mt-6">
                <Icon name="arrowLeft" className="size-4" />
                {t('training.back')}
              </ButtonLink>
            </div>
          )
        }
        const rank = item.program.recognized
          ? rankPrograms(scored, 'score').ranked.indexOf(item) + 1
          : undefined
        const leadsTo = careers.filter((career) => item.program.careers.includes(career.slug))

        return (
          <div className="space-y-10">
            <Hero item={item} back={back} />
            <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] lg:items-start">
              <section
                aria-labelledby="course-about"
                className="rounded-card bg-surface p-6 shadow-card sm:p-8"
              >
                <h2 id="course-about" className="sr-only">
                  {t('training.aboutCourse')}
                </h2>
                {careerSlug ? (
                  <SummaryForCareer item={item} rank={rank} slug={careerSlug} />
                ) : (
                  <ProgramSummary item={item} rank={rank} onPage />
                )}
              </section>
              {leadsTo.length > 0 && (
                <section aria-labelledby="course-careers">
                  <SectionHeading id="course-careers" title={t('training.leadsTo')} icon="briefcase" />
                  <ul className="grid grid-cols-2 gap-3 lg:grid-cols-1">
                    {leadsTo.map((career) => (
                      <li key={career.slug}>
                        <CareerCard career={career} brief />
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </div>
            <PhotoCredits photos={[item.program.image]} />
          </div>
        )
      }}
    </QueryState>
  )
}

/** The course photo under a dark gradient: the way back, the level and institution, the name, the score. */
function Hero({ item, back }: { item: ScoredProgram; back: string }) {
  const { t } = useTranslation()
  const { program, score } = item
  return (
    <section className="relative isolate overflow-hidden rounded-card bg-coal text-white">
      {program.image && (
        <img
          src={program.image.small}
          srcSet={`${program.image.small} 800w, ${program.image.large} 1600w`}
          sizes="100vw"
          alt={program.image.alt}
          className="absolute inset-0 -z-10 size-full object-cover"
        />
      )}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-linear-to-t from-coal via-coal/75 to-coal/20"
      />
      <div className="flex min-h-72 flex-col justify-between gap-10 p-6 sm:p-10 lg:min-h-96">
        <Link
          to={back}
          className="inline-flex w-fit items-center gap-2 rounded-full bg-coal/70 px-4 py-2 text-sm font-light hover:bg-coal"
        >
          <Icon name="arrowLeft" className="size-4" />
          {t('training.back')}
        </Link>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl">
            <p className="text-sm font-light text-white/80">
              {t(`training.${program.level}`)} · {program.institution.name}
            </p>
            <h1 className="mt-2 text-3xl leading-tight font-extrabold sm:text-5xl">{program.name}</h1>
          </div>
          <div className="flex items-center gap-4">
            {program.recognized && <ScoreRing score={score} size="lg" tone="dark" />}
            <CompareButton programId={program.id} tone="dark" />
          </div>
        </div>
      </div>
    </section>
  )
}

function SummaryForCareer({ item, rank, slug }: { item: ScoredProgram; rank?: number; slug: string }) {
  const { data: career } = useCareer(slug)
  return <ProgramSummary item={item} career={career} rank={rank} onPage />
}
