import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { PhotoImg } from '../../components/PhotoImg'
import { Card } from '../../components/ui/Card'
import { Chip } from '../../components/ui/Chip'
import { Segmented } from '../../components/ui/Segmented'
import type { MarketArea, NewsItem } from '../../data/types'
import { isNewSince, nextEvent } from '../../domain/areaNews'
import { todayIso } from '../../domain/scholarships'
import { userActions, useUser } from '../../state/userStore'
import { newsHref } from '../news/links'
import { CARD_LINK, CardHeading } from './CardHeading'
import { HIGHLIGHT_SIZE, useAreaNews } from './useAreaNews'

const markSeen = () => userActions.markNewsSeen()

/** Marks the news as seen when the person leaves the highlight (after it was on screen), or opens a piece. */
function useMarkSeenOnLeave() {
  const ref = useRef<HTMLDivElement>(null)
  const visible = useRef(false)
  useEffect(() => {
    const node = ref.current
    // No observer (old browsers, tests): only opening a piece marks them.
    if (!node || typeof IntersectionObserver === 'undefined') return
    const observer = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) visible.current = true
    })
    observer.observe(node)
    return () => {
      observer.disconnect()
      if (visible.current) userActions.markNewsSeen()
    }
  }, [])
  return ref
}

/**
 * Novidades na tua área, right after the streak and the challenge: the newest piece of the person's area in focus
 * and three more below. "Novo" marks what came after the last time they saw them.
 */
export function NewsHighlight() {
  const { t, i18n } = useTranslation()
  const { newsSeenAt } = useUser()
  const { areas, of } = useAreaNews()
  const [picked, setPicked] = useState<MarketArea | null>(null)
  const ref = useMarkSeenOnLeave()
  const area = areas.find((entry) => entry === picked) ?? areas[0] ?? null
  const pieces = of(area)
  const [featured, ...rest] = pieces.slice(0, HIGHLIGHT_SIZE)
  const event = nextEvent(pieces, todayIso())
  const date = new Intl.DateTimeFormat(i18n.language, { day: 'numeric', month: 'short' })
  const day = (item: NewsItem) => date.format(new Date(`${item.date}T12:00:00`))

  return (
    <div ref={ref}>
      <Card as="section" aria-labelledby="home-news" className="p-5">
        <CardHeading
          id="home-news"
          icon="newspaper"
          action={
            <Link to={area ? `/novidades?area=${area}` : '/novidades'} className={CARD_LINK}>
              {t('forYou.newsAll')}
            </Link>
          }
        >
          {area ? t('forYou.newsTitle') : t('forYou.newsTitleGeneric')}
        </CardHeading>
        {area && (
          <div className="mt-3 flex flex-wrap gap-2">
            {areas.length > 1 ? (
              <Segmented
                label={t('forYou.newsAreaLabel')}
                options={areas.map((entry) => ({ value: entry, label: t(`market.area_${entry}`) }))}
                value={area}
                onChange={(value) => setPicked(value)}
              />
            ) : (
              <Chip>{t(`market.area_${area}`)}</Chip>
            )}
          </div>
        )}
        {!featured ? (
          <p className="mt-4 text-sm font-light text-copy">{t('forYou.newsEmpty')}</p>
        ) : (
          <div className="mt-4 space-y-3">
            <Link
              to={newsHref(featured)}
              onClick={markSeen}
              className="group/news block overflow-hidden rounded-2xl bg-ash-100"
            >
              {featured.image && (
                <span className="block h-44 overflow-hidden bg-night sm:h-52">
                  <PhotoImg
                    photo={featured.image}
                    sizes="(min-width: 1024px) 50vw, 100vw"
                    className="size-full object-cover transition-transform duration-500 group-hover/news:scale-[1.03] motion-reduce:transition-none"
                  />
                </span>
              )}
              <span className="block p-4">
                <span className="flex items-center gap-2 text-xs font-light text-muted">
                  {day(featured)}
                  {isNewSince(featured, newsSeenAt) && <Chip tone="neutral">{t('forYou.newsNew')}</Chip>}
                </span>
                <span className="mt-1 line-clamp-2 text-lg font-semibold text-night">{featured.title}</span>
                {featured.summary && (
                  <span className="mt-1 line-clamp-2 block text-sm font-light text-copy">
                    {featured.summary}
                  </span>
                )}
              </span>
            </Link>
            <ul className="space-y-1">
              {rest.map((item) => (
                <li key={item.id}>
                  <Link
                    to={newsHref(item)}
                    onClick={markSeen}
                    className="flex items-center gap-3 rounded-2xl p-1.5 hover:bg-ash-100"
                  >
                    <span className="block size-12 shrink-0 overflow-hidden rounded-xl bg-ash-200">
                      {item.image && (
                        <PhotoImg photo={item.image} sizes="48px" className="size-full object-cover" />
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="line-clamp-1 text-sm font-normal text-night">{item.title}</span>
                      <span className="flex items-center gap-2 text-xs font-light text-muted">
                        {day(item)}
                        {isNewSince(item, newsSeenAt) && <Chip tone="neutral">{t('forYou.newsNew')}</Chip>}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
            {event?.event && (
              <Link
                to={newsHref(event)}
                onClick={markSeen}
                className="flex items-center gap-3 rounded-2xl border border-line p-3 hover:bg-ash-100"
              >
                <span className="min-w-0 flex-1">
                  <span className="block text-xs font-light text-muted">{t('forYou.newsEvent')}</span>
                  <span className="line-clamp-1 text-sm font-normal text-night">{event.title}</span>
                </span>
                <span className="shrink-0 text-xs font-semibold text-night">
                  {date.format(new Date(`${event.event.starts}T12:00:00`))}
                </span>
              </Link>
            )}
          </div>
        )}
      </Card>
    </div>
  )
}
