import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { Icon } from '../icons'

type PageHeaderProps = {
  title: string
  subtitle?: string
  back?: { to: string; label: string }
  action?: ReactNode
}

export function PageHeader({ title, subtitle, back, action }: PageHeaderProps) {
  return (
    <header className="mb-6 rise">
      {back && (
        <Link
          to={back.to}
          className="mb-3 inline-flex items-center gap-1 text-sm font-semibold text-muted hover:text-navy"
        >
          <Icon name="arrowLeft" className="size-4" />
          {back.label}
        </Link>
      )}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-navy sm:text-4xl">{title}</h1>
          {subtitle && <p className="mt-2 max-w-prose text-muted">{subtitle}</p>}
        </div>
        {action}
      </div>
    </header>
  )
}

type SectionHeadingProps = { id?: string; title: string; action?: ReactNode }

export function SectionHeading({ id, title, action }: SectionHeadingProps) {
  return (
    <div className="mb-3 flex items-end justify-between gap-4">
      <h2 id={id} className="text-xl font-semibold text-navy">
        {title}
      </h2>
      {action}
    </div>
  )
}
