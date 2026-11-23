import type { Simulation } from '../../types'
import { CARE_SIMULATIONS } from './care'
import { FIELD_SIMULATIONS } from './field'
import { OFFICE_SIMULATIONS } from './office'
import { SERVICE_SIMULATIONS } from './service'

// One simulation per area, on a career with demand (docs/mentores.md#simulações). Kayé writes them as examples
// until a Kayé agent (data/demo/agents.ts) reviews and replaces them: `agentId` set and `example` removed.
// They exist in Portuguese only; English and French show the Portuguese text, marked, until they are translated.
export const SIMULATIONS: Simulation[] = [
  ...CARE_SIMULATIONS,
  ...OFFICE_SIMULATIONS,
  ...FIELD_SIMULATIONS,
  ...SERVICE_SIMULATIONS,
].map((draft) => Object.assign({}, draft, { example: true as const, languages: ['pt' as const] }))
