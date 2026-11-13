import type { Academy, PublishedFee, SourceLink } from '../types'

// Monthly fees published for 2025/26 (docs/recolha-de-dados.md, collected 05/11/2026). No institution of these
// publishes its own price list online; the press read them. The 2026/27 fees may rise up to 10,88% (Decreto
// Executivo 136/26), and no source gives them yet: replace these when one does.
const RANKING: SourceLink = {
  label: 'Expansão, 6/9/2025',
  url: 'https://expansao.co.ao/universidade/detalhe/medicina-na-upra-tem-a-propina-mais-elevada-nas-faculdades-do-pais-67178.html',
}
const RISES: SourceLink = {
  label: 'Expansão, 19/7/2025',
  url: 'https://expansao.co.ao/universidade/detalhe/aumento-da-propina-e-do-taxi-agrava-custo-com-a-formacao-superior-66448.html',
}
const YEAR = '2025/26'

type InstitutionFees = {
  /** The institution's average across its licenciaturas. */
  average?: number
  /** A course's own fee, by its id. */
  courses?: Record<string, { monthly: number; source: SourceLink }>
}

/** By academy id. */
const FEES: Record<string, InstitutionFees> = {
  uma: {
    average: 78_000,
    courses: {
      'analises-clinicas-e-saude-publica': { monthly: 91_037, source: RANKING },
      'arquitectura-e-urbanismo': { monthly: 91_037, source: RANKING },
    },
  },
  'universidades-jean-piaget': {
    average: 64_000,
    courses: {
      medicina: { monthly: 90_000, source: RANKING },
      enfermagem: { monthly: 56_500, source: RISES },
    },
  },
  ula: { average: 62_000 },
  utanga: { average: 54_000 },
  ucan: { average: 49_000 },
  isptec: { average: 47_000 },
  'universidade-independente-de-angola': { average: 43_000 },
  'instituto-superior-politecnico-internacional-de-angola': { average: 41_000 },
}

/** Each licenciatura gets its own published fee, or else its institution's average. */
export function withFees(academies: Academy[]): Academy[] {
  return academies.map((academy) => {
    const known = FEES[academy.id]
    if (!known) return academy
    return {
      ...academy,
      offers: academy.offers.map((offer) => {
        if (offer.level !== 'licenciatura') return offer
        const own = known.courses?.[offer.course.id]
        const fee: PublishedFee | null = own
          ? { ...own, basis: 'course', year: YEAR }
          : known.average
            ? { monthly: known.average, basis: 'average', year: YEAR, source: RANKING }
            : null
        return fee ? { ...offer, fee } : offer
      }),
    }
  })
}
