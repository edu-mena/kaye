import { useTranslation } from 'react-i18next'
import type { InterestFilter } from '../lib/useInterestFilter'

type Props = {
  filter: Pick<InterestFilter, 'active' | 'others' | 'setOthers'>
  /** How many items the filter left out of the list. */
  hidden: number
}

/**
 * The line every list shows while the person has a profile: what the list is showing and the switch for the
 * other areas. Without a profile there is nothing to say.
 */
export function InterestNotice({ filter, hidden }: Props) {
  const { t } = useTranslation()
  if (!filter.active) return null
  return (
    <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-light text-muted">
      <span>
        {filter.others
          ? t('interest.showingAll')
          : hidden > 0
            ? t('interest.showingMine', { count: hidden })
            : t('interest.showingMineAll')}
      </span>
      <button
        type="button"
        aria-pressed={filter.others}
        onClick={() => filter.setOthers(!filter.others)}
        className="font-normal text-night underline underline-offset-2 hover:text-blue"
      >
        {filter.others ? t('interest.onlyMine') : t('interest.seeOthers')}
      </button>
    </p>
  )
}
