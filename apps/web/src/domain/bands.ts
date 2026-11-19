/**
 * A range for a filter ("até 300 mil", "6 meses a 2 anos"): above `above` and up to `upTo`
 * (inclusive). The key is what goes in the URL and in the label's translation key.
 */
export type Band<K extends string = string> = { key: K; above?: number; upTo?: number }

/** True when the value is in the band; no band means no filter, an unknown value never matches. */
export function inBand(value: number | null, band: Band | undefined): boolean {
  if (!band) return true
  if (value === null) return false
  return (band.above === undefined || value > band.above) && (band.upTo === undefined || value <= band.upTo)
}

export function findBand<K extends string>(
  bands: readonly Band<K>[],
  key: string | null,
): Band<K> | undefined {
  return bands.find((band) => band.key === key)
}

/** Median monthly salary, in Kz. */
export const SALARY_BANDS = [
  { key: 'ate300', upTo: 300_000 },
  { key: 'de300a500', above: 300_000, upTo: 500_000 },
  { key: 'mais500', above: 500_000 },
] as const satisfies Band[]

/** Whole course, in Kz. */
export const COST_BANDS = [
  { key: 'ate200', upTo: 200_000 },
  { key: 'de200a1000', above: 200_000, upTo: 1_000_000 },
  { key: 'mais1000', above: 1_000_000 },
] as const satisfies Band[]

/** Course length, in months. */
export const DURATION_BANDS = [
  { key: 'curta', upTo: 6 },
  { key: 'media', above: 6, upTo: 24 },
  { key: 'longa', above: 24 },
] as const satisfies Band[]
