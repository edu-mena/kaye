import type { CvData, CvEntry } from '../data/types'

/** A local id (no secure context needed, unlike crypto.randomUUID). */
export function newId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

/** An empty entry with its own id. */
export function newEntry(): CvEntry {
  return {
    id: newId(),
    title: '',
    place: '',
    period: '',
    description: '',
  }
}

// What a CV needs before it is worth sending. Shared by the CV screen and the
// "CV pronto" achievement, so the rule lives in one place.
const CHECKS = {
  name: (cv: CvData) => cv.name.trim() !== '',
  headline: (cv: CvData) => cv.headline.trim() !== '',
  contact: (cv: CvData) => cv.contact.trim() !== '',
  summary: (cv: CvData) => cv.summary.trim() !== '',
  education: (cv: CvData) => cv.education.some((entry) => entry.title.trim() !== ''),
  experience: (cv: CvData) => [...cv.experience, ...cv.projects].some((entry) => entry.title.trim() !== ''),
  skills: (cv: CvData) => cv.skills.length > 0,
}

export type CvCheck = keyof typeof CHECKS

/** The checks a CV still fails, in the order the editor asks for them. */
export function cvMissing(cv: CvData): CvCheck[] {
  return (Object.keys(CHECKS) as CvCheck[]).filter((key) => !CHECKS[key](cv))
}

/** 0 to 1. */
export function cvCompleteness(cv: CvData): number {
  const total = Object.keys(CHECKS).length
  return (total - cvMissing(cv).length) / total
}

/** The most complete of the person's CVs: one ready CV is enough for the path and the achievement. */
export function bestCvCompleteness(cvs: { cv: CvData }[]): number {
  return Math.max(0, ...cvs.map((document) => cvCompleteness(document.cv)))
}

/** "React, Git , Figma" → ["React", "Git", "Figma"] */
export function parseList(text: string): string[] {
  return text
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}
