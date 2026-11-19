import type { CvData, CvEntry, CvSection, CvStyle, CvTemplate } from '../../data/types'
import { mixColors } from '../../domain/cvStyle'
import type { Measure } from './cvFonts'

// The one place that decides where everything goes on the page, in millimetres. The preview
// (CvSheet.tsx) and the PDF (cvPdf.ts) only paint what comes out, so they cannot disagree.

export const PAGE_WIDTH = 210
export const PAGE_HEIGHT = 297
export const PT_TO_MM = 0.3528

const WHITE = '#ffffff'
const STORY: CvSection[] = ['summary', 'experience', 'projects', 'education']
const MAIN: CvSection[] = [...STORY, 'certifications']
const ENTRY_GAP = 2.4
const BOX_PADDING = 1.2
const OUTLINE_PADDING = 2.4
const BAND_WIDTH = 66
const EURO_LABEL_WIDTH = 43
const EURO_GUTTER = 6
const RETRATO_BAND = 68
const RETRATO_PHOTO = 36
const CRIATIVO_PHOTO = 30
const CRIATIVO_STRIP = 4
const CHIP_GAP = 1.6

export type CvLabels = Record<CvSection, string>

export type CvOp =
  | {
      kind: 'rect'
      x: number
      y: number
      width: number
      height: number
      radius?: number
      fill?: string
      stroke?: string
    }
  /** A round photo; `src` is an image data URL. */
  | { kind: 'image'; x: number; y: number; size: number; src: string }
  | {
      kind: 'line'
      x1: number
      y1: number
      x2: number
      y2: number
      color: string
      width: number
      dotted: boolean
    }
  /** `y` is the baseline, `size` in pt, `tracking` in mm between letters. Always left-aligned here. */
  | {
      kind: 'text'
      x: number
      y: number
      text: string
      size: number
      bold: boolean
      color: string
      tracking: number
    }

export type CvPage = CvOp[]

type LayoutInput = {
  cv: CvData
  template: CvTemplate
  style: CvStyle
  labels: CvLabels
  measure: Measure
  /** Shown where the name or headline is still empty, only in the preview. */
  placeholder?: string
  /** The person's photo; without it the photo templates show their initials. */
  photo?: string | null
}

type TextOptions = {
  bold?: boolean
  color?: string
  align?: 'left' | 'right' | 'center'
  after?: number
  tracking?: number
}

/** The pages so far; a new one starts with the template's background. */
class Sheet {
  readonly pages: CvPage[] = []
  private readonly background: CvOp[]

  constructor(background: CvOp[] = []) {
    this.background = background
    this.page(0)
  }

  page(index: number): CvPage {
    while (this.pages.length <= index) this.pages.push([...this.background])
    return this.pages[index] as CvPage
  }
}

function wrap(text: string, width: number, fits: (line: string) => boolean): string[] {
  const lines: string[] = []
  for (const paragraph of text.split('\n')) {
    let line = ''
    for (const word of paragraph.split(/\s+/).filter(Boolean)) {
      const longer = line ? `${line} ${word}` : word
      if (fits(longer)) {
        line = longer
        continue
      }
      if (line) lines.push(line)
      line = word
      // A word wider than the column (a long link) is cut rather than left to overflow.
      while (!fits(line) && line.length > 1) {
        let cut = line.length - 1
        while (cut > 1 && !fits(line.slice(0, cut))) cut -= 1
        lines.push(line.slice(0, cut))
        line = line.slice(cut)
      }
    }
    if (line) lines.push(line)
  }
  return width > 0 ? lines : []
}

/** A column that writes wrapped text downwards and moves to the next page when it runs out. */
class Column {
  private readonly sheet: Sheet
  private readonly style: CvStyle
  readonly measure: Measure
  x: number
  width: number
  y: number
  page = 0

  constructor(sheet: Sheet, input: LayoutInput, x: number, width: number, y: number) {
    this.sheet = sheet
    this.style = input.style
    this.measure = input.measure
    this.x = x
    this.width = width
    this.y = y
  }

