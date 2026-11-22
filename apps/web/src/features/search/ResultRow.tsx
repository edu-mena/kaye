import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { LIST_ROW } from '../../components/CareerRow'
import { GROUP_ICONS } from '../../components/groupIcons'
import { Icon } from '../../components/icons'
import { InstitutionLogo } from '../../components/InstitutionLogo'
import { matchRanges } from '../../domain/search'
import type { Result } from './results'

/** The text with the searched words marked. */
function Highlight({ text, words }: { text: string; words: string[] }) {
  const parts: ReactNode[] = []
  let at = 0
  for (const [start, end] of matchRanges(text, words)) {
    if (start > at) parts.push(text.slice(at, start))
    parts.push(
      <mark key={start} className="rounded-sm bg-gold-soft text-inherit">
        {text.slice(start, end)}
      </mark>,
    )
    at = end
  }
  if (at < text.length) parts.push(text.slice(at))
  return <>{parts}</>
}

/** A result in one line: picture, name (with the words marked) and what it is. */
export function ResultRow({
  result,
  words,
  onOpen,
}: {
  result: Result
  words: string[]
  onOpen: () => void
}) {
  const { t } = useTranslation()
  return (
    <Link to={result.to} onClick={onOpen} className={LIST_ROW}>
      {'group' in result.picture ? (
        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-coal text-gold">
          <Icon name={GROUP_ICONS[result.picture.group]} className="size-4" />
        </span>
      ) : 'icon' in result.picture ? (
        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-coal text-gold">
          <Icon name={result.picture.icon} className="size-4" />
        </span>
      ) : (
        <InstitutionLogo institution={result.picture.logo} size="sm" />
      )}
      <span className="min-w-0 flex-1">
        <span className="block text-sm leading-snug font-semibold text-night">
          <Highlight text={result.title} words={words} />
        </span>
        <span className="mt-0.5 block truncate text-xs font-light text-muted">{result.meta}</span>
      </span>
      {result.outside && (
        <span className="shrink-0 rounded-full bg-ash-100 px-2 py-0.5 text-[0.6875rem] font-normal text-copy">
          {t('interest.outside')}
        </span>
      )}
      <Icon name="chevronRight" className="size-4 shrink-0 text-muted" />
    </Link>
  )
}
