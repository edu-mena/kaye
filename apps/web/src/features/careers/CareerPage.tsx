import { useEffect, useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router'
import { GROUP_ICONS } from '../../components/groupIcons'
import { Icon } from '../../components/icons'
import { QueryState } from '../../components/QueryState'
import { ScoreBadge } from '../../components/ScoreBadge'
import { BarList } from '../../components/ui/BarList'
import { Button, ButtonLink } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Chip } from '../../components/ui/Chip'
import { PageHeader, SectionHeading } from '../../components/ui/PageHeader'
import { Segmented } from '../../components/ui/Segmented'
import { useCareer, useCareers, useCvExamples, usePrograms } from '../../data/queries'
import { RIASEC_KEYS, type Career, type CareerSummary } from '../../data/types'
import { remainingSteps } from '../../domain/education'
import { formatKz, formatPercent } from '../../domain/format'
import { rankPrograms, scorePrograms } from '../../domain/ranking'
import { rankDimensions } from '../../domain/riasec'
import { useDuration } from '../../lib/useFormat'
import { userActions, useUser } from '../../state/userStore'
import { CareerPath } from './CareerPath'
import { FitPanel } from './FitPanel'
import { SalaryRange } from './SalaryRange'

const SECTIONS = ['overview', 'traits', 'asks', 'path', 'study', 'market', 'cvs'] as const

export default function CareerPage() {
  const { slug = '' } = useParams()
  const detail = useCareer(slug)
  const list = useCareers()

  return (
    <QueryState query={detail}>
      {(career) => {
        if (career) return <CareerView career={career} />
        const summary = list.data?.find((item) => item.slug === slug)
        return summary ? <InCuration career={summary} /> : <NotFound />
      }}
    </QueryState>
  )
}

function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-20">
      <SectionHeading id={`${id}-title`} title={title} />
      {children}
    </section>
  )
}

function CareerHeader({ career }: { career: CareerSummary }) {
  const { t } = useTranslation()
  const { savedCareers, targetCareer } = useUser()
  const saved = savedCareers.includes(career.slug)
  const isTarget = targetCareer === career.slug

  return (
    <>
      <PageHeader
        title={career.name}
        subtitle={career.summary}
        back={{ to: '/carreiras', label: t('careers.title') }}
      />
      <div className="-mt-2 mb-6 flex flex-wrap items-center gap-2">
        <Chip>
          <Icon name={GROUP_ICONS[career.group]} className="size-3.5" />
          {t(`groups.${career.group}`)}
        </Chip>
        <Chip tone={career.demand === 'alta' ? 'success' : 'neutral'}>{t(`demand.${career.demand}`)}</Chip>
        <span className="ml-auto flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            aria-pressed={saved}
            onClick={() => userActions.toggleSaved(career.slug)}
          >
            <Icon name="bookmark" className={`size-4 ${saved ? 'fill-gold' : ''}`} />
            {saved ? t('career.saved') : t('career.save')}
          </Button>
          <Button
            variant={isTarget ? 'primary' : 'secondary'}
            size="sm"
            aria-pressed={isTarget}
            onClick={() => userActions.setTarget(isTarget ? null : career.slug)}
          >
            <Icon name="target" className="size-4" />
            {isTarget ? t('career.isTarget') : t('career.setTarget')}
          </Button>
        </span>
      </div>
    </>
  )
}

function CareerView({ career }: { career: Career }) {
  const { t } = useTranslation()

  useEffect(() => {
    userActions.visitCareer(career.slug)
  }, [career.slug])

  return (
    <article>
      <CareerHeader career={career} />
      <nav
        aria-label={t('career.sectionsLabel')}
        className="sticky top-0 z-10 -mx-4 mb-6 no-scrollbar flex gap-1 overflow-x-auto bg-paper/95 px-4 py-2 lg:mx-0 lg:px-0"
      >
        {SECTIONS.map((id) => (
          <a
            key={id}
            href={`#${id}`}
            className="shrink-0 rounded-full px-3 py-1.5 text-sm font-semibold text-navy hover:bg-navy-100"
          >
            {t(`career.${id}`)}
          </a>
        ))}
      </nav>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="lg:order-2">
          <div className="lg:sticky lg:top-16">
            <FitPanel career={career} />
          </div>
        </div>
        <div className="space-y-10 lg:order-1">
          <Overview career={career} />
          <Traits career={career} />
          <Asks career={career} />
          <Path career={career} />
          <Study career={career} />
          <MarketSection career={career} />
          <ModelCvs career={career} />
        </div>
      </div>
    </article>
  )
}

