import type { UseQueryResult } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

type QueryStateProps<T> = {
  query: UseQueryResult<T>
  children: (data: T) => ReactNode
}

/** Loading and error states, the same on every screen. */
export function QueryState<T>({ query, children }: QueryStateProps<T>) {
  const { t } = useTranslation()

  if (query.isPending) {
    return (
      <p aria-busy="true" className="py-10 text-center text-sm text-muted">
        {t('loading')}
      </p>
    )
  }
  if (query.isError) {
    return (
      <p role="alert" className="rounded-xl bg-coral-soft px-4 py-3 text-sm text-coral">
        {t('common.loadError')}
      </p>
    )
  }
  return <>{children(query.data)}</>
}
