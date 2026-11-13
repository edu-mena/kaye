import type { NewsItem } from '../../data/types'

/** Where a piece of news opens on its own. */
export const newsHref = (item: NewsItem) => `/novidades/${item.id}`

/** An organiser's poster carries the information: shown whole, never cropped. */
export const isPoster = (item: NewsItem) => Boolean(item.event && item.image?.thumb.startsWith('/eventos/'))
