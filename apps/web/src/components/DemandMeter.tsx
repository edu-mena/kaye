import { useTranslation } from 'react-i18next'
import type { Demand } from '../data/types'

const LEVEL: Record<Demand, number> = { baixa: 1, media: 2, alta: 3 }
const HEIGHTS = ['h-1.5', 'h-2.5', 'h-4']

/** Demand as three bars in the main blue, the word beside it (so it never relies on the bars alone). */
export function DemandMeter({ demand, tone = 'light' }: { demand: Demand; tone?: 'light' | 'dark' }) {
  const { t } = useTranslation()
  const level = LEVEL[demand]
  const off = tone === 'dark' ? 'bg-white/20' : 'bg-ash-200'
  const on = tone === 'dark' ? 'bg-white' : 'bg-blue'
  return (
    <span className="flex items-center gap-2">
      <span aria-hidden="true" className="flex h-4 items-end gap-0.5">
        {HEIGHTS.map((height, index) => (
          <span key={height} className={`w-1.5 rounded-sm ${height} ${index < level ? on : off}`} />
        ))}
      </span>
      <span className={`text-xs font-light ${tone === 'dark' ? 'text-white/80' : 'text-muted'}`}>
        {t(`demand.${demand}`)}
      </span>
    </span>
  )
}
