import { useTranslation } from 'react-i18next'
import type { Market } from '../../data/types'
import { formatKz } from '../../domain/format'

type Salary = NonNullable<Market['salary']>

/**
 * Where most salaries fall (p25–p75) in near-black, the median as a gold dot, on a scale
 * from 0. Decorative: the text next to it always says the same.
 */
function SalaryBar({ salary }: { salary: Salary }) {
  const scale = salary.p75 * 1.25
  const at = (value: number) => `${(value / scale) * 100}%`
  return (
    <span aria-hidden="true" className="relative my-4 block h-3 rounded-full bg-ash-200">
      <span
        className="absolute inset-y-0 rounded-full bg-night"
        style={{ left: at(salary.p25), width: `calc(${at(salary.p75)} - ${at(salary.p25)})` }}
      />
      <span
        className="absolute top-1/2 size-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-night bg-white"
        style={{ left: at(salary.p50) }}
      />
    </span>
  )
}

export function SalaryRange({ salary }: { salary: Salary }) {
  const { t } = useTranslation()
  return (
    <div>
      <p className="text-base font-normal text-night">
        {t('career.salary', { p25: formatKz(salary.p25), p75: formatKz(salary.p75) })}
      </p>
      <SalaryBar salary={salary} />
      <p className="text-sm font-light text-copy">
        {t('career.salaryMedian', { value: formatKz(salary.p50) })}
      </p>
      <p className="text-xs font-light text-muted">{t('career.salaryBasis', { basis: salary.basis })}</p>
    </div>
  )
}
