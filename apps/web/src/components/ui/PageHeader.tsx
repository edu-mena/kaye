import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { Icon, type IconName } from '../icons'

type PageHeaderProps = {
  title: string
  subtitle?: string
  back?: { to: string; label: string }
  action?: ReactNode
}

/** Top of a screen: a quiet way back, the title, and one line on what the screen is for. */
export function PageHeader({ title, subtitle, back, action }: PageHeaderProps) {
  return (
    <header className="mb-8 rise">
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
          <h1 className="text-3xl leading-tight font-extrabold text-night sm:text-4xl">{title}</h1>
          {subtitle && <p className="mt-2 max-w-prose text-sm font-light text-copy">{subtitle}</p>}
        </div>
        {action}
      </div>
    </header>
  )
}

type SectionHeadingProps = { id?: string; title: string; icon?: IconName; action?: ReactNode }

/** A section title, with its icon in a circle of the main blue (as on the career page). */
export function SectionHeading({ id, title, icon, action }: SectionHeadingProps) {
  return (
    <div className="mb-6 flex items-center justify-between gap-4">
      <h2 id={id} className="flex items-center gap-3 text-xl font-extrabold text-night sm:text-2xl">
        {icon && (
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-blue text-white">
            <Icon name={icon} className="size-5" />
          </span>
        )}
        {title}
      </h2>
      {action}
    </div>
  )
}
