import { memo, useEffect, useRef, useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import type { CvData, CvEntry, CvSection, CvTemplate } from '../../data/types'

/** An A4 page at 96 dpi. The PDF (cvPdf.ts) draws the same layouts in millimetres. */
const SHEET_WIDTH = 794
const SHEET_HEIGHT = 1123

// Helvetica, like the PDF, so what you see is what you download.
const SHEET_FONT = { fontFamily: 'Helvetica, Arial, sans-serif' }

const MAIN: CvSection[] = ['summary', 'experience', 'projects', 'education', 'certifications']

type SheetProps = { cv: CvData; template: CvTemplate }

function hasContent(cv: CvData, section: CvSection): boolean {
  const value = cv[section]
  return typeof value === 'string' ? value.trim() !== '' : value.length > 0
}

function Entries({ list, muted }: { list: CvEntry[]; muted: string }) {
  return (
    <ul className="space-y-[10px]">
      {list.map((entry) => (
        <li key={entry.id}>
          <p className="font-bold">{entry.title}</p>
          <p className={muted}>{[entry.place, entry.period].filter(Boolean).join(' · ')}</p>
          {entry.description && <p className="mt-[2px]">{entry.description}</p>}
        </li>
      ))}
    </ul>
  )
}

function Content({ cv, section, muted }: { cv: CvData; section: CvSection; muted: string }) {
  const value = cv[section]
  if (typeof value === 'string') return <p>{value}</p>
  if (section === 'skills' || section === 'languages' || section === 'links')
    return <p>{(value as string[]).join(', ')}</p>
  return <Entries list={value as CvEntry[]} muted={muted} />
}

function useEmpty() {
  const { t } = useTranslation()
  return <span className="text-[#9a9a9a] italic">{t('cv.empty')}</span>
}

/** One column, centred header, ruled sections: the Harvard style. */
function Classico({ cv }: { cv: CvData }) {
  const { t } = useTranslation()
  const empty = useEmpty()
  const sections: CvSection[] = [...MAIN, 'skills', 'languages']
  return (
    <div className="px-[64px] py-[56px] text-[12.5px] leading-[1.45] text-[#1a1a1a]">
      <header className="border-b border-[#cfcfcf] pb-[14px] text-center">
        <p className="text-[26px] leading-tight font-bold">{cv.name || empty}</p>
        <p className="mt-[2px] text-[14px]">{cv.headline || empty}</p>
        <p className="mt-[6px] text-[11.5px] text-[#555]">
          {[cv.contact, ...cv.links].filter(Boolean).join(' · ')}
        </p>
      </header>
      {sections
        .filter((section) => hasContent(cv, section))
        .map((section) => (
          <section key={section} className="mt-[18px]">
            <h3 className="mb-[6px] border-b border-[#cfcfcf] pb-[3px] text-[11.5px] font-bold tracking-[0.12em] uppercase">
              {t(`cv.${section}`)}
            </h3>
            <Content cv={cv} section={section} muted="text-[#555]" />
          </section>
        ))}
    </div>
  )
}

/** Two columns: contact and skills in a dark band, the story on the right. */
function Moderno({ cv }: { cv: CvData }) {
  const { t } = useTranslation()
  const empty = useEmpty()
  const side: CvSection[] = ['links', 'skills', 'languages', 'certifications']
  return (
    <div className="grid min-h-[1123px] grid-cols-[250px_1fr] text-[12px] leading-[1.45]">
      <aside className="bg-[#1c2433] px-[28px] py-[48px] text-white">
        <p className="text-[22px] leading-tight font-bold">{cv.name || empty}</p>
        <p className="mt-[4px] text-[13px] text-[#d2d6de]">{cv.headline || empty}</p>
        {cv.contact && (
          <ul className="mt-[18px] space-y-[2px] text-[11px] text-[#d2d6de]">
            {cv.contact.split(' · ').map((part) => (
              <li key={part}>{part}</li>
            ))}
          </ul>
        )}
        {side
          .filter((section) => hasContent(cv, section))
          .map((section) => (
            <section key={section} className="mt-[22px]">
              <h3 className="mb-[6px] text-[10.5px] font-bold tracking-[0.14em] text-[#9fb0c8] uppercase">
                {t(`cv.${section}`)}
              </h3>
              <ul className="space-y-[3px]">
                {section === 'certifications'
                  ? cv.certifications.map((entry) => <li key={entry.id}>{entry.title}</li>)
                  : (cv[section] as string[]).map((item) => <li key={item}>{item}</li>)}
              </ul>
            </section>
          ))}
      </aside>
      <div className="px-[36px] py-[48px] text-[#1a1a1a]">
        {MAIN.filter((section) => section !== 'certifications' && hasContent(cv, section)).map((section) => (
          <section key={section} className="mb-[20px]">
            <h3 className="mb-[6px] text-[12px] font-bold tracking-[0.12em] text-[#1c2433] uppercase">
              {t(`cv.${section}`)}
            </h3>
            <Content cv={cv} section={section} muted="text-[#555]" />
          </section>
        ))}
      </div>
    </div>
  )
}

/** Labels on the left, content on the right, thin rules: the Europass style. */
function Europeu({ cv }: { cv: CvData }) {
  const { t } = useTranslation()
  const empty = useEmpty()
  const sections: CvSection[] = [...MAIN, 'skills', 'languages', 'links']
  const row = 'grid grid-cols-[170px_1fr] gap-[22px]'
  const label = 'text-right text-[11px] font-bold tracking-[0.08em] text-[#1f4e8c] uppercase'
  return (
    <div className="px-[56px] py-[52px] text-[12px] leading-[1.45] text-[#1a1a1a]">
      <header className={`${row} pb-[18px]`}>
        <p className={`${label} pt-[10px]`}>Curriculum vitae</p>
        <div>
          <p className="text-[24px] leading-tight font-bold">{cv.name || empty}</p>
          <p className="mt-[2px] text-[13.5px]">{cv.headline || empty}</p>
          <p className="mt-[6px] text-[11.5px] text-[#555]">{cv.contact}</p>
        </div>
      </header>
      {sections
        .filter((section) => hasContent(cv, section))
        .map((section) => (
          <section key={section} className={`${row} border-t border-[#e3e3e3] py-[10px]`}>
            <h3 className={label}>{t(`cv.${section}`)}</h3>
            <Content cv={cv} section={section} muted="text-[#555]" />
          </section>
        ))}
    </div>
  )
}

const LAYOUTS: Record<CvTemplate, (props: { cv: CvData }) => ReactNode> = {
  classico: Classico,
  moderno: Moderno,
  europeu: Europeu,
}

/** The CV as an A4 sheet, in one of the known layouts. Memoized for the editor's deferred preview. */
const CvSheet = memo(function CvSheet({ cv, template }: SheetProps) {
  const Layout = LAYOUTS[template]
  return (
    <div className="min-h-[1123px] w-[794px] bg-white" style={SHEET_FONT}>
      <Layout cv={cv} />
    </div>
  )
})

type ScaledSheetProps = SheetProps & {
  /** "page": one A4 page, cut (thumbnails). "content": as tall as the CV (preview). */
  fit?: 'page' | 'content'
  className?: string
}

/** The sheet scaled to the width it is given: a thumbnail in a grid, or the whole CV in a popup. */
export function ScaledSheet({ cv, template, fit = 'page', className = '' }: ScaledSheetProps) {
  const boxRef = useRef<HTMLDivElement>(null)
  const sheetRef = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ scale: 0.25, height: SHEET_HEIGHT })

  useEffect(() => {
    const box = boxRef.current
    const sheet = sheetRef.current
    if (!box || !sheet || typeof ResizeObserver === 'undefined') return
    const measure = () => setSize({ scale: box.clientWidth / SHEET_WIDTH, height: sheet.offsetHeight })
    const observer = new ResizeObserver(measure)
    observer.observe(box)
    observer.observe(sheet)
    return () => observer.disconnect()
  }, [])

  const height = (fit === 'page' ? SHEET_HEIGHT : size.height) * size.scale
  return (
    <div ref={boxRef} className={`relative overflow-hidden bg-white ${className}`} style={{ height }}>
      <div
        ref={sheetRef}
        className="absolute top-0 left-0 origin-top-left"
        style={{ transform: `scale(${size.scale})` }}
      >
        <CvSheet cv={cv} template={template} />
      </div>
    </div>
  )
}
