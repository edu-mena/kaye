/**
 * The winding path from the Kayé logo, as an illustration: the line a person
 * walks from where they are to the career they want. Decorative only.
 */
export function PathMark({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 240 120" aria-hidden="true" className={className} fill="none">
      <path
        d="M8 104c34 0 40-26 72-26s34 24 66 24 30-44 58-56 26-26 28-34"
        className="stroke-white/25"
        strokeWidth="10"
        strokeLinecap="round"
      />
      <path
        d="M8 104c34 0 40-26 72-26s34 24 66 24 30-44 58-56 26-26 28-34"
        className="stroke-gold"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray="2 9"
      />
      <circle cx="8" cy="104" r="7" className="fill-white" />
      <circle cx="80" cy="78" r="5" className="fill-gold" />
      <circle cx="146" cy="102" r="5" className="fill-gold" />
      <path d="m224 4 10 4-6 9-8-3z" className="fill-gold" />
    </svg>
  )
}
