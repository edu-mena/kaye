import type { ReactNode } from 'react'
import { Icon, type IconName } from '../../components/icons'

/** A small link next to a card title. */
export const CARD_LINK = 'shrink-0 text-sm font-normal text-blue underline-offset-4 hover:underline'

type CardHeadingProps = { icon: IconName; children: ReactNode; id?: string; action?: ReactNode }

/** A card's title with its icon in a circle of the main blue, like the app's other cards. */
export function CardHeading({ icon, children, id, action }: CardHeadingProps) {
  return (
    <div className="flex items-center justify-between gap-3">
      <h2 id={id} className="flex min-w-0 items-center gap-2.5 text-base font-semibold text-night">
        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-blue text-white">
          <Icon name={icon} className="size-4" />
        </span>
        <span className="truncate">{children}</span>
      </h2>
      {action}
    </div>
  )
}
