import type { IconName } from '../../components/icons'
import type { MarketArea, RiasecKey } from '../../data/types'
import type { Goal, Situation } from '../../domain/discovery'

export const AREA_ICONS: Record<MarketArea, IconName> = {
  technology: 'code',
  engineering: 'helmet',
  oil_mining: 'drop',
  health: 'heart',
  education: 'cap',
  business: 'briefcase',
  legal: 'scale',
  public: 'landmark',
  communication: 'megaphone',
  agriculture: 'sprout',
  hospitality: 'bed',
  logistics: 'truck',
  sciences: 'atom',
}

export const SITUATION_ICONS: Record<Situation, IconName> = {
  school: 'book',
  university: 'cap',
  seeking: 'search',
  working: 'briefcase',
}

export const GOAL_ICONS: Record<Goal, IconName> = {
  discover: 'compass',
  change: 'refresh',
  course: 'cap',
  job: 'briefcase',
  cv: 'document',
}

export const INTEREST_ICONS: Record<RiasecKey, IconName> = {
  R: 'gear',
  I: 'flask',
  A: 'palette',
  S: 'heart',
  E: 'megaphone',
  C: 'document',
}
