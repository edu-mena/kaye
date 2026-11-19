import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { Icon, type IconName } from '../icons'

type PageHeaderProps = {
  title: string
  subtitle?: string
  back?: { to: string; label: string }
  action?: ReactNode
  /** Dashboards and settings: a smaller title and less room below, so the content starts high. */
  compact?: boolean
  /** Where the tutorial points for this screen (components/Tour.tsx). */
  tour?: string
}

/** Top of a screen: a quiet way back, the title, and one line on what the screen is for. */
export function PageHeader({ title, subtitle, back, action, compact = false, tour }: PageHeaderProps) {
  return (
    <header data-tour={tour} className={`rise ${compact ? 'mb-4' : 'mb-8'}`}>
      {back && (
        <Link
          to={back.to}
          className="mb-4 inline-flex items-center gap-2 text-sm font-light text-muted hover:text-night"
        >
          <Icon name="arrowLeft" className="size-4" />
          {back.label}
        </Link>
      )}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1
            className={`leading-tight font-extrabold text-night ${compact ? 'text-2xl' : 'text-3xl sm:text-4xl'}`}
          >
            {title}
          </h1>
          {subtitle && (
            <p className={`max-w-prose text-sm font-light text-copy ${compact ? 'mt-1' : 'mt-2'}`}>
              {subtitle}
            </p>
          )}
        </div>
        {action}
      </div>
    </header>
  )
}

type SectionHeadingProps = {
  id?: string
  title: string
  icon?: IconName
  action?: ReactNode
  /** On a dark block: white title, gold icon. */
  tone?: 'light' | 'dark'
}

/** A section title, with its icon in a circle of the main blue (as on the career page). */
export function SectionHeading({ id, title, icon, action, tone = 'light' }: SectionHeadingProps) {
  const dark = tone === 'dark'
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
      <h2
        id={id}
        className={`flex items-center gap-3 text-xl font-extrabold sm:text-2xl ${dark ? 'text-white' : 'text-night'}`}
      >
        {icon && (
          <span
            className={`grid size-10 shrink-0 place-items-center rounded-full ${dark ? 'bg-white/10 text-gold' : 'bg-blue text-white'}`}
          >
            <Icon name={icon} className="size-5" />
          </span>
        )}
        {title}
      </h2>
      {action}
    </div>
  )
}
