import type { Academy } from '../data/types'

/** Whether a way to reach the institution is published: a phone, an email or an address. */
export const hasContacts = (academy: Academy) => Boolean(academy.phone ?? academy.email ?? academy.address)

/**
 * What a source confirms about the institution, one point a field, so the list can show the most complete first.
 * The map is a search, not a fact, so it does not count.
 */
export function completeness(academy: Academy): number {
  const social = academy.social ?? {}
  return [
    academy.website,
    academy.phone,
    academy.email,
    academy.address,
    social.facebook ?? social.instagram ?? social.linkedin,
    academy.founded,
    academy.recognizedBy,
    academy.ownership,
    academy.logo,
    academy.banner,
    academy.offers.length > 0 ? 'offers' : undefined,
    academy.offers.some((offer) => offer.fee) ? 'fee' : undefined,
  ].filter(Boolean).length
}

/** The facts the "Ajuda-nos a completar" link asks for: what a person could tell us. */
export function missingFacts(academy: Academy): ('phone' | 'email' | 'address' | 'founded' | 'website')[] {
  return (['phone', 'email', 'address', 'founded', 'website'] as const).filter((key) => !academy[key])
}
