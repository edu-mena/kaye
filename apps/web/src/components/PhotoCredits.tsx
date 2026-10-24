import { useTranslation } from 'react-i18next'
import type { Photo } from '../data/types'

/**
 * CC BY and CC BY-SA ask for the author and the licence: one quiet line at the end of a page, each
 * photo linked to its original. The same photo shown twice is credited once.
 */
export function PhotoCredits({ photos }: { photos: (Photo | undefined)[] }) {
  const { t } = useTranslation()
  const credits = [
    ...new Map(
      photos.flatMap((photo) => (photo ? [[photo.credit.url, photo.credit] as const] : [])),
    ).values(),
  ]
  if (credits.length === 0) return null
  return (
    <p className="text-xs font-light text-muted">
      {t('common.photos')}{' '}
      {credits.map((credit, index) => (
        <span key={credit.url}>
          {index > 0 && ' · '}
          <a
            href={credit.url}
            target="_blank"
            rel="noreferrer"
            className="underline-offset-2 hover:underline"
          >
            {credit.author}
          </a>{' '}
          ({credit.license})
        </span>
      ))}
    </p>
  )
}
