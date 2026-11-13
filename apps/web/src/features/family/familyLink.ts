import { RIASEC_KEYS } from '../../data/types'
import { LOCALES, type Locale } from '../../lib/i18n'
import { appUrl } from '../../lib/share'

// "Mostrar à família" as a link (docs/decisoes/0018): the data travels in the fragment (#), which the browser
// never sends to a server, so nothing is stored anywhere but on the young person's phone.

export type FamilyLink = {
  v: 1
  /** Only when the person ticks it. */
  firstName?: string
  /** RIASEC code ("IAS"); empty before the test is done. */
  code: string
  /** Career slugs, at most three. */
  careers: string[]
  lang: Locale
  /** Set only for adults: salaries are never shown about a minor (CLAUDE.md). */
  adult?: true
}

const FAMILY_PATH = '/familia'
const MAX_CAREERS = 3
const NAME = /^[\p{L}][\p{L}'’-]{0,29}$/u
const SLUG = /^[a-z0-9-]{1,80}$/
const CODE = new RegExp(`^[${RIASEC_KEYS.join('')}]{0,3}$`)

const toBase64Url = (bytes: Uint8Array) =>
  btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')

const fromBase64Url = (text: string) =>
  Uint8Array.from(atob(text.replace(/-/g, '+').replace(/_/g, '/')), (char) => char.charCodeAt(0))

function encodeFamilyLink(link: FamilyLink): string {
  return toBase64Url(new TextEncoder().encode(JSON.stringify(link)))
}

/** The whole link to send. */
export const familyLinkUrl = (link: FamilyLink) => appUrl(`${FAMILY_PATH}#${encodeFamilyLink(link)}`)

/** Null for anything that is not a link this version made: a typo, an old version, a tampered fragment. */
export function decodeFamilyLink(fragment: string): FamilyLink | null {
  try {
    const data: unknown = JSON.parse(new TextDecoder().decode(fromBase64Url(fragment.replace(/^#/, ''))))
    if (typeof data !== 'object' || data === null) return null
    const { v, firstName, code, careers, lang, adult } = data as Record<string, unknown>
    if (v !== 1 || typeof code !== 'string' || !CODE.test(code) || new Set(code).size !== code.length)
      return null
    if (!Array.isArray(careers) || careers.length === 0 || careers.length > MAX_CAREERS) return null
    if (!careers.every((slug): slug is string => typeof slug === 'string' && SLUG.test(slug))) return null
    if (!LOCALES.includes(lang as Locale)) return null
    if (firstName !== undefined && (typeof firstName !== 'string' || !NAME.test(firstName))) return null
    return {
      v,
      code,
      careers: [...new Set(careers)],
      lang: lang as Locale,
      ...(firstName ? { firstName } : {}),
      ...(adult === true ? { adult } : {}),
    }
  } catch {
    return null
  }
}

/** The first name, if it is one the link accepts; otherwise none. */
export function linkFirstName(name: string | undefined): string | undefined {
  const first = name?.trim().split(/\s+/)[0] ?? ''
  return NAME.test(first) ? first : undefined
}
