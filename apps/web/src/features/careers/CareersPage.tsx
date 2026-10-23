import { useTranslation } from 'react-i18next'
import { PagePlaceholder } from '../../components/PagePlaceholder'

export default function ExplorePage() {
  const { t } = useTranslation()

  return <PagePlaceholder title={t('explore.title')} body={t('explore.body')} />
}
