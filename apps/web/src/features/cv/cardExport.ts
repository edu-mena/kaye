import type { CardModel, CardStyle } from '../../data/types'
import type { CardDetails } from '../../domain/cardStyle'
import { saveFile } from '../../lib/saveFile'
import { CARD_HEIGHT, CARD_WIDTH, layoutCard, qrOps } from './cardLayout'
import { createMeasure, cvFontFamily, loadCvFont } from './cvFonts'
import { PT_TO_MM, type CvOp, type CvPage } from './cvLayout'
import { drawCvOp, embedCvFont, personSlug, toSquareJpeg } from './cvPdf'

/** 12 px per mm is about 300 dpi: sharp in print and on a phone. */
const PNG_SCALE = 12
const QR_PNG_SIZE = 1024

export type CardSource = {
  details: CardDetails
  style: CardStyle
  model: CardModel
  photo: string | null
  qr: boolean[][] | null
}

export async function downloadCardPdf({ details, style, model, photo, qr }: CardSource) {
  const [{ jsPDF }, files, jpeg] = await Promise.all([
    import('jspdf'),
    loadCvFont(style.font),
    photo ? toSquareJpeg(photo) : null,
  ])
  const measure = createMeasure(files ? style.font : null)
  const { front, back } = layoutCard({ details, style, model, measure, photo: jpeg, qr })
  const doc = new jsPDF({ unit: 'mm', format: [CARD_WIDTH, CARD_HEIGHT], orientation: 'landscape' })
  const family = files ? 'cv' : 'helvetica'
  if (files) embedCvFont(doc, files)
  for (const op of front) drawCvOp(doc, op, family)
  doc.addPage([CARD_WIDTH, CARD_HEIGHT], 'landscape')
  for (const op of back) drawCvOp(doc, op, family)
  saveFile(doc.output('blob'), `cartao-${personSlug(details)}.pdf`)
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.addEventListener('load', () => resolve(image), { once: true })
    image.addEventListener('error', reject, { once: true })
    image.src = src
  })
}

type Images = Map<string, HTMLImageElement>

/** Every photo on the page, fetched in parallel before painting starts. */
async function loadImages(ops: CvPage): Promise<Images> {
  const sources = [...new Set(ops.flatMap((op) => (op.kind === 'image' ? [op.src] : [])))]
  const images = await Promise.all(sources.map(loadImage))
  return new Map(sources.map((src, index) => [src, images[index]]))
}

function paint(context: CanvasRenderingContext2D, op: CvOp, family: string, images: Images) {
  if (op.kind === 'image') {
    const image = images.get(op.src)
    if (!image) return
    const side = Math.min(image.naturalWidth, image.naturalHeight)
    const radius = op.size / 2
    context.save()
    context.beginPath()
    context.arc(op.x + radius, op.y + radius, radius, 0, Math.PI * 2)
    context.clip()
    context.drawImage(
      image,
      (image.naturalWidth - side) / 2,
      (image.naturalHeight - side) / 2,
      side,
      side,
      op.x,
      op.y,
      op.size,
      op.size,
    )
    context.restore()
  } else if (op.kind === 'rect') {
    context.beginPath()
    context.roundRect(op.x, op.y, op.width, op.height, op.radius ?? 0)
    if (op.fill) {
      context.fillStyle = op.fill
      context.fill()
    } else if (op.stroke) {
      context.strokeStyle = op.stroke
      context.lineWidth = 0.2
      context.stroke()
    }
  } else if (op.kind === 'text') {
    context.fillStyle = op.color
    context.font = `${op.bold ? 700 : 400} ${op.size * PT_TO_MM}px ${family}`
    context.fontKerning = 'none'
    context.fillText(op.text, op.x, op.y)
  }
}

async function toPng(ops: CvPage, width: number, height: number, scale: number, family: string) {
  const canvas = document.createElement('canvas')
  canvas.width = width * scale
  canvas.height = height * scale
  const context = canvas.getContext('2d')
  if (!context) return null
  context.scale(scale, scale)
  const images = await loadImages(ops)
  for (const op of ops) paint(context, op, family, images)
  return new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'))
}

export async function downloadCardPng(
  { details, style, model, photo, qr }: CardSource,
  side: 'front' | 'back',
) {
  const files = await loadCvFont(style.font)
  const measure = createMeasure(files ? style.font : null)
  const faces = layoutCard({ details, style, model, measure, photo, qr })
  const blob = await toPng(faces[side], CARD_WIDTH, CARD_HEIGHT, PNG_SCALE, cvFontFamily(style.font))
  if (blob) saveFile(blob, `cartao-${personSlug(details)}-${side === 'front' ? 'frente' : 'verso'}.png`)
}

/** The QR on its own, with the white margin scanners need. */
export async function downloadQrPng(modules: boolean[][], name: string) {
  const quiet = 4
  const size = modules.length + quiet * 2
  const ops: CvOp[] = [
    { kind: 'rect', x: 0, y: 0, width: size, height: size, fill: '#ffffff' },
    ...qrOps(modules, quiet, quiet, modules.length),
  ]
  const blob = await toPng(ops, size, size, Math.ceil(QR_PNG_SIZE / size), 'sans-serif')
  if (blob) saveFile(blob, `qr-${personSlug({ name })}.png`)
}
