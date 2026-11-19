import type { CardModel, CardStyle } from '../../data/types'
import type { CardDetails } from '../../domain/cardStyle'
import { mixColors } from '../../domain/cvStyle'
import type { Measure } from './cvFonts'
import { initials, PT_TO_MM, type CvOp, type CvPage } from './cvLayout'

// The business card, in the millimetres of the CV: the same drawing instructions, painted by the
// same SVG and PDF code, so the preview and the files match here too.

export const CARD_WIDTH = 85
export const CARD_HEIGHT = 55

const WHITE = '#ffffff'
const QR_INK = '#000000'
const MARGIN = 7
const MIN_SIZE = 6.5
const PHOTO_SIZE = 25
const QR_SIZE = 21
const QR_PLATE = 1.2

type CardInput = {
  details: CardDetails
  style: CardStyle
  model: CardModel
  measure: Measure
  /** Shown where something is still empty, only in the preview. */
  placeholder?: string
  photo?: string | null
  /** The modules of the QR code; null on cards without one, such as minors'. */
  qr?: boolean[][] | null
}

type CardFaces = { front: CvPage; back: CvPage }
type LineOptions = { x: number; y: number; width: number; size: number; color: string; bold?: boolean }

/** One line that always fits: it shrinks first and is cut only as a last resort. */
function line(ops: CvOp[], measure: Measure, text: string, options: LineOptions, center = false) {
  const { x, y, width, color, bold = false } = options
  if (!text) return
  let { size } = options
  while (size > MIN_SIZE && measure(text, size, bold) > width) size -= 0.25
  let shown = text
  if (measure(text, size, bold) > width) {
    while (shown.length > 1 && measure(`${shown}…`, size, bold) > width) shown = shown.slice(0, -1)
    shown = `${shown}…`
  }
  const offset = center ? (width - measure(shown, size, bold)) / 2 : 0
  ops.push({ kind: 'text', x: x + offset, y, text: shown, size, bold, color, tracking: 0 })
}

/** The QR as vector squares on a white plate, joined along each row to keep the files small. */
export function qrOps(modules: boolean[][], x: number, y: number, size: number): CvOp[] {
  const cell = size / modules.length
  const ops: CvOp[] = []
  modules.forEach((row, rowIndex) => {
    let start = -1
    row.forEach((dark, column) => {
      if (dark && start < 0) start = column
      if (start >= 0 && (!dark || column === row.length - 1)) {
        const end = dark ? column + 1 : column
        ops.push({
          kind: 'rect',
          x: x + start * cell,
          y: y + rowIndex * cell,
          width: (end - start) * cell,
          height: cell,
          fill: QR_INK,
        })
        start = -1
      }
    })
  })
  return ops
}

/** Contacts on the back, with the QR beside them when there is one. */
function backContent(
  ops: CvOp[],
  input: CardInput,
  x: number,
  width: number,
  color: string,
  center = input.style.align === 'center',
) {
  const { details, measure, placeholder, qr, style } = input
  const showQr = Boolean(qr) && style.qr
  const textWidth = showQr ? width - QR_SIZE - 3 : width
  const rows = details.contacts.length > 0 || !placeholder ? details.contacts : [placeholder]
  const gap = style.contactSize * PT_TO_MM * 1.6
  const top = (CARD_HEIGHT - (rows.length - 1) * gap) / 2 + style.contactSize * PT_TO_MM * 0.35
  rows.forEach((row, index) =>
    line(
      ops,
      measure,
      row,
      { x, y: top + index * gap, width: textWidth, size: style.contactSize, color },
      center,
    ),
  )
  if (qr && showQr) {
    const left = x + width - QR_SIZE
    const y = (CARD_HEIGHT - QR_SIZE) / 2
    const plate = QR_SIZE + QR_PLATE * 2
    ops.push({ kind: 'rect', x: left - QR_PLATE, y: y - QR_PLATE, width: plate, height: plate, fill: WHITE })
    ops.push(...qrOps(qr, left, y, QR_SIZE))
  }
}

const fill = (color: string, x = 0, width = CARD_WIDTH): CvOp => ({
  kind: 'rect',
  x,
  y: 0,
  width,
  height: CARD_HEIGHT,
  fill: color,
})

const circle = (x: number, y: number, size: number, color: string): CvOp => ({
  kind: 'rect',
  x,
  y,
  width: size,
  height: size,
  radius: size / 2,
  fill: color,
})

/** Splits a text into at most two lines, at the largest size that holds it. */
function twoLines(measure: Measure, text: string, width: number, start: number, bold: boolean) {
  const words = text.split(/\s+/).filter(Boolean)
  const split = (size: number) => {
    const lines: string[] = []
    for (const word of words) {
      const longer = lines.length > 0 ? `${lines[lines.length - 1]} ${word}` : word
      if (lines.length > 0 && measure(longer, size, bold) <= width) lines[lines.length - 1] = longer
      else lines.push(word)
    }
    return lines
  }
  let size = start
  while (size > MIN_SIZE && split(size).length > 2) size -= 0.5
  const [first = '', ...rest] = split(size)
  return { size, lines: rest.length > 0 ? [first, rest.join(' ')] : [first] }
}

