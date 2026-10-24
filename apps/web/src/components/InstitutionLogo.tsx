import type { Institution } from '../data/types'

// Small words do not make initials: "Centro de Formação" → "CF".
const SKIP = new Set(['de', 'da', 'do', 'das', 'dos', 'e'])

/** "Academia Digital Exemplo" → "AD" */
function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter((word) => word && !SKIP.has(word.toLowerCase()))
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? '')
    .join('')
}

/** The institution's logo in a circle; without one, its initials. Decorative: the name is always next to it. */
export function InstitutionLogo({ institution }: { institution: Institution }) {
  return (
    <span
      aria-hidden="true"
      className="grid size-12 shrink-0 place-items-center overflow-hidden rounded-full bg-white font-display text-base font-bold text-night"
    >
      {institution.logo ? (
        <img src={institution.logo} alt="" className="size-full object-contain p-1.5" />
      ) : (
        initials(institution.name)
      )}
    </span>
  )
}
