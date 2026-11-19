import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Icon } from '../../components/icons'
import { Button } from '../../components/ui/Button'
import { TextAreaField } from '../../components/ui/Field'
import { Segmented } from '../../components/ui/Segmented'
import { sendFeedback, whatsappLink, type FeedbackKind } from '../../data/waitlist'
import { Honeypot } from './Honeypot'

const KINDS: FeedbackKind[] = ['critique', 'idea', 'bug']

type Status = 'idle' | 'sending' | 'done' | 'failed'

/** Critiques, ideas and bugs, straight to the Kayé team. Used on the landing page and in Suporte. */
export function FeedbackForm({ page }: { page: 'landing' | 'support' }) {
  const { t } = useTranslation()
  const [kind, setKind] = useState<FeedbackKind>('idea')
  const [message, setMessage] = useState('')
  const [website, setWebsite] = useState('')
  const [missing, setMissing] = useState(false)
  const [status, setStatus] = useState<Status>('idle')

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (message.trim().length < 3) {
      setMissing(true)
      return
    }
    setStatus('sending')
    try {
      await sendFeedback({ kind, message: message.trim(), page, website })
      setStatus('done')
      setMessage('')
    } catch {
      setStatus('failed')
    }
  }

  if (status === 'done') {
    return (
      <output className="block space-y-3">
        <span className="flex items-start gap-3 rounded-xl bg-ash-100 p-4 text-sm text-night">
          <Icon name="check" className="mt-0.5 size-5 shrink-0 text-blue" />
          {t('prelaunch.feedbackDone')}
        </span>
        <Button variant="secondary" size="sm" onClick={() => setStatus('idle')}>
          {t('prelaunch.feedbackAnother')}
        </Button>
      </output>
    )
  }

  const fallback = whatsappLink(`[${t(`prelaunch.feedbackKind_${kind}`)}] ${message.trim()}`)

  return (
    <form noValidate onSubmit={(event) => void submit(event)} className="relative space-y-4">
      <Segmented
        label={t('prelaunch.feedbackKind')}
        options={KINDS.map((value) => ({ value, label: t(`prelaunch.feedbackKind_${value}`) }))}
        value={kind}
        onChange={(value) => {
          if (value) setKind(value)
        }}
      />
      <TextAreaField
        label={t('prelaunch.feedbackMessage')}
        value={message}
        maxLength={2000}
        error={missing ? t('prelaunch.feedbackMissing') : null}
        onChange={(event) => {
          setMessage(event.target.value)
          setMissing(false)
        }}
      />
      <Honeypot value={website} onChange={setWebsite} />
      <Button type="submit" className="w-full sm:w-auto" disabled={status === 'sending'}>
        {t(status === 'sending' ? 'prelaunch.sending' : 'prelaunch.feedbackSend')}
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
  )
}
