import { Fragment, useEffect, useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router'
import { GROUP_ICONS } from '../../components/groupIcons'
import { Icon, type IconName } from '../../components/icons'
import { PathMark } from '../../components/PathMark'
import { QueryState } from '../../components/QueryState'
import { ScoreBadge } from '../../components/ScoreBadge'
import { BarList } from '../../components/ui/BarList'
import { Button, ButtonLink } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Chip } from '../../components/ui/Chip'
import { Dialog } from '../../components/ui/Dialog'
import { Segmented } from '../../components/ui/Segmented'
import { TabPanel, Tabs } from '../../components/ui/Tabs'
import { useCareer, useCareers, useCvExamples, usePrograms } from '../../data/queries'
import { RIASEC_KEYS, type Career, type CareerSummary } from '../../data/types'
import { isStepDone, quickestPathway, remainingSteps } from '../../domain/education'
import { formatKz, formatPercent } from '../../domain/format'
import { rankPrograms, scorePrograms } from '../../domain/ranking'
import { rankDimensions } from '../../domain/riasec'
import { useDuration } from '../../lib/useFormat'
import { useUrlFilters } from '../../lib/useUrlFilters'
import { userActions, useUser } from '../../state/userStore'
import { CareerPath } from './CareerPath'
import { FitPanel } from './FitPanel'
import { SalaryBar, SalaryRange } from './SalaryRange'

const TABS = [
  { id: 'overview', icon: 'eye' },
  { id: 'traits', icon: 'user' },
  { id: 'asks', icon: 'briefcase' },
  { id: 'path', icon: 'path' },
  { id: 'study', icon: 'cap' },
  { id: 'market', icon: 'chart' },
  { id: 'cvs', icon: 'document' },
] as const satisfies readonly { id: string; icon: IconName }[]

type TabId = (typeof TABS)[number]['id']

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

function Section({
  id,
  title,
  icon,
  children,
}: {
  id: string
  title: string
  icon: IconName
  children: ReactNode
}) {
  return (
    <section aria-labelledby={`${id}-title`}>
      <h2
        id={`${id}-title`}
        className="flex items-center gap-3 text-2xl font-extrabold tracking-tight text-night sm:text-3xl"
      >
        <span className="grid size-10 shrink-0 place-items-center rounded-2xl border border-line bg-surface text-night">
          <Icon name={icon} className="size-5" />
        </span>
        {title}
      </h2>
      <span aria-hidden="true" className="mt-2 mb-6 ml-[3.25rem] block h-1 w-10 rounded-full bg-gold" />
      {children}
    </section>
  )
}

/** The second level under a section title: a small uppercase label and a thin rule. */
function Subheading({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <h3
      className={`mb-4 flex items-center gap-3 text-xs font-bold tracking-[0.14em] text-muted uppercase before:size-2 before:shrink-0 before:rotate-45 before:bg-gold after:h-px after:flex-1 after:bg-line ${className}`}
    >
      {children}
    </h3>
  )
}

/** Navy cells with big numbers: the few figures a section is about. */
function StatBlock({ items }: { items: { label: string; value: string }[] }) {
  return (
    <dl
      className={`grid gap-px overflow-hidden rounded-card ${items.length > 2 ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-2'}`}
    >
      {items.map((item) => (
        <div key={item.label} className="border-t-[3px] border-gold bg-night p-4 text-white sm:p-5">
          <dt className="text-xs font-semibold text-white/75">{item.label}</dt>
          <dd className="mt-1 font-display text-lg leading-tight font-bold sm:text-xl">{item.value}</dd>
        </div>
      ))}
    </dl>
  )
}

/**
 * Photo (or the brand path) at a fixed height, with the name and the two actions.
 * Next to the name, the area and the demand as icons; the "i" opens them in words.
 */
