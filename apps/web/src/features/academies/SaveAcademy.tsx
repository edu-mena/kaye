import { useTranslation } from 'react-i18next'
import { SaveBookmark } from '../../components/SaveBookmark'
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
  return (
    <SaveBookmark
      saved={savedAcademies.includes(id)}
      onToggle={() => userActions.toggleSavedAcademy(id)}
      label={t('academies.saveNamed', { name })}
      compact={compact}
    />
  )
}