  private get bottom() {
    return PAGE_HEIGHT - this.style.marginY
  }

  /** Moves to the next page unless this much height is left. */
  keep(height: number) {
    if (this.y + height <= this.bottom) return
    this.page += 1
    this.y = this.style.marginY
  }

  lineHeight(size: number) {
    return size * PT_TO_MM * this.style.lineHeight
  }

  text(value: string, size: number, options: TextOptions = {}) {
    if (!value.trim()) return
    const { bold = false, color = this.style.text, align = 'left', after = 0, tracking = 0 } = options
    const widthOf = (line: string) => this.measure(line, size, bold) + tracking * line.length
    const lineHeight = this.lineHeight(size)
    for (const line of wrap(value, this.width, (candidate) => widthOf(candidate) <= this.width)) {
      this.keep(lineHeight)
      const free = this.width - widthOf(line)
      const x = this.x + (align === 'right' ? free : align === 'center' ? free / 2 : 0)
      this.sheet.page(this.page).push({
        kind: 'text',
        x,
        y: this.y + size * PT_TO_MM,
        text: line,
        size,
        bold,
        color,
        tracking,
      })
      this.y += lineHeight
    }
    this.y += after
  }

  rule(color: string) {
    const { separator } = this.style
    if (separator === 'none') return
    const width = separator === 'thick' ? 0.6 : 0.2
    this.y += 0.5
    this.sheet.page(this.page).push({
      kind: 'line',
      x1: this.x,
      y1: this.y,
      x2: this.x + this.width,
      y2: this.y,
      color,
      width,
      dotted: separator === 'dotted',
    })
    this.y += 0.5 + width
  }

  rect(height: number, fill: string) {
    this.draw({ kind: 'rect', x: this.x, y: this.y, width: this.width, height, fill })
  }

  draw(op: CvOp) {
    this.sheet.page(this.page).push(op)
  }

  /** Where the column is now, to slide something behind what comes next. */
  mark() {
    return { page: this.page, index: this.sheet.page(this.page).length }
  }

  /** Draws under what was written since the mark: bands and boxes that wrap text of unknown height. */
  behind(mark: { page: number; index: number }, op: CvOp) {
    this.sheet.page(mark.page).splice(mark.index, 0, op)
  }
}

/** The colours of a section title: on white paper, or on the dark band of "moderno". */
type TitleColors = {
  color: string
  rule: string
  tint: string
  tintText: string
  solid: string
  solidText: string
}

function paperColors(style: CvStyle): TitleColors {
  return {
    color: style.accent,
    rule: mixColors(style.accent, WHITE, 0.7),
    tint: mixColors(style.accent, WHITE, 0.88),
    tintText: style.accent,
    solid: style.accent,
    solidText: WHITE,
  }
}

function bandColors(style: CvStyle): TitleColors {
  return {
    color: mixColors(style.accent, WHITE, 0.65),
    rule: mixColors(style.accent, WHITE, 0.4),
    tint: mixColors(style.accent, WHITE, 0.15),
    tintText: WHITE,
    solid: WHITE,
    solidText: style.accent,
  }
}

type TitleOptions = {
  rule?: boolean
  /** Written as it is, without capitals or spacing between letters. */
  plain?: boolean
}

function sectionTitle(
  column: Column,
  title: string,
  style: CvStyle,
  colors: TitleColors,
  { rule = true, plain = false }: TitleOptions = {},
) {
  const { box, headingSize, bodySize } = style
  const text = plain ? title : title.toLocaleUpperCase()
  const tracking = plain ? 0 : headingSize * PT_TO_MM * 0.1
  const line = column.lineHeight(headingSize)
  // A title never stays alone at the bottom of a page.
  column.keep(line + BOX_PADDING * 2 + column.lineHeight(bodySize) * 2)
  if (box === 'tint' || box === 'solid') {
    const height = line + BOX_PADDING * 2
    column.rect(height, box === 'tint' ? colors.tint : colors.solid)
    column.x += BOX_PADDING
    column.width -= BOX_PADDING * 2
    column.y += BOX_PADDING
    column.text(text, headingSize, {
      bold: true,
      color: box === 'tint' ? colors.tintText : colors.solidText,
      tracking,
      after: BOX_PADDING,
    })
    column.x -= BOX_PADDING
    column.width += BOX_PADDING * 2
  } else {
    column.text(text, headingSize, { bold: true, color: colors.color, tracking })
    if (rule) column.rule(colors.rule)
  }
}

