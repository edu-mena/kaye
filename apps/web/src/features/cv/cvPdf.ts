import type { jsPDF } from 'jspdf'
import type { CvData, CvEntry, CvSection, CvTemplate } from '../../data/types'
import { saveFile } from '../../lib/saveFile'

// The PDF draws the same three layouts as CvSheet.tsx, as real text (hiring software reads it),
// with the built-in Helvetica, which covers Portuguese. jsPDF loads only when someone downloads.

export type CvLabels = Record<CvSection, string>

type Rgb = [number, number, number]
const INK: Rgb = [26, 26, 26]
const MUTED: Rgb = [85, 85, 85]
const RULE: Rgb = [207, 207, 207]
const WHITE: Rgb = [255, 255, 255]
const SIDE_TEXT: Rgb = [210, 214, 222]
const SIDE_LABEL: Rgb = [159, 176, 200]
const SIDE_BAND: Rgb = [28, 36, 51]
const EURO_BLUE: Rgb = [31, 78, 140]

const PT_TO_MM = 0.3528
const PAGE_HEIGHT = 297
const MAIN: CvSection[] = ['summary', 'experience', 'projects', 'education', 'certifications']

type TextOptions = { bold?: boolean; color?: Rgb; align?: 'left' | 'right' | 'center'; after?: number }

/** A column that writes wrapped text downwards and moves to a new page when it runs out. */
class Column {
  private readonly doc: jsPDF
  private readonly x: number
  private readonly width: number
  y: number
  /** False for the dark band of "moderno": it stays on the first page. */
  private readonly breaks: boolean

  constructor(doc: jsPDF, x: number, width: number, y: number, breaks = true) {
    this.doc = doc
    this.x = x
    this.width = width
    this.y = y
    this.breaks = breaks
  }

  text(value: string, size: number, options: TextOptions = {}) {
    if (!value.trim()) return
    const { doc } = this
    doc.setFont('helvetica', options.bold ? 'bold' : 'normal')
    doc.setFontSize(size)
    doc.setTextColor(...(options.color ?? INK))
    const lineHeight = size * PT_TO_MM * 1.4
    const align = options.align ?? 'left'
    const x = align === 'right' ? this.x + this.width : align === 'center' ? this.x + this.width / 2 : this.x
    for (const line of doc.splitTextToSize(value, this.width) as string[]) {
      if (this.y + lineHeight > PAGE_HEIGHT - 14) {
        if (!this.breaks) return
        doc.addPage()
        this.y = 16
      }
      doc.text(line, x, this.y + size * PT_TO_MM, { align })
      this.y += lineHeight
    }
    this.y += options.after ?? 0
  }

  rule(color: Rgb = RULE) {
    this.doc.setDrawColor(...color)
    this.doc.setLineWidth(0.2)
    this.doc.line(this.x, this.y, this.x + this.width, this.y)
    this.y += 1.6
  }

  space(mm: number) {
    this.y += mm
  }
}

function hasContent(cv: CvData, section: CvSection): boolean {
  const value = cv[section]
  return typeof value === 'string' ? value.trim() !== '' : value.length > 0
}

function writeEntries(column: Column, list: CvEntry[], size: number) {
  for (const entry of list) {
    column.text(entry.title, size, { bold: true })
    column.text([entry.place, entry.period].filter(Boolean).join(' · '), size - 0.5, { color: MUTED })
    column.text(entry.description, size, { after: 2.2 })
  }
}

function writeContent(column: Column, cv: CvData, section: CvSection, size: number) {
  const value = cv[section]
  if (typeof value === 'string') column.text(value, size)
  else if (section === 'skills' || section === 'languages' || section === 'links')
    column.text((value as string[]).join(', '), size)
  else writeEntries(column, value as CvEntry[], size)
}

