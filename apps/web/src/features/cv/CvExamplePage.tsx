import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router'
import { QueryState } from '../../components/QueryState'
import { Button, ButtonLink } from '../../components/ui/Button'
import { Dialog } from '../../components/ui/Dialog'
import { PageHeader } from '../../components/ui/PageHeader'
import { useCvExamples } from '../../data/queries'
import type { CvExample } from '../../data/types'
import { cvCompleteness } from '../../domain/cv'
import { userActions, useUser } from '../../state/userStore'
import { CvDocument } from './CvDocument'

export default function CvExamplePage() {
  const { t } = useTranslation()
  const { id } = useParams()
  const query = useCvExamples()

  return (
    <QueryState query={query}>
      {(examples) => {
        const example = examples.find((item) => item.id === id)
        return example ? (
          <ExampleView example={example} />
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

function ExampleView({ example }: { example: CvExample }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { cv } = useUser()
  const [confirming, setConfirming] = useState(false)

  const start = () => {
    userActions.startCvFrom(example)
    navigate('/cv/editar')
  }

  return (
    <div>
      <PageHeader
        title={example.cv.headline}
        subtitle={t(`cv.${example.seniority}`)}
        back={{ to: '/cv', label: t('cv.title') }}
      />
      <div className="mb-6 flex flex-wrap items-center gap-3">
        {/* Starting from a model replaces the current CV: ask first if there is one. */}
        <Button variant="accent" onClick={() => (cvCompleteness(cv) > 0 ? setConfirming(true) : start())}>
          {t('cv.useThis')}
        </Button>
        <span className="text-sm text-muted">{t('cv.useThisNote')}</span>
      </div>
      <CvDocument cv={example.cv} notes={example.notes} />

      <Dialog
        open={confirming}
        onClose={() => setConfirming(false)}
        title={t('cv.replaceTitle')}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setConfirming(false)}>
              {t('common.cancel')}
            </Button>
            <Button onClick={start}>{t('cv.replaceConfirm')}</Button>
          </div>
        }
      >
        <p className="text-navy">{t('cv.replaceBody')}</p>
      </Dialog>
    </div>
  )
}
