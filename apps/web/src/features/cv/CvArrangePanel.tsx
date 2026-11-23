import { useTranslation } from 'react-i18next'
import { Icon } from '../../components/icons'
import { Button } from '../../components/ui/Button'
import { Segmented } from '../../components/ui/Segmented'
import { Switch } from '../../components/ui/Switch'
import type { CvDocument, CvFormat, CvSection } from '../../data/types'
import {
  ALL_SECTIONS,
  effectiveFormat,
  fixedSections,
  formatOptions,
  linksInHeader,
  moveSection,
  placeSection,
  resolveSections,
  SIDE_SECTIONS,
  SIDE_TEMPLATES,
  setFormat,
  toggleHidden,
} from '../../domain/cvArrange'
import { userActions } from '../../state/userStore'

type RowProps = { document: CvDocument; section: CvSection; position: number; count: number }

function SectionRow({ document, section, position, count }: RowProps) {
  const { t } = useTranslation()
  const { template, arrangement = {} } = document
  const { side } = resolveSections(template, arrangement)
  const hidden = (arrangement.hidden ?? []).includes(section)
  const inSide = side.includes(section)
  const fixed = fixedSections(template).includes(section)
  const options = hidden ? [] : formatOptions(section, inSide)
  const format = effectiveFormat(template, section, inSide, arrangement)
  const name = t(`cv.${section}`)
  const apply = userActions.setCvArrangement

  return (
    <li className="space-y-3 rounded-2xl border border-line p-4">
      <div className="flex items-center gap-2">
        <span
          className={`min-w-0 flex-1 text-base ${hidden ? 'font-light text-muted' : 'font-semibold text-night'}`}
        >
          {name}
        </span>
        {!hidden && !fixed && (
          <>
            <Button
              size="xs"
              variant="ghost"
              aria-label={t('cv.arrangeUp', { name })}
              disabled={position === 0}
              onClick={() => apply(moveSection(template, arrangement, section, -1))}
            >
              <span aria-hidden="true">↑</span>
            </Button>
            <Button
              size="xs"
              variant="ghost"
              aria-label={t('cv.arrangeDown', { name })}
              disabled={position === count - 1}
              onClick={() => apply(moveSection(template, arrangement, section, 1))}
            >
              <span aria-hidden="true">↓</span>
            </Button>
          </>
        )}
        <Switch
          checked={!hidden}
          label={t('cv.arrangeShow', { name })}
          onChange={(show) => apply(toggleHidden(arrangement, section, !show))}
        />
      </div>

      {SIDE_TEMPLATES.includes(template) && !hidden && SIDE_SECTIONS.includes(section) && (
        <Segmented<'main' | 'side'>
          wrap
          label={t('cv.arrangeWhere', { name })}
          value={inSide ? 'side' : 'main'}
          onChange={(to) => to && apply(placeSection(template, arrangement, section, to))}
          options={[
            { value: 'main', label: t('cv.arrangeMain') },
            { value: 'side', label: t('cv.arrangeSide') },
          ]}
        />
      )}

      {options.length > 1 && (
        <Segmented<CvFormat>
          wrap
          label={t('cv.arrangeFormat', { name })}
          value={format}
          onChange={(next) => next && apply(setFormat(arrangement, section, next))}
          options={options.map((value) => ({ value, label: t(`cv.format_${value}`) }))}
        />
      )}
      {section === 'links' && linksInHeader(template) && !hidden && (
        <p className="text-xs font-light text-muted">{t('cv.arrangeHeaderLinks')}</p>
      )}
    </li>
  )
}

/** Where each section goes and how it is written. The model gives the start; every change is the person's. */
export function CvArrangePanel({ document }: { document: CvDocument }) {
  const { t } = useTranslation()
  const { template, arrangement = {} } = document
  const flow = resolveSections(template, arrangement)
  const shown = [...flow.main, ...flow.side]
  // The ones taken out stay at the end, so they can come back.
  const gone = ALL_SECTIONS.filter((section) => !shown.includes(section))
  const full = arrangement.sample !== false
  const pinned = fixedSections(template).filter(
    (section) => shown.includes(section) || gone.includes(section),
  )
  const columnOf = (section: CvSection) => (flow.side.includes(section) ? flow.side : flow.main)

  return (
    <div className="space-y-4">
      <p className="text-sm font-light text-copy">{t('cv.arrangeBody')}</p>
      <label className="flex items-center justify-between gap-4 rounded-2xl bg-ash-100 p-4 text-sm font-light text-night">
        <span>
          <span className="block font-semibold">{t('cv.sampleTitle')}</span>
          {t('cv.sampleBody')}
        </span>
        <Switch
          checked={full}
          label={t('cv.sampleTitle')}
          onChange={(on) => userActions.setCvArrangement({ ...arrangement, sample: on })}
        />
      </label>

      <ul aria-label={t('cv.arrangeTitle')} className="space-y-3">
        {[...shown, ...gone].map((section) => (
          <SectionRow
            key={section}
            document={document}
            section={section}
            position={columnOf(section).indexOf(section)}
            count={columnOf(section).length}
          />
        ))}
      </ul>
      {pinned.length > 0 && <p className="text-xs font-light text-muted">{t('cv.arrangePinned')}</p>}
      <Button
        variant="secondary"
        size="sm"
        disabled={Object.keys(arrangement).length === 0}
        onClick={() => userActions.setCvArrangement({})}
      >
        <Icon name="refresh" className="size-4" />
        {t('cv.arrangeReset')}
      </Button>
    </div>
  )
}
