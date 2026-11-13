import { useUser } from '../../state/userStore'
import { LandingPage } from '../landing/LandingPage'
import HomePage from './HomePage'

/** The address of the app: the landing page outside, the person's home once signed in. */
export function IndexPage() {
  const { profile } = useUser()
  return profile ? <HomePage /> : <LandingPage />
}
