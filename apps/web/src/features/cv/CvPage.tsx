import { useTranslation } from 'react-i18next'
import { PagePlaceholder } from '../../components/PagePlaceholder'

export default function CvPage() {
  const { t } = useTranslation()

  return <PagePlaceholder title={t('cv.title')} body={t('cv.body')} />
}
