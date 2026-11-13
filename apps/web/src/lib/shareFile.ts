import { saveFile } from './saveFile'

/**
 * Hands a file over: the phone's share sheet (WhatsApp, Instagram stories) when it takes files,
 * otherwise a download.
 */
export async function shareFile(blob: Blob, name: string, title: string): Promise<void> {
  const file = new File([blob], name, { type: blob.type })
  if (typeof navigator.canShare === 'function' && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title })
      return
    } catch (error) {
      // Closed on purpose: nothing else to do. Any other failure falls back to the download.
      if (error instanceof DOMException && error.name === 'AbortError') return
    }
  }
  saveFile(blob, name)
}
