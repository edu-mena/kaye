import { LegalDocument } from './LegalDocument'
import { TERMS } from './terms'

/** /termos: the terms of use, accepted when the profile is created. */
export default function TermsPage() {
  return <LegalDocument kind="terms" doc={TERMS} />
}
