import { createCard, guarded } from '../../_publicCards.js'

export function POST(request: Request): Promise<Response> {
  return guarded(() => createCard(request))
}
