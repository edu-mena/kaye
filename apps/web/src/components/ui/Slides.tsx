import { useRef, useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Icon } from '../icons'

type Slide = { id: string; label: string; content: ReactNode }

type SlidesProps = {
  /** What the slides are about (e.g. the course name), for screen readers. */
  label: string
  slides: Slide[]
  tone?: 'light' | 'dark'
}

const SWIPE = 40

/**
 * One piece of information at a time, with arrows, a dot per slide and a swipe on phones.
 * Never moves on its own. The hidden slides are inert, so the keyboard and screen readers
 * only meet the one on show (WAI-ARIA carousel pattern; fieldsets are its native groups).
 */
export function Slides({ label, slides, tone = 'light' }: SlidesProps) {
  const { t } = useTranslation()
  const [index, setIndex] = useState(0)
  const start = useRef<number | null>(null)
  const dark = tone === 'dark'
  const go = (next: number) => setIndex((next + slides.length) % slides.length)
  const arrow = `grid size-8 shrink-0 place-items-center rounded-full border transition-colors ${
    dark ? 'border-white/20 text-white hover:bg-white/10' : 'border-line text-night hover:bg-ash-100'
  }`

  return (
    <fieldset aria-roledescription={t('common.carousel')} aria-label={label} className="min-w-0">
      <div
        className="overflow-hidden"
        onTouchStart={(event) => {
          start.current = event.touches[0]?.clientX ?? null
        }}
        onTouchEnd={(event) => {
          const end = event.changedTouches[0]?.clientX
          if (start.current !== null && end !== undefined && Math.abs(end - start.current) > SWIPE) {
            go(index + (end < start.current ? 1 : -1))
          }
          start.current = null
        }}
      >
        <div
          className="flex transition-transform duration-300 motion-reduce:transition-none"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {slides.map((slide, position) => (
            <fieldset
              key={slide.id}
              aria-roledescription={t('common.slide')}
              aria-label={t('common.slideOf', {
                index: position + 1,
                count: slides.length,
                label: slide.label,
              })}
              inert={position !== index}
              className="w-full min-w-0 shrink-0"
            >
              {slide.content}
            </fieldset>
          ))}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-2">
        <button
          type="button"
          aria-label={t('common.previousSlide')}
          onClick={() => go(index - 1)}
          className={arrow}
        >
          <Icon name="arrowLeft" className="size-4" />
        </button>
        <div className="flex items-center">
          {slides.map((slide, position) => {
            const active = position === index
            return (
              <button
                key={slide.id}
                type="button"
                aria-label={slide.label}
                aria-current={active ? 'true' : undefined}
                onClick={() => setIndex(position)}
                className="grid h-6 min-w-6 place-items-center px-1"
              >
                <span
                  className={`block h-1.5 rounded-full transition-all ${
                    active
                      ? `w-5 ${dark ? 'bg-gold' : 'bg-night'}`
                      : `w-1.5 ${dark ? 'bg-white/30' : 'bg-ash-300'}`
                  }`}
                />
              </button>
            )
          })}
        </div>
        <button
          type="button"
          aria-label={t('common.nextSlide')}
          onClick={() => go(index + 1)}
          className={arrow}
        >
          <Icon name="arrowRight" className="size-4" />
        </button>
      </div>
    </fieldset>
  )
}
