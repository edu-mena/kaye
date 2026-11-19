import { useTranslation } from 'react-i18next'
import { Icon } from './icons'
import { Button } from './ui/Button'

type SaveBookmarkProps = {
  saved: boolean
  onToggle: () => void
  /** The card's accessible name ("Guardar X"). */
  label: string
  /** A round icon on a card; a labelled button on the page. */
  compact?: boolean
}

/** The bookmark of an academy or a company: saved on this device, for Perfil → Guardados and the list's filter. */
export function SaveBookmark({ saved, onToggle, label, compact = false }: SaveBookmarkProps) {
  const { t } = useTranslation()
  if (compact)
    return (
      <button
        type="button"
        aria-pressed={saved}
        aria-label={label}
        onClick={onToggle}
        className="grid size-9 place-items-center rounded-full bg-coal/85 text-white backdrop-blur-sm hover:bg-coal"
      >
        <Icon name="bookmark" className={`size-4 ${saved ? 'fill-white' : ''}`} />
      </button>
    )
  return (
    <Button
      variant="ghost"
      size="sm"
      aria-pressed={saved}
      onClick={onToggle}
      className="text-white ring-1 ring-white/40 hover:bg-white/10"
    >
      <Icon name="bookmark" className={`size-4 ${saved ? 'fill-white' : ''}`} />
      {saved ? t('career.saved') : t('career.save')}
    </Button>
  )
}
