import type { ReactNode } from 'react'

type HexagonProps = {
  children: ReactNode
  tone?: 'dark' | 'gold' | 'locked'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const TONES = {
  dark: { fill: 'fill-coal', stroke: 'stroke-white/50', text: 'text-white' },
  gold: { fill: 'fill-gold', stroke: 'stroke-night', text: 'text-night' },
  locked: { fill: 'fill-ash-100', stroke: 'stroke-track', text: 'text-muted' },
}

const SIZES = { sm: 'size-12 text-sm', md: 'size-20 text-xl', lg: 'size-28 text-3xl' }

/**
 * The Kayé hexagon: Holland's model has six interests arranged as a hexagon, so
 * the RIASEC code and the achievements share this shape. Decorative frame; the
 * content inside carries the meaning.
 */
export function Hexagon({ children, tone = 'dark', size = 'md', className = '' }: HexagonProps) {
  const style = TONES[tone]

  return (
    <span className={`relative inline-grid shrink-0 place-items-center ${SIZES[size]} ${className}`}>
      <svg viewBox="0 0 100 100" aria-hidden="true" className="absolute inset-0 size-full">
        <polygon
          points="50,4 90,27 90,73 50,96 10,73 10,27"
          className={`${style.fill} ${style.stroke}`}
          strokeWidth="4"
          strokeLinejoin="round"
        />
      </svg>
      <span className={`relative font-display font-bold ${style.text}`}>{children}</span>
    </span>
  )
}
