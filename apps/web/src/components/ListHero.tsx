import type { ReactNode } from 'react'
import { Icon, type IconName } from './icons'

type Stat = { icon: IconName; value: string | number; label: string }

/** The page's numbers as light grey pills: a gold icon in a dark circle, the value strong, the label quiet. */
export function StatPills({ stats, className = 'mt-6' }: { stats: Stat[]; className?: string }) {
  return (
    <ul className={`flex flex-wrap gap-2 ${className}`}>
      {stats.map((stat) => (
        <li
          key={stat.label}
          className="inline-flex h-10 items-center gap-2 rounded-full bg-ash-100 pr-4 pl-1.5 text-sm"
        >
          <span className="grid size-7 place-items-center rounded-full bg-coal text-gold">
            <Icon name={stat.icon} className="size-3.5" />
          </span>
          <span className="font-semibold text-night">{stat.value}</span>
          <span className="font-light text-muted">{stat.label}</span>
        </li>
      ))}
    </ul>
  )
}

/** The white control of a hero (search, select), with its icon white in a dark circle on the left. */
export const HERO_CONTROL =
  'h-14 w-full appearance-none rounded-full border border-line bg-white pr-12 pl-15 text-base text-night placeholder:text-muted'

export function HeroField({ icon, children }: { icon: IconName; children: ReactNode }) {
  return (
    <span className="relative block">
      <span className="pointer-events-none absolute top-1/2 left-2 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-coal text-white">
        <Icon name={icon} className="size-5" />
      </span>
      {children}
    </span>
  )
}

type ListHeroProps = {
  title: string
  body: string
  /** The page's main question, in a HeroField; left out, the hero stays short. */
  control?: ReactNode
  stats: Stat[]
  /** Photos: on top on phones, on the right from lg. */
  media: ReactNode
}

/** The top of a list page (Carreiras, Cursos): a white block with the title, an optional control, the numbers and photos. */
export function ListHero({ title, body, control, stats, media }: ListHeroProps) {
  return (
    <section className="overflow-hidden rounded-card bg-surface text-night shadow-card">
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
        <div className="p-6 sm:p-10">
          <h1 className="text-3xl leading-tight font-extrabold sm:text-5xl">{title}</h1>
          <p className="mt-4 max-w-md text-sm font-light text-copy">{body}</p>
          {control && <div className="mt-8 max-w-lg">{control}</div>}
          <StatPills stats={stats} className={control ? 'mt-6' : 'mt-8'} />
        </div>
        <div className="order-first p-2 lg:order-none">{media}</div>
      </div>
    </section>
  )
}
