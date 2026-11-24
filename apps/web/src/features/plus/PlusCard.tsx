import { useId } from 'react'
import { useTranslation } from 'react-i18next'
import { Icon } from '../../components/icons'
import { ButtonLink } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { usePlus } from '../../lib/plan'
import { CardHeading } from '../home/CardHeading'
import { usePlusPrice } from './usePlusPrice'

/** The Plus on the home: what it includes, the price, and the way to know more. Only for adults, with the flag on. */
export function PlusCard({ onDismiss }: { onDismiss?: () => void }) {
  const { t } = useTranslation()
  const { promotable } = usePlus()
  const id = useId()
  const price = usePlusPrice()
  if (!promotable) return null
  return (
    <Card as="article" tone="notice" aria-labelledby={id} className="p-5">
      <CardHeading id={id} icon="lock">
        {t('plus.title')}
      </CardHeading>
      <p className="mt-2 text-sm font-light text-copy">{t('plus.cardBody')}</p>
      <p className="mt-3 text-sm font-normal text-night">{price}</p>
      <div className="mt-4 flex items-center gap-2">
        <ButtonLink to="/plus" variant="secondary" size="sm">
          {t('plus.cardCta')}
          <Icon name="arrowRight" className="size-4" />
        </ButtonLink>
        {onDismiss && (
          <button
            type="button"
            aria-label={t('forYou.dismiss')}
            onClick={onDismiss}
            className="ml-auto grid size-9 place-items-center rounded-full border border-line bg-surface text-night hover:bg-ash-100"
          >
            <Icon name="close" className="size-4" />
          </button>
        )}
      </div>
    </Card>
  )
}
