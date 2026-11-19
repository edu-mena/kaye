import { describe, expect, it } from 'vitest'
import { EVENTS } from '../../data/demo/events'
import { NEWS } from '../../data/demo/news'
import { isPoster, newsHref } from './links'

describe('news links', () => {
  it('serves the organisers’ posters from the app’s own base, as the other public files', () => {
    const posters = EVENTS.filter((item) => item.image)
    expect(posters.length).toBeGreaterThan(0)
    for (const item of posters) {
      // "/eventos/…" in development and in these tests; "/spa/eventos/…" in the Laravel build.
      expect(item.image?.thumb.startsWith(`${import.meta.env.BASE_URL}eventos/`)).toBe(true)
      expect(isPoster(item)).toBe(true)
    }
  })

  it('shows any other photo cropped, and opens each piece on its own page', () => {
    const photo = NEWS.find((item) => item.image && !item.event)
    expect(photo && isPoster(photo)).toBe(false)
    expect(newsHref(NEWS[0]!)).toBe(`/novidades/${NEWS[0]?.id}`)
  })
})
