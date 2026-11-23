import type { Agent, Simulation, SimulationMoment } from '../data/types'

/** What the person said after living a simulation: they liked it or not. Only this, never their choices. */
export type SimulationResult = { id: string; careerSlug: string; liked: boolean; at: string }

export const MAX_SIMULATIONS = 50

/** The simulations of one career. */
export const simulationsOf = (all: readonly Simulation[], careerSlug: string): Simulation[] =>
  all.filter((simulation) => simulation.careerSlug === careerSlug)

/** The decisions of a simulation, in the order of the day. */
export const decisionMoments = (simulation: Simulation): SimulationMoment[] =>
  simulation.moments.filter((moment) => moment.decision !== undefined)

/** The agent who wrote a simulation; undefined while Kayé's own team is the author. */
export const authorOf = (simulation: Simulation, agents: readonly Agent[]): Agent | undefined =>
  agents.find((agent) => agent.id === simulation.agentId)

/** The newest answer first, one per simulation: answering again replaces the earlier one. */
export function withResult(
  results: readonly SimulationResult[],
  result: SimulationResult,
): SimulationResult[] {
  return [result, ...results.filter((entry) => entry.id !== result.id)].slice(0, MAX_SIMULATIONS)
}

/** The careers whose simulation the person liked, newest first. */
export const likedCareers = (results: readonly SimulationResult[]): string[] => [
  ...new Set(results.filter((entry) => entry.liked).map((entry) => entry.careerSlug)),
]

/** The person's answer to one simulation, if any. */
export const resultOf = (results: readonly SimulationResult[], id: string): SimulationResult | undefined =>
  results.find((entry) => entry.id === id)
