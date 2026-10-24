import { useTranslation } from 'react-i18next'
import { pageItems } from '../../lib/pagination'
import { Icon } from '../icons'

type PaginationProps = { page: number; pages: number; onChange: (page: number) => void; label: string }

const STEP =
  'grid size-10 place-items-center rounded-full border border-line bg-surface text-night transition-colors'

/** Previous, the page numbers and next. The current page is dark and marked with aria-current. */
export function Pagination({ page, pages, onChange, label }: PaginationProps) {
  const { t } = useTranslation()
  if (pages <= 1) return null

  return (
    <nav aria-label={label} className="mt-8 flex items-center justify-center gap-2">
      <button
        type="button"
        aria-label={t('common.previousPage')}
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
        className={`${STEP} hover:bg-ash-100 disabled:opacity-40 disabled:hover:bg-surface`}
      >
        <Icon name="arrowLeft" className="size-4" />
      </button>
      <ul className="flex items-center gap-2">
        {pageItems(page, pages).map(({ page: number, gap }) =>
          gap ? (
            <li key={`gap-${number}`} aria-hidden="true" className="w-6 text-center text-sm text-muted">
              …
            </li>
          ) : (
            <li key={number}>
              <button
                type="button"
                aria-label={t('common.page', { page: number })}
                aria-current={number === page ? 'page' : undefined}
                onClick={() => onChange(number)}
                className={`grid size-10 place-items-center rounded-full text-sm tabular-nums transition-colors ${
                  number === page
                    ? 'bg-night font-semibold text-white'
                    : 'border border-line bg-surface font-light text-night hover:bg-ash-100'
                }`}
              >
                {number}
              </button>
            </li>
          ),
        )}
      </ul>
      <button
        type="button"
        aria-label={t('common.nextPage')}
        disabled={page >= pages}
        onClick={() => onChange(page + 1)}
        className={`${STEP} hover:bg-ash-100 disabled:opacity-40 disabled:hover:bg-surface`}
      >
        <Icon name="arrowRight" className="size-4" />
      </button>
    </nav>
  )
}
