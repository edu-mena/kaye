import type { UseQueryResult } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { ErrorState, Loading, RowsSkeleton } from './PageStates'

type QueryStateProps<T> = {
  query: UseQueryResult<T>
  children: (data: T) => ReactNode
  /** A skeleton in the shape of what is loading; a few rows when not given. */
  loading?: ReactNode
  /** Part of a page (a section), not the whole page: a small error with "Tentar outra vez". */
  compact?: boolean
}

/** Loading and error states, designed the same way on every screen. */
export function QueryState<T>({ query, children, loading, compact = false }: QueryStateProps<T>) {
  if (query.isPending) {
    return (
      loading ?? (
        <Loading>
          <RowsSkeleton />
        </Loading>
      )
    )
  }
  if (query.isError) return <ErrorState compact={compact} onRetry={() => void query.refetch()} />
  return <>{children(query.data)}</>
}
