import type { CvData } from '../data/types'

// "O teu CV está 70% forte": a score of 0 to 100 that rewards what recruiters read first, and the list of
// what is still missing, biggest gain first. Unlike `cvCompleteness` (a CV is ready or not), this one
// moves a little with every line the person adds, which is what keeps them going.

export type StrengthKey =
  'name' | 'headline' | 'contact' | 'summary' | 'education' | 'experience' | 'skills' | 'languages' | 'links'

/** Points when the part is complete: they add up to 100. */
export const STRENGTH_POINTS: Record<StrengthKey, number> = {
  name: 8,
  headline: 10,
  contact: 10,
  summary: 14,
  education: 12,
  experience: 20,
  skills: 14,
  languages: 6,
  links: 6,
}

const SUMMARY_LENGTH = 60
const SKILLS_WANTED = 5

const filled = (text: string) => text.trim() !== ''

/** How much of each part is there, from 0 to 1. */
const FRACTIONS: Record<StrengthKey, (cv: CvData) => number> = {
  name: (cv) => (filled(cv.name) ? 1 : 0),
  headline: (cv) => (filled(cv.headline) ? 1 : 0),
  contact: (cv) => (filled(cv.contact) ? 1 : 0),
  // A short sentence counts half: two sentences say what the person has and wants.
  summary: (cv) => (cv.summary.trim().length >= SUMMARY_LENGTH ? 1 : filled(cv.summary) ? 0.5 : 0),
  education: (cv) => (cv.education.some((entry) => filled(entry.title)) ? 1 : 0),
  // Something done counts; saying what was done and with what result is the rest.
  experience: (cv) => {
    const done = [...cv.experience, ...cv.projects].filter((entry) => filled(entry.title))
    if (done.length === 0) return 0
    return done.some((entry) => filled(entry.description)) ? 1 : 0.6
  },
  skills: (cv) => Math.min(1, cv.skills.length / SKILLS_WANTED),
  languages: (cv) => (cv.languages.length > 0 ? 1 : 0),
  links: (cv) => (cv.links.length > 0 ? 1 : 0),
}

export type CvStrength = {
  /** 0 to 100. */
  score: number
  /** What is not full yet, with the points it would add. The biggest gain first. */
  missing: { key: StrengthKey; points: number }[]
}

export function cvStrength(cv: CvData): CvStrength {
  const keys = Object.keys(STRENGTH_POINTS) as StrengthKey[]
  const gains = keys.map((key) => ({
    key,
    points: Math.round(STRENGTH_POINTS[key] * (1 - FRACTIONS[key](cv))),
  }))
  const missing = gains.filter((gain) => gain.points > 0).toSorted((a, b) => b.points - a.points)
  const lost = missing.reduce((sum, gain) => sum + gain.points, 0)
  return { score: 100 - lost, missing }
}
