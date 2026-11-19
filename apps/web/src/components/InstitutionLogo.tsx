import type { Institution } from '../data/types'

// Small words do not make initials: "Centro de Formação" → "CF". Nor do dashes: "MINEA - RECLIMA" → "MR".
const SKIP = new Set(['de', 'da', 'do', 'das', 'dos', 'e'])

/** "Academia Digital Exemplo" → "AD" */
function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter((word) => /^\p{L}/u.test(word) && !SKIP.has(word.toLowerCase()))
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? '')
    .join('')
}

/** The institution's logo in a circle; without one, its initials. Decorative: the name is always next to it. */
const SIZES = { sm: 'size-8 text-xs ring-1 ring-line', md: 'size-12 text-base' }

export function InstitutionLogo({
  institution,
  size = 'md',
}: {
  /** `logoOnDark`: a white logo, shown on black. */
  institution: Pick<Institution, 'name' | 'logo'> & { logoOnDark?: boolean }
  size?: 'sm' | 'md'
}) {
  return (
    <span
      aria-hidden="true"
      className={`grid shrink-0 place-items-center overflow-hidden rounded-full font-display font-bold text-night ${institution.logoOnDark ? 'bg-coal' : 'bg-white'} ${SIZES[size]}`}
    >
      {institution.logo ? (
        <img src={institution.logo} alt="" className="size-full object-contain p-1.5" />
      ) : (
        initials(institution.name)
      )}
    </span>
  )
}
