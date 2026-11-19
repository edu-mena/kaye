import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Card } from '../../components/ui/Card'
import { readableColor } from '../../domain/cvStyle'

const ACCENTS = ['#1a1a1a', '#1c2433', '#1f4e8c', '#0f766e', '#9f1239', '#6d28d9']

export function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Card as="section" aria-label={title} className="space-y-4 p-6">
      <h3 className="text-base font-semibold text-night">{title}</h3>
      {children}
    </Card>
  )
}

type RangeProps = {
  label: string
  value: number
  unit: string
  limits: { min: number; max: number; step: number }
  onChange: (value: number) => void
}

export function Range({ label, value, unit, limits, onChange }: RangeProps) {
  return (
    <label className="block">
      <span className="mb-1 flex justify-between gap-3 text-sm font-light text-night">
        {label}
        <span className="text-copy tabular-nums">
          {Number(value.toFixed(2))} {unit}
        </span>
      </span>
      <input
        type="range"
        min={limits.min}
        max={limits.max}
        step={limits.step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-6 w-full cursor-pointer accent-blue"
      />
    </label>
  )
}

type ColorProps = { label: string; value: string; onChange: (value: string) => void }

export function Color({ label, value, onChange }: ColorProps) {
  return (
    <label className="flex items-center justify-between gap-3 text-sm font-light text-night">
      {label}
      <input
        type="color"
        value={value}
        onChange={(event) => onChange(readableColor(event.target.value))}
        className="h-9 w-14 cursor-pointer rounded-lg border border-line bg-surface p-1"
      />
    </label>
  )
}

/** Ready-made highlight colours, quicker than the colour picker on a phone. */
export function AccentSwatches({ value, onChange }: { value: string; onChange: (accent: string) => void }) {
  const { t } = useTranslation()
  return (
    <div className="flex flex-wrap gap-2">
      {ACCENTS.map((accent) => (
        <button
          key={accent}
          type="button"
          aria-label={`${t('cv.style_accent')} ${accent}`}
          aria-pressed={value === accent}
          onClick={() => onChange(accent)}
          className="size-9 rounded-full border-2 border-white outline-2 outline-transparent aria-pressed:outline-night"
          style={{ backgroundColor: accent }}
        />
      ))}
    </div>
  )
}
