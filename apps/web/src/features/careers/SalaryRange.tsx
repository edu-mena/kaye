import { useTranslation } from 'react-i18next'
import type { Market } from '../../data/types'
import { formatKz } from '../../domain/format'

type Salary = NonNullable<Market['salary']>

/** Where most salaries fall (p25–p75) and the median, on a scale from 0. Text says the same. */
export function SalaryRange({ salary }: { salary: Salary }) {
  const { t } = useTranslation()
  const scale = salary.p75 * 1.25
  const at = (value: number) => `${(value / scale) * 100}%`

  return (
    <div>
      <p className="font-display text-xl font-semibold text-navy">
        {t('career.salary', { p25: formatKz(salary.p25), p75: formatKz(salary.p75) })}
      </p>
      <div aria-hidden="true" className="relative my-4 h-3 rounded-full bg-navy-100">
        <span
          className="absolute inset-y-0 rounded-full bg-navy"
          style={{ left: at(salary.p25), width: `calc(${at(salary.p75)} - ${at(salary.p25)})` }}
        />
        <span
          className="absolute top-1/2 size-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-surface bg-gold"
          style={{ left: at(salary.p50) }}
        />
      </div>
      <p className="text-sm text-navy">{t('career.salaryMedian', { value: formatKz(salary.p50) })}</p>
      <p className="text-xs text-muted">{t('career.salaryBasis', { basis: salary.basis })}</p>
    </div>
  )
}
