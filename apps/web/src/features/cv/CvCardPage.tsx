import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router'
import { Icon } from '../../components/icons'
import { Button, ButtonLink } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { CheckboxField, SelectField, TextAreaField, TextField } from '../../components/ui/Field'
import { PageHeader } from '../../components/ui/PageHeader'
import { Segmented } from '../../components/ui/Segmented'
import {
  CARD_MODELS,
  type CardAlign,
  type CardModel,
  type CardStyle,
  type CvDocument,
  type CvFont,
} from '../../data/types'
import { CARD_LIMITS, CARD_MAX_CONTACTS, contactLines } from '../../domain/cardStyle'
import { CV_FONTS } from '../../domain/cvStyle'
import { activeCv, userActions, useUser } from '../../state/userStore'
import { downloadCardPdf, downloadCardPng } from './cardExport'
import { CARD_HEIGHT, CARD_WIDTH, layoutCard } from './cardLayout'
import { OpsSvg } from './CvSheet'
import { PublicPagePanel } from './PublicPagePanel'
import { AccentSwatches, Color, Group, Range } from './styleControls'
import { useCardFaces } from './useCardFaces'

const SIZES = ['nameSize', 'roleSize', 'contactSize'] as const

/** The business card: starts from a CV, then changes on its own without touching the CV. */
export default function CvCardPage() {
  const { t } = useTranslation()
  const user = useUser()
  const [params] = useSearchParams()
  const [cvId, setCvId] = useState<string | null>(params.get('cv'))
  const document = user.cvs.find((item) => item.id === cvId) ?? activeCv(user)

  return (
    <div>
      <PageHeader
        tour="card"
        title={t('cv.cardTitle')}
        subtitle={t('cv.cardBody')}
        back={{ to: '/cv', label: t('cv.title') }}
      />
      {document ? (
        <>
          {user.cvs.length > 1 && (
            <Card className="mb-6 p-6">
              <SelectField
                label={t('cv.cardCv')}
                placeholder={t('cv.cardCv')}
                value={document.id}
                options={user.cvs.map((item) => ({ value: item.id, label: item.title || t('cv.mine') }))}
                onChange={(event) => setCvId(event.target.value || null)}
              />
            </Card>
          )}
          <CardEditor key={document.id} document={document} />
        </>
      ) : (
        <Card className="p-6">
          <p className="mb-4 text-sm font-light text-copy">{t('cv.cardNoCv')}</p>
          <ButtonLink to="/cv">{t('cv.title')}</ButtonLink>
        </Card>
      )}
    </div>
  )
}

