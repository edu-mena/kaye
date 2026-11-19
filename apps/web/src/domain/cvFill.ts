import type { CvData, CvEntry } from '../data/types'
import { newEntry } from './cv'
import type { CvEntrySuggestion } from './strengths'

// What the app already knows and could go on a CV. It only proposes: the person sees each item,
// chooses, and applies. Filled fields are never touched unless they tick the item themselves.

type CvFillSource = 'profile' | 'guide' | 'target' | 'fit' | 'strengths'
type TextField = 'name' | 'headline' | 'summary' | 'contact'
type EntryField = CvEntrySuggestion['field']
type CvFillField = TextField | 'skills' | 'education' | 'languages' | EntryField

export type CvSuggestion = {
  id: string
  field: CvFillField
  value: string
  source: CvFillSource
  /** What is already there and would be lost: the item starts unticked. */
  replaces: string | null
  /** Experience, projects and certifications: the whole entry `value` sums up. */
  entry?: Omit<CvEntry, 'id'>
}

type FillInput = {
  cv: CvData
  /** A minor's CV gets only the minimum: no location. */
  minor: boolean
  name: string | null
  location: string | null
  education: string | null
  headline: string | null
  objective: { text: string; source: CvFillSource } | null
  /** The names of the skills the person says they know. */
  skills: string[]
  /** "Inglês (intermédio)", as the CV writes them (test part 2). */
  languages?: string[]
  /** What the person has done and the Kursos they finished (test part 2). */
  entries?: CvEntrySuggestion[]
}

const same = (first: string, second: string) => first.trim().toLowerCase() === second.trim().toLowerCase()

function textSuggestion(
  cv: CvData,
  field: TextField,
  value: string | null,
  source: CvFillSource,
): CvSuggestion[] {
  if (!value || same(cv[field], value)) return []
  const current = cv[field].trim()
  return [{ id: field, field, value, source, replaces: current || null }]
}

export function cvSuggestions({
  cv,
  minor,
  name,
  location,
  education,
  headline,
  objective,
  skills,
  languages = [],
  entries = [],
}: FillInput): CvSuggestion[] {
  return [
    ...textSuggestion(cv, 'name', name, 'profile'),
    ...textSuggestion(cv, 'headline', headline, 'target'),
    // The contact line is the person's own: the location only starts it, never replaces it.
    ...(minor || cv.contact.trim() ? [] : textSuggestion(cv, 'contact', location, 'profile')),
    ...(objective ? textSuggestion(cv, 'summary', objective.text, objective.source) : []),
    ...(education && cv.education.length === 0
      ? [
          {
            id: 'education',
            field: 'education' as const,
            value: education,
            source: 'profile' as const,
            replaces: null,
          },
        ]
      : []),
    ...skills
      .filter((skill) => !cv.skills.some((have) => same(have, skill)))
      .map((skill) => ({
        id: `skill:${skill}`,
        field: 'skills' as const,
        value: skill,
        source: 'fit' as const,
        replaces: null,
      })),
    ...languages.flatMap((language) => languageSuggestion(cv, language)),
    ...entries
      .filter(({ field, entry }) => !cv[field].some((have) => same(have.title, entry.title)))
      .map(({ field, entry }, index) => ({
        id: `${field}:${index}:${entry.title}`,
        field,
        value: [entry.title, entry.place, entry.period].filter(Boolean).join(' · '),
        source: 'strengths' as const,
        replaces: null,
        entry,
      })),
  ]
}

/** The language's name, without the level in brackets: "Inglês (intermédio)" → "inglês". */
const languageName = (language: string) =>
  language
    .replace(/\s*\(.*$/, '')
    .trim()
    .toLowerCase()

/** A language already on the CV at another level is replaced only if the person ticks it. */
function languageSuggestion(cv: CvData, language: string): CvSuggestion[] {
  if (cv.languages.some((have) => same(have, language))) return []
  const current = cv.languages.find((have) => languageName(have) === languageName(language))
  return [
    {
      id: `language:${language}`,
      field: 'languages',
      value: language,
      source: 'strengths',
      replaces: current ?? null,
    },
  ]
}

/** The CV with the chosen items: lists get one more, a language takes the place of the same one, the rest fills its field. */
export function applyCvSuggestions(cv: CvData, chosen: CvSuggestion[]): CvData {
  const next: CvData = {
    ...cv,
    skills: [...cv.skills],
    languages: [...cv.languages],
    education: [...cv.education],
    experience: [...cv.experience],
    projects: [...cv.projects],
    certifications: [...cv.certifications],
  }
  for (const { field, value, replaces, entry } of chosen) {
    if (field === 'skills') next.skills.push(value)
    else if (field === 'languages') {
      next.languages = next.languages.filter((have) => have !== replaces)
      next.languages.push(value)
    } else if (field === 'experience' || field === 'projects' || field === 'certifications')
      next[field].push(Object.assign(newEntry(), entry ?? { title: value }))
    else if (field === 'education') next.education.push(Object.assign(newEntry(), { title: value }))
    else next[field] = value
  }
  return next
}
