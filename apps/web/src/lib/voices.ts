// The guide's voices (docs/decisoes/0013). The audio is generated beforehand, so scripts/voice reads
// this list too: adding a voice or changing a sentence means generating the clips again.

export type Voice = { id: string; name: string; accent: 'portugal' | 'brazil' | 'uk' | 'france' }

export const VOICES: Record<string, Voice[]> = {
  pt: [
    { id: 'pt-PT-RaquelNeural', name: 'Raquel', accent: 'portugal' },
    { id: 'pt-PT-DuarteNeural', name: 'Duarte', accent: 'portugal' },
    { id: 'pt-BR-FranciscaNeural', name: 'Francisca', accent: 'brazil' },
    { id: 'pt-BR-AntonioNeural', name: 'António', accent: 'brazil' },
  ],
  en: [
    { id: 'en-GB-SoniaNeural', name: 'Sonia', accent: 'uk' },
    { id: 'en-GB-RyanNeural', name: 'Ryan', accent: 'uk' },
  ],
  fr: [
    { id: 'fr-FR-DeniseNeural', name: 'Denise', accent: 'france' },
    { id: 'fr-FR-HenriNeural', name: 'Henri', accent: 'france' },
  ],
}

const OFFSET = 0x811c9dc5
const PRIME = 0x01000193

/** The clip of a sentence is named after its text: a changed sentence never plays old audio. */
export function clipName(text: string) {
  let hash = OFFSET
  for (const unit of text) {
    hash ^= unit.codePointAt(0) ?? 0
    hash = Math.imul(hash, PRIME)
  }
  return (hash >>> 0).toString(16)
}