function Overview({ career }: { career: Career }) {
  const { t } = useTranslation()
  return (
    <Section id="overview" title={t('career.overview')}>
      <p className="max-w-prose text-navy">{career.description}</p>
      <h3 className="mt-5 mb-2 text-base font-semibold text-navy">{t('career.dayToDay')}</h3>
      <ul className="space-y-2">
        {career.dayToDay.map((item) => (
          <li key={item} className="flex gap-2 text-navy">
            <Icon name="check" className="mt-0.5 size-5 shrink-0 text-success" />
            {item}
          </li>
        ))}
      </ul>
      <dl className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {career.workContext.map((item) => (
          <div key={item.label} className="rounded-2xl bg-surface p-3 shadow-card">
            <dt className="text-xs font-semibold text-muted">{item.label}</dt>
            <dd className="mt-0.5 text-sm font-medium text-navy">{item.value}</dd>
          </div>
        ))}
      </dl>
    </Section>
  )
}

function Traits({ career }: { career: Career }) {
  const { t } = useTranslation()
  const top = new Set(rankDimensions(career.riasec).slice(0, 3))
  return (
    <Section id="traits" title={t('career.traits')}>
      <h3 className="mb-2 text-base font-semibold text-navy">{t('career.workStyles')}</h3>
      <ul className="mb-5 flex flex-wrap gap-2">
        {career.workStyles.map((style) => (
          <li key={style} className="rounded-full bg-gold-soft px-3 py-1 text-sm font-medium text-navy">
            {style}
          </li>
        ))}
      </ul>
      <Card>
        <BarList
          label={t('career.interests')}
          items={RIASEC_KEYS.map((key) => ({
            label: t(`riasec.${key}`),
            value: career.riasec[key],
            valueLabel: String(Math.round(career.riasec[key] * 100)),
            emphasized: top.has(key),
          }))}
        />
      </Card>
    </Section>
  )
}

