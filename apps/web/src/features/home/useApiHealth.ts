import { useQuery } from '@tanstack/react-query'
import { api } from '../../lib/api'

// GET /api/v1/health. A 503 (database down) arrives here as an ApiError.
type Health = {
  status: 'ok' | 'degraded'
  app: string
  locale: string
  locales: string[]
  checks: { database: 'ok' | 'down' }
}

export function useApiHealth() {
  return useQuery({
    queryKey: ['health'],
    queryFn: () => api<Health>('/health'),
    retry: 1,
  })
}
