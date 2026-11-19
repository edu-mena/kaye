import type { Academy } from '../types'

// The photos and logos of the institutions, by their id: assets/academies/<id>-logo.webp and <id>-banner-800.webp.
// Where each came from: scrapers/catalog/academy_images.csv. They need the institution's permission before the app
// goes public (docs/recolha-de-dados.md).
const FILES = import.meta.glob<string>('../../assets/academies/*.webp', { eager: true, import: 'default' })

export function withImages(academies: Academy[]): Academy[] {
  return academies.map((academy) => {
    const logo = FILES[`../../assets/academies/${academy.id}-logo.webp`]
    const banner = FILES[`../../assets/academies/${academy.id}-banner-800.webp`]
    return { ...academy, ...(logo ? { logo } : {}), ...(banner ? { banner } : {}) }
  })
}
