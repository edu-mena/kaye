import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router'
import { useUser } from '../state/userStore'

/**
 * The app needs an account: someone without one sees the landing page ("Entra para ver isto") and, after signing in,
 * comes back to this very address, filters and card included.
 */
export function RequireProfile({ children }: { children: ReactNode }) {
  const { profile } = useUser()
  const location = useLocation()

  if (!profile) {
    const here = `${location.pathname}${location.search}${location.hash}`
    return <Navigate to={`/?next=${encodeURIComponent(here)}`} replace />
  }
  return <>{children}</>
}
