import { describe, expect, it } from 'vitest'
import type { MarketArea, NewsItem } from '../data/types'
import { isNewSince, newsOfArea, nextEvent } from './areaNews'

const piece = (id: string, date: string, change: Partial<NewsItem> = {}) =>
  ({ id, date, kind: 'kaye', title: id, summary: '', ...change }) as NewsItem

const AREAS: Record<string, MarketArea[]> = {
  a: ['health'],
  b: ['technology'],
  c: ['health', 'technology'],
  d: [],
}
const areasOf = (item: NewsItem) => AREAS[item.id] ?? []

describe('newsOfArea', () => {
  const news = [
    piece('a', '2026-11-01'),
    piece('b', '2026-11-05'),
    piece('c', '2026-11-03'),
    piece('d', '2026-11-09'),
  ]

  it('keeps what is about the area, newest first', () => {
    expect(newsOfArea(news, areasOf, 'health').map((item) => item.id)).toEqual(['c', 'a'])
    expect(newsOfArea(news, areasOf, 'technology').map((item) => item.id)).toEqual(['b', 'c'])
  })

  it('with no area, gives all of it, newest first', () => {
    expect(newsOfArea(news, areasOf, null).map((item) => item.id)).toEqual(['d', 'b', 'c', 'a'])
  })

  it('is empty for an area nothing is about, and does not change the list it was given', () => {
    expect(newsOfArea(news, areasOf, 'legal')).toEqual([])
    expect(news.map((item) => item.id)).toEqual(['a', 'b', 'c', 'd'])
  })
})

describe('isNewSince', () => {
  it('is new when it came after the day it was last seen, or when it was never seen', () => {
    expect(isNewSince(piece('a', '2026-11-10'), '2026-11-09T20:00:00.000Z')).toBe(true)
    expect(isNewSince(piece('a', '2026-11-09'), '2026-11-09T20:00:00.000Z')).toBe(false)
    expect(isNewSince(piece('a', '2026-11-01'), '2026-11-09T20:00:00.000Z')).toBe(false)
    expect(isNewSince(piece('a', '2026-11-01'), null)).toBe(true)
    expect(isNewSince(piece('a', '2026-11-01'), undefined)).toBe(true)
  })
})

const event = (id: string, starts: string, ends?: string) =>
  piece(id, '2026-11-01', {
    kind: 'eventos',
    event: { starts, ends, venue: 'Luanda', free: true } as NewsItem['event'],
  })

describe('nextEvent', () => {
  it('is the event that starts first among those still to happen or going on', () => {
    const news = [
      event('past', '2026-11-01', '2026-11-02'),
      event('later', '2026-12-10'),
      event('soon', '2026-11-26'),
      event('going', '2026-11-20', '2026-11-30'),
    ]
    expect(nextEvent(news, '2026-11-24')?.id).toBe('going')
    expect(
      nextEvent(
        news.filter((item) => item.id !== 'going'),
        '2026-11-24',
      )?.id,
    ).toBe('soon')
  })

  it('ignores what is not an event, and is null without any', () => {
    expect(nextEvent([piece('a', '2026-11-01')], '2026-11-24')).toBeNull()
    expect(nextEvent([event('past', '2026-11-01')], '2026-11-24')).toBeNull()
  })
})