type ContentOptions = {
  /** The period at the right end of the title's line, instead of under it. */
  periodRight?: boolean
  /** A dot of this colour in the margin, beside each entry. */
  marker?: string
  /** Skills as small labels, in this colour. */
  chips?: string
}

/** The title of an entry with its period aligned to the right of the same line. */
function titleWithPeriod(column: Column, entry: CvEntry, style: CvStyle) {
  const size = style.bodySize - 0.5
  const { y, page } = column
  column.text(entry.period, size, { color: style.muted, align: 'right' })
  column.y = y
  column.page = page
  const { width } = column
  column.width -= column.measure(entry.period, size, false) + 3
  column.text(entry.title, style.bodySize, { bold: true })
  column.width = width
}

function writeEntries(column: Column, list: CvEntry[], style: CvStyle, options: ContentOptions = {}) {
  const { periodRight = false, marker } = options
  list.forEach((entry, index) => {
    if (index > 0) column.y += ENTRY_GAP
    column.keep(column.lineHeight(style.bodySize) * 2)
    if (marker)
      column.draw({
        kind: 'rect',
        x: column.x - 3.6,
        y: column.y + 1,
        width: 1.6,
        height: 1.6,
        radius: 0.8,
        fill: marker,
      })
    if (periodRight) titleWithPeriod(column, entry, style)
    else column.text(entry.title, style.bodySize, { bold: true })
    const detail = periodRight ? entry.place : [entry.place, entry.period].filter(Boolean).join(' · ')
    column.text(detail, style.bodySize - 0.5, { color: style.muted })
    if (entry.description.trim()) column.y += style.entryGap
    column.text(entry.description, style.bodySize)
  })
}

function hasContent(cv: CvData, section: CvSection): boolean {
  const value = cv[section]
  return typeof value === 'string' ? value.trim() !== '' : value.length > 0
}

/** Short labels side by side, wrapping to new rows. */
function writeChips(column: Column, items: string[], style: CvStyle, color: string) {
  const size = style.bodySize - 0.5
  const height = column.lineHeight(size) + 1.6
  const padding = 2.2
  let x = column.x
  column.keep(height)
  for (const item of items) {
    const width = column.measure(item, size, false) + padding * 2
    if (x > column.x && x + width > column.x + column.width) {
      x = column.x
      column.y += height + CHIP_GAP
      column.keep(height)
    }
    column.draw({
      kind: 'rect',
      x,
      y: column.y,
      width,
      height,
      radius: height / 2,
      fill: mixColors(color, WHITE, 0.87),
    })
    column.draw({
      kind: 'text',
      x: x + padding,
      y: column.y + (height + size * PT_TO_MM * 0.7) / 2,
      text: item,
      size,
      bold: false,
      color,
      tracking: 0,
    })
    x += width + CHIP_GAP
  }
  column.y += height
}

function writeContent(
  column: Column,
  cv: CvData,
  section: CvSection,
  style: CvStyle,
  options: ContentOptions = {},
) {
  const value = cv[section]
  if (typeof value === 'string') column.text(value, style.bodySize)
  else if (section === 'skills' && options.chips) writeChips(column, cv.skills, style, options.chips)
  else if (section === 'skills' || section === 'languages' || section === 'links')
    column.text((value as string[]).join(', '), style.bodySize)
  else writeEntries(column, value as CvEntry[], style, options)
}

/** The sections of a main column, one after the other, each followed by the section gap. */
function writeSections(
  sheet: Sheet,
  column: Column,
  input: LayoutInput,
  sections: CvSection[],
  options: ContentOptions & { title?: TitleOptions } = {},
) {
  const { cv, style, labels } = input
  for (const section of sections) {
    if (!hasContent(cv, section)) continue
    boxedSection(sheet, column, style, () => {
      sectionTitle(column, labels[section], style, paperColors(style), options.title)
      column.y += style.headingGap
      writeContent(column, cv, section, style, options)
    })
    column.y += style.sectionGap
  }
}

