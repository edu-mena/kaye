import { useEffect, useId, useRef, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Icon } from '../icons'

type DialogProps = {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  footer?: ReactNode
  /** "sheet": light, from the bottom on phones. "drawer": dark, from the right (the phone menu). */
  variant?: 'sheet' | 'drawer' | 'wide'
}

const VARIANTS = {
  sheet: {
    dialog:
      'mt-auto max-h-[88dvh] w-full rounded-t-card bg-surface text-ink sm:m-auto sm:max-w-lg sm:rounded-card',
    header: 'border-line',
    title: 'text-navy',
    close: 'text-navy hover:bg-ash-100',
    body: '',
  },
  // Large content, such as a CV and its explanation: almost the whole screen, the body scrolls.
  wide: {
    dialog:
      'mt-auto h-[94dvh] max-h-none w-full rounded-t-card bg-surface text-ink open:flex open:flex-col sm:m-auto sm:h-[90dvh] sm:max-w-6xl sm:rounded-card',
    header: 'border-line',
    title: 'text-night',
    close: 'text-night hover:bg-ash-100',
    body: 'min-h-0 flex-1',
  },
  drawer: {
    dialog: 'ml-auto h-dvh max-h-none w-[min(20rem,88vw)] rounded-l-card bg-coal text-white',
    header: 'border-white/10',
    title: 'text-white',
    close: 'text-white hover:bg-white/10',
    body: '',
  },
}

/**
 * Native <dialog>: the browser traps focus, closes on Esc and restores focus.
 * Shown as a bottom sheet on phones and centred on larger screens.
 */
export function Dialog({ open, onClose, title, children, footer, variant = 'sheet' }: DialogProps) {
  const { t } = useTranslation()
  const ref = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  const style = VARIANTS[variant]

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onClose={onClose}
      className={`m-0 max-w-none p-0 shadow-lift backdrop:bg-night/60 ${style.dialog}`}
    >
      <div className={`flex items-center justify-between gap-4 border-b px-6 py-4 ${style.header}`}>
        <h2 id={titleId} className={`text-lg font-semibold ${style.title}`}>
          {title}
        </h2>
        <button
          type="button"
          onClick={onClose}
          className={`grid size-9 place-items-center rounded-full ${style.close}`}
        >
          <Icon name="close" className="size-5" />
          <span className="sr-only">{t('common.close')}</span>
        </button>
      </div>
      <div className={`overflow-y-auto px-6 py-6 ${style.body}`}>{children}</div>
      {footer && <div className={`border-t px-6 py-4 ${style.header}`}>{footer}</div>}
    </dialog>
  )
}
