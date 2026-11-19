import { guarded, removeCard, replaceCard, showCard, slugOf } from '../../_publicCards.js'

export function GET(request: Request): Promise<Response> {
  return guarded(() => showCard(slugOf(request)))
}

export function PUT(request: Request): Promise<Response> {
  return guarded(() => replaceCard(slugOf(request), request))
}

export function DELETE(request: Request): Promise<Response> {
  return guarded(() => removeCard(slugOf(request), request))
}
