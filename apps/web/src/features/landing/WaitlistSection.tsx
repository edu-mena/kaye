import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Icon } from '../../components/icons'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { CheckboxField, TextField } from '../../components/ui/Field'
import { contactProblems, hasJoined, joinWaitlist, markJoined, whatsappLink } from '../../data/waitlist'
import { Honeypot } from './Honeypot'

type Status = 'idle' | 'sending' | 'done' | 'already' | 'failed'
type Errors = { contact?: string; email?: string; whatsapp?: string; consent?: string }

type WaitlistCopy = { title: string; text: string; consent: string; done: string; already: string }

/**
 * The waiting list: an email or a WhatsApp number, and we tell them when it opens. On the landing page it is the
 * launch list; on /plus (`source="plus"`, with its own `copy`) it is the Kayé Plus list.
 */
export function WaitlistSection({
  source = 'landing',
  copy,
  embedded = false,
}: {
  source?: 'landing' | 'plus'
  copy?: WaitlistCopy
  /** Inside another page: no section margins of its own. */
  embedded?: boolean
}) {
  const { t } = useTranslation()
  const text: WaitlistCopy = copy ?? {
    title: t('prelaunch.waitlistTitle'),
    text: t('prelaunch.waitlistText'),
    consent: t('prelaunch.waitlistConsent'),
    done: t('prelaunch.waitlistDone'),
    already: t('prelaunch.waitlistAlready'),
  }
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [consent, setConsent] = useState(false)
  const [website, setWebsite] = useState('')
  const [errors, setErrors] = useState<Errors>({})
  const [status, setStatus] = useState<Status>(() => (hasJoined(source) ? 'already' : 'idle'))

  const check = (): Errors => {
    const found: Errors = {}
    const problems = contactProblems(email, whatsapp)
    if (problems.missing) found.contact = t('prelaunch.waitlistNeedContact')
    if (problems.email) found.email = t('prelaunch.waitlistBadEmail')
    if (problems.whatsapp) found.whatsapp = t('prelaunch.waitlistBadPhone')
    if (!consent) found.consent = t('prelaunch.waitlistNeedConsent')
    return found
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    const found = check()
    setErrors(found)
    if (Object.keys(found).length > 0) return
    setStatus('sending')
    try {
      const answer = await joinWaitlist({
        name: name.trim(),
        email: email.trim(),
        whatsapp,
        consent,
        website,
        source,
      })
      markJoined(source)
      setStatus(answer.already ? 'already' : 'done')
    } catch {
      setStatus('failed')
    }
  }

  const fallback = whatsappLink(
    t('prelaunch.waitlistWhatsappText', {
      name: name.trim() || '-',
      email: email.trim() || '-',
      whatsapp: whatsapp.trim() || '-',
    }),
  )

  const finished = status === 'done' || status === 'already'

  return (
    <section id="lista-de-espera" className={embedded ? '' : 'mx-auto max-w-2xl px-4 py-16 lg:py-24'}>
      <Card as="section" aria-labelledby="waitlist-title" className="relative">
        <span className="grid size-11 place-items-center rounded-full bg-coal text-gold">
          <Icon name="bell" className="size-5" />
        </span>
        <h2 id="waitlist-title" className="mt-4 text-2xl font-extrabold text-night sm:text-3xl">
          {text.title}
        </h2>
        <p className="mt-2 text-base font-light text-copy">{text.text}</p>

        {finished ? (
          <output className="mt-6 flex items-start gap-3 rounded-xl bg-ash-100 p-4 text-base text-night">
            <Icon name="check" className="mt-0.5 size-5 shrink-0 text-blue" />
            {status === 'done' ? text.done : text.already}
          </output>
        ) : (
          <form noValidate onSubmit={(event) => void submit(event)} className="mt-6 space-y-4">
            <TextField
              label={t('prelaunch.waitlistName')}
              value={name}
              maxLength={80}
              autoComplete="given-name"
              onChange={(event) => setName(event.target.value)}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField
                label={t('prelaunch.waitlistEmail')}
                type="email"
                inputMode="email"
                value={email}
                maxLength={120}
                autoComplete="email"
                error={errors.email}
                onChange={(event) => setEmail(event.target.value)}
              />
              <TextField
                label={t('prelaunch.waitlistWhatsapp')}
                type="tel"
                inputMode="tel"
                placeholder="+244 9XX XXX XXX"
                value={whatsapp}
                maxLength={30}
                autoComplete="tel"
                error={errors.whatsapp}
                onChange={(event) => setWhatsapp(event.target.value)}
              />
            </div>
            <p
              role={errors.contact ? 'alert' : undefined}
              className={`text-sm ${errors.contact ? 'font-medium text-coral' : 'font-light text-muted'}`}
            >
              {errors.contact ?? t('prelaunch.waitlistOneOf')}
            </p>
            <CheckboxField
              label={text.consent}
              checked={consent}
              error={errors.consent}
              onChange={(event) => setConsent(event.target.checked)}
            />
            <Honeypot value={website} onChange={setWebsite} />
            <Button type="submit" size="lg" className="w-full" disabled={status === 'sending'}>
              {t(status === 'sending' ? 'prelaunch.sending' : 'prelaunch.waitlistJoin')}
            </Button>
            {status === 'failed' && (
              <div role="alert" className="rounded-xl bg-ash-100 p-4 text-sm text-night">
                <p>{t('prelaunch.failed')}</p>
                <a
                  href={fallback}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center gap-2 font-semibold text-blue"
                >
                  <Icon name="message" className="size-4" />
                  {t('prelaunch.failedWhatsapp')}
                </a>
              </div>
            )}
          </form>
        )}
      </Card>
    </section>
  )
}
