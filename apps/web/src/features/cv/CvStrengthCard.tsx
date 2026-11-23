import { useTranslation } from 'react-i18next'
import { Card } from '../../components/ui/Card'
import { ProgressBar } from '../../components/ui/ProgressBar'
import type { CvData } from '../../data/types'
import { cvStrength, type StrengthKey } from '../../domain/cvStrength'

type CvStrengthCardProps = {
  cv: CvData
  /** Tapping what is missing takes the person to that part. */
  onPick?: (key: StrengthKey) => void
  /** How many of the missing parts to list. */
  show?: number
}

/** "O teu CV está 70% forte", and what is missing to reach 100, the biggest gain first. */
export function CvStrengthCard({ cv, onPick, show = 3 }: CvStrengthCardProps) {
  const { t } = useTranslation()
  const { score, missing } = cvStrength(cv)

  return (
    <Card className="space-y-3 p-5">
      <p className="text-base font-semibold text-night" aria-live="polite">
        {t('cv.wizStrength', { value: score })}
      </p>
      <ProgressBar
        value={score / 100}
        label={t('cv.wizStrengthLabel')}
        tone={score === 100 ? 'success' : 'blue'}
      />
      {missing.length === 0 ? (
        <p className="text-sm font-light text-copy">{t('cv.wizStrengthFull')}</p>
      ) : (
        <div>
          <p className="mb-2 text-sm font-light text-copy">{t('cv.wizMissingIntro')}</p>
          <ul className="flex flex-wrap gap-2">
            {missing.slice(0, show).map(({ key, points }) => (
              <li key={key}>
                <button
                  type="button"
                  disabled={!onPick}
                  onClick={() => onPick?.(key)}
                  className="rounded-full bg-ash-100 px-3.5 py-1.5 text-sm font-light text-night hover:bg-ash-200"
                >
                  {t(`cv.missing_${key}`)} · +{points}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  )
}