type IdentityOptions = {
  x: number
  width: number
  name: string
  role: string
  /** Name above this height and profession below it, for models split in two. */
  split?: number
  /** Where the block's last line ends; without it, the block is centred on the card. */
  bottom?: number
}

/** The name and the profession. */
function identity(ops: CvOp[], input: CardInput, options: IdentityOptions) {
  const { details, measure, placeholder = '', style } = input
  const { x, width, name, role, split, bottom } = options
  const center = style.align === 'center'
  const big = twoLines(measure, details.name || placeholder, width, style.nameSize, true)
  const small = twoLines(measure, details.headline, width, style.roleSize, false)
  const bigLine = big.size * PT_TO_MM * 1.2
  const smallLine = small.size * PT_TO_MM * 1.35
  const bigHeight = big.lines.length * bigLine
  const smallHeight = details.headline ? small.lines.length * smallLine : 0
  const height = bigHeight + 2 + smallHeight
  let y = split !== undefined ? split - 3 - bigHeight : (bottom ?? (CARD_HEIGHT + height) / 2) - height
  for (const text of big.lines) {
    y += bigLine
    line(ops, measure, text, { x, y, width, size: big.size, color: name, bold: true }, center)
  }
  y = split !== undefined ? split + 3 : y + 2
  for (const text of small.lines) {
    y += smallLine
    line(ops, measure, text, { x, y, width, size: small.size, color: role }, center)
  }
}

/** The photo in a circle or, without one, the initials. */
function avatar(ops: CvOp[], input: CardInput, x: number, y: number, size: number, tone: [string, string]) {
  const { details, measure, photo, style } = input
  if (photo && style.photo) {
    ops.push({ kind: 'image', x, y, size, src: photo })
    return
  }
  const [back, front] = tone
  ops.push(circle(x, y, size, back))
  monogram(ops, details.name, measure, x, size, y + size / 2, size * 0.8, front)
}

/** The initials, centred across `width` and on the height `middle`. */
function monogram(
  ops: CvOp[],
  name: string,
  measure: Measure,
  x: number,
  width: number,
  middle: number,
  size: number,
  color: string,
) {
  const text = initials(name)
  ops.push({
    kind: 'text',
    x: x + (width - measure(text, size, true)) / 2,
    y: middle + size * PT_TO_MM * 0.36,
    text,
    size,
    bold: true,
    color,
    tracking: 0,
  })
}

/** White, with a line of colour at the foot. */
function claro(input: CardInput): CardFaces {
  const { accent, text } = input.style
  const width = CARD_WIDTH - MARGIN * 2
  const front: CvOp[] = [fill(WHITE)]
  identity(front, input, { x: MARGIN, width, name: accent, role: text })
  front.push({ kind: 'rect', x: 0, y: CARD_HEIGHT - 2.5, width: CARD_WIDTH, height: 2.5, fill: accent })
  const back: CvOp[] = [fill(WHITE)]
  backContent(back, input, MARGIN, width, text)
  return { front, back }
}

/** A band of colour with the initials. */
function faixa(input: CardInput): CardFaces {
  const { details, measure, style } = input
  const { accent, text } = style
  const band = 24
  const front: CvOp[] = [fill(WHITE), fill(accent, 0, band)]
  monogram(front, details.name, measure, 0, band, CARD_HEIGHT / 2, 22, WHITE)
  const x = band + 6
  identity(front, input, { x, width: CARD_WIDTH - x - MARGIN + 2, name: accent, role: text })
  const back: CvOp[] = [fill(WHITE), fill(accent, CARD_WIDTH - 6, 6)]
  backContent(back, input, MARGIN, CARD_WIDTH - MARGIN - 10, text)
  return { front, back }
}

/** All in colour on the front; white on the back. */
function cheio(input: CardInput): CardFaces {
  const { accent } = input.style
  const width = CARD_WIDTH - MARGIN * 2
  const front: CvOp[] = [fill(accent)]
  const role = mixColors(accent, WHITE, 0.85)
  identity(front, input, { x: MARGIN, width, name: WHITE, role })
  const back: CvOp[] = [fill(WHITE)]
  backContent(back, input, MARGIN, width, accent)
  return { front, back }
}

/** The photo beside the name, or the initials without one. */
function foto(input: CardInput): CardFaces {
  const { accent, text } = input.style
  const front: CvOp[] = [fill(WHITE)]
  const tone: [string, string] = [mixColors(accent, WHITE, 0.85), accent]
  avatar(front, input, MARGIN, (CARD_HEIGHT - PHOTO_SIZE) / 2, PHOTO_SIZE, tone)
  const x = MARGIN + PHOTO_SIZE + 5
  identity(front, input, { x, width: CARD_WIDTH - x - 4, name: accent, role: text })
  const back: CvOp[] = [fill(accent)]
  backContent(back, input, MARGIN, CARD_WIDTH - MARGIN * 2, WHITE)
  return { front, back }
}

