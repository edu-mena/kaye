import type { StrengthKey } from '../../domain/cvStrength'

/** The questions of the step-by-step guide, in order. */
export const STEPS = [
  'name',
  'headline',
  'contact',
  'summary',
  'education',
  'experience',
  'skills',
  'languages',
  'arrange',
  'template',
  'done',
] as const
export type Step = (typeof STEPS)[number]

/** Each part of the strength score belongs to one step. */
export const STEP_OF: Record<StrengthKey, Step> = {
  name: 'name',
  headline: 'headline',
  contact: 'contact',
  summary: 'summary',
  education: 'education',
  experience: 'experience',
  skills: 'skills',
  languages: 'languages',
  links: 'contact',
}
