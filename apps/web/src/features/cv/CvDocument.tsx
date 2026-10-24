import { memo, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Icon } from '../../components/icons'
import type { CvData, CvEntry, CvSection } from '../../data/types'

type CvDocumentProps = {
  cv: CvData
  /** "Porque funciona", beside each section of a model CV. */
  notes?: Partial<Record<CvSection, string>>
}

const NO_NOTES: Partial<Record<CvSection, string>> = {}

/**
 * One CV layout for the model CVs and the editor preview. The server PDF
 * (docs/arquitetura.md, 5.5) will use the same structure. Memoized so the
 * editor can render it from a deferred copy of the CV (see CvEditorPage).
 */
export const CvDocument = memo(function CvDocument({ cv, notes = NO_NOTES }: CvDocumentProps) {
  const { t } = useTranslation()
  const empty = <span className="text-muted italic">{t('cv.empty')}</span>

  const section = (key: CvSection, content: ReactNode) => (
    <section aria-label={t(`cv.${key}`)} className="grid gap-3 md:grid-cols-[minmax(0,1fr)_14rem]">
      <div>
        <h3 className="mb-2 border-b border-line pb-1 text-sm font-bold tracking-wide text-navy uppercase">
          {t(`cv.${key}`)}
        </h3>
        {content}
      </div>
      {notes[key] && (
        <aside className="h-fit rounded-xl border border-line bg-paper p-3 text-sm text-navy">
          <p className="mb-1 flex items-center gap-1 text-xs font-bold text-gold-ink">
            <Icon name="info" className="size-4" />
            {t('cv.why')}
          </p>
          {notes[key]}
        </aside>
      )}
    </section>
  )

  const entries = (list: CvEntry[]) =>
    list.length === 0 ? (
      empty
    ) : (
      <ul className="space-y-3">
        {list.map((entry) => (
          <li key={entry.id}>
            <p className="font-semibold text-navy">{entry.title || empty}</p>
            <p className="text-sm text-muted">{[entry.place, entry.period].filter(Boolean).join(' · ')}</p>
            {entry.description && <p className="mt-1 text-sm text-navy">{entry.description}</p>}
          </li>
        ))}
      </ul>
    )

  const tags = (list: string[]) =>
    list.length === 0 ? (
      empty
    ) : (
      <ul className="flex flex-wrap gap-1.5">
        {list.map((item) => (
          <li key={item} className="rounded-md bg-navy-100 px-2 py-0.5 text-sm text-navy">
            {item}
          </li>
        ))}
      </ul>
    )

  return (
    <div className="space-y-6 rounded-card bg-surface p-5 shadow-card sm:p-8">
      <header className="border-b-4 border-navy pb-4">
        <p className="font-display text-2xl font-bold text-navy">{cv.name || empty}</p>
        <p className="font-semibold text-navy">{cv.headline || empty}</p>
        <p className="mt-1 text-sm text-muted">{cv.contact}</p>
      </header>
      {section('summary', cv.summary ? <p className="text-navy">{cv.summary}</p> : empty)}
      {section('experience', entries(cv.experience))}
      {section('education', entries(cv.education))}
      {section('projects', entries(cv.projects))}
      {section('skills', tags(cv.skills))}
      {section('languages', tags(cv.languages))}
    </div>
  )
})