function CareerHero({ career, onFit }: { career: CareerSummary; onFit?: () => void }) {
  const { t } = useTranslation()
  const { savedCareers, targetCareer } = useUser()
  const [aboutOpen, setAboutOpen] = useState(false)
  const saved = savedCareers.includes(career.slug)
  const isTarget = targetCareer === career.slug
  const { image } = career
  const badge = 'ml-2 inline-grid size-8 place-items-center rounded-full align-[0.3em] ring-1'

  return (
    <header className="relative -mx-4 -mt-3 h-72 overflow-hidden bg-night text-white sm:h-80 lg:mx-0 lg:mt-0 lg:h-96 lg:rounded-card">
      {image ? (
        <img
          src={image.small}
          srcSet={`${image.small} 800w, ${image.large} 1600w`}
          sizes="100vw"
          alt={image.alt}
          fetchPriority="high"
          className="absolute inset-0 size-full object-cover object-[center_30%]"
        />
      ) : (
        <PathMark className="absolute -right-16 bottom-6 w-[30rem] max-w-none opacity-70" />
      )}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-linear-to-t from-night via-night/60 to-night/5"
      />
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-20 bg-linear-to-b from-night/70 to-transparent"
      />

      <Link
        to="/carreiras"
        className="absolute top-4 left-4 inline-flex items-center gap-1.5 rounded-full bg-night/60 px-3 py-1.5 text-sm font-semibold backdrop-blur-sm hover:bg-night lg:left-10"
      >
        <Icon name="arrowLeft" className="size-4" />
        {t('careers.title')}
      </Link>
      {image && (
        <a
          href={image.credit.url}
          target="_blank"
          rel="noreferrer"
          className="absolute top-5 right-4 max-w-[45%] truncate text-xs text-white/80 underline-offset-2 hover:underline lg:right-10"
        >
          {t('career.photoCredit', { author: image.credit.author, license: image.credit.license })}
        </a>
      )}

      <div className="absolute inset-x-0 bottom-0 px-4 pb-6 lg:px-10 lg:pb-8">
        <div className="max-w-3xl">
          <h1 className="inline text-[2rem] leading-[1.05] font-bold tracking-tight sm:text-5xl">
            {career.name}
          </h1>
          <span title={t(`groups.${career.group}`)} className={`${badge} bg-white/15 ring-white/40`}>
            <Icon name={GROUP_ICONS[career.group]} className="size-4" />
            <span className="sr-only">{t(`groups.${career.group}`)}</span>
          </span>
          <span title={t(`demand.${career.demand}`)} className={`${badge} bg-white/15 ring-white/40`}>
            <Icon name="signal" className="size-4" />
            <span className="sr-only">{t(`demand.${career.demand}`)}</span>
          </span>
          <button
            type="button"
            aria-haspopup="dialog"
            onClick={() => setAboutOpen(true)}
            className={`${badge} bg-white/15 ring-white/40 hover:bg-white/25`}
          >
            <Icon name="info" className="size-5" />
            <span className="sr-only">{t('career.about')}</span>
          </button>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            variant={isTarget ? 'onNavy' : 'ghost'}
            size="sm"
            aria-pressed={isTarget}
            onClick={() => userActions.setTarget(isTarget ? null : career.slug)}
            className={isTarget ? '' : 'text-white ring-1 ring-white/40 hover:bg-white/10'}
          >
            <Icon name="target" className="size-4" />
            {isTarget ? t('career.isTarget') : t('career.setTarget')}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            aria-pressed={saved}
            onClick={() => userActions.toggleSaved(career.slug)}
            className="text-white ring-1 ring-white/40 hover:bg-white/10"
          >
            <Icon name="bookmark" className={`size-4 ${saved ? 'fill-white' : ''}`} />
            {saved ? t('career.saved') : t('career.save')}
          </Button>
          {onFit && (
            <Button variant="accent" size="sm" onClick={onFit}>
              <Icon name="user" className="size-4" />
              {t('career.fitButton')}
            </Button>
          )}
        </div>
      </div>

      <Dialog open={aboutOpen} onClose={() => setAboutOpen(false)} title={career.name}>
        <div className="mb-3 flex flex-wrap gap-2">
          <Chip tone="night">
            <Icon name={GROUP_ICONS[career.group]} className="size-3.5" />
            {t(`groups.${career.group}`)}
          </Chip>
          <Chip tone={career.demand === 'alta' ? 'success' : 'neutral'}>
            <Icon name="signal" className="size-3.5" />
            {t(`demand.${career.demand}`)}
          </Chip>
        </div>
        <p className="text-lg text-night">{career.summary}</p>
      </Dialog>
    </header>
  )
}

const DEMAND_BARS: Record<Career['demand'], number> = { baixa: 1, media: 2, alta: 3 }

