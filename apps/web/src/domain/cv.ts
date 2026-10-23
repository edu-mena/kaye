import type { CvData, CvEntry } from '../data/types'

/** An empty entry with its own id (no secure context needed, unlike crypto.randomUUID). */
export function newEntry(): CvEntry {
  return {
    id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    title: '',
    place: '',
    period: '',
    description: '',
  }
}

// What a CV needs before it is worth sending. Shared by the CV screen and the
// "CV pronto" achievement, so the rule lives in one place.
const CHECKS: ((cv: CvData) => boolean)[] = [
  (cv) => cv.name.trim() !== '',
  (cv) => cv.headline.trim() !== '',
  (cv) => cv.contact.trim() !== '',
  (cv) => cv.summary.trim() !== '',
  (cv) => cv.education.some((entry) => entry.title.trim() !== ''),
  (cv) => [...cv.experience, ...cv.projects].some((entry) => entry.title.trim() !== ''),
  (cv) => cv.skills.length > 0,
]

/** 0 to 1. */
export function cvCompleteness(cv: CvData): number {
  return CHECKS.filter((check) => check(cv)).length / CHECKS.length
}

/** "React, Git , Figma" → ["React", "Git", "Figma"] */
export function parseList(text: string): string[] {
  return text
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}
