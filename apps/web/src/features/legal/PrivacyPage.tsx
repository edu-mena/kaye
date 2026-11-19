import { LegalDocument } from './LegalDocument'
import { PRIVACY } from './privacy'

/** /privacidade: the privacy policy, accepted when the profile is created. */
export default function PrivacyPage() {
  return <LegalDocument kind="privacy" doc={PRIVACY} />
}
