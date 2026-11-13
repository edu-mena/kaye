import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

/** The official launch, at midnight in Luanda (UTC+1, no summer time): one instant for everyone. */
const LAUNCH = new Date('2026-12-01T00:00:00+01:00').getTime()

const SECOND = 1000
const MINUTE = 60 * SECOND
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR

type Left = { days: number; hours: number; minutes: number; seconds: number }

/** What is left until the launch, or null once it has come. */
function timeLeft(now: number): Left | null {
  const rest = LAUNCH - now
  if (rest <= 0) return null
  return {
    days: Math.floor(rest / DAY),
    hours: Math.floor((rest % DAY) / HOUR),
    minutes: Math.floor((rest % HOUR) / MINUTE),
    seconds: Math.floor((rest % MINUTE) / SECOND),
  }
}

/**
 * The current time, ticking each second while the page is visible. A hidden tab stops the timer
 * (no wasted battery); coming back re-reads the clock, so it never shows a stale value.
 */
function useNow(): number {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    let timer: number | undefined
    const tick = () => {
      const current = Date.now()
      setNow(current)
      if (current >= LAUNCH) stop()
    }
    // Aligns the ticks on whole seconds so the digits change together with the device clock.
    const start = () => {
      stop()
      tick()
      timer = window.setTimeout(
        function next() {
          tick()
          if (Date.now() < LAUNCH) timer = window.setTimeout(next, SECOND - (Date.now() % SECOND))
        },
        SECOND - (Date.now() % SECOND),
      )
    }
    const stop = () => window.clearTimeout(timer)
    const onVisibility = () => (document.hidden ? stop() : start())

    if (Date.now() < LAUNCH) start()
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      stop()
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [])

  return now
}

const UNITS = ['days', 'hours', 'minutes', 'seconds'] as const

function Countdown({ left }: { left: Left }) {
  const { t } = useTranslation()

  return (
    <a
      href="#lista-de-espera"
      className="block shrink-0 rounded-2xl bg-white/10 px-3 py-3 hover:bg-white/15 sm:px-4"
    >
      {/* Screen readers get one calm sentence, not a number changing every second. */}
      <span className="sr-only">
        {t('prelaunch.countdownSpoken', {
          days: left.days,
          hours: left.hours,
          minutes: left.minutes,
          date: t('prelaunch.launchDate'),
        })}
      </span>
      <span aria-hidden="true" className="flex items-start justify-center gap-1.5 sm:gap-2">
        {UNITS.map((unit, index) => (
          <span key={unit} className="flex items-start gap-1.5 sm:gap-2">
            {index > 0 && <span className="pt-1 text-2xl leading-none font-extrabold text-white/40">:</span>}
            <span className="flex w-12 flex-col items-center sm:w-14">
              <span className="text-3xl leading-none font-extrabold text-gold tabular-nums sm:text-4xl">
                {String(left[unit]).padStart(2, '0')}
              </span>
              <span className="mt-1 text-[0.7rem] font-light tracking-wide text-white/80 uppercase">
                {t(`prelaunch.unit_${unit}`, { count: left[unit] })}
              </span>
            </span>
          </span>
        ))}
      </span>
      <span aria-hidden="true" className="mt-2 block text-center text-xs font-normal text-gold">
        {t('prelaunch.launchOn', { date: t('prelaunch.launchDate') })}
      </span>
    </a>
  )
}

/** A warm hello while the Kayé is being built, with a live countdown to the launch (hidden after). */
export function WelcomeBanner() {
  const { t } = useTranslation()
  const left = timeLeft(useNow())

  return (
    <div className="px-3 pt-1">
      <section
        aria-label={t('prelaunch.welcomeLabel')}
        className="mx-auto flex max-w-6xl flex-col gap-4 rounded-card bg-coal px-5 py-5 text-white md:flex-row md:items-center md:justify-between md:px-8"
      >
        <div className="max-w-2xl">
          <p className="text-lg font-extrabold">{t('prelaunch.welcomeTitle')}</p>
          <p className="mt-1 text-sm font-light text-white/85">{t('prelaunch.welcomeText')}</p>
        </div>
        {left && <Countdown left={left} />}
      </section>
    </div>
  )
}
