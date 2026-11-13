import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Icon } from '../../components/icons'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Dialog } from '../../components/ui/Dialog'
import { CheckboxField } from '../../components/ui/Field'
import type { CvDocument } from '../../data/types'
import { applyCvSuggestions, type CvSuggestion } from '../../domain/cvFill'
import { userActions } from '../../state/userStore'
import { useCvSuggestions } from './useCvSuggestions'

type CvFillDialogProps = {
  open: boolean
  onClose: () => void
  suggestions: CvSuggestion[]
  onApply: (chosen: CvSuggestion[]) => void
}

/** Each proposal with a box to tick: whatever would replace the person's own words starts unticked. */
export function CvFillDialog({ open, onClose, suggestions, onApply }: CvFillDialogProps) {
  const { t } = useTranslation()
  const [chosen, setChosen] = useState<Set<string> | null>(null)
  const ticked = chosen ?? new Set(suggestions.filter((item) => !item.replaces).map((item) => item.id))
  const selected = suggestions.filter((item) => ticked.has(item.id))

  const toggle = (id: string, on: boolean) => {
    const next = new Set(ticked)
    if (on) next.add(id)
    else next.delete(id)
    setChosen(next)
  }
  const close = () => {
    setChosen(null)
    onClose()
  }

  return (
    <Dialog
      open={open}
      onClose={close}
      title={t('cv.fillTitle')}
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={close}>
            {t('common.cancel')}
          </Button>
          <Button
            disabled={selected.length === 0}
            onClick={() => {
              onApply(selected)
              setChosen(null)
            }}
          >
            {t('cv.fillApply', { count: selected.length })}
          </Button>
        </div>
      }
    >
      <p className="mb-4 text-sm font-light text-copy">{t('cv.fillNote')}</p>
      <ul className="space-y-4">
        {suggestions.map((item) => (
          <li key={item.id}>
            <CheckboxField
              checked={ticked.has(item.id)}
              onChange={(event) => toggle(item.id, event.target.checked)}
              label={
                <>
                  <span className="block text-xs text-copy">
                    {t(`cv.${item.field}`)} · {t(`cv.fillSource_${item.source}`)}
                  </span>
                  <span className="block font-normal">{item.value}</span>
                  {item.replaces && (
                    <span className="mt-1 block text-xs text-coral">
                      {t('cv.fillReplaces', { current: item.replaces })}
                    </span>
                  )}
                </>
              }
            />
          </li>
        ))}
      </ul>
    </Dialog>
  )
}

type CvFillPanelProps = {
  document: CvDocument
  /** The fields were filled from outside: the ones that keep their own text must reload it. */
  onApplied: () => void
}

/** Proposes data the person already gave. Nothing goes in until they choose it and apply. */
export function CvFillPanel({ document, onApplied }: CvFillPanelProps) {
  const { t } = useTranslation()
  const suggestions = useCvSuggestions(document.cv, document.target)
  const [open, setOpen] = useState(false)

  if (suggestions.length === 0) return null

  return (
    <Card className="flex flex-wrap items-center gap-4 p-6">
      <div className="min-w-0 flex-1 basis-52">
        <h2 className="text-base font-semibold text-night">{t('cv.fillTitle')}</h2>
        <p className="mt-1 text-sm font-light text-copy">{t('cv.fillBody', { count: suggestions.length })}</p>
      </div>
      <Button size="sm" variant="secondary" onClick={() => setOpen(true)}>
        <Icon name="eye" className="size-4" />
        {t('cv.fillReview')}
      </Button>
      <CvFillDialog
        open={open}
        onClose={() => setOpen(false)}
        suggestions={suggestions}
        onApply={(chosen) => {
          userActions.updateCv(applyCvSuggestions(document.cv, chosen))
          onApplied()
          setOpen(false)
        }}
      />
    </Card>
  )
}
