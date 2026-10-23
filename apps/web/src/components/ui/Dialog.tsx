import { useEffect, useId, useRef, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Icon } from '../icons'

type DialogProps = {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  footer?: ReactNode
}

/**
 * Native <dialog>: the browser traps focus, closes on Esc and restores focus.
 * Shown as a bottom sheet on phones and centred on larger screens.
 */
export function Dialog({ open, onClose, title, children, footer }: DialogProps) {
  const { t } = useTranslation()
  const ref = useRef<HTMLDialogElement>(null)
  const titleId = useId()

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
      className="m-0 mt-auto max-h-[88dvh] w-full max-w-none rounded-t-card bg-surface p-0 text-ink shadow-lift backdrop:bg-navy-900/50 sm:m-auto sm:max-w-lg sm:rounded-card"
    >
      <div className="flex items-center justify-between gap-4 border-b border-line px-5 py-4">
        <h2 id={titleId} className="text-lg font-semibold text-navy">
          {title}
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="grid size-9 place-items-center rounded-full text-navy hover:bg-navy-100"
        >
          <Icon name="close" className="size-5" />
          <span className="sr-only">{t('common.close')}</span>
        </button>
      </div>
      <div className="overflow-y-auto px-5 py-4">{children}</div>
      {footer && <div className="border-t border-line px-5 py-4">{footer}</div>}
    </dialog>
  )
}
