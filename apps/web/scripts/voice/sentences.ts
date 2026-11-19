// Lists every sentence the guide says, per voice, for generate.py to record.
// Run from apps/web: npx tsx scripts/voice/sentences.ts > scripts/voice/sentences.json
import { createInstance } from 'i18next'
import { MARKET_AREAS } from '../../src/data/types'
import { AREA_LEVELS } from '../../src/domain/discovery'
import { EMPTY_DRAFT, spokenText, type Step } from '../../src/features/onboarding/flow'
import { clipName, VOICES, type Voice } from '../../src/lib/voices'
import { en } from '../../src/locales/en'
import { fr } from '../../src/locales/fr'
import { pt } from '../../src/locales/pt'

const FIXED: Step['id'][] = [
  'voice',
  'situation',
  'goal',
  'stats',
  'areas',
  'interests',
  'name',
  'about',
  'education',
  'building',
  'signup',
]

const resources = { pt: { translation: pt }, en: { translation: en }, fr: { translation: fr } }

async function clipsOf(locale: string, voices: Voice[]) {
  const i18n = createInstance()
  await i18n.init({ lng: locale, resources, interpolation: { escapeValue: false } })

  const sentences = new Set<string>()
  for (const id of FIXED) sentences.add(spokenText({ id } as Step, EMPTY_DRAFT, i18n.t))
  for (const area of MARKET_AREAS) {
    sentences.add(spokenText({ id: 'areaGroups', area }, EMPTY_DRAFT, i18n.t))
    sentences.add(spokenText({ id: 'areaLevel', area }, EMPTY_DRAFT, i18n.t))
    for (const level of AREA_LEVELS) {
      const answers = { [area]: { groups: [], level, career: null, reaction: null } }
      sentences.add(spokenText({ id: 'areaCareer', area }, { ...EMPTY_DRAFT, answers }, i18n.t))
    }
  }

  return voices.flatMap(({ id }) =>
    [...sentences].map((text) => ({ voice: id, file: `${clipName(text)}.mp3`, text })),
  )
}

const clips = await Promise.all(Object.entries(VOICES).map(([locale, voices]) => clipsOf(locale, voices)))
process.stdout.write(JSON.stringify(clips.flat(), null, 2))
