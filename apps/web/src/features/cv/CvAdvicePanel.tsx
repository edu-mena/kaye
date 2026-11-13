import { useTranslation } from 'react-i18next'
import { Icon } from '../../components/icons'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Chip } from '../../components/ui/Chip'
import { SelectField } from '../../components/ui/Field'
import { Segmented } from '../../components/ui/Segmented'
import { useCareer, useCareers } from '../../data/queries'
import {
  CV_DESTINATIONS,
  GROUP_AREAS,
  MARKET_AREAS,
  type CvDestination,
  type CvDocument,
  type MarketArea,
} from '../../data/types'
import { cvAdvice } from '../../domain/cvAdvice'
import { userActions, useUser } from '../../state/userStore'
import { CvGuideList } from './CvGuideList'
import { ScaledSheet } from './CvSheet'

type CvAdvicePanelProps = { document: CvDocument; preview: CvDocument; photo: string | null }

/** Where the CV is going and what we would do: advice only, nothing changes until accepted. */
export function CvAdvicePanel({ document, preview, photo }: CvAdvicePanelProps) {
  const { t } = useTranslation()
  const { targetCareer } = useUser()
  const { data: careers = [] } = useCareers()
  const { target } = document

  // Until the person chooses, start from the career they said they are aiming at.
  const aimed = careers.find((career) => career.slug === targetCareer)
  const careerSlug = target ? target.career : (aimed?.slug ?? null)
  const career = careers.find((item) => item.slug === careerSlug) ?? null
  const area = target ? target.area : aimed ? GROUP_AREAS[aimed.group] : null
  const destination = target?.destination ?? null
  const { data: details } = useCareer(career?.slug ?? '')

  const choose = (change: Partial<NonNullable<CvDocument['target']>>) =>
    userActions.setCvTarget({ area, career: career?.slug ?? null, destination, ...change })

  const options = careers
    .filter((item) => GROUP_AREAS[item.group] === area)
    .map((item) => ({ value: item.slug, label: item.name }))
  const advice = area && cvAdvice(area, career, destination)
  const using = advice?.template === document.template

  return (
    <Card as="section" aria-labelledby="cv-advice" className="space-y-4 p-6">
      <div>
        <h3 id="cv-advice" className="text-base font-semibold text-night">
          {t('cv.adviceTitle')}
        </h3>
        <p className="mt-1 text-sm font-light text-copy">{t('cv.adviceBody')}</p>
      </div>

      <SelectField
        label={t('cv.adviceArea')}
        placeholder={t('cv.adviceAreaPick')}
        value={area ?? ''}
        options={MARKET_AREAS.map((value) => ({ value, label: t(`market.area_${value}`) }))}
        onChange={(event) => choose({ area: (event.target.value as MarketArea) || null, career: null })}
      />
      {area && (
        <SelectField
          label={t('cv.adviceCareer')}
          placeholder={t('cv.adviceCareerAny')}
          value={career?.slug ?? ''}
          options={options}
          onChange={(event) => choose({ career: event.target.value || null })}
        />
      )}
      <div>
        <p className="mb-2 text-sm font-light text-night">{t('cv.adviceDestination')}</p>
        <Segmented<CvDestination>
          clearable
          label={t('cv.adviceDestination')}
          value={destination}
          onChange={(value) => choose({ destination: value })}
          options={CV_DESTINATIONS.map((value) => ({ value, label: t(`cv.destination_${value}`) }))}
        />
      </div>

      {advice && area && (
        <>
          <dl className="space-y-3 rounded-2xl bg-ash-100 p-4 text-sm">
            <div>
              <dt className="font-normal text-night">{t('cv.adviceStructure')}</dt>
              <dd className="font-light text-copy">{t(`cv.structure_${advice.structure}`)}</dd>
            </div>
            <div>
              <dt className="font-normal text-night">{t('cv.adviceColour')}</dt>
              <dd className="font-light text-copy">{t(`cv.colour_${advice.colour}`)}</dd>
            </div>
            <div>
              <dt className="font-normal text-night">{t('cv.advicePhoto')}</dt>
              <dd className="font-light text-copy">{t(`cv.photo_${advice.photo}`)}</dd>
            </div>
            <div>
              <dt className="font-normal text-night">{t('cv.adviceLength')}</dt>
              <dd className="font-light text-copy">{t(`cv.length_${advice.length}`)}</dd>
            </div>
            <div>
              <dt className="font-normal text-night">{t('cv.adviceFocus')}</dt>
              <dd className="font-light text-copy">{t(`cv.focus_${area}`)}</dd>
            </div>
            {destination && (
              <div>
                <dt className="font-normal text-night">{t(`cv.destination_${destination}`)}</dt>
                <dd className="font-light text-copy">{t(`cv.note_${destination}`)}</dd>
              </div>
            )}
          </dl>

          {details && <CvGuideList guide={details.cvGuide} />}

          <div className="flex items-center gap-4">
            <span aria-hidden="true" className="w-20 shrink-0 overflow-hidden rounded-md border border-line">
              <ScaledSheet cv={preview.cv} template={advice.template} style={preview.style} photo={photo} />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-light text-copy">{t('cv.adviceModel')}</p>
              <p className="mb-2 font-semibold text-night">{t(`cv.template_${advice.template}`)}</p>
              {using ? (
                <Chip>{t('cv.adviceUsing')}</Chip>
              ) : (
                <Button size="sm" onClick={() => userActions.setCvTemplate(advice.template)}>
                  <Icon name="check" className="size-4" />
                  {t('cv.adviceUse')}
                </Button>
              )}
            </div>
          </div>
          <p className="text-xs font-light text-muted">{t('cv.adviceNote')}</p>
        </>
      )}
    </Card>
  )
}
