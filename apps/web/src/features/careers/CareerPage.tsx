import { useEffect, useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router'
import { GROUP_ICONS } from '../../components/groupIcons'
import { Icon, type IconName } from '../../components/icons'
import { PathMark } from '../../components/PathMark'
import { QueryState } from '../../components/QueryState'
import { ScoreRing } from '../../components/ScoreRing'
import { BarList } from '../../components/ui/BarList'
import { Button, ButtonLink } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Chip } from '../../components/ui/Chip'
import { Dialog } from '../../components/ui/Dialog'
import { Segmented } from '../../components/ui/Segmented'
import { TabPanel, Tabs } from '../../components/ui/Tabs'
import { useCareer, useCareers, useCvExamples, usePrograms } from '../../data/queries'
import { RIASEC_KEYS, type Career, type CareerSummary } from '../../data/types'
import { quickestPathway, remainingSteps } from '../../domain/education'
import { formatKz, formatPercent } from '../../domain/format'
import { rankPrograms, scorePrograms } from '../../domain/ranking'
import { rankDimensions } from '../../domain/riasec'
import { useDuration } from '../../lib/useFormat'
import { useUrlFilters } from '../../lib/useUrlFilters'
import { userActions, useUser } from '../../state/userStore'
import { ModelCvGrid } from '../cv/ModelCvGrid'
import { ProgramSummary } from '../training/ProgramSummary'
import { CareerPath } from './CareerPath'
import { FitPanel } from './FitPanel'
import { PostingsChart } from './PostingsChart'
import { SalaryRange } from './SalaryRange'

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
        className="mb-6 flex items-center gap-3 text-2xl font-extrabold text-night sm:text-3xl"
      >
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-blue text-white">
          <Icon name={icon} className="size-5" />
        </span>
        {title}
      </h2>
      {children}
    </section>
  )
}

/** The second level under a section title: a small label and a thin rule. */
function Subheading({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <h3
      className={`mb-4 flex items-center gap-3 text-sm font-semibold text-night after:h-px after:flex-1 after:bg-line ${className}`}
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
        <div key={item.label} className="bg-coal p-4 text-white sm:p-5">
          <dt className="text-xs font-light text-white/75">{item.label}</dt>
          <dd className="mt-1 text-sm leading-snug font-normal">{item.value}</dd>
        </div>
      ))}
    </dl>
  )
}

/**
 * Photo (or the brand path) at a fixed height, with the name and the two actions.
 * Next to the name, the area and the demand as icons; the "i" opens them in words.
 */
type CareerHeroProps = { career: CareerSummary; facts?: ReactNode; onFit?: () => void }

function CareerHero({ career, facts, onFit }: CareerHeroProps) {
  const { t } = useTranslation()
  const { savedCareers, targetCareer } = useUser()
  const [aboutOpen, setAboutOpen] = useState(false)
  const saved = savedCareers.includes(career.slug)
  const isTarget = targetCareer === career.slug
  const { image } = career
  const badge = 'ml-2 inline-grid size-8 place-items-center rounded-full align-[0.3em] ring-1'

  return (
    <header className="relative h-72 overflow-hidden rounded-card bg-night text-white sm:h-80 lg:h-96">
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
        className="absolute top-4 left-4 inline-flex items-center gap-1.5 rounded-full bg-coal/85 px-3 py-1.5 text-sm font-light backdrop-blur-sm hover:bg-coal lg:left-10"
      >
        <Icon name="arrowLeft" className="size-4" />
        {t('careers.title')}
      </Link>

      <div className="absolute inset-x-0 bottom-0 px-4 pb-6 lg:px-10 lg:pb-8">
        <div className="max-w-3xl">
          <h1 className="inline text-[2rem] leading-[1.05] font-bold sm:text-5xl">{career.name}</h1>
          <span title={t(`groups.${career.group}`)} className={`${badge} bg-coal text-white ring-white/15`}>
            <Icon name={GROUP_ICONS[career.group]} className="size-4" />
            <span className="sr-only">{t(`groups.${career.group}`)}</span>
          </span>
          <span title={t(`demand.${career.demand}`)} className={`${badge} bg-coal text-white ring-white/15`}>
            <Icon name="signal" className="size-4" />
            <span className="sr-only">{t(`demand.${career.demand}`)}</span>
          </span>
          <button
            type="button"
            aria-haspopup="dialog"
            onClick={() => setAboutOpen(true)}
            className={`${badge} bg-coal text-white ring-white/15 hover:bg-night`}
          >
            <Icon name="info" className="size-5" />
            <span className="sr-only">{t('career.about')}</span>
          </button>
        </div>
        {facts}
        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            size="sm"
            aria-pressed={isTarget}
            onClick={() => userActions.setTarget(isTarget ? null : career.slug)}
          >
            <Icon name={isTarget ? 'check' : 'target'} className="size-4" />
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
            <Button
              variant="ghost"
              size="sm"
              onClick={onFit}
              className="bg-coal text-white ring-1 ring-white/15 hover:bg-night"
            >
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
        <p className="text-sm leading-relaxed font-light text-copy">{career.summary}</p>
      </Dialog>
    </header>
  )
}

