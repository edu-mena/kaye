import { useMemo } from 'react'
import { useNews } from '../../data/queries'
import type { MarketArea, NewsItem } from '../../data/types'
import { newsOfArea, nextEvent } from '../../domain/areaNews'
import { todayIso } from '../../domain/scholarships'
import { useInterestAreas } from '../../lib/useInterestAreas'
import { useNewsForMe } from '../../lib/useNewsForMe'

/** How many pieces the highlight shows: one in focus and three in rows. */
export const HIGHLIGHT_SIZE = 4
const MAX_AREAS = 3

/**
 * The news of the person's areas (they chose them, saved careers in them or aim at one), newest first. Without
 * areas: the newest news of all, unfiltered. `shownIds` are the pieces the highlight can show, which the feed
 * below does not repeat.
 */
export function useAreaNews() {
  const { data: news = [] } = useNews()
  const { areasOf } = useNewsForMe()
  const areas = useInterestAreas().slice(0, MAX_AREAS)
  return useMemo(() => {
    const of = (area: MarketArea | null): NewsItem[] => newsOfArea(news, areasOf, area)
    const slots = areas.length > 0 ? areas : [null]
    // The pieces the highlight can show: four of each area and its next event, which has a row of its own.
    const shownIds = new Set(
      slots.flatMap((area) => {
        const pieces = of(area)
        const event = nextEvent(pieces, todayIso())
        return [...pieces.slice(0, HIGHLIGHT_SIZE), ...(event ? [event] : [])].map((item) => item.id)
      }),
    )
    return { areas, of, shownIds, news }
  }, [news, areasOf, areas])
}
