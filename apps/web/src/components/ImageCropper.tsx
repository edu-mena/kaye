import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react'
import { useTranslation } from 'react-i18next'
import {
  centredOffset,
  clampOffset,
  coverScale,
  sourceRect,
  zoomOffset,
  type Point,
  type Size,
} from '../lib/crop'
import { encodeCrop } from '../lib/encodeImage'
import { Icon } from './icons'
import { Button } from './ui/Button'
import { Dialog } from './ui/Dialog'

const MAX_ZOOM = 3
const STEP = 12

type ImageCropperProps = {
  /** The picked picture; the cropper is open while there is one. */
  file: File | null
  title: string
  /** The size the picture is saved at; its shape is the frame's shape. */
  output: Size
  /** A round mask for profile photos; the saved picture is still square. */
  round?: boolean
  onCancel: () => void
  onDone: (image: string) => void
}

/**
 * Before a picture is saved, the person places it: drag (mouse, finger or arrow keys) and zoom,
 * in a frame with the shape it will have. Only the part inside the frame is saved, small.
 */
export function ImageCropper({ file, title, onCancel, ...rest }: ImageCropperProps) {
  return (
    <Dialog open={Boolean(file)} onClose={onCancel} title={title}>
      {/* A new picture starts a new crop: no state carried over from the last one. */}
      {file && (
        <Crop
          key={`${file.name}-${file.size}-${file.lastModified}`}
          file={file}
          onCancel={onCancel}
          {...rest}
        />
      )}
    </Dialog>
  )
}

type CropProps = Omit<ImageCropperProps, 'file' | 'title'> & { file: File }

function Crop({ file, output, round = false, onCancel, onDone }: CropProps) {
  const { t } = useTranslation()
  const frameRef = useRef<HTMLButtonElement>(null)
  const drag = useRef<{ pointer: Point; offset: Point } | null>(null)
  const [url, setUrl] = useState<string | null>(null)
  const [image, setImage] = useState<Size | null>(null)
  const [frame, setFrame] = useState<Size | null>(null)
  const [zoom, setZoom] = useState(1)
  const [offset, setOffset] = useState<Point | null>(null)
  const [busy, setBusy] = useState(false)
  const [failed, setFailed] = useState(false)

  // Read as a data URL: nothing to revoke, so it survives React running effects twice in development.
  useEffect(() => {
    const reader = new FileReader()
    reader.addEventListener('load', () => setUrl(typeof reader.result === 'string' ? reader.result : null))
    reader.readAsDataURL(file)
    return () => reader.abort()
  }, [file])

  const measure = () => {
    const element = frameRef.current
    if (element) setFrame({ width: element.clientWidth, height: element.clientHeight })
  }
  // The frame can change size (rotating the phone): the scale and the drag limits follow it.
  useEffect(() => {
    const element = frameRef.current
    if (!element || typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver(() =>
      setFrame({ width: element.clientWidth, height: element.clientHeight }),
    )
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  const ready = image && frame && frame.width > 0 && frame.height > 0
  const base = ready ? coverScale(image, frame) : 1
  const scale = base * zoom
  const position = ready ? (offset ?? centredOffset(image, frame, base)) : { x: 0, y: 0 }

  const move = (next: Point) => {
    if (ready) setOffset(clampOffset(next, image, frame, scale))
  }
  const changeZoom = (next: number) => {
    if (!ready) return
    const to = base * next
    setZoom(next)
    setOffset(clampOffset(zoomOffset(position, scale, to, frame), image, frame, to))
  }

  const onPointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    event.currentTarget.setPointerCapture?.(event.pointerId)
    drag.current = { pointer: { x: event.clientX, y: event.clientY }, offset: position }
  }
  const onPointerMove = (event: PointerEvent<HTMLButtonElement>) => {
    const start = drag.current
    if (!start) return
    move({
      x: start.offset.x + event.clientX - start.pointer.x,
      y: start.offset.y + event.clientY - start.pointer.y,
    })
  }
  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const moves: Record<string, Point> = {
      ArrowLeft: { x: STEP, y: 0 },
      ArrowRight: { x: -STEP, y: 0 },
      ArrowUp: { x: 0, y: STEP },
      ArrowDown: { x: 0, y: -STEP },
    }
    const by = moves[event.key]
    if (by) {
      event.preventDefault()
      move({ x: position.x + by.x, y: position.y + by.y })
    } else if (event.key === '+' || event.key === '-') {
      event.preventDefault()
      changeZoom(Math.min(MAX_ZOOM, Math.max(1, zoom + (event.key === '+' ? 0.1 : -0.1))))
    }
  }

  const apply = async () => {
    if (!ready) return
    setBusy(true)
    setFailed(false)
    try {
      onDone(await encodeCrop(file, sourceRect(position, frame, scale), output))
    } catch {
      setFailed(true)
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      {/* The frame is the control: drag it, or focus it and use the arrows and + / −. */}
      <button
        ref={frameRef}
        type="button"
        aria-label={t('cropper.frame')}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={() => (drag.current = null)}
        onPointerCancel={() => (drag.current = null)}
        onKeyDown={onKeyDown}
        className="relative block w-full cursor-grab touch-none overflow-hidden rounded-2xl bg-coal select-none active:cursor-grabbing"
        style={{ aspectRatio: `${output.width} / ${output.height}` }}
      >
        {url && (
          <img
            src={url}
            alt=""
            draggable={false}
            onLoad={(event) => {
              setImage({ width: event.currentTarget.naturalWidth, height: event.currentTarget.naturalHeight })
              measure()
            }}
            className="absolute top-0 left-0 max-w-none"
            style={
              ready
                ? {
                    width: image.width * scale,
                    height: image.height * scale,
                    transform: `translate(${position.x}px, ${position.y}px)`,
                  }
                : { opacity: 0 }
            }
          />
        )}
        {/* What will be kept: the circle of a profile photo, thirds to help place a cover. */}
        <span
          aria-hidden="true"
          className={`pointer-events-none absolute inset-0 ${
            round
              ? 'rounded-full shadow-[0_0_0_9999px_rgb(10_10_11/0.55)] ring-2 ring-white'
              : 'ring-2 ring-white ring-inset'
          }`}
        />
        {!round && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 grid grid-cols-3 grid-rows-3"
          >
            {['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i'].map((cell) => (
              <span key={cell} className="border-[0.5px] border-white/25" />
            ))}
          </span>
        )}
      </button>

      <label className="mt-5 flex items-center gap-3">
        <Icon name="search" className="size-4 shrink-0 text-muted" />
        <span className="sr-only">{t('cropper.zoom')}</span>
        <input
          type="range"
          min={1}
          max={MAX_ZOOM}
          step={0.01}
          value={zoom}
          disabled={!ready}
          onChange={(event) => changeZoom(Number(event.target.value))}
          className="w-full accent-blue"
        />
      </label>
      <p className="mt-3 text-xs font-light text-muted">{t('cropper.hint')}</p>
      {failed && (
        <p role="alert" className="mt-3 text-sm font-normal text-coral">
          {t('cropper.failed')}
        </p>
      )}
      <div className="mt-6 flex justify-end gap-2 border-t border-line pt-4">
        <Button variant="ghost" onClick={onCancel}>
          {t('common.cancel')}
        </Button>
        <Button onClick={() => void apply()} disabled={!ready || busy}>
          <Icon name="check" className="size-4" />
          {t('cropper.apply')}
        </Button>
      </div>
    </>
  )
}
