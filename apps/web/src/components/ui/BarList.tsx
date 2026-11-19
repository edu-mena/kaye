type BarItem = {
  label: string
  /** 0 to 1. */
  value: number
  /** Text shown next to the bar; always visible, so the bar is never colour-only. */
  valueLabel: string
  emphasized?: boolean
}

type BarListProps = {
  items: BarItem[]
  label: string
  /** The labels of the emphasised items in the main blue (the bars keep their colour). */
  accentLabels?: boolean
  /** Two side by side from sm, read row by row: long lists in a wide block. */
  columns?: 1 | 2
}

/**
 * Horizontal bars for magnitudes (docs/design.md, "Gráficos"): one hue, emphasis
 * in near-black and context in warm grey, value written beside every bar.
 */
export function BarList({ items, label, accentLabels = false, columns = 1 }: BarListProps) {
  const strong = accentLabels ? 'font-normal text-blue' : 'font-normal text-night'
  return (
    <ul aria-label={label} className={columns === 2 ? 'grid gap-x-6 gap-y-3 sm:grid-cols-2' : 'space-y-3'}>
      {items.map((item) => (
        <li key={item.label} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1">
          <span className={`text-sm ${item.emphasized ? strong : 'font-light text-muted'}`}>
            {item.label}
          </span>
          <span className="text-sm font-normal text-night tabular-nums">{item.valueLabel}</span>
          <span aria-hidden="true" className="col-span-2 h-2 overflow-hidden rounded-full bg-ash-100">
            <span
              className={`block h-full rounded-full ${item.emphasized ? 'bg-night' : 'bg-track'}`}
              style={{ width: `${Math.round(Math.min(1, Math.max(0, item.value)) * 100)}%` }}
            />
          </span>
        </li>
      ))}
    </ul>
  )
}