/** Links, skills, languages and certifications as short lists, for a narrow column. */
function writeSideLists(side: Column, input: LayoutInput, colors: TitleColors, color: string) {
  const { cv, style, labels } = input
  for (const section of ['links', 'skills', 'languages', 'certifications'] as CvSection[]) {
    if (!hasContent(cv, section)) continue
    side.y += style.sectionGap
    sectionTitle(side, labels[section], style, colors)
    side.y += style.headingGap
    const items =
      section === 'certifications' ? cv.certifications.map((entry) => entry.title) : (cv[section] as string[])
    for (const item of items) side.text(item, style.bodySize, { color, after: 0.6 })
  }
}

/** "Joana Manuel" → "JM" */
export function initials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean)
  const letters = words.length > 1 ? [words[0], words[words.length - 1]] : words
  return letters.map((word) => word?.charAt(0).toLocaleUpperCase()).join('')
}

/** The round photo, or a circle with the initials while there is none. */
function portrait(
  column: Column,
  input: LayoutInput,
  x: number,
  y: number,
  size: number,
  tone: [string, string],
) {
  const [back, front] = tone
  if (input.photo) {
    column.draw({ kind: 'image', x, y, size, src: input.photo })
    return
  }
  column.draw({ kind: 'rect', x, y, width: size, height: size, radius: size / 2, fill: back })
  const text = initials(input.cv.name)
  const textSize = size * 1.1
  column.draw({
    kind: 'text',
    x: x + (size - column.measure(text, textSize, true)) / 2,
    y: y + size / 2 + textSize * PT_TO_MM * 0.36,
    text,
    size: textSize,
    bold: true,
    color: front,
    tracking: 0,
  })
}

/** A thin box around a section, one piece per page when the section crosses a page. */
function outline(
  sheet: Sheet,
  start: { page: number; y: number },
  end: Column,
  x: number,
  width: number,
  stroke: string,
  marginY: number,
) {
  for (let page = start.page; page <= end.page; page += 1) {
    const top = page === start.page ? start.y : marginY
    const bottom = page === end.page ? end.y : PAGE_HEIGHT - marginY
    sheet.page(page).push({ kind: 'rect', x, y: top, width, height: bottom - top, stroke })
  }
}

/** Writes one section; with outline boxes, inset and framed. */
function boxedSection(sheet: Sheet, column: Column, style: CvStyle, write: () => void) {
  if (style.box !== 'outline') {
    write()
    return
  }
  column.keep(OUTLINE_PADDING * 4)
  const start = { page: column.page, y: column.y }
  const { x, width } = column
  column.x += OUTLINE_PADDING
  column.width -= OUTLINE_PADDING * 2
  column.y += OUTLINE_PADDING
  write()
  column.y += OUTLINE_PADDING
  column.x = x
  column.width = width
  outline(sheet, start, column, x, width, paperColors(style).rule, style.marginY)
}

/** One column, centred header, ruled sections: the Harvard style. */
function classico(input: LayoutInput): CvPage[] {
  const { cv, style, labels, placeholder = '' } = input
  const sheet = new Sheet()
  const column = new Column(sheet, input, style.marginX, PAGE_WIDTH - style.marginX * 2, style.marginY)
  const colors = paperColors(style)
  column.text(cv.name || placeholder, style.nameSize, { bold: true, align: 'center', color: style.accent })
  column.text(cv.headline || placeholder, style.bodySize + 1, { align: 'center', after: 0.6 })
  column.text([cv.contact, ...cv.links].filter(Boolean).join(' · '), style.bodySize - 0.8, {
    color: style.muted,
    align: 'center',
    after: 1.4,
  })
  column.rule(colors.rule)
  for (const section of [...MAIN, 'skills', 'languages'] as CvSection[]) {
    if (!hasContent(cv, section)) continue
    column.y += style.sectionGap
    boxedSection(sheet, column, style, () => {
      sectionTitle(column, labels[section], style, colors)
      column.y += style.headingGap
      writeContent(column, cv, section, style)
    })
  }
  return sheet.pages
}

