import type { ReactNode } from 'react'

type ChipTone = 'neutral' | 'navy' | 'night' | 'gold' | 'success' | 'coral' | 'white' | 'onDark'

// Outlined, never a tinted background (docs/design.md, Cores).
const TONES: Record<ChipTone, string> = {
  neutral: 'border-line text-night',
  navy: 'border-navy bg-navy text-white',
  night: 'border-night bg-night text-white',
  gold: 'border-gold bg-gold text-night',
  success: 'border-line text-success',
  coral: 'border-line text-coral',
  // On dark surfaces: solid white or gold for the strong state, a white outline otherwise.
  white: 'border-white bg-white text-night',
  onDark: 'border-white/40 text-white',
}

type ChipProps = { tone?: ChipTone; children: ReactNode; className?: string }

/**
 * Small label for a state or a fact ("Procura alta", "Reconhecido"). Not a button.
 * States carry a dot in their colour, so colour is never the only sign.
 */
export function Chip({ tone = 'neutral', children, className = '' }: ChipProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-semibold ${TONES[tone]} ${className}`}
    >
      {(tone === 'success' || tone === 'coral') && (
        <span aria-hidden="true" className="size-1.5 shrink-0 rounded-full bg-current" />
      )}
      {children}
    </span>
  )
}
