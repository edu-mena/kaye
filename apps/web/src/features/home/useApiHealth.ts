import { useQuery } from '@tanstack/react-query'
import { api } from '../../lib/api'

type Health = {
  status: 'ok'
  app: string
  locale: string
  locales: string[]
}

export function useApiHealth() {
  return useQuery({
    queryKey: ['health'],
    queryFn: () => api<Health>('/health'),
    retry: 1,
  })
}
