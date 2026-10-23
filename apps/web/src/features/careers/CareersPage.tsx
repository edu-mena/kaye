import { useTranslation } from 'react-i18next'
import { PagePlaceholder } from '../../components/PagePlaceholder'

export default function CareersPage() {
  const { t } = useTranslation()

  return <PagePlaceholder title={t('careers.title')} body={t('careers.body')} />
}
