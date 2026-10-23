import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router'
import { useUser } from '../state/userStore'

/** The test and the CV need a profile (later: an account). Comes back here afterwards. */
export function RequireProfile({ children }: { children: ReactNode }) {
  const { profile } = useUser()
  const location = useLocation()

  if (!profile) {
    return <Navigate to={`/entrar?next=${encodeURIComponent(location.pathname)}`} replace />
  }
  return <>{children}</>
}
