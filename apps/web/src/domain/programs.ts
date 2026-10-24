import type { Institution, Program, Schedule } from '../data/types'
import { inBand, type Band } from './bands'

export type ProgramFilter = {
  career?: string | null
  province?: string | null
  level?: Program['level'] | null
  duration?: Band
  cost?: Band
  schedule?: Schedule | null
  ownership?: Institution['ownership'] | null
}

/** Whether a course passes every filter that is set (an empty filter lets everything through). */
export function matchesProgram(program: Program, filter: ProgramFilter): boolean {
  return (
    (!filter.career || program.careers.includes(filter.career)) &&
    (!filter.province || program.institution.province === filter.province) &&
    (!filter.level || program.level === filter.level) &&
    inBand(program.durationMonths, filter.duration) &&
    inBand(program.totalCost, filter.cost) &&
    (!filter.schedule || program.schedule.includes(filter.schedule)) &&
    (!filter.ownership || program.institution.ownership === filter.ownership)
  )
}
