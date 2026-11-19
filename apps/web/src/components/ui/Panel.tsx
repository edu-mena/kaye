import type { ReactNode } from 'react'
import { Icon, type IconName } from '../icons'

type PanelProps = {
  id: string
  icon: IconName
  title: string
  /** On the right of the title: "Ver todas", "Em breve". */
  action?: ReactNode
  /** `muted`: grey and flat, for what is not there yet, so it does not pass for live data. */
  tone?: 'surface' | 'muted'
  /** 3 when the panel sits in a titled section of the page. */
  level?: 2 | 3
  children: ReactNode
  className?: string
}

const TONES = {
  surface: { block: 'bg-surface shadow-card', icon: 'bg-blue text-white' },
  muted: { block: 'bg-ash-100', icon: 'bg-white text-muted' },
}

/**
 * A compact block of a dashboard page (Mercado, Novidades): a small title with its icon in a
 * circle, an action on the right, and the content.
 */
export function Panel({
  id,
  icon,
  title,
  action,
  tone = 'surface',
  level = 2,
  children,
  className = '',
}: PanelProps) {
  const Heading = level === 2 ? 'h2' : 'h3'
  return (
    <section aria-labelledby={id} className={`rounded-2xl p-4 sm:p-5 ${TONES[tone].block} ${className}`}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <Heading id={id} className="flex items-center gap-2 text-sm font-semibold text-night">
          <span className={`grid size-6 shrink-0 place-items-center rounded-full ${TONES[tone].icon}`}>
            <Icon name={icon} className="size-3.5" />
          </span>
          {title}
        </Heading>
        {action}
      </div>
      {children}
    </section>
  )
}
