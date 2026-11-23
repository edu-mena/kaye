import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Icon } from '../../components/icons'
import { Button } from '../../components/ui/Button'
import { TextAreaField, TextField } from '../../components/ui/Field'
import type { CvEntry } from '../../data/types'
import { newEntry, parseList } from '../../domain/cv'

export type EntrySection = 'experience' | 'education' | 'projects' | 'certifications'

type EntryListProps = { section: EntrySection; entries: CvEntry[]; onChange: (entries: CvEntry[]) => void }

export function EntryList({ section, entries, onChange }: EntryListProps) {
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
export function ListField({ label, items, onChange }: ListFieldProps) {
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
