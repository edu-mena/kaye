import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router'
import { QueryState } from '../../components/QueryState'
import { ButtonLink } from '../../components/ui/Button'
import { PageHeader } from '../../components/ui/PageHeader'
import { useCvExamples } from '../../data/queries'
import { CvModelView } from './CvModelView'

export default function CvExamplePage() {
  const { t } = useTranslation()
  const { id } = useParams()
  const query = useCvExamples()

  return (
    <QueryState query={query}>
      {(examples) => {
        const example = examples.find((item) => item.id === id)
        return example ? (
          <div>
            <PageHeader
              title={example.cv.headline}
              subtitle={t(`cv.${example.seniority}`)}
              back={{ to: '/cv', label: t('cv.title') }}
            />
            <CvModelView example={example} />
          </div>
        ) : (
          <div className="py-10 text-center">
            <ButtonLink to="/cv" variant="secondary">
              {t('cv.examples')}
            </ButtonLink>
          </div>
        )
      }}
    </QueryState>
  )
}
