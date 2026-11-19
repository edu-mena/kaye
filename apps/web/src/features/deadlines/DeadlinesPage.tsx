import { useTranslation } from 'react-i18next'
import { Loading, RowsSkeleton } from '../../components/PageStates'
import { FilterBar } from '../../components/ui/Filters'
import { PageHeader } from '../../components/ui/PageHeader'
import type { DeadlineKind } from '../../domain/deadlines'
import { stagger } from '../../lib/ui'
import { useUrlFilters } from '../../lib/useUrlFilters'
import { DeadlineRow } from './DeadlineRow'
import { useDeadlines } from '../../state/useDeadlines'

const KINDS: DeadlineKind[] = ['bolsa', 'acesso', 'exame', 'estagio']

/** Prazos: every upcoming deadline by month, by kind (?tipo=) and only the person's ones (?meus=). */
export default function DeadlinesPage() {
  const { t, i18n } = useTranslation()
  const [params, setParam] = useUrlFilters()
  const deadlines = useDeadlines()
  const kind = KINDS.find((value) => value === params.get('tipo')) ?? null
  const onlyMine = params.get('meus') === 'sim'
  const shown = (onlyMine ? deadlines.mine : deadlines.all).filter(
    (item) => kind === null || item.kind === kind,
  )
  const month = new Intl.DateTimeFormat(i18n.language, { month: 'long', year: 'numeric' })
  const months = new Map<string, typeof shown>()
  for (const item of shown)
    months.set(item.date.slice(0, 7), [...(months.get(item.date.slice(0, 7)) ?? []), item])

  return (
    <>
      <PageHeader compact tour="deadlines" title={t('nav.deadlines')} subtitle={t('deadlines.subtitle')} />
      <div className="space-y-6">
        <FilterBar
          clearLabel={t('scholarships.clear')}
          onChange={setParam}
          onClear={() => setParam('tipo', null, ['meus'])}
          filters={[
            {
              key: 'tipo',
              label: t('deadlines.kindLabel'),
              placeholder: t('deadlines.anyKind'),
              value: kind,
              options: KINDS.map((value) => ({ value, label: t(`deadlines.kind_${value}`) })),
            },
            {
              key: 'meus',
              label: t('deadlines.forLabel'),
              placeholder: t('deadlines.forAll'),
              value: onlyMine ? 'sim' : null,
              options: [{ value: 'sim', label: t('deadlines.onlyMine') }],
            },
          ]}
        />
        {deadlines.loading ? (
          <Loading>
            <RowsSkeleton count={5} />
          </Loading>
        ) : shown.length === 0 ? (
          <p className="rounded-2xl bg-surface p-5 text-sm font-light text-copy shadow-card">
            {t('deadlines.empty')}
          </p>
        ) : (
          [...months].map(([key, items]) => (
            <section key={key} aria-labelledby={`month-${key}`}>
              <h2
                id={`month-${key}`}
                className="mb-3 text-base font-semibold text-night first-letter:uppercase"
              >
                {month.format(new Date(`${key}-15T12:00:00`))}
              </h2>
              <ul className="space-y-2">
                {items.map((item, index) => (
                  <li key={item.id} className="rise" style={stagger(Math.min(index, 6))}>
                    <DeadlineRow item={item} today={deadlines.today} />
                  </li>
                ))}
              </ul>
            </section>
          ))
        )}
        <p className="text-xs font-light text-muted">{t('deadlines.privacy')}</p>
      </div>
    </>
  )
}
