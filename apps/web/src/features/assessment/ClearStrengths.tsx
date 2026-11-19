import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Icon } from '../../components/icons'
import { Button } from '../../components/ui/Button'
import { Dialog } from '../../components/ui/Dialog'
import { userActions } from '../../state/userStore'

/** "Apagar as valências", next to "Refazer o teste": part 2 only, after a confirmation. */
export function ClearStrengths({ onDark = false }: { onDark?: boolean }) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button
        variant={onDark ? 'ghost' : 'danger'}
        size="lg"
        className={onDark ? 'text-white hover:bg-white/10' : ''}
        onClick={() => setOpen(true)}
      >
        <Icon name="trash" className="size-4" />
        {t('strengths.clear')}
      </Button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title={t('strengths.clearTitle')}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                userActions.clearStrengths()
                setOpen(false)
              }}
            >
              {t('strengths.clearConfirm')}
            </Button>
          </div>
        }
      >
        <p className="text-sm font-light text-copy">{t('strengths.clearBody')}</p>
      </Dialog>
    </>
  )
}
