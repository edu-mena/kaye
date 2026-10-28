import type { Photo } from '../data/types'

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
 */
export function PhotoImg({ photo, sizes, alt = '', priority = false, className }: PhotoImgProps) {
  return (
    <img
      src={photo.small}
      srcSet={`${photo.thumb} 400w, ${photo.small} 800w, ${photo.large} 1600w`}
      sizes={sizes}
      alt={alt}
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : 'auto'}
      decoding="async"
      className={className}
    />
  )
}
