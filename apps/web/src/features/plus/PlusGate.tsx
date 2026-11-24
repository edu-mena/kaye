import { useState, type ReactNode } from 'react'
import { usePlus, type PlusFeature } from '../../lib/plan'
import { PlusLock } from './PlusLock'

/**
 * Wraps a Plus feature. With the flag off, for a minor, for a Plus member or before the free try is used, it shows the
 * feature; otherwise the lock card. Whether it is closed is decided when the gate appears and kept until it goes: the try
 * is spent by the action itself (`spendTrial`), and the person must still see the result of what they just did.
 */
export function PlusGate({
  feature,
  children,
  fallback,
}: {
  feature: PlusFeature
  children: ReactNode
  /** What shows when it is closed; by default the lock card. */
  fallback?: ReactNode
}) {
  const plus = usePlus()
  const [closed] = useState(() => plus.blocked(feature))
  return closed ? (fallback ?? <PlusLock />) : children
}
