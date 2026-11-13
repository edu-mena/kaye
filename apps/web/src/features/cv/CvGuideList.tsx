import { useTranslation } from 'react-i18next'
import { Icon } from '../../components/icons'
import type { Career } from '../../data/types'

/** What a CV for this career must show and avoid. */
export function CvGuideList({ guide }: { guide: Career['cvGuide'] }) {
  const { t } = useTranslation()
  return (
    <ul className="space-y-2">
      {guide.include.map((item) => (
        <li key={item} className="flex gap-2 text-sm font-light text-night">
          <Icon name="check" className="mt-0.5 size-4 shrink-0 text-success" />
          <span>
            <span className="sr-only">{t('cv.guideInclude')}: </span>
            {item}
          </span>
        </li>
      ))}
      {guide.avoid.map((item) => (
        <li key={item} className="flex gap-2 text-sm font-light text-night">
          <Icon name="close" className="mt-0.5 size-4 shrink-0 text-coral" />
          <span>
            <span className="sr-only">{t('cv.guideAvoid')}: </span>
            {item}
          </span>
        </li>
      ))}
    </ul>
  )
}
