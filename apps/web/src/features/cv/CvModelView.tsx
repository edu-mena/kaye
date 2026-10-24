import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import { Icon } from '../../components/icons'
import { Button } from '../../components/ui/Button'
import { Chip } from '../../components/ui/Chip'
import { Dialog } from '../../components/ui/Dialog'
import { Segmented } from '../../components/ui/Segmented'
import { useCareer, useCvExamples } from '../../data/queries'
import type { CvExample, CvSection } from '../../data/types'
import { cvCompleteness } from '../../domain/cv'
import { userActions, useUser } from '../../state/userStore'
import { ScaledSheet } from './CvSheet'
import { downloadCvPdf } from './cvPdf'
import { useCvLabels } from './useCvLabels'

const MINE = 'mine'

/**
 * A model CV seen large: the sheet on the left, why it works on the right, and the three
 * actions (download, compare, start from it). Used in the career popup and on its own page.
 */
export function CvModelView({ example }: { example: CvExample }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const labels = useCvLabels()
  const { cv: myCv } = useUser()
  const { data: career } = useCareer(example.careerSlug)
  const { data: siblings = [] } = useCvExamples(example.careerSlug)
  const [comparing, setComparing] = useState(false)
  const [other, setOther] = useState<string | null>(null)
  const [confirming, setConfirming] = useState(false)
  const [downloading, setDownloading] = useState(false)

  const pathwayName = (id: string) => career?.pathways.find((pathway) => pathway.id === id)?.name ?? ''
  const hasMine = cvCompleteness(myCv) > 0
  const options = [
    ...siblings
      .filter((item) => item.id !== example.id)
      .map((item) => ({ value: item.id, label: pathwayName(item.pathwayId) || item.cv.headline })),
    ...(hasMine ? [{ value: MINE, label: t('cv.compareMine') }] : []),
  ]
  const otherId = other ?? options[0]?.value ?? null
  const otherExample = siblings.find((item) => item.id === otherId)
  const otherSheet =
    otherId === MINE
      ? { cv: myCv, template: example.template }
      : otherExample && { cv: otherExample.cv, template: otherExample.template }

  const start = () => {
    userActions.startCvFrom(example)
    navigate('/cv/editar')
  }

  const download = async () => {
    setDownloading(true)
    try {
      await downloadCvPdf(example.cv, example.template, labels)
    } finally {
      setDownloading(false)
    }
  }

  const notes = Object.entries(example.notes) as [CvSection, string][]

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <div className="min-w-0 rounded-2xl bg-ash-100 p-3 sm:p-5">
        {comparing && otherSheet ? (
          <div className="grid grid-cols-2 gap-3">
            <figure>
              <figcaption className="mb-2 truncate text-xs font-normal text-night">
                {example.cv.name}
              </figcaption>
              <ScaledSheet
                cv={example.cv}
                template={example.template}
                fit="content"
                className="shadow-card"
              />
            </figure>
            <figure>
              <figcaption className="mb-2 truncate text-xs font-normal text-night">
                {otherId === MINE ? t('cv.compareMine') : otherExample?.cv.name}
              </figcaption>
              <ScaledSheet
                cv={otherSheet.cv}
                template={otherSheet.template}
                fit="content"
                className="shadow-card"
              />
            </figure>
          </div>
        ) : (
          <ScaledSheet cv={example.cv} template={example.template} fit="content" className="shadow-card" />
        )}
      </div>

      <aside className="space-y-6">
        <div>
          <div className="flex flex-wrap gap-2">
            <Chip tone="night">{t(`cv.${example.seniority}`)}</Chip>
            <Chip>{t('cv.templateName', { name: t(`cv.template_${example.template}`) })}</Chip>
          </div>
          <p className="mt-3 text-lg font-bold text-night">{example.cv.headline}</p>
          <p className="mt-1 text-sm leading-relaxed font-light text-copy">{example.why}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button size="sm" onClick={download} disabled={downloading}>
            <Icon name="download" className="size-4" />
            {downloading ? t('cv.downloading') : t('cv.download')}
          </Button>
          {options.length > 0 && (
            <Button
              variant="secondary"
              size="sm"
              aria-pressed={comparing}
              onClick={() => setComparing((value) => !value)}
            >
              <Icon name="eye" className="size-4" />
              {comparing ? t('cv.compareClose') : t('cv.compare')}
            </Button>
          )}
          {/* Starting from a model replaces the current CV: ask first if there is one. */}
          <Button variant="secondary" size="sm" onClick={() => (hasMine ? setConfirming(true) : start())}>
            <Icon name="pencil" className="size-4" />
            {t('cv.useThis')}
          </Button>
        </div>
        {comparing && options.length > 0 && otherId && (
          <Segmented
            label={t('cv.compareWith')}
            value={otherId}
            onChange={(value) => value && setOther(value)}
            options={options}
          />
        )}
        <p className="-mt-3 text-xs font-light text-muted">{t('cv.useThisNote')}</p>

        {career && (
          <section aria-labelledby="cv-guide">
            <h3 id="cv-guide" className="mb-3 text-sm font-semibold text-night">
              {t('cv.guideTitle')}
            </h3>
            <ul className="space-y-2">
              {career.cvGuide.include.map((item) => (
                <li key={item} className="flex gap-2 text-sm font-light text-night">
                  <Icon name="check" className="mt-0.5 size-4 shrink-0 text-success" />
                  <span>
                    <span className="sr-only">{t('cv.guideInclude')}: </span>
                    {item}
                  </span>
                </li>
              ))}
              {career.cvGuide.avoid.map((item) => (
                <li key={item} className="flex gap-2 text-sm font-light text-night">
                  <Icon name="close" className="mt-0.5 size-4 shrink-0 text-coral" />
                  <span>
                    <span className="sr-only">{t('cv.guideAvoid')}: </span>
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {notes.length > 0 && (
          <section aria-labelledby="cv-notes">
            <h3 id="cv-notes" className="mb-3 text-sm font-semibold text-night">
              {t('cv.why')}
            </h3>
            <dl className="space-y-3">
              {notes.map(([section, note]) => (
                <div key={section}>
                  <dt className="text-sm font-normal text-night">{t(`cv.${section}`)}</dt>
                  <dd className="text-sm font-light text-copy">{note}</dd>
                </div>
              ))}
            </dl>
          </section>
        )}
      </aside>

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
        <p className="text-sm font-light text-copy">{t('cv.replaceBody')}</p>
      </Dialog>
    </div>
  )
}
