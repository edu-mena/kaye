import type { ReactNode } from 'react'
import { Icon, type IconName } from './icons'
import { TabPanel, Tabs, type Tab } from './ui/Tabs'

type DetailLayoutProps<T extends string> = {
  /** The hero at the top. */
  header: ReactNode
  tabs: { label: string; items: readonly Tab<T>[]; value: T; onChange: (id: T) => void; idPrefix: string }
  /** Side cards; they stay in view while the panel scrolls (from lg up). */
  aside?: ReactNode
  /** Under the panel, whatever tab is open. */
  footer?: ReactNode
  /** The open tab's panel. */
  children: ReactNode
}

/**
 * A detail page (career, course, academy, company): the hero, the tabs that stick under the top bar, the
 * open panel and, when there is one, an aside that sticks too.
 */
export function DetailLayout<T extends string>({
  header,
  tabs,
  aside,
  footer,
  children,
}: DetailLayoutProps<T>) {
  const panel = (
    <TabPanel key={tabs.value} idPrefix={tabs.idPrefix} id={tabs.value} className="mt-5">
      {children}
    </TabPanel>
  )
  return (
    <article className="min-w-0">
      {header}
      <div className="sticky top-[var(--topbar-space,0px)] z-10 mt-4 rounded-card bg-surface p-2 shadow-card transition-[top] duration-300">
        <Tabs
          label={tabs.label}
          tabs={tabs.items}
          value={tabs.value}
          onChange={tabs.onChange}
          idPrefix={tabs.idPrefix}
        />
      </div>
      {aside ? (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] lg:items-start">
          <div className="min-w-0">{panel}</div>
          <aside className="space-y-6 lg:sticky lg:top-[calc(var(--topbar-space,0px)+6rem)] lg:mt-5">
            {aside}
          </aside>
        </div>
      ) : (
        panel
      )}
      {footer && <div className="mt-10">{footer}</div>}
    </article>
  )
}

/** A panel's title, with its icon in a blue circle. */
export function DetailSection({
  id,
  title,
  icon,
  children,
}: {
  id: string
  title: string
  icon: IconName
  children: ReactNode
}) {
  return (
    <section aria-labelledby={`${id}-title`}>
      <h2
        id={`${id}-title`}
        className="mb-6 flex items-center gap-3 text-2xl font-extrabold text-night sm:text-3xl"
      >
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-blue text-white">
          <Icon name={icon} className="size-5" />
        </span>
        {title}
      </h2>
      {children}
    </section>
  )
}

/** The second level under a section title: a small label and a thin rule. */
export function Subheading({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <h3
      className={`mb-4 flex items-center gap-3 text-sm font-semibold text-night after:h-px after:flex-1 after:bg-line ${className}`}
    >
      {children}
    </h3>
  )
}

/** Navy cells with big numbers: the few figures a section is about. */
export function StatBlock({ items }: { items: { label: string; value: string }[] }) {
  return (
    <dl
      className={`grid gap-px overflow-hidden rounded-card ${items.length > 2 ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-2'}`}
    >
      {items.map((item) => (
        <div key={item.label} className="bg-coal p-4 text-white sm:p-5">
          <dt className="text-xs font-light text-white/75">{item.label}</dt>
          <dd className="mt-1 text-sm leading-snug font-normal">{item.value}</dd>
        </div>
      ))}
    </dl>
  )
}
