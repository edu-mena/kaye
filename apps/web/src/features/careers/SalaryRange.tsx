import { useTranslation } from 'react-i18next'
import type { Market } from '../../data/types'
import { formatKz } from '../../domain/format'

type Salary = NonNullable<Market['salary']>

/**
 * Where most salaries fall (p25–p75) in near-black, the median as a gold dot, on a scale
 * from 0. Decorative: the text next to it always says the same.
 */
export function SalaryBar({ salary, small = false }: { salary: Salary; small?: boolean }) {
  const scale = salary.p75 * 1.25
  const at = (value: number) => `${(value / scale) * 100}%`
  return (
    <span
      aria-hidden="true"
      className={`relative block rounded-full bg-ash-200 ${small ? 'h-2' : 'my-4 h-3'}`}
    >
      <span
        className="absolute inset-y-0 rounded-full bg-night"
        style={{ left: at(salary.p25), width: `calc(${at(salary.p75)} - ${at(salary.p25)})` }}
      />
      <span
        className={`absolute top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-night bg-gold ${small ? 'size-3.5 border-2' : 'size-5 border-4'}`}
        style={{ left: at(salary.p50) }}
      />
    </span>
  )
}

export function SalaryRange({ salary }: { salary: Salary }) {
  const { t } = useTranslation()
  return (
    <div>
      <p className="font-display text-xl font-semibold text-navy">
        {t('career.salary', { p25: formatKz(salary.p25), p75: formatKz(salary.p75) })}
      </p>
      <SalaryBar salary={salary} />
      <p className="text-sm text-navy">{t('career.salaryMedian', { value: formatKz(salary.p50) })}</p>
      <p className="text-xs text-muted">{t('career.salaryBasis', { basis: salary.basis })}</p>
    </div>
  )
}
