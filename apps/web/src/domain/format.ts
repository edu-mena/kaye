/** "350.000 Kz": the way prices are written in Angola, the same on every device. */
export function formatKz(amount: number): string {
  return `${Math.round(amount)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.')} Kz`
}

/** 0.62 → "62%" */
export function formatPercent(share: number): string {
  return `${Math.round(share * 100)}%`
}
