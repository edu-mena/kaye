import { api } from '../lib/api'
import { i18n } from '../lib/i18n'

// Pre-launch: the waiting list and the critiques sent from the site (api/_waitlist.ts).
// The contact is asked on the landing page and, mandatory, at the start of the onboarding.
// When the server cannot be reached, the visitor can send the same text by WhatsApp instead.

const KAYE_WHATSAPP = '244927450909'

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE = /^\+?\d{7,16}$/

type SignupSource = 'landing' | 'onboarding'
export type Signup = {
  name: string
  email: string
  whatsapp: string
  consent: boolean
  website: string
  source: SignupSource
}
export type FeedbackKind = 'critique' | 'idea' | 'bug'
export type Feedback = { kind: FeedbackKind; message: string; page: 'landing' | 'support'; website: string }

/** What is wrong with a contact: nothing given, or a field that does not look right. */
export type ContactProblems = { missing?: true; email?: true; whatsapp?: true }

/** At least an email or a WhatsApp number, and each one given must look valid. */
export function contactProblems(email: string, whatsapp: string): ContactProblems {
  const mail = email.trim()
  const phone = whatsapp.replace(/[\s().-]/g, '')
  const problems: ContactProblems = {}
  if (!mail && !phone) problems.missing = true
  if (mail && !EMAIL.test(mail)) problems.email = true
  if (phone && !PHONE.test(phone)) problems.whatsapp = true
  return problems
}

/** POST /waitlist: `already` when the email or number was on the list before. */
export function joinWaitlist(signup: Signup): Promise<{ ok: true; already?: boolean }> {
  return api('/waitlist', { method: 'POST', body: JSON.stringify({ ...signup, lang: i18n.language }) })
}

/** POST /feedback: a critique, an idea or a bug, read by the Kayé team. */
export function sendFeedback(feedback: Feedback): Promise<{ ok: true }> {
  return api('/feedback', { method: 'POST', body: JSON.stringify({ ...feedback, lang: i18n.language }) })
}

/** The fallback: the same text, ready to send from the visitor's own WhatsApp. */
export const whatsappLink = (text: string) =>
  `https://wa.me/${KAYE_WHATSAPP}?text=${encodeURIComponent(text)}`

const JOINED = 'kaye.waitlist.joined'
const PENDING = 'kaye.waitlist.pending'

function read(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

function write(key: string, value: string | null): void {
  try {
    if (value === null) localStorage.removeItem(key)
    else localStorage.setItem(key, value)
  } catch {
    // Private mode or blocked storage: nothing to keep, nothing breaks.
  }
}

export const hasJoined = () => read(JOINED) === '1'
export const markJoined = () => write(JOINED, '1')

/**
 * Sends a contact without making the person wait. It is kept on the device until the server
 * confirms it, so a contact typed without network goes the next time the app opens.
 */
export async function submitSignup(signup: Signup): Promise<void> {
  write(PENDING, JSON.stringify(signup))
  try {
    await joinWaitlist(signup)
    write(PENDING, null)
    markJoined()
  } catch {
    // Stays pending for retryPendingSignup.
  }
}

/** Called when the app starts: a contact that could not be sent before is sent now. */
export function retryPendingSignup(): void {
  const saved = read(PENDING)
  if (!saved) return
  try {
    void submitSignup(JSON.parse(saved) as Signup)
  } catch {
    write(PENDING, null)
  }
}
