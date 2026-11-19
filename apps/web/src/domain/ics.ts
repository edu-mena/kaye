import type { DeadlineItem } from './deadlines'

// "Adicionar ao calendário": an .ics file the phone's calendar opens, made here, with no server.

/** Text escaped for an iCalendar value. */
const escape = (text: string) => text.replace(/[\\;,]/g, (char) => `\\${char}`).replace(/\n/g, '\\n')

const compact = (iso: string) => iso.replaceAll('-', '')

/** The day after an ISO day (DTEND of an all-day event is exclusive). */
const nextDay = (iso: string) =>
  new Date(Date.parse(`${iso}T00:00:00Z`) + 86_400_000).toISOString().slice(0, 10)

/** What a calendar event needs: a deadline (one day) or an event of the news (it may last several days). */
export type CalendarEvent = Pick<DeadlineItem, 'id' | 'title' | 'date'> & { ends?: string }

/** One all-day event on the deadline (or from `date` to `ends`), with a reminder 3 days before. */
export function toIcs(item: CalendarEvent, label: string, url: string, now = new Date()): string {
  const stamp = now
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}/, '')
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Kaye//Prazos//PT',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:${item.id}@kaye`,
    `DTSTAMP:${stamp}`,
    `DTSTART;VALUE=DATE:${compact(item.date)}`,
    `DTEND;VALUE=DATE:${compact(nextDay(item.ends ?? item.date))}`,
    `SUMMARY:${escape(`${label}: ${item.title}`)}`,
    `URL:${url}`,
    'BEGIN:VALARM',
    'ACTION:DISPLAY',
    `DESCRIPTION:${escape(`${label}: ${item.title}`)}`,
    'TRIGGER:-P3D',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
    '',
  ].join('\r\n')
}
