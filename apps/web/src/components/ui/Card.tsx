import type { HTMLAttributes } from 'react'

type Tone = 'surface' | 'gray' | 'navy' | 'night' | 'coal' | 'notice'

const TONES: Record<Tone, string> = {
  surface: 'bg-surface text-ink shadow-card',
  /** For blocks inside a white card. */
  gray: 'bg-ash-100 text-ink',
  navy: 'bg-navy text-white',
  night: 'bg-night text-white',
  coal: 'bg-coal text-white',
  /** A notice that must be seen: navy outline, no tinted fill. */
  notice: 'border-2 border-navy bg-surface text-navy',
}

type CardProps = HTMLAttributes<HTMLDivElement> & { tone?: Tone; as?: 'div' | 'section' | 'article' }

export function Card({ tone = 'surface', as: Tag = 'div', className = '', ...props }: CardProps) {
  return <Tag className={`rounded-card p-5 ${TONES[tone]} ${className}`} {...props} />
}
