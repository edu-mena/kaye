import type { ReactNode } from 'react'
import type { Photo } from '../../data/types'
import { PhotoImg } from '../../components/PhotoImg'
import { stagger } from '../../lib/ui'

/**
 * The grid of the signed-in home: 12 columns on large screens, 6 on tablets, one column on phones
 * (natural height). The DOM order is the reading order, for screen readers and the keyboard.
 */
export function BentoGrid({ children }: { children: ReactNode }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-flow-dense sm:auto-rows-[minmax(11rem,auto)] sm:grid-cols-6 lg:grid-cols-12">
      {children}
    </div>
  )
}

type TileSize = 'hero' | 'wide' | 'tall' | 'square' | 'feed'
/** `plain`: the content is already a card (TestCard, CvCard…) and brings its own surface. */
type TileTone = 'surface' | 'coal' | 'blue' | 'photo' | 'plain'

const SIZES: Record<TileSize, string> = {
  hero: 'sm:col-span-6 sm:row-span-2 lg:col-span-8',
  wide: 'sm:col-span-6 lg:col-span-8',
  tall: 'sm:col-span-3 sm:row-span-2 lg:col-span-4',
  square: 'sm:col-span-3 lg:col-span-4',
  feed: 'sm:col-span-6 sm:row-span-3 lg:col-span-8',
}

const TONES: Record<TileTone, string> = {
  surface: 'bg-surface text-ink shadow-card p-5 sm:p-6',
  coal: 'bg-coal text-white p-5 sm:p-6',
  blue: 'bg-blue text-white p-5 sm:p-6',
  photo: 'bg-coal text-white p-5 sm:p-6',
  plain: '[&>*]:h-full',
}

type TileProps = {
  size: TileSize
  tone?: TileTone
  /** The id of the tile's heading (h1/h2), for `aria-labelledby`. */
  labelledBy: string
  /** For `tone="photo"`: the background photo. */
  photo?: Photo
  /** The hero's photo loads first. */
  priority?: boolean
  /** Position, for the entrance stagger. */
  index: number
  className?: string
  children: ReactNode
  'data-tour'?: string
}

export function Tile({
  size,
  tone = 'surface',
  labelledBy,
  photo,
  priority,
  index,
  className = '',
  children,
  ...rest
}: TileProps) {
  return (
    <section
      aria-labelledby={labelledBy}
      data-tour={rest['data-tour']}
      style={stagger(index)}
      className={`group relative min-w-0 rise overflow-hidden rounded-card transition-shadow duration-300 hover:shadow-lift ${SIZES[size]} ${TONES[tone]} ${className}`}
    >
      {tone === 'photo' && photo && (
        <>
          <PhotoImg
            photo={photo}
            priority={priority}
            sizes={
              size === 'hero'
                ? '(min-width: 1024px) 66vw, 100vw'
                : '(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw'
            }
            className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          />
          {/* Dark under the text, so white stays AA on any photo. */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-coal via-coal/80 to-coal/40"
          />
        </>
      )}
      {tone === 'plain' ? children : <div className="relative flex h-full flex-col">{children}</div>}
    </section>
  )
}

/**
 * The single main link of a tile: it covers the whole tile (a stretched link), so the tile is
 * clickable without links inside links. Anything else interactive in the tile needs `relative z-10`.
 */
export const STRETCHED =
  'after:absolute after:inset-0 after:rounded-2xl after:content-[""] focus-visible:outline-none focus-visible:after:ring-2 focus-visible:after:ring-blue focus-visible:after:ring-offset-2'
