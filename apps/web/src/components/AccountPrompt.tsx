import { useTranslation } from 'react-i18next'
import { useLocation } from 'react-router'
import { closeAccountPrompt, useAccountPrompt } from '../state/accountGate'
import { SignInButton } from './SignInButton'
import { ButtonLink } from './ui/Button'
import { Dialog } from './ui/Dialog'

/** Opens when someone without an account saves, comments or starts the plan (state/accountGate.ts). */
export function AccountPrompt() {
  const { t } = useTranslation()
  const open = useAccountPrompt()
  const { pathname, search } = useLocation()

  return (
    <Dialog open={open} onClose={closeAccountPrompt} title={t('accountPrompt.title')}>
      <div className="space-y-4 p-5">
        <p className="text-base font-light text-copy">{t('accountPrompt.body')}</p>
        <SignInButton next={`${pathname}${search}`} size="lg" variant="primary" className="w-full">
          {t('accountPrompt.haveAccount')}
        </SignInButton>
        <ButtonLink
          to={`/entrar?next=${encodeURIComponent(`${pathname}${search}`)}`}
          size="lg"
          variant="secondary"
          className="w-full"
          onClick={closeAccountPrompt}
        >
          {t('accountPrompt.create')}
        </ButtonLink>
        <button
          type="button"
          onClick={closeAccountPrompt}
          className="w-full text-sm font-light text-muted hover:text-night"
        >
          {t('accountPrompt.later')}
        </button>
      </div>
    </Dialog>
  )
}