type FactProps = { icon: IconName; label: string; graphic: ReactNode; children: ReactNode }

/** One short row: label, a small drawing, and the value in words. */
function Fact({ icon, label, graphic, children }: FactProps) {
  return (
    <div className="grid grid-cols-[6.5rem_minmax(0,1fr)_auto] items-center gap-3 px-4 py-2.5 sm:grid-cols-[8rem_minmax(0,12rem)_auto] lg:flex lg:flex-col lg:items-stretch lg:rounded-card lg:bg-surface lg:p-5 lg:shadow-card">
      <dt className="flex items-center gap-2 text-sm font-semibold text-muted">
        <Icon name={icon} className="size-4 shrink-0 text-night" />
        {label}
      </dt>
      <dd aria-hidden="true" className="flex h-5 items-center lg:order-2 lg:h-6">
        {graphic}
      </dd>
      <dd className="text-right text-sm font-bold text-night lg:order-1 lg:text-left lg:font-display lg:text-2xl">
        {children}
      </dd>
    </div>
  )
}

/** Pay, demand and time to get there, one per row; the drawing is extra, the words say it all. */
function KeyFacts({ career }: { career: Career }) {
  const { t } = useTranslation()
  const duration = useDuration()
  const { profile } = useUser()
  const education = profile?.education ?? null
  const quickest = quickestPathway(career, education)
  const { salary, trendPct } = career.market
  const bars = DEMAND_BARS[career.demand]

  return (
    <dl className="divide-y divide-line rounded-card bg-surface shadow-card lg:grid lg:grid-cols-3 lg:gap-4 lg:divide-y-0 lg:bg-transparent lg:shadow-none">
      {career.salaryMedian !== null && (
        <Fact
          icon="wallet"
          label={t('career.factSalary')}
          graphic={salary && <SalaryBar salary={salary} small />}
        >
          {t('career.factSalaryValue', { value: Math.round(career.salaryMedian / 1000) })}
        </Fact>
      )}
      <Fact
        icon="signal"
        label={t('career.factMarket')}
        graphic={['h-1.5', 'h-3', 'h-5'].map((height, index) => (
          <span
            key={height}
            className={`mr-1 w-1.5 self-end rounded-sm ${height} ${index < bars ? 'bg-night' : 'bg-ash-100'}`}
          />
        ))}
      >
        <span className={trendPct >= 0 ? 'text-success' : 'text-coral'}>
          {t('career.factTrend', { value: `${trendPct > 0 ? '+' : ''}${trendPct}%` })}
        </span>
      </Fact>
      {quickest && (
        <Fact
          icon="clock"
          label={t('career.factTime')}
          // The quickest path as dots: done in green, ahead in night, the career as the gold flag.
          graphic={
            <>
              {quickest.pathway.steps.map((step, index) => {
                const done = isStepDone(step, education)
                return (
                  <Fragment key={step.title}>
                    {index > 0 && <span className={`h-0.5 flex-1 ${done ? 'bg-success' : 'bg-ash-100'}`} />}
                    <span className={`size-2.5 shrink-0 rounded-full ${done ? 'bg-success' : 'bg-night'}`} />
                  </Fragment>
                )
              })}
              <span className="h-0.5 w-1.5 bg-ash-100" />
              <span className="size-3 shrink-0 rotate-45 rounded-[2px] bg-gold" />
            </>
          }
        >
          {duration(quickest.months)}
        </Fact>
      )}
    </dl>
  )
}

