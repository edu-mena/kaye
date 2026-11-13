import { createInterview } from '../../_interviews.js'
import { guarded } from '../../_publicCards.js'

export function POST(request: Request): Promise<Response> {
  return guarded(() => createInterview(request))
}
