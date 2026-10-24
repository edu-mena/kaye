import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Icon } from '../../components/icons'
import { Dialog } from '../../components/ui/Dialog'
import type { CvExample } from '../../data/types'
import { CvModelView } from './CvModelView'
import { ScaledSheet } from './CvSheet'

type ModelCvGridProps = {
  examples: CvExample[]
  /** What the blue bar says about each model: the path on a career page, the career on the CV page. */
  name: (example: CvExample) => string
}

/**
 * Model CVs as thumbnails of the real sheet, each named by a blue bar; one opens in a popup
 * (sheet, why it works, download, compare, start from it) without leaving the screen.
 */
export function ModelCvGrid({ examples, name }: ModelCvGridProps) {
  const { t } = useTranslation()
  const [openId, setOpenId] = useState<string | null>(null)
  const open = examples.find((example) => example.id === openId)

  return (
    <>
      <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {examples.map((example) => (
          <li
            key={example.id}
            className="group relative overflow-hidden rounded-xl border border-line bg-surface shadow-card transition duration-300 focus-within:-translate-y-1 focus-within:shadow-lift hover:-translate-y-1 hover:shadow-lift"
          >
            {/* The blue bar names the model; its button covers the whole card. */}
            <button
              type="button"
              onClick={() => setOpenId(example.id)}
              className="block w-full bg-blue px-2.5 py-2 text-left text-white after:absolute after:inset-0"
            >
              <span className="block truncate text-xs font-normal">{name(example)}</span>
              <span className="block truncate text-[10px] font-light text-white/80">
                {t(`cv.${example.seniority}`)} · {t(`cv.template_${example.template}`)}
              </span>
            </button>
            <div aria-hidden="true" className="relative overflow-hidden">
              <div className="origin-top transition-transform duration-500 group-focus-within:scale-[1.04] group-hover:scale-[1.04]">
                <ScaledSheet cv={example.cv} template={example.template} />
              </div>
              <span className="absolute inset-0 grid place-items-center bg-night/0 opacity-0 transition duration-300 group-focus-within:opacity-100 group-hover:bg-night/15 group-hover:opacity-100">
                <span className="grid size-8 place-items-center rounded-full bg-white text-night shadow-lift">
                  <Icon name="eye" className="size-4" />
                </span>
              </span>
            </div>
          </li>
        ))}
      </ul>
      <Dialog
        open={Boolean(open)}
        onClose={() => setOpenId(null)}
        title={open ? `${name(open)} · ${open.cv.name}` : ''}
        variant="wide"
      >
        {open && <CvModelView example={open} />}
      </Dialog>
    </>
  )
}
