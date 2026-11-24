// The streak: days in a row with a useful action. Dates are local days ("2026-11-24"); all the
// arithmetic is on the calendar day at noon UTC, so time zones and summer time never move a day.

const DAY = 86_400_000
const ms = (day: string) => Date.parse(`${day}T12:00:00Z`)
const iso = (time: number) => new Date(time).toISOString().slice(0, 10)

/** The day before (or `count` days before, or after when negative). */
const shiftDay = (day: string, count: number) => iso(ms(day) - count * DAY)

/**
 * Days in a row that end today or yesterday (the day is not over yet), forgiving one missed day:
 * a single gap between two active days does not cut the streak, two in a row do. Missed days are
 * not counted as days of the streak.
 */
export function currentStreak(activity: readonly string[], today: string): number {
  const days = new Set(activity)
  let cursor = days.has(today) ? today : shiftDay(today, 1)
  if (!days.has(cursor)) return 0
  let streak = 1
  // Back one day, or two when exactly one day is missing in between.
  for (;;) {
    const previous = [1, 2].map((back) => shiftDay(cursor, back)).find((day) => days.has(day))
    if (!previous) return streak
    streak += 1
    cursor = previous
  }
}

export type DayState = 'done' | 'today' | 'rest' | 'future'
export type WeekDay = { day: string; state: DayState }

/**
 * Monday to Sunday of the week of `today`. `done`: something was done; `today`: today, still to do;
 * `rest`: a past day without activity (not a failure: the streak forgives one); `future`.
 */
export function weekView(activity: readonly string[], today: string): WeekDay[] {
  const days = new Set(activity)
  const weekday = (new Date(ms(today)).getUTCDay() + 6) % 7 // Monday = 0
  const monday = shiftDay(today, weekday)
  return Array.from({ length: 7 }, (_, index) => {
    const day = shiftDay(monday, -index)
    const state: DayState = days.has(day) ? 'done' : day === today ? 'today' : day > today ? 'future' : 'rest'
    return { day, state }
  })
}
