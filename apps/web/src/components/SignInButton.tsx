import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { ACCOUNTS } from '../data/account'
import { beginSignIn } from '../state/accountSync'
import { Button, ButtonLink } from './ui/Button'

type Props = {
  /** Where the person lands after Google: this very page by default. */
  next?: string
  size?: 'xs' | 'sm' | 'md' | 'lg'
  variant?: 'primary' | 'secondary' | 'ghost' | 'onDark'
  className?: string
  children?: ReactNode
}

/**
 * "Entrar": someone who already has an account goes straight to Google and skips the onboarding; their profile
 * comes back with the account. In the build without accounts (the demo site) it opens the onboarding instead.
 */
export function SignInButton({ next = '/', size = 'sm', variant = 'secondary', className, children }: Props) {
  const { t } = useTranslation()
  const label = children ?? t('landing.signIn')

  return ACCOUNTS ? (
    <Button size={size} variant={variant} className={className} onClick={() => beginSignIn(next)}>
      {label}
    </Button>
  ) : (
    <ButtonLink to="/entrar" size={size} variant={variant} className={className}>
      {label}
    </ButtonLink>
  )
}
