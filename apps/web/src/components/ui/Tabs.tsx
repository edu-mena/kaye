import { useEffect, useRef, type KeyboardEvent, type ReactNode } from 'react'
import { Icon, type IconName } from '../icons'

type Tab<T extends string> = { id: T; label: string; icon?: IconName }

type TabsProps<T extends string> = {
  label: string
  tabs: readonly Tab<T>[]
  value: T
  onChange: (id: T) => void
  /** Prefix for the tab and panel ids; the same one goes to <TabPanel>. */
  idPrefix: string
  className?: string
}

/**
 * One panel at a time (WAI-ARIA tabs). The row scrolls sideways when it is wider
 * than the screen and keeps the active tab in view; arrows, Home and End move.
 */
export function Tabs<T extends string>({
  label,
  tabs,
  value,
  onChange,
  idPrefix,
  className = '',
}: TabsProps<T>) {
  const listRef = useRef<HTMLDivElement>(null)

  // A shared link can open on a tab that is off screen.
  useEffect(() => {
    const list = listRef.current
    centerTab(list, list?.querySelector<HTMLElement>('[aria-selected="true"]') ?? null)
  }, [])

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const index = tabs.findIndex((tab) => tab.id === value)
    const targets: Record<string, number> = {
      ArrowRight: index + 1,
      ArrowLeft: index - 1,
      Home: 0,
      End: tabs.length - 1,
    }
    const target = targets[event.key]
    if (target === undefined) return
    event.preventDefault()
    const tab = tabs[(target + tabs.length) % tabs.length]
    if (!tab) return
    onChange(tab.id)
    const element = document.getElementById(`${idPrefix}-tab-${tab.id}`)
    element?.focus()
    centerTab(listRef.current, element)
  }

  return (
    <div
      ref={listRef}
      role="tablist"
      aria-label={label}
      className={`relative no-scrollbar flex snap-x gap-2 overflow-x-auto overscroll-x-contain ${className}`}
    >
      {tabs.map((tab) => {
        const active = tab.id === value
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            id={`${idPrefix}-tab-${tab.id}`}
            aria-selected={active}
            // Only the active panel exists, so only its tab points to it.
            aria-controls={active ? `${idPrefix}-panel-${tab.id}` : undefined}
            tabIndex={active ? 0 : -1}
            onClick={(event) => {
              onChange(tab.id)
              centerTab(listRef.current, event.currentTarget)
            }}
            onKeyDown={onKeyDown}
            className={`inline-flex h-11 shrink-0 snap-start items-center gap-2 rounded-full px-4 text-sm font-light transition ${
              active ? 'bg-night font-normal text-white shadow-lift' : 'bg-ash-100 text-copy hover:bg-ash-200'
            }`}
          >
            {tab.icon && <Icon name={tab.icon} className={`size-4 ${active ? 'text-gold' : 'text-muted'}`} />}
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}

/** Scrolls the row so the tab sits in the middle (the row is its offset parent). */
function centerTab(list: HTMLElement | null, tab: HTMLElement | null) {
  if (!list || !tab) return
  list.scrollTo({ left: tab.offsetLeft - (list.clientWidth - tab.offsetWidth) / 2, behavior: 'smooth' })
}

type TabPanelProps = {
  idPrefix: string
  id: string
  children: ReactNode
  className?: string
  /** `bare`: no card around it, for panels that hold their own cards (Mercado). */
  variant?: 'card' | 'bare'
}

export function TabPanel({ idPrefix, id, children, className = '', variant = 'card' }: TabPanelProps) {
  const card = variant === 'card'
  return (
    <div
      role="tabpanel"
      id={`${idPrefix}-panel-${id}`}
      aria-labelledby={`${idPrefix}-tab-${id}`}
      tabIndex={0}
      className={`relative animate-rise focus-visible:outline-offset-4 ${card ? 'rounded-card bg-surface p-5 shadow-card sm:p-8' : 'rounded-2xl'} ${className}`}
    >
      {/* Marks the open panel: a short blue line centred on its top edge. */}
      {card && (
        <span
          aria-hidden="true"
          className="absolute top-2.5 left-1/2 h-[3px] w-4/5 -translate-x-1/2 rounded-full bg-blue"
        />
      )}
      {children}
    </div>
  )
}