/** Two columns: contact and skills in a coloured band, the story on the right. */
function moderno(input: LayoutInput): CvPage[] {
  const { cv, style, placeholder = '' } = input
  const sheet = new Sheet([
    { kind: 'rect', x: 0, y: 0, width: BAND_WIDTH, height: PAGE_HEIGHT, fill: style.accent },
  ])
  const padding = style.marginX * 0.65
  const side = new Column(sheet, input, padding, BAND_WIDTH - padding * 2, style.marginY)
  const sideText = mixColors(style.accent, WHITE, 0.82)
  const colors = bandColors(style)
  side.text(cv.name || placeholder, style.nameSize, { bold: true, color: WHITE, after: 1 })
  side.text(cv.headline || placeholder, style.bodySize + 0.8, { color: sideText, after: 4 })
  for (const part of cv.contact.split(' · ')) side.text(part, style.bodySize - 0.8, { color: sideText })
  writeSideLists(side, input, colors, WHITE)
  const left = BAND_WIDTH + 10
  const main = new Column(sheet, input, left, PAGE_WIDTH - left - style.marginX, style.marginY)
  writeSections(sheet, main, input, STORY)
  return sheet.pages
}

/** Labels on the left, content on the right, thin rules: the Europass style. */
function europeu(input: LayoutInput): CvPage[] {
  const { cv, style, labels, placeholder = '' } = input
  const sheet = new Sheet()
  const width = PAGE_WIDTH - style.marginX * 2
  const contentX = style.marginX + EURO_LABEL_WIDTH + EURO_GUTTER
  const label = new Column(sheet, input, style.marginX, EURO_LABEL_WIDTH, style.marginY)
  const content = new Column(sheet, input, contentX, width - EURO_LABEL_WIDTH - EURO_GUTTER, style.marginY)
  const row = new Column(sheet, input, style.marginX, width, style.marginY)
  const colors = paperColors(style)
  label.text('CURRICULUM VITAE', style.headingSize, {
    bold: true,
    color: style.accent,
    align: 'right',
    tracking: style.headingSize * PT_TO_MM * 0.08,
  })
  content.text(cv.name || placeholder, style.nameSize, { bold: true, color: style.accent })
  content.text(cv.headline || placeholder, style.bodySize + 1.2, { after: 0.6 })
  content.text(cv.contact, style.bodySize - 0.4, { color: style.muted })
  for (const section of [...MAIN, 'skills', 'languages', 'links'] as CvSection[]) {
    if (!hasContent(cv, section)) continue
    // Both columns start each row together, under a rule across the page.
    row.page = content.page
    row.y = content.y + style.sectionGap * 0.5
    row.keep(label.lineHeight(style.headingSize) * 2 + style.sectionGap)
    row.rule(colors.rule)
    row.y += style.sectionGap * 0.5
    label.page = row.page
    content.page = row.page
    label.y = row.y
    content.y = row.y + style.headingGap
    sectionTitle(label, labels[section], style, colors, { rule: false })
    writeContent(content, cv, section, style)
    if (style.box === 'outline') {
      content.y += 1.2
      outline(
        sheet,
        { page: row.page, y: row.y - 1 },
        content,
        style.marginX - 1.5,
        width + 3,
        colors.rule,
        style.marginY,
      )
    }
  }
  return sheet.pages
}

