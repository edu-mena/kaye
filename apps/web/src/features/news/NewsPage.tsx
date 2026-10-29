import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { Icon } from '../../components/icons'
import { Loading, RowsSkeleton } from '../../components/PageStates'
import { QueryState } from '../../components/QueryState'
import { PageHeader } from '../../components/ui/PageHeader'
import { Panel } from '../../components/ui/Panel'
import { Segmented } from '../../components/ui/Segmented'
import { useNews } from '../../data/queries'
import type { NewsItem, NewsKind } from '../../data/types'
import { isAboutMe, myCareers } from '../../domain/path'
import { stagger } from '../../lib/ui'
import { useUrlFilters } from '../../lib/useUrlFilters'
import { useUser } from '../../state/userStore'
import { NewsCard } from './NewsCard'

const KINDS: NewsKind[] = ['kaye', 'cursos', 'empresas']

type Filter = 'tudo' | 'para-ti' | NewsKind

/** Novidades: what changed in Kayé, and what institutions and companies did; by type (?tipo=). */
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
  const { savedCareers, targetCareer } = useUser()

  const mine = myCareers({ savedCareers, targetCareer })
  const isForYou = (item: NewsItem) => isAboutMe(item, mine)
  const forYou = news.filter(isForYou)

  const matches = (filter: Filter) => (item: NewsItem) =>
    filter === 'tudo' || (filter === 'para-ti' ? isForYou(item) : item.kind === filter)
  const filters: Filter[] = ['tudo', ...(forYou.length > 0 ? (['para-ti'] as const) : []), ...KINDS]
  const filter = filters.find((value) => value === params.get('tipo')) ?? 'tudo'
  const shown = news.filter(matches(filter))
  const labels: Record<Filter, string> = {
    tudo: t('news.all'),
    'para-ti': t('news.forYou'),
    kaye: t('news.kind_kaye'),
    cursos: t('news.kind_cursos'),
    empresas: t('news.kind_empresas'),
  }
  const date = new Intl.DateTimeFormat(i18n.language, { day: 'numeric', month: 'short', year: 'numeric' })

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-start">
      <div className="space-y-3">
        <Segmented<Filter>
          label={t('news.typeLabel')}
          value={filter}
          onChange={(value) => setParam('tipo', value === 'tudo' ? null : value)}
          options={filters.map((value) => ({
            value,
            label: `${labels[value]} · ${news.filter(matches(value)).length}`,
          }))}
        />
        <ul className="space-y-3">
          {shown.map((item, index) => (
            <li key={item.id} className="rise" style={stagger(Math.min(index, 6))}>
              <NewsCard
                item={item}
                forYou={isForYou(item)}
                date={date.format(new Date(`${item.date}T12:00:00`))}
              />
            </li>
          ))}
        </ul>
      </div>

      <aside aria-label={t('news.asideLabel')} className="space-y-4 lg:sticky lg:top-6">
        <Panel id="news-for-you" icon="bookmark" title={t('news.forYou')}>
          <p className="text-xs font-light text-copy">
            {mine.size === 0 ? t('news.forYouEmpty') : t('news.forYouSome', { count: forYou.length })}
          </p>
          {mine.size === 0 && (
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