/** Pay, demand and time to get there, as one line in the hero: the first three answers, no extra block. */
function HeroFacts({ career }: { career: Career }) {
  const { t } = useTranslation()
  const duration = useDuration()
  const { profile } = useUser()
  const quickest = quickestPathway(career, profile?.education ?? null)
  const { trendPct } = career.market
  const facts: { icon: IconName; text: string; label?: string }[] = []
  if (career.salaryMedian !== null) {
    facts.push({
      icon: 'wallet',
      label: t('career.factSalary'),
      text: t('career.factSalaryValue', { value: Math.round(career.salaryMedian / 1000) }),
    })
  }
  facts.push({
    icon: 'signal',
    text: t('career.factDemand', { value: `${trendPct > 0 ? '+' : ''}${trendPct}%` }),
  })
  if (quickest)
    facts.push({ icon: 'clock', text: t('career.factTime', { value: duration(quickest.months) }) })

  return (
    <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-sm font-light text-white">
      {facts.map((fact) => (
        <li key={fact.icon} className="flex items-center gap-1.5">
          <Icon name={fact.icon} className="size-4 shrink-0 text-white" />
          {fact.label && <span className="sr-only">{fact.label}: </span>}
          {fact.text}
        </li>
      ))}
    </ul>
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
      <CareerHero career={career} facts={<HeroFacts career={career} />} onFit={showFit} />
      <div className="sticky top-[var(--topbar-space,0px)] z-10 mt-4 rounded-card bg-surface p-2 shadow-card transition-[top] duration-300">
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
      <p className="max-w-3xl text-sm leading-relaxed font-light text-copy">{career.description}</p>

      <Subheading className="mt-10">{t('career.dayToDay')}</Subheading>
      <ol className="grid gap-x-10 sm:grid-cols-2">
        {career.dayToDay.map((item, index) => (
          <li key={item} className="flex gap-4 border-b border-line py-4">
            <span
              aria-hidden="true"
              className="font-display text-3xl leading-none font-extrabold text-blue tabular-nums"
            >
              {String(index + 1).padStart(2, '0')}
            </span>
            <span className="pt-1 text-sm font-light text-copy">{item}</span>
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
            className="flex items-center gap-3 border-b border-line py-3 text-sm font-light text-night"
          >
            <Icon name="check" className="size-4 shrink-0 text-blue" />
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
            accentLabels
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
            <p className="text-sm font-light text-copy">{t('career.asksNoCerts')}</p>
          ) : (
            <ul className="text-sm font-light text-copy">
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
        <p className="text-sm font-light text-copy">{pathway.summary}</p>
        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm font-normal text-night">
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
        <p className="mt-4 text-xs font-light text-muted">{t('career.needLegend')}</p>
        <div className="mt-5">
          <CareerPath pathway={pathway} education={profile?.education ?? null} />
        </div>
      </Card>

      <Subheading className="mt-10">{t('career.stagesTitle')}</Subheading>
      <ol className="grid gap-3 sm:grid-cols-2">
        {career.stages.map((stage, index) => (
          <li key={stage.level} className="rounded-2xl bg-ash-100 p-4">
            <p className="flex items-center gap-2 text-sm font-normal text-night">
              <span className="grid size-7 place-items-center rounded-full bg-night text-xs text-white">
                {index + 1}
              </span>
              {stage.title}
            </p>
            <p className="mt-1 text-xs font-light text-muted">
              {stage.years.max === null
                ? t('career.stageYearsOpen', { min: stage.years.min })
                : t('career.stageYears', { min: stage.years.min, max: stage.years.max })}
            </p>
            <ul className="mt-2 space-y-1 text-sm font-light text-copy">
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
  const duration = useDuration()
  const query = usePrograms()
  const [openId, setOpenId] = useState<string | null>(null)

  return (
    <Section id="study" title={t('career.study')} icon="cap">
      <QueryState query={query}>
        {(programs) => {
          const forCareer = scorePrograms(programs).filter((item) =>
            item.program.careers.includes(career.slug),
          )
          const top = rankPrograms(forCareer, 'score').ranked.slice(0, 3)
          const open = top.find((item) => item.program.id === openId)
          return (
            <>
              <Subheading>{t('career.studyTitle')}</Subheading>
              <ol className="space-y-3">
                {top.map((item, index) => {
                  const { program } = item
                  return (
                    <li key={program.id}>
                      <button
                        type="button"
                        onClick={() => setOpenId(program.id)}
                        className={`group flex w-full items-center gap-4 rounded-2xl border bg-surface p-4 text-left transition duration-300 hover:-translate-y-0.5 hover:shadow-card ${index === 0 ? 'border-night' : 'border-line hover:border-ash-300'}`}
                      >
                        <span
                          aria-hidden="true"
                          className={`grid size-9 shrink-0 place-items-center rounded-full bg-coal font-display text-sm font-bold ${index === 0 ? 'text-gold' : 'text-white'}`}
                        >
                          {index + 1}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex flex-wrap items-center gap-2 text-base font-semibold text-night">
                            {program.name}
                            {index === 0 && <Chip tone="night">{t('career.studyBest')}</Chip>}
                          </span>
                          <span className="mt-1 block text-xs font-light text-muted">
                            {program.institution.name} · {program.institution.province}
                          </span>
                          <span className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs font-light text-muted">
                            <span className="inline-flex items-center gap-1">
                              <Icon name="cap" className="size-3.5" />
                              {t(`training.${program.level}`)}
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <Icon name="clock" className="size-3.5" />
                              {duration({ min: program.durationMonths, max: program.durationMonths })}
                            </span>
                            {program.totalCost !== null && (
                              <span className="inline-flex items-center gap-1">
                                <Icon name="wallet" className="size-3.5" />
                                {formatKz(program.totalCost)}
                              </span>
                            )}
                          </span>
                        </span>
                        <ScoreRing score={item.score} />
                        <Icon
                          name="chevronRight"
                          className="size-5 shrink-0 text-muted transition group-hover:translate-x-0.5"
                        />
                      </button>
                    </li>
                  )
                })}
              </ol>
              <ButtonLink to={`/cursos?carreira=${career.slug}`} variant="ghost" className="mt-3 -ml-3">
                {t('career.studyAll')}
                <Icon name="arrowRight" className="size-4" />
              </ButtonLink>
              <Dialog open={Boolean(open)} onClose={() => setOpenId(null)} title={open?.program.name ?? ''}>
                {open && <ProgramSummary item={open} career={career} rank={top.indexOf(open) + 1} />}
              </Dialog>
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
  const topStage = Math.max(...market.salaryByStage.map((item) => item.median), 1)
  const stageTitle = (level: string) => career.stages.find((stage) => stage.level === level)?.title ?? level

  return (
    <Section id="market" title={t('career.market')} icon="chart">
      {market.salary && (
        <>
          <Subheading>{t('career.salaryTitle')}</Subheading>
          <SalaryRange salary={market.salary} />
        </>
      )}

      <div className="mt-10 grid gap-10 lg:grid-cols-2">
        {market.salaryByStage.length > 0 && (
          <div>
            <Subheading>{t('career.stageSalaryTitle')}</Subheading>
            <BarList
              label={t('career.stageSalaryList')}
              items={market.salaryByStage.map((item) => ({
                label: stageTitle(item.level),
                value: item.median / topStage,
                valueLabel: formatKz(item.median),
                emphasized: true,
              }))}
            />
          </div>
        )}
        <div>
          <Subheading>{t('career.demandTitle')}</Subheading>
          <p className="mb-5 flex items-center gap-1.5 text-sm font-normal text-success">
            <Icon name="signal" className="size-4" />
            {t('career.trend', { value: trend })}
          </p>
          <PostingsChart months={market.postingsByMonth} />
        </div>
      </div>

      <Subheading className="mt-10">{t('career.sectors')}</Subheading>
      <ul className="flex flex-wrap gap-2">
        {market.hiringSectors.map((sector) => (
          <li key={sector}>
            <Chip tone="night">{sector}</Chip>
          </li>
        ))}
      </ul>
    </Section>
  )
}

function ModelCvs({ career }: { career: Career }) {
  const { t } = useTranslation()
  const query = useCvExamples(career.slug)
  const pathwayName = (id: string) => career.pathways.find((pathway) => pathway.id === id)?.name ?? ''

  return (
    <Section id="cvs" title={t('career.cvs')} icon="document">
      <QueryState query={query}>
        {(examples) =>
          examples.length === 0 ? (
            <p className="text-sm font-light text-muted">{t('career.cvsEmpty')}</p>
          ) : (
            <>
              <p className="mb-5 text-sm font-light text-copy">{t('career.cvsIntro')}</p>
              <ModelCvGrid examples={examples} name={(example) => pathwayName(example.pathwayId)} />
            </>
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
