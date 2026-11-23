import { memo, useId, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import type { CvArrangement, CvData, CvStyle, CvTemplate } from '../../data/types'
import { resolveCvStyle } from '../../domain/cvStyle'
import { cvFontFamily, useCvMeasure } from './cvFonts'
import { layoutCv, PAGE_HEIGHT, PAGE_WIDTH, PT_TO_MM, type CvOp, type CvPage } from './cvLayout'
import { useCvLabels } from './useCvLabels'

type SheetProps = {
  cv: CvData
  template: CvTemplate
  style?: Partial<CvStyle>
  /** Only on the person's own CVs, never on a model. */
  photo?: string | null
  arrangement?: CvArrangement
  /** A faded example in the parts still empty: it makes the sheet look full, and never reaches the PDF. */
  sample?: CvData | null
}

function usePages({ cv, template, style, photo, arrangement, sample }: SheetProps) {
  const { t } = useTranslation()
  const labels = useCvLabels()
  const resolved = useMemo(() => resolveCvStyle(template, style), [template, style])
  const measure = useCvMeasure(resolved.font)
  const placeholder = t('cv.empty')
  const pages = useMemo(
    () =>
      layoutCv({ cv, template, style: resolved, labels, measure, placeholder, photo, arrangement, sample }),
    [cv, template, resolved, labels, measure, placeholder, photo, arrangement, sample],
  )
  return { pages, family: cvFontFamily(resolved.font) }
}

function Photo({ op }: { op: Extract<CvOp, { kind: 'image' }> }) {
  const clip = useId()
  const radius = op.size / 2
  return (
    <>
      <clipPath id={clip}>
        <circle cx={op.x + radius} cy={op.y + radius} r={radius} />
      </clipPath>
      <image
        href={op.src}
        x={op.x}
        y={op.y}
        width={op.size}
        height={op.size}
        preserveAspectRatio="xMidYMid slice"
        clipPath={`url(#${clip})`}
      />
    </>
  )
}

function Op({ op }: { op: CvOp }) {
  if (op.kind === 'image') return <Photo op={op} />
  if (op.kind === 'rect')
    return (
      <rect
        x={op.x}
        y={op.y}
        width={op.width}
        height={op.height}
        rx={op.radius}
        fill={op.fill ?? 'none'}
        stroke={op.stroke}
        strokeWidth={op.stroke ? 0.2 : undefined}
      />
    )
  if (op.kind === 'line')
    return (
      <line
        x1={op.x1}
        y1={op.y1}
        x2={op.x2}
        y2={op.y2}
        stroke={op.color}
        strokeWidth={op.width}
        strokeDasharray={op.dotted ? '0.5 0.8' : undefined}
      />
    )
  return (
    <text
      x={op.x}
      y={op.y}
      fontSize={op.size * PT_TO_MM}
      fontWeight={op.bold ? 700 : 400}
      fill={op.color}
      letterSpacing={op.tracking || undefined}
    >
      {op.text}
    </text>
  )
}

type OpsSvgProps = { ops: CvPage; width: number; height: number; family: string }

/** Drawing instructions in millimetres: they scale to any width without measuring. */
export const OpsSvg = memo(function OpsSvg({ ops, width, height, family }: OpsSvgProps) {
  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      fontFamily={family}
      className="block h-auto w-full bg-white [font-kerning:none] [font-variant-ligatures:none] [text-rendering:geometricPrecision]"
    >
      {ops.map((op, index) => (
        // Drawing instructions in paint order, rebuilt whole on every change: the position is the identity.
        // oxlint-disable-next-line react/no-array-index-key
        <Op key={index} op={op} />
      ))}
    </svg>
  )
})

type ScaledSheetProps = SheetProps & {
  /** "page": the first A4 page (thumbnails). "content": every page of the CV (preview). */
  fit?: 'page' | 'content'
  className?: string
}

/** The sheet at the width it is given: a thumbnail in a grid, or the whole CV in a popup. */
export function ScaledSheet({ fit = 'page', className = '', ...sheet }: ScaledSheetProps) {
  const { pages, family } = usePages(sheet)
  const shown = fit === 'page' ? pages.slice(0, 1) : pages
  return (
    <div className={`overflow-hidden bg-white ${className}`}>
      {shown.map((page, index) => (
        // Page 1, 2, 3…: a page is its number.
        // oxlint-disable-next-line react/no-array-index-key
        <div key={index} className={index > 0 ? 'border-t-8 border-ash-200' : ''}>
          <OpsSvg ops={page} width={PAGE_WIDTH} height={PAGE_HEIGHT} family={family} />
        </div>
      ))}
    </div>
  )
}
