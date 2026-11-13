import { type CalendarEvent, toIcs } from '../domain/ics'
import { appUrl } from './share'

/** Downloads the event as a Blob: the phone's calendar opens it, with no server. */
export function addToCalendar(event: CalendarEvent, label: string, path: string) {
  const link = document.createElement('a')
  link.href = URL.createObjectURL(
    new Blob([toIcs(event, label, appUrl(path))], { type: 'text/calendar;charset=utf-8' }),
  )
  link.download = `${event.id}.ics`
  link.click()
  URL.revokeObjectURL(link.href)
}
