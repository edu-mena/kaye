import { useTranslation } from 'react-i18next'
import { Icon } from '../../components/icons'
import { Button } from '../../components/ui/Button'
import { CheckboxField, SelectField } from '../../components/ui/Field'
import { Segmented } from '../../components/ui/Segmented'
import type { CvBox, CvData, CvDocument, CvFont, CvSeparator, CvStyle } from '../../data/types'
import {
  CV_BOXES,
  CV_FONTS,
  CV_LIMITS,
  CV_PHOTO_TEMPLATES,
  CV_SEPARATORS,
  CV_TEMPLATES,
  resolveCvStyle,
} from '../../domain/cvStyle'
import { userActions } from '../../state/userStore'
import { CvAdvicePanel } from './CvAdvicePanel'
import { CvArrangePanel } from './CvArrangePanel'
import { ScaledSheet } from './CvSheet'
import { AccentSwatches, Color, Group, Range } from './styleControls'

type RangeKey = keyof typeof CV_LIMITS

const GROUPS: { title: 'styleMargins' | 'styleSizes' | 'styleSpacing'; unit: string; keys: RangeKey[] }[] = [
  { title: 'styleMargins', unit: 'mm', keys: ['marginX', 'marginY'] },
  { title: 'styleSizes', unit: 'pt', keys: ['nameSize', 'headingSize', 'bodySize'] },
  { title: 'styleSpacing', unit: 'mm', keys: ['lineHeight', 'headingGap', 'entryGap', 'sectionGap'] },
]

const change = (value: Partial<CvStyle>) => userActions.setCvStyle(value)

/** Template and look of the open CV. The limits live in the domain, so the PDF obeys them too. */
type CvDesignPanelProps = {
  document: CvDocument
  /** The same CV a moment behind, so the thumbnails never slow the controls down. */
  preview: CvDocument
  photo: string | null
  /** A model CV that fills, faded, what is still empty. */
  sample?: CvData | null
}

export function CvDesignPanel({ document, preview, photo, sample }: CvDesignPanelProps) {
  const { t } = useTranslation()
  const style = resolveCvStyle(document.template, document.style)

  return (
    <div className="space-y-6">
      <CvAdvicePanel document={document} preview={preview} photo={photo} />

      <Group title={t('cv.styleTemplate')}>
        {/* Changing the template keeps the content and what the person already adjusted. */}
        <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {CV_TEMPLATES.map((template) => (
            <li key={template}>
              <button
                type="button"
                aria-pressed={document.template === template}
                onClick={() => userActions.setCvTemplate(template)}
                className="w-full rounded-lg border-2 border-transparent p-0.5 text-center aria-pressed:border-night"
              >
                <span aria-hidden="true" className="block overflow-hidden rounded-md border border-line">
                  <ScaledSheet
                    cv={preview.cv}
                    template={template}
                    style={preview.style}
                    photo={photo}
                    arrangement={preview.arrangement}
                    sample={sample}
                  />
                </span>
                <span className="mt-1 block truncate text-xs font-light text-night">
                  {t(`cv.template_${template}`)}
                </span>
              </button>
            </li>
          ))}
        </ul>
        {CV_PHOTO_TEMPLATES.includes(document.template) && (
          <div>
            <CheckboxField
              label={t('cv.stylePhoto')}
              checked={style.photo}
              onChange={(event) => change({ photo: event.target.checked })}
            />
            <p className="mt-1 text-xs font-light text-muted">
              {t(photo ? 'cv.stylePhotoHint' : 'cv.stylePhotoNone')}
            </p>
          </div>
        )}
        <SelectField
          label={t('cv.styleFont')}
          placeholder={t('cv.styleFont')}
          value={style.font}
          options={CV_FONTS.map((font) => ({ value: font.id, label: font.label }))}
          onChange={(event) => change({ font: event.target.value as CvFont })}
        />
      </Group>

      <Group title={t('cv.arrangeTitle')}>
        <CvArrangePanel document={document} />
      </Group>

      {GROUPS.map((group) => (
        <Group key={group.title} title={t(`cv.${group.title}`)}>
          {group.keys.map((key) => (
            <Range
              key={key}
              label={t(`cv.style_${key}`)}
              value={style[key]}
              unit={key === 'lineHeight' ? '×' : group.unit}
              limits={CV_LIMITS[key]}
              onChange={(value) => change({ [key]: value })}
            />
          ))}
        </Group>
      ))}

      <Group title={t('cv.styleColors')}>
        <AccentSwatches value={style.accent} onChange={(accent) => change({ accent })} />
        <Color label={t('cv.style_accent')} value={style.accent} onChange={(accent) => change({ accent })} />
        <Color label={t('cv.style_text')} value={style.text} onChange={(text) => change({ text })} />
        <Color label={t('cv.style_muted')} value={style.muted} onChange={(muted) => change({ muted })} />
      </Group>

      <Group title={t('cv.styleBoxes')}>
        <div>
          <p className="mb-2 text-sm font-light text-night">{t('cv.styleBox')}</p>
          <Segmented<CvBox>
            label={t('cv.styleBox')}
            value={style.box}
            onChange={(box) => box && change({ box })}
            options={CV_BOXES.map((value) => ({ value, label: t(`cv.box_${value}`) }))}
          />
        </div>
        <div>
          <p className="mb-2 text-sm font-light text-night">{t('cv.styleSeparator')}</p>
          <Segmented<CvSeparator>
            label={t('cv.styleSeparator')}
            value={style.separator}
            onChange={(separator) => separator && change({ separator })}
            options={CV_SEPARATORS.map((value) => ({ value, label: t(`cv.separator_${value}`) }))}
          />
        </div>
      </Group>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="min-w-0 flex-1 basis-48 text-xs font-light text-muted">{t('cv.styleNote')}</p>
        <Button
          variant="secondary"
          size="sm"
          disabled={Object.keys(document.style).length === 0}
          onClick={userActions.resetCvStyle}
        >
          <Icon name="refresh" className="size-4" />
          {t('cv.styleReset')}
        </Button>
      </div>
    </div>
  )
}
