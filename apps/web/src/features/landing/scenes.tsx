import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { DemandMeter } from '../../components/DemandMeter'
import { GROUP_ICONS } from '../../components/groupIcons'
import { Icon, type IconName } from '../../components/icons'
import { PathMark } from '../../components/PathMark'
import { PhotoImg } from '../../components/PhotoImg'
import { ScoreRing } from '../../components/ScoreRing'
import { BarList } from '../../components/ui/BarList'
import { Chip } from '../../components/ui/Chip'
import { Hexagon } from '../../components/ui/Hexagon'
import { useAcademies, useCompanies, useCourses } from '../../data/queries'
import type { CareerSummary, RiasecKey } from '../../data/types'
import { areaCounts } from '../../domain/discovery'
import { formatKz } from '../../domain/format'
import { Guide } from '../onboarding/Guide'

/*
 * The landing page's pictures are the app's own pieces (cards, the hexagon, the score ring, the
 * bars, the path from the logo) in the app's colours: what the visitor sees is what they get.
 * All decorative: the texts around them say what they mean.
 */

/** A grey line standing for text, as in a wireframe. */
function TextLine({ width, tone = 'bg-ash-200' }: { width: string; tone?: string }) {
  return <span className={`block h-2 rounded-full ${width} ${tone}`} />
}

/** The career the pictures show: a real one from the catalogue, with a photo and a salary. */
const showcase = (careers: CareerSummary[]) =>
  careers.find((career) => career.detailed && career.image && career.salaryMedian !== null) ?? careers[0]

function CareerMock({ career }: { career: CareerSummary | undefined }) {
  const { t } = useTranslation()

  return (
    <div className="overflow-hidden rounded-card bg-surface shadow-lift">
      <div className="relative h-28 bg-coal">
        {career?.image && <PhotoImg photo={career.image} sizes="16rem" className="size-full object-cover" />}
        {career && (
          <span className="absolute bottom-3 left-3 grid size-9 place-items-center rounded-full bg-coal text-gold">
            <Icon name={GROUP_ICONS[career.group]} className="size-4" />
          </span>
        )}
      </div>
      <div className="p-4">
        <span className="block truncate text-sm font-semibold text-night">{career?.name}</span>
        <span className="block truncate text-xs font-light text-muted">
          {career && t(`groups.${career.group}`)}
        </span>
        <span className="mt-3 flex items-end justify-between gap-3 border-t border-line pt-3">
          <span className="text-sm font-semibold whitespace-nowrap text-night">
            {career?.salaryMedian ? t('careers.perMonth', { value: formatKz(career.salaryMedian) }) : '—'}
          </span>
          <DemandMeter demand={career?.demand ?? 'alta'} />
        </span>
      </div>
    </div>
  )
}

/**
 * The opening picture: the dark card of the path from the logo, the guide at its start, and over it
 * a career and a course as the app shows them.
 */
export function HeroScene({ careers }: { careers: CareerSummary[] }) {
  return (
    <div aria-hidden="true" className="relative mx-auto aspect-[1/1] w-full max-w-lg sm:aspect-[6/5]">
      <div className="absolute inset-y-6 right-6 left-0 overflow-hidden rounded-card bg-coal">
        <div className="flex items-center gap-3 p-6">
          <Hexagon tone="gold">IAS</Hexagon>
          <span className="w-1/4 space-y-2">
            <TextLine width="w-full" tone="bg-white/70" />
            <TextLine width="w-2/3" tone="bg-white/25" />
          </span>
        </div>
        <PathMark className="absolute right-[30%] bottom-[18%] left-16" />
        <span className="absolute bottom-[14%] left-4 grid size-20 place-items-center rounded-full bg-white">
          <Guide size="sm" />
        </span>
      </div>

      <div className="absolute top-0 right-0 w-52 rotate-2 sm:w-64">
        <CareerMock career={showcase(careers)} />
      </div>

      <div className="absolute right-2 bottom-0 flex w-56 -rotate-2 items-center gap-3 rounded-card bg-surface p-4 shadow-lift sm:right-10">
        <ScoreRing score={87} />
        <span className="min-w-0 flex-1 space-y-2">
          <TextLine width="w-full" tone="bg-night" />
          <TextLine width="w-2/3" />
        </span>
      </div>
    </div>
  )
}

