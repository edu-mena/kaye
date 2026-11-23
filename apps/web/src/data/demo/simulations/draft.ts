import type { Simulation } from '../../types'

/** What is written by hand: `example` and `languages` are the same for every simulation until an agent reviews it. */
export type SimulationDraft = Omit<Simulation, 'example' | 'languages' | 'agentId'>
