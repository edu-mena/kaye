import { MENTORS } from '../data/demo/mentors'
import type { IconName } from './icons'

type NavKey =
  | 'home'
  | 'search'
  | 'careers'
  | 'areas'
  | 'tests'
  | 'courses'
  | 'kursos'
  | 'academies'
  | 'opportunities'
  | 'deadlines'
  | 'noDegree'
  | 'mentors'
  | 'companies'
  | 'market'
  | 'news'
  | 'cv'
  | 'plan'
  | 'simulations'
  | 'plus'
  | 'notifications'
  | 'profile'
  | 'support'
  | 'settings'

export type NavItem = {
  to: string
  key: NavKey
  icon: IconName
  /** White icon instead of gold: Suporte and Configurações stay in the background. */
  quiet?: boolean
  /** On large screens the tutorial points at the sidebar link (components/Tour.tsx). */
  tour?: string
  /** Other addresses that belong to this item: the tests it gathers, for example. */
  also?: string[]
  /** Part of Kayé Plus: it gets a badge while the Plus is on (and the person is an adult). */
  plus?: boolean
}
export type NavGroup = {
  key: 'groupDiscover' | 'groupPrepare' | 'groupOpportunities' | 'groupYou' | 'groupHelp'
  items: NavItem[]
}

const HOME: NavItem = { to: '/', key: 'home', icon: 'home' }
const SEARCH: NavItem = { to: '/pesquisa', key: 'search', icon: 'search' }
const CAREERS: NavItem = { to: '/carreiras', key: 'careers', icon: 'compass' }
const AREAS: NavItem = { to: '/areas', key: 'areas', icon: 'globe' }
const TESTS: NavItem = {
  to: '/testes',
  key: 'tests',
  icon: 'brain',
  also: ['/teste', '/treino', '/entrevistas'],
}
const COURSES: NavItem = { to: '/cursos', key: 'courses', icon: 'cap' }
const KURSOS: NavItem = { to: '/kursos', key: 'kursos', icon: 'book' }
const ACADEMIES: NavItem = { to: '/academias', key: 'academies', icon: 'landmark' }
const OPPORTUNITIES: NavItem = { to: '/oportunidades', key: 'opportunities', icon: 'award' }
const DEADLINES: NavItem = { to: '/prazos', key: 'deadlines', icon: 'calendar', tour: 'deadlines' }
const NO_DEGREE: NavItem = { to: '/sem-universidade', key: 'noDegree', icon: 'helmet' }
// Only once Kayé has approved mentors (docs/mentores.md).
const MENTORS_ITEM: NavItem[] = MENTORS.length > 0 ? [{ to: '/mentores', key: 'mentors', icon: 'users' }] : []
const COMPANIES: NavItem = { to: '/empresas', key: 'companies', icon: 'building' }
const MARKET: NavItem = { to: '/mercado', key: 'market', icon: 'chart' }
const NEWS: NavItem = { to: '/novidades', key: 'news', icon: 'newspaper' }
const CV: NavItem = { to: '/cv', key: 'cv', icon: 'document', plus: true }
const PLAN: NavItem = { to: '/plano', key: 'plan', icon: 'path' }
const SIMULATIONS: NavItem = { to: '/simulacoes', key: 'simulations', icon: 'briefcase', plus: true }
const NOTIFICATIONS: NavItem = { to: '/notificacoes', key: 'notifications', icon: 'bell' }
const PROFILE: NavItem = { to: '/perfil', key: 'profile', icon: 'user' }
export const PLUS: NavItem = { to: '/plus', key: 'plus', icon: 'lock' }
const SUPPORT: NavItem = { to: '/suporte', key: 'support', icon: 'help', quiet: true }
const SETTINGS: NavItem = { to: '/configuracoes', key: 'settings', icon: 'sliders', quiet: true }

// One map for every navigation: the sidebar and the phone menu both show all of it.
// The bottom bar is only a shortcut to the five used most; nothing leaves the menu for being there.
export const NAV_GROUPS: NavGroup[] = [
  { key: 'groupDiscover', items: [HOME, SEARCH, CAREERS, AREAS, COURSES, ACADEMIES, COMPANIES, MARKET] },
  { key: 'groupPrepare', items: [TESTS, CV, PLAN, KURSOS, SIMULATIONS] },
  { key: 'groupOpportunities', items: [OPPORTUNITIES, DEADLINES, NO_DEGREE, ...MENTORS_ITEM, NEWS] },
  { key: 'groupYou', items: [NOTIFICATIONS, PROFILE] },
]
export const FOOTER = [SUPPORT, SETTINGS]

export const BOTTOM = [HOME, SEARCH, CAREERS, COURSES, CV]
