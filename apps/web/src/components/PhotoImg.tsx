import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { Photo } from '../data/types'
import { useDataSaver } from '../lib/useDataSaver'
import { Icon } from './icons'

type PhotoImgProps = {
  photo: Photo
  /** How wide the photo is shown, so the browser picks the smallest file that is sharp enough. */
  sizes: string
  /** Decorative by default: the name next to it says what it is. */
  alt?: string
  /** The page's main photo (the hero): loaded first, never lazily. */
  priority?: boolean
  className?: string
}

/**
 * A photo in its three widths (400, 800, 1600 px). Below the fold it waits until it is near the
 * screen, and it is decoded off the main thread, so long lists of cards stay quick on a phone.
 * In data saver mode only the 400 px file is used, and photos in lists wait for a tap.
 */
export function PhotoImg({ photo, sizes, alt = '', priority = false, className }: PhotoImgProps) {
  const saveData = useDataSaver()
  if (saveData && !priority) return <TapToLoad src={photo.thumb} alt={alt} className={className} />
  return (
    <img
      src={saveData ? photo.thumb : photo.small}
      srcSet={saveData ? undefined : `${photo.thumb} 400w, ${photo.small} 800w, ${photo.large} 1600w`}
      sizes={saveData ? undefined : sizes}
      alt={alt}
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : 'auto'}
      decoding="async"
      className={className}
    />
  )
}

type TapToLoadProps = { src: string; alt?: string; className?: string }

/**
 * Data saver mode: a photo that loads only when the person taps "Ver foto". Until then, an empty
 * block keeps the place (the card's own background shows through).
 */
export function TapToLoad({ src, alt = '', className }: TapToLoadProps) {
  const { t } = useTranslation()
  const [shown, setShown] = useState(false)
  if (shown) return <img src={src} alt={alt} decoding="async" className={className} />
  return (
    <span className={`relative grid place-items-center ${className ?? ''}`}>
      <button
        type="button"
        aria-label={t('dataSaver.showPhotoLabel')}
        onClick={(event) => {
          // Inside a card that is a link: load the photo, do not open the page.
          event.preventDefault()
          event.stopPropagation()
          setShown(true)
        }}
        className="relative z-10 inline-flex items-center gap-1.5 rounded-full bg-coal/60 px-3 py-1.5 text-xs font-light text-white hover:bg-coal/80"
      >
        <Icon name="eye" className="size-3.5" />
        {t('dataSaver.showPhoto')}
      </button>
    </span>
  )
}
