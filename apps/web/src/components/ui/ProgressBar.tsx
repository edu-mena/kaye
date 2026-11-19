type ProgressBarProps = {
  /** 0 to 1. */
  value: number
  label: string
  tone?: 'blue' | 'gold' | 'white' | 'success'
  /** Track colour; on dark cards use "bg-white/15" with tone="white" or "gold". */
  track?: string
  className?: string
}

const FILL = {
  blue: '[&::-webkit-progress-value]:bg-blue [&::-moz-progress-bar]:bg-blue',
  gold: '[&::-webkit-progress-value]:bg-gold [&::-moz-progress-bar]:bg-gold',
  white: '[&::-webkit-progress-value]:bg-white [&::-moz-progress-bar]:bg-white',
  success: '[&::-webkit-progress-value]:bg-success [&::-moz-progress-bar]:bg-success',
}

/** Native <progress>: screen readers announce it without extra ARIA. */
export function ProgressBar({
  value,
  label,
  tone = 'blue',
  track = 'bg-ash-100',
  className = '',
}: ProgressBarProps) {
  const percent = Math.round(Math.min(1, Math.max(0, value)) * 100)

  return (
    <progress
      value={percent}
      max={100}
      aria-label={label}
      className={`block h-2 w-full appearance-none overflow-hidden rounded-full border-0 [&::-moz-progress-bar]:rounded-full [&::-webkit-progress-bar]:bg-transparent [&::-webkit-progress-value]:rounded-full ${FILL[tone]} ${track} ${className}`}
    />
  )
}
