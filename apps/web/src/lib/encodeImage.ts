import type { Rect, Size } from './crop'

/** Bigger files are refused before any work: a phone photo is a few MB. */
export const MAX_UPLOAD_BYTES = 15 * 1024 * 1024

/** Whether a picked file can be used: only pictures, and not too big. */
export function checkImage(file: File): 'ok' | 'type' | 'size' {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) return 'type'
  return file.size > MAX_UPLOAD_BYTES ? 'size' : 'ok'
}

/**
 * Draws the chosen part of the picture at the size it is shown and encodes it small (a data URL
 * that fits the device's storage): WebP where the browser can write it, JPEG otherwise. The browser
 * already turns phone photos the right way up (EXIF) when it reads them.
 */
export async function encodeCrop(file: File, rect: Rect, output: Size): Promise<string> {
  const bitmap = await createImageBitmap(file)
  const canvas = document.createElement('canvas')
  canvas.width = output.width
  canvas.height = output.height
  const context = canvas.getContext('2d')
  if (!context) throw new Error('no-canvas')
  context.imageSmoothingQuality = 'high'
  context.drawImage(bitmap, rect.x, rect.y, rect.width, rect.height, 0, 0, output.width, output.height)
  bitmap.close()
  const webp = canvas.toDataURL('image/webp', 0.8)
  return webp.startsWith('data:image/webp') ? webp : canvas.toDataURL('image/jpeg', 0.82)
}
