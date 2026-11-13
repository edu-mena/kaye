import { useTranslation } from 'react-i18next'

type ScoreRingProps = {
  score: number
  size?: 'sm' | 'lg'
  tone?: 'light' | 'dark'
  /** What screen readers hear; by default, the course's Kayé score. */
  label?: string
}

const SIZES = { sm: 'size-12 text-sm', lg: 'size-20 text-2xl' }
const RADIUS = 15.5
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

/**
 * The Kayé score of a course (0–100) as a ring that fills up, the number inside.
 * Black on light surfaces, gold on dark ones; screen readers hear the full sentence.
 */
export function ScoreRing({ score, size = 'sm', tone = 'light', label }: ScoreRingProps) {
  const { t } = useTranslation()
  const value = Math.max(0, Math.min(100, Math.round(score)))
  const dark = tone === 'dark'

  return (
    <span className={`relative inline-grid shrink-0 place-items-center ${SIZES[size]}`}>
      <svg viewBox="0 0 36 36" aria-hidden="true" className="absolute inset-0 size-full -rotate-90">
        <circle
          cx="18"
          cy="18"
          r={RADIUS}
          fill="none"
          strokeWidth="3"
          className={dark ? 'stroke-white/15' : 'stroke-ash-200'}
        />
        <circle
          cx="18"
          cy="18"
          r={RADIUS}
          fill="none"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={`${(value / 100) * CIRCUMFERENCE} ${CIRCUMFERENCE}`}
          className={dark ? 'stroke-gold' : 'stroke-night'}
        />
      </svg>
      <span
        aria-hidden="true"
        className={`font-display leading-none font-bold ${dark ? 'text-white' : 'text-night'}`}
      >
        {value}
      </span>
      <span className="sr-only">{label ?? t('career.studyScore', { score: value })}</span>
    </span>
  )
}
