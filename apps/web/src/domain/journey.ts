// "A tua jornada": discover, decide, prepare. The current phase is the first one not done, which is
// also what the hero's "next step" button points at.

export type JourneyPhase = 'discover' | 'decide' | 'prepare'

export type JourneyInput = {
  /** The interest test (RIASEC) is finished. */
  testDone: boolean
  /** Part 2 of the test (the strengths) is finished. */
  strengthsDone: boolean
  targetCareer: string | null
  hasCv: boolean
  hasPlan: boolean
}

export type JourneyStep = { phase: JourneyPhase; done: boolean; current: boolean }

export function journey(input: JourneyInput): JourneyStep[] {
  const done: Record<JourneyPhase, boolean> = {
    discover: input.testDone && input.strengthsDone,
    decide: input.targetCareer !== null,
    prepare: input.hasCv && input.hasPlan,
  }
  const phases: JourneyPhase[] = ['discover', 'decide', 'prepare']
  const current = phases.find((phase) => !done[phase])
  return phases.map((phase) => ({ phase, done: done[phase], current: phase === current }))
}

export type NextStep =
  | { kind: 'test' }
  | { kind: 'strengths' }
  | { kind: 'cv' }
  | { kind: 'plan'; career: string }
  | { kind: 'explore' }

/** What to do next: the first step of the current phase. With everything done, the path to the target career. */
export function nextStep(input: JourneyInput): NextStep {
  const current = journey(input).find((step) => step.current)?.phase
  if (current === 'discover') return input.testDone ? { kind: 'strengths' } : { kind: 'test' }
  if (current === 'decide' || !input.targetCareer) return { kind: 'explore' }
  if (current === 'prepare' && !input.hasCv) return { kind: 'cv' }
  return { kind: 'plan', career: input.targetCareer }
}
