import { guarded } from '../../_publicCards.js'
import { joinWaitlist } from '../../_waitlist.js'

export function POST(request: Request): Promise<Response> {
  return guarded(() => joinWaitlist(request))
}
