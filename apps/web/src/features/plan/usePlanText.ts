import { useTranslation } from 'react-i18next'
import type { PlanText } from '../../domain/plan'

/** A plan step's text: a catalogue name as is, otherwise its translation. */
export function usePlanText() {
  const { t } = useTranslation()
  return (text: PlanText) =>
    text.key === 'name' ? String(text.values?.name ?? '') : t(text.key as 'plan.title', text.values)
}
