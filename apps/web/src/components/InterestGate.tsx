import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { MARKET_AREAS, type MarketArea } from '../data/types'
import { AREA_ICONS } from './areaIcons'
import { getUser, userActions, useUser } from '../state/userStore'
import { Button } from './ui/Button'
import { Dialog } from './ui/Dialog'
import { Toggles } from './ui/Toggles'

/**
 * The first thing someone with no areas is asked, on one screen: which areas they care about. "Saltar" keeps
 * every list open (they see everything); the choice can be changed in Definições. Whoever went through the
 * guide, or answered here before, is never asked again.
 */
export function InterestGate() {
  const { t } = useTranslation()
  const { interestAreas, discovery } = useUser()
  const [draft, setDraft] = useState<MarketArea[]>([])
  const open = interestAreas === null && discovery === null

  return (
    <Dialog
      open={open}
      // Closing the screen (Esc) is skipping it; the close that follows an answer is not.
      onClose={() => getUser().interestAreas === null && userActions.setInterestAreas([])}
      title={t('interest.gateTitle')}
      footer={
        <div className="flex flex-wrap items-center justify-end gap-2">
          <Button variant="secondary" size="sm" onClick={() => userActions.setInterestAreas([])}>
            {t('interest.skip')}
          </Button>
          <Button size="sm" disabled={draft.length === 0} onClick={() => userActions.setInterestAreas(draft)}>
            {t('interest.gateSave')}
          </Button>
        </div>
      }
    >
      <p className="text-sm font-light text-copy">{t('interest.gateBody')}</p>
      <Toggles
        legend={t('interest.areasLegend')}
        options={MARKET_AREAS.map((area) => ({
          value: area,
          label: t(`market.area_${area}`),
          icon: AREA_ICONS[area],
        }))}
        selected={draft}
        onToggle={(area) =>
          setDraft(draft.includes(area) ? draft.filter((item) => item !== area) : [...draft, area])
        }
      />
    </Dialog>
  )
}
