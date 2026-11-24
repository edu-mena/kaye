import { describe, expect, it } from 'vitest'
import { currentStreak, weekView } from './streak'

describe('currentStreak', () => {
  it('is 0 without activity, or when the last one is older than yesterday', () => {
    expect(currentStreak([], '2026-11-24')).toBe(0)
    expect(currentStreak(['2026-11-20'], '2026-11-24')).toBe(0)
  })

  it('counts the days in a row up to today, or up to yesterday while today is not over', () => {
    expect(currentStreak(['2026-11-22', '2026-11-23', '2026-11-24'], '2026-11-24')).toBe(3)
    expect(currentStreak(['2026-11-22', '2026-11-23'], '2026-11-24')).toBe(2)
  })

  it('forgives one missed day, but not two in a row', () => {
    expect(currentStreak(['2026-11-21', '2026-11-23', '2026-11-24'], '2026-11-24')).toBe(3)
    expect(currentStreak(['2026-11-20', '2026-11-23', '2026-11-24'], '2026-11-24')).toBe(2)
  })

  it('goes across the end of a month and of a year', () => {
    expect(currentStreak(['2026-10-30', '2026-10-31', '2026-11-01'], '2026-11-01')).toBe(3)
    expect(currentStreak(['2026-12-31', '2027-01-01'], '2027-01-01')).toBe(2)
    // 2028 is a leap year.
    expect(currentStreak(['2028-02-28', '2028-02-29', '2028-03-01'], '2028-03-01')).toBe(3)
  })

  it('ignores the order and the repeats of the days', () => {
    expect(currentStreak(['2026-11-24', '2026-11-23', '2026-11-24'], '2026-11-24')).toBe(2)
  })
})

describe('weekView', () => {
  it('is Monday to Sunday, with done, today, rest and future', () => {
    // 2026-11-25 is a Wednesday.
    const week = weekView(['2026-11-23'], '2026-11-25')
    expect(week.map((entry) => entry.day)).toEqual([
      '2026-11-23',
      '2026-11-24',
      '2026-11-25',
      '2026-11-26',
      '2026-11-27',
      '2026-11-28',
      '2026-11-29',
    ])
    expect(week.map((entry) => entry.state)).toEqual([
      'done',
      'rest',
      'today',
      'future',
      'future',
      'future',
      'future',
    ])
  })

  it('shows today as done once something was done, and starts on Monday even on a Sunday', () => {
    const week = weekView(['2026-11-29'], '2026-11-29')
    expect(week[0]?.day).toBe('2026-11-23')
    expect(week[6]).toEqual({ day: '2026-11-29', state: 'done' })
  })
})
