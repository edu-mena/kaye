import { useTranslation } from 'react-i18next'
import { Toggles } from '../../components/ui/Toggles'
import { MARKET_AREAS } from '../../data/types'
import { userActions, useUser } from '../../state/userStore'
import { AREA_ICONS } from '../../components/areaIcons'

/**
 * The areas the lists show by default (Definições): each press saves. With none chosen, the lists show
 * everything (apart from what the person saved or the test pointed to).
 */
export function InterestSettings() {
  const { t } = useTranslation()
  const { interestAreas, discovery } = useUser()
  const chosen = interestAreas ?? discovery?.areas ?? []
  return (
    <div className="px-4 py-3">
      <p className="text-sm text-night">{t('interest.settingsTitle')}</p>
      <p className="mt-0.5 text-xs font-light text-muted">{t('interest.settingsBody')}</p>
      <Toggles
        legend={t('interest.areasLegend')}
        options={MARKET_AREAS.map((area) => ({
          value: area,
          label: t(`market.area_${area}`),
          icon: AREA_ICONS[area],
        }))}
        selected={chosen}
        onToggle={(area) =>
          userActions.setInterestAreas(
            chosen.includes(area) ? chosen.filter((item) => item !== area) : [...chosen, area],
          )
        }
      />
    </div>
  )
}
