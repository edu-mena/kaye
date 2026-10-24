import { useTranslation } from 'react-i18next'
import type { MonthRange, Program } from '../data/types'
import { MIN_REVIEWS } from '../domain/ranking'

/** Years to the nearest half: durations are estimates, "61 meses" is false precision. */
const halfYears = (months: number) => Math.round(months / 6) / 2

/**
 * Durations in the current language, in the unit people use: "6 meses",
 * "1 ano", "4,5 anos", "3 a 6 meses", "5 a 6 anos", "6 meses a 2 anos".
 * From 2 years on, always in years.
 */
export function useDuration() {
  const { t, i18n } = useTranslation()
  const number = new Intl.NumberFormat(i18n.language, { maximumFractionDigits: 1 })

  const unit = (months: number) => {
    if (months >= 24 || (months >= 12 && months % 12 === 0)) {
      const years = halfYears(months)
      return t('duration.years', { count: years, value: number.format(years) })
    }
    return t('duration.months', { count: months })
  }

  return (range: MonthRange) => {
    if (range.max === null) return t('duration.orMore', { value: unit(range.min) })
    if (unit(range.min) === unit(range.max)) return unit(range.min)
    if (range.min >= 12) {
      return t('duration.yearsRange', {
        min: number.format(halfYears(range.min)),
        max: number.format(halfYears(range.max)),
      })
    }
    if (range.max < 12) return t('duration.monthsRange', { min: range.min, max: range.max })
    return t('duration.range', { min: unit(range.min), max: unit(range.max) })
  }
}

/** "4,6 de 5 · 12 avaliações", or a note when there are too few reviews to count. */
export function useRatingLabel() {
  const { t, i18n } = useTranslation()
  const number = new Intl.NumberFormat(i18n.language, { minimumFractionDigits: 1, maximumFractionDigits: 1 })

  return (rating: Program['rating']) =>
    rating && rating.count >= MIN_REVIEWS
      ? t('training.ratingValue', { average: number.format(rating.average), count: rating.count })
      : t('training.ratingFew')
}

/** The rating in two short parts for tight spaces: "4,6 de 5" over "12 avaliações", or a dash. */
export function useRatingParts() {
  const { t, i18n } = useTranslation()
  const number = new Intl.NumberFormat(i18n.language, { minimumFractionDigits: 1, maximumFractionDigits: 1 })

  return (rating: Program['rating']) =>
    rating && rating.count >= MIN_REVIEWS
      ? {
          value: t('training.ratingShort', { average: number.format(rating.average) }),
          note: t('training.reviews', { count: rating.count }),
        }
      : { value: '—', note: t('training.ratingFewShort') }
}
