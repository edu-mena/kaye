import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { Icon } from '../../components/icons'
import { Loading, RowsSkeleton } from '../../components/PageStates'
import { QueryState } from '../../components/QueryState'
import { Button } from '../../components/ui/Button'
import { PageHeader } from '../../components/ui/PageHeader'
import { Panel } from '../../components/ui/Panel'
import { Segmented } from '../../components/ui/Segmented'
import { useNews } from '../../data/queries'
import { NEWS_KINDS, type NewsItem, type NewsKind } from '../../data/types'
import { byInterest } from '../../domain/interests'
import { stagger } from '../../lib/ui'
import { useInterestAreas } from '../../lib/useInterestAreas'
import { useNewsForMe } from '../../lib/useNewsForMe'
import { useUrlFilters } from '../../lib/useUrlFilters'
import { Figures } from './Figures'
import { NewsStory } from './NewsStory'
import { SubscribeDialog } from './SubscribeDialog'

type Filter = 'tudo' | 'para-ti' | NewsKind

const today = () => new Date().toISOString().slice(0, 10)
const lastDay = (item: NewsItem) => item.event?.ends ?? item.event?.starts ?? ''
function byEventDate(a: NewsItem, b: NewsItem): number {
  const now = today()
  const pastA = lastDay(a) < now
  const pastB = lastDay(b) < now
  if (pastA !== pastB) return pastA ? 1 : -1
  return (a.event?.starts ?? '').localeCompare(b.event?.starts ?? '')
}

/**
 * Novidades: what changed in Kayé, and what institutions and companies did; by type (?tipo=). "Para ti"
 * (the default once the person follows something) puts the subscribed topics and their careers first.
 */
export default function NewsPage() {
  const { t } = useTranslation()
  const query = useNews()

  return (
    <>
      <PageHeader compact title={t('nav.news')} subtitle={t('news.subtitle')} />
      <QueryState
        query={query}
        loading={
          <Loading>
            <RowsSkeleton count={5} />
          </Loading>
        }
      >
        {(news) => <Feed news={news} />}
      </QueryState>
    </>
  )
}

function Feed({ news }: { news: NewsItem[] }) {
  const { t, i18n } = useTranslation()
  const [params, setParam] = useUrlFilters()
  const { mine, subscriptions, areasOf, forMe } = useNewsForMe()
  const interests = useInterestAreas()
  const [subscribing, setSubscribing] = useState(false)

  const following =
    subscriptions !== null && (subscriptions.areas.length > 0 || subscriptions.kinds.length > 0)
  const forYou = news.filter(forMe)
  const hasForYou = following || mine.size > 0
  // "Para ti": the subscribed topics and the person's careers first, then the rest by their areas.
  const ordered = [
    ...forYou,
    ...byInterest(
      news.filter((item) => !forMe(item)),
      areasOf,
      interests,
    ),
  ]

  const matches = (filter: Filter) => (item: NewsItem) =>
    filter === 'tudo' || filter === 'para-ti' || item.kind === filter
  const filters: Filter[] = [...(hasForYou ? (['para-ti'] as const) : []), 'tudo', ...NEWS_KINDS]
  const fallback: Filter = hasForYou ? 'para-ti' : 'tudo'
  const filter = filters.find((value) => value === params.get('tipo')) ?? fallback
  const shown = (filter === 'para-ti' ? ordered : news).filter(matches(filter))
  // Events in the order they happen, the ones still to come first.
  if (filter === 'eventos') shown.sort(byEventDate)
  const count = (value: Filter) => (value === 'para-ti' ? forYou.length : news.filter(matches(value)).length)
  const labels: Record<Filter, string> = {
    tudo: t('news.all'),
    'para-ti': t('news.forYou'),
    kaye: t('news.kind_kaye'),
    cursos: t('news.kind_cursos'),
    empresas: t('news.kind_empresas'),
    analise: t('news.kind_analise'),
    eventos: t('news.kind_eventos'),
  }
  const date = new Intl.DateTimeFormat(i18n.language, { day: 'numeric', month: 'short', year: 'numeric' })

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-start">
      <div className="min-w-0 space-y-3">
        <Figures />
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Segmented<Filter>
            label={t('news.typeLabel')}
            value={filter}
            onChange={(value) => setParam('tipo', value === fallback ? null : value)}
            options={filters.map((value) => ({ value, label: `${labels[value]} · ${count(value)}` }))}
          />
          <Button
            variant={following ? 'secondary' : 'primary'}
            size="sm"
            data-tour="subscribe"
            aria-haspopup="dialog"
            onClick={() => setSubscribing(true)}
          >
            <Icon name={following ? 'check' : 'bell'} className="size-4" />
            {following ? t('news.following') : t('news.subscribe')}
          </Button>
        </div>
        {subscribing && (
          <SubscribeDialog open onClose={() => setSubscribing(false)} current={subscriptions} />
        )}
        <ul className="space-y-3">
          {shown.map((item, index) => (
            <li key={item.id} className="rise" style={stagger(Math.min(index, 6))}>
              <NewsStory
                item={item}
                forYou={forMe(item)}
                date={date.format(new Date(`${item.date}T12:00:00`))}
              />
            </li>
          ))}
        </ul>
      </div>

      <aside aria-label={t('news.asideLabel')} className="space-y-4 lg:sticky lg:top-6">
        <Panel id="news-for-you" icon="bookmark" title={t('news.forYou')}>
          <p className="text-xs font-light text-copy">
            {hasForYou ? t('news.forYouSome', { count: forYou.length }) : t('news.forYouEmpty')}
          </p>
          {!hasForYou && (
            <Link
              to="/carreiras"
              className="mt-2 inline-flex items-center gap-1 text-xs font-normal text-night hover:text-blue"
            >
              {t('news.careersLink')}
              <Icon name="chevronRight" className="size-3.5" />
            </Link>
          )}
        </Panel>
        <Panel id="news-notify" icon="bell" title={t('nav.notifications')}>
          <p className="text-xs font-light text-copy">{t('news.notifyBody')}</p>
          <Link
            to="/notificacoes"
            className="mt-2 inline-flex items-center gap-1 text-xs font-normal text-night hover:text-blue"
          >
            {t('news.notifyLink')}
            <Icon name="chevronRight" className="size-3.5" />
          </Link>
        </Panel>
        <Panel id="news-market" icon="chart" title={t('nav.market')}>
          <p className="text-xs font-light text-copy">{t('news.marketBody')}</p>
          <Link
            to="/mercado"
            className="mt-2 inline-flex items-center gap-1 text-xs font-normal text-night hover:text-blue"
          >
            {t('news.marketLink')}
            <Icon name="chevronRight" className="size-3.5" />
          </Link>
        </Panel>
      </aside>
    </div>
  )
}
