import { useTranslation } from 'react-i18next'
import type { CvSection } from '../../data/types'
import type { CvLabels } from './cvPdf'

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

/** The section names in the current language, for the PDF (which has no React). */
export function useCvLabels(): CvLabels {
  const { t } = useTranslation()
  return Object.fromEntries(SECTIONS.map((section) => [section, t(`cv.${section}`)])) as CvLabels
}
