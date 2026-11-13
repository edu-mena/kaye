import { useTranslation } from 'react-i18next'
import { Subheading } from '../../components/DetailLayout'
import { Icon } from '../../components/icons'
import { BarList } from '../../components/ui/BarList'
import { Chip } from '../../components/ui/Chip'
import type { Career } from '../../data/types'
import { formatKz } from '../../domain/format'
import { PostingsChart } from './PostingsChart'
import { SalaryRange } from './SalaryRange'

/** A career's pay, demand and hiring sectors: the career page's Mercado tab, and the course page's. */
export function CareerMarket({ career }: { career: Career }) {
  const { t } = useTranslation()
  const { market } = career
  const topStage = Math.max(...market.salaryByStage.map((item) => item.median), 1)
  const stageTitle = (level: string) => career.stages.find((stage) => stage.level === level)?.title ?? level

  return (
    <>
      {market.salary && (
        <>
          <Subheading>{t('career.salaryTitle')}</Subheading>
          <SalaryRange salary={market.salary} />
        </>
      )}

      <div className="mt-10 grid gap-10 lg:grid-cols-2">
        {market.salaryByStage.length > 0 && (
          <div>
            <Subheading>{t('career.stageSalaryTitle')}</Subheading>
            <BarList
              label={t('career.stageSalaryList')}
              items={market.salaryByStage.map((item) => ({
                label: stageTitle(item.level),
                value: item.median / topStage,
                valueLabel: formatKz(item.median),
                emphasized: true,
              }))}
            />
          </div>
        )}
        <div>
          <Subheading>{t('career.demandTitle')}</Subheading>
          {market.trendPct === null ? (
            // A career the job sites do not show (the State hires by public competition): what is known instead.
            market.demandNote && (
              <div className="space-y-3">
                {[market.demandNote, market.demandNote.salary].map(
                  (note) =>
                    note && (
                      <p key={note.source.url} className="text-sm font-light text-copy">
                        {note.text}{' '}
                        <a
                          href={note.source.url}
                          target="_blank"
                          rel="noreferrer"
                          className="font-normal text-night underline underline-offset-2"
                        >
                          {note.source.label}
                        </a>
                      </p>
                    ),
                )}
              </div>
            )
          ) : (
            <>
              <p className="mb-5 flex items-center gap-1.5 text-sm font-normal text-success">
                <Icon name="signal" className="size-4" />
                {t('career.trend', {
                  value: `${market.trendPct > 0 ? '+' : ''}${market.trendPct}%`,
                })}
              </p>
              <PostingsChart months={market.postingsByMonth} />
            </>
          )}
        </div>
      </div>

      <Subheading className="mt-10">{t('career.sectors')}</Subheading>
      <ul className="flex flex-wrap gap-2">
        {market.hiringSectors.map((sector) => (
          <li key={sector}>
            <Chip tone="night">{sector}</Chip>
          </li>
        ))}
      </ul>
    </>
  )
}