function classico(doc: jsPDF, cv: CvData, labels: CvLabels) {
  const column = new Column(doc, 20, 170, 16)
  column.text(cv.name, 19.5, { bold: true, align: 'center' })
  column.text(cv.headline, 10.5, { align: 'center', after: 0.6 })
  column.text([cv.contact, ...cv.links].filter(Boolean).join(' · '), 8.6, {
    color: MUTED,
    align: 'center',
    after: 2,
  })
  column.rule()
  for (const section of [...MAIN, 'skills', 'languages'] as CvSection[]) {
    if (!hasContent(cv, section)) continue
    column.space(3)
    column.text(labels[section].toUpperCase(), 8.6, { bold: true, after: 0.4 })
    column.rule()
    writeContent(column, cv, section, 9.4)
  }
}

function moderno(doc: jsPDF, cv: CvData, labels: CvLabels) {
  doc.setFillColor(...SIDE_BAND)
  doc.rect(0, 0, 66, PAGE_HEIGHT, 'F')
  const side = new Column(doc, 9, 49, 15, false)
  side.text(cv.name, 16.5, { bold: true, color: WHITE, after: 1 })
  side.text(cv.headline, 9.8, { color: SIDE_TEXT, after: 4 })
  for (const part of cv.contact.split(' · ')) side.text(part, 8.2, { color: SIDE_TEXT })
  for (const section of ['links', 'skills', 'languages', 'certifications'] as CvSection[]) {
    if (!hasContent(cv, section)) continue
    side.space(5)
    side.text(labels[section].toUpperCase(), 7.9, { bold: true, color: SIDE_LABEL, after: 1 })
    const items =
      section === 'certifications' ? cv.certifications.map((entry) => entry.title) : (cv[section] as string[])
    for (const item of items) side.text(item, 9, { color: WHITE, after: 0.6 })
  }
  const main = new Column(doc, 76, 120, 15)
  for (const section of MAIN) {
    if (section === 'certifications' || !hasContent(cv, section)) continue
    main.text(labels[section].toUpperCase(), 9, { bold: true, color: SIDE_BAND, after: 1.2 })
    writeContent(main, cv, section, 9)
    main.space(4)
  }
}

function europeu(doc: jsPDF, cv: CvData, labels: CvLabels) {
  const label = new Column(doc, 15, 43, 15)
  const content = new Column(doc, 64, 131, 15)
  label.text('CURRICULUM VITAE', 8.2, { bold: true, color: EURO_BLUE, align: 'right' })
  content.text(cv.name, 18, { bold: true })
  content.text(cv.headline, 10.2, { after: 0.6 })
  content.text(cv.contact, 8.6, { color: MUTED, after: 3 })
  for (const section of [...MAIN, 'skills', 'languages', 'links'] as CvSection[]) {
    if (!hasContent(cv, section)) continue
    // Both columns start each row together, under a thin rule across the page.
    const top = Math.max(label.y, content.y) + 1.5
    doc.setDrawColor(227, 227, 227)
    doc.setLineWidth(0.2)
    doc.line(15, top, 195, top)
    label.y = top + 2.5
    content.y = top + 2.5
    label.text(labels[section].toUpperCase(), 8.2, { bold: true, color: EURO_BLUE, align: 'right' })
    writeContent(content, cv, section, 9)
    label.y = content.y
  }
}

const LAYOUTS: Record<CvTemplate, (doc: jsPDF, cv: CvData, labels: CvLabels) => void> = {
  classico,
  moderno,
  europeu,
}

/** "Joana Manuel" → "cv-joana-manuel.pdf" */
function fileName(cv: CvData): string {
  const slug = cv.name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
  return `cv-${slug || 'kaye'}.pdf`
}

/** Builds the CV as a PDF on the device and saves it (docs/decisoes/0005: no server yet). */
export async function downloadCvPdf(cv: CvData, template: CvTemplate, labels: CvLabels): Promise<void> {
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  LAYOUTS[template](doc, cv, labels)
  // Our own download, not doc.save(): the same in every environment (and in tests).
  saveFile(doc.output('blob'), fileName(cv))
}
