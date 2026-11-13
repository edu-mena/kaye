import { guarded } from '../../_publicCards.js'
import { sendFeedback } from '../../_waitlist.js'

export function POST(request: Request): Promise<Response> {
  return guarded(() => sendFeedback(request))
}
