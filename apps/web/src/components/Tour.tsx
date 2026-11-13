import {
  useCallback,
  useEffect,
  useEffectEvent,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate } from 'react-router'
import { useCareers } from '../data/queries'
import { tourSteps, type TourStepId } from '../domain/tour'
import { useFocusMode } from '../lib/focusMode'
import { TOUR_RESTART } from '../lib/tourRestart'
import { usePersistentFlag } from '../lib/usePersistentFlag'
import { useRecommendations } from '../lib/useRecommendations'
import { useUser } from '../state/userStore'
import { Button } from './ui/Button'

// The tutorial after onboarding: a floating card, not modal, that points at elements marked with
// data-tour="<id>" (domain/tour.ts). Shown once; Configurações can start it again.

/** How long a step waits for its element (lazy pages and their data) before it is skipped. */
const WAIT_MS = 4000
const POLL_MS = 100
const GAP = 12
const CARD_WIDTH = 320

/** The element of a step that is actually on screen: the sidebar and the bottom bar both exist. */
function findTarget(id: TourStepId): HTMLElement | null {
  const all = document.querySelectorAll<HTMLElement>(`[data-tour="${id}"]`)
  return [...all].find((element) => element.getClientRects().length > 0) ?? null
}

type Rect = { top: number; left: number; width: number; height: number }

const sameRect = (a: Rect | null, b: Rect | null) =>
  a === b ||
  (a !== null &&
    b !== null &&
    a.top === b.top &&
    a.left === b.left &&
    a.width === b.width &&
    a.height === b.height)

/** Follows an element's position while the page scrolls or resizes. */
function useRect(element: HTMLElement | null) {
  const [rect, setRect] = useState<Rect | null>(null)
  useEffect(() => {
    if (!element) return
    let frame = 0
    let last: Rect | null = null
    const measure = () => {
      const box = element.isConnected ? element.getBoundingClientRect() : null
      const next =
        box && box.width > 0 ? { top: box.top, left: box.left, width: box.width, height: box.height } : null
      if (!sameRect(last, next)) {
        last = next
        setRect(next)
      }
      frame = requestAnimationFrame(measure)
    }
    measure()
    return () => cancelAnimationFrame(frame)
  }, [element])
  // Without an element there is nothing to frame, whatever was measured before.
  return element ? rect : null
}

const useWide = () => {
  const query = '(min-width: 1024px)'
  const [wide, setWide] = useState(() => window.matchMedia(query).matches)
  useEffect(() => {
    const media = window.matchMedia(query)
    const change = () => setWide(media.matches)
    media.addEventListener('change', change)
    return () => media.removeEventListener('change', change)
  }, [])
  return wide
}

/** Mounted by the layout: decides whether the tour runs and walks through its steps. */
export function TourHost() {
  const { discovery } = useUser()
  const focus = useFocusMode()
  const { data: careers } = useCareers()
  const recommendations = useRecommendations(1)
  const [done, setDone] = usePersistentFlag('kaye.tour.done', false)
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const career = recommendations?.[0]?.career.slug ?? null
  const steps = useMemo(() => tourSteps(discovery, career), [discovery, career])
  const [position, setPosition] = useState({ index: 0, direction: 1 })
  const [skipped, setSkipped] = useState<ReadonlySet<TourStepId>>(new Set())
  const [target, setTarget] = useState<HTMLElement | null>(null)
  // Wait for the careers, so the steps that need one do not appear halfway through.
  const active = !done && !focus && careers !== undefined
  const step = steps[position.index]

  useEffect(() => {
    const restart = () => {
      setPosition({ index: 0, direction: 1 })
      setSkipped(new Set())
      setDone(false)
    }
    window.addEventListener(TOUR_RESTART, restart)
    return () => window.removeEventListener(TOUR_RESTART, restart)
  }, [setDone])

  const finish = useCallback(() => {
    setTarget(null)
    setDone(true)
  }, [setDone])

  const go = useCallback((direction: 1 | -1) => {
    setPosition(({ index }) => ({ index: index + direction, direction }))
  }, [])

  // Only a new step moves the page: re-renders (data arriving, the person scrolling) must not.
  const onFinish = useEffectEvent(finish)
  const goTo = useEffectEvent((to: string) => {
    if (window.location.pathname !== to.split('?')[0]) void navigate(to)
  })
  const stepId = step?.id
  const stepTo = step?.to

  useEffect(() => {
    if (!active) return
    if (!stepId || !stepTo) {
      // No step left (the last ones were skipped): ending the tour is this effect's job, as it is the one walking it.
      // oxlint-disable-next-line react/set-state-in-effect
      onFinish()
      return
    }
    setTarget(null)
    goTo(stepTo)

    let waited = 0
    const timer = window.setInterval(() => {
      const element = findTarget(stepId)
      if (element) {
        window.clearInterval(timer)
        const tall = element.getBoundingClientRect().height > window.innerHeight * 0.5
        element.scrollIntoView({ block: tall ? 'start' : 'center', behavior: 'smooth' })
        setTarget(element)
        return
      }
      waited += POLL_MS
      if (waited < WAIT_MS) return
      // Not on this screen: leave it out and keep going the same way.
      window.clearInterval(timer)
      setSkipped((current) => new Set(current).add(stepId))
      setPosition(({ index, direction }) =>
        index + direction < 0 ? { index: index + 1, direction: 1 } : { index: index + direction, direction },
      )
    }, POLL_MS)
    return () => window.clearInterval(timer)
  }, [active, stepId, stepTo])

  // The person followed a link of their own (such as "Criar CV"): they are exploring, the tour ends.
  // Only a change of page counts; when the tour itself moves, the target is already cleared.
  const onPage = useEffectEvent((path: string) => {
    if (target && stepTo && path !== stepTo.split('?')[0]) finish()
  })
  // The address is outside React (the router): following it is what an effect is for.
  // oxlint-disable-next-line react/set-state-in-effect
  useEffect(() => onPage(pathname), [pathname])

  if (!active || !step || !target) return null

  const shown = steps.filter((item) => !skipped.has(item.id))
  const current = shown.findIndex((item) => item.id === step.id)
  const earlier = steps.slice(0, position.index).some((item) => !skipped.has(item.id))

  return (
    <TourCard
      key={step.id}
      id={step.id}
      target={target}
      current={current}
      total={shown.length}
      onPrevious={earlier ? () => go(-1) : undefined}
      onNext={() => go(1)}
      onClose={finish}
    />
  )
}

