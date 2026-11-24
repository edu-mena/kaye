import { useTranslation } from 'react-i18next'
import { Icon } from '../../components/icons'
import { ButtonLink } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { CardHeading } from '../home/CardHeading'
import { PlusBenefits } from './PlusBenefits'
import { usePlusPrice } from './usePlusPrice'

/** What the person sees where a Plus feature is closed: what it includes, the price and the way to know more. */
export function PlusLock() {
  const { t } = useTranslation()
  const price = usePlusPrice()
  return (
    <Card as="section" tone="notice" aria-labelledby="plus-lock" className="p-5 sm:p-6">
      <CardHeading id="plus-lock" icon="lock">
        {t('plus.lockTitle')}
      </CardHeading>
      <p className="mt-2 text-sm font-light text-copy">{t('plus.lockBody')}</p>
      <PlusBenefits className="mt-4" />
      <p className="mt-4 text-sm font-normal text-night">{price}</p>
      <ButtonLink to="/plus" size="sm" className="mt-4">
        {t('plus.see')}
        <Icon name="arrowRight" className="size-4" />
      </ButtonLink>
    </Card>
  )
}
