import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { ExternalLink } from '../../components/DetailParts'
import { Icon } from '../../components/icons'
import { Chip } from '../../components/ui/Chip'
import type { NewsItem } from '../../data/types'
import { KIND_ICONS } from './kindIcons'

type NewsHeadProps = {
  item: NewsItem
  date: string
  /** About one of the person's careers ("Para ti", on Novidades). */
  forYou?: boolean
  /** Not seen yet ("Nova", on Notificações). */
  fresh?: boolean
  /** Where the title leads; by default, the page the piece is about. */
  href?: string
  /** The title's link covers the whole card (the card must be `relative`). */
  stretched?: boolean
}

/** What kind and when, then the title (a link to its page). */
export function NewsHead({
  item,
  date,
  forYou = false,
  fresh = false,
  href,
  stretched = false,
}: NewsHeadProps) {
  const { t } = useTranslation()
  const to = href ?? item.to
  return (
    <>
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-light text-muted">
        <span className="grid size-6 shrink-0 place-items-center rounded-full bg-coal text-gold">
          <Icon name={KIND_ICONS[item.kind]} className="size-3.5" />
        </span>
        <span className="font-normal text-night">{t(`news.kind_${item.kind}`)}</span>
        <span aria-hidden="true">·</span>
        <time dateTime={item.date}>{date}</time>
        {fresh && <Chip tone="night">{t('notifications.fresh')}</Chip>}
        {forYou && <Chip tone="night">{t('news.forYou')}</Chip>}
        {item.example && <Chip>{t('news.example')}</Chip>}
      </div>
      <h2 id={`news-${item.id}`} className="mt-2 text-sm font-semibold text-night">
        {to ? (
          <Link
            to={to}
            className={`hover:text-blue ${stretched ? 'after:absolute after:inset-0 after:content-[""] focus-visible:outline-none focus-visible:after:rounded-2xl focus-visible:after:ring-2 focus-visible:after:ring-blue' : ''}`}
          >
            {item.title}
          </Link>
        ) : (
          item.title
        )}
      </h2>
    </>
  )
}

/** One piece of news, whole: its head, a line, and its source. */
export function NewsCard(props: NewsHeadProps) {
  const { t } = useTranslation()
  const { item } = props
  return (
    <article aria-labelledby={`news-${item.id}`} className="rounded-2xl bg-surface p-4 shadow-card">
      <NewsHead {...props} />
      <p className="mt-1 text-sm font-light text-copy">{item.summary}</p>
      {item.source && (
        <p className="mt-2 text-xs font-light text-muted">
          <ExternalLink href={item.source.url}>
            {t('common.source', { label: item.source.label })}
          </ExternalLink>
        </p>
      )}
    </article>
  )
}
