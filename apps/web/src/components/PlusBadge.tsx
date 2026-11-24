import { Chip } from './ui/Chip'

/** Marks a feature that is part of Kayé Plus. Only shown when the Plus is on and the person may see it. */
export function PlusBadge({ className = '' }: { className?: string }) {
  return (
    <Chip tone="gold" className={className}>
      Plus
    </Chip>
  )
}
