import type { CardModel, CardStyle, CvCard, CvData, CvStyle } from '../data/types'
import { CARD_MODELS } from '../data/types'
import { readableColor, CV_FONTS } from './cvStyle'

/** The limits of the controls: beyond them a card stops being readable or leaves its space. */
export const CARD_LIMITS = {
  nameSize: { min: 10, max: 22, step: 0.5 },
  roleSize: { min: 6.5, max: 12, step: 0.5 },
  contactSize: { min: 6.5, max: 10, step: 0.5 },
}

export const CARD_MAX_CONTACTS = 5

/** Models that read best centred; the others start on the left. */
const CENTRED = new Set<CardModel>(['cheio', 'moldura'])

const clamp = (value: number | undefined, fallback: number, { min, max }: { min: number; max: number }) =>
  typeof value === 'number' && Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : fallback

/** The card's look: the CV's font and colours until the person changes them, always inside the limits. */
export function resolveCardStyle(cvStyle: CvStyle, card: CvCard | undefined): CardStyle {
  const style = card?.style ?? {}
  const model = cardModel(card)
  return {
    font: CV_FONTS.some(({ id }) => id === style.font) ? (style.font ?? cvStyle.font) : cvStyle.font,
    accent: readableColor(style.accent ?? cvStyle.accent),
    text: readableColor(style.text ?? cvStyle.text),
    nameSize: clamp(style.nameSize, 15, CARD_LIMITS.nameSize),
    roleSize: clamp(style.roleSize, 8.5, CARD_LIMITS.roleSize),
    contactSize: clamp(style.contactSize, 7.5, CARD_LIMITS.contactSize),
    align: style.align ?? (CENTRED.has(model) ? 'center' : 'left'),
    photo: style.photo ?? true,
    qr: style.qr ?? true,
  }
}

export const cardModel = (card: CvCard | undefined): CardModel =>
  CARD_MODELS.find((model) => model === card?.model) ?? 'claro'

/** "a@b.ao · Luanda" and links: one contact per line, as the card shows them. */
export function contactLines({ contact, links }: Pick<CvData, 'contact' | 'links'>): string {
  return [...contact.split(/\s*[·|\n]\s*/), ...links]
    .map((part) => part.trim())
    .filter(Boolean)
    .join('\n')
}

export type CardDetails = { name: string; headline: string; contacts: string[] }

/** What the card says: the CV's data, unless the person changed it here. The CV stays as it was. */
export function cardDetails(cv: CvData, card: CvCard | undefined): CardDetails {
  const details = card?.details ?? {}
  return {
    name: details.name ?? cv.name,
    headline: details.headline ?? cv.headline,
    contacts: (details.contacts ?? contactLines(cv))
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .slice(0, CARD_MAX_CONTACTS),
  }
}
