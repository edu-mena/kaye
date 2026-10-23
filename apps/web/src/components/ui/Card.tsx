import type { HTMLAttributes } from 'react'

type Tone = 'surface' | 'navy' | 'gold'

const TONES: Record<Tone, string> = {
  surface: 'bg-surface text-ink shadow-card',
  navy: 'bg-navy text-white',
  gold: 'bg-gold-soft text-navy',
}

type CardProps = HTMLAttributes<HTMLDivElement> & { tone?: Tone; as?: 'div' | 'section' | 'article' }

export function Card({ tone = 'surface', as: Tag = 'div', className = '', ...props }: CardProps) {
  return <Tag className={`rounded-card p-5 ${TONES[tone]} ${className}`} {...props} />
}
