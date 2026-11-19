import { useTranslation } from 'react-i18next'
import { ExternalLink } from '../../components/DetailParts'
import type { Curriculum } from '../../data/types'

/** A plan of studies: each year or semester with its subjects, in order, and the decree that approved it. */
export function CurriculumView({ curriculum, wide = false }: { curriculum: Curriculum; wide?: boolean }) {
  const { t } = useTranslation()
  return (
    <div>
      <ol className={`grid gap-3 ${wide ? 'sm:grid-cols-2' : ''}`}>
        {curriculum.periods.map((period) => (
          <li key={period.label} className="rounded-2xl bg-ash-100 p-4">
            <h4 className="text-sm font-bold text-night">{period.label}</h4>
            <ul className="mt-2 space-y-1 text-sm font-light text-copy">
              {period.subjects.map((subject) => (
                <li key={subject}>{subject}</li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
      <p className="mt-4 text-xs font-light text-muted">
        {t('course.approvedBy')}:{' '}
        <ExternalLink href={curriculum.source.url}>{curriculum.source.label}</ExternalLink>
      </p>
    </div>
  )
}
