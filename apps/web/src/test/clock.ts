import { vi } from 'vitest'

/** Fakes the clock for a timed screen (intervals and Date); the test must call vi.useRealTimers() after. */
export function fakeClock() {
  vi.useFakeTimers({ shouldAdvanceTime: true, toFake: ['setInterval', 'clearInterval', 'Date'] })
}

/**
 * Moves the clock forward at once, then lets one tick of the screen's timer run. Advancing tick by tick
 * through an hour re-renders the page thousands of times and is far too slow.
 */
export async function jumpTime(ms: number) {
  vi.setSystemTime(Date.now() + ms)
  await vi.advanceTimersByTimeAsync(600)
}
