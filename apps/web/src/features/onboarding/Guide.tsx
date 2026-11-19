const SIZES = { sm: 'size-16', md: 'size-20', lg: 'size-36' }

type GuideProps = {
  size?: keyof typeof SIZES
  speaking?: boolean
  /** Change it to make the guide hop: it reacts to each answer. */
  hop?: string
}

/**
 * The Kayé guide: the hexagon of Holland's model with two eyes and a yellow smile.
 * Flat and decorative: everything it says is written on the screen.
 */
export function Guide({ size = 'md', speaking = false, hop = '' }: GuideProps) {
  return (
    <span key={hop} aria-hidden="true" className={`inline-block shrink-0 animate-hop ${SIZES[size]}`}>
      <svg viewBox="0 0 100 100" className="size-full animate-float">
        <polygon
          points="50,8 86,29 86,71 50,92 14,71 14,29"
          className="fill-night stroke-night"
          strokeWidth="12"
          strokeLinejoin="round"
        />
        <g className="origin-center animate-blink [transform-box:fill-box]">
          <circle cx="36" cy="44" r="8" className="fill-white" />
          <circle cx="64" cy="44" r="8" className="fill-white" />
        </g>
        <path
          d="M32 62Q50 76 68 62"
          fill="none"
          strokeWidth="5"
          strokeLinecap="round"
          className={`origin-center stroke-gold [transform-box:fill-box] ${speaking ? 'animate-talk' : ''}`}
        />
      </svg>
    </span>
  )
}
