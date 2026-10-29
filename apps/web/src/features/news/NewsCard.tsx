import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { ExternalLink } from '../../components/DetailParts'
import { Icon, type IconName } from '../../components/icons'
import { Chip } from '../../components/ui/Chip'
import type { NewsItem, NewsKind } from '../../data/types'

const KIND_ICONS: Record<NewsKind, IconName> = { kaye: 'megaphone', cursos: 'cap', empresas: 'building' }

type NewsCardProps = {
  item: NewsItem
  date: string
  /** About one of the person's careers ("Para ti", on Novidades). */
  forYou?: boolean
  /** Not seen yet ("Nova", on Notificações). */
  fresh?: boolean
}

/** One piece of news: what kind and when, the title (a link to its page), a line, and its source. */
export function NewsCard({ item, date, forYou = false, fresh = false }: NewsCardProps) {
  const { t } = useTranslation()
  const titleId = `news-${item.id}`
  return (
    <article aria-labelledby={titleId} className="rounded-2xl bg-surface p-4 shadow-card">
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
      <h2 id={titleId} className="mt-2 text-sm font-semibold text-night">
        {item.to ? (
          <Link to={item.to} className="hover:text-blue">
            {item.title}
          </Link>
        ) : (
          item.title
        )}
      </h2>
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
