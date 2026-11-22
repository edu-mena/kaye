/** The text, or nothing when it is empty or only a dash: a page never shows a bare "—" (it says it is being built). */
export const filled = (value: string | undefined): string | undefined => {
  const text = value?.trim()
  return text && text !== '—' ? text : undefined
}
