import { useEffect, useState } from 'react'

/**
 * True while the person scrolls down (past `threshold`), false as soon as they scroll up:
 * bars get out of the way while reading and come back when looking for something.
 */
export function useHideOnScroll(threshold = 80) {
  const [hidden, setHidden] = useState(false)

  useEffect(() => {
    let last = window.scrollY
    const onScroll = () => {
      const y = window.scrollY
      // Small moves (a finger resting, elastic scroll) change nothing.
      if (Math.abs(y - last) < 6) return
      setHidden(y > last && y > threshold)
      last = y
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [threshold])

  return hidden
}
