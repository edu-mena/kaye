/** A page number, or a gap where numbers are skipped (named after the page that follows it). */
type PageItem = { page: number; gap: boolean }

/**
 * The page numbers to show: all of them up to 7; past that the first, the last and the ones
 * around the current page, with a gap where numbers are skipped.
 */
export function pageItems(page: number, pages: number): PageItem[] {
  const shown =
    pages <= 7
      ? Array.from({ length: pages }, (_, index) => index + 1)
      : [...new Set([1, page - 1, page, page + 1, pages])]
          .filter((number) => number >= 1 && number <= pages)
          .toSorted((a, b) => a - b)
  return shown.flatMap((number, index) => {
    const previous = shown[index - 1]
    const item = { page: number, gap: false }
    return previous !== undefined && number - previous > 1 ? [{ page: number, gap: true }, item] : [item]
  })
}
