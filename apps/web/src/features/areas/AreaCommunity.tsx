import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  ACCOUNTS,
  COMMUNITY_LEVELS,
  getCommunityCount,
  getMembership,
  giveConsent,
  revokeConsent,
  setMembership,
  type CommunityLevel,
} from '../../data/account'
import { LEGAL_VERSION } from '../../data/legalVersion'
import type { MarketArea } from '../../data/types'
import { beginSignIn, useAccount } from '../../state/accountSync'

/**
 * "A tua comunidade" (ADR 0025): the person's self-declared level in the area, the number of people (only from
 * 50, never invented) and the pioneer seal. Nobody is listed and nobody talks to anybody. Needs an account.
 */
export function AreaCommunity({ area }: { area: MarketArea }) {
  const { t } = useTranslation()
  const account = useAccount()
  const queryClient = useQueryClient()
  const signedIn = account.status === 'signedIn'
  const [counted, setCounted] = useState<boolean | null>(null)
  const [failed, setFailed] = useState(false)
  const count = useQuery({
    queryKey: ['community', area],
    queryFn: () => getCommunityCount(area),
    enabled: ACCOUNTS,
  })
  const mine = useQuery({
    queryKey: ['membership', area],
    queryFn: () => getMembership(area),
    enabled: signedIn,
  })
  if (!ACCOUNTS) return null

  const isCounted = counted ?? account.me?.consents.includes('community_count') ?? false
  const areaName = t(`market.area_${area}`)
  const membership = mine.data
  const level = membership?.level ?? null

  async function declare(next: CommunityLevel) {
    setFailed(false)
    try {
      queryClient.setQueryData(['membership', area], await setMembership(area, next))
    } catch {
      setFailed(true)
    }
  }

  async function toggleCount(on: boolean) {
    setFailed(false)
    try {
      if (on) await giveConsent('community_count', LEGAL_VERSION)
      else await revokeConsent('community_count')
      setCounted(on)
      await queryClient.invalidateQueries({ queryKey: ['community', area] })
    } catch {
      setFailed(true)
    }
  }

  return (
    <section aria-labelledby="area-community" className="rounded-card bg-surface p-5 shadow-card">
      <h2 id="area-community" className="text-lg font-semibold text-night">
        {t('areas.communityTitle')}
      </h2>
      <p className="mt-1 text-sm font-light text-muted">
        {count.data === null || count.data === undefined
          ? t('areas.communityBorn')
          : t('areas.communityCount', { count: count.data, area: areaName })}
      </p>

      {!signedIn ? (
        <button
          type="button"
          onClick={() => beginSignIn(`/areas/${area}`)}
          className="mt-3 text-sm font-medium text-night underline"
        >
          {t('areas.communitySignIn')}
        </button>
      ) : (
        <>
          <fieldset className="mt-4">
            <legend className="text-sm font-normal text-night">{t('areas.communityAsk')}</legend>
            <p className="text-xs font-light text-muted">{t('areas.communitySelf')}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {COMMUNITY_LEVELS.map((option) => (
                <label key={option} className="flex items-center gap-1.5 text-sm">
                  <input
                    type="radio"
                    name="community-level"
                    checked={level === option}
                    disabled={account.me?.minor === true && option !== 'student'}
                    onChange={() => void declare(option)}
                  />
                  {t(`areas.level_${option}`)}
                </label>
              ))}
            </div>
          </fieldset>

          {level !== null && (
            <label className="mt-3 flex items-start gap-2 text-sm font-light">
              <input
                type="checkbox"
                checked={isCounted}
                onChange={(event) => void toggleCount(event.target.checked)}
              />
              {t('areas.communityConsent')}
            </label>
          )}

          {typeof membership?.pioneerNumber === 'number' && (
            <p className="mt-4 inline-block rounded-full bg-night px-3 py-1 text-sm font-semibold text-white">
              {t('areas.pioneer', { number: membership.pioneerNumber, area: areaName })}
            </p>
          )}
          {failed && (
            <p role="alert" className="mt-3 text-sm text-red-700">
              {t('areas.communityError')}
            </p>
          )}
        </>
      )}
    </section>
  )
}
