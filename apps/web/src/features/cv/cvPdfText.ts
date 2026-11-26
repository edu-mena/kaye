// Reads the text of a CV PDF on the device (docs/decisoes/0025). pdf.js loads only when someone picks a
// file; its worker is a file of our own origin, so the CSP (`script-src 'self'; worker-src 'self'`) stays.
// Nothing is sent anywhere, and the text is kept only in memory until the keywords are found.

/** The PDF has no text layer (a scan or a photo): the person is asked to paste the text. */
export class NoTextError extends Error {}

const MAX_PAGES = 10

export async function readPdfText(file: File): Promise<string> {
  const pdfjs = await import('pdfjs-dist')
  pdfjs.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).href
  const task = pdfjs.getDocument({ data: await file.arrayBuffer() })
  const pdf = await task.promise
  try {
    const numbers = Array.from({ length: Math.min(pdf.numPages, MAX_PAGES) }, (_, index) => index + 1)
    const pages = await Promise.all(
      numbers.map(async (number) => {
        const content = await (await pdf.getPage(number)).getTextContent()
        return content.items.map((item) => ('str' in item ? item.str : '')).join(' ')
      }),
    )
    const text = pages.join('\n').trim()
    if (!text) throw new NoTextError()
    return text
  } finally {
    await task.destroy()
  }
}
