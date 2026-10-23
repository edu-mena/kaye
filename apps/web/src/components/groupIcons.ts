import type { CareerGroup } from '../data/types'
import type { IconName } from './icons'

/** One icon per area, the same on cards, headers and filters. */
export const GROUP_ICONS: Record<CareerGroup, IconName> = {
  desenvolvimento: 'code',
  dados: 'chart',
  infraestrutura: 'server',
  seguranca: 'shield',
  telecomunicacoes: 'signal',
  design: 'pencil',
  gestao: 'briefcase',
  educacao: 'cap',
  digital: 'megaphone',
}