/** A thin frame around the card, on both faces. */
function moldura(input: CardInput): CardFaces {
  const { accent, text } = input.style
  const frame: CvOp = {
    kind: 'rect',
    x: 3,
    y: 3,
    width: CARD_WIDTH - 6,
    height: CARD_HEIGHT - 6,
    stroke: accent,
  }
  const width = CARD_WIDTH - MARGIN * 2 - 2
  const front: CvOp[] = [fill(WHITE), frame]
  identity(front, input, { x: MARGIN + 1, width, name: accent, role: text })
  const back: CvOp[] = [fill(WHITE), frame]
  backContent(back, input, MARGIN + 1, width, text)
  return { front, back }
}

/** Colour above the name's line, white below it. */
function topo(input: CardInput): CardFaces {
  const { accent, text } = input.style
  const width = CARD_WIDTH - MARGIN * 2
  const split = 33
  const front: CvOp[] = [
    fill(WHITE),
    { kind: 'rect', x: 0, y: 0, width: CARD_WIDTH, height: split, fill: accent },
  ]
  identity(front, input, { x: MARGIN, width, name: WHITE, role: text, split })
  const back: CvOp[] = [fill(WHITE), { kind: 'rect', x: 0, y: 0, width: CARD_WIDTH, height: 4, fill: accent }]
  backContent(back, input, MARGIN, width, text)
  return { front, back }
}

/** Half and half: the name in colour, the initials on white. */
function duo(input: CardInput): CardFaces {
  const { details, measure, style } = input
  const half = 52
  const front: CvOp[] = [fill(WHITE), fill(style.accent, 0, half)]
  const role = mixColors(style.accent, WHITE, 0.85)
  identity(front, input, { x: 6, width: half - 10, name: WHITE, role })
  monogram(front, details.name, measure, half, CARD_WIDTH - half, CARD_HEIGHT / 2, 26, style.accent)
  const back: CvOp[] = [fill(style.accent), fill(WHITE, 4, CARD_WIDTH - 8)]
  backContent(back, input, MARGIN + 2, CARD_WIDTH - MARGIN * 2 - 4, style.text)
  return { front, back }
}

/** Almost nothing: a small mark above, the name at the foot. */
function minimal(input: CardInput): CardFaces {
  const { accent, text } = input.style
  const width = CARD_WIDTH - MARGIN * 2
  const front: CvOp[] = [fill(WHITE), circle(MARGIN, MARGIN, 3.5, accent)]
  identity(front, input, { x: MARGIN, width, name: text, role: accent, bottom: CARD_HEIGHT - MARGIN })
  const back: CvOp[] = [fill(WHITE)]
  backContent(back, input, MARGIN, width, text)
  return { front, back }
}

/** A big circle running off the corner, with the photo or the initials inside. */
function arco(input: CardInput): CardFaces {
  const { accent, text } = input.style
  const front: CvOp[] = [fill(WHITE), circle(50, -10, 75, accent)]
  avatar(front, input, 58, 15, PHOTO_SIZE, [WHITE, accent])
  identity(front, input, { x: MARGIN, width: 42, name: accent, role: text })
  const back: CvOp[] = [fill(WHITE), circle(-14, 38, 30, accent)]
  backContent(back, input, MARGIN + 8, CARD_WIDTH - MARGIN * 2 - 8, text)
  return { front, back }
}

/** A grid of small dots in the corner. */
function pontos(input: CardInput): CardFaces {
  const { accent, text } = input.style
  const dots = (startX: number, startY: number): CvOp[] => {
    const tint = mixColors(accent, WHITE, 0.55)
    return Array.from({ length: 30 }, (_, index) =>
      circle(startX + (index % 6) * 3.4, startY + Math.floor(index / 6) * 3.4, 1.1, tint),
    )
  }
  const width = CARD_WIDTH - MARGIN * 2
  const front: CvOp[] = [fill(WHITE), ...dots(CARD_WIDTH - 22, 4)]
  identity(front, input, { x: MARGIN, width, name: accent, role: text, bottom: CARD_HEIGHT - MARGIN })
  const back: CvOp[] = [fill(WHITE), ...dots(3, CARD_HEIGHT - 17)]
  backContent(back, input, MARGIN, width, text)
  return { front, back }
}

const MODELS: Record<CardModel, (input: CardInput) => CardFaces> = {
  claro,
  faixa,
  cheio,
  foto,
  moldura,
  topo,
  duo,
  minimal,
  arco,
  pontos,
}

export function layoutCard(input: CardInput): CardFaces {
  return MODELS[input.model](input)
}
