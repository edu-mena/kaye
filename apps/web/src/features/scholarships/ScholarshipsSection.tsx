import { useTranslation } from 'react-i18next'
import { OpportunityGrid } from '../../components/OpportunityCard'
import { Loading, RowsSkeleton } from '../../components/PageStates'
import { QueryState } from '../../components/QueryState'
import { FilterBar } from '../../components/ui/Filters'
import { useScholarships } from '../../data/queries'
import { MARKET_AREAS, type Scholarship } from '../../data/types'
import { OFFER_LEVELS } from '../../domain/courses'
import { byInterest } from '../../domain/interests'
import { useInterestAreas } from '../../lib/useInterestAreas'
import { filterScholarships, todayIso } from '../../domain/scholarships'
import { useUrlFilters } from '../../lib/useUrlFilters'
import { PsychotechHint } from '../psychotech/PsychotechHint'
import { ScholarshipCard } from './ScholarshipCard'

const DESTINATIONS: Scholarship['destination'][] = ['angola', 'exterior']

/**
 * Bolsas (a tab of /oportunidades): real scholarships, by level (?nivel=), destination (?destino=),
 * area (?area=) and open now (?abertas=).
 */
export function ScholarshipsSection() {
  const query = useScholarships()

  return (
    <>
      <PsychotechHint className="mb-4" />
      <QueryState
        query={query}
        loading={
          <Loading>
            <RowsSkeleton count={5} />
          </Loading>
        }
      >
        {(scholarships) => <List scholarships={scholarships} />}
      </QueryState>
    </>
  )
}

function List({ scholarships }: { scholarships: Scholarship[] }) {
  const { t } = useTranslation()
  const mine = useInterestAreas()
  const [params, setParam] = useUrlFilters()
  const today = todayIso()
  const level = OFFER_LEVELS.find((value) => value === params.get('nivel')) ?? null
  const destination = DESTINATIONS.find((value) => value === params.get('destino')) ?? null
  const area = MARKET_AREAS.find((value) => value === params.get('area')) ?? null
  const open = params.get('abertas') === 'sim'
  const shown = byInterest(
    filterScholarships(scholarships, { level, destination, area, open }, today),
    (item) => item.areas,
    mine,
  )
  const levels = OFFER_LEVELS.filter((value) => scholarships.some((item) => item.levels.includes(value)))

  return (
    <div className="space-y-4">
      <FilterBar
        clearLabel={t('scholarships.clear')}
        onChange={setParam}
        onClear={() => setParam('nivel', null, ['destino', 'area', 'abertas'])}
        filters={[
          {
            key: 'nivel',
            label: t('scholarships.levelLabel'),
            placeholder: t('scholarships.anyLevel'),
            value: level,
            options: levels.map((value) => ({ value, label: t(`training.${value}`) })),
          },
          {
            key: 'destino',
            label: t('scholarships.destinationLabel'),
            placeholder: t('scholarships.anyDestination'),
            value: destination,
            options: DESTINATIONS.map((value) => ({ value, label: t(`scholarships.destination_${value}`) })),
          },
          {
            key: 'area',
            label: t('scholarships.areaLabel'),
            placeholder: t('scholarships.anyArea'),
            value: area,
            options: MARKET_AREAS.map((value) => ({ value, label: t(`market.area_${value}`) })),
          },
          {
            key: 'abertas',
            label: t('scholarships.stateLabel'),
            placeholder: t('scholarships.stateAny'),
            value: open ? 'sim' : null,
            options: [{ value: 'sim', label: t('scholarships.open') }],
          },
        ]}
      />
      <OpportunityGrid
        items={shown}
        count={t('scholarships.count', { count: shown.length })}
        empty={t('scholarships.empty')}
        render={(scholarship) => <ScholarshipCard scholarship={scholarship} today={today} />}
      />
    </div>
  )
}
