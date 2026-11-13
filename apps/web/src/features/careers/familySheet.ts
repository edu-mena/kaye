import type { jsPDF } from 'jspdf'
import { qrModules } from '../../lib/qr'
import { shareFile } from '../../lib/shareFile'
import { embedCvFont } from '../cv/cvPdf'
import { loadCvFont } from '../cv/cvFonts'

// "Mostrar à família": one A4 page about a career, in plain words, built on the phone (like the CV PDF)
// so the young person can send it on WhatsApp or print it. Nothing goes to a server.

type FamilyFact = { label: string; value: string }

export type FamilySection = {
  title: string
  facts?: FamilyFact[]
  paragraphs?: string[]
  bullets?: string[]
}

export type FamilySheet = {
  /** Small line above the name ("Uma profissão explicada à família"). */
  kicker: string
  name: string
  sections: FamilySection[]
  footer: {
    madeWith: string
    date: string
    sourcesLabel: string
    sources: string[]
    url: string
    scan: string
  }
}

const PAGE = { width: 210, height: 297 }
const MARGIN = 16
const WIDTH = PAGE.width - MARGIN * 2
const FOOTER_TOP = PAGE.height - 44
const QR_SIZE = 26
const LINE = 0.3528 * 1.35

// Brand colours, dark enough to print well in black and white.
const INK = '#16171b'
const COPY = '#3b3d45'
const MUTED = '#6b6e78'
const BLUE = '#021d6d'
const GOLD = '#ffc000'
const RULE = '#d9dbe0'

class Writer {
  y = MARGIN
  /** Some text did not fit: the rest of the page stops taking text. */
  full = false

  private doc: jsPDF
  private family: string

  constructor(doc: jsPDF, family: string) {
    this.doc = doc
    this.family = family
  }

  private font(size: number, bold: boolean, color: string) {
    this.doc.setFont(this.family, bold ? 'bold' : 'normal')
    this.doc.setFontSize(size)
    this.doc.setTextColor(color)
  }

  /** Wrapped text from the cursor; cut with an ellipsis where the page ends. */
  text(text: string, { size = 10, bold = false, color = COPY, x = MARGIN, width = WIDTH, gap = 1.2 } = {}) {
    if (this.full) return
    this.font(size, bold, color)
    const height = size * LINE
    let lines: string[] = this.doc.splitTextToSize(text, width)
    const room = Math.floor((FOOTER_TOP - 4 - this.y) / height)
    if (room <= 0) {
      this.full = true
      return
    }
    if (lines.length > room) {
      lines = lines.slice(0, room)
      lines[room - 1] = this.ellipsis(lines[room - 1] ?? '', width)
      this.full = true
    }
    lines.forEach((line, index) => this.doc.text(line, x, this.y + size * 0.3528 + index * height))
    this.y += lines.length * height + gap
  }

  private ellipsis(line: string, width: number): string {
    let cut = line.trimEnd()
    while (cut.length > 0 && this.doc.getTextWidth(`${cut}…`) > width) cut = cut.slice(0, -1).trimEnd()
    return `${cut}…`
  }

  /** Label over value, in columns: the numbers parents ask about. */
  facts(facts: FamilyFact[]) {
    if (this.full || facts.length === 0) return
    const columns = Math.min(3, facts.length)
    const column = WIDTH / columns
    for (let start = 0; start < facts.length; start += columns) {
      const row = facts.slice(start, start + columns)
      const top = this.y
      let bottom = top
      row.forEach((fact, index) => {
        this.y = top
        const x = MARGIN + index * column
        this.text(fact.label, { size: 8, color: MUTED, x, width: column - 4, gap: 0.6 })
        this.text(fact.value, { size: 11, bold: true, color: INK, x, width: column - 4, gap: 0 })
        bottom = Math.max(bottom, this.y)
      })
      this.y = bottom + 2.5
    }
  }

  section({ title, facts, paragraphs = [], bullets = [] }: FamilySection) {
    if (this.full || FOOTER_TOP - this.y < 16) {
      this.full = true
      return
    }
    this.y += 2
    this.doc.setFillColor(GOLD)
    this.doc.rect(MARGIN, this.y, 1.2, 4.2, 'F')
    this.text(title.toUpperCase(), { size: 9, bold: true, color: BLUE, x: MARGIN + 3.5, gap: 2 })
    if (facts) this.facts(facts)
    for (const paragraph of paragraphs) this.text(paragraph)
    for (const bullet of bullets) {
      if (this.full) break
      this.font(10, false, BLUE)
      this.doc.text('•', MARGIN + 1, this.y + 10 * 0.3528)
      this.text(bullet, { x: MARGIN + 5, width: WIDTH - 5 })
    }
    this.y += 1.5
  }
}

function drawFooter(doc: jsPDF, family: string, footer: FamilySheet['footer']) {
  const top = FOOTER_TOP
  doc.setDrawColor(RULE)
  doc.setLineWidth(0.3)
  doc.line(MARGIN, top, PAGE.width - MARGIN, top)

  const qrX = PAGE.width - MARGIN - QR_SIZE
  const qrY = top + 5
  const modules = qrModules(footer.url)
  const cell = QR_SIZE / modules.length
  doc.setFillColor(INK)
  modules.forEach((row, rowIndex) =>
    row.forEach((dark, column) => {
      if (dark) doc.rect(qrX + column * cell, qrY + rowIndex * cell, cell + 0.02, cell + 0.02, 'F')
    }),
  )
  doc.setFont(family, 'normal')
  doc.setFontSize(7)
  doc.setTextColor(MUTED)
  doc.text(footer.scan, qrX + QR_SIZE / 2, qrY + QR_SIZE + 3, { align: 'center' })

  const width = qrX - MARGIN - 6
  let y = top + 8
  doc.setFont(family, 'bold')
  doc.setFontSize(11)
  doc.setTextColor(BLUE)
  doc.text(footer.madeWith, MARGIN, y)
  y += 5
  doc.setFont(family, 'normal')
  doc.setFontSize(8)
  doc.setTextColor(MUTED)
  doc.text(`${footer.date} · ${footer.url}`, MARGIN, y)
  y += 5
  if (footer.sources.length > 0) {
    const lines: string[] = doc.splitTextToSize(
      `${footer.sourcesLabel}: ${footer.sources.join(' · ')}`,
      width,
    )
    doc.setFontSize(7)
    doc.text(lines.slice(0, 5), MARGIN, y)
  }
}

/** The sheet as a PDF blob: one A4 page, always. */
async function familySheetPdf(sheet: FamilySheet): Promise<Blob> {
  const [{ jsPDF }, files] = await Promise.all([import('jspdf'), loadCvFont('inter')])
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  if (files) embedCvFont(doc, files)
  const family = files ? 'cv' : 'helvetica'

  doc.setFillColor(GOLD)
  doc.rect(0, 0, PAGE.width, 3, 'F')
  const writer = new Writer(doc, family)
  writer.y = MARGIN - 2
  writer.text(sheet.kicker, { size: 9, color: MUTED, gap: 1.5 })
  writer.text(sheet.name, { size: 24, bold: true, color: INK, gap: 3 })
  for (const section of sheet.sections) writer.section(section)
  drawFooter(doc, family, sheet.footer)
  return doc.output('blob')
}

/** Hands the PDF over: the phone's share sheet (WhatsApp) when it takes files, otherwise a download. */
export async function shareFamilySheet(sheet: FamilySheet, slug: string): Promise<void> {
  await shareFile(await familySheetPdf(sheet), `kaye-${slug}-familia.pdf`, sheet.name)
}