type ScenePanelProps = { dark?: boolean; children: ReactNode }

/** Where the picture of a feature sits: the app's grey, or its dark block. */
function ScenePanel({ dark = false, children }: ScenePanelProps) {
  return (
    <div
      aria-hidden="true"
      className={`relative grid min-h-80 reveal place-items-center overflow-hidden rounded-card p-6 sm:min-h-[26rem] ${dark ? 'bg-coal' : 'bg-ash-100'}`}
    >
      {children}
    </div>
  )
}

const RIASEC: { key: RiasecKey; value: number }[] = [
  { key: 'I', value: 0.86 },
  { key: 'A', value: 0.74 },
  { key: 'S', value: 0.68 },
  { key: 'E', value: 0.45 },
  { key: 'R', value: 0.38 },
  { key: 'C', value: 0.3 },
]

/** The test's result as the app shows it: the code in the hexagon and the six interests in bars. */
export function DiscoverScene() {
  const { t } = useTranslation()

  return (
    <ScenePanel>
      <div className="relative w-full max-w-sm rounded-card bg-surface p-6 shadow-card">
        <div className="flex items-center gap-4">
          <Hexagon size="md">IAS</Hexagon>
          <span className="min-w-0 flex-1 space-y-2">
            <TextLine width="w-full" tone="bg-night" />
            <TextLine width="w-2/3" />
          </span>
        </div>
        <div className="mt-6">
          <BarList
            label={t('assessment.scoresLabel')}
            items={RIASEC.map((dimension, index) => ({
              label: t(`riasec.${dimension.key}`),
              value: dimension.value,
              valueLabel: `${Math.round(dimension.value * 100)}%`,
              emphasized: index < 3,
            }))}
          />
        </div>
        <span className="absolute -top-8 -right-6">
          <Guide size="sm" />
        </span>
      </div>
    </ScenePanel>
  )
}

const PATH_STEPS: { icon: IconName; state: 'done' | 'here' | 'next' }[] = [
  { icon: 'book', state: 'done' },
  { icon: 'cap', state: 'here' },
  { icon: 'code', state: 'next' },
  { icon: 'briefcase', state: 'next' },
]

const STEP_DOT = {
  done: 'bg-white text-night',
  here: 'bg-gold text-night ring-4 ring-gold/30',
  next: 'border border-white/30 text-white/60',
}

/** A career's path as the app lists it: steps on a dotted line, the current one in gold. */
export function PathScene() {
  const { t } = useTranslation()

  return (
    <ScenePanel dark>
      <PathMark className="absolute -right-10 bottom-4 w-72 opacity-60" />
      <ol className="relative w-full max-w-xs">
        {PATH_STEPS.map((step, index) => (
          <li key={step.icon} className="relative flex gap-4 pb-6 last:pb-0">
            {index < PATH_STEPS.length - 1 && (
              <span className="absolute top-11 bottom-1 left-[1.15rem] border-l-2 border-dotted border-gold/60" />
            )}
            <span className={`grid size-10 shrink-0 place-items-center rounded-full ${STEP_DOT[step.state]}`}>
              {step.state === 'done' ? (
                <Icon name="check" className="size-5" />
              ) : (
                <Icon name={step.icon} className="size-5" />
              )}
            </span>
            <span className="flex min-w-0 flex-1 flex-col gap-2 pt-2">
              <TextLine width="w-3/4" tone={step.state === 'next' ? 'bg-white/30' : 'bg-white/80'} />
              <TextLine width="w-1/2" tone="bg-white/20" />
              {step.state === 'here' && (
                <span className="mt-1">
                  <Chip tone="gold">{t('landing.stepHere')}</Chip>
                </span>
              )}
            </span>
          </li>
        ))}
      </ol>
    </ScenePanel>
  )
}