/** A light band with the photo and the short lists; the name opens the story on the right. */
function retrato(input: LayoutInput): CvPage[] {
  const { cv, style, placeholder = '' } = input
  const tint = mixColors(style.accent, WHITE, 0.9)
  const sheet = new Sheet([
    { kind: 'rect', x: 0, y: 0, width: RETRATO_BAND, height: PAGE_HEIGHT, fill: tint },
  ])
  const padding = style.marginX * 0.6
  const side = new Column(sheet, input, padding, RETRATO_BAND - padding * 2, style.marginY)
  if (style.photo) {
    const tone: [string, string] = [mixColors(style.accent, WHITE, 0.72), style.accent]
    portrait(side, input, (RETRATO_BAND - RETRATO_PHOTO) / 2, style.marginY, RETRATO_PHOTO, tone)
    side.y += RETRATO_PHOTO + 5
  }
  for (const part of cv.contact.split(' · ')) side.text(part, style.bodySize - 0.6, { color: style.text })
  writeSideLists(side, input, paperColors(style), style.text)

  const left = RETRATO_BAND + 9
  const main = new Column(sheet, input, left, PAGE_WIDTH - left - style.marginX, style.marginY)
  main.text(cv.name || placeholder, style.nameSize, { bold: true, color: style.accent, after: 0.6 })
  main.text(cv.headline || placeholder, style.bodySize + 1.5, { color: style.muted, after: style.sectionGap })
  writeSections(sheet, main, input, STORY)
  return sheet.pages
}

/** A coloured header across the page, then the story and a narrow column split by a thin line. */
function colunas(input: LayoutInput): CvPage[] {
  const { cv, style, placeholder = '' } = input
  const sheet = new Sheet()
  const width = PAGE_WIDTH - style.marginX * 2
  const head = new Column(sheet, input, style.marginX, width, style.marginY)
  const start = head.mark()
  head.text(cv.name || placeholder, style.nameSize, { bold: true, color: WHITE })
  head.text(cv.headline || placeholder, style.bodySize + 1.5, { color: WHITE, after: 0.8 })
  head.text(cv.contact, style.bodySize - 0.6, { color: mixColors(style.accent, WHITE, 0.85) })
  const top = head.y + style.marginY * 0.6
  head.behind(start, { kind: 'rect', x: 0, y: 0, width: PAGE_WIDTH, height: top, fill: style.accent })

  const sideWidth = width * 0.31
  const gutter = 10
  const body = top + style.sectionGap
  const main = new Column(sheet, input, style.marginX, width - sideWidth - gutter, body)
  const side = new Column(sheet, input, style.marginX + width - sideWidth, sideWidth, body - style.sectionGap)
  writeSections(sheet, main, input, STORY)
  writeSideLists(side, input, paperColors(style), style.text)

  // The line between the columns, on every page they reach.
  const x = side.x - gutter / 2
  const rule = mixColors(style.accent, WHITE, 0.75)
  sheet.pages.forEach((_, page) =>
    sheet.page(page).push({
      kind: 'line',
      x1: x,
      y1: page === 0 ? body : style.marginY,
      x2: x,
      y2: PAGE_HEIGHT - style.marginY,
      color: rule,
      width: 0.2,
      dotted: false,
    }),
  )
  return sheet.pages
}

/** Only type and white space: a light name, plain titles, periods at the right. */
function minimalista(input: LayoutInput): CvPage[] {
  const { cv, style, placeholder = '' } = input
  const sheet = new Sheet()
  const column = new Column(sheet, input, style.marginX, PAGE_WIDTH - style.marginX * 2, style.marginY)
  column.text(cv.name || placeholder, style.nameSize, { color: style.accent })
  column.text(cv.headline || placeholder, style.bodySize + 1, { color: style.muted, after: 1 })
  column.text([cv.contact, ...cv.links].filter(Boolean).join(' · '), style.bodySize - 0.8, {
    color: style.muted,
    after: style.sectionGap * 1.4,
  })
  writeSections(sheet, column, input, [...MAIN, 'skills', 'languages'], {
    periodRight: true,
    title: { plain: true },
  })
  return sheet.pages
}

