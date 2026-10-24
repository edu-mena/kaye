import { useTranslation } from 'react-i18next'
import type { Market } from '../../data/types'
import { formatKz } from '../../domain/format'

type Salary = NonNullable<Market['salary']>

/**
 * Where salaries fall, said in three numbers with their meaning; the bar under them only
 * places those numbers on one scale. The scale does not start at 0, so the range is readable.
 */
export function SalaryRange({ salary }: { salary: Salary }) {
  const { t } = useTranslation()
  const spread = salary.p75 - salary.p25
  const min = Math.max(0, salary.p25 - spread * 0.7)
  const max = salary.p75 + spread * 0.7
  const at = (value: number) => `${((value - min) / (max - min)) * 100}%`
  const points = [
    { key: 'low', value: salary.p25, label: t('career.salaryLow'), note: t('career.salaryLowNote') },
    { key: 'mid', value: salary.p50, label: t('career.salaryMid'), note: t('career.salaryMidNote') },
    { key: 'high', value: salary.p75, label: t('career.salaryHigh'), note: t('career.salaryHighNote') },
  ]

  return (
    <div>
      <dl className="grid grid-cols-3 gap-px overflow-hidden rounded-2xl border border-line bg-line">
        {points.map((point) => (
          <div key={point.key} className="bg-surface p-3 sm:p-4">
            <dt className="text-xs font-light text-muted">{point.label}</dt>
            <dd
              className={`mt-1 text-base text-night sm:text-lg ${point.key === 'mid' ? 'font-bold' : 'font-normal'}`}
            >
              {formatKz(point.value)}
            </dd>
            <dd className="mt-0.5 text-[11px] leading-snug font-light text-muted">{point.note}</dd>
          </div>
        ))}
      </dl>

      <p className="mt-6 text-xs font-light text-copy">{t('career.salaryBand')}</p>
      <div aria-hidden="true" className="relative mx-6 mt-3 mb-9 h-2 rounded-full bg-ash-200">
        <span
          className="absolute inset-y-0 rounded-full bg-night"
          style={{ left: at(salary.p25), width: `calc(${at(salary.p75)} - ${at(salary.p25)})` }}
        />
        {points.map((point) => (
          <span key={point.key} className="absolute top-1/2" style={{ left: at(point.value) }}>
            <span
              className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-night ${point.key === 'mid' ? 'size-4' : 'size-3'}`}
            />
            <span
              className={`absolute top-3 -translate-x-1/2 text-[11px] whitespace-nowrap text-night ${point.key === 'mid' ? 'font-bold' : 'font-light'}`}
            >
              {t('career.salaryK', { value: Math.round(point.value / 1000) })}
            </span>
          </span>
        ))}
      </div>
      <p className="text-xs font-light text-muted">{t('career.salaryBasis', { basis: salary.basis })}</p>
    </div>
  )
}
