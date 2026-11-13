import { Navigate, useLocation } from 'react-router'

/** /bolsas?area=x → /oportunidades?tab=bolsas&area=x: old links and their filters keep working. */
export function KeepQuery({ to }: { to: 'bolsas' | 'estagios' }) {
  const params = new URLSearchParams(useLocation().search)
  params.set('tab', to)
  return <Navigate to={`/oportunidades?${params.toString()}`} replace />
}
