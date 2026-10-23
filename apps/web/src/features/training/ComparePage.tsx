import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { QueryState } from '../../components/QueryState'
import { Button } from '../../components/ui/Button'
import { PageHeader } from '../../components/ui/PageHeader'
import { usePrograms } from '../../data/queries'
import { formatKz } from '../../domain/format'
import { scorePrograms, type ScoredProgram } from '../../domain/ranking'
import { useDuration, useRatingLabel } from '../../lib/useFormat'
import { userActions, useUser } from '../../state/userStore'

export default function ComparePage() {
  const { t } = useTranslation()
  const query = usePrograms()
  const { compare } = useUser()

  return (
    <div>
      <PageHeader title={t('training.compareTitle')} back={{ to: '/formacao', label: t('training.back') }} />
      <QueryState query={query}>
        {(programs) => {
          const chosen = scorePrograms(programs).filter((item) => compare.includes(item.program.id))
          return chosen.length === 0 ? (
            <p className="py-10 text-center text-muted">{t('training.compareEmpty')}</p>
          ) : (
            <CompareTable items={chosen} />
          )
        }}
      </QueryState>
    </div>
  )
}

function CompareTable({ items }: { items: ScoredProgram[] }) {
  const { t } = useTranslation()
  const duration = useDuration()
  const ratingLabel = useRatingLabel()
  const rows: { label: string; cell: (item: ScoredProgram) => ReactNode }[] = [
    { label: t('training.institution'), cell: ({ program }) => program.institution.name },
    { label: t('training.province'), cell: ({ program }) => program.institution.province },
    { label: t('training.level'), cell: ({ program }) => t(`training.${program.level}`) },
    {
      label: t('training.duration'),
      cell: ({ program }) => duration({ min: program.durationMonths, max: program.durationMonths }),
    },
    {
      label: t('training.cost'),
      cell: ({ program }) => (program.totalCost === null ? '—' : formatKz(program.totalCost)),
    },
    {
      label: t('training.schedule'),
      cell: ({ program }) => program.schedule.map((slot) => t(`training.${slot}`)).join(', '),
    },
    { label: t('training.rating'), cell: ({ program }) => ratingLabel(program.rating) },
    {
      label: t('training.score'),
      cell: ({ program, score }) => (program.recognized ? score : t('training.unrecognizedTitle')),
    },
  ]

  return (
    <div className="-mx-4 overflow-x-auto px-4">
      <table className="w-full min-w-[36rem] border-separate border-spacing-0 rounded-card bg-surface text-left text-sm shadow-card">
        <thead>
          <tr>
            <td className="w-32 p-4">
              <span className="sr-only">{t('training.compareTitle')}</span>
            </td>
            {items.map(({ program }) => (
              <th
                key={program.id}
                scope="col"
                className="p-4 align-top font-display text-base font-semibold text-navy"
              >
                {program.name}
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2 -ml-4 text-muted"
                  onClick={() => userActions.toggleCompare(program.id)}
                >
                  {t('training.compareRemove')}
                </Button>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label}>
              <th scope="row" className="border-t border-line p-4 font-semibold text-muted">
                {row.label}
              </th>
              {items.map((item) => (
                <td key={item.program.id} className="border-t border-line p-4 text-navy">
                  {row.cell(item)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
