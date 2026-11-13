import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Icon } from '../../components/icons'
import { Button } from '../../components/ui/Button'
import { Dialog } from '../../components/ui/Dialog'
import { CheckboxField, TextField } from '../../components/ui/Field'
import { createPublicCard, deletePublicCard, updatePublicCard } from '../../data/source'
import type { CardDetails } from '../../domain/cardStyle'
import {
  draftFromContacts,
  PUBLIC_FIELDS,
  publicCardFrom,
  publicUrl,
  type PublicDraft,
  type PublicField,
} from '../../domain/publicCard'
import { ApiError } from '../../lib/api'
import { qrModules } from '../../lib/qr'
import { userActions, useUser } from '../../state/userStore'
import { downloadQrPng } from './cardExport'
import { cvFontFamily } from './cvFonts'
import { toSquareJpeg } from './cvPdf'
import { OpsSvg } from './CvSheet'
import { qrOps } from './cardLayout'
import { Group } from './styleControls'

const PHOTO_SIZE = 240

type PublicPagePanelProps = { details: CardDetails; accent: string }

/** Off by default. Only for adults: the card page does not show this to minors at all. */
export function PublicPagePanel({ details, accent }: PublicPagePanelProps) {
  const { t } = useTranslation()
  const { publicPage, photo } = useUser()
  const saved = publicPage?.card
  const [draft, setDraft] = useState<PublicDraft>(() => ({
    ...draftFromContacts(details.name, details.headline, details.contacts),
    ...saved,
  }))
  const [chosen, setChosen] = useState<PublicField[]>(() => PUBLIC_FIELDS.filter((field) => saved?.[field]))
  const [wantsPhoto, setWantsPhoto] = useState(Boolean(saved?.photo))
  const [busy, setBusy] = useState(false)
  const [problem, setProblem] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [confirming, setConfirming] = useState(false)

  const url = publicPage ? publicUrl(publicPage.slug) : null
  const modules = useMemo(() => (url ? qrModules(url) : null), [url])

  const toggle = (field: PublicField, on: boolean) => {
    setChosen((list) => (on ? [...list, field] : list.filter((item) => item !== field)))
    // Ticking brings the card's latest details; a value already saved or typed stays.
    if (on && !saved?.[field]) {
      const latest = draftFromContacts(details.name, details.headline, details.contacts)[field]
      setDraft((current) => ({ ...current, [field]: latest || current[field] }))
    }
  }

  const run = async (work: () => Promise<void>) => {
    setBusy(true)
    setProblem(null)
    try {
      await work()
    } catch (error) {
      const invalid = error instanceof ApiError && error.status === 422
      setProblem(t(invalid ? 'cv.publicInvalid' : 'cv.publicFailed'))
    } finally {
      setBusy(false)
    }
  }

  const build = async () => {
    const card = publicCardFrom(
      draft,
      chosen.filter((field) => field !== 'photo'),
      accent,
    )
    if (!wantsPhoto) return card
    const small = photo ? await toSquareJpeg(photo, PHOTO_SIZE) : null
    return small ? { ...card, photo: small } : card
  }

  const activate = () =>
    run(async () => {
      const card = await build()
      userActions.setPublicPage({ ...(await createPublicCard(card)), card })
    })

  const save = () =>
    run(async () => {
      if (!publicPage) return
      const card = await build()
      await updatePublicCard(publicPage.slug, publicPage.secret, card)
      userActions.setPublicPage({ ...publicPage, card })
    })

  const deactivate = () =>
    run(async () => {
      if (publicPage) await deletePublicCard(publicPage.slug, publicPage.secret)
      userActions.setPublicPage(null)
      setConfirming(false)
    })

  const copy = async () => {
    if (!url) return
    await navigator.clipboard.writeText(url)
    setCopied(true)
  }

  return (
    <Group title={t('cv.publicTitle')}>
      <p className="text-sm font-light text-copy">{t('cv.publicBody')}</p>

      <TextField
        label={t('cv.name')}
        value={draft.name}
        maxLength={80}
        onChange={(event) => setDraft({ ...draft, name: event.target.value })}
      />
      {PUBLIC_FIELDS.filter((field) => field !== 'photo').map((field) => (
        <div key={field} className="space-y-2">
          <CheckboxField
            label={t(`cv.publicField_${field}`)}
            checked={chosen.includes(field)}
            onChange={(event) => toggle(field, event.target.checked)}
          />
          {chosen.includes(field) && (
            <TextField
              label={t(`cv.publicField_${field}`)}
              value={draft[field]}
              onChange={(event) => setDraft({ ...draft, [field]: event.target.value })}
            />
          )}
        </div>
      ))}
      {photo && (
        <CheckboxField
          label={t('cv.publicField_photo')}
          checked={wantsPhoto}
          onChange={(event) => setWantsPhoto(event.target.checked)}
        />
      )}

      {problem && (
        <p role="alert" className="text-sm font-medium text-coral">
          {problem}
        </p>
      )}

      {url && modules ? (
        <div className="space-y-4 rounded-2xl bg-ash-100 p-4">
          <p className="flex items-center gap-2 text-sm font-normal text-success">
            <Icon name="check" className="size-4" />
            {t('cv.publicActive')}
          </p>
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="block text-sm break-all text-blue underline"
          >
            {url}
          </a>
          <div className="w-32 bg-white p-2">
            <OpsSvg
              ops={qrOps(modules, 0, 0, modules.length)}
              width={modules.length}
              height={modules.length}
              family={cvFontFamily('arimo')}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" disabled={busy} onClick={() => void save()}>
              {t('cv.publicSave')}
            </Button>
            <Button variant="secondary" size="sm" onClick={() => void copy()}>
              {t(copied ? 'cv.publicCopied' : 'cv.publicCopy')}
            </Button>
            <Button variant="secondary" size="sm" onClick={() => void downloadQrPng(modules, draft.name)}>
              <Icon name="download" className="size-4" />
              {t('cv.publicQr')}
            </Button>
            <Button variant="danger" size="sm" onClick={() => setConfirming(true)}>
              {t('cv.publicOff')}
            </Button>
          </div>
        </div>
      ) : (
        <Button disabled={busy || !draft.name.trim()} onClick={() => void activate()}>
          {t('cv.publicOn')}
        </Button>
      )}
      <p className="text-xs font-light text-muted">{t('cv.publicNote')}</p>

      <Dialog
        open={confirming}
        onClose={() => setConfirming(false)}
        title={t('cv.publicOffTitle')}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setConfirming(false)}>
              {t('common.cancel')}
            </Button>
            <Button variant="danger" disabled={busy} onClick={() => void deactivate()}>
              {t('cv.publicOff')}
            </Button>
          </div>
        }
      >
        <p className="text-sm font-light text-copy">{t('cv.publicOffBody')}</p>
      </Dialog>
    </Group>
  )
}
