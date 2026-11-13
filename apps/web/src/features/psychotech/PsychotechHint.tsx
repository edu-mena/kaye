import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { Icon } from '../../components/icons'

/** One line on Bolsas and the Mercado's public competitions, pointing to the practice. */
export function PsychotechHint({ className = '' }: { className?: string }) {
  const { t } = useTranslation()
  return (
    <Link
      to="/treino"
      className={`flex items-center gap-2 rounded-2xl bg-ash-100 px-4 py-3 text-sm font-light text-copy hover:bg-ash-200 ${className}`}
    >
      <Icon name="brain" className="size-4 shrink-0 text-night" />
      <span className="flex-1">{t('psychotech.hint')}</span>
      <Icon name="chevronRight" className="size-4 shrink-0 text-muted" />
    </Link>
  )
}
