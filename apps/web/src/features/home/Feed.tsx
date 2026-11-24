import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Icon } from '../../components/icons'
import { ButtonLink } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { buildFeed, FEED_FILTERS, filterFeed, type FeedFilter } from '../../domain/feed'
import { stagger } from '../../lib/ui'
import { FeedCard } from './FeedCards'
import { useNextStep } from './useNextStep'
import { useFeedInputs } from './useFeedInputs'

const PAGE = 6

/**
 * A ref for the element at the end of the feed: `onReach` runs when it comes near the screen. The element is
 * keyed by how many cards show, so it is watched anew after each load and a short page keeps loading until full.
 */
function reachEnd(onReach: () => void) {
  return (element: HTMLDivElement | null) => {
    if (!element || typeof IntersectionObserver === 'undefined') return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) onReach()
      },
      { rootMargin: '400px' },
    )
    observer.observe(element)
    return () => observer.disconnect()
  }
}

/** The last card: nothing more for now, and the next step of the journey. */
function UpToDate() {
  const { t } = useTranslation()
  const next = useNextStep()
  return (
    <Card as="article" aria-labelledby="home-done" className="p-5">
      <h2 id="home-done" className="text-base font-semibold text-night">
        {t('forYou.doneTitle')}
      </h2>
      <p className="mt-1 text-sm font-light text-copy">{t('forYou.doneBody')}</p>
      <ButtonLink to={next.to} size="sm" className="mt-4">
        {next.label}
        <Icon name="arrowRight" className="size-4" />
      </ButtonLink>
    </Card>
  )
}

/** The feed: six cards, six more each time the person reaches the end, filtered by kind. */
export function Feed() {
  const { t } = useTranslation()
  const inputs = useFeedInputs()
  const [filter, setFilter] = useState<FeedFilter>('all')
  const [shown, setShown] = useState(PAGE)
  const items = filterFeed(buildFeed(inputs), filter)
  // Without IntersectionObserver there is no "reaching the end": everything shows.
  const lazy = typeof IntersectionObserver !== 'undefined'
  const visible = lazy ? items.slice(0, shown) : items
  const more = visible.length < items.length
  const sentinel = reachEnd(() => setShown((count) => count + PAGE))
  const labels: Record<FeedFilter, string> = {
    all: t('forYou.filterAll'),
    careers: t('forYou.filterCareers'),
    study: t('forYou.filterStudy'),
    companies: t('forYou.filterCompanies'),
    deadlines: t('forYou.filterDeadlines'),
    news: t('forYou.filterNews'),
  }

  return (
    <section aria-label={t('forYou.feedLabel')} className="min-w-0 space-y-4">
      <fieldset className="m-0 -mx-1 no-scrollbar flex min-w-0 gap-2 overflow-x-auto border-0 p-0 px-1">
        <legend className="sr-only">{t('forYou.filterLabel')}</legend>
        {FEED_FILTERS.map((value) => (
          <button
            key={value}
            type="button"
            aria-pressed={filter === value}
            onClick={() => {
              setFilter(value)
              setShown(PAGE)
            }}
            className={`h-10 shrink-0 rounded-full px-4 text-sm font-semibold ${
              filter === value ? 'bg-night text-white' : 'bg-surface text-night shadow-card hover:bg-ash-100'
            }`}
          >
            {labels[value]}
          </button>
        ))}
      </fieldset>
      {items.length === 0 ? (
        <p className="text-sm font-light text-copy">{t('forYou.feedEmpty')}</p>
      ) : (
        <div className="columns-1 gap-4 md:columns-2 [&>*]:mb-4 [&>*]:break-inside-avoid">
          {visible.map((item, index) => (
            <div
              key={item.id}
              className="rise"
              style={stagger(index % PAGE)}
              data-tour={index === 0 && item.type === 'career' ? 'recommended' : undefined}
            >
              <FeedCard item={item} />
            </div>
          ))}
          {!more && filter === 'all' && (
            <div className="rise">
              <UpToDate />
            </div>
          )}
        </div>
      )}
      {more && <div key={visible.length} ref={sentinel} aria-hidden="true" className="h-px" />}
    </section>
  )
}
