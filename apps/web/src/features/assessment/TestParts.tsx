import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { ProgressBar } from '../../components/ui/ProgressBar'
import { useTestProgress } from '../../state/useTestProgress'

/** "1. O que gostas · 2. O que já sabes": both parts at the top, each with its own progress. */
export function TestParts({ current }: { current: 1 | 2 }) {
  const { t } = useTranslation()
  const progress = useTestProgress()
  const parts = [
    {
      part: 1 as const,
      to: '/teste',
      label: t('assessment.part1'),
      value: progress.completed ? 1 : progress.answered / Math.max(progress.total, 1),
    },
    {
      part: 2 as const,
      to: '/teste/valencias',
      label: t('assessment.part2'),
      value: progress.stepsDone / progress.stepsTotal,
    },
  ]

  return (
    <nav aria-label={t('assessment.partsLabel')} className="mb-8">
      <ol className="grid grid-cols-2 gap-2">
        {parts.map((item) => (
          <li key={item.part}>
            <Link
              to={item.to}
              aria-current={item.part === current ? 'step' : undefined}
              className={`block rounded-2xl border px-3 py-2.5 transition-colors ${
                item.part === current ? 'border-night bg-surface' : 'border-line hover:bg-ash-100'
              }`}
            >
              <span
                className={`block text-xs font-semibold ${item.part === current ? 'text-night' : 'text-muted'}`}
              >
                {item.label}
              </span>
              <ProgressBar value={item.value} label={item.label} className="mt-2" />
            </Link>
          </li>
        ))}
      </ol>
      <p className="mt-2 text-xs font-light text-muted">
        {progress.left === 0 ? t('assessment.allDone') : t('assessment.timeLeft', { count: progress.left })}
      </p>
    </nav>
  )
}
