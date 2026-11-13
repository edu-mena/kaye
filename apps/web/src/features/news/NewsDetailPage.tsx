import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router'
import { CalendarButton } from '../../components/DeadlineActions'
import { ExternalLink } from '../../components/DetailParts'
import { Icon } from '../../components/icons'
import { DetailSkeleton, ErrorState, NotFoundState } from '../../components/PageStates'
import { PhotoImg } from '../../components/PhotoImg'
import { ShareButton } from '../../components/ShareButton'
import { ButtonLink } from '../../components/ui/Button'
import { Chip } from '../../components/ui/Chip'
import { useNews } from '../../data/queries'
import { todayIso } from '../../domain/scholarships'
import { useNewsForMe } from '../../lib/useNewsForMe'
import { EventDetails, EventLine } from './EventFacts'
import { isPoster, newsHref } from './links'
import { KIND_ICONS } from './kindIcons'

/** One piece of news, alone and large: photo, the whole text, the event's details and its sources. */
export default function NewsDetailPage() {
  const { t, i18n } = useTranslation()
  const { id } = useParams()
  const { data: news, isPending, isError, refetch } = useNews()
  const { forMe } = useNewsForMe()

  if (isPending) return <DetailSkeleton tabs={false} />
  if (isError) return <ErrorState onRetry={() => void refetch()} />
  const item = news.find((entry) => entry.id === id)
  if (!item) {
    return (
      <NotFoundState
        title={t('news.notFoundTitle')}
        body={t('news.notFound')}
        action={{ to: '/novidades', label: t('news.back') }}
      />
    )
  }

  const poster = isPoster(item)
  const date = new Intl.DateTimeFormat(i18n.language, { day: 'numeric', month: 'long', year: 'numeric' })
  const more = news.filter((entry) => entry.id !== item.id && entry.kind === item.kind).slice(0, 3)

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link
        to="/novidades"
        className="inline-flex items-center gap-2 text-sm font-light text-muted hover:text-night"
      >
        <Icon name="arrowLeft" className="size-4" />
        {t('news.back')}
      </Link>

      <article
        aria-labelledby="news-title"
        className="rise overflow-hidden rounded-card bg-surface shadow-card"
      >
        {item.image && (
          <PhotoImg
            photo={item.image}
            priority
            sizes="(min-width: 1024px) 48rem, 100vw"
            alt={poster ? item.image.alt : ''}
            className={
              poster ? 'max-h-[42rem] w-full bg-ash-100 object-contain' : 'aspect-video w-full object-cover'
            }
          />
        )}
        <div className="p-6 sm:p-10">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-light text-muted">
            <span className="grid size-7 shrink-0 place-items-center rounded-full bg-coal text-gold">
              <Icon name={KIND_ICONS[item.kind]} className="size-4" />
            </span>
            <span className="font-normal text-night">{t(`news.kind_${item.kind}`)}</span>
            <span aria-hidden="true">·</span>
            <time dateTime={item.date}>{date.format(new Date(`${item.date}T12:00:00`))}</time>
            {forMe(item) && <Chip tone="night">{t('news.forYou')}</Chip>}
            {item.example && <Chip>{t('news.example')}</Chip>}
          </div>
          <h1 id="news-title" className="mt-4 text-3xl leading-tight font-extrabold text-night sm:text-4xl">
            {item.title}
          </h1>
          {item.event && (
            <div className="mt-3">
              <EventLine event={item.event} />
            </div>
          )}
          <p className="mt-5 text-lg font-light text-copy">{item.summary}</p>

          {item.event && (
            <div className="mt-6 rounded-2xl bg-ash-100 p-5">
              <EventDetails event={item.event} />
            </div>
          )}
          <div className="mt-4 flex flex-wrap items-center gap-1">
            {item.event && (item.event.ends ?? item.event.starts) >= todayIso() && (
              <CalendarButton
                event={{ id: item.id, title: item.title, date: item.event.starts, ends: item.event.ends }}
                label={t(`news.kind_${item.kind}`)}
                path={`/novidades/${item.id}`}
              />
            )}
            <ShareButton text={t('share.news', { title: item.title })} path={`/novidades/${item.id}`} />
          </div>
          {item.body && item.body.length > 0 && (
            <div className="mt-6 space-y-4">
              {item.body.map((paragraph) => (
                <p key={paragraph} className="text-base leading-relaxed font-light text-copy">
                  {paragraph}
                </p>
              ))}
            </div>
          )}

          {item.to && (
            <ButtonLink to={item.to} className="mt-8">
              {t('news.openPage')}
              <Icon name="arrowRight" className="size-4" />
            </ButtonLink>
          )}

          <div className="mt-8 space-y-1 border-t border-line pt-4 text-xs font-light text-muted">
            {item.source && (
              <p>
                <ExternalLink href={item.source.url}>
                  {t('common.source', { label: item.source.label })}
                </ExternalLink>
              </p>
            )}
            {item.image && (
              <p>
                <ExternalLink href={item.image.credit.url}>
                  {poster
                    ? t('news.posterCredit', { author: item.image.credit.author })
                    : t('news.photoCredit', {
                        author: item.image.credit.author,
                        license: item.image.credit.license,
                      })}
                </ExternalLink>
              </p>
            )}
          </div>
        </div>
      </article>

      {more.length > 0 && (
        <section aria-labelledby="news-more">
          <h2 id="news-more" className="mb-3 text-lg font-semibold text-night">
            {t('news.related')}
          </h2>
          <ul className="grid gap-3 sm:grid-cols-3">
            {more.map((entry) => (
              <li key={entry.id}>
                <Link
                  to={newsHref(entry)}
                  className="group block h-full overflow-hidden rounded-2xl bg-surface shadow-card transition hover:shadow-lift"
                >
                  <span className="block aspect-video overflow-hidden bg-ash-100">
                    {entry.image && (
                      <PhotoImg
                        photo={entry.image}
                        sizes="(min-width: 640px) 16rem, 100vw"
                        className={`size-full ${isPoster(entry) ? 'object-contain' : 'object-cover'}`}
                      />
                    )}
                  </span>
                  <span className="line-clamp-2 p-3 text-sm font-semibold text-night group-hover:text-blue">
                    {entry.title}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
