import dataLarge from '../../assets/careers/analista-de-dados-1600.webp'
import dataSmall from '../../assets/careers/analista-de-dados-800.webp'
import frontendLarge from '../../assets/careers/desenvolvedor-frontend-1600.webp'
import frontendSmall from '../../assets/careers/desenvolvedor-frontend-800.webp'
import designLarge from '../../assets/careers/designer-ui-ux-1600.webp'
import designSmall from '../../assets/careers/designer-ui-ux-800.webp'
import type { CareerImage } from '../types'

// Photos from Wikimedia Commons, CC BY-SA 4.0. Cropped to 16:10 and resized;
// the page credits each author with a link to the original.
export const CAREER_IMAGES: Partial<Record<string, CareerImage>> = {
  'desenvolvedor-frontend': {
    small: frontendSmall,
    large: frontendLarge,
    alt: 'Programador a sorrir, ao portátil, num escritório de tecnologia',
    credit: {
      author: 'Daudi Mukiibi',
      license: 'CC BY-SA 4.0',
      url: 'https://commons.wikimedia.org/wiki/File:Software_Developer_at_work_03.jpg',
    },
  },
  'analista-de-dados': {
    small: dataSmall,
    large: dataLarge,
    alt: 'Analista com auscultadores a trabalhar no portátil, ao lado de dois monitores',
    credit: {
      author: 'Daudi Mukiibi',
      license: 'CC BY-SA 4.0',
      url: 'https://commons.wikimedia.org/wiki/File:Software_developer_at_work_02.jpg',
    },
  },
  'designer-ui-ux': {
    small: designSmall,
    large: designLarge,
    alt: 'Designer a sorrir enquanto trabalha no portátil',
    credit: {
      author: 'Ngwedi Mokgoro',
      license: 'CC BY-SA 4.0',
      url: 'https://commons.wikimedia.org/wiki/File:Graphic_designer_5.jpg',
    },
  },
}
