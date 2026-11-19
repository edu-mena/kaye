import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Switch } from '../../components/ui/Switch'
import { getPushKey, giveConsent, revokeConsent, type Me, type NoticeConsent } from '../../data/account'
import { LEGAL_VERSION } from '../../data/legalVersion'
import { pushSupported, subscribePush, unsubscribePush } from '../../lib/webPush'
import { useAccount } from '../../state/accountSync'

// "Avisos" in the settings (docs/seguranca.md): one switch per channel and purpose, each one a consent on the
// server. The news is hidden from minors (the server refuses it too). The browser's permission is asked only
// after the person turns a push switch on; where Web Push does not work (the Android app, iOS outside the
// installed app) the push switches are not shown.

type Channel = 'email' | 'push'
type Purpose = 'service' | 'marketing'
type Problem = 'denied' | 'failed' | null

const kindOf = (channel: Channel, purpose: Purpose) => `${channel}_${purpose}` as NoticeConsent
const hasPush = (active: Set<string>) => active.has('push_service') || active.has('push_marketing')

export function NoticePreferences() {
  const { t } = useTranslation()
  const { status, me } = useAccount()
  if (status !== 'signedIn' || !me) {
    return <p className="px-4 py-3 text-sm font-light text-muted">{t('notices.signIn')}</p>
  }
  return <Preferences me={me} />
}

/** The public VAPID key, only where push can work; null hides the push switches. */
function usePushKey(): string | null {
  const supported = pushSupported()
  const { data } = useQuery({
    queryKey: ['push-key'],
    queryFn: getPushKey,
    enabled: supported,
    staleTime: Infinity,
  })
  return supported ? (data ?? null) : null
}

function Preferences({ me }: { me: Me }) {
  const { t } = useTranslation()
  const [active, setActive] = useState(() => new Set<string>(me.consents))
  const [busy, setBusy] = useState(false)
  const [problem, setProblem] = useState<Problem>(null)
  const pushKey = usePushKey()
  const channels: Channel[] = pushKey ? ['email', 'push'] : ['email']
  const purposes: Purpose[] = me.minor ? ['service'] : ['service', 'marketing']

  async function turnOn(channel: Channel, kind: NoticeConsent): Promise<Problem> {
    await giveConsent(kind, LEGAL_VERSION)
    if (channel === 'push' && pushKey && !hasPush(active)) {
      // The first push switch: now, after the tap, the browser may ask.
      const answer = await subscribePush(pushKey).catch(() => 'failed' as const)
      if (answer !== 'granted') {
        await revokeConsent(kind).catch(() => {})
        return answer
      }
    }
    setActive((current) => new Set(current).add(kind))
    return null
  }

  async function turnOff(channel: Channel, kind: NoticeConsent) {
    await revokeConsent(kind)
    const next = new Set(active)
    next.delete(kind)
    // The server drops the subscriptions with the last push consent; the browser's goes too.
    if (channel === 'push' && !hasPush(next)) await unsubscribePush().catch(() => {})
    setActive(next)
  }

  async function change(channel: Channel, purpose: Purpose, on: boolean) {
    const kind = kindOf(channel, purpose)
    setBusy(true)
    setProblem(null)
    try {
      if (on) setProblem(await turnOn(channel, kind))
      else await turnOff(channel, kind)
    } catch {
      setProblem('failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      {channels.flatMap((channel) =>
        purposes.map((purpose) => {
          const label = t(`notices.${channel}_${purpose}`)
          return (
            <div key={`${channel}-${purpose}`} className="flex items-center justify-between gap-4 px-4 py-3">
              <p className="min-w-0 text-sm text-night">{label}</p>
              <Switch
                checked={active.has(kindOf(channel, purpose))}
                label={label}
                disabled={busy}
                onChange={(on) => void change(channel, purpose, on)}
              />
            </div>
          )
        }),
      )}
      <div className="space-y-1 px-4 py-3 text-xs font-light text-muted">
        <p>{t(me.minor ? 'notices.minorNote' : 'notices.note')}</p>
        {problem && (
          <p role="alert" className="text-sm text-coral">
            {t(problem === 'denied' ? 'notices.denied' : 'notices.failed')}
          </p>
        )}
      </div>
    </>
  )
}
