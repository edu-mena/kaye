import { isMinor } from '../domain/education'
import { userActions, useUser } from '../state/userStore'

// Kayé Plus (docs/decisoes/0024): 1.999 Kz a month for what costs the team time to review. Exploring
// stays free. Nothing is charged yet (the payment method is undecided): the flag keeps all of this off.

export const PLUS_PRICE_KZ = 1999

export const PLUS_FEATURES = ['cv_pdf', 'training', 'simulations', 'interview_feedback'] as const
export type PlusFeature = (typeof PLUS_FEATURES)[number]

/** Read when asked, not at load: a test (or a build) can turn it on. */
const plusEnabled = () => import.meta.env.VITE_PLUS_ENABLED === 'true'

/**
 * What the person sees of the Plus. Adults only get the promotion and the padlocks: a minor (or someone whose age is
 * not known) keeps everything free, with no commercial pressure, until there is a flow with a guardian.
 */
export function usePlus() {
  const { profile, plusTrials } = useUser()
  const enabled = plusEnabled()
  const adult = profile !== null && !isMinor(profile.birthYear)
  // Nobody can pay yet.
  const isPlus = false
  const trialUsed = (feature: PlusFeature) => plusTrials?.[feature] === true
  return {
    enabled,
    isPlus,
    /** The promotion (card, menu item, badges) may be shown. */
    promotable: enabled && adult,
    trialUsed,
    /** The feature is closed right now: the flag is on, the person is an adult without Plus and used the free try. */
    blocked: (feature: PlusFeature) => enabled && adult && !isPlus && trialUsed(feature),
    /** Called when the person finishes the action: the free try is gone. */
    spendTrial: (feature: PlusFeature) => userActions.spendPlusTrial(feature),
  }
}
