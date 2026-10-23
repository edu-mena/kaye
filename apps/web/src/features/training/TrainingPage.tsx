import { useTranslation } from 'react-i18next'
import { PagePlaceholder } from '../../components/PagePlaceholder'

export default function TrainingPage() {
  const { t } = useTranslation()

  return <PagePlaceholder title={t('training.title')} body={t('training.body')} />
}
