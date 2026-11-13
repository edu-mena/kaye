import { guarded } from '../../_publicCards.js'
import { exportList } from '../../_waitlist.js'

export function GET(request: Request): Promise<Response> {
  return guarded(() => exportList(request))
}
