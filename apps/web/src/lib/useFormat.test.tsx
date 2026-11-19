import { renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { changeLocale } from './i18n'
import { useDuration, useRatingLabel } from './useFormat'

describe('useDuration', () => {
  it('writes months, years and ranges the way people say them', () => {
    const { result } = renderHook(() => useDuration())
    const duration = result.current
    expect(duration({ min: 1, max: 1 })).toBe('1 mês')
    expect(duration({ min: 5, max: 5 })).toBe('5 meses')
    expect(duration({ min: 12, max: 12 })).toBe('1 ano')
    expect(duration({ min: 48, max: 60 })).toBe('4 a 5 anos')
    expect(duration({ min: 54, max: 72 })).toBe('4,5 a 6 anos')
    expect(duration({ min: 3, max: 6 })).toBe('3 a 6 meses')
    expect(duration({ min: 6, max: 24 })).toBe('6 meses a 2 anos')
    expect(duration({ min: 60, max: null })).toBe('5 anos ou mais')
    // From 2 years on, half-year precision: no "61 meses".
    expect(duration({ min: 61, max: 72 })).toBe('5 a 6 anos')
    expect(duration({ min: 26, max: 26 })).toBe('2 anos')
    expect(duration({ min: 13, max: 13 })).toBe('13 meses')
  })

  it('follows the language, decimal separator included', async () => {
    await changeLocale('en')
    const { result } = renderHook(() => useDuration())
    expect(result.current({ min: 54, max: 72 })).toBe('4.5 to 6 years')
  })
})

describe('useRatingLabel', () => {
  it('shows a rating only with enough reviews', () => {
    const { result } = renderHook(() => useRatingLabel())
    expect(result.current({ average: 4.6, count: 12 })).toBe('4,6 de 5 · 12 avaliações')
    expect(result.current({ average: 5, count: 2 })).toBe('Ainda com poucas avaliações')
    expect(result.current(null)).toBe('Ainda com poucas avaliações')
  })
})
