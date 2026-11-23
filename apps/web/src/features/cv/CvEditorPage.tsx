import { useDeferredValue, useEffect, useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Icon } from '../../components/icons'
import { Button, ButtonLink } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { TextAreaField, TextField } from '../../components/ui/Field'
import { PageHeader } from '../../components/ui/PageHeader'
import { Segmented } from '../../components/ui/Segmented'
import { useCvExamples } from '../../data/queries'
import type { CvData, CvDocument, CvSection } from '../../data/types'
import { activeCv, userActions, useUser } from '../../state/userStore'
import { CvDesignPanel } from './CvDesignPanel'
import { CvFillPanel } from './CvFillPanel'
import { EntryList, ListField, type EntrySection } from './cvFields'
import { downloadCvPdf } from './cvPdf'
import { ScaledSheet } from './CvSheet'
import { useCareerTips } from './useCareerTips'
import { useCvLabels } from './useCvLabels'

const ENTRY_SECTIONS: EntrySection[] = ['experience', 'education', 'projects', 'certifications']

export default function CvEditorPage() {
  const document = activeCv(useUser())

  useEffect(() => {
    if (!document) userActions.ensureCv()
  }, [document])

  // The key gives each CV fresh fields: the lists keep their text while typing.
  return document && <Editor key={document.id} document={document} />
}

function Editor({ document }: { document: CvDocument }) {
  const { t } = useTranslation()
  const { cv, template, style, arrangement } = document
  const { photo } = useUser()
  const { data: examples = [] } = useCvExamples()
  const notes = examples.find((example) => example.id === document.basedOn)?.notes ?? {}
  const labels = useCvLabels()
  const [view, setView] = useState<'edit' | 'design' | 'preview'>('edit')
  const [fills, setFills] = useState(0)
  // Typing comes first; on slow phones the preview catches up a moment later.
  const preview = useDeferredValue(document)
  const { sample } = useCareerTips(cv, document.target)

  // Saved on every change: nothing to lose when the phone locks.
  const save = (change: Partial<CvData>) => userActions.updateCv({ ...cv, ...change })

  return (
    <div>
      <PageHeader title={document.title || t('cv.editorTitle')} back={{ to: '/cv', label: t('cv.title') }} />
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <p className="inline-flex items-center gap-2 text-sm font-normal text-success">
          <Icon name="check" className="size-4" />
          {t('cv.autosaved')}
        </p>
        <span className="flex flex-wrap items-center justify-end gap-2">
          <ButtonLink to="/cv/passo-a-passo" size="sm" variant="secondary">
            {t('cv.wizTitle')}
          </ButtonLink>
          <Button
            size="sm"
            onClick={() => void downloadCvPdf({ cv, template, style, photo, arrangement }, labels)}
          >
            <Icon name="download" className="size-4" />
            {t('cv.download')}
          </Button>
        </span>
      </div>
      {/* On a wide screen the preview is always there, so it needs no tab. */}
      <Segmented
        label={t('cv.preview')}
        className="mb-6 lg:hidden"
        value={view}
        onChange={(value) => value && setView(value)}
        options={[
          { value: 'edit', label: t('cv.editTab') },
          { value: 'design', label: t('cv.designTab') },
          { value: 'preview', label: t('cv.preview') },
        ]}
      />
      <Segmented
        label={t('cv.designTab')}
        className="mb-6 hidden lg:flex"
        value={view === 'design' ? 'design' : 'edit'}
        onChange={(value) => value && setView(value)}
        options={[
          { value: 'edit', label: t('cv.editTab') },
          { value: 'design', label: t('cv.designTab') },
        ]}
      />

      <div className="grid gap-8 lg:grid-cols-2">
        {view === 'design' ? (
          <div className="order-2 min-w-0 lg:order-1">
            <CvDesignPanel document={document} preview={preview} photo={photo} sample={sample} />
          </div>
        ) : (
          <form
            aria-label={t('cv.editorTitle')}
            onSubmit={(event) => event.preventDefault()}
            className={`min-w-0 space-y-6 ${view === 'preview' ? 'hidden lg:block' : ''}`}
          >
            <CvFillPanel document={document} onApplied={() => setFills((count) => count + 1)} />

            <Card className="space-y-4 p-6">
              <TextField
                label={t('cv.name')}
                value={cv.name}
                onChange={(event) => save({ name: event.target.value })}
              />
              <TextField
                label={t('cv.headline')}
                placeholder={t('cv.headlinePlaceholder')}
                value={cv.headline}
                onChange={(event) => save({ headline: event.target.value })}
              />
              <TextField
                label={t('cv.contact')}
                placeholder={t('cv.contactPlaceholder')}
                value={cv.contact}
                onChange={(event) => save({ contact: event.target.value })}
              />
            </Card>

            <EditorSection section="summary" tip={notes.summary}>
              <TextAreaField
                label={t('cv.summary')}
                placeholder={t('cv.summaryPlaceholder')}
                value={cv.summary}
                onChange={(event) => save({ summary: event.target.value })}
              />
            </EditorSection>

            {ENTRY_SECTIONS.map((section) => (
              <EditorSection key={section} section={section} tip={notes[section]}>
                <EntryList
                  section={section}
                  entries={cv[section]}
                  onChange={(entries) => save({ [section]: entries })}
                />
              </EditorSection>
            ))}

            {(['skills', 'languages', 'links'] as const).map((section) => (
              <EditorSection key={section} section={section} tip={notes[section]}>
                <ListField
                  key={fills}
                  label={t(`cv.${section}`)}
                  items={cv[section]}
                  onChange={(items) => save({ [section]: items })}
                />
              </EditorSection>
            ))}
          </form>
        )}

        {/* While changing the design on a phone, a band with a small preview shows the effect. */}
        <div
          className={
            view === 'edit'
              ? 'hidden lg:block'
              : view === 'design'
                ? 'sticky top-0 z-10 order-1 -mx-3 min-w-0 bg-paper px-3 pb-3 lg:static lg:order-2 lg:mx-0 lg:bg-transparent lg:p-0'
                : 'min-w-0'
          }
        >
          <div className="lg:sticky lg:top-6 lg:max-h-[calc(100dvh-3rem)] lg:overflow-y-auto">
            <h2 className="mb-4 hidden text-base font-semibold text-night lg:block">{t('cv.preview')}</h2>
            <div
              className={
                view === 'design'
                  ? 'mx-auto h-48 w-32 overflow-hidden rounded-lg shadow-card lg:h-auto lg:w-full lg:rounded-none lg:shadow-none'
                  : ''
              }
            >
              <ScaledSheet
                cv={preview.cv}
                template={preview.template}
                style={preview.style}
                photo={photo}
                arrangement={preview.arrangement}
                sample={sample}
                fit="content"
                className="rounded-card shadow-card"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function EditorSection({
  section,
  tip,
  children,
}: {
  section: CvSection
  tip?: string
  children: ReactNode
}) {
  const { t } = useTranslation()
  return (
    <Card as="section" aria-label={t(`cv.${section}`)} className="space-y-4 p-6">
      {tip && (
        <p className="rounded-2xl bg-ash-100 p-4 text-sm font-light text-copy">
          <span className="font-semibold text-night">{t('cv.tip')}: </span>
          {tip}
        </p>
      )}
      {children}
    </Card>
  )
}
