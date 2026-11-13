import type { jsPDF } from 'jspdf'
import type { CvData, CvStyle, CvTemplate } from '../../data/types'
import { resolveCvStyle } from '../../domain/cvStyle'
import { saveFile } from '../../lib/saveFile'
import { createMeasure, loadCvFont, type CvFontFiles } from './cvFonts'
import { layoutCv, type CvLabels, type CvOp } from './cvLayout'

// The PDF paints the pages of cvLayout.ts as real text (hiring software reads it), with the
// font of the preview embedded. jsPDF loads only when someone downloads.

export type { CvLabels } from './cvLayout'

const FAMILY = 'cv'

function toBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  // In pieces: a whole font does not fit in the arguments of one call.
  for (let start = 0; start < bytes.length; start += 0x8000)
    binary += String.fromCharCode(...bytes.subarray(start, start + 0x8000))
  return btoa(binary)
}

export function embedCvFont(doc: jsPDF, files: CvFontFiles) {
  doc.addFileToVFS('cv-regular.ttf', toBase64(files.regular))
  doc.addFileToVFS('cv-bold.ttf', toBase64(files.bold))
  doc.addFont('cv-regular.ttf', FAMILY, 'normal')
  doc.addFont('cv-bold.ttf', FAMILY, 'bold')
}

/** The photo as a square JPEG, which jsPDF always reads (profile photos can be WebP). */
export function toSquareJpeg(src: string, limit = Infinity): Promise<string | null> {
  return new Promise((resolve) => {
    const image = new Image()
    image.addEventListener(
      'load',
      () => {
        const size = Math.min(image.naturalWidth, image.naturalHeight)
        const canvas = document.createElement('canvas')
        const scale = Math.min(1, limit / size)
        canvas.width = Math.round(size * scale)
        canvas.height = Math.round(size * scale)
        const context = canvas.getContext('2d')
        if (!context || size === 0) {
          resolve(null)
          return
        }
        context.scale(scale, scale)
        context.fillStyle = '#ffffff'
        context.fillRect(0, 0, size, size)
        const left = (size - image.naturalWidth) / 2
        const top = (size - image.naturalHeight) / 2
        context.drawImage(image, left, top)
        resolve(canvas.toDataURL('image/jpeg', 0.9))
      },
      { once: true },
    )
    image.addEventListener('error', () => resolve(null), { once: true })
    image.src = src
  })
}

function drawImage(doc: jsPDF, op: Extract<CvOp, { kind: 'image' }>) {
  const radius = op.size / 2
  doc.saveGraphicsState()
  doc.circle(op.x + radius, op.y + radius, radius, null)
  doc.clip()
  doc.discardPath()
  doc.addImage(op.src, 'JPEG', op.x, op.y, op.size, op.size)
  doc.restoreGraphicsState()
}

export function drawCvOp(doc: jsPDF, op: CvOp, family: string) {
  if (op.kind === 'image') {
    drawImage(doc, op)
  } else if (op.kind === 'rect') {
    if (op.fill) doc.setFillColor(op.fill)
    if (op.stroke) {
      doc.setDrawColor(op.stroke)
      doc.setLineWidth(0.2)
      doc.setLineDashPattern([], 0)
    }
    const paint = op.fill ? 'F' : 'S'
    if (op.radius) doc.roundedRect(op.x, op.y, op.width, op.height, op.radius, op.radius, paint)
    else doc.rect(op.x, op.y, op.width, op.height, paint)
  } else if (op.kind === 'line') {
    doc.setDrawColor(op.color)
    doc.setLineWidth(op.width)
    doc.setLineDashPattern(op.dotted ? [0.5, 0.8] : [], 0)
    doc.line(op.x1, op.y1, op.x2, op.y2)
  } else {
    doc.setFont(family, op.bold ? 'bold' : 'normal')
    doc.setFontSize(op.size)
    doc.setTextColor(op.color)
    doc.text(op.text, op.x, op.y, { charSpace: op.tracking })
  }
}

/** "Joana Manuel" → "joana-manuel" */
export function personSlug(cv: { name: string }): string {
  const slug = cv.name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
  return slug || 'kaye'
}

type PdfSource = {
  cv: CvData
  template: CvTemplate
  style?: Partial<CvStyle>
  photo?: string | null
}

/** Builds the CV as a PDF on the device and saves it (docs/decisoes/0006: no server yet). */
export async function downloadCvPdf(
  { cv, template, style, photo }: PdfSource,
  labels: CvLabels,
): Promise<void> {
  const resolved = resolveCvStyle(template, style)
  const [{ jsPDF }, files, jpeg] = await Promise.all([
    import('jspdf'),
    loadCvFont(resolved.font),
    photo ? toSquareJpeg(photo) : null,
  ])
  const pages = layoutCv({
    cv,
    template,
    style: resolved,
    labels,
    measure: createMeasure(files ? resolved.font : null),
    photo: jpeg,
  })
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  if (files) embedCvFont(doc, files)
  pages.forEach((page, index) => {
    if (index > 0) doc.addPage()
    for (const op of page) drawCvOp(doc, op, files ? FAMILY : 'helvetica')
  })
  // Our own download, not doc.save(): the same in every environment (and in tests).
  saveFile(doc.output('blob'), `cv-${personSlug(cv)}.pdf`)
}
