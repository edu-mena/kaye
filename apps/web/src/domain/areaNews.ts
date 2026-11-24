import type { MarketArea, NewsItem } from '../data/types'

// The news of the person's area on the home: the newest first, and which of them are new to the person.

const newestFirst = (a: NewsItem, b: NewsItem) => b.date.localeCompare(a.date)

/** The news about an area (from the careers each piece is about), newest first; with no area, all of it. */
export function newsOfArea(
  news: readonly NewsItem[],
  areasOf: (item: NewsItem) => readonly MarketArea[],
  area: MarketArea | null,
): NewsItem[] {
  return news.filter((item) => area === null || areasOf(item).includes(area)).toSorted(newestFirst)
}

/** "Novo": dated after the day the person last saw the news on the home (never seen: everything is new). */
export function isNewSince(item: NewsItem, seenAt: string | null | undefined): boolean {
  return !seenAt || item.date > seenAt.slice(0, 10)
}

/** The next event of the area still to happen (or going on): the one that starts first. */
export function nextEvent(news: readonly NewsItem[], today: string): NewsItem | null {
  return (
    news
      .filter(
        (item) => item.kind === 'eventos' && item.event && (item.event.ends ?? item.event.starts) >= today,
      )
      .toSorted((a, b) => (a.event?.starts ?? '').localeCompare(b.event?.starts ?? ''))[0] ?? null
  )
}
