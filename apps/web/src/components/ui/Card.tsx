import type { HTMLAttributes } from 'react'

type Tone = 'surface' | 'gray' | 'coal' | 'notice'

const TONES: Record<Tone, string> = {
  surface: 'bg-surface text-ink shadow-card',
  /** For blocks inside a white card. */
  gray: 'bg-ash-100 text-ink',
  coal: 'bg-coal text-white',
  /** A notice that must be seen: blue outline, no tinted fill. */
  notice: 'border-2 border-blue bg-surface text-night',
}

type CardProps = HTMLAttributes<HTMLDivElement> & { tone?: Tone; as?: 'div' | 'section' | 'article' }

export function Card({ tone = 'surface', as: Tag = 'div', className = '', ...props }: CardProps) {
  return <Tag className={`rounded-card p-5 ${TONES[tone]} ${className}`} {...props} />
}
