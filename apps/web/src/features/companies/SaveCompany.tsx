import { useTranslation } from 'react-i18next'
import { SaveBookmark } from '../../components/SaveBookmark'
import { needsAccount } from '../../state/accountGate'
import { userActions, useUser } from '../../state/userStore'

type SaveCompanyProps = { id: string; name: string; compact?: boolean }

/** The bookmark: saves the company on this device; its news then counts as "Para ti" and reaches Notificações. */
export function SaveCompany({ id, name, compact = false }: SaveCompanyProps) {
  const { t } = useTranslation()
  const { savedCompanies } = useUser()
  return (
    <SaveBookmark
      saved={savedCompanies.includes(id)}
      onToggle={needsAccount(() => userActions.toggleSavedCompany(id))}
      label={t('companies.saveNamed', { name })}
      compact={compact}
    />
  )
}
