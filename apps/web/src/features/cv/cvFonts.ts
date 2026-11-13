import { useEffect, useMemo, useReducer } from 'react'
import type { CvFont } from '../../data/types'

// One TTF per font and weight (public/fonts/cv): the browser and jsPDF read the same file, so
// both agree on the width of every word. Fetched only when a CV needs them.

const PT_TO_MM = 0.3528

/** Width of a text in mm: the whole layout depends on it. */
export type Measure = (text: string, size: number, bold: boolean) => number

export type CvFontFiles = { regular: ArrayBuffer; bold: ArrayBuffer }

const loading = new Map<CvFont, Promise<CvFontFiles | null>>()
const loaded = new Set<CvFont>()

const familyName = (font: CvFont) => `Kaye CV ${font}`

/** For the SVG: the real font, and something close while it loads. */
export const cvFontFamily = (font: CvFont) => `"${familyName(font)}", Arial, sans-serif`

async function fetchFont(font: CvFont, weight: 400 | 700): Promise<ArrayBuffer> {
  const response = await fetch(`${import.meta.env.BASE_URL}fonts/cv/${font}-${weight}.ttf`)
  if (!response.ok) throw new Error(`Font ${font} ${weight}: ${response.status}`)
  return response.arrayBuffer()
}

async function fetchAndAdd(font: CvFont): Promise<CvFontFiles | null> {
  try {
    const [regular, bold] = await Promise.all([fetchFont(font, 400), fetchFont(font, 700)])
    const faces = [
      new FontFace(familyName(font), regular.slice(0), { weight: '400' }),
      new FontFace(familyName(font), bold.slice(0), { weight: '700' }),
    ]
    await Promise.all(faces.map((face) => face.load()))
    faces.forEach((face) => document.fonts.add(face))
    loaded.add(font)
    return { regular, bold }
  } catch {
    // Offline or blocked: the CV still shows, with a fallback font. The next use tries again.
    loading.delete(font)
    return null
  }
}

export function loadCvFont(font: CvFont): Promise<CvFontFiles | null> {
  const current = loading.get(font) ?? fetchAndAdd(font)
  loading.set(font, current)
  return current
}

function canvasContext(): CanvasRenderingContext2D | null {
  try {
    return document.createElement('canvas').getContext('2d')
  } catch {
    return null
  }
}

/** Measures with the font once loaded, and with a fallback (`null`) until then. */
export function createMeasure(font: CvFont | null): Measure {
  const context = canvasContext()
  const family = font ? cvFontFamily(font) : 'Arial, sans-serif'
  const known = new Map<string, number>()

  return (text, size, bold) => {
    const key = `${bold ? 'b' : 'r'}${text}`
    let width = known.get(key)
    if (width === undefined) {
      if (context) {
        context.font = `${bold ? 700 : 400} 100px ${family}`
        context.fontKerning = 'none'
        width = context.measureText(text).width / 100
      } else {
        width = text.length * 0.5
      }
      known.set(key, width)
    }
    return width * size * PT_TO_MM
  }
}

/** Loads the font and gives its measure; the sheet lays itself out again once it arrives. */
export function useCvMeasure(font: CvFont): Measure {
  const [, refresh] = useReducer((count: number) => count + 1, 0)
  const ready = loaded.has(font)

  useEffect(() => {
    if (ready) return
    let live = true
    void loadCvFont(font).then(() => {
      if (live) refresh()
      return undefined
    })
    return () => {
      live = false
    }
  }, [font, ready])

  return useMemo(() => createMeasure(ready ? font : null), [font, ready])
}
