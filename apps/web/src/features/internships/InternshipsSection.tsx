import type { TFunction } from 'i18next'
import { useTranslation } from 'react-i18next'
import { Icon } from '../../components/icons'
import { OpportunityCard, OpportunityGrid } from '../../components/OpportunityCard'
import { Loading, RowsSkeleton } from '../../components/PageStates'
import { QueryState } from '../../components/QueryState'
import { ButtonLink } from '../../components/ui/Button'
import { FilterBar } from '../../components/ui/Filters'
import { useInternships } from '../../data/queries'
import { byInterest } from '../../domain/interests'
import { useInterestAreas } from '../../lib/useInterestAreas'
import { MARKET_AREAS, type Internship } from '../../data/types'
import { filterInternships, INTERNSHIP_AUDIENCES, INTERNSHIP_KINDS } from '../../domain/internships'
import { isOpen, todayIso } from '../../domain/scholarships'
import { useUrlFilters } from '../../lib/useUrlFilters'

/**
 * Estágios (a tab of /oportunidades): real internships, by type (?tipo=), area (?area=),
 * audience (?para=), open now and paid.
 */
export function InternshipsSection() {
  const query = useInternships()

  return (
    <QueryState
      query={query}
      loading={
        <Loading>
          <RowsSkeleton count={5} />
        </Loading>
      }
    >
      {(internships) => <List internships={internships} />}
    </QueryState>
  )
}

const yes = (on: boolean) => (on ? 'sim' : null)

function List({ internships }: { internships: Internship[] }) {
  const { t } = useTranslation()
  const mine = useInterestAreas()
  const [params, setParam] = useUrlFilters()
  const today = todayIso()
  const kind = INTERNSHIP_KINDS.find((value) => value === params.get('tipo')) ?? null
  const area = MARKET_AREAS.find((value) => value === params.get('area')) ?? null
  const audience = INTERNSHIP_AUDIENCES.find((value) => value === params.get('para')) ?? null
  const open = params.get('abertos') === 'sim'
  const paid = params.get('pago') === 'sim'
  const shown = byInterest(
    filterInternships(internships, { kind, area, audience, open, paid }, today),
    (item) => item.areas,
    mine,
  )

  return (
    <div className="space-y-4">
      <FilterBar
        clearLabel={t('internships.clear')}
        onChange={setParam}
        onClear={() => setParam('tipo', null, ['area', 'para', 'abertos', 'pago'])}
        filters={[
          {
            key: 'tipo',
            label: t('internships.kindLabel'),
            placeholder: t('internships.anyKind'),
            value: kind,
            options: INTERNSHIP_KINDS.map((value) => ({ value, label: t(`internships.kind_${value}`) })),
          },
          {
            key: 'area',
            label: t('internships.areaLabel'),
            placeholder: t('internships.anyArea'),
            value: area,
            options: MARKET_AREAS.map((value) => ({ value, label: t(`market.area_${value}`) })),
          },
          {
            key: 'para',
            label: t('internships.audienceLabel'),
            placeholder: t('internships.anyAudience'),
            value: audience,
            options: INTERNSHIP_AUDIENCES.map((value) => ({
              value,
              label: t(`internships.audience_${value}`),
            })),
          },
          {
            key: 'abertos',
            label: t('internships.stateLabel'),
            placeholder: t('internships.stateAny'),
            value: yes(open),
            options: [{ value: 'sim', label: t('internships.open') }],
          },
          {
            key: 'pago',
            label: t('internships.paidLabel'),
            placeholder: t('internships.paidAny'),
            value: yes(paid),
            options: [{ value: 'sim', label: t('internships.paid') }],
          },
        ]}
      />
      <OpportunityGrid
        items={shown}
        count={t('internships.count', { count: shown.length })}
        empty={t('internships.empty')}
        render={(internship) => <InternshipCard internship={internship} today={today} />}
      />
    </div>
  )
}

function ages({ minAge, maxAge }: Internship, t: TFunction): string | null {
  if (minAge !== undefined && maxAge !== undefined) return t('internships.ages', { min: minAge, max: maxAge })
  if (minAge !== undefined) return t('internships.minAge', { age: minAge })
  if (maxAge !== undefined) return t('internships.maxAge', { age: maxAge })
  return null
}

const PAY = {
  true: 'internships.paid',
  false: 'internships.unpaid',
  null: 'internships.paidUnknown',
} as const

/** An internship: its type, who it is for, whether it pays, the areas; the official site and the source. */
function InternshipCard({ internship, today }: { internship: Internship; today: string }) {
  const { t } = useTranslation()
  const audience =
    internship.audience.length === 0
      ? t('internships.audienceNone')
      : internship.audience.map((value) => t(`internships.audience_${value}`)).join(', ')
  const months =
    internship.durationMonths === undefined
      ? null
      : t('internships.months', { count: internship.durationMonths })
  return (
    <OpportunityCard
      item={internship}
      chips={[
        t(`internships.kind_${internship.kind}`),
        ...(internship.province ? [internship.province] : []),
      ]}
      open={isOpen(internship, today)}
      openLabel={t('internships.open')}
      facts={[
        { icon: 'cap', text: [audience, ages(internship, t)].filter(Boolean).join(' · ') },
        { icon: 'wallet', text: [t(PAY[`${internship.paid}`]), months].filter(Boolean).join(' · ') },
        {
          icon: 'compass',
          text:
            internship.areas.length === 0
              ? t('internships.anyAreaShort')
              : internship.areas.map((value) => t(`market.area_${value}`)).join(', '),
        },
      ]}
      extra={
        <ButtonLink
          to={internship.areas[0] ? `/entrevistas?area=${internship.areas[0]}` : '/entrevistas'}
          variant="ghost"
          size="sm"
          className="mt-2 -ml-4 self-start"
        >
          <Icon name="message" className="size-4" />
          {t('interviews.train')}
        </ButtonLink>
      }
    />
  )
}
