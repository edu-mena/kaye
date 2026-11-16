import { useCallback, useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Icon } from '../icons'

/** Each card's width: two on a phone, three from md, four from xl (the gaps shared out). */
export const ROW_ITEM =
  'w-[calc(50%-0.375rem)] shrink-0 snap-start md:w-[calc(33.333%-0.5rem)] xl:w-[calc(25%-0.5625rem)]'

type CardRowProps = {
  /** The list's name (an ordered list: the order matters). */
  label: string
  /** The <li> items, each with ROW_ITEM. */
  children: ReactNode
}

/**
 * Cards side by side in one row that slides: a swipe on phones, and arrows that move a screenful
 * at a time. Native scrolling with snap points, so the keyboard and screen readers just meet a list.
 */
export function CardRow({ label, children }: CardRowProps) {
  const { t } = useTranslation()
  const id = useId()
  const row = useRef<HTMLOListElement>(null)
  const [edges, setEdges] = useState({ start: true, end: true })

  const measure = useCallback(() => {
    const element = row.current
    if (!element) return
    const start = element.scrollLeft <= 4
    const end = element.scrollLeft + element.clientWidth >= element.scrollWidth - 4
    // The same edges keep the same state, so measuring after every render settles at once.
    setEdges((current) => (current.start === start && current.end === end ? current : { start, end }))
  }, [])

  // After every render: a filter may have changed the cards.
  useEffect(() => measure())
  useEffect(() => {
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [measure])

  const move = (direction: 1 | -1) => {
    const element = row.current
    element?.scrollBy?.({ left: direction * element.clientWidth, behavior: 'smooth' })
  }
  const arrow =
    'grid size-10 place-items-center rounded-full bg-coal text-gold transition-colors hover:bg-night disabled:opacity-30 disabled:hover:bg-coal'

  return (
    <div>
      <ol
        id={id}
        ref={row}
        aria-label={label}
        onScroll={measure}
        // Focusable, so the keyboard can slide it even when the cards hold no link (the landing's screens).
        // oxlint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- a scrollable region must take focus (WCAG 2.1.1, axe scrollable-region-focusable)
        tabIndex={0}
        className="-mx-3 no-scrollbar flex snap-x snap-mandatory scroll-px-3 gap-3 overflow-x-auto rounded-2xl px-3 pt-1 pb-3 focus-visible:outline-2 focus-visible:outline-night sm:mx-0 sm:scroll-px-0 sm:px-0"
      >
        {children}
      </ol>
      <div className="mt-2 flex justify-end gap-2">
        <button
          type="button"
          aria-label={t('common.previous')}
          aria-controls={id}
          disabled={edges.start}
          onClick={() => move(-1)}
          className={arrow}
        >
          <Icon name="arrowLeft" className="size-4" />
        </button>
        <button
          type="button"
          aria-label={t('common.next')}
          aria-controls={id}
          disabled={edges.end}
          onClick={() => move(1)}
          className={arrow}
        >
          <Icon name="arrowRight" className="size-4" />
        </button>
      </div>
    </div>
  )
}
