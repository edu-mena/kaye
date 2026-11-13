import type { Goal, Situation } from './discovery'

// The tutorial after onboarding: a few steps chosen by what the person came for, each pointing at
// an element marked with data-tour="<id>" on its page. Steps whose element is not on screen are
// skipped by the tour itself.

export type TourStepId =
  | 'test'
  | 'recommended'
  | 'psychotech'
  | 'courses'
  | 'compare'
  | 'internships'
  | 'interviews'
  | 'cv'
  | 'card'
  | 'freeCourses'
  | 'selfEmployment'
  | 'subscribe'
  | 'deadlines'
  | 'plan'

export type TourStep = { id: TourStepId; to: string }

const MAX_STEPS = 6

const GOAL_STEPS: Record<Goal, TourStepId[]> = {
  discover: ['test', 'recommended', 'plan', 'psychotech'],
  course: ['courses', 'compare'],
  job: ['internships', 'interviews', 'cv'],
  cv: ['cv', 'card'],
  change: ['recommended', 'freeCourses', 'selfEmployment'],
}

/** Everyone ends here: what is new for them (and following it), then the dates not to miss. */
const LAST_STEPS: TourStepId[] = ['subscribe', 'deadlines']

/** One more step for where the person is: a pupil choosing a course takes the test first, etc. */
function extraFor(situation: Situation, goal: Goal): TourStepId | null {
  if (situation === 'school' && goal === 'course') return 'test'
  if ((situation === 'university' || situation === 'seeking') && (goal === 'discover' || goal === 'change')) {
    return 'internships'
  }
  if (situation === 'seeking' && goal === 'cv') return 'interviews'
  return null
}

/** The page each step lives on; the career steps need the person's first recommended career. */
function routeOf(id: TourStepId, career: string | null): string | null {
  switch (id) {
    case 'test':
    case 'recommended':
    case 'plan':
    case 'cv':
      return '/'
    case 'psychotech':
    case 'interviews':
      return '/testes'
    case 'courses':
      return '/cursos'
    case 'compare':
      return '/cursos/comparar'
    case 'internships':
      return '/oportunidades?tab=estagios'
    case 'card':
      return '/cv/cartao'
    case 'freeCourses':
    case 'selfEmployment':
      return career ? `/carreiras/${career}` : null
    case 'subscribe':
      return '/novidades'
    case 'deadlines':
      return '/prazos'
  }
}

export function tourSteps(
  discovery: { goal: Goal; situation: Situation } | null,
  career: string | null,
): TourStep[] {
  const goal = discovery?.goal ?? 'discover'
  const extra = discovery ? extraFor(discovery.situation, goal) : null
  const ids = [...(extra === 'test' ? [extra] : []), ...GOAL_STEPS[goal]]
  if (extra && extra !== 'test') ids.push(extra)
  const unique = [...new Set(ids)].filter((id) => !LAST_STEPS.includes(id))
  const chosen = [...unique.slice(0, MAX_STEPS - LAST_STEPS.length), ...LAST_STEPS]

  return chosen.flatMap((id) => {
    const to = routeOf(id, career)
    return to ? [{ id, to }] : []
  })
}
