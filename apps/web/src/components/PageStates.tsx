import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Icon } from './icons'
import { Button, ButtonLink } from './ui/Button'

const slots = (count: number) => Array.from({ length: count }, (_, index) => `slot-${index + 1}`)

/** A grey placeholder in the shape of what is loading. It breathes slowly, and stays still with reduced motion. */
function Skeleton({ className = '', tone = 'light' }: { className?: string; tone?: 'light' | 'dark' }) {
  return (
    <span
      aria-hidden="true"
      className={`block animate-pulse rounded-full motion-reduce:animate-none ${tone === 'dark' ? 'bg-ash-300' : 'bg-ash-200'} ${className}`}
    />
  )
}

/** Wraps a skeleton: screen readers hear "A carregar…" once, and nothing of the grey shapes. */
export function Loading({ children }: { children: ReactNode }) {
  const { t } = useTranslation()
  return (
    <div aria-busy="true">
      <output className="sr-only">{t('loading')}</output>
      {children}
    </div>
  )
}

/** Cards as they will appear: the photo, the name and a line under it. Two per row on phones. */
export function CardsSkeleton({ count = 6, className = '' }: { count?: number; className?: string }) {
  return (
    <ul aria-hidden="true" className={`grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-3 ${className}`}>
      {slots(count).map((slot) => (
        <li key={slot} className="overflow-hidden rounded-card bg-surface shadow-card">
          <Skeleton className="h-28 rounded-none sm:h-40" />
          <div className="space-y-2 p-3 sm:p-5">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="mt-5 h-3 w-1/3" />
          </div>
        </li>
      ))}
    </ul>
  )
}

/** One-line items (rows of a list or of a spec sheet). */
export function RowsSkeleton({ count = 3 }: { count?: number }) {
  return (
    <ul aria-hidden="true" className="space-y-3">
      {slots(count).map((slot) => (
        <li key={slot} className="flex items-center gap-3 rounded-2xl bg-surface p-3 shadow-card">
          <Skeleton className="size-10 shrink-0" />
          <span className="flex-1 space-y-2">
            <Skeleton className="h-3.5 w-2/3" />
            <Skeleton className="h-3 w-1/3" />
          </span>
        </li>
      ))}
    </ul>
  )
}

/** A list page (Carreiras, Cursos) while it loads: the hero, the filter tiles and the cards. */
export function ListSkeleton({ tiles = 5 }: { tiles?: number }) {
  return (
    <Loading>
      <div className="space-y-12">
        <div className="grid grid-cols-1 overflow-hidden rounded-card bg-surface shadow-card lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
          <div className="p-6 sm:p-10">
            <Skeleton className="h-10 w-52 rounded-xl sm:h-12" />
            <Skeleton className="mt-5 h-3 w-full max-w-md" />
            <Skeleton className="mt-2 h-3 w-2/3 max-w-sm" />
            <Skeleton className="mt-8 h-14 w-full max-w-lg" />
            <div className="mt-6 flex flex-wrap gap-2">
              {slots(3).map((slot) => (
                <Skeleton key={slot} className="h-10 w-28" />
              ))}
            </div>
          </div>
          <div className="order-first p-2 lg:order-none">
            <Skeleton className="h-44 w-full rounded-2xl sm:h-56 lg:h-full lg:min-h-72" />
          </div>
        </div>
        <div aria-hidden="true" className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {slots(tiles).map((slot) => (
            <Skeleton key={slot} className="h-16 rounded-2xl" />
          ))}
        </div>
        <CardsSkeleton />
      </div>
    </Loading>
  )
}

/** A detail page (a career, a course) while it loads: the photo hero, the tabs and the first panel. */
export function DetailSkeleton({ tabs = true }: { tabs?: boolean }) {
  return (
    <Loading>
      <div className="space-y-4">
        <div className="relative h-72 overflow-hidden rounded-card bg-ash-200 sm:h-80 lg:h-96">
          <div className="absolute inset-x-0 bottom-0 space-y-3 p-6 lg:p-10">
            <Skeleton tone="dark" className="h-3 w-40" />
            <Skeleton tone="dark" className="h-10 w-3/4 max-w-xl rounded-xl" />
            <Skeleton tone="dark" className="h-3 w-1/2 max-w-sm" />
          </div>
        </div>
        {tabs && (
          <div
            aria-hidden="true"
            className="flex gap-2 overflow-hidden rounded-card bg-surface p-2 shadow-card"
          >
            {slots(5).map((slot) => (
              <Skeleton key={slot} className="h-11 w-28 shrink-0" />
            ))}
          </div>
        )}
        <div className="space-y-4 rounded-card bg-surface p-6 shadow-card sm:p-8">
          <Skeleton className="h-6 w-56 rounded-lg" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-11/12" />
          <Skeleton className="h-3 w-2/3" />
          <div className="grid grid-cols-1 gap-3 pt-4 sm:grid-cols-3">
            {slots(3).map((slot) => (
              <Skeleton key={slot} className="h-24 rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    </Loading>
  )
}

type ErrorStateProps = {
  onRetry?: () => void
  /** Inside a section of a page, not the whole page: smaller, without the way home. */
  compact?: boolean
}

/** Something failed to load: say it plainly, offer to try again, and a way out. */
export function ErrorState({ onRetry, compact = false }: ErrorStateProps) {
  const { t } = useTranslation()
  return (
    <div
      role="alert"
      className={
        compact
          ? 'flex flex-wrap items-center gap-4 rounded-2xl border border-line bg-surface p-4'
          : 'mx-auto max-w-lg rounded-card bg-surface p-8 text-center shadow-card sm:p-10'
      }
    >
      <span
        className={`grid shrink-0 place-items-center rounded-full bg-coal text-gold ${compact ? 'size-10' : 'mx-auto size-14'}`}
      >
        <Icon name="signal" className={compact ? 'size-5' : 'size-6'} />
      </span>
      <div className={compact ? 'min-w-0 flex-1' : ''}>
        <p className={`font-extrabold text-night ${compact ? 'text-sm' : 'mt-5 text-xl'}`}>
          {t('states.errorTitle')}
        </p>
        <p className={`text-sm font-light text-copy ${compact ? 'mt-1' : 'mt-2'}`}>{t('common.loadError')}</p>
      </div>
      <div className={compact ? '' : 'mt-6 flex flex-wrap justify-center gap-2'}>
        {onRetry && (
          <Button onClick={onRetry} size={compact ? 'sm' : 'md'} variant={compact ? 'secondary' : 'primary'}>
            <Icon name="refresh" className="size-4" />
            {t('states.retry')}
          </Button>
        )}
        {!compact && (
          <ButtonLink to="/" variant="ghost">
            {t('states.home')}
          </ButtonLink>
        )}
      </div>
    </div>
  )
}

type NotFoundStateProps = { title: string; body: string; action: { to: string; label: string } }

/** A link to something that does not exist (or no longer does): say so, and lead back to the list. */
export function NotFoundState({ title, body, action }: NotFoundStateProps) {
  return (
    <div className="mx-auto max-w-lg rounded-card bg-surface p-8 text-center shadow-card sm:p-10">
      <span className="mx-auto grid size-14 place-items-center rounded-full bg-coal text-gold">
        <Icon name="compass" className="size-6" />
      </span>
      <h1 className="mt-5 text-2xl font-extrabold text-night">{title}</h1>
      <p className="mt-2 text-sm font-light text-copy">{body}</p>
      <ButtonLink to={action.to} className="mt-6">
        <Icon name="arrowLeft" className="size-4" />
        {action.label}
      </ButtonLink>
    </div>
  )
}
