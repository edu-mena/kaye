import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { CareerCard } from '../../components/CareerCard'
import { Icon } from '../../components/icons'
import { Card } from '../../components/ui/Card'
import { SectionHeading } from '../../components/ui/PageHeader'
import { SIMULATIONS } from '../../data/demo/simulations'
import { useAssessment, useCareerDetails } from '../../data/queries'
import { GROUP_AREAS, type Career, type MarketArea, type RiasecProfile } from '../../data/types'
import { evidenceFor, nextStep, whyDimension } from '../../domain/resultAdvice'
import { simulationsOf } from '../../domain/simulations'
import { stagger } from '../../lib/ui'
import type { RecommendedCareer } from '../../lib/useRecommendations'
import { useUser } from '../../state/userStore'

const MAX_AREAS = 3

type Props = { profile: RiasecProfile; recommendations: RecommendedCareer[] | null }

/**
 * The result in plain words: why each area (what the person said in the test), then the 3 to 5 careers, each with
 * the next step on its easiest way in. The same careers feed the lists that show what matters to the person
 * (`useInterestProfile`).
 */
export function ResultCareers({ profile, recommendations }: Props) {
  const { t } = useTranslation()
  const { answers, choices } = useUser()
  const { data: questions = [] } = useAssessment()
  const list = recommendations ?? []
  const { data: details } = useCareerDetails(
    list.filter((item) => item.career.detailed).map((item) => item.career.slug),
  )

  // Each area once, in the order of the recommendations, with the career that brought it.
  const areas = new Map<MarketArea, RecommendedCareer>()
  for (const item of list) {
    const area = GROUP_AREAS[item.career.group]
    if (!areas.has(area)) areas.set(area, item)
  }

  return (
    <>
      <section aria-labelledby="why-areas">
        <SectionHeading id="why-areas" title={t('assessment.whyTitle')} icon="compass" />
        <p className="-mt-2 mb-4 text-sm font-light text-copy">{t('assessment.whyBody')}</p>
        <ul className="grid gap-4 md:grid-cols-3">
          {[...areas.entries()].slice(0, MAX_AREAS).map(([area, item], index) => {
            const dimension = whyDimension(profile, item.career)
            const evidence = evidenceFor(dimension, questions, answers, choices)
            return (
              <li key={area} className="rise" style={stagger(index)}>
                <Card className="h-full p-6">
                  <h3 className="text-base font-semibold text-night">
                    {t('assessment.whyArea', {
                      area: t(`market.area_${area}`),
                      dimension: t(`riasec.${dimension}`),
                    })}
                  </h3>
                  <ul className="mt-3 space-y-2">
                    {evidence.map((entry) => (
                      <li key={`${entry.kind}-${entry.text}`} className="text-sm font-light text-copy">
                        {t(entry.kind === 'liked' ? 'assessment.whyLiked' : 'assessment.whyPicked', {
                          text: entry.text,
                        })}
                      </li>
                    ))}
                  </ul>
                </Card>
              </li>
            )
          })}
        </ul>
      </section>

      <section aria-labelledby="recommendations">
        <SectionHeading id="recommendations" title={t('assessment.recommendations')} icon="compass" />
        <p className="-mt-2 mb-4 text-sm font-light text-copy">{t('assessment.recommendationsBody')}</p>
        <ul className="grid gap-4 lg:grid-cols-2">
          {list.map((item, index) => (
            <li key={item.career.slug} className="flex rise flex-col gap-2" style={stagger(index)}>
              <CareerCard career={item.career} match={item.match} reasons={item.reasons} />
              <NextStep
                slug={item.career.slug}
                career={details.find((career) => career.slug === item.career.slug)}
              />
              {simulationsOf(SIMULATIONS, item.career.slug).map((simulation) => (
                <Link
                  key={simulation.id}
                  to={`/simulacoes/${simulation.id}`}
                  className="flex items-center gap-3 rounded-2xl border border-line bg-surface px-4 py-3 text-sm font-semibold text-night hover:border-ash-300 hover:bg-ash-100"
                >
                  <Icon name="play" className="size-4 shrink-0 text-blue" />
                  {t('simulations.careerTitle', { career: item.career.name })}
                </Link>
              ))}
            </li>
          ))}
        </ul>
      </section>
    </>
  )
}

/** "O teu próximo passo": the first thing to do on the easiest way in, and the road to the whole path. */
function NextStep({ slug, career }: { slug: string; career: Career | undefined }) {
  const { t } = useTranslation()
  const step = career ? nextStep(career) : null
  return (
    <Link
      to={`/carreiras/${slug}`}
      className="flex items-start gap-3 rounded-2xl border border-line bg-surface px-4 py-3 text-sm text-night hover:border-ash-300 hover:bg-ash-100"
    >
      <Icon name="path" className="mt-0.5 size-4 shrink-0 text-blue" />
      <span className="min-w-0">
        <span className="block text-xs font-light text-muted">{t('assessment.nextStep')}</span>
        <span className="block font-semibold">
          {step
            ? t(`assessment.nextStep_${step.kind}`, { title: step.title })
            : t('assessment.nextStepGeneric')}
        </span>
        <span className="mt-1 block text-xs font-normal text-blue">{t('assessment.nextStepOpen')}</span>
      </span>
    </Link>
  )
}
