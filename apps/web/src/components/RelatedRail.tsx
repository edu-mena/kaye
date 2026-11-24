import { useId } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { Icon, type IconName } from './icons'
import { InstitutionLogo } from './InstitutionLogo'

type RelatedItem = {
  id: string
  to: string
  name: string
  logo?: string
  logoOnDark?: boolean
  /** One line under the name: why it is here ("3 cursos para esta carreira"). */
  meta: string
}

type RelatedRailProps = {
  title: string
  icon: IconName
  items: RelatedItem[]
  seeAllTo?: string
  seeAllLabel?: string
  /** How many to show. */
  max?: number
  className?: string
}

/**
 * Institutions or companies linked to what the person is reading: a row that scrolls sideways on a phone and
 * wraps into a grid on a wide screen. Renders nothing without items.
 */
export function RelatedRail({
  title,
  icon,
  items,
  seeAllTo,
  seeAllLabel,
  max = 8,
  className = '',
}: RelatedRailProps) {
  const { t } = useTranslation()
  const id = useId()
  if (items.length === 0) return null

  return (
    <section aria-labelledby={id} className={className}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 id={id} className="flex min-w-0 items-center gap-2.5 text-base font-semibold text-night">
          <span className="grid size-8 shrink-0 place-items-center rounded-full bg-blue text-white">
            <Icon name={icon} className="size-4" />
          </span>
          <span className="truncate">{title}</span>
        </h3>
        {seeAllTo && (
          <Link
            to={seeAllTo}
            className="shrink-0 text-sm font-normal text-night underline underline-offset-2 hover:text-blue"
          >
            {seeAllLabel ?? t('common.seeAll')}
          </Link>
        )}
      </div>
      <ul className="-mx-1 no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto px-1 pb-1 lg:mx-0 lg:grid lg:grid-cols-4 lg:overflow-visible lg:px-0">
        {items.slice(0, max).map((item) => (
          <li key={item.id} className="w-44 shrink-0 snap-start lg:w-auto">
            <Link
              to={item.to}
              className="flex h-full flex-col gap-3 rounded-2xl bg-ash-100 p-3 hover:bg-ash-200"
            >
              <InstitutionLogo institution={item} />
              <span className="line-clamp-2 text-sm font-semibold text-night">{item.name}</span>
              <span className="mt-auto text-xs font-light text-muted">{item.meta}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
