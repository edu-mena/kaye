import { useTranslation } from 'react-i18next'
import { Icon } from '../../components/icons'
import { Button } from '../../components/ui/Button'
import { userActions, useUser } from '../../state/userStore'

type SaveAcademyProps = {
  id: string
  name: string
  /** A round icon on a card; a labelled button on the page. */ compact?: boolean
}

/** The bookmark: saves the academy on this device, for Perfil → Guardados and the list's "Guardadas". */
export function SaveAcademy({ id, name, compact = false }: SaveAcademyProps) {
  const { t } = useTranslation()
  const { savedAcademies } = useUser()
  const saved = savedAcademies.includes(id)
  const toggle = () => userActions.toggleSavedAcademy(id)
  if (compact)
    return (
      <button
        type="button"
        aria-pressed={saved}
        aria-label={t('academies.saveNamed', { name })}
        onClick={toggle}
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
      onClick={toggle}
      className="text-white ring-1 ring-white/40 hover:bg-white/10"
    >
      <Icon name="bookmark" className={`size-4 ${saved ? 'fill-white' : ''}`} />
      {saved ? t('career.saved') : t('career.save')}
    </Button>
  )
}
