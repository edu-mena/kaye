import { afterEach, describe, expect, it, vi } from 'vitest'
import { centredOffset, clampOffset, coverScale, sourceRect, zoomOffset } from './crop'
import { checkImage, encodeCrop, MAX_UPLOAD_BYTES } from './encodeImage'

const image = { width: 400, height: 200 }
const frame = { width: 100, height: 100 }

/** Stands in for the browser's image decoding and canvas. */
const draw = () => {
  const close = vi.fn<() => void>()
  vi.stubGlobal(
    'createImageBitmap',
    vi.fn<() => Promise<{ width: number; height: number; close: () => void }>>(async () => ({
      width: 400,
      height: 200,
      close,
    })),
  )
  const drawImage = vi.fn<(...args: unknown[]) => void>()
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
    drawImage,
  } as unknown as CanvasRenderingContext2D)
  return { close, drawImage }
}

describe('crop', () => {
  it('covers the frame and starts centred', () => {
    expect(coverScale(image, frame)).toBe(0.5)
    expect(centredOffset(image, frame, 0.5)).toEqual({ x: -50, y: 0 })
  })

  it('never lets an empty edge show', () => {
    expect(clampOffset({ x: 30, y: 10 }, image, frame, 0.5)).toEqual({ x: 0, y: 0 })
    expect(clampOffset({ x: -500, y: -10 }, image, frame, 0.5)).toEqual({ x: -100, y: 0 })
  })

  it('zooms around the frame centre', () => {
    // Twice as big: the point in the centre (50, 50) stays put.
    expect(zoomOffset({ x: -50, y: 0 }, 0.5, 1, frame)).toEqual({ x: -150, y: -50 })
  })

  it('maps the frame back to the original pixels', () => {
    expect(sourceRect({ x: -150, y: -50 }, frame, 1)).toEqual({ x: 150, y: 50, width: 100, height: 100 })
  })
})

describe('encodeImage', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('takes only pictures that are not too big', () => {
    expect(checkImage(new File(['x'], 'eu.jpg', { type: 'image/jpeg' }))).toBe('ok')
    expect(checkImage(new File(['x'], 'notas.pdf', { type: 'application/pdf' }))).toBe('type')
    const big = new File(['x'], 'grande.png', { type: 'image/png' })
    Object.defineProperty(big, 'size', { value: MAX_UPLOAD_BYTES + 1 })
    expect(checkImage(big)).toBe('size')
  })

  it('draws the chosen part at the output size, in WebP when the browser writes it', async () => {
    const { close, drawImage } = draw()
    vi.spyOn(HTMLCanvasElement.prototype, 'toDataURL').mockReturnValue('data:image/webp;base64,AAA')
    const file = new File(['x'], 'eu.png', { type: 'image/png' })
    expect(
      await encodeCrop(file, { x: 150, y: 50, width: 100, height: 100 }, { width: 320, height: 320 }),
    ).toBe('data:image/webp;base64,AAA')
    expect(drawImage).toHaveBeenCalledWith(expect.anything(), 150, 50, 100, 100, 0, 0, 320, 320)
    expect(close).toHaveBeenCalled()
  })

  it('falls back to JPEG where WebP cannot be written', async () => {
    draw()
    vi.spyOn(HTMLCanvasElement.prototype, 'toDataURL').mockImplementation((type) =>
      type === 'image/jpeg' ? 'data:image/jpeg;base64,BBB' : 'data:image/png;base64,CCC',
    )
    const file = new File(['x'], 'eu.png', { type: 'image/png' })
    expect(await encodeCrop(file, { x: 0, y: 0, width: 10, height: 10 }, { width: 10, height: 10 })).toBe(
      'data:image/jpeg;base64,BBB',
    )
  })

  it('fails cleanly when the browser cannot draw', async () => {
    draw()
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null)
    const file = new File(['x'], 'eu.png', { type: 'image/png' })
    await expect(
      encodeCrop(file, { x: 0, y: 0, width: 1, height: 1 }, { width: 1, height: 1 }),
    ).rejects.toThrow('no-canvas')
  })
})
