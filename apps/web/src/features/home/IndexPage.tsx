import { Navigate } from 'react-router'
import { useAccount } from '../../state/accountSync'
import { useUser } from '../../state/userStore'
import { LandingPage } from '../landing/LandingPage'
import HomePage from './HomePage'

/**
 * The address of the app: the landing page outside, the person's home once signed in. Someone who signed in with
 * Google but has no profile yet (a new account) goes on to the onboarding.
 */
export function IndexPage() {
  const { profile } = useUser()
  const { status } = useAccount()
  if (profile) return <HomePage />
  if (status === 'signedIn') return <Navigate to="/entrar" replace />
  return <LandingPage />
}
