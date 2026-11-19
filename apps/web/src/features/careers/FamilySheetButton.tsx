import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Icon } from '../../components/icons'
import { Button } from '../../components/ui/Button'
import type { Career } from '../../data/types'
import { shareFamilySheet } from './familySheet'
import { useFamilySheet, type FamilySheetOptions } from './useFamilySheet'

/** "PDF": one A4 page about a career, built on the phone (ADR 0006), to send or print. */
export function FamilyPdfButton({
  career,
  options,
  withFit = false,
  label,
  variant = 'secondary',
  className = '',
}: {
  career: Career
  options: FamilySheetOptions
  withFit?: boolean
  label?: string
  variant?: 'primary' | 'secondary' | 'ghost'
  className?: string
}) {
  const { t } = useTranslation()
  const [busy, setBusy] = useState(false)
  const { build, canIncludeFit } = useFamilySheet(career, options)

  const create = async () => {
    setBusy(true)
    try {
      await shareFamilySheet(build(canIncludeFit && withFit), career.slug)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Button variant={variant} onClick={() => void create()} disabled={busy} className={className}>
      <Icon name="document" className="size-4" />
      {busy ? t('familySheet.creating') : (label ?? t('familySheet.pdf'))}
    </Button>
  )
}