type TourCardProps = {
  id: TourStepId
  target: HTMLElement
  current: number
  total: number
  onPrevious?: () => void
  onNext: () => void
  onClose: () => void
}

/**
 * The card: a frame around the element and, next to it (on phones, fixed above the bottom bar), a
 * title, a line or two, the progress and the buttons. Not modal: the page still works; Esc closes.
 */
function TourCard({ id, target, current, total, onPrevious, onNext, onClose }: TourCardProps) {
  const { t } = useTranslation()
  const titleId = useId()
  const card = useRef<HTMLDialogElement>(null)
  const rect = useRect(target)
  const wide = useWide()
  const [cardHeight, setCardHeight] = useState(0)
  const last = current === total - 1

  // Each step mounts a new card (key), so focusing on mount focuses every step.
  useEffect(() => {
    card.current?.focus({ preventScroll: true })
  }, [])

  // The card's height (it changes with the layout and the text) decides whether it fits next to the element.
  useLayoutEffect(() => {
    const element = card.current
    if (!element) return
    const observer = new ResizeObserver(() => setCardHeight(element.offsetHeight))
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  let placement: CSSProperties | undefined = wide ? { bottom: GAP * 2, right: GAP * 2 } : undefined
  if (wide && rect && cardHeight > 0) {
    const left = Math.min(Math.max(rect.left, GAP), window.innerWidth - CARD_WIDTH - GAP)
    const below = rect.top + rect.height + GAP
    const above = rect.top - GAP - cardHeight
    if (below + cardHeight <= window.innerHeight - GAP) placement = { top: below, left }
    else if (above >= GAP) placement = { top: above, left }
    // Taller than the room around it: the corner, so it never covers the element's start.
    else placement = { bottom: GAP * 2, right: GAP * 2 }
  }

  return (
    <>
      {rect && (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed z-40 rounded-2xl ring-4 ring-gold transition-all duration-200"
          style={{ top: rect.top - 6, left: rect.left - 6, width: rect.width + 12, height: rect.height + 12 }}
        />
      )}
      {/* Non-modal (open, not showModal): the page still works. m-0 and the width undo the browser's dialog centring. */}
      <dialog
        ref={card}
        open
        aria-labelledby={titleId}
        tabIndex={-1}
        className={`fixed z-40 m-0 rounded-card bg-coal p-5 text-white shadow-lift outline-none ${
          wide ? 'w-80' : 'inset-x-3 bottom-[calc(max(env(safe-area-inset-bottom),0.75rem)+5.25rem)] w-auto'
        }`}
        style={placement}
      >
        <div className="flex items-start justify-between gap-3">
          <h2 id={titleId} className="text-base font-semibold">
            {t(`tour.${id}Title`)}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="-mt-0.5 shrink-0 rounded-full px-2 py-0.5 text-xs font-normal text-white/70 hover:bg-white/10 hover:text-white"
          >
            {t('tour.skip')}
          </button>
        </div>
        <p className="mt-1 text-sm font-light text-white/80">{t(`tour.${id}Body`)}</p>

        <div className="mt-4 flex items-center justify-between gap-3">
          <ol aria-label={t('tour.progress', { current: current + 1, total })} className="flex gap-1.5">
            {Array.from({ length: total }, (_, index) => (
              <li
                key={index}
                className={`h-1.5 rounded-full transition-all ${
                  index === current ? 'w-4 bg-gold' : 'w-1.5 bg-white/30'
                }`}
              />
            ))}
          </ol>
          <div className="flex items-center gap-1">
            {onPrevious && (
              <Button variant="onDarkOutline" size="xs" onClick={onPrevious}>
                {t('tour.previous')}
              </Button>
            )}
            <Button variant="onDark" size="xs" onClick={last ? onClose : onNext}>
              {last ? t('tour.finish') : t('tour.next')}
            </Button>
          </div>
        </div>
      </dialog>
    </>
  )
}