function CardEditor({ document }: { document: CvDocument }) {
  const { t } = useTranslation()
  const { id, cv, card } = document
  const { minor, model, style, details, measure, placeholder, photo, qr, faces, family, source } =
    useCardFaces(document)

  const setStyle = (change: Partial<CardStyle>) => userActions.setCvCardStyle(id, change)
  const setDetails = (change: Parameters<typeof userActions.setCvCardDetails>[1]) =>
    userActions.setCvCardDetails(id, change)
  const changedDetails = Object.keys(card?.details ?? {}).length > 0
  const changedStyle = Object.keys(card?.style ?? {}).length > 0

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Always in sight: small and side by side on a phone, so each change shows at once. */}
      <div className="sticky top-0 z-10 -mx-3 min-w-0 self-start bg-paper px-3 pb-3 lg:top-6 lg:order-2 lg:mx-0 lg:bg-transparent lg:p-0">
        <div className="grid grid-cols-2 gap-2 lg:grid-cols-1 lg:gap-4">
          {(['front', 'back'] as const).map((side) => (
            <figure key={side} className="min-w-0">
              <figcaption className="mb-1 text-xs font-light text-copy">
                {t(side === 'front' ? 'cv.cardFront' : 'cv.cardBack')}
              </figcaption>
              <div className="overflow-hidden rounded-lg shadow-card">
                <OpsSvg ops={faces[side]} width={CARD_WIDTH} height={CARD_HEIGHT} family={family} />
              </div>
            </figure>
          ))}
        </div>
      </div>

      <div className="min-w-0 space-y-6 lg:order-1">
        <Group title={t('cv.cardModel')}>
          <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {CARD_MODELS.map((value) => (
              <ModelOption
                key={value}
                model={value}
                selected={value === model}
                input={{ details, style: withDefaultAlign(style, card, value), measure, placeholder, photo }}
                family={family}
                onChoose={() => userActions.setCvCardModel(id, value)}
              />
            ))}
          </ul>
        </Group>

        <Group title={t('cv.cardData')}>
          <TextField
            label={t('cv.name')}
            value={card?.details?.name ?? cv.name}
            maxLength={80}
            onChange={(event) => setDetails({ name: event.target.value })}
          />
          <TextField
            label={t('cv.headline')}
            value={card?.details?.headline ?? cv.headline}
            maxLength={120}
            onChange={(event) => setDetails({ headline: event.target.value })}
          />
          <TextAreaField
            label={t('cv.cardContacts')}
            hint={t('cv.cardContactsHint', { count: CARD_MAX_CONTACTS })}
            rows={5}
            value={card?.details?.contacts ?? contactLines(cv)}
            onChange={(event) => setDetails({ contacts: event.target.value })}
          />
          <Button
            variant="secondary"
            size="sm"
            disabled={!changedDetails}
            onClick={() => userActions.resetCvCard(id, 'details')}
          >
            <Icon name="refresh" className="size-4" />
            {t('cv.cardResetData')}
          </Button>
        </Group>

        <Group title={t('cv.cardLook')}>
          <SelectField
            label={t('cv.styleFont')}
            placeholder={t('cv.styleFont')}
            value={style.font}
            options={CV_FONTS.map((font) => ({ value: font.id, label: font.label }))}
            onChange={(event) => setStyle({ font: event.target.value as CvFont })}
          />
          <AccentSwatches value={style.accent} onChange={(accent) => setStyle({ accent })} />
          <Color
            label={t('cv.style_accent')}
            value={style.accent}
            onChange={(accent) => setStyle({ accent })}
          />
          <Color label={t('cv.style_text')} value={style.text} onChange={(text) => setStyle({ text })} />
          {SIZES.map((key) => (
            <Range
              key={key}
              label={t(`cv.card_${key}`)}
              value={style[key]}
              unit="pt"
              limits={CARD_LIMITS[key]}
              onChange={(value) => setStyle({ [key]: value })}
            />
          ))}
          <div>
            <p className="mb-2 text-sm font-light text-night">{t('cv.cardAlign')}</p>
            <Segmented<CardAlign>
              label={t('cv.cardAlign')}
              value={style.align}
              onChange={(align) => align && setStyle({ align })}
              options={[
                { value: 'left', label: t('cv.cardAlign_left') },
                { value: 'center', label: t('cv.cardAlign_center') },
              ]}
            />
          </div>
          {(model === 'foto' || model === 'arco') && (
            <CheckboxField
              label={t('cv.stylePhoto')}
              checked={style.photo}
              onChange={(event) => setStyle({ photo: event.target.checked })}
            />
          )}
          {qr && (
            <CheckboxField
              label={t('cv.cardQr')}
              checked={style.qr}
              onChange={(event) => setStyle({ qr: event.target.checked })}
            />
          )}
          <Button
            variant="secondary"
            size="sm"
            disabled={!changedStyle}
            onClick={() => userActions.resetCvCard(id, 'style')}
          >
            <Icon name="refresh" className="size-4" />
            {t('cv.cardResetLook')}
          </Button>
        </Group>

        <div className="flex flex-wrap gap-2">
          <Button size="sm" onClick={() => void downloadCardPdf(source)}>
            <Icon name="download" className="size-4" />
            {t('cv.cardPdf')}
          </Button>
          <Button variant="secondary" size="sm" onClick={() => void downloadCardPng(source, 'front')}>
            {t('cv.cardPngFront')}
          </Button>
          <Button variant="secondary" size="sm" onClick={() => void downloadCardPng(source, 'back')}>
            {t('cv.cardPngBack')}
          </Button>
        </div>
        <p className="text-xs font-light text-muted">{t('cv.cardNote')}</p>

        {!minor && <PublicPagePanel details={details} accent={style.accent} />}
      </div>
    </div>
  )
}

/** Each thumbnail shows the alignment its model would really have. */
function withDefaultAlign(style: CardStyle, card: CvDocument['card'], model: CardModel): CardStyle {
  if (card?.style?.align) return style
  return { ...style, align: model === 'cheio' || model === 'moldura' ? 'center' : 'left' }
}

type ModelOptionProps = {
  model: CardModel
  selected: boolean
  input: Omit<Parameters<typeof layoutCard>[0], 'model'>
  family: string
  onChoose: () => void
}

function ModelOption({ model, selected, input, family, onChoose }: ModelOptionProps) {
  const { t } = useTranslation()
  const { front } = useMemo(() => layoutCard({ ...input, model }), [input, model])
  return (
    <li className="min-w-0">
      <button
        type="button"
        aria-pressed={selected}
        onClick={onChoose}
        className="w-full rounded-lg border-2 border-transparent p-0.5 text-center aria-pressed:border-night"
      >
        <span aria-hidden="true" className="block overflow-hidden rounded-md border border-line">
          <OpsSvg ops={front} width={CARD_WIDTH} height={CARD_HEIGHT} family={family} />
        </span>
        <span className="mt-1 block truncate text-xs font-light text-night">
          {t(`cv.cardModel_${model}`)}
        </span>
      </button>
    </li>
  )
}