/** The catalogue in numbers: the areas in the app's bars, and what there is to explore. */
export function MarketScene({ careers }: { careers: CareerSummary[] }) {
  const { t } = useTranslation()
  const { data: courses } = useCourses()
  const { data: academies } = useAcademies()
  const { data: companies } = useCompanies()
  const areas = areaCounts(careers)
    .toSorted((a, b) => b.count - a.count)
    .slice(0, 5)
  const top = areas[0]?.count ?? 1
  const totals = [
    { label: t('home.statsCareers'), value: careers.length },
    { label: t('home.statsCourses'), value: courses?.length ?? 0 },
    { label: t('home.statsCompanies'), value: companies?.length ?? 0 },
    { label: t('home.statsAcademies'), value: academies?.length ?? 0 },
  ]

  return (
    <ScenePanel>
      <div className="w-full max-w-sm space-y-3">
        <div className="grid grid-cols-2 gap-3">
          {totals.map((total) => (
            <div key={total.label} className="rounded-2xl bg-surface p-4 shadow-card">
              <span className="block font-figures text-2xl font-bold text-night">{total.value}</span>
              <span className="block text-xs font-light text-muted">{total.label}</span>
            </div>
          ))}
        </div>
        <div className="rounded-card bg-surface p-5 shadow-card">
          <BarList
            label={t('landing.feature_market_title')}
            items={areas.map(({ area, count }, index) => ({
              label: t(`market.area_${area}`),
              value: count / top,
              valueLabel: String(count),
              emphasized: index === 0,
            }))}
          />
        </div>
      </div>
    </ScenePanel>
  )
}

const CV_SECTIONS = [
  ['w-full', 'w-5/6', 'w-2/3'],
  ['w-11/12', 'w-3/4'],
]

/** A clean CV sheet, ready to send. */
export function CvScene() {
  const { t } = useTranslation()

  return (
    <ScenePanel dark>
      <div className="relative h-72 w-56">
        <div className="absolute inset-0 translate-x-5 rotate-6 rounded-2xl bg-white/10" />
        <div className="absolute inset-0 -rotate-2 space-y-5 overflow-hidden rounded-2xl bg-white p-5 shadow-lift">
          <div className="flex items-center gap-3">
            <span className="grid size-12 shrink-0 place-items-center rounded-full bg-ash-100 text-muted">
              <Icon name="user" className="size-6" />
            </span>
            <span className="min-w-0 flex-1 space-y-2">
              <TextLine width="w-full" tone="bg-night" />
              <TextLine width="w-2/3" />
            </span>
          </div>
          <span className="block h-0.5 w-10 rounded-full bg-gold" />
          {CV_SECTIONS.map((lines, index) => (
            <span key={lines.join()} className="block space-y-2">
              <TextLine width={index === 0 ? 'w-1/3' : 'w-2/5'} tone="bg-night" />
              {lines.map((width) => (
                <TextLine key={width} width={width} tone="bg-ash-200" />
              ))}
            </span>
          ))}
        </div>
        <span className="absolute -right-6 bottom-6 rotate-3">
          <Chip tone="gold">
            <Icon name="check" className="size-3.5" />
            {t('landing.sceneCvReady')}
          </Chip>
        </span>
      </div>
    </ScenePanel>
  )
}

/** The guide inside a slow ring, as the score ring and the path draw it. */
export function GuideSun() {
  return (
    <div aria-hidden="true" className="relative mx-auto grid size-56 place-items-center">
      <svg viewBox="-100 -100 200 200" className="absolute inset-0 size-full animate-spin-slow" fill="none">
        <circle
          r="92"
          className="stroke-ash-300"
          strokeWidth="3"
          strokeDasharray="2 10"
          strokeLinecap="round"
        />
        <circle cy="-92" r="6" className="fill-gold" />
        <circle cx="80" cy="46" r="4" className="fill-night" />
      </svg>
      <span className="grid size-36 place-items-center rounded-full bg-surface shadow-card">
        <Guide size="md" />
      </span>
    </div>
  )
}

/** The path from the logo, big, across the dark block. */
export function ManifestoScene() {
  return <PathMark className="absolute right-8 bottom-12 hidden w-[38%] lg:block" />
}
