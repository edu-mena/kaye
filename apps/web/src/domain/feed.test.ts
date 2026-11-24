import { describe, expect, it } from 'vitest'
import { buildFeed, filterFeed, type FeedInputs } from './feed'

const EMPTY: FeedInputs = {
  careers: [],
  whoHires: [],
  whereToStudy: [],
  deadlines: [],
  facts: [],
  news: [],
  opportunities: [],
  kursos: [],
  hasPlan: false,
  noDegree: false,
  plus: false,
  dismissed: [],
}

const FULL: FeedInputs = {
  ...EMPTY,
  careers: [{ career: 'a' }, { career: 'b' }, { career: 'c' }],
  whoHires: [{ career: 'a', companies: ['x'] }],
  whereToStudy: [{ career: 'a', academies: ['y'] }],
  deadlines: ['d1', 'd2'],
  facts: [{ kind: 'noExperience', share: 0.3 }],
  news: [{ news: 'n1' }, { news: 'n2' }, { news: 'n3' }],
  opportunities: [{ kind: 'bolsa', count: 2 }],
  kursos: ['k1'],
  hasPlan: true,
  noDegree: true,
  plus: true,
}

const types = (inputs: FeedInputs) => buildFeed(inputs).map((item) => item.type)

describe('buildFeed', () => {
  it('is empty without anything to show', () => {
    expect(buildFeed(EMPTY)).toEqual([])
  })

  it('never repeats a card, and gives every card a stable id', () => {
    const ids = buildFeed({ ...FULL, careers: [{ career: 'a' }, { career: 'a' }] }).map((item) => item.id)
    expect(new Set(ids).size).toBe(ids.length)
    expect(ids).toContain('career:a')
    expect(buildFeed({ ...FULL }).map((item) => item.id)).toEqual(buildFeed(FULL).map((item) => item.id))
  })

  it('leaves out what the person hid', () => {
    const ids = buildFeed({ ...FULL, dismissed: ['career:a', 'news:n1', 'plus'] }).map((item) => item.id)
    expect(ids).not.toContain('career:a')
    expect(ids).not.toContain('news:n1')
    expect(ids).not.toContain('plus')
    expect(ids).toContain('career:b')
  })

  it('changes the kind of card at every step', () => {
    const kinds = types(FULL).slice(0, 10)
    kinds.slice(1).forEach((kind, index) => expect(kind).not.toBe(kinds[index]))
    expect(kinds.slice(0, 3)).toEqual(['career', 'news', 'plan'])
  })

  it('only has the cards that exist: no plan, no "no degree", no Plus unless asked', () => {
    const kinds = types({ ...FULL, hasPlan: false, noDegree: false, plus: false })
    expect(kinds).not.toContain('plan')
    expect(kinds).not.toContain('noDegree')
    expect(kinds).not.toContain('plus')
  })

  it('keeps the order of relevance inside each kind', () => {
    const careers = buildFeed(FULL).filter((item) => item.type === 'career')
    expect(careers.map((item) => item.id)).toEqual(['career:a', 'career:b', 'career:c'])
  })

  it('puts a piece of news among every few cards', () => {
    const many = Array.from({ length: 8 }, (_, index) => ({ career: `c${index}` }))
    const positions = types({ ...FULL, careers: many }).flatMap((kind, index) =>
      kind === 'news' ? [index] : [],
    )
    expect(positions).toHaveLength(3)
    expect((positions[1] ?? 0) - (positions[0] ?? 0)).toBeLessThanOrEqual(5)
  })
})

describe('filterFeed', () => {
  const feed = buildFeed(FULL)
  const kindsOf = (filter: Parameters<typeof filterFeed>[1]) =>
    new Set(filterFeed(feed, filter).map((item) => item.type))

  it('shows everything for "all"', () => {
    expect(filterFeed(feed, 'all')).toHaveLength(feed.length)
  })

  it('keeps only the kinds of each filter', () => {
    expect(kindsOf('news')).toEqual(new Set(['news']))
    expect(kindsOf('companies')).toEqual(new Set(['whoHires']))
    expect(kindsOf('deadlines')).toEqual(new Set(['deadline', 'opportunity']))
    expect(kindsOf('study').has('whereToStudy')).toBe(true)
    expect(kindsOf('careers').has('plan')).toBe(true)
  })
})