function Asks({ career }: { career: Career }) {
  const { t } = useTranslation()
  const asks = career.employerAsks
  if (!asks) return null
  const skillName = (id: string) => career.skills.find((skill) => skill.id === id)?.name ?? id

  return (
    <Section id="asks" title={t('career.asks')}>
      <p className="mb-4 text-navy">{t('career.asksIntro', { count: asks.postings })}</p>
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <h3 className="mb-3 text-base font-semibold text-navy">{t('career.asksSkills')}</h3>
          <BarList
            label={t('career.asksSkills')}
            items={asks.skills.map((item, index) => ({
              label: skillName(item.skillId),
              value: item.share,
              valueLabel: formatPercent(item.share),
              emphasized: index < 3,
            }))}
          />
        </Card>
        <Card className="space-y-4">
          <div>
            <h3 className="mb-3 text-base font-semibold text-navy">{t('career.asksEducation')}</h3>
            <BarList
              label={t('career.asksEducation')}
              items={asks.education.map((item, index) => ({
                label: item.label,
                value: item.share,
                valueLabel: formatPercent(item.share),
                emphasized: index === 0,
              }))}
            />
          </div>
          <p className="flex items-center gap-2 font-semibold text-navy">
            <Icon name="briefcase" className="size-5" />
            {t('career.asksExperience', { count: asks.experienceYearsMedian })}
          </p>
          <div>
            <h3 className="mb-1 text-base font-semibold text-navy">{t('career.asksCerts')}</h3>
            {asks.certifications.length === 0 ? (
              <p className="text-sm text-muted">{t('career.asksNoCerts')}</p>
            ) : (
              <ul className="text-sm text-navy">
                {asks.certifications.map((cert) => (
                  <li key={cert.name}>
                    {cert.name}: {formatPercent(cert.share)}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Card>
      </div>
      <p className="mt-3 flex items-center gap-2 text-xs text-muted">
        <Icon name="info" className="size-4" />
        {t('career.asksSource')}
      </p>
    </Section>
  )
}

function Path({ career }: { career: Career }) {
  const { t } = useTranslation()
  const duration = useDuration()
  const { profile } = useUser()
  const [pathwayId, setPathwayId] = useState(career.pathways[0]?.id ?? '')
  const pathway = career.pathways.find((item) => item.id === pathwayId) ?? career.pathways[0]
  if (!pathway) return null

  // The whole path, from nothing: the same rule as the fit's "remaining steps".
  const total = remainingSteps(pathway, null).months

  return (
    <Section id="path" title={t('career.path')}>
      <Segmented
        label={t('career.pathways')}
        value={pathway.id}
        onChange={(value) => value && setPathwayId(value)}
        options={career.pathways.map((item) => ({ value: item.id, label: item.name }))}
      />
      <Card className="mt-4">
        <p className="text-navy">{pathway.summary}</p>
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm font-semibold text-navy">
          <span className="inline-flex items-center gap-1">
            <Icon name="clock" className="size-4" />
            {t('career.pathDuration', { value: duration(total) })}
          </span>
          {pathway.totalCost && (
            <span className="inline-flex items-center gap-1">
              <Icon name="wallet" className="size-4" />
              {t('career.pathCost', {
                min: formatKz(pathway.totalCost.min),
                max: formatKz(pathway.totalCost.max),
              })}
            </span>
          )}
        </div>
        <div className="mt-5">
          <CareerPath pathway={pathway} education={profile?.education ?? null} />
        </div>
      </Card>

      <h3 className="mt-8 mb-3 text-base font-semibold text-navy">{t('career.stagesTitle')}</h3>
      <ol className="grid gap-3 sm:grid-cols-2">
        {career.stages.map((stage, index) => (
          <li key={stage.level} className="rounded-2xl bg-surface p-4 shadow-card">
            <p className="flex items-center gap-2 font-display font-semibold text-navy">
              <span className="grid size-7 place-items-center rounded-full bg-navy text-xs text-gold">
                {index + 1}
              </span>
              {stage.title}
            </p>
            <p className="mt-1 text-xs font-semibold text-muted">
              {stage.years.max === null
                ? t('career.stageYearsOpen', { min: stage.years.min })
                : t('career.stageYears', { min: stage.years.min, max: stage.years.max })}
            </p>
            <ul className="mt-2 space-y-1 text-sm text-navy">
              {stage.responsibilities.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </Section>
  )
}

function Study({ career }: { career: Career }) {
  const { t } = useTranslation()
  const query = usePrograms()

  return (
    <Section id="study" title={t('career.study')}>
      <QueryState query={query}>
        {(programs) => {
          const forCareer = scorePrograms(programs).filter((item) =>
            item.program.careers.includes(career.slug),
          )
          const top = rankPrograms(forCareer, 'score').ranked.slice(0, 3)
          return (
            <>
              <h3 className="sr-only">{t('career.studyTitle')}</h3>
              <ol className="space-y-2">
                {top.map(({ program, score }) => (
                  <li
                    key={program.id}
                    className="flex items-center gap-3 rounded-2xl bg-surface p-3 shadow-card"
                  >
                    <ScoreBadge score={score} />
                    <span className="min-w-0">
                      <span className="block font-semibold text-navy">{program.name}</span>
                      <span className="block text-sm text-muted">
                        {program.institution.name} · {t(`training.${program.level}`)}
                      </span>
                    </span>
                  </li>
                ))}
              </ol>
              <ButtonLink to={`/formacao?carreira=${career.slug}`} variant="ghost" className="mt-2 -ml-3">
                {t('career.studyAll')}
                <Icon name="arrowRight" className="size-4" />
              </ButtonLink>
            </>
          )
        }}
      </QueryState>
    </Section>
  )
}

function MarketSection({ career }: { career: Career }) {
  const { t } = useTranslation()
  const { market } = career
  const trend = `${market.trendPct > 0 ? '+' : ''}${market.trendPct}%`

  return (
    <Section id="market" title={t('career.market')}>
      <Card className="space-y-5">
        {market.salary && <SalaryRange salary={market.salary} />}
        <p className="text-sm font-semibold text-navy">{t('career.trend', { value: trend })}</p>
        <div>
          <h3 className="mb-2 text-sm font-semibold text-muted">{t('career.sectors')}</h3>
          <ul className="flex flex-wrap gap-2">
            {market.hiringSectors.map((sector) => (
              <li key={sector}>
                <Chip>{sector}</Chip>
              </li>
            ))}
          </ul>
        </div>
      </Card>
    </Section>
  )
}

function ModelCvs({ career }: { career: Career }) {
  const { t } = useTranslation()
  const query = useCvExamples(career.slug)

  return (
    <Section id="cvs" title={t('career.cvs')}>
      <QueryState query={query}>
        {(examples) =>
          examples.length === 0 ? (
            <p className="text-muted">{t('career.cvsEmpty')}</p>
          ) : (
            <ul className="grid gap-3 sm:grid-cols-2">
              {examples.map((example) => (
                <li key={example.id}>
                  <Link
                    to={`/cv/modelos/${example.id}`}
                    className="flex items-center gap-3 rounded-2xl bg-surface p-4 shadow-card hover:shadow-lift"
                  >
                    <Icon name="document" className="size-8 text-navy" />
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold text-navy">{example.cv.headline}</span>
                      <span className="block text-sm text-muted">{t(`cv.${example.seniority}`)}</span>
                    </span>
                    <Icon name="chevronRight" className="size-5 text-muted" />
                  </Link>
                </li>
              ))}
            </ul>
          )
        }
      </QueryState>
    </Section>
  )
}

function InCuration({ career }: { career: CareerSummary }) {
  const { t } = useTranslation()
  return (
    <article>
      <CareerHeader career={career} />
      <Card tone="gold" className="flex items-start gap-3">
        <Icon name="pencil" className="mt-0.5 size-5 shrink-0" />
        <p>{t('career.curation')}</p>
      </Card>
    </article>
  )
}

function NotFound() {
  const { t } = useTranslation()
  return (
    <div className="py-10 text-center">
      <p className="text-navy">{t('careers.notFound')}</p>
      <ButtonLink to="/carreiras" variant="secondary" className="mt-4">
        {t('careers.title')}
      </ButtonLink>
    </div>
  )
}
