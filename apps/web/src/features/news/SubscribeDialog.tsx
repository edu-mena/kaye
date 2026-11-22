import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Icon } from '../../components/icons'
import { Button } from '../../components/ui/Button'
import { Dialog } from '../../components/ui/Dialog'
import { Toggles } from '../../components/ui/Toggles'
import { MARKET_AREAS, NEWS_KINDS, type Subscriptions } from '../../data/types'
import { userActions } from '../../state/userStore'
import { AREA_ICONS } from '../../components/areaIcons'
import { KIND_ICONS } from './kindIcons'

const toggled = <T,>(list: readonly T[], value: T) =>
  list.includes(value) ? list.filter((item) => item !== value) : [...list, value]

/** "Subscrever": the areas and types of news that go first on Novidades and reach Notificações. */
export function SubscribeDialog({
  open,
  onClose,
  current,
}: {
  open: boolean
  onClose: () => void
  current: Subscriptions | null
}) {
  const { t } = useTranslation()
  const [draft, setDraft] = useState<Subscriptions>(() => current ?? { areas: [], kinds: [...NEWS_KINDS] })
  const empty = draft.areas.length === 0 && draft.kinds.length === 0

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={t('news.subscribeTitle')}
      footer={
        <div className="flex flex-wrap items-center justify-end gap-2">
          {current && (
            <Button
              variant="danger"
              size="sm"
              onClick={() => {
                userActions.subscribe({ areas: [], kinds: [] })
                onClose()
              }}
            >
              {t('news.unsubscribe')}
            </Button>
          )}
          <Button
            size="sm"
            disabled={empty}
            onClick={() => {
              userActions.subscribe(draft)
              onClose()
            }}
          >
            {t('news.subscribeSave')}
          </Button>
        </div>
      }
    >
      <p className="text-sm font-light text-copy">{t('news.subscribeHint')}</p>
      <Toggles
        legend={t('news.subscribeKinds')}
        options={NEWS_KINDS.map((kind) => ({
          value: kind,
          label: t(`news.kind_${kind}`),
          icon: KIND_ICONS[kind],
        }))}
        selected={draft.kinds}
        onToggle={(kind) => setDraft({ ...draft, kinds: toggled(draft.kinds, kind) })}
      />
      <Toggles
        legend={t('news.subscribeAreas')}
        options={MARKET_AREAS.map((area) => ({
          value: area,
          label: t(`market.area_${area}`),
          icon: AREA_ICONS[area],
        }))}
        selected={draft.areas}
        onToggle={(area) => setDraft({ ...draft, areas: toggled(draft.areas, area) })}
      />
      <p className="mt-5 flex gap-2 rounded-2xl bg-paper p-3 text-xs font-light text-copy">
        <Icon name="bell" className="size-4 shrink-0 text-night" />
        {t('news.subscribeWhere')}
      </p>
    </Dialog>
  )
}
