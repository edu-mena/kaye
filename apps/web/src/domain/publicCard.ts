import type { PublicCard } from '../data/types'

// The public page shows only what the person ticked. `name` is the one field it cannot go without.

export const PUBLIC_FIELDS = ['headline', 'photo', 'email', 'whatsapp', 'linkedin', 'portfolio'] as const
export type PublicField = (typeof PUBLIC_FIELDS)[number]

export type PublicDraft = Record<PublicField, string> & { name: string }

const EMAIL = /[^\s@]+@[^\s@]+\.[^\s@]+/
const PHONE = /^\+?[\d\s()-]{7,}$/

/** A first draft from the card's contacts, so the person only has to tick. Nothing is sent yet. */
export function draftFromContacts(name: string, headline: string, contacts: string[]): PublicDraft {
  const find = (test: (line: string) => boolean) => contacts.find(test) ?? ''
  const linkedin = find((line) => /linkedin\.com/i.test(line))
  return {
    name,
    headline,
    photo: '',
    email: find((line) => EMAIL.test(line)),
    whatsapp: find((line) => PHONE.test(line)),
    linkedin,
    portfolio: find((line) => line !== linkedin && !EMAIL.test(line) && /\.[a-z]{2,}(\/|$)/i.test(line)),
  }
}

/** "github.com/ana" → "https://github.com/ana" */
function asLink(value: string): string {
  return /^https?:\/\//i.test(value) ? value : `https://${value}`
}

/** Only the ticked fields, cleaned up, ready to be sent. */
export function publicCardFrom(draft: PublicDraft, chosen: PublicField[], accent: string): PublicCard {
  const card: PublicCard = { name: draft.name.trim(), accent }
  for (const field of chosen) {
    const value = draft[field].trim()
    if (!value) continue
    if (field === 'linkedin' || field === 'portfolio') card[field] = asLink(value)
    else if (field === 'whatsapp') card.whatsapp = value.replace(/[^\d+]/g, '')
    else card[field] = value
  }
  return card
}

/** The address of a public page on this site. */
export function publicUrl(slug: string): string {
  return `${window.location.origin}/c/${slug}`
}
