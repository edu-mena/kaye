import { afterEach, describe, expect, it, vi } from 'vitest'
import { canStartTopic, dailyLimit, withCompletion } from './dailyTopic'
import { todayIso } from './scholarships'

afterEach(() => vi.useRealTimers())

describe('canStartTopic', () => {
  const done = [{ topic: 'u1', day: '2026-11-24' }]

  it('closes after one topic finished today, for the free account', () => {
    expect(canStartTopic([], '2026-11-24', 1)).toBe(true)
    expect(canStartTopic(done, '2026-11-24', 1)).toBe(false)
  })

  it('two topics finished on the same day: the next never opens', () => {
    const two = withCompletion(done, 'u2', '2026-11-24')
    expect(two).toHaveLength(2)
    expect(canStartTopic(two, '2026-11-24', 1)).toBe(false)
  })

  it('opens again at the local midnight', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 10, 24, 23, 59, 0))
    expect(todayIso()).toBe('2026-11-24')
    expect(canStartTopic(done, todayIso(), 1)).toBe(false)
    vi.setSystemTime(new Date(2026, 10, 25, 0, 0, 1))
    expect(todayIso()).toBe('2026-11-25')
    expect(canStartTopic(done, todayIso(), 1)).toBe(true)
  })

  it('a topic keeps its first day when finished again', () => {
    expect(withCompletion(done, 'u1', '2026-11-30')).toEqual(done)
  })
})

describe('dailyLimit', () => {
  const many = ['u1', 'u2', 'u3'].map((topic) => ({ topic, day: '2026-11-24' }))

  it('flag off: nothing closes, however many topics were done', () => {
    expect(canStartTopic(many, '2026-11-24', dailyLimit(false, false))).toBe(true)
  })

  it('flag on and no Plus: one a day, whatever the age (the limit never looks at it)', () => {
    expect(dailyLimit(true, false)).toBe(1)
    expect(canStartTopic(many.slice(0, 1), '2026-11-24', dailyLimit(true, false))).toBe(false)
  })

  it('with Plus there is no limit', () => {
    expect(canStartTopic(many, '2026-11-24', dailyLimit(true, true))).toBe(true)
  })
})
