import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import type { CvSection } from '../../data/types'
import type { CvLabels } from './cvLayout'

const SECTIONS: CvSection[] = [
  'summary',
  'experience',
  'education',
  'projects',
  'certifications',
  'skills',
  'languages',
  'links',
]

/** The section names in the current language, for the layout (which has no React). */
export function useCvLabels(): CvLabels {
  const { t } = useTranslation()
  return useMemo(
    () => Object.fromEntries(SECTIONS.map((section) => [section, t(`cv.${section}`)])) as CvLabels,
    [t],
  )
}
