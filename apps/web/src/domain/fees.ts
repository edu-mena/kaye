import type { AcademyOffer, CatalogCourse, PublishedFee } from '../data/types'

type OfferedAcademy = CatalogCourse['offers'][number]['academy']

/**
 * A monthly fee in Kz: the published one when a source gives it, otherwise estimated from the kind of institution
 * and the level (docs: data to collect later). Public ones charge no fee.
 */
export type FeeEstimate = { min: number; max: number; estimated: boolean; published?: PublishedFee }

export type FeeBand = 'free' | 'upTo50' | 'over50'

export const FEE_BANDS: FeeBand[] = ['free', 'upTo50', 'over50']

const POSTGRADUATE = new Set<AcademyOffer['level']>(['mestrado', 'especialidade'])

/** The offer's published fee, or else the estimate; null: we do not know whether the institution is public. */
export function offerFee(academy: OfferedAcademy, offer: AcademyOffer): FeeEstimate | null {
  if (offer.fee)
    return { min: offer.fee.monthly, max: offer.fee.monthly, estimated: false, published: offer.fee }
  return estimateFee(academy, offer.level)
}

/** null: we do not know whether the institution is public or private. */
function estimateFee(academy: OfferedAcademy, level: AcademyOffer['level']): FeeEstimate | null {
  if (academy.ownership === null) return null
  if (academy.ownership === 'publica') return { min: 0, max: 0, estimated: true }
  if (POSTGRADUATE.has(level)) return { min: 70_000, max: 150_000, estimated: true }
  switch (academy.type) {
    case 'universidade':
    case 'instituto_superior':
      return { min: 40_000, max: 80_000, estimated: true }
    case 'instituto_medio':
      return { min: 15_000, max: 35_000, estimated: true }
    case 'centro_formacao':
      return { min: 20_000, max: 60_000, estimated: true }
    case 'online':
      return { min: 15_000, max: 45_000, estimated: true }
  }
}

/** The band a fee falls in, by its middle. */
export function feeBand(fee: FeeEstimate): FeeBand {
  if (fee.max === 0) return 'free'
  return (fee.min + fee.max) / 2 <= 50_000 ? 'upTo50' : 'over50'
}

/**
 * How long each level usually takes, in months of fees (10 a school year). Estimated until the institutions
 * publish their lengths (docs: data to collect later).
 */
const TYPICAL_MONTHS: Record<AcademyOffer['level'], number> = {
  formacao_profissional: 9,
  certificacao: 3,
  medio_tecnico: 40,
  licenciatura: 40,
  mestrado: 20,
  especialidade: 30,
}

/** What the whole study costs across the offers: paid ones as a range, and whether a public one is free. */
export type StudyCost = {
  min: number
  max: number
  months: { min: number; max: number }
  free: boolean
  /** Some fee in it is estimated. */
  estimated: boolean
}

/** null: no offer has a known fee. min and max cover the paid offers only; both are 0 when all are free. */
export function studyCost(offers: CatalogCourse['offers']): StudyCost | null {
  const known = offers.flatMap(({ academy, offer }) => {
    const fee = offerFee(academy, offer)
    return fee ? [{ fee, months: TYPICAL_MONTHS[offer.level] }] : []
  })
  if (known.length === 0) return null
  const paid = known.filter(({ fee }) => fee.max > 0)
  const months = known.map((item) => item.months)
  return {
    min: paid.length ? Math.min(...paid.map((item) => item.fee.min * item.months)) : 0,
    max: paid.length ? Math.max(...paid.map((item) => item.fee.max * item.months)) : 0,
    months: { min: Math.min(...months), max: Math.max(...months) },
    free: paid.length < known.length,
    estimated: known.some(({ fee }) => fee.estimated),
  }
}

/** Months of salary that pay back the dearest study; null without a salary or with nothing to pay back. */
export function paybackMonths(cost: StudyCost, salaryMedian: number | null): number | null {
  if (!salaryMedian || cost.max === 0) return null
  return Math.max(1, Math.round(cost.max / salaryMedian))
}
