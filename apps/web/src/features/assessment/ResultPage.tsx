import { useTranslation } from 'react-i18next'
import { Navigate } from 'react-router'
import { CareerCard } from '../../components/CareerCard'
import { BarList } from '../../components/ui/BarList'
import { ButtonLink } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Hexagon } from '../../components/ui/Hexagon'
import { SectionHeading } from '../../components/ui/PageHeader'
import { rankDimensions, riasecCode } from '../../domain/riasec'
import { stagger } from '../../lib/ui'
import { useRecommendations } from '../../lib/useRecommendations'
import { useRiasecProfile } from '../../state/useRiasecProfile'

export default function ResultPage() {
  const { t } = useTranslation()
  const { profile, completed } = useRiasecProfile()
  const recommendations = useRecommendations()

  if (!completed) return <Navigate to="/teste" replace />
  if (!profile) return null

  const ranked = rankDimensions(profile)
  const top = ranked.slice(0, 3)
  const code = riasecCode(profile)

  return (
    <div className="space-y-10">
      <header className="flex rise flex-col items-start gap-5 sm:flex-row sm:items-center">
        <Hexagon size="lg">{code}</Hexagon>
        <div>
          <h1 className="text-3xl leading-tight font-extrabold text-night sm:text-4xl">
            {t('assessment.resultTitle', { code })}
          </h1>
          <p className="mt-2 text-sm font-light text-copy">{t('assessment.resultBody')}</p>
        </div>
      </header>

      <section aria-labelledby="top-dimensions" className="space-y-3">
        <h2 id="top-dimensions" className="sr-only">
          {t('assessment.resultBody')}
        </h2>
        <ol className="grid gap-4 sm:grid-cols-3">
          {top.map((key, index) => (
            <li key={key} className="rise" style={stagger(index + 1)}>
              <Card className="h-full p-6">
                <span className="flex items-center gap-3">
                  <Hexagon size="sm" tone={index === 0 ? 'dark' : 'gold'}>
                    {key}
                  </Hexagon>
                  <span className="text-base font-semibold text-night">{t(`riasec.${key}`)}</span>
                </span>
                <p className="mt-2 text-xs font-light text-muted">{t(`riasec.${key}Body`)}</p>
              </Card>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="all-dimensions">
        <SectionHeading id="all-dimensions" title={t('assessment.scoresLabel')} icon="chart" />
        <Card>
          <BarList
            label={t('assessment.scoresLabel')}
            items={ranked.map((key) => ({
              label: t(`riasec.${key}`),
              value: profile[key],
              valueLabel: String(Math.round(profile[key] * 100)),
              emphasized: top.includes(key),
            }))}
          />
        </Card>
      </section>

      <section aria-labelledby="recommendations">
        <SectionHeading id="recommendations" title={t('assessment.recommendations')} icon="compass" />
        <ul className="grid gap-4 lg:grid-cols-2">
          {recommendations?.map((item, index) => (
            <li key={item.career.slug} className="rise" style={stagger(index)}>
              <CareerCard career={item.career} match={item.match} reasons={item.reasons} />
            </li>
          ))}
        </ul>
        <p className="mt-4 text-xs font-light text-muted">{t('assessment.otherArea')}</p>
      </section>

      <ButtonLink to="/teste" variant="secondary">
        {t('assessment.restart')}
      </ButtonLink>
    </div>
  )
}
