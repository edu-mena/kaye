import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { Icon } from '../../components/icons'
import { PATH_LINE } from '../../components/PathMark'
import type { CourseIcon, CourseTone } from '../../data/kursos/types'
import { TONE_CLASS } from './shared'

const SOFT: Record<CourseTone, string> = {
  blue: 'bg-blue/10',
  gold: 'bg-gold/20',
  coral: 'bg-coral/15',
  night: 'bg-night/10',
  success: 'bg-success/15',
}

type CourseBannerProps = {
  title: string
  icon: CourseIcon
  /** The colour of the icon card; announced courses are grey. */
  tone?: CourseTone
  /** The small pill above the title (level, "Em breve"). */
  eyebrow: string
  /** Opens the course; absent for a course that is not written yet. */
  to?: string
  /** Under the title: progress, for example. */
  children?: ReactNode
}

/** A course in the catalogue: the Kursos banner, simpler, with the course's name and icon. */
export function CourseBanner({ title, icon, tone, eyebrow, to, children }: CourseBannerProps) {
  const body = (
    <>
      <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 w-[30%]">
        <span
          className={`absolute -top-8 -right-8 size-28 rounded-full ${tone ? SOFT[tone] : 'bg-ash-100'}`}
        />
        <svg viewBox="0 0 240 112" fill="none" className="absolute right-2 bottom-3 w-[85%] max-w-32">
          <path d={PATH_LINE} className="stroke-ash-200" strokeWidth="8" strokeLinecap="round" />
          <path
            d={PATH_LINE}
            className="stroke-night/60"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray="2 8"
          />
          <circle cx="8" cy="104" r="6" className="fill-night" />
        </svg>
        <span
          className={`absolute top-5 right-5 grid size-12 rotate-[-8deg] place-items-center rounded-2xl sm:size-14 ${
            tone ? TONE_CLASS[tone] : 'bg-ash-200 text-muted'
          }`}
        >
          <Icon name={icon} className="size-6 sm:size-7" />
        </span>
      </div>
      <div className="relative max-w-[72%]">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-2.5 py-0.5 text-[11px] font-semibold text-night">
          <Icon name="cap" className="size-3.5 text-blue" />
          {eyebrow}
        </span>
        <h2 className="mt-3 line-clamp-3 text-lg leading-snug font-extrabold text-night sm:text-xl">
          {title}
        </h2>
        {children}
      </div>
    </>
  )
  const frame =
    'relative block h-full min-h-40 overflow-hidden rounded-card border border-line bg-surface p-5 shadow-card'
  return to ? (
    <Link
      to={to}
      className={`${frame} transition-shadow hover:shadow-lg focus-visible:ring-2 focus-visible:ring-blue`}
    >
      {body}
    </Link>
  ) : (
    <article className={`${frame} opacity-70`}>{body}</article>
  )
}
