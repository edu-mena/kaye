/** The whole address of a page of the app, for a shared link. */
export const appUrl = (path: string) => `${window.location.origin}${path}`

/** The link that opens WhatsApp with the text ready to send (the way in when the phone has no share sheet). */
export const whatsAppUrl = (text: string, url: string) =>
  `https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}`

/** The phone's share sheet when there is one; otherwise WhatsApp, the channel most people use. */
export async function shareLink(text: string, url: string): Promise<void> {
  if (typeof navigator.share === 'function') {
    try {
      await navigator.share({ text, url })
      return
    } catch (error) {
      // Closed on purpose: nothing else to do. Any other failure falls back to WhatsApp.
      if (error instanceof DOMException && error.name === 'AbortError') return
    }
  }
  window.open(whatsAppUrl(text, url), '_blank', 'noopener')
}
