import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import type { SourceLink } from '../data/types'
import { Icon, type IconName } from './icons'
import { InstitutionLogo } from './InstitutionLogo'
import { SectionHeading } from './ui/PageHeader'

// The pieces of an institution's or a company's page (Academias, Empresas).

type DetailHeroProps = {
  entity: { name: string; logo?: string; logoOnDark?: boolean; banner?: string }
  back: { to: string; label: string }
  /** One line over the name ("Universidade · Pública"). */
  meta: string
}

/** The photo under a dark gradient: the way back, the logo, what it is and the name. */
export function DetailHero({ entity, back, meta }: DetailHeroProps) {
  return (
    <section className="relative isolate overflow-hidden rounded-card bg-coal text-white">
      {entity.banner && (
        <img
          src={entity.banner}
          alt=""
          fetchPriority="high"
          decoding="async"
          className="absolute inset-0 -z-10 size-full object-cover"
        />
      )}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-linear-to-t from-coal via-coal/75 to-coal/20"
      />
      <div className="flex min-h-72 flex-col justify-between gap-10 p-6 sm:p-10 lg:min-h-96">
        <Link
          to={back.to}
          className="inline-flex w-fit items-center gap-2 rounded-full bg-coal/70 px-4 py-2 text-sm font-light hover:bg-coal"
        >
          <Icon name="arrowLeft" className="size-4" />
          {back.label}
        </Link>
        <div className="flex items-end gap-4">
          <span className="rounded-full ring-4 ring-white/20">
            <InstitutionLogo institution={entity} />
          </span>
          <div className="max-w-2xl min-w-0">
            <p className="text-sm font-light text-white/80">{meta}</p>
            <h1 className="mt-1 text-3xl leading-tight font-extrabold break-words sm:text-5xl">
              {entity.name}
            </h1>
          </div>
        </div>
      </div>
    </section>
  )
}

/** A white block with a heading: the page's parts. */
export function DetailBlock({
  id,
  icon,
  title,
  action,
  children,
}: {
  id: string
  icon: IconName
  title: string
  action?: ReactNode
  children: ReactNode
}) {
  return (
    <section aria-labelledby={id} className="rounded-card bg-surface p-6 shadow-card sm:p-8">
      <SectionHeading id={id} title={title} icon={icon} action={action} />
      <div className="-mt-2">{children}</div>
    </section>
  )
}

/** A part that waits for its data: it is shown, and says "Em breve". */
export function SoonBlock({
  id,
  icon,
  title,
  children,
}: {
  id: string
  icon: IconName
  title: string
  children: ReactNode
}) {
  const { t } = useTranslation()
  return (
    <DetailBlock
      id={id}
      icon={icon}
      title={title}
      action={
        <span className="rounded-full bg-paper px-3 py-1 text-xs font-semibold text-muted">
          {t('academy.soon')}
        </span>
      }
    >
      <p className="text-sm font-light text-copy">{children}</p>
    </DetailBlock>
  )
}

export function SourcesBlock({ sources }: { sources: SourceLink[] }) {
  const { t } = useTranslation()
  return (
    <DetailBlock id="sources" icon="newspaper" title={t('academy.sourcesTitle')}>
      <ul className="space-y-2 text-sm">
        {sources.map((source) => (
          <li key={source.url}>
            <ExternalLink href={source.url}>{source.label}</ExternalLink>
          </li>
        ))}
      </ul>
    </DetailBlock>
  )
}

/** The official site and what is still to confirm. */
export function ContactsBlock({ website }: { website?: string | undefined }) {
  const { t } = useTranslation()
  return (
    <DetailBlock id="contacts" icon="globe" title={t('academy.contactsTitle')}>
      {website && (
        <p className="mb-3 text-sm">
          <ExternalLink href={website}>{t('academy.website')}</ExternalLink>
        </p>
      )}
      <p className="text-sm font-light text-copy">{t('academy.contactsBody')}</p>
    </DetailBlock>
  )
}

/** Career names as pills, each opening its page. */
export function CareerPills({ careers }: { careers: { slug: string; name: string }[] }) {
  return (
    <ul className="mt-2 flex flex-wrap gap-2">
      {careers.map((career) => (
        <li key={career.slug}>
          <Link
            to={`/carreiras/${career.slug}`}
            className="inline-flex rounded-full border border-line px-3 py-1.5 text-xs font-normal text-night hover:border-night"
          >
            {career.name}
          </Link>
        </li>
      ))}
    </ul>
  )
}

/** A link out of the app: a new tab, without handing it this page (noopener). */
export function ExternalLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="font-normal text-night underline underline-offset-2 hover:text-blue"
    >
      {children}
    </a>
  )
}