function CareerView({ career }: { career: Career }) {
  const { t } = useTranslation()
  const [params, setParam] = useUrlFilters()
  const tabs = TABS.filter((tab) => tab.id !== 'asks' || career.employerAsks).map((tab) => ({
    id: tab.id,
    icon: tab.icon,
    label: t(`career.${tab.id}`),
  }))
  const active = tabs.find((tab) => tab.id === params.get('secao')) ?? tabs[0]
  const [fitOpen, setFitOpen] = useState(true)
  const showFit = () => {
    setFitOpen(true)
    document.getElementById('encaixe')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  useEffect(() => {
    userActions.visitCareer(career.slug)
  }, [career.slug])

  return (
    <article className="min-w-0">
      <CareerHero career={career} onFit={showFit} />
      <div className="mt-4">
        <KeyFacts career={career} />
      </div>
      <div className="sticky top-0 z-10 -mx-4 mt-4 bg-ash-100/95 px-4 py-3 backdrop-blur-sm lg:mx-0 lg:px-0">
        <Tabs
          label={t('career.sectionsLabel')}
          tabs={tabs}
          value={active?.id ?? 'overview'}
          onChange={(id) => setParam('secao', id === 'overview' ? null : id)}
          idPrefix="career"
        />
      </div>
      {active && (
        <TabPanel key={active.id} idPrefix="career" id={active.id} className="mt-5">
          <Panel tab={active.id} career={career} />
        </TabPanel>
      )}
      <div className="mt-10">
        <FitPanel career={career} expanded={fitOpen} onToggle={() => setFitOpen((value) => !value)} />
      </div>
    </article>
  )
}

function Panel({ tab, career }: { tab: TabId; career: Career }) {
  switch (tab) {
    case 'overview':
      return <Overview career={career} />
    case 'traits':
      return <Traits career={career} />
    case 'asks':
      return <Asks career={career} />
    case 'path':
      return <Path career={career} />
    case 'study':
      return <Study career={career} />
    case 'market':
      return <MarketSection career={career} />
    case 'cvs':
      return <ModelCvs career={career} />
  }
}

function Overview({ career }: { career: Career }) {
  const { t } = useTranslation()
  return (
    <Section id="overview" title={t('career.overview')} icon="eye">
      <p className="max-w-3xl text-xl leading-relaxed font-medium text-night">{career.description}</p>

      <Subheading className="mt-10">{t('career.dayToDay')}</Subheading>
      <ol className="grid gap-x-10 sm:grid-cols-2">
        {career.dayToDay.map((item, index) => (
          <li key={item} className="flex gap-4 border-b border-line py-4">
            <span
              aria-hidden="true"
              className="font-display text-3xl leading-none font-extrabold text-ash-300 tabular-nums"
            >
              {String(index + 1).padStart(2, '0')}
            </span>
            <span className="pt-1 text-copy">{item}</span>
          </li>
        ))}
      </ol>

      <Subheading className="mt-10">{t('career.workContext')}</Subheading>
      <StatBlock items={career.workContext} />
    </Section>
  )
}

function Traits({ career }: { career: Career }) {
  const { t } = useTranslation()
  const top = new Set(rankDimensions(career.riasec).slice(0, 3))
  return (
    <Section id="traits" title={t('career.traits')} icon="user">
      <Subheading>{t('career.workStyles')}</Subheading>
      <ul className="mb-10 grid gap-x-8 sm:grid-cols-2 lg:grid-cols-3">
        {career.workStyles.map((style) => (
          <li
            key={style}
            className="flex items-center gap-3 border-b border-line py-3 font-semibold text-night"
          >
            <span aria-hidden="true" className="size-2.5 shrink-0 rotate-45 bg-gold" />
            {style}
          </li>
        ))}
      </ul>
      <Subheading>{t('career.interests')}</Subheading>
      <BarList
        label={t('career.interests')}
        items={RIASEC_KEYS.map((key) => ({
          label: t(`riasec.${key}`),
          value: career.riasec[key],
          valueLabel: String(Math.round(career.riasec[key] * 100)),
          emphasized: top.has(key),
        }))}
      />
    </Section>
  )
}

function Asks({ career }: { career: Career }) {
  const { t } = useTranslation()
  const asks = career.employerAsks
  if (!asks) return null
  const skillName = (id: string) => career.skills.find((skill) => skill.id === id)?.name ?? id

  return (
    <Section id="asks" title={t('career.asks')} icon="briefcase">
      <StatBlock
        items={[
          { label: t('career.asksPostingsLabel'), value: String(asks.postings) },
          {
            label: t('career.asksYearsLabel'),
            value: t('career.asksYearsValue', { count: asks.experienceYearsMedian }),
          },
        ]}
      />
      <div className="mt-10 grid gap-10 lg:grid-cols-2">
        <div>
          <Subheading>{t('career.asksSkills')}</Subheading>
          <BarList
            label={t('career.asksSkills')}
            items={asks.skills.map((item, index) => ({
              label: skillName(item.skillId),
              value: item.share,
              valueLabel: formatPercent(item.share),
              emphasized: index < 3,
            }))}
          />
        </div>
        <div>
          <Subheading>{t('career.asksEducation')}</Subheading>
          <BarList
            label={t('career.asksEducation')}
            items={asks.education.map((item, index) => ({
              label: item.label,
              value: item.share,
              valueLabel: formatPercent(item.share),
              emphasized: index === 0,
            }))}
          />
          <Subheading className="mt-8">{t('career.asksCerts')}</Subheading>
          {asks.certifications.length === 0 ? (
            <p className="text-sm text-copy">{t('career.asksNoCerts')}</p>
          ) : (
            <ul className="text-sm text-copy">
              {asks.certifications.map((cert) => (
                <li key={cert.name}>
                  {cert.name}: {formatPercent(cert.share)}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <p className="mt-8 flex items-center gap-2 text-xs text-muted">
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
    <Section id="path" title={t('career.path')} icon="path">
      <Segmented
        label={t('career.pathways')}
        value={pathway.id}
        onChange={(value) => value && setPathwayId(value)}
        options={career.pathways.map((item) => ({ value: item.id, label: item.name }))}
      />
      <Card tone="gray" className="mt-4">
        <p className="text-copy">{pathway.summary}</p>
        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm font-semibold text-night">
          <span className="inline-flex items-center gap-1.5">
            <Icon name="clock" className="size-4" />
            {t('career.pathDuration', { value: duration(total) })}
          </span>
          {pathway.totalCost && (
            <span className="inline-flex items-center gap-1.5">
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

      <Subheading className="mt-10">{t('career.stagesTitle')}</Subheading>
      <ol className="grid gap-3 sm:grid-cols-2">
        {career.stages.map((stage, index) => (
          <li key={stage.level} className="rounded-2xl border-t-4 border-gold bg-ash-100 p-4">
            <p className="flex items-center gap-2 font-bold text-night">
              <span className="grid size-7 place-items-center rounded-full bg-night text-xs text-white">
                {index + 1}
              </span>
              {stage.title}
            </p>
            <p className="mt-1 text-xs font-semibold text-muted">
              {stage.years.max === null
                ? t('career.stageYearsOpen', { min: stage.years.min })
                : t('career.stageYears', { min: stage.years.min, max: stage.years.max })}
            </p>
            <ul className="mt-2 space-y-1 text-sm text-copy">
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
    <Section id="study" title={t('career.study')} icon="cap">
      <QueryState query={query}>
        {(programs) => {
          const forCareer = scorePrograms(programs).filter((item) =>
            item.program.careers.includes(career.slug),
          )
          const top = rankPrograms(forCareer, 'score').ranked.slice(0, 3)
          return (
            <>
              <h3 className="sr-only">{t('career.studyTitle')}</h3>
              <ol className="space-y-3">
                {top.map(({ program, score }) => (
                  <li key={program.id} className="flex items-center gap-3 rounded-2xl bg-ash-100 p-4">
                    <ScoreBadge score={score} />
                    <span className="min-w-0">
                      <span className="block font-semibold text-night">{program.name}</span>
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
    <Section id="market" title={t('career.market')} icon="chart">
      <Card tone="gray" className="space-y-5">
        {market.salary && <SalaryRange salary={market.salary} />}
        <p className="flex items-center gap-1.5 text-sm font-semibold text-success">
          <Icon name="signal" className="size-4" />
          {t('career.trend', { value: trend })}
        </p>
        <div>
          <Subheading>{t('career.sectors')}</Subheading>
          <ul className="flex flex-wrap gap-2">
            {market.hiringSectors.map((sector) => (
              <li key={sector}>
                <Chip tone="night">{sector}</Chip>
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
    <Section id="cvs" title={t('career.cvs')} icon="document">
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
                    className="flex items-center gap-3 rounded-2xl bg-ash-100 p-4 hover:bg-ash-100"
                  >
                    <span className="grid size-11 shrink-0 place-items-center rounded-xl border border-line bg-surface text-night">
                      <Icon name="document" className="size-6" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold text-night">{example.cv.headline}</span>
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
    <article className="min-w-0">
      <CareerHero career={career} />
      <Card tone="notice" className="mt-4 flex items-start gap-3">
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
      <p className="text-night">{t('careers.notFound')}</p>
      <ButtonLink to="/carreiras" variant="secondary" className="mt-4">
        {t('careers.title')}
      </ButtonLink>
    </div>
  )
}
