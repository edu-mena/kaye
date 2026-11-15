import type { Mentor } from '../../data/types'

/** Digits only, with the country code; without it there is no WhatsApp option. */
const WHATSAPP = import.meta.env.VITE_KAYE_WHATSAPP?.replace(/\D/g, '') || undefined
const EMAIL = import.meta.env.VITE_KAYE_EMAIL || undefined

/** Without a WhatsApp number or an email for Kayé, the "Pedir conversa" button does not show. */
export const canRequest = Boolean(WHATSAPP || EMAIL)

export type RequestChannel = 'whatsapp' | 'email'

export const requestChannels: RequestChannel[] = [
  ...(WHATSAPP ? (['whatsapp'] as const) : []),
  ...(EMAIL ? (['email'] as const) : []),
]

/** Minors only ever ask for a group session (docs/mentores.md). */
export function sessionKind(mentor: Mentor, minor: boolean): Mentor['availability'] {
  return minor ? 'grupo' : mentor.availability
}

/** The link that opens the message, ready to send; nothing is kept in the app. */
export function requestHref(channel: RequestChannel, subject: string, body: string): string {
  if (channel === 'whatsapp') return `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(body)}`
  return `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
}
