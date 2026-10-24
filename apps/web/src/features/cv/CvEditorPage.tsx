import { useDeferredValue, useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Icon } from '../../components/icons'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { TextAreaField, TextField } from '../../components/ui/Field'
import { PageHeader } from '../../components/ui/PageHeader'
import { Segmented } from '../../components/ui/Segmented'
import { useCvExamples } from '../../data/queries'
import type { CvData, CvEntry, CvSection } from '../../data/types'
import { newEntry, parseList } from '../../domain/cv'
import { userActions, useUser } from '../../state/userStore'
import { downloadCvPdf } from './cvPdf'
import { ScaledSheet } from './CvSheet'
import { useCvLabels } from './useCvLabels'

type EntrySection = 'experience' | 'education' | 'projects' | 'certifications'
const ENTRY_SECTIONS: EntrySection[] = ['experience', 'education', 'projects', 'certifications']

export default function CvEditorPage() {
  const { t } = useTranslation()
  const { cv, cvBasedOn } = useUser()
  const { data: examples = [] } = useCvExamples()
  const model = examples.find((example) => example.id === cvBasedOn)
  const notes = model?.notes ?? {}
  // The layout of the model it started from; the classic one otherwise.
  const template = model?.template ?? 'classico'
  const labels = useCvLabels()
  const [view, setView] = useState<'edit' | 'preview'>('edit')
  // Typing comes first; on slow phones the preview catches up a moment later.
  const preview = useDeferredValue(cv)

  // Saved on every change: nothing to lose when the phone locks.
  const save = (change: Partial<CvData>) => userActions.updateCv({ ...cv, ...change })

  return (
    <div>
      <PageHeader title={t('cv.editorTitle')} back={{ to: '/cv', label: t('cv.title') }} />
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="inline-flex items-center gap-1 text-sm font-semibold text-success">
          <Icon name="check" className="size-4" />
          {t('cv.autosaved')}
        </p>
        <span className="flex flex-col items-end gap-0.5">
          <Button size="sm" onClick={() => void downloadCvPdf(cv, template, labels)}>
            <Icon name="download" className="size-4" />
            {t('cv.download')}
          </Button>
        </span>
      </div>
      <Segmented
        label={t('cv.preview')}
        className="mb-5 lg:hidden"
        value={view}
        onChange={(value) => value && setView(value)}
        options={[
          { value: 'edit', label: t('cv.editTab') },
          { value: 'preview', label: t('cv.preview') },
        ]}
      />

      <div className="grid gap-8 lg:grid-cols-2">
        <form
          aria-label={t('cv.editorTitle')}
          onSubmit={(event) => event.preventDefault()}
          className={`space-y-6 ${view === 'preview' ? 'hidden lg:block' : ''}`}
        >
          <Card className="space-y-4">
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
                label={t(`cv.${section}`)}
                items={cv[section]}
                onChange={(items) => save({ [section]: items })}
              />
            </EditorSection>
          ))}
        </form>

        <div className={view === 'edit' ? 'hidden lg:block' : ''}>
          <div className="lg:sticky lg:top-6">
            <h2 className="mb-3 text-lg font-semibold text-navy">{t('cv.preview')}</h2>
            <ScaledSheet
              cv={preview}
              template={template}
              fit="content"
              className="rounded-card shadow-card"
            />
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
    <Card as="section" aria-label={t(`cv.${section}`)} className="space-y-3">
      {tip && (
        <p className="rounded-xl border border-line bg-paper p-3 text-sm text-navy">
          <span className="font-bold text-gold-ink">{t('cv.tip')}: </span>
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
      <legend className="text-base font-semibold text-navy">{t(`cv.${section}`)}</legend>
      {entries.map((entry, index) => (
        <div key={entry.id} className="space-y-3 rounded-2xl border border-line p-3">
          <TextField
            label={t('cv.entryTitle')}
            value={entry.title}
            onChange={(event) => update(index, { title: event.target.value })}
          />
          <div className="grid gap-3 sm:grid-cols-2">
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
            variant="ghost"
            size="sm"
            className="-ml-3 text-coral"
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
