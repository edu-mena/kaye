import { useDeferredValue, useEffect, useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Icon } from '../../components/icons'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { TextAreaField, TextField } from '../../components/ui/Field'
import { PageHeader } from '../../components/ui/PageHeader'
import { Segmented } from '../../components/ui/Segmented'
import { useCvExamples } from '../../data/queries'
import type { CvData, CvDocument, CvEntry, CvSection } from '../../data/types'
import { newEntry, parseList } from '../../domain/cv'
import { activeCv, userActions, useUser } from '../../state/userStore'
import { CvDesignPanel } from './CvDesignPanel'
import { CvFillPanel } from './CvFillPanel'
import { downloadCvPdf } from './cvPdf'
import { ScaledSheet } from './CvSheet'
import { useCvLabels } from './useCvLabels'

type EntrySection = 'experience' | 'education' | 'projects' | 'certifications'
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
  const { cv, template, style } = document
  const { photo } = useUser()
  const { data: examples = [] } = useCvExamples()
  const notes = examples.find((example) => example.id === document.basedOn)?.notes ?? {}
  const labels = useCvLabels()
  const [view, setView] = useState<'edit' | 'design' | 'preview'>('edit')
  const [fills, setFills] = useState(0)
  // Typing comes first; on slow phones the preview catches up a moment later.
  const preview = useDeferredValue(document)

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
        <span className="flex flex-col items-end gap-0.5">
          <Button size="sm" onClick={() => void downloadCvPdf({ cv, template, style, photo }, labels)}>
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
            <CvDesignPanel document={document} preview={preview} photo={photo} />
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

type EntryListProps = { section: EntrySection; entries: CvEntry[]; onChange: (entries: CvEntry[]) => void }

function EntryList({ section, entries, onChange }: EntryListProps) {
  const { t } = useTranslation()
  const update = (index: number, change: Partial<CvEntry>) =>
    onChange(entries.map((entry, position) => (position === index ? { ...entry, ...change } : entry)))

  return (
    <fieldset className="space-y-4">
      <legend className="text-base font-semibold text-night">{t(`cv.${section}`)}</legend>
      {entries.map((entry, index) => (
        <div key={entry.id} className="space-y-4 rounded-2xl border border-line p-4">
          <TextField
            label={t('cv.entryTitle')}
            value={entry.title}
            onChange={(event) => update(index, { title: event.target.value })}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              label={t('cv.entryPlace')}
              value={entry.place}
              onChange={(event) => update(index, { place: event.target.value })}
            />
            <TextField
              label={t('cv.entryPeriod')}
              value={entry.period}
              onChange={(event) => update(index, { period: event.target.value })}
            />
          </div>
          <TextAreaField
            label={t('cv.entryDescription')}
            rows={2}
            value={entry.description}
            onChange={(event) => update(index, { description: event.target.value })}
          />
          <Button
            variant="danger"
            size="sm"
            className="-ml-3"
            onClick={() => onChange(entries.filter((_, position) => position !== index))}
          >
            <Icon name="trash" className="size-4" />
            {t('cv.removeEntry')}
          </Button>
        </div>
      ))}
      <Button variant="secondary" size="sm" onClick={() => onChange([...entries, newEntry()])}>
        <Icon name="plus" className="size-4" />
        {t('cv.addEntry')}
      </Button>
    </fieldset>
  )
}

type ListFieldProps = { label: string; items: string[]; onChange: (items: string[]) => void }

/** Comma-separated list; the text is kept while typing so "React, " does not lose its comma. */
function ListField({ label, items, onChange }: ListFieldProps) {
  const { t } = useTranslation()
  const [text, setText] = useState(items.join(', '))

  return (
    <TextField
      label={label}
      hint={t('cv.listPlaceholder')}
      value={text}
      onChange={(event) => {
        setText(event.target.value)
        onChange(parseList(event.target.value))
      }}
    />
  )
}
