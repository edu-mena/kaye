import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Icon } from '../../components/icons'
import { Button } from '../../components/ui/Button'
import { Dialog } from '../../components/ui/Dialog'
import { TextField } from '../../components/ui/Field'
import { SectionHeading } from '../../components/ui/PageHeader'
import { ProgressBar } from '../../components/ui/ProgressBar'
import type { CvDocument } from '../../data/types'
import { cvCompleteness } from '../../domain/cv'
import { formatPercent } from '../../domain/format'
import { userActions, useUser } from '../../state/userStore'
import { ScaledSheet } from './CvSheet'
import { CvMissing } from './CvMissing'

type CvGalleryProps = { cvs: CvDocument[]; onCreate: () => void; onEdit: (id: string) => void }

/** "Os meus CVs" as a gallery: a tile to start a new one, then each CV with its first page. */
export function CvGallery({ cvs, onCreate, onEdit }: CvGalleryProps) {
  const { t } = useTranslation()
  return (
    <section aria-labelledby="my-cvs" className="mb-12">
      <SectionHeading id="my-cvs" title={t('cv.mineList')} icon="document" />
      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <li>
          <button
            type="button"
            onClick={onCreate}
            className="flex h-full min-h-64 w-full flex-col items-center justify-center gap-3 rounded-card border-2 border-dashed border-ash-300 bg-surface/60 p-6 text-night transition hover:-translate-y-1 hover:border-blue hover:text-blue focus-visible:ring-2 focus-visible:ring-blue"
          >
            <span className="grid size-14 place-items-center rounded-full bg-blue text-white">
              <Icon name="plus" className="size-6" />
            </span>
            <span className="text-base font-bold">{t('cv.newCv')}</span>
          </button>
        </li>
        {cvs.map((document) => (
          <CvTile key={document.id} document={document} onEdit={onEdit} />
        ))}
      </ul>
    </section>
  )
}

type CvTileProps = { document: CvDocument; onEdit: (id: string) => void }

/** One CV: its first page in A4, the model, how complete it is; the rarer actions in a menu. */
function CvTile({ document, onEdit }: CvTileProps) {
  const { t } = useTranslation()
  const { photo } = useUser()
  const [dialog, setDialog] = useState<'rename' | 'delete' | null>(null)
  const [name, setName] = useState('')
  const title = document.title || t('cv.mine')
  const completeness = cvCompleteness(document.cv)

  return (
    <li className="group flex flex-col overflow-hidden rounded-card border border-line bg-surface shadow-card transition duration-300 focus-within:-translate-y-1 focus-within:shadow-lift hover:-translate-y-1 hover:shadow-lift">
      <button
        type="button"
        onClick={() => onEdit(document.id)}
        aria-label={`${t('cv.editTab')}: ${title}`}
        className="relative block bg-ash-100 px-6 pt-6 focus-visible:ring-2 focus-visible:ring-blue focus-visible:ring-inset"
      >
        <span className="block aspect-[210/297] overflow-hidden rounded-t-lg shadow-card">
          <span className="block origin-top transition-transform duration-500 group-hover:scale-[1.03]">
            <ScaledSheet cv={document.cv} template={document.template} style={document.style} photo={photo} />
          </span>
        </span>
      </button>
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-base font-bold text-night">{title}</h3>
            <p className="mt-0.5 text-xs font-light text-copy">
              {t(`cv.template_${document.template}`)} ·{' '}
              {t('cv.completeness', { value: formatPercent(completeness) })}
            </p>
          </div>
          <ActionsMenu
            label={t('cv.moreActions', { title })}
            onDuplicate={() => userActions.duplicateCv(document.id, t('cv.copyOf', { title }))}
            onRename={() => {
              setName(title)
              setDialog('rename')
            }}
            onDelete={() => setDialog('delete')}
          />
        </div>
        <ProgressBar value={completeness} label={title} className="mt-3" />
        <CvMissing cv={document.cv} className="mt-3" />
        <Button size="sm" className="mt-auto self-start" onClick={() => onEdit(document.id)}>
          <Icon name="pencil" className="size-4" />
          {t('cv.editTab')}
        </Button>
      </div>

      <Dialog
        open={dialog === 'rename'}
        onClose={() => setDialog(null)}
        title={t('cv.rename')}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setDialog(null)}>
              {t('common.cancel')}
            </Button>
            <Button
              disabled={!name.trim()}
              onClick={() => {
                userActions.renameCv(document.id, name.trim())
                setDialog(null)
              }}
            >
              {t('cv.renameSave')}
            </Button>
          </div>
        }
      >
        <TextField
          label={t('cv.renameLabel')}
          value={name}
          maxLength={60}
          onChange={(event) => setName(event.target.value)}
        />
      </Dialog>

      <Dialog
        open={dialog === 'delete'}
        onClose={() => setDialog(null)}
        title={t('cv.deleteTitle')}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setDialog(null)}>
              {t('common.cancel')}
            </Button>
            <Button variant="danger" onClick={() => userActions.deleteCv(document.id)}>
              {t('cv.delete')}
            </Button>
          </div>
        }
      >
        <p className="text-sm font-light text-copy">{t('cv.deleteBody', { title })}</p>
      </Dialog>
    </li>
  )
}

type ActionsMenuProps = { label: string; onDuplicate: () => void; onRename: () => void; onDelete: () => void }

const MENU_ITEM =
  'flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-light hover:bg-ash-100 focus-visible:bg-ash-100'

/** "⋯": duplicate, rename, delete. Closes on a choice, a click outside or Escape. */
function ActionsMenu({ label, onDuplicate, onRename, onDelete }: ActionsMenuProps) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onPointer = (event: PointerEvent) => {
      if (!ref.current?.contains(event.target as Node)) setOpen(false)
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const choose = (action: () => void) => () => {
    setOpen(false)
    action()
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label={label}
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen((value) => !value)}
        className="grid size-9 place-items-center rounded-full text-night hover:bg-ash-100 focus-visible:ring-2 focus-visible:ring-blue"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true" className="size-5 fill-current">
          <circle cx="5" cy="12" r="1.8" />
          <circle cx="12" cy="12" r="1.8" />
          <circle cx="19" cy="12" r="1.8" />
        </svg>
      </button>
      {open && (
        <ul className="absolute top-10 right-0 z-20 w-48 animate-rise rounded-2xl border border-line bg-surface p-1.5 shadow-lift">
          <li>
            <button type="button" className={`${MENU_ITEM} text-night`} onClick={choose(onDuplicate)}>
              <Icon name="document" className="size-4 text-muted" />
              {t('cv.duplicate')}
            </button>
          </li>
          <li>
            <button type="button" className={`${MENU_ITEM} text-night`} onClick={choose(onRename)}>
              <Icon name="pencil" className="size-4 text-muted" />
              {t('cv.rename')}
            </button>
          </li>
          <li>
            <button type="button" className={`${MENU_ITEM} text-coral`} onClick={choose(onDelete)}>
              <Icon name="trash" className="size-4" />
              {t('cv.delete')}
            </button>
          </li>
        </ul>
      )}
    </div>
  )
}
