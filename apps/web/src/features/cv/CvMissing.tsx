import { useTranslation } from 'react-i18next'
import { Icon } from '../../components/icons'
import type { CvData } from '../../data/types'
import { cvMissing } from '../../domain/cv'

type CvMissingProps = { cv: CvData; tone?: 'light' | 'dark'; className?: string }

/** One short line on what the CV still lacks (the same checks as its completeness); nothing when complete. */
export function CvMissing({ cv, tone = 'light', className = '' }: CvMissingProps) {
  const { t } = useTranslation()
  const missing = cvMissing(cv)
  if (missing.length === 0) return null
  const dark = tone === 'dark'
  return (
    <p
      className={`flex items-start gap-2 text-xs font-light ${dark ? 'text-white/80' : 'text-copy'} ${className}`}
    >
      <Icon name="info" className={`mt-px size-4 shrink-0 ${dark ? 'text-gold' : 'text-blue'}`} />
      <span>
        {t('cv.missingIntro')} {missing.map((key) => t(`cv.missing_${key}`)).join(', ')}.
      </span>
    </p>
  )
}
