import { useTranslation } from 'react-i18next'
import { PagePlaceholder } from '../../components/PagePlaceholder'

export default function JobsPage() {
  const { t } = useTranslation()

  return <PagePlaceholder title={t('jobs.title')} body={t('jobs.body')} />
}
