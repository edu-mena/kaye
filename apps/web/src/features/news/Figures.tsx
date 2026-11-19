import { useTranslation } from 'react-i18next'
import { ExternalLink } from '../../components/DetailParts'
import { InstitutionLogo } from '../../components/InstitutionLogo'
import { useFigures } from '../../data/queries'
import type { Figure } from '../../data/types'

/** Figuras da semana: a row to swipe on the phone, a grid on the desktop. Hidden while there is nobody. */
export function Figures() {
  const { t } = useTranslation()
  const { data: figures = [] } = useFigures()
  if (figures.length === 0) return null

  return (
    <section aria-labelledby="news-figures" className="space-y-2">
      <h2 id="news-figures" className="text-sm font-semibold text-night">
        {t('news.figuresTitle')}
      </h2>
      <ul className="flex snap-x gap-3 overflow-x-auto pb-1 lg:grid lg:grid-cols-2 lg:overflow-visible lg:pb-0">
        {figures.map((figure) => (
          <li key={figure.id} className="w-64 shrink-0 snap-start lg:w-auto">
            <FigureCard figure={figure} />
          </li>
        ))}
      </ul>
    </section>
  )
}

function FigureCard({ figure }: { figure: Figure }) {
  const { t } = useTranslation()
  return (
    <article className="flex h-full flex-col rounded-2xl bg-surface p-4 shadow-card">
      <div className="flex items-center gap-3">
        <InstitutionLogo institution={{ name: figure.name, logo: figure.photo }} />
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-night">{figure.name}</h3>
          <p className="text-xs font-light text-muted">{figure.role}</p>
        </div>
      </div>
      <p className="mt-2 grow text-sm font-light text-copy">{figure.why}</p>
      <p className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs font-light text-muted">
        <ExternalLink href={figure.follow.url}>
          {t('news.follow')} · {figure.follow.label}
          <span className="sr-only"> {figure.name}</span>
        </ExternalLink>
        <ExternalLink href={figure.source.url}>
          {t('common.source', { label: figure.source.label })}
        </ExternalLink>
      </p>
    </article>
  )
}
