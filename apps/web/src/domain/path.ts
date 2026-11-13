import type { CvData, NewsItem } from '../data/types'
import { bestCvCompleteness } from './cv'

/** The part of the person's data the path and the notifications read; the saved user data fits it. */
type Person = {
  profile: object | null
  assessmentCompletedAt: string | null
  targetCareer: string | null
  savedCareers: string[]
  skills: Record<string, unknown>
  cvs: { cv: CvData }[]
  compare: string[]
}

export type PathStep = {
  id: 'perfil' | 'teste' | 'destino' | 'competencias' | 'cv' | 'cursos'
  done: boolean
  to: string
}

/** The six steps of the path (Perfil, Notificações), in order. */
export function pathSteps(person: Person): PathStep[] {
  return [
    { id: 'perfil', done: person.profile !== null, to: '/entrar' },
    { id: 'teste', done: person.assessmentCompletedAt !== null, to: '/teste' },
    { id: 'destino', done: person.targetCareer !== null, to: '/carreiras' },
    {
      id: 'competencias',
      done: Object.keys(person.skills).length > 0,
      to: person.targetCareer ? `/carreiras/${person.targetCareer}` : '/carreiras',
    },
    { id: 'cv', done: bestCvCompleteness(person.cvs) === 1, to: '/cv' },
    { id: 'cursos', done: person.compare.length > 0, to: '/cursos' },
  ]
}

/** The person's careers: the ones they saved and their destination. */
export function myCareers(person: Pick<Person, 'savedCareers' | 'targetCareer'>): Set<string> {
  return new Set(person.targetCareer ? [...person.savedCareers, person.targetCareer] : person.savedCareers)
}

/** A piece of news is about the person when it is about one of their careers ("Para ti"). */
export function isAboutMe(item: NewsItem, mine: Set<string>): boolean {
  return item.careers?.some((slug) => mine.has(slug)) ?? false
}

/**
 * What reaches Notificações: news of the topics the person subscribed to, and news about their careers
 * except the pieces that only live on Novidades.
 */
export function isNotification(item: NewsItem, mine: Set<string>, subscribed = false): boolean {
  return subscribed || (item.kind !== 'analise' && isAboutMe(item, mine))
}

/** News the person has not seen: dated after the day they last opened their notifications. */
export function isUnseen(item: NewsItem, seenAt: string | null): boolean {
  return seenAt === null || item.date > seenAt.slice(0, 10)
}