/** Colour and shapes in the header, the photo in the corner, dots beside each entry. */
function criativo(input: LayoutInput): CvPage[] {
  const { cv, style, placeholder = '' } = input
  const sheet = new Sheet([
    { kind: 'rect', x: 0, y: 0, width: CRIATIVO_STRIP, height: PAGE_HEIGHT, fill: style.accent },
  ])
  const shape = mixColors(style.accent, WHITE, 0.14)
  const left = style.marginX + 4
  const room = PAGE_WIDTH - left - style.marginX - (style.photo ? CRIATIVO_PHOTO + 6 : 0)
  const head = new Column(sheet, input, left, room, style.marginY)
  const start = head.mark()
  head.text(cv.name || placeholder, style.nameSize, { bold: true, color: WHITE, after: 0.6 })
  head.text(cv.headline || placeholder, style.bodySize + 1.5, { color: WHITE, after: 1 })
  head.text([cv.contact, ...cv.links].filter(Boolean).join(' · '), style.bodySize - 0.8, {
    color: mixColors(style.accent, WHITE, 0.85),
  })
  const photoBottom = style.photo ? style.marginY + CRIATIVO_PHOTO : 0
  const top = Math.max(head.y, photoBottom) + style.marginY * 0.7
  const circle = (x: number, y: number, size: number): CvOp => ({
    kind: 'rect',
    x,
    y,
    width: size,
    height: size,
    radius: size / 2,
    fill: shape,
  })
  // Shapes first, under the band's text; the band under everything.
  head.behind(start, circle(PAGE_WIDTH - 40, top - 52, 52))
  head.behind(start, circle(PAGE_WIDTH - 92, -22, 44))
  head.behind(start, { kind: 'rect', x: 0, y: 0, width: PAGE_WIDTH, height: top, fill: style.accent })
  if (style.photo) {
    const x = PAGE_WIDTH - style.marginX - CRIATIVO_PHOTO
    portrait(head, input, x, style.marginY, CRIATIVO_PHOTO, [WHITE, style.accent])
  }
  const column = new Column(sheet, input, left, PAGE_WIDTH - left - style.marginX, top + style.sectionGap)
  writeSections(sheet, column, input, [...MAIN, 'skills', 'languages', 'links'], {
    marker: style.accent,
    chips: style.accent,
  })
  return sheet.pages
}

/** A large name over a short bar, the summary in a box and the skills as chips, right at the top. */
function destaque(input: LayoutInput): CvPage[] {
  const { cv, style, placeholder = '' } = input
  const sheet = new Sheet()
  const column = new Column(sheet, input, style.marginX, PAGE_WIDTH - style.marginX * 2, style.marginY)
  column.text(cv.name || placeholder, style.nameSize, { bold: true, color: style.accent })
  column.text(cv.headline || placeholder, style.bodySize + 2, { color: style.text, after: 1 })
  column.text([cv.contact, ...cv.links].filter(Boolean).join(' · '), style.bodySize - 0.8, {
    color: style.muted,
    after: 2,
  })
  column.rect(1.2, style.accent)
  column.y += 1.2 + style.sectionGap
  if (hasContent(cv, 'summary')) {
    const pad = 3.5
    const mark = column.mark()
    const y = column.y
    const { x, width } = column
    column.x += pad + 1
    column.width -= pad * 2 + 1
    column.y += pad
    column.text(cv.summary, style.bodySize + 0.3)
    column.y += pad
    column.x = x
    column.width = width
    const height = (column.page === mark.page ? column.y : PAGE_HEIGHT - style.marginY) - y
    column.behind(mark, { kind: 'rect', x, y, width: 1.2, height, fill: style.accent })
    column.behind(mark, { kind: 'rect', x, y, width, height, fill: mixColors(style.accent, WHITE, 0.92) })
    column.y += style.sectionGap
  }
  writeSections(
    sheet,
    column,
    input,
    ['skills', 'experience', 'projects', 'education', 'certifications', 'languages', 'links'],
    {
      chips: style.accent,
    },
  )
  return sheet.pages
}

const LAYOUTS: Record<CvTemplate, (input: LayoutInput) => CvPage[]> = {
  classico,
  moderno,
  europeu,
  retrato,
  colunas,
  minimalista,
  criativo,
  destaque,
}

/** The whole CV as pages of drawing instructions. */
export function layoutCv(input: LayoutInput): CvPage[] {
  return LAYOUTS[input.template](input)
}
