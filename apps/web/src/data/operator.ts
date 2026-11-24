import type { Locale } from '../lib/i18n'

/**
 * Who runs Kayé, for the terms and the privacy policy (Lei n.º 23/11 asks a service to identify itself).
 * Fill it in when the legal entity exists: `name` is the registered name, `nif` the tax number, `address`
 * the registered office. While `name` is empty the texts only say "Kayé".
 */
const OPERATOR = { name: '', nif: '', address: '' }

const WORDS: Record<Locale, { nif: string; seat: string }> = {
  pt: { nif: 'NIF', seat: 'com sede em' },
  en: { nif: 'tax number', seat: 'registered at' },
  fr: { nif: 'NIF', seat: 'dont le siège est' },
}

/** ", Name (NIF 123), com sede em …": what follows "Kayé" in the texts; nothing until the entity is known. */
export function operatorDetails(locale: Locale, operator = OPERATOR): string {
  if (!operator.name) return ''
  const { nif, seat } = WORDS[locale]
  const number = operator.nif ? ` (${nif} ${operator.nif})` : ''
  const address = operator.address ? `, ${seat} ${operator.address}` : ''
  return `, ${operator.name}${number}${address}`
}
