import { useTranslation } from 'react-i18next'
import { Icon } from '../../components/icons'
import type { FeeEstimate } from '../../domain/fees'
import { formatKz } from '../../domain/format'

/** The monthly fee of an offer, with its source when published and a note when it is an estimate. */
export function FeeLine({ fee }: { fee: FeeEstimate | null }) {
  const { t } = useTranslation()
  const text = !fee
    ? t('course.feeUnknown')
    : fee.max === 0
      ? t('course.feeFree')
      : fee.min === fee.max
        ? t('course.feeMonthly', { value: formatKz(fee.min) })
        : t('course.feeValue', { min: formatKz(fee.min), max: formatKz(fee.max) })
  const published = fee?.published
  return (
    <>
      <p className="mt-2 flex items-center gap-1.5 text-sm font-normal text-night">
        <Icon name="wallet" className="size-4 shrink-0" />
        {text}
      </p>
      {fee?.estimated && <p className="text-xs font-light text-muted">{t('course.feeEstimated')}</p>}
      {published && (
        <p className="relative z-10 text-xs font-light text-muted">
          {t(published.basis === 'course' ? 'course.feePublished' : 'course.feeAverage', {
            year: published.year,
          })}{' '}
          <a href={published.source.url} target="_blank" rel="noreferrer" className="underline">
            {published.source.label}
          </a>
        </p>
      )}
    </>
  )
}
