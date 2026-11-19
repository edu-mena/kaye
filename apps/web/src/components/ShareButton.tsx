import { useTranslation } from 'react-i18next'
import { Icon } from './icons'
import { Button } from './ui/Button'
import { appUrl, shareLink } from '../lib/share'

type ShareButtonProps = {
  /** Short, in the person's language; the link goes after it. */
  text: string
  /** The app's path to open ("/carreiras/medico"). */
  path: string
  /** A round icon (on a card), a labelled button, or a labelled button on a dark surface. */
  look?: 'icon' | 'button' | 'onDark'
  className?: string
}

/** "Partilhar": a page of the app, with a short text, to WhatsApp or wherever the phone sends it. */
export function ShareButton({ text, path, look = 'button', className = '' }: ShareButtonProps) {
  const { t } = useTranslation()
  const share = () => void shareLink(text, appUrl(path))
  if (look === 'icon')
    return (
      <button
        type="button"
        aria-label={t('share.label')}
        title={t('share.label')}
        onClick={share}
        className={`grid size-9 shrink-0 place-items-center rounded-full text-night hover:bg-ash-100 ${className}`}
      >
        <Icon name="share" className="size-4" />
      </button>
    )
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={share}
      className={
        look === 'onDark' ? `text-white ring-1 ring-white/40 hover:bg-white/10 ${className}` : className
      }
    >
      <Icon name="share" className="size-4" />
      {t('share.label')}
    </Button>
  )
}
