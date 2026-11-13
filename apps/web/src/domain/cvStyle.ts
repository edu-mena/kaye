import type { CvBox, CvFont, CvSeparator, CvStyle, CvTemplate } from '../data/types'

export const CV_FONTS: { id: CvFont; label: string }[] = [
  { id: 'arimo', label: 'Arimo' },
  { id: 'inter', label: 'Inter' },
  { id: 'montserrat', label: 'Montserrat' },
  { id: 'lora', label: 'Lora' },
  { id: 'merriweather', label: 'Merriweather' },
]

export const CV_TEMPLATES: CvTemplate[] = [
  'classico',
  'moderno',
  'europeu',
  'retrato',
  'colunas',
  'minimalista',
  'criativo',
  'destaque',
]

/** The templates with a place for the person's photo. */
export const CV_PHOTO_TEMPLATES: CvTemplate[] = ['retrato', 'criativo']

export const CV_BOXES: CvBox[] = ['none', 'tint', 'solid', 'outline']
export const CV_SEPARATORS: CvSeparator[] = ['none', 'thin', 'thick', 'dotted']

type NumericKey = {
  [Key in keyof CvStyle]: CvStyle[Key] extends number ? Key : never
}[keyof CvStyle]

/** The ranges of the controls: beyond them a CV stops being readable. */
export const CV_LIMITS: Record<NumericKey, { min: number; max: number; step: number }> = {
  marginX: { min: 10, max: 30, step: 1 },
  marginY: { min: 8, max: 28, step: 1 },
  nameSize: { min: 14, max: 32, step: 0.5 },
  headingSize: { min: 8, max: 14, step: 0.5 },
  bodySize: { min: 8, max: 12.5, step: 0.5 },
  lineHeight: { min: 1.15, max: 1.8, step: 0.05 },
  headingGap: { min: 0, max: 6, step: 0.2 },
  entryGap: { min: 0, max: 4, step: 0.2 },
  sectionGap: { min: 1, max: 14, step: 0.5 },
}

const BASE: CvStyle = {
  font: 'arimo',
  marginX: 20,
  marginY: 16,
  nameSize: 19.5,
  headingSize: 8.5,
  bodySize: 9.5,
  lineHeight: 1.4,
  headingGap: 1.4,
  entryGap: 0.6,
  sectionGap: 4,
  accent: '#1a1a1a',
  text: '#1a1a1a',
  muted: '#555555',
  box: 'none',
  separator: 'thin',
  photo: true,
}

/** What each template looks like until the person changes something. */
const TEMPLATE_STYLES: Record<CvTemplate, CvStyle> = {
  classico: BASE,
  moderno: {
    ...BASE,
    marginX: 14,
    marginY: 15,
    nameSize: 16.5,
    headingSize: 9,
    bodySize: 9,
    headingGap: 1.2,
    sectionGap: 5,
    accent: '#1c2433',
    separator: 'none',
  },
  europeu: {
    ...BASE,
    marginX: 15,
    marginY: 15,
    nameSize: 18,
    headingSize: 8,
    bodySize: 9,
    headingGap: 0,
    sectionGap: 3,
    accent: '#1f4e8c',
  },
  retrato: {
    ...BASE,
    font: 'lora',
    marginX: 16,
    nameSize: 25,
    headingSize: 9,
    sectionGap: 5,
    accent: '#0f4c5c',
  },
  colunas: {
    ...BASE,
    font: 'inter',
    marginX: 15,
    marginY: 15,
    nameSize: 25,
    headingSize: 9,
    bodySize: 9,
    sectionGap: 5,
    accent: '#9a3412',
    separator: 'none',
  },
  minimalista: {
    ...BASE,
    font: 'inter',
    marginX: 24,
    marginY: 22,
    nameSize: 27,
    headingSize: 10,
    lineHeight: 1.5,
    headingGap: 1.6,
    sectionGap: 8,
    separator: 'none',
  },
  criativo: {
    ...BASE,
    font: 'montserrat',
    marginX: 18,
    nameSize: 26,
    headingSize: 9.5,
    bodySize: 9,
    sectionGap: 5,
    accent: '#6d28d9',
    separator: 'none',
  },
  destaque: {
    ...BASE,
    font: 'merriweather',
    marginX: 18,
    nameSize: 28,
    headingSize: 9.5,
    bodySize: 9,
    lineHeight: 1.5,
    sectionGap: 5,
    accent: '#0f766e',
  },
}

const MIN_CONTRAST = 4.5

function luminance(hex: string): number {
  const channels = [1, 3, 5].map((start) => parseInt(hex.slice(start, start + 2), 16) / 255)
  const [red = 0, green = 0, blue = 0] = channels.map((value) =>
    value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4,
  )
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue
}

const contrastWithWhite = (hex: string) => 1.05 / (luminance(hex) + 0.05)

/** Blends two colours; 0 keeps the first, 1 gives the second. */
export function mixColors(from: string, to: string, amount: number): string {
  const channel = (start: number) => {
    const first = parseInt(from.slice(start, start + 2), 16)
    const second = parseInt(to.slice(start, start + 2), 16)
    return Math.round(first + (second - first) * amount)
      .toString(16)
      .padStart(2, '0')
  }
  return `#${channel(1)}${channel(3)}${channel(5)}`
}

/**
 * Darkens a colour until it reads on white paper. White text on a band of this colour has the
 * same contrast, so the one rule covers text, titles and the coloured bands.
 */
export function readableColor(hex: string): string {
  let color = hex
  while (contrastWithWhite(color) < MIN_CONTRAST) color = mixColors(color, '#000000', 0.08)
  return color
}

const isColor = (value: unknown): value is string =>
  typeof value === 'string' && /^#[0-9a-f]{6}$/i.test(value)

const pick = <Value>(allowed: readonly Value[], value: Value | undefined, fallback: Value): Value =>
  value !== undefined && allowed.includes(value) ? value : fallback

/** The template's style with the person's changes, always inside the limits. */
export function resolveCvStyle(template: CvTemplate, changes: Partial<CvStyle> = {}): CvStyle {
  const defaults = TEMPLATE_STYLES[template]
  const style: CvStyle = {
    ...defaults,
    font: pick(
      CV_FONTS.map((font) => font.id),
      changes.font,
      defaults.font,
    ),
    box: pick(CV_BOXES, changes.box, defaults.box),
    separator: pick(CV_SEPARATORS, changes.separator, defaults.separator),
    accent: readableColor(isColor(changes.accent) ? changes.accent : defaults.accent),
    text: readableColor(isColor(changes.text) ? changes.text : defaults.text),
    muted: readableColor(isColor(changes.muted) ? changes.muted : defaults.muted),
    photo: typeof changes.photo === 'boolean' ? changes.photo : defaults.photo,
  }
  for (const [key, { min, max }] of Object.entries(CV_LIMITS) as [
    NumericKey,
    { min: number; max: number },
  ][]) {
    const value = changes[key]
    if (typeof value === 'number' && Number.isFinite(value)) style[key] = Math.min(max, Math.max(min, value))
  }
  return style
}
