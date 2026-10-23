type BarItem = {
  label: string
  /** 0 to 1. */
  value: number
  /** Text shown next to the bar; always visible, so the bar is never colour-only. */
  valueLabel: string
  emphasized?: boolean
}

type BarListProps = { items: BarItem[]; label: string }

/**
 * Horizontal bars for magnitudes (docs/design.md, "Gráficos"): one hue, emphasis
 * in navy and context in grey, value written beside every bar.
 */
export function BarList({ items, label }: BarListProps) {
  return (
    <ul aria-label={label} className="space-y-3">
      {items.map((item) => (
        <li key={item.label} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1">
          <span className={`text-sm ${item.emphasized ? 'font-semibold text-navy' : 'text-muted'}`}>
            {item.label}
          </span>
          <span className="text-sm font-semibold text-navy tabular-nums">{item.valueLabel}</span>
          <span aria-hidden="true" className="col-span-2 h-2 overflow-hidden rounded-full bg-navy-100">
            <span
              className={`block h-full rounded-full ${item.emphasized ? 'bg-navy' : 'bg-track'}`}
              style={{ width: `${Math.round(Math.min(1, Math.max(0, item.value)) * 100)}%` }}
            />
          </span>
        </li>
      ))}
    </ul>
  )
}
