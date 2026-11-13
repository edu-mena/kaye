import type {
  CareerGroup,
  CvColourAdvice,
  CvDestination,
  CvLengthAdvice,
  CvPhotoAdvice,
  CvStructureAdvice,
  CvTemplate,
  MarketArea,
} from '../data/types'

// Advice on the look of a CV, by where it is going. These are the team's opinions, shown as
// advice: never facts or statistics, and never applied without the person accepting them.
// A new area must get a line here (TypeScript forces it); a group or a career only needs one
// when it differs from its area. The words live in the locales: cv.structure_*, cv.focus_*…

export type CvAdvice = {
  template: CvTemplate
  structure: CvStructureAdvice
  colour: CvColourAdvice
  photo: CvPhotoAdvice
  length: CvLengthAdvice
}

const SOBER: CvAdvice = {
  template: 'classico',
  structure: 'oneColumn',
  colour: 'discreet',
  photo: 'optional',
  length: 'oneOrTwo',
}

const PRACTICAL: CvAdvice = { ...SOBER, template: 'colunas', structure: 'twoColumns' }

const AREA_ADVICE: Record<MarketArea, CvAdvice> = {
  technology: { ...SOBER, template: 'minimalista', colour: 'mono', photo: 'no' },
  engineering: PRACTICAL,
  oil_mining: PRACTICAL,
  health: SOBER,
  education: SOBER,
  business: SOBER,
  legal: { ...SOBER, colour: 'mono' },
  public: { ...SOBER, template: 'europeu', structure: 'labels' },
  communication: { ...SOBER, template: 'criativo', colour: 'strong' },
  agriculture: PRACTICAL,
  hospitality: { ...SOBER, template: 'retrato', structure: 'twoColumns', photo: 'yes' },
  logistics: PRACTICAL,
  sciences: { ...SOBER, colour: 'mono', length: 'long' },
}

const WITH_PHOTO: Partial<CvAdvice> = { template: 'retrato', structure: 'twoColumns', photo: 'yes' }
const VISUAL: Partial<CvAdvice> = { template: 'criativo', colour: 'strong', photo: 'optional' }

const GROUP_ADVICE: Partial<Record<CareerGroup, Partial<CvAdvice>>> = {
  design: VISUAL,
  artes: VISUAL,
  banca_seguros: WITH_PHOTO,
  mecanica_offshore: { colour: 'strong' },
}

/** The careers that differ from their group. */
const CAREER_ADVICE: Record<string, Partial<CvAdvice>> = {
  'engenheiro-devops': { template: 'minimalista', colour: 'mono', photo: 'no' },
  'tecnico-de-manutencao-mecanica': { template: 'colunas', structure: 'twoColumns', colour: 'strong' },
  'assistente-administrativo': WITH_PHOTO,
  'secretario-executivo': WITH_PHOTO,
}

const DESTINATION_ADVICE: Partial<Record<CvDestination, Partial<CvAdvice>>> = {
  government: { template: 'europeu', structure: 'labels', colour: 'discreet', photo: 'optional' },
  internship: { length: 'one' },
}

/** From the general to the particular: area, group, career, then where it is going. */
export function cvAdvice(
  area: MarketArea,
  career: { slug: string; group: CareerGroup } | null,
  destination: CvDestination | null,
): CvAdvice {
  return {
    ...AREA_ADVICE[area],
    ...(career ? GROUP_ADVICE[career.group] : {}),
    ...(career ? CAREER_ADVICE[career.slug] : {}),
    ...(destination ? DESTINATION_ADVICE[destination] : {}),
  }
}
