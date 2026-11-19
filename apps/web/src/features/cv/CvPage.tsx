import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import { QueryState } from '../../components/QueryState'
import { SectionHeading } from '../../components/ui/PageHeader'
import { Segmented } from '../../components/ui/Segmented'
import { useCareers, useCvExamples } from '../../data/queries'
import {
  GROUP_AREAS,
  MARKET_AREAS,
  type CareerSummary,
  type CvExample,
  type MarketArea,
} from '../../data/types'
import { userActions, useUser } from '../../state/userStore'
import { CvCards } from './CvCards'
import { CvGallery } from './CvGallery'
import { CvHero } from './CvHero'
import { ModelCvGrid } from './ModelCvGrid'

/** The CV studio: the CV in progress on top, every CV as a gallery, the cards, then model CVs. */
export default function CvPage() {
  const navigate = useNavigate()
  const { cvs, activeCvId } = useUser()
  const examples = useCvExamples()
  const { data: careers = [] } = useCareers()
  const current = cvs.find((document) => document.id === activeCvId) ?? cvs[0] ?? null

  const create = () => {
    userActions.createCv()
    void navigate('/cv/editar')
  }
  const edit = (id: string) => {
    userActions.openCv(id)
    void navigate('/cv/editar')
  }

  return (
    <div>
      <CvHero current={current} examples={examples.data ?? []} onCreate={create} onEdit={edit} />
      {cvs.length > 0 && (
        <>
          <CvGallery cvs={cvs} onCreate={create} onEdit={edit} />
          <CvCards cvs={cvs} />
        </>
      )}
      <QueryState query={examples}>{(list) => <Examples examples={list} careers={careers} />}</QueryState>
    </div>
  )
}

type ExamplesProps = { examples: CvExample[]; careers: CareerSummary[] }

/** Model CVs, with chips for the areas they cover. */
function Examples({ examples, careers }: ExamplesProps) {
  const { t } = useTranslation()
  const [area, setArea] = useState<MarketArea | null>(null)
  const career = (example: CvExample) => careers.find((item) => item.slug === example.careerSlug)
  const areaOf = (example: CvExample) => {
    const found = career(example)
    return found ? GROUP_AREAS[found.group] : null
  }
  const areas = MARKET_AREAS.filter((value) => examples.some((example) => areaOf(example) === value))
  const shown = area ? examples.filter((example) => areaOf(example) === area) : examples

  return (
    <section aria-labelledby="examples">
      <SectionHeading id="examples" title={t('cv.examplesTitle')} icon="eye" />
      <p className="-mt-3 mb-5 text-sm font-light text-copy">{t('cv.examplesBody')}</p>
      {areas.length > 1 && (
        <Segmented
          label={t('cv.examplesArea')}
          options={areas.map((value) => ({ value, label: t(`market.area_${value}`) }))}
          value={area}
          onChange={setArea}
          clearable
          className="mb-5"
        />
      )}
      <ModelCvGrid examples={shown} name={(example) => career(example)?.name ?? ''} />
    </section>
  )
}
