import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Icon } from '../../components/icons'
import { PATH_LINE } from '../../components/PathMark'
import { useAcademies, useCompanies, useCourses } from '../../data/queries'
import type { CareerSummary } from '../../data/types'
import { areaCounts } from '../../domain/discovery'
import { stagger } from '../../lib/ui'
import { AREA_ICONS } from '../../components/areaIcons'

const COUNT_MS = 900

/** A number that counts up to its value when it appears. */
function CountUp({ value }: { value: number }) {
  const [shown, setShown] = useState(0)
  const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  useEffect(() => {
    if (still) return undefined
    const start = performance.now()
    let frame = requestAnimationFrame(function tick(now) {
      const progress = Math.min((now - start) / COUNT_MS, 1)
      setShown(Math.round(value * (1 - (1 - progress) ** 3)))
      if (progress < 1) frame = requestAnimationFrame(tick)
    })
    return () => cancelAnimationFrame(frame)
  }, [value, still])

  return <>{still ? value : shown}</>
}

type StatCardProps = { label: string; value: number; place: string; index: number }

function StatCard({ label, value, place, index }: StatCardProps) {
  return (
    <div className={`absolute ${place}`}>
      <div
        className="animate-float rounded-2xl bg-surface px-4 py-3 shadow-lift"
        style={{ animationDelay: `${index * -900}ms` }}
      >
        <p className="text-xs font-light text-muted">{label}</p>
        <p className="font-figures text-2xl font-semibold text-night">
          <CountUp value={value} />
        </p>
      </div>
    </div>
  )
}

/** What the Kayé already knows, in real numbers: floating cards around the biggest areas. */
export function StatsScene({ careers }: { careers: CareerSummary[] }) {
  const { t } = useTranslation()
  const { data: courses } = useCourses()
  const { data: academies } = useAcademies()
  const { data: companies } = useCompanies()
  const areas = areaCounts(careers)
    .toSorted((a, b) => b.count - a.count)
    .slice(0, 6)
  const top = areas[0]?.count ?? 1

  return (
    <div className="relative mx-auto mt-8 h-96 w-full max-w-sm">
      <div className="absolute inset-x-6 top-14 bottom-14 -rotate-2 rounded-card border border-line bg-surface p-5 shadow-card">
        <p className="text-sm font-semibold text-night">{t('onboarding.statsChart')}</p>
        <ol className="mt-3 flex h-40 items-end justify-between gap-2">
          {areas.map(({ area, count }, index) => (
            <li key={area} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
              <span
                className="w-full origin-bottom animate-grow rounded-lg bg-night"
                style={{ height: `${(count / top) * 75}%`, ...stagger(index + 2) }}
              />
              <Icon name={AREA_ICONS[area]} className="size-4 shrink-0 text-muted" />
              <span className="sr-only">
                {t(`market.area_${area}`)}: {count}
              </span>
            </li>
          ))}
        </ol>
      </div>
      <StatCard
        label={t('home.statsCareers')}
        value={careers.length}
        place="top-0 left-0 -rotate-3"
        index={0}
      />
      <StatCard
        label={t('home.statsCourses')}
        value={courses?.length ?? 0}
        place="top-2 right-0 rotate-3"
        index={1}
      />
      <StatCard
        label={t('home.statsAcademies')}
        value={academies?.length ?? 0}
        place="bottom-0 left-0 rotate-2"
        index={2}
      />
      <StatCard
        label={t('home.statsCompanies')}
        value={companies?.length ?? 0}
        place="right-0 bottom-2 -rotate-2"
        index={3}
      />
    </div>
  )
}

/** The path from the logo drawing itself while the plan is put together. */
export function BuildingScene({ lines }: { lines: string[] }) {
  return (
    <div className="mt-8 rounded-card bg-coal p-6 text-white">
      <svg viewBox="0 0 240 120" aria-hidden="true" className="mx-auto w-full max-w-xs" fill="none">
        <path d={PATH_LINE} className="stroke-white/25" strokeWidth="10" strokeLinecap="round" />
        <path
          d={PATH_LINE}
          pathLength={1}
          strokeDasharray="1"
          className="animate-draw stroke-gold"
          strokeWidth="4"
          strokeLinecap="round"
        />
      </svg>
      <ul className="mt-6 space-y-3">
        {lines.map((line, index) => (
          <li
            key={line}
            className="flex animate-step-in items-center gap-3 text-sm font-light"
            style={{ animationDelay: `${(index + 1) * 800}ms` }}
          >
            <span className="grid size-6 shrink-0 place-items-center rounded-full bg-white text-night">
              <Icon name="check" className="size-4" />
            </span>
            {line}
          </li>
        ))}
      </ul>
    </div>
  )
}

/** Google's "G", in its own colours, as its brand guidelines ask for this button. */
export function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-5">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  )
}
