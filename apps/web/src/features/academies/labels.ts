import type { TFunction } from 'i18next'
import type { Academy } from '../../data/types'

/** "Universidade · Pública", or "Gestão por confirmar" when no source says. */
export const academyMeta = (academy: Academy, t: TFunction) =>
  `${t(`training.type_${academy.type}`)} · ${
    academy.ownership ? t(`training.ownership_${academy.ownership}`) : t('academies.ownershipPending')
  }`
