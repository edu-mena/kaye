import { useTranslation } from 'react-i18next'
import { OpportunityCard } from '../../components/OpportunityCard'
import type { Scholarship } from '../../data/types'
import { isOpen } from '../../domain/scholarships'

/** A scholarship: who gives it, what it covers, for which level, until when; the official site and the source. */
export function ScholarshipCard({ scholarship, today }: { scholarship: Scholarship; today: string }) {
  const { t } = useTranslation()
  return (
    <OpportunityCard
      item={scholarship}
      deadlineKind="bolsa"
      chips={[
        t(`scholarships.destination_${scholarship.destination}`),
        t(`scholarships.kind_${scholarship.kind}`),
      ]}
      open={isOpen(scholarship, today)}
      openLabel={t('scholarships.open')}
      facts={[
        {
          icon: 'cap',
          text: `${scholarship.levels.map((level) => t(`training.${level}`)).join(', ')}${
            scholarship.maxAge === undefined
              ? ''
              : ` · ${t('scholarships.maxAge', { age: scholarship.maxAge })}`
          }`,
        },
        {
          icon: 'wallet',
          text:
            scholarship.covers.length === 0
              ? t('scholarships.coversNone')
              : scholarship.covers.map((cover) => t(`scholarships.covers_${cover}`)).join(', '),
        },
        {
          icon: 'compass',
          text:
            scholarship.areas.length === 0
              ? t('scholarships.anyAreaShort')
              : scholarship.areas.map((area) => t(`market.area_${area}`)).join(', '),
        },
      ]}
    />
  )
}
