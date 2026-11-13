import type { TFunction } from 'i18next'
import {
  EDUCATION_LEVELS,
  type CareerSummary,
  type EducationLevel,
  type MarketArea,
  type RiasecKey,
} from '../../data/types'
import {
  AREA_LEVELS,
  EMPTY_AREA,
  groupsOf,
  type AreaAnswers,
  type AreaLevel,
  type Discovery,
  type Goal,
  type Situation,
} from '../../domain/discovery'
import { isMinor } from '../../domain/education'
import { contactProblems } from '../../data/waitlist'

const MIN_AGE = 14
const OLDEST = 60
// Read once when the app loads: render must not depend on the clock.
export const CURRENT_YEAR = new Date().getFullYear()
export const BIRTH_YEARS = Array.from({ length: OLDEST - MIN_AGE + 1 }, (_, index) =>
  String(CURRENT_YEAR - MIN_AGE - index),
)

export type Draft = {
  step: string
  voiceOn: boolean
  /** The chosen voice; without one, the first of the language. */
  voice: string | null
  situation: Situation | null
  goal: Goal | null
  areas: MarketArea[]
  unsure: boolean
  interests: RiasecKey[]
  answers: Partial<Record<MarketArea, AreaAnswers>>
  name: string
  /** Mandatory launch contact (at least one of the two), asked right after the welcome. */
  email: string
  whatsapp: string
  contactConsent: boolean
  birthYear: string
  province: string
  education: EducationLevel | null
  terms: boolean
  guardian: boolean
}

export const EMPTY_DRAFT: Draft = {
  step: 'welcome',
  voiceOn: true,
  voice: null,
  situation: null,
  goal: null,
  areas: [],
  unsure: false,
  interests: [],
  answers: {},
  name: '',
  email: '',
  whatsapp: '',
  contactConsent: false,
  birthYear: '',
  province: '',
  education: null,
  terms: false,
  guardian: false,
}

export type Step =
  | {
      id:
        | 'welcome'
        | 'contact'
        | 'voice'
        | 'situation'
        | 'goal'
        | 'stats'
        | 'areas'
        | 'interests'
        | 'name'
        | 'about'
        | 'education'
        | 'building'
        | 'signup'
    }
  | { id: 'areaGroups' | 'areaLevel' | 'areaCareer'; area: MarketArea }

export const stepKey = (step: Step) => ('area' in step ? `${step.id}:${step.area}` : step.id)

/** The three parts of the progress bar: where you are, your areas, you. */
export function stageOf(step: Step): 0 | 1 | 2 {
  if (['contact', 'voice', 'situation', 'goal', 'stats', 'welcome'].includes(step.id)) return 0
  return ['areas', 'interests'].includes(step.id) || 'area' in step ? 1 : 2
}

/**
 * The conversation so far decides what comes next: never more than three questions per chosen area,
 * and a question with only one possible answer is not asked at all.
 */
export function buildSteps(draft: Draft, careers: CareerSummary[]): Step[] {
  return [
    { id: 'welcome' },
    { id: 'contact' },
    { id: 'voice' },
    { id: 'situation' },
    { id: 'goal' },
    { id: 'stats' },
    { id: 'areas' },
    ...(draft.unsure ? [{ id: 'interests' } as const] : []),
    ...draft.areas.flatMap((area): Step[] => [
      ...(groupsOf(careers, area).length > 1 ? [{ id: 'areaGroups', area } as const] : []),
      { id: 'areaLevel', area },
      { id: 'areaCareer', area },
    ]),
    { id: 'name' },
    { id: 'about' },
    { id: 'education' },
    { id: 'building' },
    { id: 'signup' },
  ]
}

const SCHOOL_LEVELS: EducationLevel[] = ['primario', 'i_ciclo', 'ii_ciclo', 'medio_tecnico']
const UNIVERSITY_LEVELS: EducationLevel[] = ['ii_ciclo', 'medio_tecnico', 'licenciatura', 'mestrado']

/** Only the levels that make sense for the person's situation. */
export function educationOptions(situation: Situation | null): readonly EducationLevel[] {
  if (situation === 'school') return SCHOOL_LEVELS
  return situation === 'university' ? UNIVERSITY_LEVELS : EDUCATION_LEVELS
}

export const goalOptions = (situation: Situation | null): Goal[] => [
  situation === 'working' ? 'change' : 'discover',
  'course',
  'job',
  'cv',
]

/** Who is still at school does not get asked whether they already work in the area. */
export const levelOptions = (situation: Situation | null): AreaLevel[] =>
  AREA_LEVELS.filter((level) => situation !== 'school' || level !== 'working')

export const areaAnswers = (draft: Draft, area: MarketArea) => draft.answers[area] ?? EMPTY_AREA

export function needsGuardian(draft: Draft, year: number) {
  return draft.birthYear !== '' && isMinor(Number(draft.birthYear), year)
}

export function canContinue(step: Step, draft: Draft): boolean {
  switch (step.id) {
    case 'contact':
      return draft.contactConsent && Object.keys(contactProblems(draft.email, draft.whatsapp)).length === 0
    case 'situation':
      return draft.situation !== null
    case 'goal':
      return draft.goal !== null && goalOptions(draft.situation).includes(draft.goal)
    case 'areas':
      return draft.unsure || draft.areas.length > 0
    case 'interests':
      return draft.interests.length > 0
    case 'areaGroups':
      return areaAnswers(draft, step.area).groups.length > 0
    case 'areaLevel': {
      const { level } = areaAnswers(draft, step.area)
      return level !== null && levelOptions(draft.situation).includes(level)
    }
    case 'name':
      return draft.name.trim() !== ''
    case 'about':
      return draft.birthYear !== '' && draft.province !== ''
    case 'education':
      return draft.education !== null && educationOptions(draft.situation).includes(draft.education)
    default:
      return true
  }
}

/** What the guide says on each screen. `speech` replaces the title when it would read out a name. */
export function stepCopy(
  step: Step,
  draft: Draft,
  t: TFunction,
): { title: string; hint?: string; speech?: string } {
  switch (step.id) {
    case 'areaGroups':
      return {
        title: t('onboarding.areaGroupsTitle', { area: t(`market.area_${step.area}`) }),
        hint: t('onboarding.areaGroupsHint'),
      }
    case 'areaLevel':
      return {
        title: t('onboarding.areaLevelTitle', { area: t(`market.area_${step.area}`) }),
        hint: t('onboarding.areaLevelHint'),
      }
    case 'areaCareer': {
      const level = areaAnswers(draft, step.area).level
      return {
        title: t(
          level === 'studying' || level === 'working'
            ? `onboarding.areaCareerTitle_${level}`
            : 'onboarding.areaCareerTitle',
        ),
      }
    }
    case 'about':
      return {
        title: t('onboarding.aboutTitle', { name: draft.name.trim() }),
        speech: t('onboarding.aboutSpeech'),
        hint: t('onboarding.aboutHint'),
      }
    default:
      return { title: t(`onboarding.${step.id}Title`), hint: t(`onboarding.${step.id}Hint`) }
  }
}

/** What the guide reads aloud on a step. Never a name: the sentences are recorded beforehand. */
export function spokenText(step: Step, draft: Draft, t: TFunction) {
  const copy = stepCopy(step, draft, t)
  return [copy.speech ?? copy.title, copy.hint].filter(Boolean).join(' ')
}

export function toDiscovery(draft: Draft): Discovery {
  return {
    situation: draft.situation ?? 'seeking',
    goal: draft.goal ?? 'discover',
    areas: draft.areas,
    interests: draft.interests,
    answers: draft.answers,
  }
}
