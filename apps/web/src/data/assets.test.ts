import { describe, expect, it } from 'vitest'
import { withBuiltAssets } from './assets'

const urls = new Map([
  ['/src/assets/careers/actor-400.webp', '/spa/assets/actor-400-AbC123.webp'],
  ['/src/assets/academies/isptec-logo.webp', '/spa/assets/isptec-logo-9f8e7d.webp'],
])

describe('withBuiltAssets', () => {
  it('points the content paths of the photos and logos to the files of this build, at any depth', () => {
    const career = {
      slug: 'actor',
      image: {
        thumb: '/src/assets/careers/actor-400.webp',
        alt: 'Actor',
        credit: { url: 'https://commons.wikimedia.org' },
      },
      offers: [{ academy: { logo: '/src/assets/academies/isptec-logo.webp' } }],
      salaryMedian: null,
      detailed: true,
      skills: ['Voz e corpo'],
    }

    expect(withBuiltAssets(career, urls)).toEqual({
      slug: 'actor',
      image: {
        thumb: '/spa/assets/actor-400-AbC123.webp',
        alt: 'Actor',
        credit: { url: 'https://commons.wikimedia.org' },
      },
      offers: [{ academy: { logo: '/spa/assets/isptec-logo-9f8e7d.webp' } }],
      salaryMedian: null,
      detailed: true,
      skills: ['Voz e corpo'],
    })
  })

  it('leaves a full URL, a data: logo and an unknown file as they are', () => {
    const data = [
      'https://kaye.ao/fotos/a.webp',
      'data:image/svg+xml,%3Csvg%3E',
      '/src/assets/careers/nao-existe.webp',
    ]

    expect(withBuiltAssets(data, urls)).toEqual(data)
  })

  it('puts the photos of public/ under the base of the build, and leaves the app’s pages alone', () => {
    const news = { image: { src: '/eventos/batuque-fest.webp' }, to: '/plano' }

    expect(withBuiltAssets(news, urls, '/spa/')).toEqual({
      image: { src: '/spa/eventos/batuque-fest.webp' },
      to: '/plano',
    })
    expect(withBuiltAssets(news, urls, '/')).toEqual(news)
  })

  it('knows the files of the build by default', () => {
    // Under Vitest a file's URL is its own path: it is found, and comes back unchanged.
    expect(withBuiltAssets('/src/assets/careers/actor-400.webp')).toBe('/src/assets/careers/actor-400.webp')
  })
})
