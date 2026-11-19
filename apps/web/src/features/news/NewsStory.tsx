import { useTranslation } from 'react-i18next'
import { Icon } from '../../components/icons'
import { PhotoImg } from '../../components/PhotoImg'
import type { NewsItem } from '../../data/types'
import { EventLine } from './EventFacts'
import { isPoster, newsHref } from './links'
import { NewsHead } from './NewsCard'

type NewsStoryProps = {
  item: NewsItem
  date: string
  forYou: boolean
}

/** One piece of news on Novidades: photo and summary; the whole card opens it on its own page. */
export function NewsStory({ item, date, forYou }: NewsStoryProps) {
  const { t } = useTranslation()
  const poster = isPoster(item)

  return (
    <article
      aria-labelledby={`news-${item.id}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl bg-surface shadow-card transition-shadow duration-300 hover:shadow-lift sm:flex-row"
    >
      {item.image && (
        <span className="block aspect-video w-full shrink-0 overflow-hidden bg-ash-100 sm:aspect-auto sm:w-44">
          <PhotoImg
            photo={item.image}
            sizes="(min-width: 640px) 11rem, 100vw"
            className={`size-full transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transition-none ${poster ? 'object-contain' : 'object-cover'}`}
          />
        </span>
      )}
      <div className="min-w-0 grow p-4">
        <NewsHead item={item} date={date} forYou={forYou} href={newsHref(item)} stretched />
        {item.event && <EventLine event={item.event} />}
        <p className="mt-1 line-clamp-2 text-sm font-light text-copy">{item.summary}</p>
        <span
          aria-hidden="true"
          className="mt-2 inline-flex items-center gap-1 text-xs font-normal text-night group-hover:text-blue"
        >
          {t('news.more')}
          <Icon name="arrowRight" className="size-3.5" />
        </span>
      </div>
    </article>
  )
}
