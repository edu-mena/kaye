import { useTranslation } from 'react-i18next'
import { Icon } from '../../components/icons'
import { PLUS_FEATURES, type PlusFeature } from '../../lib/plan'

const LABEL = {
  cv_pdf: 'plus.featureCvPdf',
  training: 'plus.featureTraining',
  simulations: 'plus.featureSimulations',
  interview_feedback: 'plus.featureInterviews',
} as const satisfies Record<PlusFeature, string>

/** What the Plus includes, as a list with a check on each line. */
export function PlusBenefits({ className = '' }: { className?: string }) {
  const { t } = useTranslation()
  return (
    <ul className={`space-y-2 ${className}`}>
      {PLUS_FEATURES.map((feature) => (
        <li key={feature} className="flex items-start gap-2 text-sm font-light text-copy">
          <Icon name="check" className="mt-0.5 size-4 shrink-0 text-blue" />
          {t(LABEL[feature])}
        </li>
      ))}
    </ul>
  )
}
