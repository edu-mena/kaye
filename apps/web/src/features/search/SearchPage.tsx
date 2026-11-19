import { useDeferredValue, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { LIST_ROW } from '../../components/CareerRow'
import { Icon } from '../../components/icons'
import { HERO_CONTROL, HeroField } from '../../components/ListHero'
import { ErrorState, Loading, RowsSkeleton } from '../../components/PageStates'
import { Pagination } from '../../components/ui/Pagination'
import { Segmented } from '../../components/ui/Segmented'
import { useCatalog } from '../../data/queries'
import { searchWords } from '../../domain/search'
import { paginate } from '../../lib/pagination'
import { stagger } from '../../lib/ui'
import { useUrlFilters, useUrlText } from '../../lib/useUrlFilters'
import { userActions, useUser } from '../../state/userStore'
import { useInterestAreas } from '../../lib/useInterestAreas'
import { EXPLORE_TYPES, findResults, RESULT_TYPES, SECTIONS, type Result, type ResultType } from './results'
import { ResultRow } from './ResultRow'

/** Results of each type shown under "Tudo"; the rest are one tap away. */
const PREVIEW = 4
const PAGE_SIZE = 12

const SECTION_TITLE = 'flex items-center gap-2 text-base font-bold text-night'

/**
 * Pesquisa: one field over careers (trades too), courses, academies, scholarships, companies and their people,
 * and the app's own pages (?q=), narrowed to one
 * type (?tipo=). Before typing: the recent searches and the four sections.
 */
export default function SearchPage() {
  const { t } = useTranslation()
  const [text, setText] = useUrlText('q')
  const field = useRef<HTMLInputElement>(null)
  // The results follow a moment behind the typing, so a slow phone never makes the field lag.
  const deferred = useDeferredValue(text)
  const words = searchWords(deferred)

  // Coming here means typing: the field is ready. Not when a search is already in the
  // address (a shared link, the back button), so the results are what the person sees.
  const [focusOnArrival] = useState(text === '')
  useEffect(() => {
    if (focusOnArrival) field.current?.focus()
  }, [focusOnArrival])

  const search = (value: string, clear = ['pagina', 'tipo']) => setText(value, clear)

  return (
    <div className="space-y-4">
      <header className="rise">
        <h1 className="text-2xl leading-tight font-extrabold text-night">{t('nav.search')}</h1>
        <form
          className="mt-3 max-w-2xl"
          onSubmit={(event) => {
            event.preventDefault()
            userActions.addSearch(text)
            field.current?.blur()
          }}
        >
          <HeroField icon="search">
            <input
              ref={field}
              type="search"
              enterKeyHint="search"
              aria-label={t('search.label')}
              value={text}
              placeholder={t('nav.searchPlaceholder')}
              onChange={(event) => search(event.target.value, ['pagina'])}
              className={`${HERO_CONTROL} [&::-webkit-search-cancel-button]:hidden`}
            />
            {text && (
              <button
                type="button"
                onClick={() => {
                  search('')
                  field.current?.focus()
                }}
                className="absolute top-1/2 right-2 grid size-10 -translate-y-1/2 place-items-center rounded-full text-muted hover:bg-ash-100 hover:text-night"
              >
                <Icon name="close" className="size-5" />
                <span className="sr-only">{t('search.clear')}</span>
              </button>
            )}
          </HeroField>
          {/* Only before typing: once there are results, they need the room. */}
          {words.length === 0 && (
            <p className="mt-2 px-2 text-xs font-light text-muted">{t('search.hint')}</p>
          )}
        </form>
      </header>

      {words.length === 0 ? (
        <Start onPick={(value) => search(value)} />
      ) : (
        <Results query={deferred} words={words} />
      )}
    </div>
  )
}

/** Before typing: the recent searches, and the four sections to explore. */
function Start({ onPick }: { onPick: (query: string) => void }) {
  const { t } = useTranslation()
  const { searches } = useUser()

  return (
    <>
      {searches.length > 0 && (
        <section aria-labelledby="recent" className="rise" style={stagger(1)}>
          <div className="mb-2 flex items-center justify-between gap-4">
            <h2 id="recent" className={SECTION_TITLE}>
              {t('search.recentTitle')}
            </h2>
            <button
              type="button"
              onClick={userActions.clearSearches}
              className="text-sm font-light text-muted underline underline-offset-2 hover:text-night"
            >
              {t('search.recentClear')}
            </button>
          </div>
          <ul className="flex flex-wrap gap-2">
            {searches.map((entry) => (
              <li key={entry}>
                <button
                  type="button"
                  onClick={() => onPick(entry)}
                  className="flex items-center gap-2 rounded-full bg-surface px-4 py-2.5 text-sm font-light text-night shadow-card hover:bg-ash-100"
                >
                  <Icon name="clock" className="size-4 text-muted" />
                  {entry}
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
      <Explore index={2} />
    </>
  )
}

/** The four sections, as tiles: where to go when there is nothing to search yet. */
function Explore({ index }: { index: number }) {
  const { t } = useTranslation()
  return (
    <section aria-labelledby="explore" className="rise" style={stagger(index)}>
      <h2 id="explore" className={`${SECTION_TITLE} mb-2`}>
        {t('search.exploreTitle')}
      </h2>
      <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-5">
        {EXPLORE_TYPES.map((type) => (
          <li key={type}>
            <Link to={SECTIONS[type].to} className={`${LIST_ROW} h-full`}>
              <span className="grid size-8 shrink-0 place-items-center rounded-full bg-coal text-gold">
                <Icon name={SECTIONS[type].icon} className="size-4" />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-night">
                  {t(`nav.${SECTIONS[type].nav}`)}
                </span>
                <span className="mt-0.5 block text-xs font-light text-muted">
                  {t(`search.explore_${type}`)}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}

/** What matches, by type: a few of each under "Tudo", or all of one type, a page at a time. */
function Results({ query, words }: { query: string; words: string[] }) {
  const { t } = useTranslation()
  const [params, setParam] = useUrlFilters()
  const list = useRef<HTMLDivElement>(null)
  const catalog = useCatalog()
  const interests = useInterestAreas()

  if (catalog.isError) return <ErrorState onRetry={catalog.retry} />
  if (!catalog.data) {
    return (
      <Loading>
        <RowsSkeleton count={4} />
      </Loading>
    )
  }

  const results = findResults(catalog.data, words, t, interests)
  const total = RESULT_TYPES.reduce((sum, type) => sum + results[type].length, 0)
  const tipo = params.get('tipo')
  const type = RESULT_TYPES.find((value) => value === tipo) ?? null
  const count = type ? results[type].length : total
  const open = () => userActions.addSearch(query)

  return (
    <div ref={list} className="scroll-mt-24 space-y-5">
      <div className="space-y-1.5">
        <Segmented<'tudo' | ResultType>
          label={t('search.typeLabel')}
          value={type ?? 'tudo'}
          onChange={(value) => setParam('tipo', value === 'tudo' ? null : value, ['pagina'])}
          options={[
            { value: 'tudo', label: `${t('search.all')} · ${total}` },
            // A type with nothing to show is not offered (unless the address asks for it).
            ...RESULT_TYPES.filter((value) => results[value].length > 0 || value === type).map((value) => ({
              value,
              label: `${t(`nav.${SECTIONS[value].nav}`)} · ${results[value].length}`,
            })),
          ]}
        />
        <output className="block px-1 text-xs font-light text-muted">
          {t('search.count', { count, query: query.trim() })}
        </output>
      </div>

      {count === 0 ? (
        <>
          <div className="rounded-2xl bg-surface p-6 shadow-card">
            <p className="text-base font-bold text-night">{t('search.noneTitle', { query: query.trim() })}</p>
            <p className="mt-1 text-sm font-light text-copy">{t('search.noneBody')}</p>
          </div>
          <Explore index={0} />
        </>
      ) : type ? (
        <TypePage
          results={results[type]}
          words={words}
          onOpen={open}
          page={Number(params.get('pagina'))}
          onPage={(next) => {
            setParam('pagina', next > 1 ? String(next) : null)
            list.current?.scrollIntoView?.({ behavior: 'smooth', block: 'start' })
          }}
        />
      ) : (
        RESULT_TYPES.filter((value) => results[value].length > 0).map((value) => (
          <section key={value} aria-labelledby={`results-${value}`}>
            <div className="mb-2 flex items-center justify-between gap-4">
              <h2 id={`results-${value}`} className={SECTION_TITLE}>
                {t(`nav.${SECTIONS[value].nav}`)}
                <span className="text-sm font-light text-muted">{results[value].length}</span>
              </h2>
              {results[value].length > PREVIEW && (
                <button
                  type="button"
                  onClick={() => setParam('tipo', value, ['pagina'])}
                  className="flex items-center gap-1 text-sm font-normal text-night hover:text-blue"
                >
                  {t('search.seeAll', { count: results[value].length })}
                  <Icon name="chevronRight" className="size-4" />
                </button>
              )}
            </div>
            <ResultList results={results[value].slice(0, PREVIEW)} words={words} onOpen={open} />
          </section>
        ))
      )}
    </div>
  )
}

function ResultList({ results, words, onOpen }: { results: Result[]; words: string[]; onOpen: () => void }) {
  return (
    <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      {results.map((result) => (
        <li key={result.key}>
          <ResultRow result={result} words={words} onOpen={onOpen} />
        </li>
      ))}
    </ul>
  )
}

type TypePageProps = {
  results: Result[]
  words: string[]
  onOpen: () => void
  page: number
  onPage: (page: number) => void
}

function TypePage({ results, words, onOpen, page: requested, onPage }: TypePageProps) {
  const { t } = useTranslation()
  const { page, pages, shown } = paginate(results, requested, PAGE_SIZE)
  return (
    <div className="space-y-4">
      <ResultList results={shown} words={words} onOpen={onOpen} />
      <Pagination page={page} pages={pages} onChange={onPage} label={t('search.pages')} />
    </div>
  )
}
