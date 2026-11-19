import { useTranslation } from 'react-i18next'
import { StatBlock, Subheading } from '../../components/DetailLayout'
import { Chip } from '../../components/ui/Chip'
import { paybackMonths, type StudyCost } from '../../domain/fees'
import { formatKz } from '../../domain/format'
import { useDuration } from '../../lib/useFormat'
import { useShowsSalaries } from '../../state/useShowsSalaries'

type CostVsSalaryProps = {
  cost: StudyCost
  salary: number | null
  salaryLabel: string
  /** There are free online courses to start with (shown above). */
  freeOnline?: boolean
}

/** How long the study takes and what it costs, next to the salary it leads to, and when it pays back. */
export function CostVsSalary({ cost, salary, salaryLabel, freeOnline = false }: CostVsSalaryProps) {
  const { t } = useTranslation()
  const duration = useDuration()
  const showsSalaries = useShowsSalaries()
  const payback = showsSalaries ? paybackMonths(cost, salary) : null
  const paid = cost.max > 0 ? t('cost.range', { min: formatKz(cost.min), max: formatKz(cost.max) }) : null
  const price = [cost.free && t('cost.free'), paid].filter(Boolean).join(' · ')

  return (
    <div>
      <Subheading>
        <span className="inline-flex items-center gap-2">
          {t('cost.title')}
          <Chip>{t('cost.estimate')}</Chip>
        </span>
      </Subheading>
      <StatBlock
        items={[
          { label: t('cost.duration'), value: duration(cost.months) },
          { label: t('cost.total'), value: price },
          ...(showsSalaries
            ? [
                {
                  label: salaryLabel,
                  value: salary === null ? '—' : t('cost.perMonth', { value: formatKz(salary) }),
                },
              ]
            : []),
        ]}
      />
      {payback !== null && (
        <p className="mt-3 text-sm font-light text-copy">{t('cost.payback', { count: payback })}</p>
      )}
      {freeOnline && <p className="mt-3 text-sm font-light text-copy">{t('cost.freeOnline')}</p>}
      <p className="mt-2 text-xs font-light text-muted">
        {t(cost.estimated ? 'cost.note' : 'cost.notePublished')}
      </p>
    </div>
  )
}
