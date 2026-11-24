import { useTranslation } from 'react-i18next'
import { formatKz } from '../../domain/format'
import { PLUS_PRICE_KZ } from '../../lib/plan'

/** "1.999 Kz por mês". */
export function usePlusPrice() {
  const { t } = useTranslation()
  return t('plus.price', { price: formatKz(PLUS_PRICE_KZ) })
}
