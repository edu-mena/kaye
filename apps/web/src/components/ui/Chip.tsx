import type { ReactNode } from 'react'

type ChipTone = 'neutral' | 'navy' | 'gold' | 'goldSoft' | 'success' | 'coral'

const TONES: Record<ChipTone, string> = {
  neutral: 'bg-navy-100 text-navy',
  navy: 'bg-navy text-white',
  gold: 'bg-gold text-navy',
  goldSoft: 'bg-gold-soft text-navy',
  success: 'bg-success-soft text-success',
  coral: 'bg-coral-soft text-coral',
}

type ChipProps = { tone?: ChipTone; children: ReactNode; className?: string }

/** Small label for a state or a fact ("Alta procura", "Reconhecido"). Not a button. */
export function Chip({ tone = 'neutral', children, className = '' }: ChipProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${TONES[tone]} ${className}`}
    >
      {children}
    </span>
  )
}
