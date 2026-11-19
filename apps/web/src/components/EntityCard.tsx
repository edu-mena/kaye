import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { Icon } from './icons'
import { useDataSaver } from '../lib/useDataSaver'
import { InstitutionLogo } from './InstitutionLogo'
import { TapToLoad } from './PhotoImg'

type Entity = { id: string; name: string; logo?: string; logoOnDark?: boolean; banner?: string }

type EntityCardProps = {
  entity: Entity
  to: string
  /** One quiet line under the name ("Universidade · Pública"). */
  meta: string
  place: string
  /** A short gold-on-black label ("A partir dos 17 anos"). */
  badge?: string | undefined
  /** A button over the photo's corner, above the card's link (the bookmark). */
  action?: ReactNode
}

/**
 * An institution or a company in a directory: its photo (or a dark band), its logo over the edge
 * (or its initials), what it is and where. The whole card opens its page.
 */
export function EntityCard({ entity, to, meta, place, badge, action }: EntityCardProps) {
  const titleId = `card-${entity.id}`
  const saveData = useDataSaver()
  // Without a photo, the logo fills the band (on light, or on black when it is white).
  const logoBand = !entity.banner && entity.logo !== undefined
  const dark = !logoBand || entity.logoOnDark
  return (
    <article
      aria-labelledby={titleId}
      className="relative flex h-full flex-col overflow-hidden rounded-card bg-surface shadow-card transition hover:shadow-lift"
    >
      <div className={`relative h-24 shrink-0 sm:h-32 ${dark ? 'bg-coal' : 'bg-paper'}`}>
        {entity.banner && saveData && <TapToLoad src={entity.banner} className="size-full object-cover" />}
        {entity.banner && !saveData && (
          <img
            src={entity.banner}
            alt=""
            loading="lazy"
            decoding="async"
            className="size-full object-cover"
          />
        )}
        {logoBand && (
          <img
            src={entity.logo}
            alt=""
            loading="lazy"
            decoding="async"
            className="size-full object-contain px-10 pt-4 pb-8"
          />
        )}
        <span className="absolute -bottom-6 left-4 rounded-full ring-4 ring-surface">
          <InstitutionLogo institution={entity} />
        </span>
        {action && <div className="absolute top-2 right-2 z-10">{action}</div>}
      </div>
      <div className="flex flex-1 flex-col p-4 pt-9 sm:p-5 sm:pt-10">
        <h3 id={titleId} className="font-display text-base font-bold break-words text-night">
          <Link to={to} className="after:absolute after:inset-0">
            {entity.name}
          </Link>
        </h3>
        <p className="mt-0.5 text-xs font-light text-muted">{meta}</p>
        <p className="mt-3 flex items-center gap-1.5 text-xs font-light text-copy">
          <Icon name="pin" className="size-4 shrink-0 text-muted" />
          {place}
        </p>
        {badge && (
          <p className="mt-3 w-fit rounded-full bg-coal px-3 py-1 text-xs font-semibold text-gold">{badge}</p>
        )}
      </div>
    </article>
  )
}
