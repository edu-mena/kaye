import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Icon, type IconName } from '../../components/icons'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { TextAreaField, TextField } from '../../components/ui/Field'

const EMAIL = 'e.mena.baptista@gmail.com'
const WHATSAPP = '244927450909'
const PHONE_SHOWN = '+244 927 450 909'
const PORTFOLIO = 'eduardomena.vercel.app'

const LINKS = [
  { id: 'portfolio', icon: 'globe', href: `https://${PORTFOLIO}`, shown: PORTFOLIO },
  { id: 'whatsapp', icon: 'message', href: `https://wa.me/${WHATSAPP}`, shown: PHONE_SHOWN },
  { id: 'email', icon: 'document', href: `mailto:${EMAIL}`, shown: EMAIL },
] as const satisfies readonly { id: string; icon: IconName; href: string; shown: string }[]

/**
 * Who builds the Kayé and how to reach him. The site keeps nothing: the message is handed to the
 * visitor's own WhatsApp or email, already written, and it is sent from there.
 */
export function ContactSection() {
  const { t } = useTranslation()
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')
  const [missing, setMissing] = useState(false)

  const written = () => {
    const text = message.trim()
    setMissing(!text)
    if (!text) return null
    return encodeURIComponent(name.trim() ? `${text}\n\n${name.trim()}` : text)
  }

  const sendWhatsApp = () => {
    const text = written()
    if (text) window.open(`https://wa.me/${WHATSAPP}?text=${text}`, '_blank', 'noopener')
  }

  const sendEmail = () => {
    const text = written()
    if (text) {
      const subject = encodeURIComponent(t('landing.contactSubject'))
      window.location.assign(`mailto:${EMAIL}?subject=${subject}&body=${text}`)
    }
  }

  return (
    <section
      id="contacto"
      className="mx-auto grid max-w-5xl gap-10 px-4 py-20 lg:grid-cols-2 lg:gap-16 lg:py-28"
    >
      <div>
        <p className="text-sm font-light text-muted">{t('landing.developerRole')}</p>
        <h2 className="mt-1 text-3xl font-extrabold text-night sm:text-4xl">Eduardo Mena Baptista</h2>
        <p className="mt-4 text-lg font-light text-copy">{t('landing.builtBy')}</p>
        <p className="mt-2 text-lg font-light text-copy">{t('landing.developerText')}</p>
        <p className="mt-4 text-base font-normal text-night">{t('landing.partnerships')}</p>
        <ul className="mt-8 space-y-4">
          {LINKS.map((link) => (
            <li key={link.id}>
              <a
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex max-w-full items-center gap-3 text-night"
              >
                <span className="grid size-11 shrink-0 place-items-center rounded-full border border-line bg-surface">
                  <Icon name={link.icon} className="size-5" />
                </span>
                <span className="min-w-0">
                  <span className="block text-xs font-light text-muted">{t(`landing.link_${link.id}`)}</span>
                  <span className="block truncate text-sm font-normal group-hover:text-blue">
                    {link.shown}
                  </span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>

      <Card as="section" aria-label={t('landing.contactTitle')}>
        <h3 className="text-xl font-extrabold text-night">{t('landing.contactTitle')}</h3>
        <div className="mt-6 space-y-4">
          <TextField
            label={t('landing.contactName')}
            value={name}
            maxLength={80}
            autoComplete="off"
            onChange={(event) => setName(event.target.value)}
          />
          <TextAreaField
            label={t('landing.contactMessage')}
            value={message}
            maxLength={1500}
            error={missing ? t('landing.contactMissing') : null}
            onChange={(event) => {
              setMessage(event.target.value)
              setMissing(false)
            }}
          />
        </div>
        <div className="mt-6 grid gap-2 sm:grid-cols-2">
          <Button onClick={sendWhatsApp}>{t('landing.sendWhatsapp')}</Button>
          <Button variant="secondary" onClick={sendEmail}>
            {t('landing.sendEmail')}
          </Button>
        </div>
        <p className="mt-4 text-xs font-light text-muted">{t('landing.contactNote')}</p>
      </Card>
    </section>
  )
}
